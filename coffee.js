setTimeout(
function(){

var Options={}
var err, errPos

var z=document.getElementsByTagName('pre')
for(var i=z.length-1; i>=0; i--)
{
  var id=z[i].id
  var x=window[id]=ace.edit(id)
  x.setTheme("ace/theme/github")
  x.getSession().setMode("ace/mode/"+id)
  x.getSession().setUseWorker(false)
}

z=document.getElementById('popup')
var m=z.getElementsByTagName('div')[0]
z.onmouseover=function(){m.style.display='block'}
z.onmouseout=function(){m.style.display=''}
z=m.getElementsByTagName('input')
for(var i=z.length-1; i>=0; i--)
  z[i].onclick=function()
  {
    Options[this.name]=this.checked
    Compile()
  }

err=document.getElementById('error')
err.getElementsByTagName('input')[0].onclick=function()
{
  coffee.navigateTo(errPos.y, errPos.x);
  coffee.focus();
}

coffee.focus()
Compile()
coffee.getSession().on('change', Compile)
            
function Compile()
{
 err.style.display='';
 try{
  js=CoffeeScript.compile(coffee.getValue(), 
    {bare: !Options.bare, header: Options.header})
  if(Options.minify)
    js=Minify(js)
  javascript.setValue(js)
  javascript.getSession().setUseWrapMode(Options.minify)
 }catch(e){
  javascript.setValue('')
  err.style.display='block'
  err.children[0].innerText=e.message
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

}, 0)
