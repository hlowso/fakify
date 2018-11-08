const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
    extensions: [ '.js', '.ts' ],
    plugins: [new TsconfigPathsPlugin({ configFile: process.env.IS_HEROKU ? "./src/backend/tsconfig.prod.json" : "./src/backend/tsconfig.json" })]
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, '../../')
  },
  target: "node",
  node: {
    __dirname: false
  }
};