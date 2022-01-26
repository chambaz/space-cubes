const webpack = require('webpack')

let { parsed: myEnv } = require('dotenv').config({
  path: '.env',
})

if (!myEnv) {
  myEnv = {}
}

module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(myEnv))
    return config
  },
}
