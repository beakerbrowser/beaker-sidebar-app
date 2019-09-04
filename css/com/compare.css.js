import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'
import typographyCSS from '/vendor/beaker-app-stdlib/css/typography.css.js'
import buttonsCSS from '/vendor/beaker-app-stdlib/css/buttons2.css.js'

const cssStr = css`
${typographyCSS}
${buttonsCSS}

:host {
  display: block;
}

.header {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.header a {
  text-decoration: none;
  color: var(--blue);
}

.header a:hover {
  text-decoration: underline;
}

sidebar-compare-diff-item .item {
  display: flex;
  align-items: center;
  padding: 8px;
  user-select: none;
}

sidebar-compare-diff-item .item.clickable {
  cursor: pointer;
}

sidebar-compare-diff-item .item.add {
  color: #116520;
  background: rgb(239, 255, 241);
  border-bottom: 1px solid rgb(208, 218, 209);
}

sidebar-compare-diff-item .item.mod {
  color: rgb(115, 95, 17);
  background: rgb(255, 250, 230);
  border-bottom: 1px solid rgb(226, 211, 151);
}

sidebar-compare-diff-item .item.del {
  color: #86120c;
  background: rgb(253, 234, 233);
  border-bottom: 1px solid rgb(218, 199, 198);
}

sidebar-compare-diff-item button.transparent {
  color: rgba(0,0,0,.75);
}

sidebar-compare-diff-item button.transparent:hover {
  background: rgba(0,0,0,.05);
}

.revision {
  width: 35px;
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

sidebar-compare-diff-item-content .container {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 5px;
  padding: 5px;
  border-bottom: 1px solid #ccc;
}

sidebar-compare-diff-item-content .container.split {
  grid-template-columns: 1fr 1fr;
}

sidebar-compare-diff-item-content .action {
  font-size: 80%;
  color: gray;
  margin-bottom: 5px;
}

sidebar-compare-diff-item-content .text {
  font-family: var(--code-font);
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 3px;
  white-space: pre;
  overflow-x: auto;
}

sidebar-compare-diff-item-content img,
sidebar-compare-diff-item-content video,
sidebar-compare-diff-item-content audio {
  max-width: 100%;
}
`
export default cssStr