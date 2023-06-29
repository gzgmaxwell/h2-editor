const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const SentryCliPlugin = require('@sentry/webpack-plugin')

module.exports = (options) => {
    const env = require('./env/' + options.config + '.js')
    const plugin = require('./env/pro.js').plugin
    const name = 'h2'
    const port = env.port || 3333
    const buildDir = 'dist'
    const isLocal = options.local
    const editorKeys = ['vue', 'vuex', 'vueRouter', 'axios', 'coreJs']
    const editorLibs = []
    const downloadLibs = []
    const uploaderLibs = [{
        url: plugin.qiniu2,
        isAsync: true
    }]
    const previewLib = [
        {
            url: plugin.jquery,
            isAsync: false
        },
        {
            url: plugin.vue,
            isAsync: false
        },
        {
            url: plugin.axios,
            isAsync: false
        },
        {
            url: plugin.vuex,
            isAsync: false
        }
    ]
    const minify = {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true, // 删除HTML中的注释
        collapseWhitespace: true, // 删除空白符与换行符
        collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, // 删除script上的type
        removeStyleLinkTypeAttributes: true // 删除style上的type
    }

    // 如果是本地开发，使用未压缩的插件
    if (isLocal) {
        for (const key in plugin) {
            plugin[key] = plugin[key].replace('.min', '')
        }
    }

    editorKeys.forEach(item => editorLibs.push({
        url: plugin[item],
        isAsync: false
    }))

    if (['pre', 'pro'].indexOf(options.config) >= 0) {
        const item = {
            url: '//datalog.eqxiu.com/tracker.js',
            isAsync: true
        }
        const tracker = {
            url: '//datalog.eqxiu.com/tracker-view.js',
            isAsync: true
        }
        previewLib.unshift(tracker)
        editorLibs.unshift(item)
        downloadLibs.unshift(item)
        uploaderLibs.unshift(item)
    } else {
        const item = {
            url: '//datalog.yqxiu.cn/tracker.js',
            isAsync: true
        }
        const tracker = {
            url: '//datalog.yqxiu.cn/tracker-view.js',
            isAsync: true
        }
        previewLib.unshift(tracker)
        editorLibs.unshift(item)
        downloadLibs.unshift(item)
        uploaderLibs.unshift(item)
    }
    const rules = [
        {
            test: /\.css$/,
            use: [
                'css-loader'
            ]
        },
        {
            test: /\.vue$/,
            use: 'vue-loader'
        },
        {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: file => (
                /node_modules/.test(file) &&
                !/\.vue\.js/.test(file)
            )
        },
        {
            test: /\.scss$/,
            use: [
                isLocal ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                {
                    loader: 'sass-loader',
                    options: {
                        prependData: `
                            $env: ${process.env.NODE_ENV};
                            @import "./src/scss/variables.scss";
                            `
                    }
                }

            ]
        },
        {
            test: /\.(png|jpg|gif|svg|ico)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    name: 'images/[name].[ext]',
                    limit: 1000
                }
            }]
        }
    ]

    const plugins = [
        new CleanWebpackPlugin({
            verbose: true
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name]-[hash:8].css'
        }),
        new OptimizeCssAssetsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: isLocal ? 'index.html' : 'index_new.html',
            minify,
            libs: editorLibs,
            alwaysWriteToDisk: true,
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            template: './src/upload.html',
            filename: 'upload.html',
            minify,
            host: env.host,
            libs: uploaderLibs,
            inject: false,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackPlugin({
            template: './src/download.html',
            filename: 'download.html',
            minify,
            host: env.host,
            libs: downloadLibs,
            inject: false,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackPlugin({
            template: './src/preview/preview.html',
            filename: 'preview.html',
            minify,
            libs: previewLib,
            host: env.host,
            inject: true,
            alwaysWriteToDisk: true,
            chunks: ['preview']
        }),
        new HtmlWebpackPlugin({
            template: './src/sign.html',
            filename: isLocal ? 'sign.html' : 'sign_new.html',
            minify,
            wxAppId: env.wxAppId,
            host: env.host,
            inject: false,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin({
            outputPath: path.resolve(__dirname, buildDir)
        }),
        new CopyWebpackPlugin([{
            from: './src/utils/gif.worker.js',
            to: path.resolve(__dirname, 'dist/js')
        }]),
        new WriteFilePlugin({
            test: /gif.worker.js$/,
            useHashIndex: true
        })
    ]

    if (['pro'].indexOf(options.config) >= 0) {
        plugins.push(new SentryCliPlugin({
            include: './dist',
            release: `h2-editor@${env.name}${env.version}`,
            ignoreFile: '.sentrycliignore',
            ignore: ['node_modules', 'webpack.config.js'],
            configFile: 'sentry.properties',
            urlPrefix: '~/h2/'
        }))
    }
    if (!isLocal) {
        plugins.push(new ZipPlugin(Object.assign({
            path: path.resolve(__dirname, 'zip'),
            pathPrefix: name,
            filename: `${name}-${env.docker}.zip`
        }, options.pro ? { exclude: [/\.map$/] } : {}))) // 生成环境不压缩map到zip包，以免传到服务器
    }

    return {
        mode: isLocal ? 'development' : 'production',
        entry: {
            app: [
                './src'
            ],
            preview: './src/preview/preview.js'
        },
        output: {
            publicPath: env.host.cdn + (options.hot ? ':' + port : '') + `/${name}/`,
            path: path.resolve(__dirname, buildDir),
            filename: isLocal ? 'js/[name].js' : 'js/[name]-[hash:8].js',
            chunkFilename: isLocal ? 'js/[name].js' : 'js/[name]-[hash:8].js' // 本地开发如果使用hash，watch会影响到公用js
        },
        module: {
            rules
        },
        plugins,
        resolve: {
            alias: {
                env: path.resolve(__dirname, 'env/' + options.config + '.js'),
                src: path.resolve(__dirname, 'src')
            }
        },
        externals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            vuex: 'Vuex',
            axios: 'axios'
        },
        devtool: 'source-map', // 所以环境都生成sourcemap，因为需要上传到Sentry服务器
        devServer: {
            hot: true,
            host: env.host.cdn.replace('//', ''),
            port,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }
    }
}
