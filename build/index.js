var
  fs = require('fs'),
  path = require('path'),
  chp = require('child_process'),
  github = require('github')

coffee()
// uglify()

function uglify()
{
  console.log('Building UglifyJS...')
  var u=chp.spawn(process.argv[0],
    ['uglifyjs', '--self'],
    {cwd: path.join(__dirname, 'node_modules/uglify-js/bin')})
  .on('error', function(e){console.log('Error:', e.message)})

  u.stdout.pipe(fs.createWriteStream(path.join(__dirname, '../js/uglify.js')))
}

function coffee()
{
  var
    src={user: 'jashkenas', repo: 'coffeescript'}

  console.log('Fetching Coffee Script...')

  g = new github({version: '3.0.0'})
  g.repos.getTags(src, tags)

  function tags(err, data)
  {
    if(err)
    {
      console.log('Oops! :-(')
      return
    }
    console.log(data)
  }
}
