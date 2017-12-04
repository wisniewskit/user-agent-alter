/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// todo:
// - save the domain/subdomain/container/global overrides as config.
// - option to add "FxQuantum/version" to the UA?
// - "randomized" UA option?

const IsAndroid = navigator.userAgent.includes("Android");

let GlobalOverride;
let WindowOverrides = {};
let TabOverrides = {};
let DomainOverrides = {};
let ContainerOverrides = {};

browser.storage.local.get().then(data => {
  for (let [key, value] of Object.entries(data || {})) {
    if (key === "global") {
      GlobalOverride = value;
    } else if (key.startsWith("container.")) {
      ContainerOverrides[key.substr(10)] = value;
    } else if (key.startsWith("domain.")) {
      DomainOverrides[key.substr(7)] = value;
    }
  }
});

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
  return TabOverrides[tab.id] ||
         ContainerOverrides[tab.cookieStoreId] ||
         DomainOverrides[host] ||
         DomainOverrides[tld] ||
         WindowOverrides[tab.windowId] ||
         GlobalOverride;
}

function updateBrowserAction(tabId, platformName) {
  let platform = PLATFORMS[platformName || "default"];
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
    let override = getActivePlatformForTab(tab);
    if (override) {
      browser.tabs.executeScript(details.tabId, {
        code: `try { selectPlatform("${override}"); } catch(e) {}`,
        runAt: "document_start",
      });
    }
  });
});

async function getTabInfoForPopup(tab) {
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
    platforms: PLATFORMS,
    url: tab.url,
  };
}

browser.tabs.onActivated.addListener(activeInfo => {
  getActiveWindowTab().then(tab => {
    updateBrowserAction(tab.id, getActivePlatformForTab(tab));
    getTabInfoForPopup(tab).then(browser.runtime.sendMessage);
  });
});

browser.webRequest.onBeforeSendHeaders.addListener(
  details => {
    return browser.tabs.get(details.tabId).then(tab => {
      let override = getActivePlatformForTab(tab);
      if (override) {
        let headerOverrides = PLATFORMS[override].headers || {};
        for (let [name, override] of Object.entries(headerOverrides)) {
          let nameLower = name.toLowerCase();
          for (let header of details.requestHeaders) {
            if (header.name.toLowerCase() === nameLower) {
              header.value = override;
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
    getActiveWindowTab().then(tab => {
      getTabInfoForPopup(tab).then(data => {
        sendResponse(data);
      });
    });
    return true;
  }

  onPopupChanged(message.platform, message.scope);
  if (message.closePopup && IsAndroid) {
    browser.tabs.remove(sender.tab.id);
  }
});
