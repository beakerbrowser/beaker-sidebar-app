import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import toolbarCSS from '/css/toolbar.css.js'
import tooltipCSS from '/vendor/beaker-app-stdlib/css/tooltip.css.js'

const cssStr = css`
${buttonsCSS}
${toolbarCSS}
${tooltipCSS}

:host {
  display: block;
}

.empty {
  padding: 10px;
}

.divider {
  border-left: 1px solid #ddd;
  height: 21px;
}

files-explorer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  z-index: 1;
  background: #fafafa;
  border-right: 1px solid #ccc;
}

:host(.files-open) {
  padding-left: 200px;
}
`
export default cssStr