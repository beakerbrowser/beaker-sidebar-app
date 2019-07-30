import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import toolbarCSS from '/css/toolbar.css.js'

const cssStr = css`
${buttonsCSS}
${toolbarCSS}

:host {
  display: block;
}

.listing {
  height: calc(100vh - 63px);
}

.listing .item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
}

.listing .item:hover {
  background: #fafafa;
}

.listing .item .icon {
  padding-right: 6px;
}

.listing .item .name {
  flex: 1;
}
`
export default cssStr