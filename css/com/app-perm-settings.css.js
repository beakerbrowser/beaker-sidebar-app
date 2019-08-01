import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import formCSS from '/css/form.css.js'

const cssStr = css`
${formCSS}
${buttonsCSS}

.app-perms {
  padding-top: 15px;
  padding-bottom: 15px;
}

.app-perms > div {
  margin-bottom: 5px;
}

.perm-label-fixedwith {
  display: inline-block;
  text-align: left;
  width: 90px;
}
`
export default cssStr