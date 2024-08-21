#!/usr/bin/env node
const pkg = require('../package.json');
const commander = require('commander');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const { merge } = require('webpack-merge');

const program = new commander.Command();

program
    .version(pkg.version)
    .option('--dev', '运行开发服务器')
    .option('-c, --config <file>', '自定义配置文件')
    .parse(process.argv);

const options = program.opts();

const configFile = options.config;

let customConfig;
try {
    customConfig = require(path.resolve(process.cwd(), configFile));
} catch (e) {
    console.error(`无法加载自定义配置文件 ${configFile}: ${e.message}`);
    process.exit(1);
}

const defaultConfig = require('../config/webpack.config.js');
const mergedConfig = merge(defaultConfig, customConfig);

const compiler = webpack(mergedConfig);

if (options.dev) {
    const devServerOptions = { ...mergedConfig.devServer };
    const server = new WebpackDevServer(devServerOptions, compiler);
    server.start();
} else {
    compiler.run((err, stats) => {
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            return;
        }
        console.log(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }));

        if (stats.hasErrors()) {
            console.error('构建失败');
            process.exit(1);
        }
        console.log('构建成功');
    });
}