import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import { format as formatBytes } from '/vendor/beaker-app-stdlib/vendor/bytes/index.js'
import * as contextMenu from '/vendor/beaker-app-stdlib/js/com/context-menu.js'
import * as toast from '/vendor/beaker-app-stdlib/js/com/toast.js'
import { pluralize } from '/vendor/beaker-app-stdlib/js/strings.js'
import { writeToClipboard } from '/vendor/beaker-app-stdlib/js/clipboard.js'
import { follows } from 'dat://unwalled.garden/index.js'
import sidebarSiteViewCSS from '../../css/views/site.css.js'
import '../com/app-perm-settings.js'
import '../com/requested-perms.js'
import '../com/revisions.js'
import '../com/local-folder.js'

const isDatHashRegex = /^[a-z0-9]{64}/i

class SidebarSiteView extends LitElement {
  static get properties () {
    return {
      url: {type: String},
      user: {type: Object},
      feedAuthors: {type: Array},
      currentSection: {type: String},
      isLoading: {type: Boolean},
      readOnly: {type: Boolean},
      info: {type: Object},
      manifest: {type: Object},
      requestedPerms: {type: Object},
      appInfo: {type: Object},
      followers: {type: Array},
      follows: {type: Array},
      currentDiff: {type: Object}
    }
  }

  static get styles () {
    return [sidebarSiteViewCSS]
  }

  get isDat () {
    return this.url && this.url.startsWith('dat:')
  }

  get isHttps () {
    return this.url && this.url.startsWith('https:')
  }

  get isHttp () {
    return this.url && this.url.startsWith('http:')
  }

  get isBeaker () {
    return this.url && this.url.startsWith('beaker:')
  }

  get archive () {
    return new DatArchive(this.url)
  }

  get origin () {
    let urlp = new URL(this.url)
    return urlp.origin
  }

  get hostname () {
    let urlp = new URL(this.url)
    return urlp.hostname
  }

  get pathname () {
    let urlp = new URL(this.url)
    return urlp.pathname
  }

  get isPerson () {
    return this.isDat && this.info && this.info.type.includes('unwalled.garden/person')
  }

  get isApplication () {
    return this.isDat && this.info && this.info.type.includes('application')
  }

  get isWebsite () {
    return this.isDat && this.info && (!this.info.type.includes('unwalled.garden/person') && !this.info.type.includes('application'))
  }

  get isLocalUser () {
    // TODO handle other users than the current one
    return this.origin === this.user.url
  }

  get isDatDomainUnconfirmed () {
    // viewing a dat at a hostname but no domain is confirmed
    var hostname = this.hostname
    return this.isDat && !isDatHashRegex.test(hostname) && this.info.domain !== hostname
  }

  get isSaved () {
    return this.info && this.info.userSettings && this.info.userSettings.isSaved
  }

  get isFollowing () {
    return this.user && this.followers && this.followers.find(u => u.url === this.user.url)
  }

  get isPreviewModeEnabled () {
    return this.info && this.info.userSettings && this.info.userSettings.previewMode
  }

  constructor () {
    super()
    this.fileActStreams = null
    this.url = ''
    this.user = null
    this.feedAuthors = []
    this.isLoading = true
    this.readOnly = true
    this.info = null
    this.manifest = null
    this.requestedPerms = null
    this.appInfo = null
    this.followers = null
    this.follows = null
    this.currentDiff = null
    this.load()
  }

