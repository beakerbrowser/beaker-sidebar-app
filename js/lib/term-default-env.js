// interactive help
// =

const METHOD_HELP = [
  {name: 'ls', description: 'List files in the directory'},
  {name: 'cd', description: 'Change the current directory'},
  {name: 'pwd', description: 'Fetch the current directory'},
  {name: 'mkdir', description: 'Make a new directory'},
  {name: 'rmdir', description: 'Remove an existing directory'},
  {name: 'mv', description: 'Move a file or folder'},
  {name: 'cp', description: 'Copy a file or folder'},
  {name: 'rm', description: 'Remove a file'},
  {name: 'echo', description: 'Output the arguments'},
  {name: 'open', description: 'Open the target in the browser'},
  {name: 'edit', description: 'Edit the target in the browser'}
]

export function help (env) {
  return {
    toHTML() {
      var longestMethod = METHOD_HELP.reduce((acc, v) => Math.max(acc, v.name.length), 0)
      return METHOD_HELP.map(method => {
        var nSpaces = longestMethod + 2 - method.name.length
        var methodEl = env.html`<span>${method.name}${' '.repeat(nSpaces)}</span>`
        return env.html`<div>${methodEl} <span style="color: gray">${method.description || ''}</span></div>`
      })
    }
  }
}

// current working directory methods
// =

export async function ls (env, opts = {}, location = '') {
  // pick target location
  const cwd = env.getCWD()
  location = toCWDLocation(env, location)
  // TODO add support for other domains than CWD

  // read
  var listing = await cwd.archive.readdir(location, {stat: true})

  // render
  listing.toHTML = () => listing
    .filter(entry => {
      if (opts.all || opts.a) return true
      return entry.name.startsWith('.') === false
    })
    .sort((a, b) => {
      // dirs on top
      if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
      if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })
    .map(entry => {
      // coloring
      var color = 'inherit'
      if (entry.name.startsWith('.')) {
        color = 'gray'
      }

      function onclick (e) {
        e.preventDefault()
        e.stopPropagation()
        env.evalCommand(`cd ${entry.name}`)
      }

      // render
      const entryUrl = cwd.archive.url + joinPath(location, entry.name)
      const weight = entry.stat.isDirectory() ? 'bold' : 'normal'
      return env.html`<div style="color: ${color}"><span style="font-weight: ${weight}"><a
          href=${entryUrl}
          @click=${entry.stat.isDirectory() ? onclick : undefined}
          target="_blank"
        >${entry.name}</a></span></div>`
    })

  return listing
}

export async function cd (env, opts = {}, location = '') {
  await env.setCWD(toCWDLocation(env, location))
}

export function pwd (env) {
  const cwd = env.getCWD()
  return `dat://${cwd.host}${cwd.pathname}`
}

// folder manipulation
// =

export async function mkdir (env, opts, dst) { 
  if (!dst) throw new Error('dst is required')
  const cwd = env.getCWD()
  dst = toCWDLocation(env, dst)
  await cwd.archive.mkdir(dst)
}

export async function rmdir (env, opts, dst) {
  if (!dst) throw new Error('dst is required')
  const cwd = env.getCWD()
  dst = toCWDLocation(env, dst)
  var opts = {recursive: opts.r || opts.recursive}
  await cwd.archive.rmdir(dst, opts)
}

// file & folder manipulation
// =

export async function mv (env, opts, src, dst) {
  if (!src) throw new Error('src is required')
  if (!dst) throw new Error('dst is required')
  const cwd = env.getCWD()
  src = toCWDLocation(env, src)
  dst = toCWDLocation(env, dst)
  await cwd.archive.rename(src, dst)
}

export async function cp (env, opts, src, dst) {
  if (!src) throw new Error('src is required')
  if (!dst) throw new Error('dst is required')
  const cwd = env.getCWD()
  src = toCWDLocation(env, src)
  dst = toCWDLocation(env, dst)
  await cwd.archive.copy(src, dst)
}

// file manipulation
// =

export async function rm (env, opts, dst) {
  if (!dst) throw new Error('dst is required')
  const cwd = env.getCWD()
  dst = toCWDLocation(env, dst)
  await cwd.archive.unlink(dst)  
}

// utilities
// =

export async function echo (env, opts, ...args) {
  var appendFlag = opts.a || opts.append
  var res = args.join(' ')
  const cwd = env.getCWD()

  if (opts.to) {
    let dst = toCWDLocation(env, opts.to)
    if (appendFlag) {
      let content = await cwd.archive.readFile(dst, 'utf8')
      res = content + res
    }
    await cwd.archive.writeFile(dst, res)
  } else {
    return res
  }
}

export async function open (env, opts = {}, location = '') {
  location = toCWDLocation(env, location, true)
  console.log('opening', location)
  await env.browser.goto(location)
}

export async function edit (env, opts = {}, location = '') {
  location = toCWDLocation(env, location, true)
  await env.browser.goto(location)
  await env.browser.openSidebar('editor')
}

// internal methods
// =

function toCWDLocation (env, location, fullUrl = false) {
  const cwd = env.getCWD()
  location = location.toString()
  if (location.startsWith('~')) {
    location = joinPath(env.getHome(), location.slice(1))
  }
  if (!location.startsWith('/') && !location.includes('://')) {
    location = joinPath(cwd.pathname, location)
  }
  if (fullUrl && !location.includes('://')) {
    location = `dat://${joinPath(cwd.host, location)}`
  }
  return location
}

function joinPath (left, right) {
  left = (left || '').toString()
  right = (right || '').toString()
  if (left.endsWith('/') && right.startsWith('/')) {
    return left + right.slice(1)
  }
  if (!left.endsWith('/') && !right.startsWith('/')) {
    return left + '/' + right
  }
  return left + right
}