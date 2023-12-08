const { defineConfig } = require('@vue/cli-service')
// had to add themecolor here because manifest didnt change it
//even tho i changed it in the manifesT??? remove pwa theme color later maybe
module.exports = defineConfig({
  pwa: {
    themeColor: '#ED7823'
  },
  transpileDependencies: ['@vue/cli-service']
})
