const path = require('path');
const Dotenv = require('webpack-dotenv-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/backend/index.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ],
    loaders: [
      {
        exclude: [/node_modules/]
      }
    ]
  },
  resolve: {
    modules: [ "./node_modules/" ],
    extensions: [ '.js', '.ts' ]
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