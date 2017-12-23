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

function onPopupChanged(message) {
  getActiveWindowTab().then(tab => {
    let {platform, language, scope} = message;
    let override = {platform, language};

    let host = new URL(tab.url).host;
    let tld = getTLD(host);
    if (scope === "tab") {
      if (platform) {
        TabOverrides[tab.id] = override;
      } else {
        delete(TabOverrides[tab.id]);
      }
    } else if (scope === "window") {
      if (platform) {
        WindowOverrides[tab.windowId] = override;
      } else {
        delete(WindowOverrides[tab.windowId]);
      }
    } else if (scope === "domain" && host) {
      if (platform) {
        DomainOverrides[tld] = override;
        setStorage(`domain.${tld}`, override);
      } else {
        delete DomainOverrides[tld];
        removeStorage(`domain.${tld}`);
      }
    } else if (scope === "subdomain" && host) {
      if (platform) {
        DomainOverrides[host] = override;
        setStorage(`domain.${host}`, override);
      } else {
        delete DomainOverrides[host];
        removeStorage(`domain.${host}`);
      }
    } else if (scope === "container") {
      let id = tab.cookieStoreId;
      if (platform) {
        ContainerOverrides[id] = override;
        setStorage(`container.${id}`, override);
      } else {
        delete ContainerOverrides[id];
        removeStorage(`container.${id}`);
      }
    } else if (scope === "global") {
      GlobalOverride = override;
      if (platform) {
        setStorage("global", override);
      } else {
        removeStorage("global");
      }
    }

    browser.tabs.query({active: true}).then(tabs => {
      for (let tab of tabs) {
        let newPlatform = getActivePlatformForTab(tab);
        updateContentScript(newPlatform, [tab.id]);
        updateBrowserAction(tab.id, newPlatform);
      }
    });
  });
}

function getActivePlatformForTab(tab) {
  let host = new URL(tab.url).host;
  let tld = getTLD(host);
  let override = TabOverrides[tab.id] ||
                 ContainerOverrides[tab.cookieStoreId] ||
                 DomainOverrides[host] ||
                 DomainOverrides[tld] ||
                 WindowOverrides[tab.windowId] ||
                 GlobalOverride;
  if (!override) {
    return;
  }
  return new Platform(PlatformSpecs[override.platform], override);
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

browser.webNavigation.onCommitted.addListener(details => {
  browser.tabs.get(details.tabId).then(tab => {
    let platform = getActivePlatformForTab(tab);
    updateContentScript(platform, [tab.id]);
    updateBrowserAction(tab.id, platform);
  });
});

const updateContentScript = (function() {
  let currentContentScript;

  return async function updateContentScript(platform, alsoRunForTabs=[]) {
    if (currentContentScript) {
      try {
        await currentContentScript.unregister();
      } catch(e) {}
      currentContentScript = undefined;
    }

    if (!platform) {
      return;
    }

    let scripts =
      [{file: "platform.js"},
       {file: "content.js"},
       {code: `try { selectPlatform(${JSON.stringify(platform.toSpec())}); } catch(e) {}`}];

    currentContentScript = await browser.contentScripts.register({
      js: scripts,
      matches: ["<all_urls>"],
      runAt: "document_start",
      allFrames: true,
    });

    for (let tabId of alsoRunForTabs) {
      for (let scriptOptions of scripts) {
        await browser.tabs.executeScript(
          tabId,
          Object.assign(scriptOptions, {
            runAt: "document_start",
            allFrames: true,
          })
        );
      }
    }
  };
}());

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
    updateContentScript(getActivePlatformForTab(tab));
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

  onPopupChanged(message);
  if (message.closePopup && IsAndroid) {
    browser.tabs.remove(sender.tab.id);
  }
});
