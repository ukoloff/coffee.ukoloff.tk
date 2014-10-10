var
  fs = require('fs'),
  path = require('path'),
  chp = require('child_process')


console.log('Building UglifyJS...')
var u=chp.spawn(process.argv[0],
  ['uglifyjs', '--self'], 
  {cwd: path.join(__dirname, 'node_modules/uglify-js/bin')})
.on('error', function(e){console.log('Error:', e.message)})

u.stdout.pipe(fs.createWriteStream(path.join(__dirname, '../js/uglify.js')))
