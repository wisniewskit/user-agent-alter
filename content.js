/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function selectPlatform(spec) {
console.log(spec)
  window.eval(`(function(spec) {
    for (let override of spec.overrides) {
      let [parentName, name] = override.name.split(".");
      let parentObj = eval(parentName);
      Object.defineProperty(parentObj, name, {
        configurable: true,
        get: () => override.value,
      });
    }
  }(${JSON.stringify(spec)}));`);
}
