import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import formCSS from '../form.css.js'

const cssStr = css`
${buttonsCSS}
${formCSS}

:host {
  display: block;
}

.content {
  padding: 5px 5px 10px;
}

.footer {
}

a:hover {
  cursor: pointer;
  text-decoration: underline;
}

.revision-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: -.4px;
  margin-left: -2px;
  margin-left: 4px;
  margin-right: 4px;
}

.revision-indicator.add { background: #44c35a; }
.revision-indicator.mod { background: #fac800; }
.revision-indicator.del { background: #d93229; }

a.add { color: #116520; }
a.mod { color: #9a7c05; }
a.del { color: #86120c; }
`
export default cssStr