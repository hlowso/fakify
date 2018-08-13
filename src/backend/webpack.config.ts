const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/backend/index.ts',
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
    extensions: [ '.js', '.ts' ]
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, '../../')
  },
  target: "node",
  plugins: [ new Dotenv() ],
  node: {
    __dirname: false
  }
};