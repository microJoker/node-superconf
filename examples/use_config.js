const {initSuperconf, CONFIG} = require('../src/index')
var express = require('express')


function getRedisCli (zkData) {
    console.log('Calling callback function, data: ', zkData)
    const redisConfig = {
      port: Number(zkData.port),
      host: zkData.host,
      db: Number(zkData.db),
    }
    return new Redis(redisConfig)
}


initSuperconf('xxx').then(() => {
    console.log('========== ALL Superconf', CONFIG)  // 这时所取到的CONFIG就已经包括了所在项目下的所有配置信息

    // connect redis
    let redisConfig = CONFIG.redis
    let redisCli = getRedisCli(redisConfig)
    // redisCli...

    /**
     * run app
     * 
    var app = express()
    app.get('/', function (req, res) {
      res.send('Hello World')
    })
    let global_configs = CONFIG.global_configs
    app.listen(global_configs.PORT, () => {
        console.log('Listen at port: ' + global_configs.PORT, new Date().getTime());
    })
    
    */

})
