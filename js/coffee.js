!function(){

this.define = define
define.amd = true
define.menu = menu

writeScript('menu')

function define(module)
{
  if(1!=arguments.length) return
  if('function'==typeof module) module=module()
  !function(){ this.CoffeeScript=module }()
  setTimeout(Start)
}

function menu(tags)
{
  writeScript(tags[0]+'/coffee-script')
}

function writeScript(script)
{
  document.writeln('<script src="js/'+script+'.js"></script>')
}

function Start(){

var err, errPos

var z=document.getElementsByTagName('pre')
for(var i=z.length-1; i>=0; i--)
{
  var id=z[i].id
  var x=window[id]=ace.edit(id)
  x.setTheme("ace/theme/github")
  x.getSession().setMode("ace/mode/"+id)
  x.getSession().setUseWorker(false)
  x.on('focus', hidePopup)
}

z=document.getElementById('popup')
var
  popup=z.getElementsByTagName('div')[0],
  x=z.getElementsByTagName('a')
x[0].onclick=function()
{
  popup.style.display='block'
  return false
}

x[1].onclick=hidePopup

function hidePopup()
{
  popup.style.display=''
  return false
}

var checkBoxes=z.getElementsByTagName('input')
for(var i=checkBoxes.length-1; i>=0; i--)
  checkBoxes[i].onclick=Compile

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
 var Options={}
 for(var i =checkBoxes.length-1; i>=0; i--)
 {
   var cb=checkBoxes[i]
   Options[cb.name]=cb.checked
 }
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

}
}()
