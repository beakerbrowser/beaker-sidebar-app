import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'

const cssStr = css`
.toolbar {
  display: flex;
  align-items: center;
  height: 26px;
  background: #f5f5f5;
  border-bottom: 1px solid #bbb;
}

.toolbar > * {
  margin-left: 5px;
}

.toolbar > :last-child {
  margin-right: 5px;
}

.toolbar button {
  padding: 0 8px;
  height: 26px;
  line-height: 24px;
  color: #555;
  border-radius: 0;
}

.toolbar button:hover {
  background: #e5e5e5;
}

.toolbar button .fa-fw {
  font-size: 10px;
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