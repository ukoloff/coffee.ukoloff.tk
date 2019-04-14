//
// Build UglifyJS for browser
//
const fs = require('fs')
const path = require('path')

const runner = require('npm-run')

const root = require('./save').root

runner.spawn('uglifyjs', ['--self', '-mc'])
  .on('error', error => console.log('UglifyJS build error:', error))
  .stdout.pipe(fs.createWriteStream(path.join(root, 'uglify.js')))
