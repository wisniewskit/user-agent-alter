let Platform = (function() {
  const langregex = /lang/i;

  return class Platform {
    constructor(spec, config={}) {
      this.spec = spec;
      this.config = config;
      this.language = config.language || navigator.language;
      this.acceptWebP = config.acceptWebP || false;
      this.acceptJXR = config.acceptJXR || false;
    }

    _expandVars(name, value) {
      if (name.toLowerCase() === "accept") {
        if (!this.acceptWebP) {
          value = value.replace(",image/webp", "");
        }
        if (!this.acceptJXR) {
          value = value.replace(",image/jxr", "");
        }
      } else if (name.match(langregex)) {
        value = value.replace("LANGLC", this._langLC).
                      replace("LANG2", this._lang2).
                      replace("LANG", this._lang);
      }
      return value;
    }

    get language() {
      return this._lang;
    }

    set language(lang) {
      this._lang = lang;
      this._langLC = lang.toLowerCase();
      this._lang2 = lang.substr(0, 2);
    }

    get label() {
      return browser.i18n.getMessage(this.spec.label, this.spec.version);
    }

    get version() {
      return this.spec.version;
    }

    get icon() {
      return this.spec.icon;
    }

    *headers() {
      for (let [name, value] of Object.entries(this.spec.headers || {})) {
        yield {
          name,
          value: this._expandVars(name, value)
        };
      }
    }

    *overrides() {
      for (let [subobjname, subobj] of Object.entries(this.spec.overrides || {})) {
        for (let [name, value] of Object.entries(subobj)) {
          yield {
            name: `${subobjname}.${name}`,
            value: this._expandVars(name, value)
          };
        }
      }
    }

    toSpec() {
      return {
        label: this.label,
        icon: this.icon,
        version: this.version,
        language: this.language,
        headers: [...this.headers()],
        overrides: [...this.overrides()],
      }
    }
  }
}());
