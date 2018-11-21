var path = require('path');
var ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
    mode: "none",
    entry: './index',
    context: path.resolve(__dirname),
    output: {
        path: path.resolve(__dirname, '../../output'),
        filename: 'bundle.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader', options: { transpileOnly: true } }
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            tsconfig: path.resolve(__dirname, "tsconfig.json"),
            tslint: path.resolve(__dirname, "tslint.json"),
            async: false,
            silent: true
        })
    ]
}
