const host = ""
const port = ""


module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  devServer: {
    proxy: {
      "/current_user":{
        target:`http://${host}:${port}/`,
        secure:false
      },
      "/password_change":{
        target:`http://${host}:${port}/`,
        secure:false
      },
      "/login":{
        target:`http://${host}:${port}/`,
        secure:false
      },
      "/logout":{
        target:`http://${host}:${port}/`,
        secure:false
      },
      "/data":{
        target:`http://${host}:${port}/`,
        secure:false
      },
      "/action":{
        target:`http://${host}:${port}/`,
        secure:false
      },
      "/ws":{
        target:`ws://${host}:${port}/`,
        ws:true,
        secure:false,
        changeOrigin:true
      }
    }
  }


}
