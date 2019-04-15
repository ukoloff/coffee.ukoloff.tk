const fs = require('fs')
const path = require('path')

module.exports = semver

const save = require('./save')
const promisify = require('./promisify')

const me = semver.path = path.join(save.root, 'versions.js')
semver.cmp = cmp
semver.read = read
read.mins = mins
semver.write = write

if (!module.parent) main()

function semver(ver) {
  return `${ver}`
    .split(/\D+/)
    .filter(x => x.length)
    .map(Number)
}

function cmp(A, B) {
  for (var i = 0; i < Math.max(A.length, B.length); ++i) {
    var d = (A[i] || 0) - (B[i] || 0)
    if (d) return d > 0 ? +1 : -1
  }
  return 0
}

function write(rec) {
  return promisify(fs.writeFile)(me,
    'define(' + JSON.stringify(rec, null, '  ') + ')')
}

function read() {
  return promisify(fs.readFile)(me)
    .then(js => (''+js).replace(/^\s*\w*\s*\(?|\)?\s*;?\s*$/g, ''))
    .then(JSON.parse)
  // .catch(_ => ({}))
}

function mins() {
  return read()
    .then(minimize)
}

function minimize(ver) {
  for (var k in ver) {
    ver[k] = (ver[k] || [])
      .map(semver)
      .reduce((min, item) => cmp(min, item) > 0 ? item : min) || []
  }
  return ver
}

function main() {
  mins().then(console.log)
}
