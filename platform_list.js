/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const LANGUAGE = navigator.language;
const LANGUAGES = navigator.languages;
const LANGUAGES_JOINED = LANGUAGES.join(",");

const PLATFORMS = {
  default: {
    label: browser.i18n.getMessage("platformLabelDefault"),
    icon: "icons/firefox.svg",
    navigator: undefined
  },

  chrome_android: {
    label: browser.i18n.getMessage("platformLabelChromeAndroid", 62),
    icon: "icons/chrome_android.svg",
    version: 62,
    headers: {
      //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/apng,*/*;q=0.8",
      "Accept-Language": `${LANGUAGES_JOINED};q=0.8`, // "en-US,en;q=0.8"
      "User-Agent": "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 7 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Safari/537.36",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Linux; Android 5.1.1; Nexus 7 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Safari/537.36",
        oscpu: undefined,
        platform: "Linux armv7l",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 7 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Safari/537.36",
        vendor: "Google Inc.",
      },
    },
  },
  chrome_android_phone: {
    label: browser.i18n.getMessage("platformLabelChromeAndroidPhone", 62),
    icon: "icons/chrome_android_phone.svg",
    version: 62,
    headers: {
      //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/apng,*/*;q=0.8",
      "Accept-Language": `${LANGUAGES_JOINED};q=0.8`, // "en-US,en;q=0.8"
      "User-Agent": "Mozilla/5.0 (Linux; Android 7.0; SM-G935W8 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Linux; Android 7.0; SM-G935W8 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
        oscpu: undefined,
        platform: "Linux armv8l",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (Linux; Android 7.0; SM-G935W8 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
        vendor: "Google Inc.",
      },
    },
  },
  chrome_windows: {
    label: browser.i18n.getMessage("platformLabelChromeWindows", 62),
    icon: "icons/chrome_windows.svg",
    version: 62,
    headers: {
      //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/apng,*/*;q=0.8",
      "Accept-Language": `${LANGUAGES_JOINED};q=0.8`, // "en-US,en;q=0.8"
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        oscpu: undefined,
        platform: "Win32",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        vendor: "Google Inc.",
      },
    },
  },
  chrome_linux: {
    label: browser.i18n.getMessage("platformLabelChromeLinux", 62),
    icon: "icons/chrome_linux.svg",
    version: 62,
    headers: {
      //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/apng,*/*;q=0.8",
      "Accept-Language": `${LANGUAGES_JOINED};q=0.8`, // "en-US,en;q=0.8"
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        oscpu: undefined,
        platform: "Linux x86_64",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        vendor: "Google Inc.",
      },
    },
  },
  chrome_osx: {
    label: browser.i18n.getMessage("platformLabelChromeOSX", 62),
    icon: "icons/chrome_osx.svg",
    version: 62,
    headers: {
      //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/apng,*/*;q=0.8",
      "Accept-Language": `${LANGUAGES_JOINED};q=0.8`, // "en-US,en;q=0.8"
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        oscpu: undefined,
        platform: "MacIntel",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        vendor: "Google Inc.",
      },
    },
  },
  chrome_ios: {
    label: browser.i18n.getMessage("platformLabelChromeIOS", 62),
    icon: "icons/chrome_ios.svg",
    version: 62,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/62.0.3202.70 Mobile/15B31 Safari/604.1",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/62.0.3202.70 Mobile/15B31 Safari/604.1",
        oscpu: undefined,
        platform: "iPad",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/62.0.3202.70 Mobile/15B31 Safari/604.1",
        vendor: "Google Inc.",
      },
    },
  },
  chrome_ios_phone: {
    label: browser.i18n.getMessage("platformLabelChromeIOSPhone", 62),
    icon: "icons/chrome_ios_phone.svg",
    version: 62,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) CriOS/62.0.3202.70 Mobile/15A402 Safari/604.1",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) CriOS/62.0.3202.70 Mobile/15A402 Safari/604.1",
        oscpu: undefined,
        platform: "iPhone",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) CriOS/62.0.3202.70 Mobile/15A402 Safari/604.1",
        vendor: "Google Inc.",
      },
    },
  },

  firefox_android: {
    label: browser.i18n.getMessage("platformLabelFirefoxAndroid", "57.0.1"),
    icon: "icons/firefox_android.svg",
    version: "57.0.1",
    headers: {
      "User-Agent": "Mozilla/5.0 (Android 5.1.1; Tablet; rv:57.0) Gecko/57.0 Firefox/57.0",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Android 5.1.1)",
        buildID: "20171128222554",
        oscpu: "Linux armv7l",
        platform: "Linux armv7l",
        userAgent: "Mozilla/5.0 (Android 5.1.1; Tablet; rv:57.0) Gecko/57.0 Firefox/57.0",
      },
    },
  },
  firefox_android_phone: {
    label: browser.i18n.getMessage("platformLabelFirefoxAndroidPhone", "57.0.1"),
    icon: "icons/firefox_android_phone.svg",
    version: "57.0.1",
    headers: {
      "User-Agent": "Mozilla/5.0 (Android 7.0; Mobile; rv:57.0) Gecko/57.0 Firefox/57.0",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Android 7.0)",
        buildID: "20171128222554",
        oscpu: "Linux armv8l",
        platform: "Linux armv8l",
        userAgent: "Mozilla/5.0 (Android 7.0; Mobile; rv:57.0) Gecko/57.0 Firefox/57.0",
      },
    },
  },
  firefox_windows: {
    label: browser.i18n.getMessage("platformLabelFirefoxWindows", "57.0.1"),
    icon: "icons/firefox_windows.svg",
    version: "57.0.1",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Windows)",
        buildId: "20171112125346",
        oscpu: "Windows NT 10.0; Win64; x64",
        platform: "Win64",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0",
      },
    },
  },
  firefox_linux: {
    label: browser.i18n.getMessage("platformLabelFirefoxLinux", "57.0.1"),
    version: "57.0.1",
    icon: "icons/firefox_linux.svg",
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (X11)",
        buildID: "20171128222554",
        oscpu: "Linux x86_64",
        platform: "Linux x86_64",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0",
      },
    },
  },
  firefox_osx: {
    label: browser.i18n.getMessage("platformLabelFirefoxOSX", "57.0.1"),
    icon: "icons/firefox_osx.svg",
    version: "57.0.1",
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:57.0) Gecko/20100101 Firefox/57.0",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Macintosh)",
        buildID: "20171128222554",
        cpuHasSSE2: true,
        oscpu: "Intel Mac OS X 10.13",
        platform: "MacIntel",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:57.0) Gecko/20100101 Firefox/57.0",
      },
    },
  },
  firefox_ios: {
    label: browser.i18n.getMessage("platformLabelFirefoxIOS", 10.3),
    icon: "icons/firefox_ios.svg",
    version: 10.3,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) FxiOS/10.3 Mobile/15B31 Safari/604.1",
    },
    overrides: {
      navigator: {
        appVersion: "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) FxiOS/10.3 Mobile/15B31 Safari/604.1",
        oscpu: undefined,
        platform: "iPad",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) FxiOS/10.3 Mobile/15B31 Safari/604.1",
      },
    },
  },
  firefox_ios_phone: {
    label: browser.i18n.getMessage("platformLabelFirefoxIOSPhone", 10.3),
    icon: "icons/firefox_ios_phone.svg",
    version: 10.3,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) FxiOS/10.3 Mobile/15A402 Safari/604.1",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) FxiOS/10.3 Mobile/15A402 Safari/604.1",
        oscpu: undefined,
        platform: "iPhone",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) FxiOS/10.3 Mobile/15A402 Safari/604.1",
      },
    },
  },

  safari_osx: {
    label: browser.i18n.getMessage("platformLabelSafariOSX", "11.0.1"),
    icon: "icons/safari_osx.svg",
    version: "11.0.1",
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": LANGUAGE.toLowerCase(), // "en-us"
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5",
        oscpu: undefined,
        platform: "MacIntel",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5",
        vendor: "Apple Computer, Inc.",
      },
    },
  },
  safari_ios: {
    label: browser.i18n.getMessage("platformLabelSafariIOS", 11),
    icon: "icons/safari_ios.svg",
    version: 11,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15B31 Safari/604.1",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15B31 Safari/604.1",
        oscpu: undefined,
        platform: "iPad",

        productSub: "20030107",
        userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15B31 Safari/604.1",
        vendor: "",
      },
    },
  },
  safari_ios_phone: {
    label: browser.i18n.getMessage("platformLabelSafariIOSPhone", 11),
    icon: "icons/safari_ios_phone.svg",
    version: 11,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A402 Safari/604.1",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A402 Safari/604.1",
        oscpu: undefined,
        platform: "iPhone",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A402 Safari/604.1",
        vendor: "",
      },
    },
  },

  android: {
    label: browser.i18n.getMessage("platformLabelAndroid", "4.0.2"),
    icon: "icons/android.svg",
    version: "4.0.2",
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
        oscpu: undefined,
        platform: "Linux armv7l",
        userAgent: "Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
        vendor: "Google Inc.",
      },
    },
  },

  edge_windows: {
    label: browser.i18n.getMessage("platformLabelEdgeWindows", 16.16299),
    icon: "icons/edge.svg",
    version: 16.16299,
    headers: {
      //"Accept": "text/html, application/xhtml+xml, image/jxr, */*",
      "Accept": "text/html, application/xhtml+xml, */*",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299",
    },
    overrides: {
      navigator: {
        appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299",
        msManipulationViewsEnabled: false,
        oscpu: undefined,
        platform: "Win32",
        productSub: "20030107",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299",
      },
    },
  },
  explorer11_windows: {
    label: browser.i18n.getMessage("platformLabelExplorerWindows", 11),
    icon: "icons/explorer10.svg",
    version: 11,
    headers: {
      "Accept": "text/html, application/xhtml+xml, */*",
      //"Dnt": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
    },
    overrides: {
      navigator: {
        appMinorVersion: "0",
        appVersion: "5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko",
        browserLanguage: LANGUAGE,
        cpuClass: "x86",
        oscpu: undefined,
        platform: "Win32",
        systemLanguage: LANGUAGE,
        userAgent: "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko",
        userLanguage: LANGUAGE,
        vendorSub: undefined,
      },
    },
  },
  //explorer11_windows_phone: {
  //  label: browser.i18n.getMessage("platformLabelExplorerWindowsPhone"),
  //  icon: "icons/explorer_windows_phone.svg",
  //},
};
