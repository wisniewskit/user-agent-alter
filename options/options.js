let DOMReadyPromise = new Promise(resolve => {
  window.addEventListener("DOMContentLoaded", () => {
    resolve();
  });
});

function formatValue(value, type) {
  switch(type) {
    case "date":
      return new Date(value);
    default:
      return value;
  }
}

browser.runtime.sendMessage("getSettings", settingGroups => {
  DOMReadyPromise.then(() => {
    let h = document.createElement("h1");
    let label = browser.i18n.getMessage("addonName");
    document.title = label;
    h.appendChild(document.createTextNode(label));
    document.body.appendChild(h);

    for (let [groupName, group] of Object.entries(settingGroups)) {
      let f = document.createElement("fieldset");
      f.classList.add("custom");
      document.body.appendChild(f);

      let l = document.createElement("legend");
      let label = browser.i18n.getMessage(`setting${groupName}`);
      l.appendChild(document.createTextNode(label));
      f.appendChild(l);

      let t = document.createElement("table");
      t.classList.add("custom");

      for (let [settingName, setting] of Object.entries(group)) {
        let tr = document.createElement("tr");
        tr.setAttribute("data-setting", `set${groupName}${settingName}`);
        t.appendChild(tr);

        let th = document.createElement("th");
        tr.appendChild(th);
        let l = document.createElement("label");
        let label = browser.i18n.getMessage(`setting${groupName}${settingName}`);
        l.appendChild(document.createTextNode(label));
        th.appendChild(l);

        let td = document.createElement("td");
        tr.appendChild(td);
        let d = document.createElement("div");
        td.appendChild(d);
        let i = document.createElement("input");
        i.placeholder = formatValue(setting.default, setting.type);
        if (setting.value && setting.default !== setting.value) {
          i.value = formatValue(setting.value, setting.type);
        }
        d.appendChild(i);

        if (setting.readonly) {
          i.setAttribute("readonly", "readonly");
        }

        if (setting.action) {
          let b = document.createElement("button");
          b.setAttribute("data-action", setting.action);
          let label = browser.i18n.getMessage(`setting${groupName}${setting.action}`);
          b.appendChild(document.createTextNode(label));
          d.appendChild(b);
        }
      }

      f.appendChild(t);
    }

    document.body.addEventListener("change", e => {
      let setting = e.target.closest("[data-setting]");
      if (setting) {
        let action = setting.getAttribute("data-setting");
        let value = e.target.value;
        browser.runtime.sendMessage({action, value}, result => {
          if (result.value === result.default) {
            e.target.value = "";
          } else {
            e.target.value = formatValue(result.value, result.type);
          }
        });
      }
    });

    document.body.addEventListener("click", e => {
      let action = e.target.getAttribute("data-action");
      if (action) {
        e.target.disabled = true;
        browser.runtime.sendMessage({
          action,
          value: e.target.previousElementSibling.value,
        }, result => {
          e.target.disabled = false;
          if (result.error) {
            alert(result.error);
          } else if (result.newValue) {
            e.target.previousElementSibling.value =
              formatValue(result.newValue, result.type);
          }
        });
      }
    });
  });
});
