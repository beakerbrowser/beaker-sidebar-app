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
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
}

.primary-action .btns {
  display: flex;
  align-items: center;
  padding: 5px 6px;
}

.primary-action .btns button {
  padding: 5px 6px;
  margin-right: 4px;
}

.primary-action .btns button.light-pressed {
  background: #eee;
}

.primary-action .btns button.light-pressed:hover {
  background: #f5f5f5;
}

.primary-action .nav {
  display: flex;
}

.primary-action .nav a {
  text-align: center;
  font-size: 11px;
  border-left: 1px solid #ccc;
  padding: 10px 14px;
  cursor: pointer;
}

.primary-action .nav a.active {
  border-bottom: 2px solid #ddd;
}

.primary-action .nav a:hover {
  background: rgb(245, 245, 245);
}

.inner {
  height: inherit;
  overflow-y: auto;
  padding: 10px 10px 15px;
  border-top: 1px solid #ccc;
  background: #f5f5f5;
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

sidebar-files {
  border: 1px solid #ccc;
  border-radius: 3px;
  padding-bottom: 2px;
  overflow: hidden;
  background: #fff;
}

.columns-layout {
  column-count: 2;
  column-gap: 10px;
}

.columns-layout > * {
  display: block;
  page-break-inside: avoid;
  break-inside: avoid;
}

@media (max-width: 600px) {
  .btn-label {
    display: none;
  }

  .columns-layout {
    column-count: 1;
  }
}
`
export default cssStr