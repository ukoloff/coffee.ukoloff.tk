!function(){

var
  versions = [],
  editors = {},
  popup, error,
  compiler, compilers = {}

setTimeout(boot, 100)

this.define = function(vs)
{
  versions = vs
}

function boot()
{
  reDefine()
  initEditors()
  initPopup()
  initError()
}

function reDefine()
{
  this.define = loaded
  loaded.amd = true
}

function initEditors()
{
  var z = document.getElementsByTagName('pre')
  for(var i = z.length-1; i>=0; i--)
  {
    var id = z[i].id
    var x = editors[id] = ace.edit(id)
    x.setTheme("ace/theme/github")
    x.getSession().setMode("ace/mode/"+id)
    x.getSession().setUseWorker(false)
    x.on('focus', hidePopup)
  }
  editors.coffee.getSession().on('change', thenCompile)
}

function initPopup()
{
  var z = document.getElementById('options')
  popup = z.getElementsByTagName('div')[0]
  z.getElementsByTagName('input')[0].onclick=function()
  {
    popup.style.display = 'block'
  }
  popup.getElementsByTagName('a')[0].onclick = hidePopup
  z=popup.getElementsByTagName('select')[0]
  var s=''
  for(var i = 0; i<versions.length; i++)
  {
    var x = document.createElement("option")
    x.text=versions[i]
    z.add(x)
  }
  z.onchange=select
  select.call(z)
  z = popup.getElementsByTagName('input')
  for(i = z.length-1; i>=0; i--)
    z[i].onclick = thenCompile
}

function hidePopup()
{
  popup.style.display=''
  return false
}

function initError()
{
  error = document.getElementById('error')
  error.getElementsByTagName('a')[0].onclick = hideError
}

function hideError()
{
  error.style.display = ''
}

function select()
{
  var v = versions[this.selectedIndex]
  if(compilers[v])
  {
    compiler = compilers[v]
    thenCompile()
    return
  }
  addScript(v)
}

function addScript(version)
{
  var js = document.createElement('script')
  js.src = 'js/'+version+'/coffee-script.js'
  document.getElementsByTagName('head')[0].appendChild(js)
}

function loaded(coffee)
{
  if('function'==typeof coffee)
    coffee = coffee()
  compilers[coffee.VERSION] = compiler = coffee
  thenCompile()
}

function thenCompile()
{
  if(compiler)
    setTimeout(compile)
}

function compile()
{
  var
    Options={}, checkBoxes = popup.getElementsByTagName('input')

  hideError()

  for(var i = checkBoxes.length-1; i>=0; i--)
  {
    var cb=checkBoxes[i]
    Options[cb.name]=cb.checked
  }

  try{
    js=compiler.compile(editors.coffee.getValue(), {
      bare: !Options.bare,
      header: Options.header
    })
    if(Options.minify)
      js=Minify(js)
    editors.javascript.setValue(js)
    editors.javascript.getSession().setUseWrapMode(Options.minify)
  }
  catch(e){
    editors.javascript.setValue('')
    error.style.display='block'
    error.children[1].innerText=e.message
    errPos={x: e.location.first_column, y: e.location.first_line}
  }
}

function Minify(code)
{
  var ast=UglifyJS.parse(code)
  ast.figure_out_scope()
  ast=ast.transform(UglifyJS.Compressor())
  ast.figure_out_scope()
  ast.compute_char_frequency()
  ast.mangle_names()
  return ast.print_to_string()
}

}()
