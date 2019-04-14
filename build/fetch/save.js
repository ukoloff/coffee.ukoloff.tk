const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')
const makeDir = require('make-dir')

const promisify = require('./promisify')
const queue = require('./queue')(10)

module.exports = save
const root = save.root = path.join(__dirname, '../../js')

const stat = promisify(fs.stat)

if (!module.parent) main()

function save(bundle) {
  return Promise.all(bundle.map(ensureTag))
    .then(results => results.filter(Array.isArray))
    .then(dumpMissing)
}

function dumpMissing(bundle) {
  if (!bundle.length) return
  console.log(yaml.safeDump({
    Missing: bundle.map(rec => `${rec[0].repo}@${rec[1]}`)
  }))
}

function main() {
  promisify(fs.readFile)(path.join(__dirname, 'tags.yml'))
    .then(yaml.safeLoad)
    // .then(bundle => ensureTag(bundle[50]))
    .then(save)
    .catch(error => console.log('ERROR:', error))
}

function ensureTag(tagRec) {
  const dst = path.join(root, tagRec[0].repo, tagRec[1], tagRec[0].repo + '.js')
  return stat(dst)
    .then(_ => true)
    .catch(_ => Promise.resolve([tagRec, dst]).then(loadTag))
}

function loadTag([tagRec, dst]) {
  var count = 0

  return makeDir(path.dirname(dst))
    .then(_ => Promise.all(tagRec[0].paths.map(fetchVariant)))
    .then(_ => count ? null : tagRec)

  function fetchVariant(fragment) {
    return queue(`https://github.com/${tagRec[0].key}/raw/${tagRec[1]}/${fragment}`)
      .then(req => req.ok ? trySave(req) : false, _ => false)
  }

  function trySave(req) {
    if (count++) return

    return new Promise(executor)

    function executor(resolve, reject) {
      console.log('Writing:', `${tagRec[0].repo}@${tagRec[1]}`)
      req.body.pipe(fs.createWriteStream(dst))
        .on('error', reject)
        .on('finish', resolve)
    }
  }
}
