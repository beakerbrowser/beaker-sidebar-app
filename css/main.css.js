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
  color: #fff;
  border-radius: 3px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
`
export default cssStr