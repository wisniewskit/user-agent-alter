/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let CurrentPlatforms;
let CurrentURL;
let CurrentContainer = {};

const PlatformSelectForTab = browser.i18n.getMessage("platformSelectForTab");
const PlatformUnset = browser.i18n.getMessage("platformUnset");
const DrillDownArrow = browser.i18n.getMessage("drillDownArrow");

let PlatformOptions = [];

browser.runtime.onMessage.addListener(redraw);
browser.runtime.sendMessage("getState", redrawList);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", handleClick);
});

function handleClick(e) {
  let action = e.target.getAttribute("data-action");
  if (action) {
    if (action === "cancel") {
      goBackToList();
    } else {
      let details = document.querySelector(".details");
      let platform = details.getAttribute("data-for-list-item");
      changeActivePlatform(platform, action);
    }
    return;
  }

  let li = e.target.closest("li");
  if (li) {
    let platform = li.getAttribute("data-name");

    if (e.target.nodeName === "BUTTON") {
      let action = li.getAttribute("data-action");
      if (action && action.startsWith("unset-")) {
        changeActivePlatform(undefined, action.substr(6), false).then(() => {
          li.parentNode.previousSibling.remove();
          li.parentNode.remove();
        })
      } else {
        drillDownIntoDetails(platform);
      }
      return;
    }

    changeActivePlatform(platform, "tab");
  }
}

function getTLD(host) {
  if (!host) return;
  return host.split(".").slice(-2).join(".");
}

function createLIForPlatform(platform, detailsButtonText) {
  let li = document.createElement("li");

  let img = document.createElement("img");
  img.src = browser.runtime.getURL(platform.icon);
  li.appendChild(img);

  let label = document.createElement("p");
  label.appendChild(document.createTextNode(platform.label));
  li.appendChild(label);

  let details = document.createElement("button");
  details.appendChild(document.createTextNode(detailsButtonText));
  li.appendChild(details);

  return li;
}

function addUnsetEntryTo(frag, platform, headerText, action) {
  let h1 = document.createElement("h1");
  h1.appendChild(document.createTextNode(headerText));
  frag.appendChild(h1);

  let ol = document.createElement("ol");
  frag.appendChild(ol);

  let li = createLIForPlatform(platform, PlatformUnset);
  li.setAttribute("data-action", action);
  ol.appendChild(li);
}

function determinePlatformOptions(data) {
  PlatformOptions = [{label: browser.i18n.getMessage("platformOptionTab"), action: "tab"}];

  let host = new URL(data.url).host;
  let tld = getTLD(host);
  if (host && host !== tld) {
    PlatformOptions.push({label: browser.i18n.getMessage("platformOptionSubdomain", host), action: "subdomain"});
  }
  if (tld) {
    PlatformOptions.push({label: browser.i18n.getMessage("platformOptionDomain", tld), action: "domain"});
  }

  if (data.container.cookieStoreId) {
    PlatformOptions.push({label: browser.i18n.getMessage("platformOptionContainer", data.container.name), action: "container"});
  }

  if (!IsAndroid) { // There is no point to showing the "window" option on Fennec.
    PlatformOptions.push({label: browser.i18n.getMessage("platformOptionWindow"), action: "window"});
  }

  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionGlobal"), action: "global"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionCancel"), action: "cancel"});
}

function redrawList(data) {
  let platforms = CurrentPlatforms = data.platforms;

  determinePlatformOptions(data);

  CurrentURL = data.url;
  CurrentContainer = data.container;

  let list = document.querySelector(".list");
  let frag = document.createDocumentFragment();

  for (let {label, action} of PlatformOptions) {
    if (data.overrides[action]) {
      addUnsetEntryTo(frag, platforms[data.overrides[action]], label, `unset-${action}`);
    }
  }

  let h1 = document.createElement("h1");
  h1.appendChild(document.createTextNode(PlatformSelectForTab));
  frag.appendChild(h1);

  let ol = document.createElement("ol");
  frag.appendChild(ol);

  for (let [name, platform] of Object.entries(platforms)) {
    if (name === "default") {
      continue;
    }

    let li = createLIForPlatform(platform, DrillDownArrow);
    li.setAttribute("data-name", name);
    ol.appendChild(li);
  }

  list.innerHTML = "";
  list.appendChild(frag);
}

function redrawDetails(platform) {
  let details = document.querySelector(".details");
  details.setAttribute("data-for-list-item", platform);

  let frag = document.createDocumentFragment();
  let platformDetails = CurrentPlatforms[platform];

  let message = browser.i18n.getMessage("platformSelectDetails",
                                        [platformDetails.label]);
  let label = document.createElement("p");
  label.appendChild(document.createTextNode(message));
  frag.appendChild(label);

  for (let {label, action} of PlatformOptions) {
    let opt = document.createElement("button");
    opt.appendChild(document.createTextNode(label));
    opt.setAttribute("data-action", action);
    frag.appendChild(opt);
  }

  details.innerHTML = "";
  details.appendChild(frag);
}

function changeActivePlatform(platform, scope, closePopup = true) {
  return new Promise(resolve => {
    browser.runtime.sendMessage({platform, scope, closePopup}, () => {
      if (closePopup && !IsAndroid) {
        this.close();
      }
      resolve();
    });
  });
}
