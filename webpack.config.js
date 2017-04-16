const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './app/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[hash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html',
      filename: 'index.html',
      inject: 'body',
      hash: false,
      minify: {
        collapseWhitespace: true
      }
    }),
    // uglify and minify JS (for production)
    // new UglifyJSPlugin({
    //   sourceMap: false
    // })
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },

      {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
    ]
  }
}
