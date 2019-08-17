const STATIC = /^static\:/

export function shimDatArchiveGlobal () {
  window.DatArchive = DatArchiveShim
}

export function handleDatArchiveRequests (allow = () => true) {
  window.addEventListener('message', async function ({data, source}) {
    if (data.type !== 'archive:req') return

    if (!allow(data.url, data.method)) {
      throw new Error('DatArchive access refused')
    }
    let method

    if (STATIC.test(data.method)) {
      method = DatArchive[data.method.replace(STATIC, '')]
    } else {
      let dat = new DatArchive(data.url)
      method = dat[data.method].bind(dat)
    }

    try {
      let content = await method(...data.args)
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
  static async load (...args) {
    let res = await request({method: 'static:load', args})
    return new this(res.url)
  }

  static async create (...args) {
    let res = await request({method: 'static:create', args})
    return new this(res.url)
  }

  static async fork (...args) {
    let res = await request({method: 'static:fork', args})
    return new this(res.url)
  }

  static async unlink (...args) {
    return request({method: 'static:unlink', args})
  }

  static async selectArchive (...args) {
    let res = await request({method: 'static:selectArchive', args})
    return new this(res.url)
  }

  static async resolveName (...args) {
    return request({method: 'static:resolveName', args})
  }

  constructor (url) {
    this.url = url
  }

  async getInfo (...args) {
    return request({method: 'getInfo', url: this.url, args})
  }

  async configure (...args) {
    return request({method: 'configure', url: this.url, args})
  }

  async stat (...args) {
    let stat = await request({method: 'stat', url: this.url, args})
    stat.isDirectory = () => stat.mode === 16877
    stat.isFile = () => stat.mode === 33188
    return stat
  }

  async readFile (...args) {
    return request({method: 'readFile', url: this.url, args})
  }

  async readdir (...args) {
    return request({method: 'readdir', url: this.url, args})
  }

  async writeFile (...args) {
    return request({method: 'writeFile', url: this.url, args})
  }

  async mkdir (...args) {
    return request({method: 'mkdir', url: this.url, args})
  }

  async unlink (...args) {
    return request({method: 'unlink', url: this.url, args})
  }

  async rmdir (...args) {
    return request({method: 'rmdir', url: this.url, args})
  }

  async copy (...args) {
    return request({method: 'copy', url: this.url, args})
  }

  async rename (...args) {
    return request({method: 'rename', url: this.url, args})
  }

  async history (...args) {
    return request({method: 'history', url: this.url, args})
  }

  checkout (version) {
    let urlp = new URL(this.url)
    let base = urlp.hostname.split('+')[0]
    this.url = `dat://${base}+${version}`
    return this
  }

  async download (...args) {
    return request({method: 'download', url: this.url, args})
  }
}

function request (params) {
  return new Promise(function (resolve, reject) {
    params.token = Math.random()
    params.type = 'archive:req'

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
