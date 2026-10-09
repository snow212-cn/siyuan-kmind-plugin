/**
 * Apply the smallest guarded free-edition transformation to upstream 2.14.1.
 * This intentionally fails closed when upstream bundle structure changes.
 */
const LICENSE_MODULE_START = '"65d1":function(e,t,n)';
const LICENSE_MODULE_END = '},"65ee":function(e,t,n)';
const STATE_BEFORE = 'const p=Object(r["ref"])(!1),f=Object(r["ref"])(!0),m=Object(r["ref"])({}),g=Object(r["ref"])(""),v=Object(r["ref"])(!1),b=()=>{';
const STATE_AFTER = 'const p=Object(r["ref"])(!0),f=Object(r["ref"])(!1),m=Object(r["ref"])({type:"FREE",planType:"FREE"}),g=Object(r["ref"])("FREE"),v=Object(r["ref"])(!1),b=()=>{';
const CHECK_START = 'x=async(e=!1)=>{';
const CHECK_END = '},w=(e,t)=>{';
const FREE_CHECK = 'x=async()=>{p.value=!0;f.value=!1;g.value="FREE";v.value=!1;m.value={type:"FREE",planType:"FREE"};return!0},w=(e,t)=>{';
const PRO_MENU = 't.addSeparator(),t.addItem({icon:"iconKMindVip",label:Object(v["d"])("menu.kmindPro"),click:()=>{this.openConfigDialog(Object(v["d"])("kmindLicenseInfo"),"KmindVip")}}),this.isMobile?';

function replaceExactlyOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected exactly one matching upstream anchor`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

export function patchFreeEdition(source) {
  if (typeof source !== 'string' || source.length < 1_000_000) {
    throw new Error('Unexpected index.js input; refusing to patch an unknown file');
  }
  const moduleStart = source.indexOf(LICENSE_MODULE_START);
  const moduleEnd = source.indexOf(LICENSE_MODULE_END, moduleStart + LICENSE_MODULE_START.length);
  if (moduleStart < 0 || moduleEnd < 0 || source.indexOf(LICENSE_MODULE_START, moduleStart + 1) >= 0) {
    throw new Error('Unable to identify the unique KMind license module; refusing to patch');
  }

  let module = source.slice(moduleStart, moduleEnd);
  module = replaceExactlyOnce(module, STATE_BEFORE, STATE_AFTER, 'license state');

  const checkStart = module.indexOf(CHECK_START);
  const checkEnd = module.indexOf(CHECK_END, checkStart + CHECK_START.length);
  if (checkStart < 0 || checkEnd < 0 || module.indexOf(CHECK_START, checkStart + 1) >= 0) {
    throw new Error('Unable to identify the unique license-check function; refusing to patch');
  }
  module = module.slice(0, checkStart) + FREE_CHECK + module.slice(checkEnd + CHECK_END.length);

  source = source.slice(0, moduleStart) + module + source.slice(moduleEnd);
  source = replaceExactlyOnce(source, PRO_MENU, 'this.isMobile?', 'Pro menu item');

  return {
    source,
    report: {
      licenseModule: '65d1',
      licenseState: 'free-active-on-startup',
      licenseCheck: 'always-success-without-network-validation',
      trialState: 'disabled',
      proMenuItem: 'removed',
      guardedAnchors: 3,
    },
  };
}
