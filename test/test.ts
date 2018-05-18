import * as assert from 'assert';
import {exec} from 'child_process';
import * as path from 'path';

interface TestOptions {
    webpackConfigPath?: string;
    watch: boolean;
    expected: {
        stdout: RegExp,
        stderr: RegExp,
        /** Expected exit code, or null in watch mode (should only exit by exec timeout) */
        code?: number
    }
}

let createTest = (options: TestOptions) => function(done: MochaDone) {
    let runnerExec = `node "${path.resolve(__dirname, "../bin/webpack-runner")}"`;
    if (options.webpackConfigPath) {
        let realPath = path.resolve(__dirname, options.webpackConfigPath);
        runnerExec += ` --config "${realPath}"`;
    }
    if (options.watch) {
        runnerExec += " --watch";
    }
    let {expected} = options;
    // Smaller timeout in watch mode, because we expect the process will always timeout
    let timeout = options.watch ? 2000 : 10000;
    this.timeout(timeout);
    let runner = exec(runnerExec, {timeout: timeout - 100, killSignal: "SIGTERM"}, (e, stdout, stderr) => {
        // console.log("Output:\n----\n" + stdout + "\n----\n");
        assert.notEqual(null, stderr.match(expected.stderr), `Unexpected stderr: "${stderr}"`);
        assert.notEqual(null, stdout.match(expected.stdout), `Unexpected stdout: "${stdout}"`);
        if (expected.code !== void 0) {
            if (expected.code !== 0) {
                assert.equal((e as any).code, expected.code);
            } else {
                assert.equal(null, e);
            }
        } else {
            assert((options.watch && e !== null && (e as any).signal === 'SIGTERM'),
                "webpack-runner exited before it could be killed by the test runner");
        }
        done();
    });
};

describe('webpack-runner', () => {
    it('should fail when no config is set', createTest({
        webpackConfigPath: void 0,
        watch: false,
        expected: {
            stderr: /^Missing required --config option\n\nUsage:/,
            stdout: /^$/,
            code: 1
        }
    }));

    it('should fail when config is not found', createTest({
        webpackConfigPath: "./dummy",
        watch: false,
        expected: {
            stderr: /^Couldn't open webpack config file "([^"]+)"./,
            stdout: /^$/,
            code: 1
        }
    }));
});

["single-target", "multi-target"].forEach(target => {
    let targetPath = "./data" + (target === "single-target" ? "" : "/" + target);

    describe(`webpack-runner (${target})`, () => {
        it('should not output anything in non-watch mode if successful', createTest({
            webpackConfigPath: `${targetPath}/success/webpack.config.js`,
            watch: false,
            expected: {
                stderr: /^$/,
                stdout: /^$/,
                code: 0
            }
        }));

        it("should output only the start/stop markers in watch mode if successful", createTest({
            webpackConfigPath: `${targetPath}/success/webpack.config.js`,
            watch: true,
            expected: {
                stderr: /^$/,
                stdout: /^Build started.\nBuild finished. \(\d+ms\)\n$/
            }
        }));

        it("should output fatal webpack errors", createTest({
            webpackConfigPath: `${targetPath}/fatal-webpack-error/webpack.config.js`,
            watch: false,
            expected: {
                stderr: /^$/,
                stdout: /^(\/)|([A-Z]:\\)[^(]+\(1,1\): error WEBPACK: ([^\n]+)\n$/,
                code: 1
            }
        }));

        it("should output fatal webpack errors in watch mode", createTest({
            webpackConfigPath: `${targetPath}/fatal-webpack-error/webpack.config.js`,
            watch: true,
            expected: {
                stderr: /^$/,
                stdout: /^Build started.\n[^(]+\(1,1\): error WEBPACK: ([^\n]+)\nBuild finished. \(\d+ms\)\n$/,
                code: 1
            }
        }));

        it("should output webpack not found module errors", createTest({
            webpackConfigPath: `${targetPath}/module-not-found-errors/webpack.config.js`,
            watch: false,
            expected: {
                stderr: /^$/,
                stdout: /^(\/)|([A-Z]:\\)[^(]+\(1,18\): error WEBPACK: Error: Can(no|')t resolve (\'file\' or \'directory\' )?'?\.\/non-existent'? ([^\n]+)\n[^(]+\(2,19\): error WEBPACK: Error: Can(no|')t resolve (\'file\' or \'directory\' )?'?\.\/other-missing'? ([^\n]+)\n$/,
                code: 1
            }
        }));

        it("should output webpack module not found errors in watch mode", createTest({
            webpackConfigPath: `${targetPath}/module-not-found-errors/webpack.config.js`,
            watch: true,
            expected: {
                stderr: /^$/,
                stdout: /^Build started.\n[^(]+\(1,18\): error WEBPACK: Error: Can(no|')t resolve (\'file\' or \'directory\' )?'?\.\/non-existent'? ([^\n]+)\n[^(]+\(2,19\): error WEBPACK: Error: Can(no|')t resolve (\'file\' or \'directory\' )?\'?.\/other-missing'? ([^\n]+)\nBuild finished. \(\d+ms\)\n$/
            }
        }));

        it("should output webpack module parse errors", createTest({
            webpackConfigPath: `${targetPath}/module-parse-errors/webpack.config.js`,
            watch: false,
            expected: {
                stderr: /^$/,
                stdout: /^(\/)|([A-Z]:\\)[^(]+\(2,7\): error WEBPACK: SyntaxError: Unexpected token \(2:7\)\n$/,
                code: 1
            }
        }));

        it("should output webpack module build errors", createTest({
            webpackConfigPath: `${targetPath}/module-build-errors/webpack.config.js`,
            watch: false,
            expected: {
                stderr: /^$/,
                stdout: /^(\/)|([A-Z]:\\)[^(]+\(1,1\): error WEBPACK: Module not found: Error: Can(no|')t resolve (\'file\' or \'directory\' )?'?\.\/non-existent'? ([^\n]+)\n$/,
                code: 1
            }
        }));

        it("should output ts-loader errors", createTest({
            webpackConfigPath: `${targetPath}/ts-loader-errors/webpack.config.js`,
            watch: false,
            expected: {
                stderr: /^$/,
                stdout: /^(\/)|([A-Z]:\\)[^(]+\(2,9\): error TS2322: Type '2' is not assignable to type 'string'.\n$/,
                code: 1
            }
        }));
    });
});
