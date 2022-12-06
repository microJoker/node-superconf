function getNowDateTime () {
  const date = new Date((new Date()).getTime())
  Y = date.getFullYear() + '-'
  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
  h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
  s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
  return Y + M + D + h + m + s
}

// 添加当前时间到日志输出方法
function log (message, ...args) {
  const now = getNowDateTime()
  console.log(`${now} -- ${message}`, ...args)
}

exports.log = log