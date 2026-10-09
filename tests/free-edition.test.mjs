import test from 'node:test';
import assert from 'node:assert/strict';
import { patchFreeEdition } from '../scripts/free-edition.mjs';

const state = 'const p=Object(r["ref"])(!1),f=Object(r["ref"])(!0),m=Object(r["ref"])({}),g=Object(r["ref"])(""),v=Object(r["ref"])(!1),b=()=>{';
const checker = 'x=async(e=!1)=>{if(e)return!1;return!1},w=(e,t)=>{return e}';
const menu = 't.addSeparator(),t.addItem({icon:"iconKMindVip",label:Object(v["d"])("menu.kmindPro"),click:()=>{this.openConfigDialog(Object(v["d"])("kmindLicenseInfo"),"KmindVip")}}),this.isMobile?';
const makeFixture = ({ withState = true, withChecker = true, withMenu = true } = {}) =>
  ' '.repeat(1_000_001) + '"65d1":function(e,t,n){' + (withState ? state : '') + (withChecker ? checker : '') + '},"65ee":function(e,t,n){' + (withMenu ? menu : '');

test('transforms the pinned bundle markers and removes Pro menu entry', () => {
  const result = patchFreeEdition(makeFixture()).source;
  assert.match(result, /const p=Object\(r\["ref"\]\)\(!0\)/);
  assert.match(result, /g\.value="FREE"/);
  assert.match(result, /x=async\(\)=>\{p\.value=!0;f\.value=!1;g\.value="FREE";v\.value=!1;m\.value=\{type:"FREE",planType:"FREE"\};return!0\}/);
  assert.doesNotMatch(result, /icon:"iconKMindVip",label:Object\(v\["d"\]\)\("menu\.kmindPro"\)/);
});

test('fails closed if a target marker is missing', () => {
  assert.throws(() => patchFreeEdition(makeFixture({ withState: false })), /license state/);
  assert.throws(() => patchFreeEdition(makeFixture({ withMenu: false })), /Pro menu item/);
});

test('fails closed on duplicate Pro menu anchors', () => {
  assert.throws(() => patchFreeEdition(`${makeFixture()}${menu}`), /Pro menu item/);
});
