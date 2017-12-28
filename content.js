/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function selectPlatform(spec) {
  window.eval(`(function(spec) {
    for (let override of spec.overrides) {
      let [parentName, name] = override.name.split(".");
      let parentObj = eval(parentName);
      Object.defineProperty(parentObj, name, {
        configurable: true,
        get: () => override.value,
      });
    }

    if (spec.geolocation) {
      let id = 0;
      let geolocation = {
        coords: Object.assign({accuracy: 1}, spec.geolocation),
      };
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        get: () => { return {
          getCurrentPosition: success => {
            success(geolocation);
          },
          clearWatch: () => {},
          watchPosition: success => {
            setTimeout(() => success(geolocation), 1);
            return ++id;
          },
        }; },
      });
    }
  }(${JSON.stringify(spec)}));`);
}
