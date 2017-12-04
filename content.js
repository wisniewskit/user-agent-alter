/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function selectPlatform(name) {
  let spec = PLATFORMS[name];
  if (!spec) {
    return;
  }
  window.eval(`(function(spec) {
    for (let [parentName, overrides] of Object.entries(spec.overrides)) {
      let parentObj = eval(parentName);
      for (let [name, value] of Object.entries(overrides)) {
        Object.defineProperty(parentObj, name, {
          configurable: true,
          get: () => value,
        });
      }
    }
  }(${JSON.stringify(spec)}));`);
}
