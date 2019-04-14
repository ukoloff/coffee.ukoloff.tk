var fs = require('fs')
var path = require('path')

var yaml = require('js-yaml')

var promisify = require('./promisify')

module.exports =
  promisify(fs.readFile)(path.join(__dirname, 'sources.yml'))
    .then(yaml.safeLoad)
    .then(massage)

function massage(rec) {
  return Object.keys(rec).map(repo)
  function repo(key) {
    return {
      key,
      repo: key.replace(/[^]*\//, '').toLowerCase(),
      paths: rec[key],
    }
  }
}
