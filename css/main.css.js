import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'

const cssStr = css`
:host {
  display: block;
}

.nav {
  display: flex;
  background: #f7f7f7;
  border-bottom: 1px solid #ccc;
}

.nav a {
  padding: 8px 6px;
  margin: 0 4px;
  text-decoration: none;
  color: inherit;
}

.nav a:hover {
  background: #eee;
}

.nav a.current {
  border-bottom: 1px solid #0f8aea;
  padding-bottom: 6px;
}

beaker-comments-thread {
  border-color: transparent;
  padding: 10px 10px 200px;

  --body-font-size: 13px;
  --header-font-size: 11px;
  --title-font-size: 12px;
  --footer-font-size: 11px;
  --replies-left-margin: 0;
  --comment-top-margin: 10px;
  --comment-left-margin: 8px;
  --composer-padding: 10px 14px;
}

.scratchpad textarea {
  width: calc(100vw - 12px);
  height: calc(100vh - 118px);
  box-sizing: border-box;
  padding: 8px 10px;
  margin: 5px;
  resize: none;
  outline: 0;
  border: 0;
  font-size: 12px;
}
`
export default cssStr