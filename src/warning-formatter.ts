import stripAnsi = require("strip-ansi");

interface WebpackWarningObject {
    message: string;
    rawMessage?: string;
    file?: string;
    location?: {
        line: number;
        character: number;
    }
}

/**
 * Interprets warnings generated by webpack and formats them
 */
function formatBuildWarning(warning: WebpackWarningObject) {
    let filePath: string;
    let line: number;
    let column: number;
    let message: string;

    if (warning.rawMessage && warning.file && warning.location) {
        // Looks like a standard webpack object
        filePath = warning.file;
        line = warning.location.line;
        column = warning.location.character;
        // This treats fork-ts-checker warnings nicely
        let match = warning.rawMessage.match(/^warning ([a-z0-9-_]+: [\s\S]*)$/i);
        if (match) {
            message = "warning " + match[1];
        } else {
            message = "warning WEBPACK: " + warning.rawMessage;
        }
        return filePath + ' (' + line + ',' + column + '): ' + message;
    }

    return warning.message.trim();
}

/**
 * Formats an array of webpack warnings
 */
export function formatWarnings(warnings: WebpackWarningObject[]) {
    var ret: string[] = [];

    if (warnings && warnings.length) {
        for (var i = 0; i < warnings.length; ++i) {
            ret.push(formatBuildWarning(warnings[i]));
        }
    }

    return ret;
}
