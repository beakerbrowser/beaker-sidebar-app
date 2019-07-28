import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import sidebarEditorViewCSS from '../../css/views/editor.css.js'

var editor // monaco instance

class SidebarEditorView extends LitElement {
  static get properties () {
    return {
      url: {type: String},
      isLoading: {type: Boolean},
      readOnly: {type: Boolean},
      dne: {type: Boolean}
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

  constructor () {
    super()
    this.url = ''
    this.isLoading = true
    this.readOnly = true
    this.dne = false
    this.resolvedPath = ''

    document.addEventListener('editor-save', e => {
      this.onClickSave()
    })

    // load monaco
    if (!editor) {
      require.config({ baseUrl: 'beaker://assets/' });
      require(['vs/editor/editor.main'], () => {
        console.log('monaco loaded')
        // we have load monaco outside of the shadow dom
        editor = monaco.editor.create(document.querySelector('#monaco-editor'), {
          renderLineHighlight: 'all',
          lineNumbersMinChars: 4,
          automaticLayout: true,
          fixedOverflowWidgets: true,
          roundedSelection: false,
          minimap: {enabled: false},
          value: ''
        })
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
          document.dispatchEvent(new Event('editor-save'))
        })
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

    if (editor.getModel()) {
      editor.getModel().dispose()
    }

    console.log('Loading', url)
    editor.setValue('')
    this.isLoading = true
    this.readOnly = true
    this.dne = false
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

      // readonly if viewing historic version
      if (info.isOwner) {
        let v = this.viewedDatVersion
        if (v == +v) { // viewing a numeric version? (in the history)
          this.readOnly = true
        }
      }

      // determine the entry to load
      var entry = await window.datServeResolvePath(archive, manifest, this.url, '*/*')
      this.resolvedPath = entry ? entry.path : false
      console.debug('Resolved', this.url, 'to', this.resolvedPath, entry)

      // fetch the file
      try {
        if (!this.resolvedPath) throw 'dne'
        body = await archive.readFile(this.resolvedPath, 'utf8')
      } catch (e) {
        this.dne = true
        body = ''
      }
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

    if (!this.dne) {
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
          <div><span class="fas fa-fw fa-info-circle"></span> This page is not editable</div>
          <div class="spacer"></div>
          ${this.isDat ? html`<button><span class="far fa-fw fa-edit"></span> Open in Site Editor</button>` : ''}
        </div>
      `
    }
    if (this.dne) {

    }
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="toolbar">
        ${this.dne ? html`
          <div class="text">Create page:</div>
          <button title="Create a markdown page" @click=${e => this.onClickCreate(e, 'md')}>Markdown</button>
          <button title="Create an HTML page" @click=${e => this.onClickCreate(e, 'html')}>HTML</button>
        ` : html`
          <button title="Save" @click=${this.onClickSave}><span class="fas fa-fw fa-save"></span> <span class="btn-label">Save</span></button>
          <button title="Rename" @click=${this.onClickRename}><span class="fas fa-fw fa-i-cursor"></span> <span class="btn-label">Rename</span></button>
          <button title="Delete" @click=${this.onClickDelete}><span class="fas fa-fw fa-trash"></span> <span class="btn-label">Delete</span></button>
          <div class="text">${this.resolvedPath || this.pathname}</div>
        `}
        <div class="spacer"></div>
        <button title="Toggle live reloading" @click=${this.onToggleLiveReloading}><span class="fas fa-fw fa-bolt"></span></button>
        <button title="Open in Site Editor" @click=${this.onOpenInSiteEditor}><span class="far fa-fw fa-edit"></span> <span class="btn-label">Open in Site Editor</span></button>
      </div>
    `
  }

  // events
  // =

  async onClickCreate (e, ext) {
    if (this.readOnly) return

    // figure out a path that works for the given ext
    let path = this.resolvedPath || this.pathname
    if (!path || path.endsWith('/')) {
      path = `${path}index.${ext}`
    } else if (path.endsWith(`.${ext}`)) {
      path = path
    } else {
      path = `${path}.${ext}`
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
  }

  async onClickSave () {
    if (this.readOnly) return
    await this.archive.writeFile(this.resolvedPath, editor.getModel(this.url).getValue())
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
  }

  async onClickDelete () {
    if (this.readOnly) return
    if (confirm('Are you sure you want to delete this file?')) {
      await this.archive.unlink(this.resolvedPath)
      beaker.browser.gotoUrl(this.url)
      this.load()
    }
  }

  onToggleLiveReloading () {
    beaker.browser.toggleLiveReloading()
  }

  onOpenInSiteEditor () {
    beaker.browser.openUrl(`beaker://editor/${this.origin}${this.resolvedPath}`, {setActive: true})
  }
}

customElements.define('sidebar-editor-view', SidebarEditorView)
