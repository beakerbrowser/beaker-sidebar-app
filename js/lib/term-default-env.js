import { createArchive } from './term-archive-wrapper.js'

// interactive help
// =

const METHOD_HELP = [
  {name: 'ls', description: 'List files in the directory or information about a file'},
  {name: 'cd', description: 'Change the current directory'},
  {name: 'pwd', description: 'Fetch the current directory'},
  {name: 'mkdir', description: 'Make a new directory'},
  {name: 'mv', description: 'Move a file or folder'},
  {name: 'cp', description: 'Copy a file or folder'},
  {name: 'rm', description: 'Remove a file or folder'},
  {name: 'read', description: 'Output the contents of a file'},
  {name: 'write', description: 'Write to a file'},
  {name: 'go', description: 'Open the target in the browser'},
  {name: 'edit', description: 'Edit the target in the browser'},
]

const METHOD_DETAILED_HELP = {
  ls: html => html`<strong>ls</strong> <span style="color: gray">[-a|--all]</span> {target}`,
  cd: html => html`<strong>cd</strong> {target}`,
  pwd: html => html`<strong>pwd</strong>`,
  mkdir: html => html`<strong>mkdir</strong> {target}`,
  mv: html => html`<strong>mv</strong> {src} {dst}`,
  cp: html => html`<strong>cp</strong> {src} {dst}`,
  rm: html => html`<strong>rm</strong> {target}`,
  read: html => html`<strong>read</strong> {target}`,
  write: html => html`<strong>write</strong> -t|--to {target} {content...}`,
  go: html => html`<strong>go</strong> <span style="color: gray">[-n]</span> {target}`,
  edit: html => html`<strong>edit</strong> <span style="color: gray">[-n]</span> {target}`,
}

export function help (env) {
  return {
    toHTML() {
      var longestMethod = METHOD_HELP.reduce((acc, v) => Math.max(acc, v.name.length), 0)
      return METHOD_HELP.map(method => {
        var nSpaces = longestMethod + 2 - method.name.length
        var methodEl = env.html`<span>${method.name}${' '.repeat(nSpaces)}</span>`
        return env.html`<div>${methodEl} <span style="color: gray; font-weight: lighter">${method.description || ''}</span></div>`
      })
    }
  }
}

// current working directory methods
// =

export async function ls (env, opts = {}, location = '') {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'ls')
  }

  // pick target location
  location = resolve(env, location, true)
  var {archive, protocol, pathname} = parseLocation(location)

  // read
  var listing
  var st = await archive.stat(pathname)
  if (st.isUnsupportedProtocol) {
    listing = {toHTML: () => env.html`Unknown endpoint on ${protocol} protocol`}
  } else if (st.isFile()) {
    listing = st
    listing.toHTML = () => env.html`Is a file.
Size: ${listing.size}`
  } else {
    listing = await archive.readdir(pathname, {stat: true})
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
          env.evalCommand(`ls ${joinPath(location, entry.name)}`)
        }

        // render
        const weight = entry.stat.isDirectory() ? 'bold' : 'normal'
        const icon =  entry.stat.isDirectory() ? 'far fa-folder' : 'far fa-file'
        const mountInfo = entry.stat.mount
          ? env.html` <span style="font-weight: lighter; color: gray">(<span class="fas fa-fw fa-external-link-square-alt"></span>${entry.stat.mount.key.slice(0,4)}..${entry.stat.mount.key.slice(-2)})</span>`
          : ''
        return env.html`<div><a
          @click=${onclick}
          style="color: ${color}; font-weight: ${weight}"
        ><i class="fa-fw ${icon}"></i> ${entry.name}${mountInfo}</a></div>`
      })
  }

  return listing
}

export async function cd (env, opts = {}, location = '') {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'cd')
  }
  await env.setCWD(resolve(env, location, true))
}

export function pwd (env, opts = {}) {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'pwd')
  }
  return env.getCWD().url
}

// folder manipulation
// =

export async function mkdir (env, opts, dst) {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'mkdir')
  }
  if (!dst) throw new Error('dst is required')
  var {archive, pathname} = resolveParse(env, dst)
  await archive.mkdir(pathname)
}

// file & folder manipulation
// =

