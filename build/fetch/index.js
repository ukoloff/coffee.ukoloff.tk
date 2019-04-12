const fetch = require('node-fetch')

const repos = ['jashkenas/coffeescript', 'gkz/LiveScript']

Promise.all(repos.map(listTags))
.then(buildList)
// .catch(Error)

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
  .reduce((obj, [k,v]) =>  (obj[k] = v, obj), {})

  console.log(JSON.stringify(res))
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

