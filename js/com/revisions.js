import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import { emit } from '/vendor/beaker-app-stdlib/js/dom.js'
import sidebarRevisionsCSS from '../../css/com/revisions.css.js'

class SidebarRevisions extends LitElement {
  static get properties () {
    return {
      origin: {type: String},
      currentDiff: {type: Array}
    }
  }

  static get styles () {
    return [sidebarRevisionsCSS]
  }

  constructor () {
    super()
    this.origin = ''
    this.currentDiff = []
  }

  // rendering
  // =

  render () {
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="field-group">
        <div class="field-group-title">Preview mode: ${this.currentDiff.length} unpublished revisions</div>
        <div class="content">
          ${repeat(this.currentDiff, filediff => html`
            <div>
              <span class="revision-indicator ${filediff.change}"></span>
              <a class=${filediff.change} @click=${e => this.onClickFile(e, filediff.path)}>${filediff.path}</a>
            </div>
          `)}
        </div>
        <div class="footer">
          <button class="transparent" @click=${this.onClickPublish}>
            <span class="fas fa-fw fa-check"></span> Publish all changes
          </button>
          <button class="transparent" @click=${this.onClickRevert}>
            <span class="fas fa-fw fa-undo"></span> Revert all
          </button>
        </div>
      </div>
    `    
  }

  // events
  // =

  onClickFile (e, path) {
    e.preventDefault()
    beaker.browser.gotoUrl(this.origin + path)
  }

  onClickPublish (e) {
    emit(this, 'publish', {composed: true, bubbles: true})
  }

  onClickRevert (e) {
    emit(this, 'revert', {composed: true, bubbles: true})
  }
}

customElements.define('sidebar-revisions', SidebarRevisions)
