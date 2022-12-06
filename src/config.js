var fs = require('fs')
var path = require('path')
var logger = require('./logger')

function initConf () {
  const workspace = process.cwd()
  const superconfPath = `${workspace}${path.sep}superconf.json`
  logger.log(`Info: Try to read superconf file: ${superconfPath}`)
  const data = fs.readFileSync(superconfPath, { encoding: 'utf8', flag: 'r' })
  if (!data) throw new Error('superconf.json can not be empty')
  return JSON.parse(data)
}

exports.initConf = initConf
