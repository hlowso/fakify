const path = require('path');
const Dotenv = require('webpack-dotenv-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/migration/index.ts',
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
    plugins: [new TsconfigPathsPlugin({ configFile: "./src/migration/tsconfig.json" })]
  },
  output: {
    filename: 'migrate.js',
    path: path.resolve(__dirname, '../../')
  },
  target: "node",
  plugins: [ new Dotenv({ path: "./.env" }) ],
  node: {
    __dirname: false
  }
};