/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// todo:
// - option to add "FxQuantum/version" to the UA?
// - "randomized" UA option?

const IsAndroid = navigator.userAgent.includes("Android");

let GlobalOverride;
let WindowOverrides = {};
let TabOverrides = {};
let DomainOverrides = {};
let ContainerOverrides = {};
let PlatformSpecs = {};

let UpdateStatus;
let UpdateLastCheckedDate;
let UpdateFrequency = 1000 * 60 * 60 * 24 * 4; // check every 4 days by default
let UpdateURL = "https://raw.githubusercontent.com/wisniewskit/user-agent-alter/master/platform_list.json";

readConfig().then(checkForUAListUpdate);

function checkForUAListUpdate(force=false) {
  if (force ||
      !UpdateLastCheckedDate ||
      new Date().getTime() > UpdateLastCheckedDate + UpdateFrequency) {
    remoteUpdateUAList().then(() => {
      UpdateLastCheck = new Date().getTime();
      setStorage("update.lastChecked", UpdateLastCheck);
    });
  }
}

function readConfig() {
  return browser.storage.local.get().then(data => {
    for (let [key, value] of Object.entries(data || {})) {
      if (key === "global") {
        GlobalOverride = value;
      } else if (key.startsWith("container.")) {
        ContainerOverrides[key.substr(10)] = value;
      } else if (key.startsWith("domain.")) {
        DomainOverrides[key.substr(7)] = value;
      } else if (key === "platform.") {
        PlatformOverrides[key.substr(9)] = value;
      } else if (key === "update.cachedUAList") {
        PlatformSpecs = value;
      } else if (key === "update.frequencyHours") {
        UpdateFrequency = (parseInt(value) * 60 * 1000) || UpdateFrequency;
      } else if (key === "update.lastChecked") {
        UpdateLastCheckedDate = value;
      } else if (key === "update.url") {
        try {
          new URL(value);
          UpdateURL = value;
        } catch(e) {
          console.error(browser.i18n.getMessage("invalidUpdateURL", value));
        }
      }
    }
  });
}

function sendStateInfoToPopup() {
  getActiveWindowTab().then(tab => {
    getStateInfoForPopup(tab).then(browser.runtime.sendMessage);
  });
}

function remoteUpdateUAList() {
  UpdateStatus = "loading";
  browser.runtime.sendMessage({updateStatus: UpdateStatus});
  return fetch(UpdateURL, {method: "GET", mode: "no-cors",
                           redirect: "error", cache: "no-cache"}).
    then(response => response.json()).
    then(platformSpecs => {
      UpdateStatus = undefined;
      PlatformSpecs = platformSpecs;
      setStorage("update.cachedUAList", platformSpecs);
      sendStateInfoToPopup();
    }).
    catch(e => {
      UpdateStatus = e + "";
      console.error(e);
      browser.runtime.sendMessage({updateStatus: UpdateStatus});
      sendStateInfoToPopup();
      throw e;
    });
}

function setStorage(key, value) {
  let o = {};
  o[key] = value;
  browser.storage.local.set(o);
}

function removeStorage(key) {
  browser.storage.local.remove([key]);
}

function getTLD(host) {
  if (!host) return;
  return host.split(".").slice(-2).join(".");
}

async function getContainer(cookieStoreId) {
  let container;
  try {
    container = await browser.contextualIdentities.get(cookieStoreId);
  } catch (e) {}
  return container;
}

function getActiveWindowTab() {
  return browser.tabs.query({active: true, lastFocusedWindow: true}).then(tabs => {
    return tabs[0];
  });
}

