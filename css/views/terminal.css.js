import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'

const cssStr = css`
:host {
  --font: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;

  display: block;
  box-sizing: border-box;
  font-family: var(--font);
  padding: 1rem;
  height: calc(100vh - 31px);
  overflow-y: auto;
}

a {
  text-decoration: none;
  cursor: pointer;
}

a:hover {
  text-decoration: underline;
}

img,
video,
audio {
  max-width: 100%;
}

.output .entry {
  margin-bottom: 1rem;
}

.output .entry .entry-header {
  line-height: 1;
  margin-bottom: 2px;
  font-weight: bold;
}

.output .entry .entry-content {
  white-space: pre;
}

.output .error {
  white-space: normal;
  color: red;
}

.output .error-stack {
  padding: 1rem;
  background: pink;
  font-weight: bold;
  font-size: 12px;
}

.prompt {
  display: flex;
  line-height: 1;
  font-weight: bold;
}

.prompt input {
  flex: 1;
  position: relative;
  background: transparent;
  top: -1px;
  left: -2px;
  line-height: 1;
  font-size: inherit;
  font-weight: inherit;
  padding: 0 0 0 10px;
  outline: 0;
  border: 0;
  font-family: var(--font);
}
`
export default cssStr