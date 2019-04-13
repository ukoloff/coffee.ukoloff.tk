const fs = require('fs')
const path = require('path')
const https = require('https')
const fetch = require('node-fetch')

const repos = ['jashkenas/coffeescript', 'gkz/LiveScript']

const root = path.join(__dirname, '../../js')

// https://stackoverflow.com/a/40639733
https.globalAgent.maxSockets = 5
https.globalAgent.keepAlive = true

Promise.all(repos.map(listTags))
  .then(buildList)
  .then(reportCounts)
  .catch(Error)

function listTags(repo) {
  return fetch(`https://api.github.com/repos/${repo}/git/refs/tags`)
    .then(x => x.json())
}

function Error(error) {
  console.log(`# ERROR: ${error}!`)
  process.exit(1)
}

function buildList(arr) {
  var res = zip(repos.map(langName), arr.map(repoTags))
    .reduce((obj, [k, v]) => (obj[k] = v, obj), {})

  fs.writeFile(path.join(root, 'versions.js'),
    'define(' + JSON.stringify(res, null, '  ') + ')',
    x => x)

  return res
}

function repoTags(tags) {
  return tags
    .map(x => x.ref.replace(/[^]*\/v?/i, ''))
    .filter(x => /^\d+([.]\d+)*$/.test(x))
    .reverse()
}

function langName(repo) {
  return repo.replace(/[^]*\//, '').toLowerCase()
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

function reportCounts(res) {
  for (k in res) {
    console.log(`${k}:\t${res[k].length}`)
  }
}
