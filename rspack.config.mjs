import path, { join } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { rspack } from '@rspack/core';
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
    // 'assets/react': [join(__dirname, './src/assets/react.svg')],
  },
  plugins: [new HtmlWebpackPlugin()],
  // resolve: {
  //   extensionAlias: {
  //     '.js': ['.ts', '.tsx', '.js'],
  //   },
  //   tsConfig: {
  //     configFile: './tsconfig.json',
  //   }
  // },
  optimization: {
    minimize: false,
  },
  output: {
    clean: true,
    path: isRunningWebpack
      ? path.resolve(__dirname, 'webpack-dist')
      : path.resolve(__dirname, 'rspack-dist'),
    filename: '[name][contenthash:10].js',
    publicPath: 'auto',
    assetModuleFilename: 'static/asset/[name].[ext]',
    module: true,
    chunkFormat: 'module',
    chunkLoading: 'import',
    workerChunkLoading: 'import',
    wasmLoading: 'fetch',
  },
  stats: {
    children: true,
  },
  module: {
    generator: {
      asset: {
        publicPath: 'auto'
      }
    },
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.js$/,
        loader: path.join(__dirname, './test-loader.cjs'),
      },
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
                maxSize: 0,
              },
            },
            generator: {
              filename: 'static/svg/[name].svg',
              publicPath: 'auto'
            },
          },
        ],
      },
    ],
  },
  experiments: {
    css: true,
    outputModule: true
  },
  // plugins: [
  //   isRunningRspack
  //     ? new rspack.BannerPlugin({
  //         banner: '/* this is a banner */',
  //         raw: true,
  //       })
  //     : new webpack.BannerPlugin({
  //         banner: '/* this is a banner */',
  //         // raw: true,
  //       }),
  // ],
};

export default config;
