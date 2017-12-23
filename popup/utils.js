const IsAndroid = navigator.userAgent.includes("Android");

function redraw(data) {
  redrawList(data);

  let forListItem = document.querySelector(".details").getAttribute("data-for-list-item");
  if (forListItem) {
    redrawDetails(forListItem);
  }
}

function drillDownIntoDetails(config) {
  redrawDetails(config);

  let container = document.querySelector("section");
  let oldScrollTop = document.scrollingElement.scrollTop;
  container.setAttribute("data-oldScrollTop", oldScrollTop);

  slideViewRight();
}

function goBackToList() {
  return slideViewBackLeft().then(() => {
    let details = document.querySelector(".details");
    details.removeAttribute("data-editing-scope");
    details.removeAttribute("data-for-list-item");
    restoreScrollTop();
  });
}

function slideViewRight() {
  let list = document.querySelector(".list");
  let details = document.querySelector(".details");

  details.style.position = "relative";
  details.style.left = list.clientWidth + "px";

  list.style.pointerEvents = "none";
  list.style.position = "absolute";
  list.style.maxHeight = details.scrollHeight + "px";
  list.style.overflow = "hidden";

  let container = document.querySelector("section");
  container.addEventListener("transitionend", () => {
    list.style.display = "none";
  }, {once: true});

  let shift = details.getBoundingClientRect().left - 2;
  container.style.transform = "translateX(-" + shift + "px)";
}

function slideViewBackLeft() {
  let list = document.querySelector(".list");
  let details = document.querySelector(".details");

  details.style.position = "";
  details.style.left = "";

  list.style.pointerEvents = "";
  list.style.position = "";
  list.style.maxHeight = "";
  list.style.overflow = "";
  list.style.display = "";

  let container = document.querySelector("section");
  return new Promise(resolve => {
    container.addEventListener("transitionend", () => {
      details.innerHTML = "";
      resolve();
    }, {once: true});
    container.style.transform = "";
  });
}

function restoreScrollTop() {
  let container = document.querySelector("section");
  let oldScrollTop = container.getAttribute("data-oldScrollTop");
  container.removeAttribute("data-oldScrollTop");
  document.scrollingElement.scrollTop = oldScrollTop;
}

