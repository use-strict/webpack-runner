var path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../../output'),
        filename: 'bundle.js'
    },
    bail: true,
    context: path.resolve(__dirname)
}