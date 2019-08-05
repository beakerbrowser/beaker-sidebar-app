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

.revision-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-top: 1px;
  margin-left: 14px;
}

.revision-indicator.add { background: #44c35a; }
.revision-indicator.mod { background: #fac800; }
.revision-indicator.del { background: #d93229; }

sidebar-files {
  position: fixed;
  left: 1px;
  top: 62px;
  bottom: 32px;
  width: 284px;
  z-index: 1;
  background: #fff;
  border-right: 1px solid #ccc;
}

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  border-top: 1px solid #ccc;
  width: 100%;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  font-family:  Consolas, 'Lucida Console', Monaco, monospace;;
}
`
export default cssStr