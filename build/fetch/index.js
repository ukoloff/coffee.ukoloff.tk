const fs = require('fs')
const path = require('path')

const fetch = require('node-fetch')
const yaml = require('js-yaml')

const save = require('./save')
const promisify = require('./promisify')

require('./uglify')

var sources

promisify(fs.readFile)(path.join(__dirname, 'sources.yml'))
  .then(yaml.safeLoad)
  .then(massageSources)
  .then(src => sources = src)
  .then(src => Promise.all(src.map(listTags)))
  .then(arr => zip(sources, arr.map(repoTags)))
  .then(reportCounts)
  .then(zipList)
  .then(saveList)
  .then(save)
  .then(writeVersions)
  .catch(Error)

function massageSources(rec) {
  return Object.keys(rec).map(repo)
  function repo(key) {
    return {
      key,
      repo: key.replace(/[^]*\//, '').toLowerCase(),
      paths: rec[key],
    }
  }
}

function listTags(repo) {
  return fetch(`https://api.github.com/repos/${repo.key}/git/refs/tags`)
    .then(x => x.json())
}

function Error(error) {
  console.log('# ERROR:', error)
  process.exit(1)
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
  return promisify(fs.writeFile)(
    path.join(__dirname, 'tags.yml'),
    yaml.dump(arr))
    .then(_ => arr)
}

function writeVersions(bundle) {
  var rec = bundle
    .filter(rec => 0 !== rec[2])
    .reduce((obj, rec) =>
      ((obj[rec[0].repo] || (obj[rec[0].repo] = [])).push(rec[1]), obj), {})
  // var rec = arr.reduce((obj, [k, v]) => (obj[k.repo] = v, obj), {})

  fs.writeFile(path.join(save.root, 'versions.js'),
    'define(' + JSON.stringify(rec, null, '  ') + ')',
    x => x)

  return bundle
}
