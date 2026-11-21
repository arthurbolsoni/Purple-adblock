// Text of the popup and the export page from _locales (chrome.i18n): English, and Brazilian Portuguese when the
// browser is in Portuguese. The English text written in the markup stays where a message is missing.
(function () {
  function t(key, substitutions, fallback) {
    let text = "";
    try {
      if (typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.getMessage) text = chrome.i18n.getMessage(key, substitutions);
    } catch (e) {
      text = "";
    }
    return text || fallback || "";
  }

  function language() {
    try {
      if (typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.getUILanguage) return chrome.i18n.getUILanguage() || "en";
    } catch (e) {}
    return "en";
  }

  // [data-i18n] sets the text, [data-i18n-aria] the aria-label, [data-i18n-title] the title (the hint on hover)
  function localize(root) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      const text = t(element.getAttribute("data-i18n"));
      if (text) element.textContent = text;
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const text = t(element.getAttribute("data-i18n-aria"));
      if (text) element.setAttribute("aria-label", text);
    });
    root.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const text = t(element.getAttribute("data-i18n-title"));
      if (text) element.setAttribute("title", text);
    });
    if (root.documentElement) root.documentElement.lang = language();
  }

  globalThis.PurpleI18n = { t, language, localize };
})();
