import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { classMap } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/class-map.js'
import * as toast from '/vendor/beaker-app-stdlib/js/com/toast.js'
import * as contextMenu from '/vendor/beaker-app-stdlib/js/com/context-menu.js'
import sidebarAppCSS from '../css/main.css.js'
import '/vendor/beaker-app-stdlib/js/com/comments/thread.js'
import './views/site.js'
import './views/editor.js'
import './views/terminal.js'

const profiles = navigator.importSystemAPI('unwalled-garden-profiles')
const follows = navigator.importSystemAPI('unwalled-garden-follows')
const posts = navigator.importSystemAPI('unwalled-garden-posts')
const comments = navigator.importSystemAPI('unwalled-garden-comments')
const reactions = navigator.importSystemAPI('unwalled-garden-reactions')

class SidebarApp extends LitElement {
  static get properties () {
    return {
      currentUrl: {type: String},
      view: {type: String},
      comments: {type: Array},
      expandedPost: {type: Object}
    }
  }

  constructor () {
    super()

    this.isLoading = true
    this.currentUrl = ''
    this.view = 'site'
    this.user = null
    this.followedUsers = []
    this.comments = []
    this.commentCount = 0
    this.previewMode = false
    this.isViewingPreview = false

    document.body.addEventListener('contextmenu', e => {
      e.preventDefault()
    })

    // export an API which is called by the browser
    window.sidebarGetCurrentApp = () => this.view
    window.sidebarLoad = (url, app) => {
      this.currentUrl = url
      this.setView(app || this.view || 'site')
      this.load()
    }
    window.sidebarShow = () => {
      // TODO anything needed on open
    }
  }

  get feedAuthors () {
    if (!this.user) return []
    return [this.user.url].concat(this.followedUsers)
  }

  async load () {
    this.isLoading = true
    if (!this.user) {
      this.user = await profiles.me()
    }
    this.followedUsers = (await follows.list({filters: {authors: this.user.url}})).map(({topic}) => topic.url)

    var cs = await comments.thread(this.currentUrl.replace('+preview', ''), {filters: {authors: this.feedAuthors}})
    this.commentCount = countComments(cs)
    await loadCommentReactions(this.feedAuthors, cs)
    this.comments = cs

    this.previewMode = false
    this.isViewingPreview = false
    if (this.currentUrl.startsWith('dat://')) {
      try {
        let info = await (new DatArchive(this.currentUrl)).getInfo()
        this.previewMode = info.userSettings.previewMode
        this.isViewingPreview = (new URL(this.currentUrl)).hostname.includes('+preview')
      } catch (e) {
        // ignore
      }
    }
    
    this.isLoading = false
    this.requestUpdate()
  }

  setView (id) {
    this.view = id
    if (id === 'editor') {
      document.querySelector('#monaco-editor').style.display = 'block'
    } else {
      document.querySelector('#monaco-editor').style.display = 'none'
    }
    document.querySelector('#monaco-diff-editor').style.display = 'none'
  }

  // rendering
  // =

  render () {
    if (!this.user) return html`<div></div>`
    const navItem = (id, label) => html`
      <a href="#" class="${classMap({current: id === this.view})}" @click=${e => this.onClickNavItem(e, id)}>${label}</a>
    `
    return html`
      <link rel="stylesheet" href="/vendor/beaker-app-stdlib/css/fontawesome.css">
      <div class="nav">
        ${navItem('site', html`<span class="fas fa-fw fa-info"></span> About`)}
        ${navItem('editor', html`<span class="far fa-fw fa-edit"></span> Editor`)}
        ${navItem('comments', html`<span class="far fa-fw fa-comment-alt"></span> Comments (${this.commentCount})`)}
        ${navItem('terminal', html`<span class="fas fa-fw fa-terminal"></span> Terminal`)}
        <span style="flex: 1"></span>
        ${this.renderPreviewModeSelector()}
        <a href="#" @click=${this.onClickClose}><span class="fas fa-fw fa-times"></span></a>
      </div>
      ${this.renderView()}
    `
  }

