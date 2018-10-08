const path = require('path');
const Dotenv = require('webpack-dotenv-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/backend/index.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    modules: [ "./node_modules/" ],
    extensions: [ '.js', '.ts' ],
    plugins: [new TsconfigPathsPlugin({ configFile: "./src/backend/tsconfig.json" })]
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, './')
  },
  target: "node",
  plugins: process.env.IS_HEROKU ? undefined : [ new Dotenv({ path: "./.env" }) ],
  node: {
    __dirname: false
  }
};