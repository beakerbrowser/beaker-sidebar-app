import { shimDatArchiveGlobal } from '/js/lib/iframe-shim-dat-archive.js'
import { deflateNode } from '/js/lib/iframe-dom-transport.js'
import { joinPath } from '/vendor/beaker-app-stdlib/js/strings.js'

if (typeof window.DatArchive === 'undefined') {
  shimDatArchiveGlobal()
}

window.addEventListener('message', function receive ({data}) {
  if (data.type !== 'prompt:eval') return
  window.cwd = data.cwd
  evaluate(data.cmd, data.args, data.token)
})

async function evaluate (cmd, args, token) {
  try {
    var mod = await load(cmd)
    var fn = mod[args[1]] ? mod[args.shift()] : mod.default
    var output = await fn(...args)

    if (typeof output === 'undefined' || typeof output === 'string') {
      output = pre(output || 'Ok.')
    } else if (output.toHTML) {
      output = output.toHTML()
    } else if (!(output instanceof Element)) {
      output = pre(JSON.stringify(output).replace(/^"|"$/g, ''))
    }
    send({type: 'prompt:res', output: deflateNode(output), token})
  } catch (err) {
    var error = {name: err.name, message: err.message, stack: err.stack}
    send({type: 'prompt:err', error, token})
  }
}

async function load (cmd) {
  var url

  try {
    url = new URL(cmd)
  } catch (err) {
    url = new URL(joinPath(window.cwd.url, cmd))
  }
  if (!url.pathname.endsWith('.js')) {
    url.pathname += '.js'
  }

  try {
    return await import(url)
  } catch (err) {
    throw new Error('Command not found: ' + cmd)
  }
}

function pre (text) {
  var el = document.createElement('pre')
  el.innerText = text
  return el
}

function send (data) {
  window.parent.postMessage(data, window.location.origin)
}