  attributeChangedCallback (name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval)
    if (this.url) {
      // close any active file activity streams
      if (this.fileActStreams) {
        for (let s of this.fileActStreams) {
          s.close()
        }
        this.fileActStreams = null
      }

      this.load()
    }
  }

  async load (section = 'about') {
    this.isLoading = true
    if (!this.url) return
   
    this.currentSection = section
    this.info = {}
    this.manifest = null
    this.appInfo = null
    this.followers = null
    this.follows = null
    this.currentDiff = null
    if (this.isDat) {
      // get archive info
      let archive = this.archive
      this.info = await archive.getInfo()
      this.readOnly = !this.info.isOwner

      // watch for network events
      if (!this.onNetworkChanged) {
        this.onNetworkChanged = (e) => {
          this.info.peers = e.peers
          this.requestUpdate()
        }
        archive.addEventListener('network-changed', this.onNetworkChanged)
      }

      // read manifest
      try {
        this.manifest = JSON.parse(await archive.readFile('/dat.json', 'utf8'))
      } catch (e) {
        this.manifest = {}
      }

      // read app data
      if (this.isApplication) {
        this.appInfo = await beaker.applications.getInfo(this.origin)
      }

      // read person data
      if (this.isPerson) {
        this.followers = (await follows.list({filters: {authors: this.feedAuthors, topics: this.origin}})).map(({author}) => author)
        this.follows = (await follows.list({filters: {authors: this.user.url}})).map(({topic}) => topic)
      }

      // read preview-mode data
      if (this.isPreviewModeEnabled) {
        if (!this.fileActStreams) {
          this.fileActStreams = [
            archive.checkout().watch(),
            archive.checkout('preview').watch(),
          ]
          this.fileActStreams[0].addEventListener('changed', e => this.onFilesChanged(e))
          this.fileActStreams[1].addEventListener('changed', e => this.onFilesChanged(e))
        }
        try {
          this.currentDiff = await beaker.archives.diffLocalSyncPathListing(archive.checkout().url, {compareContent: true, shallow: true})
        } catch (e) {
          // local path is probably missing
          this.currentDiff = null
        }
      }
    } else {
      this.info = {
        title: this.hostname,
        domain: this.isHttps || this.isBeaker ? this.hostname : undefined  
      }
    }

    // all sites: get requested perms
    var perms = await beaker.sitedata.getPermissions(this.origin)
    this.requestedPerms = await Promise.all(Object.entries(perms).map(async ([perm, value]) => {
      var opts = {}
      var permParam = beakerPermissions.getPermParam(perm)
      if (isDatHashRegex.test(permParam)) {
        let archiveInfo
        try { archiveInfo = await (new DatArchive(permParam)).getInfo() }
        catch (e) { /* ignore */ }
        opts.title = archiveInfo && archiveInfo.title ? archiveInfo.title : prettyHash(permParam)
      }
      return {perm, value, opts}
    }))

    this.isLoading = false
  }

  async updateManifest (fn) {
    // read current manifest
    var manifest
    try {
      manifest = JSON.parse(await this.archive.readFile('/dat.json', 'utf8'))
    } catch (e) {
      manifest = {}
    }
    // run updater fn
    fn(manifest)
    // write new manifest
    await this.archive.writeFile('/dat.json', JSON.stringify(manifest, null, 2))
    this.manifest = manifest
  }

  // rendering
  // =

  render () {
    if (this.isLoading) {
      return html`<div></div>`
    }
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      ${this.renderSiteInfo()}
      <div class="inner">
        <div class="nav">
          ${this.renderNav('about', 'About')}
          ${this.renderNav('perms', 'Permissions')}
          ${!this.readOnly ? this.renderNav('dev', 'Development') : ''}
        </div>
        ${this.renderAboutSection()}
        ${this.renderPermsSection()}
        ${this.renderDevSection()}
      </div>
    `
  }

  renderSiteInfo () {
    return html`
      <div class="site-info">
        ${this.readOnly ? html`
          <img class="thumb" src="asset:thumb:${this.url}">
        ` : html`
          <div
            class="editable editable-thumb tooltip-nodelay"
            data-tooltip="Change thumbnail"
            @click=${this.onClickChangeThumb}
          >
            <img class="thumb" src="asset:thumb:${this.url}?cache_buster=${Date.now()}">
            <input type="file" @change=${this.onChangeThumbFile}>
          </div>
        `}
        <div class="details">
          ${this.readOnly ? html`
            <h1>${this.info.title}</h1>
          ` : html`
            <h1>
              <span
                class="editable tooltip-nodelay"
                data-tooltip="Rename"
                @click=${this.onClickChangeTitle}
              >${this.info.title}</span>
            </h1>
          `}
          ${this.isPerson ? html`<p><span class="far fa-fw fa-user-circle"></span> Personal website</p>` : ''}
          ${this.isApplication ? html`<p><span class="far fa-fw fa-window-restore"></span> Application</p>` : ''}
          ${this.isBeaker ? html`<p><img src="beaker://assets/logo.png" style="width: 16px; position: relative; top: 4px"> Beaker Application</p>` : ''}
          ${this.isDat
            ? this.readOnly
              ? html`
                <p class="desc"><span class="fas fa-fw fa-info-circle"></span> ${this.info.description || html`<em>No description</em>`}</p>
              ` : html`
                <p class="desc">
                  <span
                    class="editable tooltip-nodelay"
                    data-tooltip="Change description"
                    @click=${this.onClickChangeDescription}
                  ><span class="fas fa-fw fa-info-circle"></span> ${this.info.description || html`<em>No description</em>`}</span>
                </p>
              `
            : ''}
          ${''/* TODO html`<p>
            <span class="fas fa-fw fa-pencil-alt"></span> Created by:
            <a href="#">Beaker Browser Inc</a>
          </p>` : ''*/}
          ${(this.isDat || this.isHttps) && this.info.domain ? html`
            <p><span class="fas fa-fw fa-check" style="color: green"></span> ${this.info.domain}</p>
          ` : ''}
        </div>
        <div class="right">
          <p><button class="transparent" disabled data-tooltip="todo"><span class="fas fa-fw fa-balance-scale"></span> License: None <span class="fas fa-caret-down"></span></button></p>
        </div>
      </div>
    `
  }

  renderNav (id, label) {
    const cls = id === this.currentSection ? 'current' : ''
    return html`
      <a class="${cls}" @click=${e => this.onClickSectionNav(e, id)}>${label}</a>
    `
  }

  renderSection (id, content) {
    if (this.currentSection !== id) {
      return ''
    }
    return html`<div class="section">${content}</div>`
  }

  renderAboutSection () {
    return this.renderSection('about', html`
      ${this.renderPrimaryAction()}
      ${this.isDatDomainUnconfirmed ? html`
        <div class="field-group">
          <div class="field-group-title"><span class="fas fa-fw fa-exclamation-triangle"></span> Domain issue</div>
          <p>
            This site has not confirmed <code>${this.hostname}</code> as its primary domain.
            It's safe to view but you will not be able to follow it, install it, or use its advanced features.
          </p>
        </div>
      ` : ''}
      ${this.isBeaker ? html`
        <div class="field-group">
          <div class="field-group-title">Beaker application</div>
          <p>
            This application is built into the Beaker browser.
          </p>
        </div>
      ` : ''}
      ${this.isDat ? html`
        <div class="field-group">
          <div class="field-group-title">Dat</div>
          <p>
            This website is served over the peer-to-peer network.
            ${this.info.peers} ${pluralize(this.info.peers, 'peer')}
            are currently connected.
          </p>
        </div>
      ` : ''}
      ${this.isHttps ? html`
        <div class="field-group">
          <div class="field-group-title">HTTPS</div>
          <p>
            This website is served over a secure connection.
          </p>
        </div>
      ` : ''}
      ${this.isHttp ? html`
        <div class="field-group">
          <div class="field-group-title">HTTP</div>
          <p class="warning"><span class="fas fa-exclamation-triangle"></span> Your connection to this site is not secure.</p>
          <p>
            You should not enter any sensitive information on this site (for example, passwords or credit cards) because it could be stolen by attackers.
          </p>
        </div>
      ` : ''}
      ${!this.readOnly && this.currentDiff && this.currentDiff.length ? html`
        <sidebar-revisions
          origin=${this.origin}
          .currentDiff=${this.currentDiff}
          @publish=${this.onPublishAll}
          @revert=${this.onRevertAll}
        ></sidebar-revisions>
      ` : ''}
      ${this.renderFollowers()}
      ${this.renderFollowers()}
      ${!this.readOnly ? html`
        <div class="field-group">
          <div class="field-group-title">Admin</div>
          <p>
            <button class="transparent" disabled data-tooltip="todo"><span class="fas fa-fw fa-globe"></span> Set domain name</button>
            <button class="transparent" disabled data-tooltip="todo"><span class="fas fa-fw fa-drafting-compass"></span> Theme: None <span class="fas fa-caret-down"></span></button>
          </p>
        </div>
      ` : ''}
    `)
  }

  renderPermsSection () {
    return this.renderSection('perms', html`
      <sidebar-requested-perms
        origin=${this.origin}
        .perms=${this.requestedPerms}
      ></sidebar-requested-perms>
      ${this.isApplication ? html`
        <sidebar-app-perm-settings
          .manifest=${this.manifest}
          ?readOnly=${this.readOnly}
          @toggle-app-perm=${this.onToggleAppPerm}
        ></sidebar-app-perm-settings>
      ` : ''}
    `)
  }

  renderDevSection () {
    return this.renderSection('dev', html`
      <div class="field-group">
        <div class="field-group-title">Preview mode</div>
        <p>
          <button @click=${this.onTogglePreviewMode}>
            <span class="fas fa-fw fa-hammer"></span>
            Preview Mode: <strong>${this.isPreviewModeEnabled ? 'On' : 'Off'}</strong>
          </button>
        </p>
        <p class="help">
          <span class="fas fa-fw fa-info"></span>
          Preview mode lets you see changes in a private version of the site.
          You can review the changes before publishing.
        </p>
      </div>
      <sidebar-local-folder
        origin=${this.origin}
        .info=${this.info}
        @request-load=${this.onRequestLoad}
      ></sidebar-local-folder>
    `)
  }

  renderPrimaryAction () {
    if (!this.isDat || this.isLocalUser) {
      return '' // no primary actions
    }

    var disabled = this.isDatDomainUnconfirmed
    var typeBtn = ''
    if (this.isPerson && this.readOnly) {
      if (this.isFollowing) {
        typeBtn = html`
          <button class="transparent" ?disabled=${disabled} @click=${this.onClickUnfollow}>
            <span class="fas fa-fw fa-times"></span>
            Unfollow ${this.info.title || 'this site'}
          </button>
        `
      } else {
        typeBtn = html`
          <button class="primary" ?disabled=${disabled} @click=${this.onClickFollow}>
            <span class="fas fa-fw fa-rss"></span>
            Follow ${this.info.title || 'this site'}
          </button>
        `
      }
    } else if (this.isApplication) {
      if (this.appInfo.installed) {
        typeBtn = html`
          <button class="transparent" ?disabled=${disabled} @click=${this.onClickUninstall}>
            <span class="fas fa-fw fa-ban"></span>
            Uninstall ${this.info.title || 'this application'}
          </button>
        `
      } else {
        typeBtn = html`
          <button class="primary" ?disabled=${disabled} @click=${this.onClickInstall}>
            <span class="fas fa-fw fa-download"></span>
            Install ${this.info.title || 'this application'}
          </button>
        `
      }
    }

    var publishBtn = ''
    if (!this.readOnly) {
      publishBtn = html`
        <button class="transparent" disabled data-tooltip="todo">
          <span class="fas fa-fw fa-bullhorn"></span>
          <span class="btn-label">Publish on my profile</span>
        </button>
      `
    }

    var saveBtn = ''
    if (this.isSaved) {
      saveBtn = html`
        <button class="transparent" @click=${this.onClickUnsave}>
          <span class="fas fa-fw fa-trash"></span>
          <span class="btn-label">
            ${this.readOnly ? 'Remove from my websites' : 'Move to trash'}
          </span>
        </button>
      `
    } else {
      saveBtn = html`
        <button class="transparent" @click=${this.onClickSave}>
          <span class="far fa-fw fa-save"></span>
          <span class="btn-label">Save to my websites</span>
        </button>
      `
    }
    return html`
      <div class="primary-action">
        ${typeBtn}
        ${publishBtn}
        ${saveBtn}
      </div>
    `
  }

  renderFollowers () {
    if (this.followers && this.followers.length) {
      return html`
        <div class="field-group">
          <div class="field-group-title">${this.followers.length} ${pluralize(this.followers.length, 'follower')}</div>            
          <div class="followers">
            ${repeat(this.followers, user => html`
              <a
                class="tooltip-nodelay"
                href="#"
                data-tooltip="${user.title}"
                @click=${e => this.onClickLink(e, user.url)}
                @auxclick=${e => this.onClickLink(e, user.url, true)}
              >
                <img src="asset:thumb:${user.url}">
              </a>
            `)}
          </div>
        </div>
      `
    }
  }

  renderFollows () {
    if (this.follows && this.follows.length) {
      return html`
        <div class="field-group">
          <div class="field-group-title">Followed by ${this.info.title || 'this site'}</div>            
          <div class="followers">
            ${repeat(this.follows, user => html`
              <a
                class="tooltip-nodelay"
                href="#"
                data-tooltip="${user.title}"
                @click=${e => this.onClickLink(e, user.url)}
                @auxclick=${e => this.onClickLink(e, user.url, true)}
              >
                <img src="asset:thumb:${user.url}">
              </a>
            `)}
          </div>
        </div>
      `
    }
  }

  // events
  // =

  onClickSectionNav (e, id) {
    e.preventDefault()
    this.currentSection = id
  }

  onRequestLoad (e) {
    this.load(this.currentSection)
  }

  onClickLink (e, href, aux) {
    e.preventDefault()
    if (aux || e.metaKey) {
      beaker.browser.openUrl(href, {setActive: true, isSidebarActive: true})
    } else {
      beaker.browser.gotoUrl(href)
    }
  }

  async onClickChangeTitle (e) {
    var title = prompt('Rename this site', this.info.title || '')
    if (title) {
      await this.updateManifest(manifest => {
        manifest.title = title
      })
      this.info.title = title
      this.requestUpdate()
    }
  }

  async onClickChangeDescription (e) {
    var description = prompt('Enter the new description', this.info.description || '')
    if (description) {
      await this.updateManifest(manifest => {
        manifest.description = description
      })
      this.info.description = description
      this.requestUpdate()
    }
  }

  onClickChangeThumb (e) {
    e.currentTarget.querySelector('input[type="file"]').click()
  }

  onChangeThumbFile (e) {
    var file = e.currentTarget.files[0]
    if (!file) return
    var fr = new FileReader()
    fr.onload = async () => {
      var archive = this.archive
      var ext = file.name.split('.').pop()
      var base64buf = fr.result.split(',').pop()
      await archive.unlink('/thumb.jpg').catch(err => {})
      await archive.unlink('/thumb.jpeg').catch(err => {})
      await archive.unlink('/thumb.png').catch(err => {})
      await archive.writeFile(`/thumb.${ext}`, base64buf, 'base64')
      this.requestUpdate()
    }
    fr.readAsDataURL(file)
  }

  async onClickSave (e) {
    await beaker.archives.add(this.origin)
    this.load()
  }

  async onClickUnsave (e) {
    if (!this.readOnly) {
      if (!confirm('Move this site to your trash?')) {
        return
      }
    }
    await beaker.archives.remove(this.origin)
    this.load()
  }

  async onClickInstall (e) {
    if (await beaker.applications.requestInstall(this.origin)) {
      this.load()
      beaker.browser.gotoUrl(this.url) // refresh page
    }
  }

  async onClickUninstall () {
    beaker.applications.uninstall(this.origin)
    this.load()
    beaker.browser.gotoUrl(this.url) // refresh page
  }

  async onClickFollow () {
    await follows.add(this.origin)
    this.load()
  }

  async onClickUnfollow () {
    await follows.remove(this.origin)
    this.load()
  }

  async onTogglePreviewMode (e) {
    if (this.readOnly) return
    
    var isPreviewModeEnabled = this.isPreviewModeEnabled
    if (isPreviewModeEnabled) {
      // prompt to resolve changes
      if (this.currentDiff && this.currentDiff.length) {
        alert('You have unpublished changes. Please commit or revert them before disabling preview mode.')
        return
      }
    }
  
    try {
      isPreviewModeEnabled = !isPreviewModeEnabled
      await beaker.archives.setUserSettings(this.origin, {previewMode: isPreviewModeEnabled})
      this.load()
    } catch (e) {
      toast.create(e.toString(), 'error', 5e3)
      console.error(e)
    }
  }

  onToggleAppPerm (e) {
    var {perm, id, enabled} = e.detail
    this.updateManifest(manifest => {
      manifest.application = manifest.application || {}
      manifest.application.permissions = manifest.application.permissions || {}
      var s = new Set(manifest.application.permissions[perm] || [])
      if (enabled) {
        s.add(id)
      } else {
        s.delete(id)
      }
      manifest.application.permissions[perm] = Array.from(s)
    })
  }

  async onFilesChanged (e) {
    // reload the diff on file-changes
    try {
      this.currentDiff = await beaker.archives.diffLocalSyncPathListing(this.archive.checkout().url, {compareContent: true, shallow: true})
    } catch (e) {
      // local path is probably missing
      this.currentDiff = null
    }
  }

  async onPublishAll (e) {
    if (!confirm('Publish all changes?')) return
    toast.create('Publishing...')
    var paths = fileDiffsToPaths(this.currentDiff)
    await beaker.archives.publishLocalSyncPathListing(this.origin, {shallow: false, paths})
    toast.create(`Published all changes`, 'success', 1e3)
  }
  
  async onRevertAll (e) {
    if (!confirm('Revert all changes?')) return
    toast.create('Reverting...')
    var paths = fileDiffsToPaths(this.currentDiff)
    await beaker.archives.revertLocalSyncPathListing(this.origin, {shallow: false, paths})
    toast.create(`Reverted all changes`, 'success', 1e3)
  }
}

customElements.define('sidebar-site-view', SidebarSiteView)

function fileDiffsToPaths (filediff) {
  return filediff.map(d => {
    if (d.type === 'dir') return d.path + '/' // indicate that this is a folder
    return d.path
  })
}
