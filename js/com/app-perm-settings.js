import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import * as dropdownMenu from './dropdown-menu.js'
import { emit } from '/vendor/beaker-app-stdlib/js/dom.js'
import sidebarAppPermSettingsCSS from '../../css/com/app-perm-settings.css.js'

class SidebarAppPermSettings extends LitElement {
  static get properties () {
    return {
      manifest: {type: Object},
      readOnly: {type: Boolean}
    }
  }

  static get styles () {
    return [sidebarAppPermSettingsCSS]
  }

  constructor () {
    super()
    this.manifest = {}
    this.readOnly = false
  }

  getSetPerms (perm) {
    try {
      return this.manifest.application.permissions[perm] || []
    } catch (e) {
      return []
    }
  }

  isPermSet (perm, id) {
    try {
      return this.manifest.application.permissions[perm].includes(id)
    } catch (e) {
      return false
    }
  }

  // rendering
  // =

  render () {
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">

      <div class="field-group app-perms">
        <div class="field-group-title">Application permissions</div>
        ${this.renderPermissionControl({
          icon: 'fas fa-rss',
          label: 'Follows API',
          documentation: 'dat://unwalled.garden/docs/api/follows',
          perm: 'unwalled.garden/perm/follows',
          caps: [
            {id: 'read', description: 'Query the user\'s followers'},
            {id: 'write', description: 'Follow and unfollow users'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-comment-alt',
          label: 'Posts API',
          documentation: 'dat://unwalled.garden/docs/api/posts',
          perm: 'unwalled.garden/perm/posts',
          caps: [
            {id: 'read', description: 'Query the user\'s feed'},
            {id: 'write', description: 'Post to the user\'s feed'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-star',
          label: 'Bookmarks API',
          documentation: 'dat://unwalled.garden/docs/api/bookmarks',
          perm: 'unwalled.garden/perm/bookmarks',
          caps: [
            {id: 'read', description: 'Query the user\'s bookmarks'},
            {id: 'write', description: 'Create and edit the user\'s bookmarks'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-comments',
          label: 'Comments API',
          documentation: 'dat://unwalled.garden/docs/api/comments',
          perm: 'unwalled.garden/perm/comments',
          caps: [
            {id: 'read', description: 'Query the user\'s comments'},
            {id: 'write', description: 'Create and edit the user\'s comments'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-smile',
          label: 'Reactions API',
          documentation: 'dat://unwalled.garden/docs/api/reactions',
          perm: 'unwalled.garden/perm/reactions',
          caps: [
            {id: 'read', description: 'Query the user\'s reactions'},
            {id: 'write', description: 'Create and edit the user\'s reactions'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'fas fa-vote-yea',
          label: 'Votes API',
          documentation: 'dat://unwalled.garden/docs/api/votes',
          perm: 'unwalled.garden/perm/votes',
          caps: [
            {id: 'read', description: 'Query the user\'s votes'},
            {id: 'write', description: 'Create and edit the user\'s votes'}
          ]
        })}
      </div>
    `    
  }

  renderPermissionControl (opts) {
    var perms = this.getSetPerms(opts.perm)
    var permsStr = (perms.length) ? perms.join(', ') : 'none'
    return html`
      <div>
        <button class="transparent" @click=${e => this.onClickAppPermBtn(e, opts)}>
          <span class="fa-fw ${opts.icon}"></span>
          <span class="perm-label-fixedwith">${opts.label}:</span>
          <strong>${permsStr}</strong>
          <span class="fas fa-fw fa-caret-down"></span>
        </button>
      </div>
    `
  }

  // events
  // =

  onClickAppPermBtn (e, opts) {
    e.preventDefault()
    e.stopPropagation()

    var rect = e.currentTarget.getClientRects()[0]
    dropdownMenu.create({
      x: rect.left,
      y: rect.bottom + 5,      
      render: () => {
        return html`
          <style>
            .toggleable-item label {
              display: flex;
              padding: 12px 22px 12px 8px;
              border-bottom: 1px solid #ddd;
            }
            .toggleable-item:not(.disabled) label:hover {
              background: #fafafa;
              cursor: pointer;
            }
            .toggleable-item label input {
              margin-right: 8px;
            }
            .toggleable-item label small {
              margin-left: 5px;
              color: gray;
              margin-top: 3px;
            }
            .api-docs-link {
              display: block;
              padding: 8px;
              font-size: 11px;
              color: gray;
              text-decoration: none;
            }
            .api-docs-link:hover {
              background: #fafafa;
            }
          </style>
          ${repeat(opts.caps, (({id, description}) => html`
            <div class="toggleable-item ${this.readOnly ? 'disabled' : ''}">
              <label>
                <input
                  type="checkbox"
                  ?disabled=${this.readOnly}
                  ?checked=${this.isPermSet(opts.perm, id)}
                  @change=${e => this.onChange(e, opts.perm, id)}
                >
                ${description}
                <small>${id}</small>
              </label>
            </div>
          `))}
          <a class="api-docs-link" href="${opts.documentation}" @click=${this.onClickDocsLink}>
            <span class="fas fa-fw fa-external-link-alt"></span>
            ${opts.label} documentation
          </a>
        `
      }
    })
  }

  onChange (e, perm, id) {
    emit(this, 'toggle-app-perm', {
      detail: {perm, id, enabled: e.currentTarget.checked},
      bubbles: true,
      composed: true
    })
  }

  onClickDocsLink (e) {
    e.preventDefault()
    beaker.browser.openUrl(e.currentTarget.getAttribute('href'), {setActive: true})
  }
}

customElements.define('sidebar-app-perm-settings', SidebarAppPermSettings)
