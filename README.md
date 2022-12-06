# Nodejs-Superconf

## 使用方法
#### 1. 在项目根目录放置zookeeper配置文件--superconf.json
```json
{
    "env": {
        "name": "dev1",
        "zookeeper": {
            "host": "127.0.0.1",
            "port": 2181,
            "auth_data": {
                "scheme": "digest",
                "auth": "zkr:123456"
            }
        },
        "deploy": "dev",
        "group": "myproj"
    }
}
```
这样配置的路径前缀是`/superconf/env_name/group_name`

#### 2. 安装包
```shell
npm install node-superconf
```

#### 3. 代码使用
```nodejs
var express = require('express')
var superconf = require('@weike/nodejs-superconf')
const Redis = require('ioredis')
var redisClient

// 此函数会第一次执行或者zookeeper数据变更时执行
function callback (zkData) {
  console.log('Calling callback function, data: ', zkData)
  const redisConfig = {
    port: Number(zkData.port),
    host: zkData.host,
    db: Number(zkData.db),
  }
  redisClient = new Redis(redisConfig)
}
superconf.RegisterNode("risk/redis_test", callback).then(() => {
  var app = express()
  app.get('/', function (req, res) {
    res.send('Hello World')
  })

  var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)
  })
})
```

#### 4. 项目中获取所有配置信息【当前项目节点以及union节点下所有的配置信息】
```nodejs
const {initSuperconf, CONFIG} = require('@weike/nodejs-superconf')
var express = require('express')


initSuperconf('wk_xxx').then(() => {
    console.log('========== ALL Superconf', CONFIG)  // 这时所取到的CONFIG就已经包括了所在项目以及union下的所有配置信息

    // connect redis
    const redisConfig = {
      port: Number(CONFIG.port),
      host: CONFIG.host,
      db: Number(CONFIG.db),
    }
    redisClient = new Redis(redisConfig)

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
```
