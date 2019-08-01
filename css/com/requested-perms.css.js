import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import formCSS from '/css/form.css.js'

const cssStr = css`
${formCSS}
${buttonsCSS}

p {
  margin: 5px 0;
}

a {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}

.field-group {
  padding-top: 15px;
  padding-bottom: 15px;
}

.field-group > div {
  margin-bottom: 5px;
}
`
export default cssStr