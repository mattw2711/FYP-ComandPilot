const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js', '.txt']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/utils/resources/', to: 'resources' }, // copies all files from 'resources' to 'resources' in the output directory
      ],
    }),
  ],
};

module.exports = config;