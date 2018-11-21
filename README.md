[![Build Status](https://travis-ci.org/use-strict/webpack-runner.svg?branch=master)](https://travis-ci.org/use-strict/webpack-runner)
[![npm version](https://badge.fury.io/js/webpack-runner.svg)](https://badge.fury.io/js/webpack-runner)

# Introduction

Webpack runner is a simple CLI tool that acts as a webpack build wrapper.
It produces machine-readable output, that can easily be parsed and interpreted by an IDE, such as VSCode.
The goal is to have all webpack errors or warnings integrated with the IDE, without having to switch
back and forth between the IDE and the terminal.

# Installation

```
npm install -g webpack-runner
```

# Usage

For full documentation, run the following command from CLI:
```
webpack-runner -h
```

# Example Usage

```
webpack-runner --config=/path/to/webpack.config.js --watch
```

# Configuring VSCode to parse webpack-runner output

Example tasks.json:
```json
// A task runner that calls webpack runner in continuous watch mode
{
    "version": "0.1.0",

    "command": "./node_modules/.bin/webpack-runner",

    // The command is a shell script
    "isShellCommand": true,

    "tasks": [
        {
            "taskName": "build",
            "suppressTaskName": true,
            "showOutput": "silent",
            "isBuildCommand": true,
            "isWatching": true,
            "args": [
                "--watch",
                "--config=${workspaceRoot}/webpack.config.js"
            ],
            // use the standard tsc problem matcher to find compile problems
            // in the output.
            "problemMatcher": {
                // The problem is owned by the typescript language service. Ensure that the problems
                // are merged with problems produced by Visual Studio's language service.
                "owner": "typescript",
                // The file name for reported problems is relative to the current working directory.
                //"fileLocation": ["relative", "${cwd}"],
                "fileLocation": "absolute",
                // A regular expression signalling that a watched task begins executing (usually triggered through file watching).
                "watchedTaskBeginsRegExp": "^Build started\\.$",
                // A regular expression signalling that a watched tasks ends executing.
                "watchedTaskEndsRegExp": "^Build finished\\. \\(\\d+ms\\)$",
                // The actual pattern to match problems in the output.
                "pattern": {
                    // The regular expression. Matches HelloWorld.ts(2,10): error TS2339: Property 'logg' does not exist on type 'Console'.
                    "regexp": "^([^\\s].*)\\((\\d+|\\d+,\\d+|\\d+,\\d+,\\d+,\\d+)\\):\\s+(error|warning|info)\\s+([A-Za-z0-9-_]+)\\s*:\\s*(.*)$",
                    // The match group that denotes the file containing the problem.
                    "file": 1,
                    // The match group that denotes the problem location.
                    "location": 2,
                    // The match group that denotes the problem's severity. Can be omitted.
                    "severity": 3,
                    // The match group that denotes the problem code. Can be omitted.
                    "code": 4,
                    // The match group that denotes the problem's message.
                    "message": 5
                }
            }
        }
    ]
}
```

# Limitations

Webpack runner currently understands only the standard webpack errors and errors produced by ts-loader.
