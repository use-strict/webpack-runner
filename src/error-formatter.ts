interface WebpackErrorObject {
    name: string;
    message: string;
    rawMessage: string;
    file: string;
    module: {
        resource: string;
    }
    error: {
        lineNumber: number;
        column: number;
        description: string;
        loc: {
            line: number;
            column: number;
        }
    }
    dependencies: {
        loc: {
            start: {
                line: number;
                column: number;
            }
        }
    }[];
    location: {
        line: number;
        character: number;
    }
}

/**
 * Formats an error in a way that is recognizable by an IDE
 *
 * $FILE($LINE,$COL): $MSG
 *
 * e.g.
 * /some/full/path/to/file.js (1,3): Some error happened
 */
export function formatGeneralError(filePath: string, line: number, column: number, message: string) {
    return filePath + ' (' + line + ',' + column + '): error WEBPACK: ' + message;
}

/**
 * Interprets errors generated by webpack and formats them
 */
function formatBuildError(error: WebpackErrorObject) {
    let filePath: string;
    let line: number;
    let column: number;
    let message: string;
    switch (error.name) {
        case 'ModuleParseError':
            filePath = error.module.resource;
            line = error.error.loc.line;
            column = error.error.loc.column;
            message = error.error.toString();
            break;

        case 'ModuleNotFoundError':
            filePath = error.module.resource;
            line = error.dependencies[0].loc.start.line;
            column = error.dependencies[0].loc.start.column;
            message = error.error.toString();
            break;

        case 'ModuleBuildError':
            filePath = error.module.resource;
            line = 1;
            column = 1;
            message = error.message;
            break;

        case 'ModuleError':
            // TODO: is this really needed anymore? ts-loader errors
            // should fall under default now
            if (error.module.resource.match(/\.ts$/)) {
                return error.message.trim();
            }
            //nobreak

        default:
            if (error.message.match(/(error|warning|info) TS\d+:/)) {
                // TypeScript error (ts-loader)
                let file: string;
                if (error.file) {
                    file = error.file;
                } else if (error.module && error.module.resource) {
                    file = error.module.resource;
                }
                
                filePath = file;
                line = error.location ? error.location.line : 1;
                column = error.location ? error.location.character : 1;
                message = error.rawMessage;
                
                return filePath + ' (' + line + ',' + column + '): ' + message;
            }
            
            return 'Unhandled error type `' + error.name + '`: ' + error.message;
    }

    return formatGeneralError(filePath, line, column, message);
}

/**
 * Formats an array of webpack errors
 */
export function formatErrors(errors: WebpackErrorObject[]) {
    var ret: string[] = [];

    if (errors && errors.length) {
        for (var i = 0; i < errors.length; ++i) {
            if (errors[i].name === 'ModuleParseError' && errors[i].message.match(/ts-loader/)) {
                // Let typescript loader report parse errors
                continue;
            }

            ret.push(formatBuildError(errors[i]));
        }
    }

    return ret;
}