export async function mv (env, opts, src, dst) {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'mv')
  }
  if (!src) throw new Error('src is required')
  if (!dst) throw new Error('dst is required')
  var srcp = resolveParse(env, src)
  var dstp = resolveParse(env, dst)
  if (srcp.origin === dstp.origin) {
    await srcp.archive.rename(srcp.pathname, dstp.pathname)
  } else {
    let content = await srcp.archive.readFile(srcp.pathname)
    await dstp.archive.writeFile(dstp.filename, content)
    await srcp.archive.unlink(srcp.pathname)
  }
}

export async function cp (env, opts, src, dst) {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'cp')
  }
  if (!src) throw new Error('src is required')
  if (!dst) throw new Error('dst is required')
  var srcp = resolveParse(env, src)
  var dstp = resolveParse(env, dst)
  if (srcp.origin === dstp.origin) {
    await srcp.archive.copy(srcp.pathname, dstp.pathname)
  } else {
    let content = await srcp.archive.readFile(srcp.pathname)
    await dstp.archive.writeFile(dstp.filename, content)
  }
}

export async function rm (env, opts, dst) {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'rm')
  }
  if (!dst) throw new Error('dst is required')
  var {archive, pathname} = resolveParse(env, dst)
  var st = await archive.stat(pathname)
  if (st.isDirectory()) {
    await archive.rmdir(pathname, {recursive: true})
  } else {
    await archive.unlink(pathname)
  }
}

// utilities
// =

export async function read (env, opts = {}, location = '') {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'read')
  }
  var {archive, origin, pathname} = resolveParse(env, location)
  if (/\.(png|jpe?g|gif)$/.test(pathname)) {
    return {toHTML: () => env.html`<img src=${origin + pathname}>`}
  }
  if (/\.(mp4|webm)$/.test(pathname)) {
    return {toHTML: () => env.html`<video controls><source src=${origin + pathname}></video>`}
  }
  if (/\.(mp3|ogg)$/.test(pathname)) {
    return {toHTML: () => env.html`<audio controls><source src=${origin + pathname}></audio>`}
  }
  return archive.readFile(pathname, 'utf8')
}

export async function write (env, opts, ...args) {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'write')
  }
  if (!opts.t && !opts.to) throw new Error('--to is required')

  var content = args.join(' ')
  var {archive, pathname} = resolveParse(env, opts.t || opts.to)
  await archive.writeFile(pathname, content)
}

export async function go (env, opts = {}, location = '') {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'go')
  }
  if (opts.n && !location) location = opts.n
  location = resolve(env, location, true)
  if (opts.n) {
    await env.browser.open(location)
  } else {
    await env.browser.goto(location)
  }
}

export async function edit (env, opts = {}, location = '') {
  if (opts.h || opts.help) {
    return detailedHelp(env, 'edit')
  }
  if (opts.n && !location) location = opts.n
  location = resolve(env, location, true)
  if (opts.n) {
    await env.browser.open(location, 'editor')
  } else {
    await env.browser.goto(location)
    await env.browser.openSidebar('editor')
  }
}

// internal methods
// =

function detailedHelp (env, name) {
  return env.html`<div style="padding: 10px; margin: 5px 0; border: 1px dashed gray">${METHOD_DETAILED_HELP[name](env.html)}</div>`
}

function resolveParse (env, location) {
  return parseLocation(resolve(env, location, true))
}

function parseLocation (location) {
  var urlp = new URL(location)
  urlp.archive = createArchive(urlp.toString())
  return urlp
}

function resolve (env, location, fullUrl = false) {
  const cwd = env.getCWD()

  // home
  if (location.startsWith('~')) {
    location = joinPath(env.getHome(), location.slice(1))
  }

  // relative paths
  if (location.startsWith('./')) {
    location = location.slice(2) // remove starting ./
  }
  if (!location.startsWith('/') && !location.includes('://')) {
    location = joinPath(cwd.pathname, location)
  }

  if (!location.includes('://')) {
    // .. up navs
    let parts = location.split('/')
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '..') {
        if (parts[i - 1]) {
          // remove parent
          parts.splice(i - 1, 1)
          i--
        }
        // remove '..'
        parts.splice(i, 1)
        i--
      }
    }
    location = parts.join('/')

    // full urls
    if (fullUrl) {
      location = joinPath(cwd.origin, location)
    }
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