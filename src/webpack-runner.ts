import Getopt = require('node-getopt');
import fs = require('fs');
import path = require('path');
import webpack = require('webpack');
import {formatErrors, formatGeneralError} from './error-formatter';

interface WebpackConfig extends webpack.Configuration {
    ts: {
        silent?: boolean;
    };
}

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

let config: WebpackConfig;
try {
    config = require(configPath);
} catch (e) {
    process.stderr.write(`Couldn't open webpack config file "${configPath}".\n`);
    process.exit(1);
}

if (isWatchMode) {
    let outputPlugin = function() {
        //this = webpack compiler
        this.plugin("compile", function(params: {}) {
            process.stdout.write("Build started.\n");
        });
        this.plugin("done", function(stats: any) {
            process.stdout.write("Build finished. (" + (stats.endTime - stats.startTime) + "ms)\n");
        });
    };
    config.plugins = config.plugins || [];
    config.plugins.push(outputPlugin);
}

config.watch = !!isWatchMode;
config.profile = !!isProfile;

// ts-loader specific overrides
if (!config.ts) {
    config.ts = {};
}
// Prevent unwanted output which would break formatting
config.ts.silent = true;

webpack(config, (err, stats) => {
    if (err) {
        process.stderr.write(formatGeneralError(configPath, 1, 1, err.message) + "\n");
        process.exit(1);
    }

    // Output warnings before errors to ensure errors come up on top in the editor
    if (stats.hasWarnings()) {
        let warnings: any[] = (stats as any).compilation.warnings;
        warnings.forEach(function(warning) {
            process.stdout.write(warning.message.trim() + "\n");
        });

    }

    if (stats.hasErrors()) {
        let errors = formatErrors((stats as any).compilation.errors);
        errors.forEach(function(error) {
            process.stdout.write(error + "\n");
        });

        if (!isWatchMode) {
            process.exit(1);
        }
    }

    if (isProfile) {
        fs.writeFileSync(profilePath, JSON.stringify(stats.toJson()));
        process.exit(0);
    }

    if (!isWatchMode) {
        process.exit(0);
    }
});
