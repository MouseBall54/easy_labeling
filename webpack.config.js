const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public/js'),
    publicPath: '/js/',
    clean: false, // Don't clean the public folder yet during migration
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3001, // Different port from the existing server
    open: false,
    hot: true,
    watchFiles: ['src/**/*', 'public/**/*'],
    compress: true,
    historyApiFallback: {
      index: '/index.html'
    }
  },
  stats: {
    errorDetails: true,
  },
  target: 'web',
  optimization: {
    minimize: false, // Keep readable during development
  },
  externals: {
    // Use CDN versions during development
    'fabric': 'fabric',
    'bootstrap': 'bootstrap'
  }
};