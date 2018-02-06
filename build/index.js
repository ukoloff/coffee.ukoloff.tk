var
  fs = require('fs'),
  path = require('path'),
  chp = require('child_process'),
  github = require('github'),

  paths = [[
    'docs/v1/browser-compiler/coffee-script.js',
    'extras/coffee-script.js'
  ], [
    'docs/v2/browser-compiler/coffeescript.js'
  ]]

uglify()
coffee()

function uglify()
{
  console.log('Building UglifyJS...')
  var u=chp.spawn(process.argv[0],
    ['uglifyjs', '--self', '-mc'],
    {cwd: path.join(__dirname, 'node_modules/uglify-js/bin')})
  .on('error', function(e){console.log('Error:', e.message)})

  u.stdout.pipe(fs.createWriteStream(path.join(__dirname, '../js/uglify.js')))
}

function coffee()
{
  var
    src={user: 'jashkenas', repo: 'coffeescript'}

  console.log('Fetching Coffee Script...')

  var
    tags=[],
    tag,
    uris = [],
    g = new github({version: '3.0.0'})

  g.repos.getTags(merge(src, {per_page: 50}), tagen)

  function tagen(err, data)
  {
    if(err)
    {
      console.log('Oops! :-(', err.message)
      return
    }
    tags = data.map(nameProp).filter(skipAlpha)
    fs.writeFileSync(path.join(__dirname, '..', 'js', 'menu.js'),
      "define("+JSON.stringify(tags, null, '  ')+')\n')
    fetchTag()
  }

  function nameProp(x)
  {
    return x.name
  }

  function skipAlpha(s)
  {
    return !/[a-z]/i.test(s)
  }

  function fetchTag()
  {
    if(tags.length<=0) return;
    tag = tags.shift();
    uris = paths[Number(tag.split(/\D/, 1)[0] > 1)].slice();
    fetchFile();
  }

  function fetchFile()
  {
    if(!uris.length)
    {
      console.error('Cannot load tag', tag);
      return;
    }
    g.repos.getContent(merge(src, {path: uris.shift(), ref: tag}), blob)
  }

  function blob(err, data)
  {
    if(err)
    {
      fetchFile()
      return
    }
    var x=data.content
    if('base64'==data.encoding)
      x=new Buffer(x, 'base64').toString('ascii')
    var name=path.join(__dirname, '..', 'js', tag, 'coffee-script.js')
    console.log(name, x.length)
    try{fs.mkdirSync(path.dirname(name))}catch(e){}
    fs.writeFileSync(name, x)
    fetchTag()
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
