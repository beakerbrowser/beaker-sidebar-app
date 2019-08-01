import {css} from '/vendor/beaker-app-stdlib/vendor/lit-element/lit-element.js'

const cssStr = css`
.field {
  margin-bottom: 14px;
}

.field.darkbg {
  padding: 7px 10px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.field label {
  display: block;
  margin-bottom: 4px;
}

.field input[type="text"] {
  width: 100%;
  box-sizing: border-box;
}

.field input[type="checkbox"] {
  height: auto;
  margin: 0 4px 0 0;
}

.field .icon {
  width: 32px;
  height: 32px;
  border-radius: 3px;
  border: 1px solid #ccc;
  object-fit: scale-down;
}

.field .thumb {
  width: 100px;
  height: 80px;
  border-radius: 3px;
  border: 1px solid #ccc;
  object-fit: cover;
}

.field-group {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 26px;
}

.field-group-title {
  display: inline-block;
  position: absolute;
  top: -8px;
  left: 10px;
  padding: 0 4px;
  background: #fff;
  font-size: 11px;
  font-weight: 600;
}

.field-group .field-group-title + .field {
  margin-top: 8px;
}

.field-group > :last-child {
  margin-bottom: 0;
}

.help {
  display: flex;
  color: gray;
  margin-top: 10px;
  align-items: baseline;
}

.help .fa-fw {
  margin-right: 5px;
}

.help a {
  color: inherit;
}
`
export default cssStr