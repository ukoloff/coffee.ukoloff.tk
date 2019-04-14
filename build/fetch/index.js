const fs = require('fs')
const path = require('path')
const https = require('https')

const fetch = require('node-fetch')
const yaml = require('js-yaml')

var sources = require('./sources')
var promisify = require('./promisify')

const root = path.join(__dirname, '../../js')

// https://stackoverflow.com/a/40639733
https.globalAgent.maxSockets = 5
https.globalAgent.keepAlive = true

sources
  .then(src => sources = src)
  .then(src => Promise.all(src.map(listTags)))
  .then(arr => zip(sources, arr.map(repoTags)))
  .then(writeVersions)
  .then(reportCounts)
  .then(zipList)
  .then(saveList)
  .catch(Error)

function listTags(repo) {
  return fetch(`https://api.github.com/repos/${repo.key}/git/refs/tags`)
    .then(x => x.json())
}

function Error(error) {
  console.log(`# ERROR: ${error}!`)
  process.exit(1)
}

function writeVersions(arr) {
  var rec = arr.reduce((obj, [k, v]) => (obj[k.repo] = v, obj), {})

  fs.writeFile(path.join(root, 'versions.js'),
    'define(' + JSON.stringify(rec, null, '  ') + ')',
    x => x)

  return arr
}

function repoTags(tags) {
  return tags
    .map(x => x.ref.replace(/[^]*\/v?/i, ''))
    .filter(x => /^\d+([.]\d+)*$/.test(x))
    .reverse()
}

function zip(...arrs) {
  return arrs[0].map(zip)

  function zip(_, row) {
    return arrs.map(item)

    function item(_, column) {
      return arrs[column][row]
    }
  }
}

function reportCounts(arr) {
  arr.forEach(
    it => console.log(`${it[0].repo}:\t${it[1].length}`));

  return arr;
}

function zipList(arr) {
  return [].concat(...arr.map(
    rec => rec[1].map(item => [rec[0], item])))
}

function saveList(arr) {
  promisify(fs.writeFile)(
    path.join(__dirname, 'tags.yml'),
    yaml.dump(arr))
    .then(_ => arr)
}
