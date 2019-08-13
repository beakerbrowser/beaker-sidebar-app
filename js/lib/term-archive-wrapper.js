/*
This wrapper provides a DatArchive interface for non-dat sites
so that errors can be smoothly generated
*/

export function createArchive (url) {
  if (url.startsWith('dat:')) {
    console.log('returning DatArchive', url)
    return new DatArchive(url)
  }
  console.log('returning OtherOrigin', url)
  return new OtherOrigin(url)
}

class OtherOrigin {
  constructor (url) {
    this.url = url
    for (let k of Object.getOwnPropertyNames(DatArchive.prototype)) {
      console.log(k)
      if (!this[k] && typeof DatArchive.prototype[k] === 'function') {
        this[k] = this.doThrow.bind(this)
      }
    }
  }

  stat () {
    // fake response to just let stat() callers pass through
    return {
      isUnsupportedProtocol: true,
      isDirectory: () => true,
      isFile: () => true
    }
  }

  doThrow () {
    let urlp = new URL(this.url)
    throw new Error(`${urlp.protocol} does not support this command`)
  }
}