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
}

function hidePopup()
{
  popup.style.display=''
  return false
}

}()
