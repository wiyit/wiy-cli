const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        app: './src/app.js',
    },
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[contenthash].js',
        assetModuleFilename: '[contenthash][ext][query]',
        clean: true,
    },
    optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public',
                    noErrorOnMissing: true,
                },
            ],
        }),
    ],
    resolveLoader: {
        modules: [
            path.resolve(__dirname, '../node_modules'),//for local link
            path.resolve(__dirname, '../../..'),//for pnpm
            'node_modules',
        ],
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                issuer: /\.js$/i,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            sources: {
                                list: [
                                    '...',
                                    {
                                        tag: 'wiy-image',
                                        attribute: 'src',
                                        type: 'src',
                                    },
                                    {
                                        tag: 'wiy-image',
                                        attribute: 'default',
                                        type: 'src',
                                    },
                                    {
                                        tag: 'wiy-video',
                                        attribute: 'src',
                                        type: 'src',
                                    },
                                    {
                                        tag: 'wiy-video',
                                        attribute: 'default',
                                        type: 'src',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        loader: 'posthtml-loader',
                        options: {
                            plugins: [
                                require('posthtml-postcss')([
                                    require("postcss-import"),
                                    require("postcss-url")({
                                        url: 'inline',
                                    }),
                                    require('postcss-preset-env'),
                                ]),
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.((c|sa|sc)ss)$/i,
                issuer: /\.js$/i,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            exportType: 'string',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require("postcss-import"),
                                    require('postcss-preset-env'),
                                ],
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                type: 'asset',
            },
        ],
    },
    devServer: {
        open: true,
    },
};