  renderPreviewModeSelector () {
    if (this.previewMode) {
      return html`
        <a href="#" @click=${this.onClickPreviewModeSelector}>
          Viewing: ${this.isViewingPreview ? 'Preview' : 'Latest'} <span class="fas fa-caret-down"></span>
        </a>
      `
    }
  }

  renderView () {
    if (this.view === 'site') {
      return html`
        <sidebar-site-view
          url=${this.currentUrl}
          .user=${this.user}
          .feedAuthors=${this.feedAuthors}
        ></sidebar-site-view>
      `
    }
    if (this.view === 'editor') {
      return html`
        <sidebar-editor-view
          url=${this.currentUrl}
        ></sidebar-editor-view>
      `
    }
    if (this.view === 'comments') {
      return html`
        <beaker-comments-thread
          .comments=${this.comments}
          topic-url="${this.currentUrl}"
          user-url="${this.user.url}"
          @add-reaction=${this.onAddReaction}
          @delete-reaction=${this.onDeleteReaction}
          @submit-comment=${this.onSubmitComment}
          @delete-comment=${this.onDeleteComment}
        >
        </beaker-comments-thread>
      `
    }
    if (this.view === 'terminal') {
      return html`
        <web-term
          url=${this.currentUrl}
        ></web-term>
      `
    }
    return html`todo`
  }

  // events
  // =

  onClickNavItem (e, id) {
    e.preventDefault()
    e.stopPropagation()
    this.setView(id)
  }

  onClickPreviewModeSelector (e) {
    e.preventDefault()
    e.stopPropagation()

    const set = (v) => {
      var urlp = new URL(this.currentUrl)
      var parts = urlp.hostname.split('+')
      urlp.hostname = `${parts[0]}${v}`
      beaker.browser.gotoUrl(urlp.toString())
    }

    var rects = e.currentTarget.getClientRects()[0]
    contextMenu.create({
      x: rects.right,
      y: rects.bottom + 5,
      right: true,
      roomy: true,
      withTriangle: true,
      fontAwesomeCSSUrl: '/vendor/beaker-app-stdlib/css/fontawesome.css',
      items: [
        {
          icon: 'fas fa-fw fa-globe-americas',
          label: 'Go to Latest',
          click: () => set('')
        },
        {
          icon: 'fas fa-fw fa-laptop',
          label: 'Go to Preview',
          click: () => set('+preview')
        }
      ]
    })
  }

  onClickClose () {
    beaker.browser.toggleSidebar()
  }

  onRequestView (e) {
    this.setView(e.detail.view)
  }

  async onAddReaction (e) {
    await reactions.add(e.detail.topic, e.detail.emoji)
  }

  async onDeleteReaction (e) {
    await reactions.remove(e.detail.topic, e.detail.emoji)
  }

  async onSubmitComment (e) {
    // add the new comment
    try {
      var {topic, replyTo, body} = e.detail
      await comments.add(topic, {replyTo, body})
    } catch (e) {
      alert('Something went wrong. Please let the Beaker team know! (An error is logged in the console.)')
      console.error('Failed to add comment')
      console.error(e)
      return
    }

    // reload the comments
    await this.load()
  }

  async onDeleteComment (e) {
    let comment = e.detail.comment
    
    // delete the comment
    try {
      await posts.remove(comment.url)
    } catch (e) {
      alert('Something went wrong. Please let the Beaker team know! (An error is logged in the console.)')
      console.error('Failed to delete comment')
      console.error(e)
      return
    }
    toast.create('Comment deleted')

    // reload the comments
    await this.load()
  }
}
SidebarApp.styles = sidebarAppCSS

customElements.define('sidebar-app', SidebarApp)

function countComments (comments) {
  return comments.reduce((acc, comment) => acc + 1 + (comment.replies ? countComments(comment.replies) : 0), 0)
}

async function loadCommentReactions (authors, comments) {
  await Promise.all(comments.map(async (comment) => {
    comment.reactions = await reactions.tabulate(comment.url, {filters: {authors}})
    if (comment.replies) await loadCommentReactions(authors, comment.replies)
  }))
}