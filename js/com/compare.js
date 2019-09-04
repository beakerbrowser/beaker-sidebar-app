import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import { emit } from '/vendor/beaker-app-stdlib/js/dom.js'
import * as toast from '/vendor/beaker-app-stdlib/js/com/toast.js'
import sidebarCompareCSS from '../../css/com/compare.css.js'

class SidebarCompare extends LitElement {
  static get properties () {
    return {
      baseUrl: {type: String, attribute: 'base'},
      targetUrl: {type: String, attribute: 'target'}
    }
  }

  static get styles () {
    return [sidebarCompareCSS]
  }

  constructor () {
    super()
    this.baseUrl = ''
    this.targetUrl = ''
    this.baseArchive = null
    this.targetArchive = null
    this.baseInfo = null
    this.targetInfo = null
    this.diff = null
  }

  attributeChangedCallback (name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval)
    if (this.baseUrl && this.targetUrl) {
      this.load()
    }
  }

  async load () {
    this.baseArchive = new DatArchive(this.baseUrl)
    this.targetArchive = new DatArchive(this.targetUrl)
    this.baseInfo = await this.baseArchive.getInfo()
    this.targetInfo = await this.targetArchive.getInfo()
    this.requestUpdate()

    this.diff = await DatArchive.diff(this.baseUrl, this.targetUrl, {compareContent: true, shallow: false})
    this.diff.sort((a, b) => (a.change).localeCompare(b.change) || (a.path || '').localeCompare(b.path || ''))
    this.requestUpdate()
  }

  async doMerge (opts) {
    try {
      toast.create('Merging...')
      await DatArchive.merge(this.baseArchive, this.targetArchive, opts)
      toast.create('Files updated', 'success')
    } catch (e) {
      console.error(e)
      toast.create(e.message || 'There was an issue writing the files', 'error')
    }
    this.load()
  }

  // rendering
  // =

  render () {
    if (!this.baseInfo || !this.targetInfo) return html``
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="header">
        <button class="transparent" @click=${this.onClickBack}>
          <span class="fas fa-fw fa-arrow-left"></span>
        </button>
        <div>
          Comparing
          <a href=${this.baseUrl}>${this.baseInfo.title}</a>
          to this site
        </div>
        <div style="flex: 1"></div>
        ${this.targetInfo.isOwner ? html`
          <button class="primary" @click=${this.onClickMergeAll}>Merge all</button>
        ` : ''}
      </div>
      ${!this.diff ? html`<div style="padding: 5px">Comparing...</div>` : ''}
      ${this.diff ? repeat(this.diff, diff => html`
        <sidebar-compare-diff-item
          .diff=${diff}
          .leftOrigin=${this.targetUrl}
          .rightOrigin=${this.baseUrl}
          ?can-merge=${this.targetInfo.isOwner}
          @merge=${this.onClickMergeItem}
        ></sidebar-compare-diff-item>
      `) : ''}
    `    
  }

  // events
  // =

  onClickBack (e) {
    emit(this, 'back', {bubbles: true, composed: true})
  }

  onClickMergeItem (e) {
    if (!confirm('Merge change?')) return
    var {diff} = e.detail
    this.doMerge({
      shallow: false,
      paths: [diff.path + (diff.type === 'dir' ? '/' : '')] // trailing slash indicates directory
    })
  }

  onClickMergeAll (e) {
    if (!confirm('Merge all changes?')) return
    this.doMerge({shallow: false})
  }
}

class SidebarCompareDiffItem extends LitElement {
  static get properties () {
    return {
      leftOrigin: {type: String},
      rightOrigin: {type: String},
      diff: {type: Object},
      canMerge: {type: Boolean, attribute: 'can-merge'},
      isExpanded: {type: Boolean}
    }
  }

  constructor () {
    super()
    this.leftOrigin = null
    this.leftRight = null
    this.diff = null
    this.canMerge = false
    this.isExpanded = false
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  render () {
    if (this.diff.type === 'dir') {
      return html`
        <div class="item ${this.diff.change}" @click=${this.onToggleExpanded}>
          <span style="width: 1.25em"></span>
          <div class="revision-indicator ${this.diff.change}"></div>
          <div class="revision">${this.diff.change}</div>
          <div class="path">${this.diff.path}</div>
          <div style="flex: 1"></div>
          ${this.canMerge ? html`
            <button class="transparent" @click=${this.onClickMerge}>Merge</button>
          ` : ''}
        </div>
      `
    }
    return html`
      <div class="item clickable ${this.diff.change}" @click=${this.onToggleExpanded}>
        <span class="fas fa-fw fa-${this.isExpanded ? 'minus' : 'plus'}"></span>
        <div class="revision-indicator ${this.diff.change}"></div>
        <div class="revision">${this.diff.change}</div>
        <div class="path">${this.diff.path}</div>
        <div style="flex: 1"></div>
        ${this.canMerge ? html`
          <button class="transparent" @click=${this.onClickMerge}>Merge</button>
        ` : ''}
      </div>
      ${this.isExpanded ? html`
        <sidebar-compare-diff-item-content
          .leftOrigin=${this.leftOrigin}
          .rightOrigin=${this.rightOrigin}
          .diff=${this.diff}
        ></sidebar-compare-diff-item-content>
      ` : ''}
    `
  }

  async onToggleExpanded () {
    this.isExpanded = !this.isExpanded
    if (this.isExpanded) {
      await this.requestUpdate()
      this.querySelector('sidebar-compare-diff-item-content').load()
    }
  }

  onClickMerge (e) {
    e.preventDefault()
    e.stopPropagation()
    emit(this, 'merge', {detail: {diff: this.diff}, bubbles: true})
  }
}

class SidebarCompareDiffItemContent extends LitElement {
  static get properties () {
    return {
      leftOrigin: {type: String},
      rightOrigin: {type: String},
      diff: {type: Object},
      leftText: {type: String},
      rightText: {type: String}
    }
  }

  get leftUrl () {
    return this.leftOrigin + this.diff.path
  }
  
  get rightUrl () {
    return this.rightOrigin + this.diff.path
  }

  get isImage () {
    return /\.(png|jpe?g|gif)$/i.test(this.diff.path)
  }

  get isVideo () {
    return /\.(mp4|webm|mov)$/i.test(this.diff.path)
  }

  get isAudio () {
    return /\.(mp3|ogg)$/i.test(this.diff.path)
  }

  get isText () {
    return !this.isImage && !this.isVideo && !this.isAudio
  }

  constructor () {
    super()
    this.leftOrigin = null
    this.rightOrigin = null
    this.diff = null
    this.leftText = null
    this.rightText = null
  }

  createRenderRoot() {
    return this // dont use shadow dom
  }

  async load () {
    if (this.isText) {
      var left = new DatArchive(this.leftOrigin)
      var right = new DatArchive(this.rightOrigin)
      if (this.diff.change === 'del' || this.diff.change === 'mod') {
        this.leftText = await left.readFile(this.diff.path)
      }
      if (this.diff.change === 'add' || this.diff.change === 'mod') {
        this.rightText = await right.readFile(this.diff.path)
      }
    }
  }

  render () {
    if (this.diff.change === 'mod') {
      return html`
        <div class="container split">
          <div><div class="action">Delete</div>${this.renderLeft()}</div>
          <div><div class="action">Add</div>${this.renderRight()}</div>
        </div>
      `
    } else if (this.diff.change === 'add') {
      return html`<div class="container"><div><div class="action">Add</div>${this.renderRight()}</div></div>`
    } else if (this.diff.change === 'del') {
      return html`<div class="container"><div><div class="action">Delete</div>${this.renderLeft()}</div></div>`
    }
  }

  renderLeft () {
    if (this.isImage) return html`<img src=${this.leftUrl}>`
    if (this.isVideo) return html`<video controls><source src=${this.leftUrl}></video>`
    if (this.isAudio) return html`<audio controls><source src=${this.leftUrl}></audio>`
    return html`<div class="text">${this.leftText}</div>`
  }

  renderRight () {
    if (this.isImage) return html`<img src=${this.rightUrl}>`
    if (this.isVideo) return html`<video controls><source src=${this.rightUrl}></video>`
    if (this.isAudio) return html`<audio controls><source src=${this.rightUrl}></audio>`
    return html`<div class="text">${this.rightText}</div>`
  }

  onToggleExpanded () {
    this.isExpanded = !this.isExpanded
  }
}

customElements.define('sidebar-compare', SidebarCompare)
customElements.define('sidebar-compare-diff-item', SidebarCompareDiffItem)
customElements.define('sidebar-compare-diff-item-content', SidebarCompareDiffItemContent)
