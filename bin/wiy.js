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
    .option('-c, --config <file>', '自定义配置文件')
    .parse(process.argv);

const options = program.opts();

const configFile = options.config;

let config;
try {
    config = require(path.resolve(process.cwd(), configFile));
} catch (e) {
    console.error(`无法加载自定义配置文件 ${configFile}: ${e.message}`);
    process.exit(1);
}

const env = config.env ||= {};
const wiyEnv = env.WIY ||= {};
wiyEnv.DEV ||= false;
wiyEnv.PUBLIC_PATH ||= '/';
wiyEnv.BUILD_DIST ||= 'dist'

const flattenObj = (obj, prefix) => {
    return Object.entries(obj).reduce((result, [key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value == 'object') {
            Object.entries(flattenObj(value, newKey)).forEach(([k, v]) => {
                result[k] = v;
            });
        } else {
            result[newKey] = value;
        }
        return result;
    }, {});
};
const flattendEnv = flattenObj(env);

const customConfig = {
    mode: wiyEnv.DEV ? 'development' : 'production',
    output: {
        publicPath: wiyEnv.PUBLIC_PATH,
        path: path.resolve(process.cwd(), wiyEnv.BUILD_DIST),
    },
    plugins: [
        new webpack.EnvironmentPlugin(flattendEnv),
    ],
    devServer: {
        historyApiFallback: {
            index: path.join(wiyEnv.PUBLIC_PATH, 'index.html'),
        },
    },
}
delete config.env;

const defaultConfig = require('../config/webpack.config.js');
const mergedConfig = merge(defaultConfig, customConfig, config);

const compiler = webpack(mergedConfig);

if (wiyEnv.DEV) {
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