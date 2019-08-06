import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import * as dropdownMenu from './dropdown-menu.js'
import { emit } from '/vendor/beaker-app-stdlib/js/dom.js'
import userSessionCSS from '../../css/com/user-session.css.js'

class SidebarUserSession extends LitElement {
  static get properties () {
    return {
      origin: {type: String},
      session: {type: Object}
    }
  }

  static get styles () {
    return userSessionCSS
  }

  constructor () {
    super()
    this.origin = ''
    this.session = null
  }

  async connectedCallback () {
    this.session = await navigator.session.get(this.origin)
    super.connectedCallback()
  }

  // rendering
  // =

  render () {
    if (!this.session) return html`<div></div>`
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">

      <div class="field-group">
        <div class="field-group-title">User session</div>
        <div class="user">
          <img src="asset:thumb:${this.session.profile.url}">
          <div class="details">
            <div class="title">${this.session.profile.title}</div>
            <div class="url"><a href="${this.session.profile.url}" @click=${this.onClickLink}>${this.session.profile.url}</a></div>
          </div>
          <div style="margin-left: auto" @click=${this.onClickLogout}>
            <button>Logout</button>
          </div>
        </div>
        ${this.renderPermissionControl({
          icon: 'fas fa-rss',
          label: 'Follows API',
          perm: 'unwalled.garden/api/follows',
          caps: [
            {id: 'read', description: 'Query the user\'s public followers'},
            {id: 'write', description: 'Follow and unfollow users'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-comment-alt',
          label: 'Posts API',
          perm: 'unwalled.garden/api/posts',
          caps: [
            {id: 'read', description: 'Query the user\'s public feed'},
            {id: 'write', description: 'Post to the user\'s feed'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-star',
          label: 'Bookmarks API',
          perm: 'unwalled.garden/api/bookmarks',
          caps: [
            {id: 'read', description: 'Query the user\'s public bookmarks'},
            {id: 'write', description: 'Create and edit the user\'s bookmarks'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-comments',
          label: 'Comments API',
          perm: 'unwalled.garden/api/comments',
          caps: [
            {id: 'read', description: 'Query the user\'s public comments'},
            {id: 'write', description: 'Create and edit the user\'s comments'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'far fa-smile',
          label: 'Reactions API',
          perm: 'unwalled.garden/api/reactions',
          caps: [
            {id: 'read', description: 'Query the user\'s public emoji reactions'},
            {id: 'write', description: 'Create and edit the user\'s emoji reactions'}
          ]
        })}
        ${this.renderPermissionControl({
          icon: 'fas fa-vote-yea',
          label: 'Votes API',
          perm: 'unwalled.garden/api/votes',
          caps: [
            {id: 'read', description: 'Query the user\'s public votes'},
            {id: 'write', description: 'Create and edit the user\'s votes'}
          ]
        })}
      </div>
    `    
  }

  renderPermissionControl (opts) {
    var perms = this.session.permissions[opts.perm]
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
            <div class="toggleable-item disabled">
              <label>
                <input
                  type="checkbox"
                  disabled
                  ?checked=${this.session.permissions[opts.perm].includes(id)}
                >
                ${description}
                <small>${id}</small>
              </label>
            </div>
          `))}
          <a class="api-docs-link" href="dat://${opts.perm}" @click=${this.onClickLink}>
            <span class="fas fa-fw fa-external-link-alt"></span>
            ${opts.label} documentation
          </a>
        `
      }
    })
  }

  onClickLink (e) {
    e.preventDefault()
    beaker.browser.openUrl(e.currentTarget.getAttribute('href'), {setActive: true})
  }

  async onClickLogout (e) {
    await navigator.session.destroy(this.origin)
    this.session = null
  }
}

customElements.define('sidebar-user-session', SidebarUserSession)
