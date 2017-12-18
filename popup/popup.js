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

function showCopiedTooltip(y) {
  let tooltip = document.getElementById("copiedToClipboard");
  if (!tooltip) {
    tooltip = document.createElement("h1");
    tooltip.id = "copiedToClipboard";
    const text = browser.i18n.getMessage("copiedToClipboard");
    tooltip.appendChild(document.createTextNode(text));
  }
  tooltip.remove();
  document.body.appendChild(tooltip);
  tooltip.style.top = y + "px";
  tooltip.classList.add("fadeInAndOut");
}

function simulateLongTapAsRightClick() {
  let touchStart;
  let longTapDelay = 1000;;
  document.body.addEventListener("touchstart", e => {
    touchStart = touchStart || new Date();
  });
  document.body.addEventListener("touchmove", e => {
    touchStart = null;
  });
  document.body.addEventListener("touchend", e => {
    if (!touchStart) {
      return;
    }
    if (new Date() - touchStart >= longTapDelay) {
      e.button = 2;
      handleClick(e);
    }
    touchStart = null;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  simulateLongTapAsRightClick();
  document.body.addEventListener("click", handleClick);
  document.body.addEventListener("contextmenu", handleClick);
});

function copyUAToClipboard(platformName, y) {
  let helper = document.getElementById("clipboardHelper");
  helper.value = CurrentPlatforms[platformName].overrides.navigator.userAgent;
  helper.select();
  document.execCommand("Copy");
  helper.blur();
  showCopiedTooltip(y);
}

function handleClick(e) {
  if (e.button === 2) {
    let li = e.target.closest("li");
    if (li) {
      let platformName = li.getAttribute("data-name");
      if (platformName) {
        copyUAToClipboard(platformName, e.clientY);
        e.preventDefault();
      }
    }
    return;
  }

  let action = e.target.getAttribute("data-action");
  if (action) {
    if (action === "back") {
      goBackToList();
    } else if (action === "expand") {
      let bd = document.querySelector(".breakdown");
      bd.style.maxHeight = "1000em";
      bd.addEventListener("transitionend", () => {
        bd.style.maxHeight = "auto";
      }, { once: true });
      e.target.style.display = "none";
      document.querySelector("[data-action='collapse']").style.display = "";
    } else if (action === "collapse") {
      document.querySelector(".breakdown").style.maxHeight = "0";
      e.target.style.display = "none";
      document.querySelector("[data-action='expand']").style.display = "";
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

    if (platform) {
      changeActivePlatform(platform, "tab");
    }
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

  PlatformOptions.push({label: "separator"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionExpand"), action: "expand"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionCollapse"), action: "collapse"});

  PlatformOptions.push({label: "separator"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionBack"), action: "back"});
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

function addDetailsHeader(parent, messageName, messageArgs) {
  let label = document.createElement("h1");
  let message = browser.i18n.getMessage(messageName, messageArgs) || messageName;
  label.appendChild(document.createTextNode(message));
  parent.appendChild(label);
  return label;
}

function addInputPairLI(parent, name, value, readonly=true) {
  let li = document.createElement("li");
  parent.appendChild(li);

  for (let label of [name, value]) {
    let i = document.createElement("input");
    i.type = "text";
    i.value = label || "";
    i.placeholder = "undefined";
    if (readonly) {
      i.setAttribute("readonly", "readonly");
    }
    li.appendChild(i);

    i.addEventListener("focus", expandFocusedInput);
    i.addEventListener("blur", relaxFocusedInput);
  }
}

function expandFocusedInput(e) {
  (e.target.previousElementSibling || e.target.nextElementSibling).style.maxWidth = "4em";
}

function relaxFocusedInput(e) {
  (e.target.previousElementSibling || e.target.nextElementSibling).style.maxWidth = "";
}

function redrawDetails(platform) {
  let details = document.querySelector(".details");
  details.setAttribute("data-for-list-item", platform);

  let frag = document.createDocumentFragment();
  let platformDetails = CurrentPlatforms[platform];

  addDetailsHeader(frag, "platformSelectDetails", [platformDetails.label]);

  for (let {label, action} of PlatformOptions) {
    if (label === "separator") {
      frag.appendChild(document.createElement("hr"));
      continue;
    }

    let opt = document.createElement("button");
    opt.appendChild(document.createTextNode(label));
    opt.setAttribute("data-action", action);
    frag.appendChild(opt);

    if (action === "collapse") {
      opt.style.display = "none";

      let bd = document.createElement("div");
      bd.classList.add("breakdown");
      bd.classList.add("expandable");
      frag.appendChild(bd);

      addDetailsHeader(bd, "platformSelectHeaderOverrides");
      let ul = document.createElement("ul");
      bd.appendChild(ul);
      for (let [httpHeaderName, value] of Object.entries(platformDetails.headers)) {
        addInputPairLI(ul, httpHeaderName, value);
      }

      addDetailsHeader(bd, "platformSelectScriptOverrides");
      for (let [parentObjectName, overrides] of Object.entries(platformDetails.overrides)) {
        let ul = document.createElement("ul");
        bd.appendChild(ul);
        for (let [objectName, objectValue] of Object.entries(overrides)) {
          addInputPairLI(ul, `${parentObjectName}.${objectName}`, objectValue);
        }
      }
    }
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
