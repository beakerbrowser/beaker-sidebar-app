import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import * as dropdownMenu from './dropdown-menu.js'
import * as contextMenu from '/vendor/beaker-app-stdlib/js/com/context-menu.js'
import sidebarRequestedPermsCSS from '../../css/com/requested-perms.css.js'

class SidebarRequestedPerms extends LitElement {
  static get properties () {
    return {
      origin: {type: String},
      perms: {type: Array}
    }
  }

  static get styles () {
    return [sidebarRequestedPermsCSS]
  }

  constructor () {
    super()
    this.origin = ''
    this.perms = []
  }
  // rendering
  // =

  render () {
    var perms = this.perms.filter(p => !p.perm.startsWith('app:'))
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="field-group">
        <div class="field-group-title">Requested permissions</div>
        ${perms.length
          ? repeat(perms, perm => this.renderPerm(perm))
          : html`<p>This site has requested no additional permissions.</p>`
        }
      </div>
    `
  }

  renderPerm ({perm, value, opts}) {
    const permId = beakerPermissions.getPermId(perm)
    const permParam = beakerPermissions.getPermParam(perm)
    const desc = beakerPermissions.renderPermDesc({bg: null, html, url: this.url, permId, permParam, permOpts: opts})
    if (!desc) return
    return html`
      <div>
        <button class="transparent" @click=${e => this.onClickPermBtn(e, perm, value, opts)}>
          <span class="fa-fw ${beakerPermissions.PERM_ICONS[permId]}"></span>
          ${desc}:
          <strong>${value ? 'Allow' : 'Deny'}</strong>
          <span class="fas fa-fw fa-caret-down"></span>
        </button>
      </div>
    `
  }

  // events
  // =

  onClickPermBtn (e, perm, value, opts) {
    e.preventDefault()
    e.stopPropagation()

    var rect = e.currentTarget.getClientRects()[0]
    dropdownMenu.create({
      x: rect.left,
      y: rect.bottom + 5,      
      render: () => {
        return html`
          <style>
            .toggleable-item {
              display: flex;
              align-items: center;
              padding: 12px 12px 12px 8px;
              border-bottom: 1px solid #ddd;
              cursor: pointer;
            }
            .toggleable-item:hover {
              background: #fafafa;
            }
            .toggleable-item .fa-fw {
              margin-right: 5px;
              visibility: hidden;
            }
            .toggleable-item.checked .fa-fw {
              visibility: visible;
            }
          </style>
          <div class="toggleable-item ${value ? 'checked' : ''}" @click=${e => this.onTogglePerm(e, perm, !value)}>
            <span class="fas fa-fw fa-check"></span>
            Allow
          </div>
          <div class="toggleable-item ${!value ? 'checked' : ''}" @click=${e => this.onTogglePerm(e, perm, !value)}>
            <span class="fas fa-fw fa-check"></span>
            Deny
          </div>
        `
      }
    })
  }

  async onTogglePerm (e, perm, value) {
    contextMenu.destroy()

    // update perm
    var permObj = this.perms.find(o => o.perm === perm)
    if (!permObj) return
    var newValue = (value) ? 1 : 0
    await beaker.sitedata.setPermission(this.origin, perm, newValue)
    permObj.value = newValue
    this.requestUpdate()
  }
}

customElements.define('sidebar-requested-perms', SidebarRequestedPerms)
