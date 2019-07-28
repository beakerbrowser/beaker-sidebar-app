import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'

const cssStr = css`
${buttonsCSS}

:host {
  display: block;
}

.toolbar {
  display: flex;
  align-items: center;
  height: 30px;
  background: #f7f7f7;
  border-bottom: 1px solid #ccc;
}

.toolbar > * {
  margin-left: 5px;
}

.toolbar > :last-child {
  margin-right: 5px;
}

.toolbar button {
  padding: 3px 8px;
}

.toolbar .text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar .spacer {
  flex: 1;
}

@media (max-width: 540px) {
  .toolbar .btn-label {
    display: none;
  }
}

.empty {
  padding: 10px;
}
`
export default cssStr