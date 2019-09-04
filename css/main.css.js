import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'

const cssStr = css`
:host {
  display: block;
}

.close-btn {
  position: absolute;
  top: 1px;
  right: 2px;
  padding: 5px;
  color: #333;
  border-radius: 3px;
}

.close-btn:hover {
  background: #eee;
}
`
export default cssStr