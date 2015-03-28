!function(){

var
  versions = [],
  editors = {}

setTimeout(boot)

this.define = function(vs)
{
  versions = vs
}

function boot()
{
  initEditors()
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

function hidePopup()
{
}

}()
