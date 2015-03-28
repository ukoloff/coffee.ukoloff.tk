!function(){

var
  versions = [],
  editors = {},
  popup

setTimeout(boot, 100)

this.define = function(vs)
{
  versions = vs
}

function boot()
{
  initEditors()
  initPopup()
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
}

function initPopup()
{
  var z = document.getElementById('options')
  popup = document.getElementById('popup')
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
}

function hidePopup()
{
  popup.style.display=''
  return false
}

function select()
{

}

}()
