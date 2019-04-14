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
  process.stdout.write('# ')

  return Promise.all(bundle.map(ensureTag))
    .then(_ => bundle)
    .then(Report)
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

  tagRec[2] = 0

  return makeDir(path.dirname(dst))
    .then(_ => Promise.all(tagRec[0].paths.map(fetchVariant)))
    .then(_ => process.stdout.write(tagRec[2] ? '+' : '-'))

  function fetchVariant(fragment) {
    return queue(`https://github.com/${tagRec[0].key}/raw/${tagRec[1]}/${fragment}`)
      .then(req => req.ok ? trySave(req) : false, _ => false)
  }

  function trySave(req) {
    if (tagRec[2]++) return

    return new Promise(executor)

    function executor(resolve, reject) {
      req.body.pipe(fs.createWriteStream(dst))
        .on('error', reject)
        .on('finish', resolve)
    }
  }
}

function Report(bundle) {
  console.log()

  dumpGroup('Found', bundle.filter(rec => +rec[2] > 0))
  dumpGroup('Missing', bundle.filter(rec => 0 === rec[2]))

  return bundle
}

function dumpGroup(title, list) {
  if (!list.length) return
  console.log(`${title}:`)
  list.forEach(rec => console.log('  -', `${rec[0].repo}@${rec[1]}`))
}
