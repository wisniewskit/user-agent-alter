/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let CurrentPlatforms;
let CurrentOverrides;
let CurrentURL;
let CurrentContainer = {};

const DefaultUALanguage = navigator.language;

const PlatformSelectForTab = browser.i18n.getMessage("platformSelectForTab");
const PlatformUnset = browser.i18n.getMessage("platformUnset");
const DrillDownArrow = browser.i18n.getMessage("drillDownArrow");

let PlatformOptions = [];

browser.runtime.onMessage.addListener(data => {
  if (document.querySelector(".details[data-editing-scope]")) {
    hideCopiedTooltip();
    goBackToList().then(() => { redraw(data); });
  } else {
    redraw(data);
  }
});
browser.runtime.sendMessage("getState");

function hideCopiedTooltip(y) {
  let tooltip = document.getElementById("copiedToClipboard");
  if (tooltip) {
    tooltip.remove();
  }
}

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
  let longTapDelay = 1000;
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
    if (action === "cancel") {
      hideCopiedTooltip();
      goBackToList();
    } else if (action === "refresh") {
      browser.runtime.sendMessage("refreshList");
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
    } else if (action === "clear") {
      let details = document.querySelector(".details");
      let scope = details.getAttribute("data-editing-scope");
      changeActivePlatform({scope, closePopup: true});
    } else {
      if (action === "update") {
        let details = document.querySelector(".details");
        action = details.getAttribute("data-editing-scope");
      }
      let details = document.querySelector(".details");
      let platform = details.getAttribute("data-for-list-item");
      changeActivePlatform({
        platform,
        language: CurrentPlatforms[platform].language,
        scope: action,
        closePopup: true,
      });
    }
    return;
  }

  let li = e.target.closest("li");
  if (li) {
    let platform = li.getAttribute("data-name");
    let action = li.getAttribute("data-action");

    if (e.target.nodeName === "BUTTON") {
      if (action && action.startsWith("unset-")) {
        changeActivePlatform({
          scope: action.substr(6),
        }).then(() => {
          li.parentNode.previousSibling.remove();
          li.parentNode.remove();
        })
      } else {
        hideCopiedTooltip();
        drillDownIntoDetails({platform});
      }
      return;
    }

    if (platform) {
      if (action && action.startsWith("unset-")) {
        hideCopiedTooltip();
        drillDownIntoDetails({platform, action: action.substr(6)});
      } else {
        changeActivePlatform({
          platform,
          language: CurrentPlatforms[platform].language,
          scope: "tab",
          closePopup: true,
        });
      }
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

  let li = createLIForPlatform(CurrentPlatforms[platform], PlatformUnset);
  li.setAttribute("data-name", platform);
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
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionLanguage"), action: "language"});

  PlatformOptions.push({label: "separator"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionExpand"), action: "expand"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionCollapse"), action: "collapse"});

  PlatformOptions.push({label: "separator"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionUpdate"), action: "update"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionCancel"), action: "cancel"});
  PlatformOptions.push({label: browser.i18n.getMessage("platformOptionClear"), action: "clear"});
}

function redrawList(data) {
  let list = document.querySelector(".list");
  let frag = document.createDocumentFragment();

  if (data.updateStatus === "loading") {
    let div = document.createElement("div");
    div.classList.add("loading");
    div.appendChild(document.createTextNode(browser.i18n.getMessage("loadingUpdate")));
    frag.appendChild(div);
    list.innerHTML = "";
    list.appendChild(frag);
    return;
  } else if (data.updateStatus && !Object.keys(data.platformSpecs || {}).length) {
    let button = document.createElement("button");
    button.setAttribute("data-action", "refresh");
    button.classList.add("refresh");
    button.appendChild(document.createTextNode(browser.i18n.getMessage("retryUpdate")));
    frag.appendChild(button);
    list.innerHTML = "";
    list.appendChild(frag);
    return;
  }

  let platforms = {};
  for (let [name, spec] of Object.entries(data.platformSpecs)) {
    platforms[name] = new Platform(spec);
  }
  CurrentPlatforms = platforms;
  CurrentOverrides = data.overrides;

  determinePlatformOptions(data);

  CurrentURL = data.url;
  CurrentContainer = data.container;

  for (let {label, action} of PlatformOptions) {
    if (data.overrides[action]) {
      addUnsetEntryTo(frag, data.overrides[action].platform,
                      label, `unset-${action}`);
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

function addDetailsHeader(parent, messageName, messageArgs, secondLineText) {
  let label = document.createElement("h1");
  let message = browser.i18n.getMessage(messageName, messageArgs) || messageName;
  label.appendChild(document.createTextNode(message));
  if (secondLineText) {
    label.appendChild(document.createElement("br"));
    label.appendChild(document.createTextNode(secondLineText));
  }
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

function addLanguageSelector(frag, label, platformDetails, editingAction) {
  let d = document.createElement("div");
  d.classList.add("languageSelect");
  frag.appendChild(d);

  let l = document.createElement("label");
  l.setAttribute("for", "language");
  l.appendChild(document.createTextNode(label));
  d.appendChild(l);

  let i = document.createElement("input");
  i.id = "language";
  i.setAttribute("placeholder", DefaultUALanguage);

  let {language} = CurrentOverrides[editingAction] || {};
  if (language && language !== DefaultUALanguage) {
    i.value = language;
  }
  d.appendChild(i);

  i.addEventListener("change", e => {
    i.value = i.value.trim();
    platformDetails.language = i.value || i.placeholder;
    redrawBreakdown(document.querySelector(".breakdown"), platformDetails);
  });
}

function redrawDetails(config) {
  let {platform, action} = config;
  let editingAction = action;
  let editing = CurrentOverrides[editingAction] &&
                CurrentOverrides[editingAction].platform === platform;

  let details = document.querySelector(".details");
  details.setAttribute("data-for-list-item", platform);
  details.setAttribute("data-editing-scope", editingAction);

  let frag = document.createDocumentFragment();
  let platformDetails = CurrentPlatforms[platform];

  if (editing) {
    addDetailsHeader(frag, "platformModifyTitle", [editingAction],
                     `(${platformDetails.label})`);
  } else {
    addDetailsHeader(frag, "platformSelectDetails", [platformDetails.label]);
  }

  for (let {label, action} of PlatformOptions) {
    if (editing && ["tab", "subdomain", "domain", "window",
                    "container", "global"].indexOf(action) > -1) {
      continue;
    } else if (!editing && ["update", "clear"].indexOf(action) > -1) {
      continue;
    }

    if (label === "separator") {
      frag.appendChild(document.createElement("hr"));
      continue;
    }

    if (action === "language") {
      addLanguageSelector(frag, label, platformDetails, editingAction);
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

      redrawBreakdown(bd, platformDetails);
    }
  }

  details.innerHTML = "";
  details.appendChild(frag);
}

function redrawBreakdown(bd, platformDetails) {
  bd.innerHTML = "";

  addDetailsHeader(bd, "platformSelectHeaderOverrides");
  let ul = document.createElement("ul");
  bd.appendChild(ul);
  for (let override of platformDetails.headers()) {
    addInputPairLI(ul, override.name, override.value);
  }

  addDetailsHeader(bd, "platformSelectScriptOverrides");
  ul = document.createElement("ul");
  bd.appendChild(ul);
  for (let override of platformDetails.overrides()) {
    addInputPairLI(ul, override.name, override.value);
  }
}

function changeActivePlatform(message) {
  return new Promise(resolve => {
    browser.runtime.sendMessage(message, () => {
      if (message.closePopup && !IsAndroid) {
        this.close();
      }
      resolve();
    });
  });
}