function onPopupChanged(platform, scope) {
  getActiveWindowTab().then(tab => {
    let host = new URL(tab.url).host;
    let tld = getTLD(host);
    if (scope === "tab") {
      if (platform) {
        TabOverrides[tab.id] = platform;
      } else {
        delete(TabOverrides[tab.id]);
      }
    } else if (scope === "window") {
      if (platform) {
        WindowOverrides[tab.windowId] = platform;
      } else {
        delete(WindowOverrides[tab.windowId]);
      }
    } else if (scope === "domain" && host) {
      if (platform) {
        DomainOverrides[tld] = platform;
        setStorage(`domain.${tld}`, platform);
      } else {
        delete DomainOverrides[tld];
        removeStorage(`domain.${tld}`);
      }
    } else if (scope === "subdomain" && host) {
      if (platform) {
        DomainOverrides[host] = platform;
        setStorage(`domain.${host}`, platform);
      } else {
        delete DomainOverrides[host];
        removeStorage(`domain.${host}`);
      }
    } else if (scope === "container") {
      let id = tab.cookieStoreId;
      if (platform) {
        ContainerOverrides[id] = platform;
        setStorage(`container.${id}`, platform);
      } else {
        delete ContainerOverrides[id];
        removeStorage(`container.${id}`);
      }
    } else if (scope === "global") {
      GlobalOverride = platform;
      if (platform) {
        setStorage("global", platform);
      } else {
        removeStorage("global");
      }
    }

    updateBrowserAction(tab.id, getActivePlatformForTab(tab));
  });
}

function getActivePlatformForTab(tab) {
  let host = new URL(tab.url).host;
  let tld = getTLD(host);
  let name = TabOverrides[tab.id] ||
             ContainerOverrides[tab.cookieStoreId] ||
             DomainOverrides[host] ||
             DomainOverrides[tld] ||
             WindowOverrides[tab.windowId] ||
             GlobalOverride;
  if (!name) {
    return;
  }
  return new Platform(PlatformSpecs[name]);
}

function updateBrowserAction(tabId, platform) {
  if (!platform) {
    platform = new Platform(PlatformSpecs.default);
  }
  if (browser.browserAction.setIcon) {
    browser.browserAction.setIcon({path: platform.icon, tabId: tabId});
  }
  if (browser.browserAction.setTitle) {
    if (platform.label === browser.i18n.getMessage("platformLabelDefault")) {
      browser.browserAction.setTitle({
        title: browser.i18n.getMessage("addonName")
      });
    } else {
      browser.browserAction.setTitle({
        title: browser.i18n.getMessage("browserActionLabel", [platform.label])
      });
    }
  }
}

browser.webNavigation.onBeforeNavigate.addListener(details => {
  browser.tabs.get(details.tabId).then(tab => {
    let platform = getActivePlatformForTab(tab);
    if (platform) {
      browser.tabs.executeScript(details.tabId, {
        code: `try { selectPlatform(${JSON.stringify(platform.toSpec())}); } catch(e) {}`,
        runAt: "document_start",
      });
    }
  });
});

async function getStateInfoForPopup(tab) {
  let url = new URL(tab.url);
  let container = await getContainer(tab.cookieStoreId) || {};
  return {
    overrides: {
      tab: TabOverrides[tab.id],
      domain: DomainOverrides[getTLD(url.host)],
      subdomain: DomainOverrides[url.host],
      container: ContainerOverrides[tab.cookieStoreId],
      window: WindowOverrides[tab.windowId],
      global: GlobalOverride,
    },
    container: {
      cookieStoreId: container.cookieStoreId,
      name: container.name,
    },
    platformSpecs: PlatformSpecs,
    url: tab.url,
    updateStatus: UpdateStatus,
  };
}

browser.tabs.onActivated.addListener(activeInfo => {
  getActiveWindowTab().then(tab => {
    updateBrowserAction(tab.id, getActivePlatformForTab(tab));
    getStateInfoForPopup(tab).then(browser.runtime.sendMessage);
  });
});

browser.webRequest.onBeforeSendHeaders.addListener(
  details => {
    return browser.tabs.get(details.tabId).then(tab => {
      let platform = getActivePlatformForTab(tab);
      if (platform) {
        for (let override of platform.headers()) {
          let nameLower = override.name.toLowerCase();
          for (let header of details.requestHeaders) {
            if (header.name.toLowerCase() === nameLower) {
              header.value = override.value;
              break;
            }
          }
        }
      }
      return {requestHeaders: details.requestHeaders};
    });
  },
  {"urls": ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getState") {
    sendStateInfoToPopup();
    return;
  } else if (message === "refreshList") {
    remoteUpdateUAList(true);
    return;
  }

  onPopupChanged(message.platform, message.scope);
  if (message.closePopup && IsAndroid) {
    browser.tabs.remove(sender.tab.id);
  }
});
