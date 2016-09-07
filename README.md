[![Build Status](https://travis-ci.org/use-strict/webpack-runner.svg?branch=master)](https://travis-ci.org/use-strict/webpack-runner)

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

TODO: Provide sample tasks.json

# Limitations

Webpack runner currently understands only the standard webpack errors and errors produced by ts-loader.
