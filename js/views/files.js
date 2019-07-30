import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import { format as formatBytes } from '/vendor/beaker-app-stdlib/vendor/bytes/index.js'
import * as contextMenu from '/vendor/beaker-app-stdlib/js/com/context-menu.js'
import * as toast from '/vendor/beaker-app-stdlib/js/com/toast.js'
import { joinPath } from '/vendor/beaker-app-stdlib/js/strings.js'
import { writeToClipboard } from '/vendor/beaker-app-stdlib/js/clipboard.js'
import sidebarFilesViewCSS from '../../css/views/files.css.js'

class SidebarFilesView extends LitElement {
  static get properties () {
    return {
      url: {type: String},
      isLoading: {type: Boolean},
      readOnly: {type: Boolean},
      items: {type: Array}
    }
  }

  static get styles () {
    return [sidebarFilesViewCSS]
  }

  get isDat () {
    return this.url && this.url.startsWith('dat:')
  }

  get archive () {
    return new DatArchive(this.url)
  }

  get origin () {
    let urlp = new URL(this.url)
    return urlp.origin
  }

  get viewedDatVersion () {
    let urlp = new URL(this.url)
    let parts = urlp.hostname.split('+')
    if (parts.length === 2) return parts[1]
    return 'latest'
  }

  get pathname () {
    let urlp = new URL(this.url)
    return urlp.pathname
  }

  constructor () {
    super()
    this.url = ''
    this.isLoading = true
    this.readOnly = true
    this.folderPath = ''
    this.items = []
    this.load()
  }

