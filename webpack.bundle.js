'use-strict';

const webpack = require('webpack');

const config = {
    devtool: 'nosources-source-map',
    entry: ['babel-polyfill', './public/source/js/main.js'],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'eslint-loader'
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            query: {
                                presets: ['es2015']
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {warnings: false},
            output: {comments: false},
            sourceMap: false
        })
    ]
};