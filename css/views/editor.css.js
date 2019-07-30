import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import toolbarCSS from '/css/toolbar.css.js'

const cssStr = css`
${buttonsCSS}
${toolbarCSS}

:host {
  display: block;
}

.empty {
  padding: 10px;
}
`
export default cssStr