  attributeChangedCallback (name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name === 'url') {
      this.load()
    }
  }

  async load () {
    this.isLoading = true
   
    var items = []
    if (this.isDat) {
      let archive = this.archive
      
      let info = await archive.getInfo()
      this.readOnly = !info.isOwner

      let folderPath = this.pathname
      let st = await archive.stat(folderPath)
      if (!st.isDirectory()) {
        folderPath = (folderPath.split('/').slice(0, -1).filter(Boolean).join('/')) || '/'
      }
      this.folderPath = folderPath

      items = await archive.readdir(folderPath, {stat: true})
      items.sort((a, b) => {
        if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
        if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
        return a.name.localeCompare(b.name)
      })
    }
    console.log({items})

    this.items = items
    this.isLoading = false
  }

  // rendering
  // =

  render () {
    if (this.isLoading) {
      return html`
        <div class="toolbar">
          <div>Loading...</div>
        </div>
      `
    }
    if (!this.isDat) {
      return html`
        <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
        <div class="toolbar">
          <div><span class="fas fa-fw fa-info-circle"></span> This site doesn't support file listings</div>
        </div>
      `
    }
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="toolbar">
        ${this.readOnly ? html `
          <div><span class="fas fa-fw fa-info-circle"></span> This site is read-only</div>
        ` : html`
          <button @click=${this.onClickNewFolder}><span class="fa-fw far fa-folder"></span> <span class="btn-label">New folder</span></button>
          <button @click=${this.onClickNewFile}><span class="fa-fw far fa-file"></span> <span class="btn-label">New file</span></button>
          <button @click=${this.onClickImportFiles}><span class="fa-fw fas fa-upload"></span> <span class="btn-label">Import files</span></button>
        `}
      </div>
      <div class="listing" @contextmenu=${this.onContextmenuListing}>
        ${this.folderPath !== '/' ? html`
          <div class="item" @click=${this.onClickUpdog}>
            <span class="icon"><span class="fa-fw fas fa-level-up-alt"></span></span>
            <span class="name">..</span>
          </div>
        ` : ''}
        ${repeat(this.items, item => html`
          <div class="item" @click=${e => this.onClickItem(e, item)} @contextmenu=${e => this.onContextmenuItem(e, item)}>
            <span class="icon"><span class="fa-fw ${item.stat.isDirectory() ? 'fas fa-folder' : 'far fa-file'}"></span></span>
            <span class="name">${item.name}</span>
            <span class="size">${item.stat.size ? formatBytes(item.stat.size) : ''}</span>
          </div>
        `)}
      </div>
    `
  }

  // events
  // =

  onContextmenuListing (e) {
    e.preventDefault()
    e.stopPropagation()

    contextMenu.create({
      x: e.clientX,
      y: e.clientY,
      fontAwesomeCSSUrl: '/vendor/beaker-app-stdlib/css/fontawesome.css',
      items: [
        {
          icon: 'far fa-fw fa-folder',
          label: 'New folder',
          click: () => this.onClickNewFolder()
        },
        {
          icon: 'far fa-fw fa-file',
          label: 'New file',
          click: () => this.onClickNewFile()
        },
        {
          icon: 'fas fa-fw fa-upload',
          label: 'Import files',
          click: () => this.onClickImportFiles()
        }
      ]
    })
  }

  onContextmenuItem (e, item) {
    e.preventDefault()
    e.stopPropagation()

    var url = joinPath(this.origin, this.folderPath || '', item.name || '')
    contextMenu.create({
      x: e.clientX,
      y: e.clientY,
      fontAwesomeCSSUrl: '/vendor/beaker-app-stdlib/css/fontawesome.css',
      items: [
        {
          icon: 'fas fa-fw fa-external-link-alt',
          label: `Open in new tab`,
          click: () => {
            beaker.browser.openUrl(url, {
              setActive: true,
              isSidebarActive: true,
              sidebarApp: 'files'
            })
          }
        },
        {
          icon: 'fas fa-fw fa-link',
          label: `Copy URL`,
          click () {
            writeToClipboard(url)
            toast.create('Copied to your clipboard')
          }
        },
        {
          icon: 'fa fa-fw fa-i-cursor',
          label: 'Rename',
          click: async () => {
            var newname = prompt(`Enter the new name for this ${item.stat.isDirectory() ? 'folder' : 'file'}`, item.name)
            if (!newname) return
            var oldpath = joinPath(this.folderPath, item.name)
            var newpath = joinPath(this.folderPath, newname)
            await this.archive.rename(oldpath, newpath)
            if (oldpath === this.pathname) {
              beaker.browser.gotoUrl(joinPath(this.origin, newpath))
            } else {
              this.load()
            }
          }
        },
        {
          icon: 'fa fa-fw fa-trash',
          label: 'Delete',
          click: async () => {
            if (confirm(`Are you sure you want to delete ${item.name}?`)) {
              let path = joinPath(this.folderPath, item.name)
              if (item.stat.isDirectory()) {
                await this.archive.rmdir(path, {recursive: true})
              } else {
                await this.archive.unlink(path)
              }
              this.load()
            }
          }
        }
      ]
    })
  }

  onClickUpdog (e) {
    var upPath = this.folderPath.split('/').filter(Boolean).slice(0, -1).join('/')
    beaker.browser.gotoUrl(joinPath(this.origin, upPath))
  }

  onClickItem (e, item) {
    beaker.browser.gotoUrl(joinPath(this.origin, this.folderPath, item.name))
  }

  async onClickNewFolder (e) {
    if (this.readOnly) return
    var name = prompt('Enter the new folder name')
    if (name) {
      let path = joinPath(this.folderPath, name)
      await this.archive.mkdir(path)
      beaker.browser.gotoUrl(joinPath(this.origin, path))
    }
  }

  async onClickNewFile (e) {
    if (this.readOnly) return
    var name = prompt('Enter the new file name')
    if (name) {
      let path = joinPath(this.folderPath, name)
      await this.archive.writeFile(path, '')
      beaker.browser.gotoUrl(joinPath(this.origin, path))
    }
  }

  async onClickImportFiles (e) {
    if (this.readOnly) return

    let browserInfo = beaker.browser.getInfo()
    var osCanImportFoldersAndFiles = browserInfo.platform === 'darwin'

    var files = await beaker.browser.showOpenDialog({
      title: 'Import files',
      buttonLabel: 'Import',
      properties: ['openFile', osCanImportFoldersAndFiles ? 'openDirectory' : false, 'multiSelections', 'createDirectory'].filter(Boolean)
    })
    if (files) {
      for (let src of files) {
        await DatArchive.importFromFilesystem({
          src,
          dst: joinPath(this.origin, this.folderPath),
          ignore: ['dat.json'],
          inplaceImport: false
        })
      }
      this.load()
    }
  }
}

customElements.define('sidebar-files-view', SidebarFilesView)
