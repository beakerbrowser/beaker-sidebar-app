import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import sidebarEditorViewCSS from '../../css/views/editor.css.js'
import BIN_EXTS from '../binary-extensions.js'
import '../com/files.js'

var editor // monaco instance
var diffEditor // monaco diff instance

class SidebarEditorView extends LitElement {
  static get properties () {
    return {
      url: {type: String},
      isLoading: {type: Boolean},
      isFilesOpen: {type: Boolean},
      readOnly: {type: Boolean},
      dne: {type: Boolean},
      isBinary: {type: Boolean},
      previewChange: {type: String}
    }
  }

  static get styles () {
    return [sidebarEditorViewCSS]
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

  get hasFileExt () {
    var path = this.pathname
    return path.split('/').pop().includes('.')
  }

  constructor () {
    super()
    this.url = ''
    this.isLoading = true
    this.isFilesOpen = false
    this.readOnly = true
    this.previewMode = false
    this.previewChange = false
    this.dne = false
    this.isBinary = false
    this.resolvedPath = ''

    // turn on live-reloading automatically
    beaker.browser.toggleLiveReloading(true)

    // load monaco
    if (!editor) {
      require.config({ baseUrl: 'beaker://assets/' });
      require(['vs/editor/editor.main'], () => {
        console.log('monaco loaded')
        // we have load monaco outside of the shadow dom
        let opts = {
          renderLineHighlight: 'all',
          lineNumbersMinChars: 4,
          automaticLayout: true,
          fixedOverflowWidgets: true,
          roundedSelection: false,
          minimap: {enabled: false},
          value: ''
        }
        editor = monaco.editor.create(document.querySelector('#monaco-editor'), opts)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
          document.querySelector('sidebar-app').shadowRoot.querySelector('sidebar-editor-view').onClickSave()
        })
        diffEditor = monaco.editor.createDiffEditor(document.querySelector('#monaco-diff-editor'), Object.assign({}, opts, {readOnly: true}))
        this.load()
      })
    } else {
      this.load()
    }
  }

  attributeChangedCallback (name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name === 'url') {
      this.load()
    }
  }

  async load () {
    if (!editor) return
    var url = this.url || ''

    // reset the editor
    for (let model of monaco.editor.getModels()) {
      model.dispose()
    }

    console.log('Loading', url)
    editor.setValue('')
    this.setDiffMode(false)
    this.isLoading = true
    this.readOnly = true
    this.previewMode = false
    this.previewChange = false
    this.dne = false
    this.isBinary = false
    this.resolvedPath = ''

    var body = ''
    if (url.startsWith('dat:')) {
      // load archive meta
      let archive = new DatArchive(url)
      let [info, manifest] = await Promise.all([
        archive.getInfo(),
        archive.readFile('/dat.json', 'utf8').catch(e => '')
      ])
      try {
        manifest = JSON.parse(manifest)
      } catch (e) {
        console.debug('Failed to parse manifest', {e, manifest})
        manifest = null
      }
      console.log(info)
      this.readOnly = !info.isOwner
      this.previewMode = info.userSettings.previewMode

      // readonly if viewing historic version
      if (info.isOwner) {
        let v = this.viewedDatVersion
        if (v == +v) { // viewing a numeric version? (in the history)
          this.readOnly = true
        }
      }

      // determine the entry to load
      var entry = await window.datServeResolvePath(archive, manifest, this.url, '*/*')
      this.resolvedPath = entry ? entry.path : this.pathname

      // figure out if it's binary
      {
        let filename = this.resolvedPath.split('/').pop()
        if (filename.includes('.') && BIN_EXTS.includes(filename.split('.').pop())) {
          this.isBinary = true
        }
      }

      // fetch the file
      if (!this.isBinary) {
        try {
          if (!this.resolvedPath) throw 'dne'
          body = await archive.readFile(this.resolvedPath, 'utf8')
        } catch (e) {
          this.dne = true
          body = ''
        }
      }

      // grab the diff if this is preview mode
      this.updateDiff()
    } else if (url.startsWith('http:') || url.startsWith('https:')) {
      try {
        body = await beaker.browser.fetchBody(url)
      } catch (e) {
        this.dne = true
        body = ''
      }
    } else {
      try {
        let res = await fetch(url)
        body = await res.text()
      } catch (e) {
        this.dne = true
        body = ''
      }
    }

    if (!this.dne && !this.isBinary) {
      // create a model
      let urlp2 = new URL(url)
      urlp2.pathname = this.resolvedPath || this.pathname
      let model = monaco.editor.createModel(body, null, url ? monaco.Uri.parse(urlp2.toString()) : undefined)
      model.updateOptions({readOnly: this.readOnly, tabSize: 2})
      editor.setModel(model)

      // override the model syntax highlighting when the URL doesnt give enough info (no extension)
      if (body && model.getModeId() === 'plaintext') {
        let type = await beaker.browser.getResourceContentType(url)
        if (type) {
          if (type.includes('text/html')) {
            monaco.editor.setModelLanguage(model, 'html')
          } else if (type.includes('text/markdown')) {
            monaco.editor.setModelLanguage(model, 'markdown')
          } else if (type.includes('text/css')) {
            monaco.editor.setModelLanguage(model, 'css')
          } else if (type.includes('text/javascript') || type.includes('application/javascript')) {
            monaco.editor.setModelLanguage(model, 'javascript')
          }
        }
      }
    }

    this.isLoading = false
    this.requestUpdate()
  }

  async updateDiff () {
    if (this.previewMode) {
      let diffs = await beaker.archives.diffLocalSyncPathListing(this.archive.checkout().url, {
        compareContent: true,
        shallow: false,
        paths: [this.resolvedPath]
      })
      var diff = diffs.find(d => d.path === this.resolvedPath)
      if (diff) {
        this.previewChange = diff.change
      } else {
        this.previewChange = false
      }
    } else {
      this.previewChange = false
    }
    this.requestUpdate()
  }

  async setDiffMode (enabled) {
    if (!enabled && this.isDiffing) {
      this.isDiffing = false
    } else if (enabled && !this.isDiffing) {
      var leftContent = await this.archive.checkout().readFile(this.resolvedPath).catch(e => '')
      var rightContent = await this.archive.checkout('preview').readFile(this.resolvedPath).catch(e => '')
      diffEditor.setModel({
        original: monaco.editor.createModel(leftContent),
        modified: monaco.editor.createModel(rightContent)
      })
      diffEditor.focus()
      this.isDiffing = true
    }
    document.querySelector('#monaco-editor').style.display = this.isDiffing ? 'none' : 'block'
    document.querySelector('#monaco-diff-editor').style.display = this.isDiffing ? 'block' : 'none'
    this.requestUpdate()
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
    if (this.readOnly) {
      return html`
        <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
        <div class="toolbar">
          ${this.isDat ? this.renderToolbarFiles() : ''}
          <div><span class="fas fa-fw fa-info-circle"></span> This page is read-only</div>
          ${this.isDat ? html`<button class="transparent" @click=${this.onClickFork}><span class="far fa-fw fa-clone"></span> Make an editable copy</button>` : ''}
          <div class="spacer"></div>
          ${this.isDat ? html`<button class="transparent" @click=${this.onOpenInSiteEditor}><span class="far fa-fw fa-edit"></span> Open in Site Editor</button>` : ''}
        </div>
        ${this.isFilesOpen ? this.renderFilesSidebar() : ''}
        ${this.isBinary ? html`
          <div class="empty">
            Binary file
          </div>
        ` : ''}
        <footer>${this.resolvedPath}</footer>
      `
    }
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="toolbar">
        ${this.renderToolbarFiles()}
        ${this.dne ? html`
          <div style="padding: 0 5px">
            <span class="fas fa-fw fa-info-circle"></span>
            This page ${this.previewChange === 'del' ? 'has been deleted' : 'does not exist'}.
          </div>
        ` : html`
          <button class="transparent" title="Save" @click=${this.onClickSave}><span class="fas fa-fw fa-save"></span> <span class="btn-label">Save</span></button>
          <button class="transparent" title="Rename" @click=${this.onClickRename}><span class="fas fa-fw fa-i-cursor"></span> <span class="btn-label">Rename</span></button>
          <button class="transparent" title="Delete" @click=${this.onClickDelete}><span class="fas fa-fw fa-trash"></span> <span class="btn-label">Delete</span></button>
        `}
        ${this.previewMode ? html`
          <span class="divider"></span>
          ${this.previewChange ? html`
            <span class="revision-indicator ${this.previewChange}"></span>
          ` : ''}
          <button class="transparent" ?disabled=${!this.previewChange} @click=${this.onClickPublish}>
            <span class="fas fa-fw fa-check"></span> ${this.previewChange === 'del' ? 'Confirm delete' : 'Publish'}
          </button>
          <button class="transparent ${this.isDiffing ? 'pressed' : ''}" ?disabled=${!this.previewChange || this.isBinary} @click=${this.onClickToggleDiff}>
            <span class="fas fa-fw fa-columns"></span> Diff
          </button>
          <button class="transparent" ?disabled=${!this.previewChange} @click=${this.onClickRevert}>
            <span class="fas fa-fw fa-undo"></span> Revert
          </button>
          <span class="divider"></span>
        ` : ''}
        <div class="spacer"></div>
        <button
          class="transparent tooltip-nodelay tooltip-left"
          data-tooltip="Toggle live reloading"
          @click=${this.onToggleLiveReloading}
        ><span class="fas fa-fw fa-bolt"></span></button>
      </div>
      ${this.isBinary ? html`
        <div class="empty">
          Binary file
        </div>
      ` : ''}
      ${this.dne && !this.isDiffing ? html`
        <div class="empty">
          ${this.hasFileExt ? html`
            You can <a href="#" @click=${e => this.onClickCreate(e)}>create a new page here</a>.
          ` : html`
            You can create a new page here using
            <a href="#" @click=${e => this.onClickCreate(e, 'md')}>Markdown</a>
            or
            <a href="#" @click=${e => this.onClickCreate(e, 'html')}>HTML</a>.
          `}
        </div>
      ` : ''}
      ${this.isFilesOpen ? this.renderFilesSidebar() : ''}
      <footer>${this.resolvedPath}</footer>
    `
  }

  renderToolbarFiles () {
    return html`
      <button class="transparent ${this.isFilesOpen ? 'pressed' : ''}" @click=${this.onToggleFilesOpen}>
        <span class="fas fa-fw fa-sitemap"></span> <span class="btn-label">Files</span>
      </button>
      <span class="divider"></span>
    `
  }

  renderFilesSidebar () {
    return html`
      <sidebar-files
        url=${this.url}
      ></sidebar-files>
    `
  }

  // events
  // =

  onToggleFilesOpen () {
    this.isFilesOpen = !this.isFilesOpen
  }

  async onClickCreate (e, ext) {
    if (e) e.preventDefault()
    if (this.readOnly) return

    // figure out a path that works for the given ext
    let path = this.resolvedPath || this.pathname
    if (ext) {
      if (!path || path.endsWith('/')) {
        path = `${path}index.${ext}`
      } else if (path.endsWith(`.${ext}`)) {
        path = path
      } else if (/.(md|html)$/i.test(path)) {
        path = `${path.replace(/.(md|html)$/i, '')}.${ext}`
      } else {
        path = `${path}.${ext}`
      }
    }

    // ensure the parent directory exists
    var pathParts = path.split('/').filter(Boolean).slice(0, -1)
    var pathAgg = []
    for (let pathPart of pathParts) {
      try {
        pathAgg.push(pathPart)
        await this.archive.mkdir(pathAgg.join('/'))
      } catch (e) {
        // ignore, dir already exists (probably)
      }
    }
    
    // create the file
    await this.archive.writeFile(path, '')
    beaker.browser.gotoUrl(`${this.origin}${path}`)
    this.load()
  }

  async onClickSave () {
    if (this.readOnly) return
    await this.archive.writeFile(this.resolvedPath, editor.getModel(this.url).getValue())
    this.updateDiff()
  }

  async onClickRename () {
    if (this.readOnly) return
    var pathparts = this.resolvedPath.split('/')
    var oldname = pathparts.pop()
    var newname = prompt('Enter the new name of this file', oldname)
    if (!newname) return
    var newpath = pathparts.concat([newname]).join('/')
    await this.archive.unlink(this.resolvedPath)
    await this.archive.writeFile(newpath, editor.getModel(this.url).getValue())
    
    var urlp = new URL(this.url)
    urlp.pathname = newpath
    beaker.browser.gotoUrl(urlp.toString())
    this.load()
  }

  async onClickDelete () {
    if (this.readOnly) return
    if (confirm('Are you sure you want to delete this file?')) {
      await this.archive.unlink(this.resolvedPath)
      beaker.browser.gotoUrl(this.url)
      this.load()
    }
  }

  async onClickPublish () {
    if (!confirm('Publish this change?')) return
    await beaker.archives.publishLocalSyncPathListing(this.origin, {paths: [this.resolvedPath]})
    this.load()
  }

  onClickToggleDiff () {
    if (this.isBinary) return // dont diff binary
    this.setDiffMode(!this.isDiffing)
  }

  async onClickRevert () {
    if (!confirm('Revert this change?')) return
    await beaker.archives.revertLocalSyncPathListing(this.origin, {paths: [this.resolvedPath]})
    this.load()
  }

  async onClickFork () {
    var archive = await DatArchive.fork(this.url)
    beaker.browser.openUrl(`${archive.url}${this.pathname}`, {
      setActive: true,
      isSidebarActive: true,
      sidebarApp: 'editor'
    })
  }

  onToggleLiveReloading () {
    beaker.browser.toggleLiveReloading()
  }

  onOpenInSiteEditor () {
    beaker.browser.openUrl(`beaker://editor/${this.origin}${this.resolvedPath}`, {setActive: true})
  }
}

customElements.define('sidebar-editor-view', SidebarEditorView)
