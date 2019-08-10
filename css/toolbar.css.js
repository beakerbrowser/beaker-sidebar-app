import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'

const cssStr = css`
.toolbar {
  display: flex;
  align-items: center;
  height: 30px;
  background: #fff;
  border-bottom: 1px solid #ccc;
}

.toolbar > * {
  margin-left: 5px;
}

.toolbar > :last-child {
  margin-right: 5px;
}

.toolbar button {
  padding: 3px 8px;
}

.toolbar .text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar .spacer {
  flex: 1;
}

@media (max-width: 600px) {
  .toolbar .btn-label {
    display: none;
  }
}
@media (min-width: 601px) {
  .tooltip-onsmall[data-tooltip]:hover:after,
  .tooltip-onsmall[data-tooltip]:hover:before {
    display: none;
  }
}
`
export default cssStr