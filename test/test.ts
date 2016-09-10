import * as assert from 'assert';
import {exec} from 'child_process';
import * as path from 'path';

interface TestOptions {
    webpackConfigPath?: string;
    watch: boolean;
    expected: {
        stdout: RegExp,
        stderr: RegExp,
        code: number
    }
}

let createTest = (options: TestOptions) => (done: MochaDone) => {
    let runnerExec = "cross-env " + path.resolve(__dirname, "../bin/webpack-runner");
    if (options.webpackConfigPath) {
        let realPath = path.resolve(__dirname, options.webpackConfigPath);
        runnerExec += ` --config "${realPath}"`;
    }
    if (options.watch) {
        runnerExec += " --watch";
    }
    let {expected} = options;
    exec(runnerExec, (e, stdout, stderr) => {
        assert.notEqual(null, stderr.match(expected.stderr), `Unexpected stderr: "${stderr}"`);
        assert.notEqual(null, stdout.match(expected.stdout), `Unexpected stdout: "${stdout}"`);
        if (expected.code !== 0) {
            assert.equal((e as any).code, expected.code);
        } else {
            assert.equal(null, e);
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
            stderr: /^Couldn't open webpack config file "([^"]+)".\n$/,
            stdout: /^$/,
            code: 1
        }
    }));

    it('should not output anything in non-watch mode if successful', createTest({
        webpackConfigPath: "./data/success/webpack.config.js",
        watch: false,
        expected: {
            stderr: /^$/,
            stdout: /^$/,
            code: 0
        }
    }));

    it("should output only the start/stop markers in watch mode if successful", createTest({
        webpackConfigPath: "./data/success/webpack.config.js",
        watch: true,
        expected: {
            stderr: /^$/,
            stdout: /^Build started.\nBuild finished. \(\d+ms\)\n$/,
            code: 0
        }
    }));

    it("should output fatal webpack errors", createTest({
        webpackConfigPath: "./data/fatal-webpack-error/webpack.config.js",
        watch: false,
        expected: {
            stderr: /^$/,
            stdout: /^[^(]+\(1,1\): error WEBPACK: ([^\n]+)\n$/,
            code: 1
        }
    }));

    it("should output fatal webpack errors in watch mode", createTest({
        webpackConfigPath: "./data/fatal-webpack-error/webpack.config.js",
        watch: true,
        expected: {
            stderr: /^$/,
            stdout: /^Build started.\nBuild finished. \(\d+ms\)\n[^(]+\(1,1\): error WEBPACK: ([^\n]+)\n$/,
            code: 1
        }
    }));
});
