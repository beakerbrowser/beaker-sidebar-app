import { LitElement, html } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import { classMap } from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-html/directives/class-map.js'
import { profiles, follows, posts, comments, reactions } from 'dat://unwalled.garden/index.js'
import * as toast from '/vendor/beaker-app-stdlib/js/com/toast.js'
import sidebarAppCSS from '../css/main.css.js'
import '/vendor/beaker-app-stdlib/js/com/comments/thread.js'
import './views/editor.js'

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

    this.currentUrl = ''
    this.view = 'editor'
    this.user = null
    this.followedUsers = []
    this.comments = []
    this.commentCount = 0

    // export an API which is called by the browser
    window.sidebarGetCurrentApp = () => this.view
    window.sidebarLoad = (url, app) => {
      this.currentUrl = url
      this.setView(app || this.view || 'editor')
      this.load()
    }
    window.sidebarShow = () => {
      if (this.view === 'scratchpad') {
        // fetch latest on scratchpad to keep tabs in sync
        this.shadowRoot.querySelector('textarea').value = localStorage.scratchpad
      }
    }
  }

  get feedAuthors () {
    if (!this.user) return []
    return [this.user.url].concat(this.followedUsers)
  }

  async load () {
    if (!this.user) {
      this.user = await profiles.me()
    }
    this.followedUsers = (await follows.list({filters: {authors: this.user.url}})).map(({topic}) => topic.url)

    var cs = await comments.thread(this.currentUrl, {filters: {authors: this.feedAuthors}})
    this.commentCount = countComments(cs)
    await loadCommentReactions(this.feedAuthors, cs)
    this.comments = cs
    
    this.requestUpdate()
  }

  setView (id) {
    this.view = id
    if (id === 'editor') {
      document.querySelector('#monaco-editor').style.display = 'block'
    } else {
      document.querySelector('#monaco-editor').style.display = 'none'
    }
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
        ${navItem('editor', `Editor`)}
        ${navItem('comments', `Comments (${this.commentCount})`)}
        ${navItem('scratchpad', `Scratchpad`)}
        <a href="#" @click=${this.onClickClose} style="margin-left: auto"><span class="fas fa-fw fa-times"></span></a>
      </div>
      ${this.renderView()}
    `
  }

  renderView () {
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
    if (this.view === 'scratchpad') {
      return html`
        <div class="scratchpad">
          <textarea
            placeholder="Anything you type here will saved automatically."
            @keyup=${this.onKeyupScratchpad}
          >${localStorage.scratchpad}</textarea>
        </div>
      `
    }
  }

  // events
  // =

  onClickNavItem (e, id) {
    e.preventDefault()
    e.stopPropagation()
    this.setView(id)
  }

  onClickClose () {
    beaker.browser.toggleSidebar()
  }

  onKeyupScratchpad (e) {
    localStorage.scratchpad = e.currentTarget.value
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