const path = require('path');

module.exports = {
    entry: ['./app/index.js'],
    output: {
      path: path.resolve(__dirname, './build'),
      filename: 'bundle.js'
    },
    module: {
      rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
          loader: 'babel-loader',
          options: {
          babelrc: false
          }
      }]
    },
    {
      test: /\.json$/,
      loader: "json-loader"
    }] 
  },
  devServer: {
    port: 3001,
    contentBase: './build',
    inline: true
  }
}