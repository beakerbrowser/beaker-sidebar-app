import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'
import inputsCSS from '/vendor/beaker-app-stdlib/css/inputs.css.js'
import tooltipCSS from '/vendor/beaker-app-stdlib/css/tooltip.css.js'
import formCSS from '/css/form.css.js'

const cssStr = css`
${buttonsCSS}
${inputsCSS}
${tooltipCSS}
${formCSS}

:host {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 31px);
}

h1,
h2,
h3,
h4 {
  margin: 0;
  font-weight: 500;
}

p {
  margin: 5px 0;
}

p.warning {
  margin: 5px 0 10px;
  color: #cc1010;
}

hr {
  margin: 0;
  border: 0;
  border-top: 1px solid #ddd;
}

.primary-action {
  display: flex;
  align-items: center;
  margin-bottom: 26px;
}

.primary-action button.transparent {
  padding: 5px 6px;
}

.inner {
  display: flex;
  flex: 1;
  overflow-y: auto;
}

.inner .nav {
  flex: 0 0 110px;
  background: #f7f7f7;
  border-top: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

.inner .nav a {
  display: block;
  padding: 8px 8px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
}

.inner .nav a:hover {
  background: #eee;
}

.inner .nav a.current {
  background: #fff;
  position: relative;
}

.section {
  flex: 1;
  padding: 5px 15px 15px;
}

.site-info {
  display: flex;
  align-items: flex-start;
  padding: 10px 10px 15px;
}

.site-info .thumb {
  width: 100px;
  height: 80px;
  margin-right: 15px;
  border-radius: 3px;
  border: 1px solid #ccc;
  background: #fff;
  object-fit: cover;
}

.site-info .details {
  flex: 1;
}

.site-info .editable:hover {
  cursor: pointer;
  text-decoration: underline;
}

.site-info .editable-thumb {
  width: 100px;
  height: 80px;
  margin-right: 15px;
}

.site-info .editable-thumb input {
  display: none;
}

.site-info .desc .editable:before {
  top: 25px;
}
.site-info .desc .editable:after {
  top: 20px;
}

.site-info .editable-thumb:before {
  top: 90px;
}
.site-info .editable-thumb:after {
  top: 85px;
}

.site-info .right {
  text-align: right;
}

.followers {
  display: flex;
  flex-wrap: wrap;
  margin: 5px;
}

.followers a {
  display: block;
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.followers img {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 600px) {
  .btn-label {
    display: none;
  }
}
`
export default cssStr