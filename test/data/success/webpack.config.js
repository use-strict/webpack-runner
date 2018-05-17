var path = require('path');

module.exports = {
    mode: "none",
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../../output'),
        filename: 'bundle.js'
    },
    context: path.resolve(__dirname)
};
