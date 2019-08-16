export function shimDatArchiveGlobal () {
  window.DatArchive = DatArchiveShim
}

export function handleDatArchiveRequests () {
  window.addEventListener('message', async function ({data, source}) {
    if (data.type !== 'archive:req') return
    let dat = new DatArchive(data.url)
    let fn = dat[data.method].bind(dat)

    try {
      let content = await fn(...data.args)
      respond({type: 'archive:res', content})
    } catch (err) {
      let {name, message, stack} = err
      let content = {name, message, stack}
      respond({type: 'archive:err', content})
    }

    function respond (msg) {
      msg.token = data.token
      source.postMessage(msg, '*')
    }
  })
}

/**
 * Shim interface
 */
class DatArchiveShim {
  constructor (url) {
    this.url = url
  }

  async readFile (...args) {
    return request({type: 'archive:req', method: 'readFile', url: this.url, args})
  }

  async stat (...args) {
    let stat = await request({type: 'archive:req', method: 'stat', url: this.url, args})
    stat.isDirectory = () => stat.mode === 16877
    stat.isFile = () => stat.mode === 33188
    return stat
  }
}

function request (params) {
  return new Promise(function (resolve, reject) {
    params.token = Math.random()
    window.addEventListener('message', listen)
    window.top.postMessage(params, window.location.origin)

    function listen ({data}) {
      if (data.token !== params.token) return
      window.removeEventListener('message', listen)
      switch (data.type) {
        case 'archive:err': return reject(data.content)
        case 'archive:res': return resolve(data.content)
        default: console.warn('Unknown data type: ' + data.type)
      }
    }
  })
}
