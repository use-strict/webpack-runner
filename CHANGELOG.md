# Changelog

## v3.1.0

- Added support for fork-ts-checker-webpack-plugin errors and warnings

## v3.0.3

- Fixed error when building with node < 8.11 by replacing unsupported RegExp 's' flag

## v3.0.2

- Fixed formatting of ts-loader errors containing newlines

## v3.0.1

- Fixed format of ts-loader errors when using a color terminal

## v3.0.0

- Added support for webpack 4+ and ts-loader 4+
- Removed webpack 2.x support
- Increased minimum NodeJS version requirement to 8

## v2.2.0

- Added support for ts-loader 3+

## v2.1.1

- Bugfix: Print the "Build finished" marker after printing the list of errors

## v2.1.0

- Added support for webpack 3+

## v2.0.0

- Added support for webpack multi-target configuration arrays
- Removed webpack 1.x support

## v1.3.0

- Added support for webpack 2.2.0+

## v1.2.0

- Added support for webpack 2 beta

## v1.1.0

- Fixed formatting of ModuleParseError webpack errors
- Print usage to stderr
- Detailed error message when webpack config file cannot be loaded
- Fixed "Build finished" marker not being printed in watch mode on fatal errors
- Fixed error being thrown when no plugins were defined in webpack config
- Print formatted fatal errors to stdout

## v1.0.0

- Initial version
