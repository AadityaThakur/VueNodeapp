// vue.config.js
// const path = require('path')
module.exports = {
    devServer: {
        proxy: 'http://localhost:3000',
        overlay: {
            warnings: true,
            errors: true
        }
    },
    css: {
      loaderOptions: {
        less: {
          additionalData: `@import '@/style/app.less';`
        }
      }
    },
    module: {
        rules: [
          {
            test: /\.css/,
            use: ['vue-style-loader', 'css-loader'] 
          },
          {
            test: /\.pug$/,
            loader: 'pug-plain-loader'
          },
          {
            test: /\.less$/,
            use: [
              'vue-style-loader',
              'css-loader',
              'less-loader'
            ]
          }
        ],
    },
}