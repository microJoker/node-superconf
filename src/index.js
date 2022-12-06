var zookeeper = require('node-zookeeper-client')
var conf = require('./config')
var logger = require('./logger')

const superconf = conf.initConf() // 初始化superconf配置

var CONFIG = {'UNION': {}};

var client = zookeeper.createClient(`${superconf.env.zookeeper.host}:${superconf.env.zookeeper.port}`, { sessionTimeout: 30 * 1000 })
client.addAuthInfo(superconf.env.zookeeper.auth_data.scheme, Buffer.from(superconf.env.zookeeper.auth_data.auth))
client.connect()

var ZK_BASE_PATH = `/superconf/${superconf.env.name}/${superconf.env.group}`;

/**
 * 这里取到所在项目下的所有节点的所有配置
 * CONFIG = {
 *      mysql: {...},
 *      redis: {...},
 *      global: {...},
 *      ...
 * }
 */
function listChildrenNodes(path) {
    return new Promise((resolve, reject) => { client.getChildren(
            path,
            function (event) {
                logger.log('Got watcher event: %s', event);
                listChildrenNodes(client, path);
            },
            function (error, children, stat) {
                if (error) {
                    logger.log(
                        'Failed to list children of node: %s due to: %s.',
                        path,
                        error
                    );
                    reject(`Failed to list children of node: ${path} due to: ${error}`)
                }
                resolve(children)
            }
        );
    })
}


function setConfig(client, base_path, child_node, is_union_conf = false) {
    let path = `${base_path}/${child_node}`;
    return new Promise((resolve, reject) => {
        client.getData(
        path,
        function (event) {
            setConfig(client, base_path, child_node);  // 重新获取数据（监听）
        },
        function (error, data, stat) {
            if (error) {
                logger.log('Error occurred when getting data: %s.', error);
                reject(error);
            }

            let valid_data = data.length ? JSON.parse(data.toString()) : {};
            if (is_union_conf) {
                CONFIG.UNION[child_node] = valid_data;
            } else {
                CONFIG[child_node] = valid_data;
            }

            resolve();
        }
    )});
}


function initNodesConf(path, is_union_conf=false) {
    return new Promise((resolve, reject) => {
        listChildrenNodes(path).then((child_node_list) => {
            Promise.all(child_node_list.map(child_node => setConfig(client, path, child_node, is_union_conf))).then(() => {
                resolve();
            })
        })
    })
}


function initSuperconf(server_name = '', union_node = '') {
    if (!server_name || process.env.server_name) throw new Error('server_name can not be null')
    return new Promise((resolve, reject) => {
        client.once('connected', function () {
            logger.log('Connected to ZooKeeper.');
            let server_node_path = `${ZK_BASE_PATH}/${server_name || process.env.server_name}`;

            let init_node_tasks = [initNodesConf(server_node_path)]

            let union_path = ''
            if (union_node) {
                union_path = `${ZK_BASE_PATH}/${union_node}`;
                init_node_tasks.push(initNodesConf(union_path, true))
            }

            Promise.all(init_node_tasks).then(() => {
                logger.log('initSuperconf all node success');
                resolve()
            })
        })
    })
};


exports.initSuperconf = initSuperconf
exports.CONFIG = CONFIG
