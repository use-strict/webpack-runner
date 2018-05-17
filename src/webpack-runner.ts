import Getopt = require('node-getopt');
import fs = require('fs');
import path = require('path');
import webpack = require('webpack');
import {formatErrors, formatGeneralError} from './error-formatter';

type WebpackConfig = webpack.Configuration;

let getopt = new Getopt([
    ['C', 'config=ARG', 'Path to webpack config file'],
    ['', 'profile=ARG', 'Outputs webpack analyzer stats'],
    ['w', 'watch', 'Runs in continuous mode, watching for changes'],
    ['h', 'help', 'Displays this help']
]);

let opt = getopt
    .bindHelp()
    .parseSystem();

if (!opt.options['config']) {
    process.stderr.write("Missing required --config option\n\n");
    process.stderr.write(getopt.getHelp());
    process.exit(1);
}

let configPath = path.resolve(opt.options['config']);
let isWatchMode = !!opt.options['watch'];
let isProfile = !!opt.options['profile'];
let profilePath = isProfile ? path.resolve(opt.options['profile']) : void 0;

let config: WebpackConfig | WebpackConfig[];
try {
    config = require(configPath);
} catch (e) {
    process.stderr.write(`Couldn't open webpack config file "${configPath}". ${e.stack}\n`);
    process.exit(1);
}

let runningCount = 0;
let startTime = 0;

function onWatchCompileEnded() {
    if (runningCount) {
        runningCount--;
    }
}

function printBuildFinished() {
    let totalTime = (new Date).getTime() - startTime;
    process.stdout.write("Build finished. (" + totalTime + "ms)\n");
}

let outputPlugin = {
    apply(compiler: webpack.Compiler) {
        let onCompile = function(params: {}) {
            if (!runningCount) {
                startTime = (new Date).getTime();
                process.stdout.write("Build started.\n");
            }
            runningCount++;
        };
        let onDone = function(stats: any) {
            onWatchCompileEnded();
        };
        let onFailed = function(error: any) {
            onWatchCompileEnded();
        };
        if (compiler.hooks) {
            compiler.hooks.compile.tap("webpack-runner", onCompile);
            compiler.hooks.done.tap("webpack-runner", onDone);
            compiler.hooks.failed.tap("webpack-runner", onFailed);
        } else {
            compiler.plugin("compile", onCompile);
            compiler.plugin("done", onDone);
            compiler.plugin("failed", onFailed);
        }
    }
};

if (Array.isArray(config)) {
    config.forEach(c => applyConfigOverrides(c));
} else {
    applyConfigOverrides(config);
}

function applyConfigOverrides(config: WebpackConfig) {
    if (isWatchMode) {
        config.plugins = config.plugins || [];
        config.plugins.push(outputPlugin);
    }

    config.watch = !!isWatchMode;
    config.profile = !!isProfile;

    // ts-loader specific overrides
    config.plugins = config.plugins || [];
    config.plugins.push(new (webpack as any).LoaderOptionsPlugin({
        options: {
            ts: {
                // Prevent unwanted output which would break formatting
                silent: true
            }
        }
    }));
}

interface WebpackStats extends webpack.Stats {
    compilation: {
        warnings: any[];
        errors: any[];
    }
}

interface WebpackMultiStats extends webpack.Stats {
    stats: WebpackStats[];
}

function isMultiStats(stats: WebpackStats | WebpackMultiStats): stats is WebpackMultiStats {
    return !('compilation' in stats);
}

function collectWarnings(stats: WebpackStats | WebpackMultiStats) {
    let warnings: any[] = [];
    if (isMultiStats(stats)) {
        stats.stats.forEach(s => warnings = warnings.concat(s.compilation.warnings));
    } else {
        warnings = stats.compilation.warnings;
    }
    return warnings;
}

function collectErrors(stats: WebpackStats | WebpackMultiStats) {
    let errors: any[] = [];
    if (isMultiStats(stats)) {
        stats.stats.forEach(s => errors = errors.concat(s.compilation.errors));
    } else {
        errors = stats.compilation.errors;
    }
    return errors;
}

webpack(config, (err: Error, stats: WebpackStats | WebpackMultiStats) => {
    if (err) {
        process.stdout.write(formatGeneralError(configPath, 1, 1, err.message) + "\n");
        if (isWatchMode) {
            printBuildFinished();
        }
        process.exit(1);
    }

    // Output warnings before errors to ensure errors come up on top in the editor
    if (stats.hasWarnings()) {
        let warnings: any[] = collectWarnings(stats);
        warnings.forEach(function(warning) {
            process.stdout.write(warning.message.trim() + "\n");
        });

    }

    if (stats.hasErrors()) {
        let errors = formatErrors(collectErrors(stats));
        errors.forEach(function(error) {
            process.stdout.write(error + "\n");
        });

        if (!isWatchMode) {
            process.exit(1);
        }
    }

    if (isWatchMode) {
        printBuildFinished();
    }

    if (isProfile) {
        fs.writeFileSync(profilePath, JSON.stringify(stats.toJson()));
        process.exit(0);
    }

    if (!isWatchMode) {
        process.exit(0);
    }
});
