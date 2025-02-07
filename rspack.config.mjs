import path, { join } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { rspack } from '@rspack/core';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isRunningWebpack = !!process.env.WEBPACK;
const isRunningRspack = !!process.env.RSPACK;
if (!isRunningRspack && !isRunningWebpack) {
  throw new Error('Unknown bundler');
}

/**
 * @type {import('webpack').Configuration | import('@rspack/cli').Configuration}
 */
const config = {
  mode: 'production',
  devtool: false,
  entry: {
    index: [join(__dirname, './src/index.mjs')],
  },
  plugins: [new HtmlWebpackPlugin()],
  optimization: {
    minimize: false,
  },
  output: {
    clean: true,
    path: isRunningWebpack
      ? path.resolve(__dirname, 'webpack-dist')
      : path.resolve(__dirname, 'rspack-dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  stats: {
    children: true,
  },
  module: {
    generator: {
      asset: {
        publicPath: '/',
      },
    },
    rules: [
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        test: /\.svg$/i,
        oneOf: [
          /* config.module.rule('svg').oneOf('svg-asset-url') */
          {
            type: 'asset/resource',
            resourceQuery: /(__inline=false|url)/,
            generator: {
              filename: 'static/svg/[name].svg',
            },
          },
          /* config.module.rule('svg').oneOf('svg-asset-inline') */
          {
            type: 'asset/inline',
            resourceQuery: /inline/,
          },
          /* config.module.rule('svg').oneOf('svg-asset') */
          {
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 1000,
              },
            },
            generator: {
              filename: 'static/svg/[name].svg',
            },
          },
        ],
      },
      ...(isRunningRspack
        ? [
            {
              test: /\.css$/,
              type: 'javascript/auto',
              dependency: {
                not: 'url',
              },
              sideEffects: true,
              use: [
                {
                  loader: rspack.CssExtractRspackPlugin.loader,
                },
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                    modules: {
                      auto: true,
                      namedExport: false,
                      exportGlobals: false,
                      exportLocalsConvention: 'camelCase',
                      localIdentName: '[local]-[hash:base64:6]',
                    },
                    sourceMap: true,
                  },
                },
              ],
            },
          ]
        : [
            {
              test: /\.css$/,
              type: 'javascript/auto',
              dependency: {
                not: 'url',
              },
              sideEffects: true,
              use: [
                {
                  loader: MiniCssExtractPlugin.loader,
                },
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                    modules: {
                      auto: true,
                      namedExport: false,
                      exportGlobals: false,
                      exportLocalsConvention: 'camelCase',
                      localIdentName: '[local]-[hash:base64:6]',
                    },
                    sourceMap: true,
                  },
                },
              ],
            },
          ]),
    ],
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    isRunningRspack
      ? new rspack.CssExtractRspackPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/async/[name].[contenthash:8].css',
          ignoreOrder: true,
        })
      : new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/async/[name].[contenthash:8].css',
          ignoreOrder: true,
        }),
  ],
};

export default config;
