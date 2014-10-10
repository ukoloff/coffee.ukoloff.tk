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

  var g = new github({version: '3.0.0'})
  // g.repos.getTags(src, tags)

  function tags(err, data)
  {
    if(err)
    {
      console.log('Oops! :-(')
      return
    }
    console.log(data)
  }

  g.repos.getContent(merge(src, {path: 'extras/coffee-script.js', ref: '1.8.0'}), blob)

  function blob(err, data)
  {
    if(err)
    {
      console.log('Oops! :-(')
      return
    }
    var x=data.content
    if('base64'==data.encoding)
      x=new Buffer(x, 'base64').toString('ascii')
    console.log(x)
  }
}

function merge()
{
  var r={}
  for(var i=0; i<arguments.length; i++)
  {
    var x=arguments[i]
    for(var k in x)r[k]=x[k]
  }
  return r
}
