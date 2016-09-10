import * as assert from 'assert';
import {exec} from 'child_process';
import * as path from 'path';

let runnerExec = "cross-env " + path.resolve(__dirname, "../bin/webpack-runner");

let runnerExecWithConfig = (configPath: string) => {
    configPath = path.resolve(__dirname, configPath);
    return `${runnerExec} --config "${configPath}"`;
};

describe('webpack-runner', () => {
    it('should fail when no config is set', (done) => {
        let expectedStderr = /^Missing required --config option\n\nUsage:/;
        let expectedStdout = "";
        let expectedCode = 1;

        exec(runnerExec, (e, stdout, stderr) => {
            assert.notEqual(null, stderr.match(expectedStderr), "Unexpected output: " + stderr);
            assert.equal(expectedStdout, stdout);
            assert.equal((e as any).code, expectedCode);
            done();
        });
    });

    it("should fail when config is not found", (done) => {
        let expectedStderr = /^Couldn't open webpack config file "([^"]+)".\n$/;
        let expectedStdout = "";
        let expectedCode = 1;
        exec(runnerExecWithConfig("./dummy"), (e, stdout, stderr) => {
            assert.notEqual(null, stderr.match(expectedStderr), "Unexpected output: " + stderr);
            assert.equal(expectedStdout, stdout);
            assert.equal((e as any).code, expectedCode);
            done();
        });
    });

    it("should not output anything in non-watch mode if successful", (done) => {
        let expectedStderr = /^$/;
        let expectedStdout = "";
        //let expectedCode = 0;

        exec(runnerExecWithConfig("./data/success/webpack.config.js"), (e, stdout, stderr) => {
            assert.notEqual(null, stderr.match(expectedStderr), "Unexpected output: " + stderr);
            assert.equal(expectedStdout, stdout);
            assert.equal(null, e);
            done();
        });
    });

    it("should output only the start/stop markers in watch mode if successful", (done) => {
        let expectedStderr = /^$/;
        let expectedStdout = /^Build started.\nBuild finished. \(\d+ms\)\n$/;
        //let expectedCode = 0;

        exec(runnerExecWithConfig("./data/success/webpack.config.js") + " --watch", (e, stdout, stderr) => {
            assert.notEqual(null, stderr.match(expectedStderr), "Unexpected output: " + stderr);
            assert.notEqual(null, stdout.match(expectedStdout), "Unexpected output: " + stdout);
            assert.equal(null, e);
            done();
        });
    });
});
