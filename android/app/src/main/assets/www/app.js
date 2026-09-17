const KIND_LABEL = {
  episode: "Серия",
  visit: "Визит",
  sms: "Спецвыпуск",
  song: "Песня"
};
const KINDS = [
  ["all", "Все"],
  ["episode", "Серии"],
  ["song", "Песни"],
  ["visit", "Визиты"],
  ["sms", "Бонусы"]
];
const YT = "https://www.youtube.com/@yurec_xuec/videos";
const YT_SHORTS = "https://www.youtube.com/@yurec_xuec/shorts";
const TG = "https://t.me/yurec_xuec";
const BOOK_KEY = "yurec-bookmarks";
const LAST_KEY = "yurec-last";
const FONT_KEY = "yurec-font";
const PAPER_KEY = "yurec-paper";
const THEME_KEY = "yurec-theme";
const BOOK_NAV_KEY = "yurec-bookmarks-nav";
const INFO_NAV_KEY = "yurec-info-nav";
const ZASH_NAV_KEY = "yurec-zash-nav";
const AI_NAV_KEY = "yurec-ai-nav";
const AI_TOP_KEY = "yurec-ai-top";
const AI_KEEP_KEY = "yurec-ai-keep";
const WIDGET_KEY = "yurec-widget-interval";
const SCRUB_KEY = "yurec-reader-scrub";
const VIBRATE_KEY = "yurec-vibrate";
const SOUND_KEY = "yurec-sound";
const AWAKE_KEY = "yurec-keep-awake";
const GAME_ORDER_KEY = "yurec-game-order";
const DEV_KEY = "yurec-dev";
const ICON_KEY = "yurec-app-icon";
const NAME_KEY = "yurec-app-name";
const ACH_KEY = "yurec-achievements";
const EGG_KEY = "yurec-egg";
const SORT_KEY = "yurec-sort-mode";
const SORT_LEGACY = "yurec-newest";
const GSAVE_LEGACY = "yurec-game-save";
const GEND_LEGACY = "yurec-game-endings";
const PAID_KEY = "yurec-license";
const READ_KEY = "yurec-read";
const READ_SKIP = "yurec-read-skip";
const STUDIO_URL = "https://studio.youtube.com/channel/UCUe2h3bjoip1jAD2eX1stIA";
const DEV_CHAT_URL = "https://grok.com/c/bd6138f0-50b2-46ff-ad22-78e3151fb58f";
const UPDATE_URL = "https://t.me/yurec_xuec/479";
const SUPPORT_TG = "https://t.me/nick_stokes";
const SUPPORT_MAIL = "nickstokes215@gmail.com";
const BANNER = {
  all: "og.jpg",
  episode: "banners/episode.jpg",
  song: "banners/song.jpg",
  visit: "banners/visit.jpg",
  sms: "banners/sms.jpg"
};
var chipMap = {};

if (!String.prototype.includes) {
  String.prototype.includes = function (s) { return this.indexOf(s) !== -1; };
}
if (!Array.prototype.includes) {
  Array.prototype.includes = function (s) { return this.indexOf(s) !== -1; };
}
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (s) { return this.indexOf(s) === 0; };
}
if (!Array.prototype.find) {
  Array.prototype.find = function (fn) {
    for (var i = 0; i < this.length; i++) if (fn(this[i], i, this)) return this[i];
  };
}

var APP = { version: "1.64", buildAt: "17.09.2026, 02:45 МСК", history: [] };
function syncWideLayout(forced) {
  var w = typeof forced === "number" ? forced : 0;
  if (!w) {
    w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (window.visualViewport && window.visualViewport.width) w = Math.max(w, window.visualViewport.width);
    if (window.YurecScreen && window.YurecScreen.w) w = Math.max(w, window.YurecScreen.w);
  }
  document.documentElement.setAttribute("data-wide", w >= 560 ? "1" : "0");
}
window.YurecLayout = syncWideLayout;
try {
  window.addEventListener("resize", function () { syncWideLayout(); });
  window.addEventListener("orientationchange", function () { setTimeout(syncWideLayout, 80); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", function () { syncWideLayout(); });
} catch (eWide) {}
syncWideLayout();
var stories = [];
var videos = [];
var GAME = null;
var LEVELS = [];
var CHARACTERS = [];
var PRESS = [];
var QUOTES = [];
var CITATS = [];
var chatMode = "yurec";
var chatLog = null;
var chatDraft = "";
var chatBusy = false;
var chatSelecting = false;
var chatPicked = [];
var chatShareOpen = false;
var chatNote = "";
var qAudio = null;
var qOrder = [];
var qPos = 0;
var qLoop = false;
var Q_VOL_KEY = "yurec-quote-vol";
var state = { q: "", mq: "", kind: "all", sort: "old", returnTo: "/", cgroup: "all", cqi: 0, ylayer: "peter", ypin: null };
var gPhase = "title";
var gLevelId = "";
var gNode = "wake";
var gStats = {};
var gSteps = 0;
var gForceTop = false;
var donateAgain = false;
var offBoxOpen = false;
var wipeReadAsk = false;
var wipeCharAsk = false;
var wipeGamesAsk = false;
var wipeBakAsk = false;
var wipeChatAsk = false;
var bakNote = "";
var widgetNote = "";
var bakErr = "";
var OFFLINE = { items: [], cached: {}, prog: {}, err: {}, busy: "" };
var offOpen = false;
var aboutEgg = false;
var aboutTaps = { n: 0, t: 0 };

function offlineItemForVideo(v) {
  var items = OFFLINE.items || [];
  var i, o;
  if (!v) return null;
  for (i = 0; i < items.length; i++) {
    o = items[i];
    if (o.videoId && o.videoId === v.id) return o;
  }
  return null;
}
function offlineItemForStory(s) {
  var items = OFFLINE.items || [];
  var i, o;
  if (!s) return null;
  if (s.youtubeId) {
    for (i = 0; i < items.length; i++) {
      o = items[i];
      if (o.videoId === s.youtubeId) return o;
    }
  }
  if (s.slug) {
    for (i = 0; i < items.length; i++) {
      o = items[i];
      if (o.storySlug === s.slug && o.kind === s.kind) return o;
    }
  }
  return null;
}
function offlineBtnHtml(item) {
  if (!item) return "";
  var id = item.id;
  if (OFFLINE.busy === id) {
    var p = OFFLINE.prog[id] || 0;
    return '<button type="button" class="btn dl" data-off="' + esc(id) + '">' + p + "%</button>";
  }
  if (OFFLINE.cached[id]) return '<button type="button" class="btn off" data-off="' + esc(id) + '">Оффлайн</button>';
  var err = OFFLINE.err[id];
  return '<button type="button" class="btn dl" data-off="' + esc(id) + '" title="' + esc(err || item.title) + '">' + (err ? "Ещё раз" : "Скачать") + "</button>";
}
function syncNativeCache() {
  try {
    if (!window.YurecNative || !window.YurecNative.cachedJson) return;
    var ids = JSON.parse(window.YurecNative.cachedJson() || "[]");
    var i;
    for (i = 0; i < ids.length; i++) OFFLINE.cached[ids[i]] = true;
  } catch (e) {}
}
function offlineCodeLabel(item) {
  if (!item) return "";
  var kind = String(item.kind || "");
  var code = String(item.code || "").toUpperCase();
  if (kind === "call" || code === "ЗВОНОК") return "Звонок";
  if (kind === "visit" || code.indexOf("VISIT") === 0) return "Визит";
  if (kind === "short" || code === "SHORT") return "Shorts";
  return item.code || "";
}
function mediaStamp(item) {
  var code = displayEpisodeCode(item && item.code, item && item.title) || (item && item.code) || "";
  if ((item && item.mediaType === "image") || String((item && item.code) || "").toUpperCase() === "ФОТО") return code;
  var d = item && item.duration;
  if (d && code) return code + " · " + d;
  return d || code || "";
}
function itemIsAudio(item) {
  if (!item) return false;
  if (item.ext === "mp3" || item.kind === "call") return true;
  return /\.mp3$/i.test(item.file || "");
}
function ensureOffPlayer(isAudio) {
  var el = document.getElementById("off-player");
  if (!el) {
    el = document.createElement("div");
    el.id = "off-player";
    el.className = "off-player";
    el.innerHTML = '<div class="off-bar">' +
      '<button type="button" class="btn bar" id="off-close">Закрыть</button>' +
      "<b id=\"off-title\"></b>" +
      '<button type="button" class="btn bar" id="off-ext">Другой плеер</button></div>';
    document.body.appendChild(el);
    document.getElementById("off-close").addEventListener("click", closeOffPlayer);
    document.getElementById("off-ext").addEventListener("click", function () {
      var id = el.getAttribute("data-id") || "";
      if (window.YurecNative && window.YurecNative.playExternal) window.YurecNative.playExternal(id);
    });
  }
  var media = document.getElementById("off-video");
  var want = isAudio ? "AUDIO" : "VIDEO";
  if (!media || media.tagName !== want) {
    if (media) media.parentNode.removeChild(media);
    media = document.createElement(isAudio ? "audio" : "video");
    media.id = "off-video";
    media.controls = true;
    if (!isAudio) media.setAttribute("playsinline", "");
    el.appendChild(media);
  }
  return el;
}
function closeOffPlayer() {
  var el = document.getElementById("off-player");
  var v = document.getElementById("off-video");
  if (v) { try { v.pause(); v.removeAttribute("src"); v.load(); } catch (e) {} }
  if (el) { el.className = "off-player"; el.style.display = "none"; }
  offOpen = false;
}
function openOffPlayer(id, title) {
  var url = "";
  try { if (window.YurecNative && window.YurecNative.playUrl) url = window.YurecNative.playUrl(id) || ""; } catch (e) {}
  if (!url) {
    if (window.YurecNative && window.YurecNative.playExternal) window.YurecNative.playExternal(id);
    return;
  }
  var item = null, i;
  for (i = 0; i < OFFLINE.items.length; i++) if (OFFLINE.items[i].id === id) item = OFFLINE.items[i];
  var el = ensureOffPlayer(itemIsAudio(item));
  el.setAttribute("data-id", id);
  var t = document.getElementById("off-title");
  if (t) t.textContent = title || "Оффлайн";
  var v = document.getElementById("off-video");
  if (v) { v.src = url; try { v.play(); } catch (e) {} }
  el.className = "off-player on";
  el.style.display = "flex";
  offOpen = true;
}
function offPlayerMode() {
  try { return localStorage.getItem("yurec-off-player") === "ext" ? "ext" : "in"; } catch (e) { return "in"; }
}
function setOffPlayerMode(mode) {
  try { localStorage.setItem("yurec-off-player", mode); } catch (e) {}
}
function playOfflineItem(id, title) {
  if (offPlayerMode() === "ext") {
    if (window.YurecNative && window.YurecNative.playExternal) window.YurecNative.playExternal(id);
    return;
  }
  openOffPlayer(id, title);
}
function formatBytes(n) {
  n = Number(n) || 0;
  if (n >= 1073741824) return (n / 1073741824).toFixed(2).replace(".", ",") + " ГБ";
  if (n >= 1048576) return Math.round(n / 1048576) + " МБ";
  if (n >= 1024) return Math.round(n / 1024) + " КБ";
  return n + " Б";
}
function offlineHave() {
  var n = 0, i, items = OFFLINE.items || [];
  for (i = 0; i < items.length; i++) if (OFFLINE.cached[items[i].id]) n++;
  return n;
}
function packBytes() {
  var s = 0, i, items = OFFLINE.items || [];
  for (i = 0; i < items.length; i++) s += Number(items[i].size) || 0;
  return s;
}
function renderOfflineBox() {
  var have = offlineHave();
  var total = (OFFLINE.items || []).length;
  return '<a class="btn off wide" href="#/offline" style="margin-top:16px">Оффлайн-доступ · ' + have + " из " + total + "</a>";
}

function renderOffline() {
  var have = offlineHave();
  var total = (OFFLINE.items || []).length;
  var ext = offPlayerMode() === "ext";
  var html = '<a class="back" href="#/donate">← Назад к пожертвованию</a>' +
    '<p class="kicker" style="margin-top:16px">О приложении</p>' +
    '<h2 style="font-size:28px;margin-top:4px">Оффлайн-доступ</h2>' +
    '<p class="muted" style="margin-top:8px">' + have + " из " + total + " · пакет " + formatBytes(packBytes()) + "</p>" +
    '<div class="pswitch-box">' +
      '<p class="kicker" style="text-align:center">Как смотреть видео</p>' +
      '<button type="button" class="pswitch" id="off-player-mode" role="switch" aria-checked="' + (ext ? "true" : "false") + '">' +
        '<span class="' + (ext ? "" : "on") + '">Встроенный плеер</span>' +
        '<span class="' + (ext ? "on" : "") + '">Другой плеер</span>' +
      "</button>" +
      '<p class="subtle" style="text-align:center">' + (ext ? "Ролик откроется через внешний медиаплеер устройства." : "Ролик запустится во встроенном проигрывателе внутри приложения.") + "</p>" +
    "</div>" +
    '<button type="button" class="btn dl wide" id="off-all" style="margin-top:24px">Скачать всё</button>';
  var i, item, id;
  for (i = 0; i < OFFLINE.items.length; i++) {
    item = OFFLINE.items[i];
    id = item.id;
    html += '<div class="off-row"><b>' + esc(item.title) + "</b><span>" + esc(offlineCodeLabel(item)) + " · " + formatBytes(item.size);
    if (item.duration) html += " · " + esc(item.duration);
    if (OFFLINE.busy === id) html += " · " + (OFFLINE.prog[id] || 0) + "%";
    if (OFFLINE.err[id]) html += " · " + esc(OFFLINE.err[id]);
    html += "</span><div class=\"links\">";
    if (OFFLINE.cached[id]) {
      html += '<button type="button" class="btn off" data-off-play="' + esc(id) + '">' + (item.kind === "call" || /\.mp3$/i.test(item.file || "") ? "Слушать" : "Смотреть") + "</button>";
      html += '<button type="button" class="btn danger" data-off-del="' + esc(id) + '">Удалить</button>';
    } else {
      html += offlineBtnHtml(item);
    }
    html += "</div></div>";
  }
  return shell(html, "about");
}

function clickOffline(id) {
  if (!isPaid()) {
    openPaidModal();
    return;
  }
  var items = OFFLINE.items || [];
  var item = null, i;
  for (i = 0; i < items.length; i++) if (items[i].id === id) item = items[i];
  if (!item) return;
  if (OFFLINE.busy === id) {
    if (window.YurecNative && window.YurecNative.cancel) window.YurecNative.cancel(id);
    OFFLINE.busy = "";
    paintOfflineButtons();
    bindOfflineBtns();
    return;
  }
  if (OFFLINE.cached[id]) {
    playOfflineItem(id, item.title);
    return;
  }
  OFFLINE.busy = id;
  OFFLINE.prog[id] = 0;
  OFFLINE.err[id] = "";
  paintOfflineButtons();
  bindOfflineBtns();
  if (window.YurecNative && window.YurecNative.download) {
    window.YurecNative.download(JSON.stringify({ id: item.id, url: item.url, size: item.size, sha256: item.sha256, ext: item.ext || (/\.mp3$/i.test(item.file || "") || item.kind === "call" ? "mp3" : "mp4") }));
  } else {
    OFFLINE.err[id] = "Скачивание только в приложении Android";
    OFFLINE.busy = "";
    paintOfflineButtons();
    bindOfflineBtns();
  }
}
function paintOfflineButtons() {
  var nodes = document.querySelectorAll("[data-off]");
  var i, btn, id, item, html, wrap;
  for (i = 0; i < nodes.length; i++) {
    btn = nodes[i];
    id = btn.getAttribute("data-off");
    item = null;
    for (var j = 0; j < OFFLINE.items.length; j++) if (OFFLINE.items[j].id === id) item = OFFLINE.items[j];
    if (!item) continue;
    html = offlineBtnHtml(item);
    wrap = document.createElement("div");
    wrap.innerHTML = html;
    if (wrap.firstChild) btn.parentNode.replaceChild(wrap.firstChild, btn);
  }
}
function bindOfflineBtns() {
  var nodes = document.querySelectorAll("[data-off]");
  var i;
  for (i = 0; i < nodes.length; i++) {
    nodes[i].addEventListener("click", function (e) {
      e.preventDefault();
      clickOffline(this.getAttribute("data-off"));
    });
  }
}
window.yurecOfflineEvent = function (ev) {
  if (!ev || !ev.id) return;
  if (ev.state === "downloading") {
    OFFLINE.busy = ev.id;
    OFFLINE.prog[ev.id] = ev.progress || 0;
    OFFLINE.err[ev.id] = "";
  } else if (ev.state === "cached") {
    OFFLINE.cached[ev.id] = true;
    if (OFFLINE.busy === ev.id) OFFLINE.busy = "";
    OFFLINE.prog[ev.id] = 100;
    OFFLINE.err[ev.id] = "";
  } else if (ev.state === "error") {
    if (OFFLINE.busy === ev.id) OFFLINE.busy = "";
    OFFLINE.err[ev.id] = ev.error || "Ошибка";
  } else {
    if (OFFLINE.busy === ev.id) OFFLINE.busy = "";
    if (ev.state === "idle") OFFLINE.cached[ev.id] = false;
  }
  if (route().indexOf("/offline") === 0 || route().indexOf("/donate") === 0) {
    paint();
    return;
  }
  paintOfflineButtons();
  bindOfflineBtns();
};


function $(sel, root) {
  return (root || document).querySelector(sel);
}
function esc(s) {
  var amp = String.fromCharCode(38);
  return String(s == null ? "" : s)
    .split(amp).join(amp + "amp;")
    .split(String.fromCharCode(60)).join(amp + "lt;")
    .split(String.fromCharCode(62)).join(amp + "gt;")
    .split(String.fromCharCode(34)).join(amp + "quot;");
}
function fold(s) {
  return String(s == null ? "" : s).toLowerCase().split("ё").join("е").split("Ё").join("е");
}
function ruCount(n, kind) {
  var n10 = n % 10, n100 = n % 100;
  function form(one, few, many) {
    if (n10 === 1 && n100 !== 11) return n + " " + one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return n + " " + few;
    return n + " " + many;
  }
  if (kind === "all") return form("публикация", "публикации", "публикаций");
  if (kind === "episode") return form("рассказ", "рассказа", "рассказов");
  if (kind === "song") return form("песня", "песни", "песен");
  if (kind === "visit") return form("визит", "визита", "визитов");
  return form("бонус", "бонуса", "бонусов");
}
function route() {
  var h = (location.hash || "#/").replace(/^#/, "") || "/";
  return h.charAt(0) === "/" ? h : "/" + h;
}
function go(path) {
  location.hash = path.charAt(0) === "#" ? path.slice(1) : path;
}
function books() {
  try {
    var raw = JSON.parse(localStorage.getItem(BOOK_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}
function setBooks(list) {
  try { localStorage.setItem(BOOK_KEY, JSON.stringify(list)); } catch (e) {}
}
function isDev() {
  try { return localStorage.getItem(DEV_KEY) === "1"; } catch (e) { return false; }
}
function isPaid() {
  try {
    if (localStorage.getItem(DEV_KEY) === "1") return true;
    return localStorage.getItem(PAID_KEY) === "1";
  } catch (e) { return false; }
}
function tryUnlock(v) {
  var s = String(v == null ? "" : v).replace(/^\s+|\s+$/g, "");
  if (window.YurecGate && window.YurecGate.dev(s)) return unlockDeveloper(s);
  if (!(window.YurecGate && window.YurecGate.paid(s))) return false;
  try { localStorage.setItem(PAID_KEY, "1"); } catch (e) {}
  return true;
}
function unlockDeveloper(v) {
  var s = String(v == null ? "" : v).replace(/^\s+|\s+$/g, "");
  if (!(window.YurecGate && window.YurecGate.dev(s))) return false;
  try {
    localStorage.setItem(DEV_KEY, "1");
    localStorage.setItem(PAID_KEY, "1");
  } catch (e) {}
  return true;
}
function lockPaid() {
  try {
    localStorage.removeItem(PAID_KEY);
    localStorage.removeItem("yurec-celebrate");
    localStorage.removeItem(DEV_KEY);
  } catch (e) {}
}
function readAppIcon() {
  try { return localStorage.getItem(ICON_KEY) === "horror" ? "horror" : "comedy"; } catch (e) { return "comedy"; }
}
function readAppName() {
  try {
    var n = localStorage.getItem(NAME_KEY);
    if (n === "saga" || n === "arthouse") return n;
  } catch (e) {}
  return "short";
}
function appNameLabel(id) {
  if (id === "saga") return "Жизнь Юрца: Комедийная сага";
  if (id === "arthouse") return "Жизнь Юрца: Артхаусный хоррор";
  return "Жизнь Юрца";
}
function pushLauncher(icon, name) {
  try { document.title = appNameLabel(name); } catch (e) {}
  try {
    if (window.YurecNative && typeof window.YurecNative.setLauncher === "function") {
      window.YurecNative.setLauncher(icon, name);
    } else if (window.YurecNative && typeof window.YurecNative.setAppIcon === "function") {
      window.YurecNative.setAppIcon(icon);
    }
  } catch (e) {}
}
function setAppIcon(id) {
  var v = id === "horror" ? "horror" : "comedy";
  try { localStorage.setItem(ICON_KEY, v); } catch (e) {}
  pushLauncher(v, readAppName());
}
function setAppName(id) {
  var v = (id === "saga" || id === "arthouse") ? id : "short";
  try { localStorage.setItem(NAME_KEY, v); } catch (e) {}
  pushLauncher(readAppIcon(), v);
}
function applyStoredIcon() {
  pushLauncher(readAppIcon(), readAppName());
  try {
    if (window.YurecNative && typeof window.YurecNative.setWidgetInterval === "function") {
      window.YurecNative.setWidgetInterval(readWidgetHours());
    }
  } catch (e) {}
}
function readWidgetHours() {
  try {
    var n = Number(localStorage.getItem(WIDGET_KEY) || "24");
    if (n === 1 || n === 6 || n === 12 || n === 24) return n;
  } catch (e) {}
  return 24;
}
function setWidgetHours(h) {
  if (h !== 1 && h !== 6 && h !== 12) h = 24;
  try { localStorage.setItem(WIDGET_KEY, String(h)); } catch (e) {}
  try {
    if (window.YurecNative && typeof window.YurecNative.setWidgetInterval === "function") {
      window.YurecNative.setWidgetInterval(h);
    }
  } catch (e2) {}
}
function pinQuoteWidget() {
  try {
    if (window.YurecNative && typeof window.YurecNative.pinQuoteWidget === "function") {
      var r = window.YurecNative.pinQuoteWidget();
      if (r === "need" || r === "old") return r;
      return "ok";
    }
  } catch (e) {}
  return "web";
}
function brandMeta() {
  if (readAppIcon() === "horror") return { src: "icons/horror.jpg", kicker: "Артхаусный хоррор" };
  return { src: "icons/comedy.jpg", kicker: "Комедийная сага" };
}
function showBookNav() {
  try { return localStorage.getItem(BOOK_NAV_KEY) === "1"; } catch (e) { return false; }
}
function setBookNav(on) {
  try { localStorage.setItem(BOOK_NAV_KEY, on ? "1" : "0"); } catch (e) {}
}
function showInfoNav() {
  try { return localStorage.getItem(INFO_NAV_KEY) !== "0"; } catch (e) { return true; }
}
function setInfoNav(on) {
  try { localStorage.setItem(INFO_NAV_KEY, on ? "1" : "0"); } catch (e) {}
}
function showZashNav() {
  try { return localStorage.getItem(ZASH_NAV_KEY) !== "0"; } catch (e) { return true; }
}
function setZashNav(on) {
  try { localStorage.setItem(ZASH_NAV_KEY, on ? "1" : "0"); } catch (e) {}
}
function showAiNav() {
  try { return localStorage.getItem(AI_NAV_KEY) === "1"; } catch (e) { return false; }
}
function setAiNav(on) {
  try { localStorage.setItem(AI_NAV_KEY, on ? "1" : "0"); } catch (e) {}
}
function showAiTop() {
  try { return localStorage.getItem(AI_TOP_KEY) === "1"; } catch (e) { return false; }
}
function setAiTop(on) {
  try { localStorage.setItem(AI_TOP_KEY, on ? "1" : "0"); } catch (e) {}
}
function showAiKeep() {
  try { return localStorage.getItem(AI_KEEP_KEY) === "1"; } catch (e) { return false; }
}
function setAiKeep(on) {
  try {
    if (on) {
      var cur = sessionStorage.getItem("yurec-ai-log");
      if (cur && !localStorage.getItem("yurec-ai-log")) localStorage.setItem("yurec-ai-log", cur);
    }
    localStorage.setItem(AI_KEEP_KEY, on ? "1" : "0");
  } catch (e) {}
}
function chatStore() {
  try { return showAiKeep() ? localStorage : sessionStorage; } catch (e) { return sessionStorage; }
}
function showScrub() {
  try { return localStorage.getItem(SCRUB_KEY) === "1"; } catch (e) { return false; }
}
function setScrub(on) {
  try { localStorage.setItem(SCRUB_KEY, on ? "1" : "0"); } catch (e) {}
}
function showVibrate() {
  try { return localStorage.getItem(VIBRATE_KEY) !== "0"; } catch (e) { return true; }
}
function setVibrate(on) {
  try { localStorage.setItem(VIBRATE_KEY, on ? "1" : "0"); } catch (e) {}
}
function showSound() {
  try { return localStorage.getItem(SOUND_KEY) !== "0"; } catch (e) { return true; }
}
function setSound(on) {
  try { localStorage.setItem(SOUND_KEY, on ? "1" : "0"); } catch (e) {}
}
function showKeepAwake() {
  try { return localStorage.getItem(AWAKE_KEY) !== "0"; } catch (e) { return true; }
}
function setKeepAwake(on) {
  try { localStorage.setItem(AWAKE_KEY, on ? "1" : "0"); } catch (e) {}
  applyKeepAwake();
}
function applyKeepAwake() {
  var on = showKeepAwake();
  try {
    if (window.YurecNative && typeof window.YurecNative.setKeepScreenOn === "function") {
      window.YurecNative.setKeepScreenOn(on);
    }
  } catch (e) {}
  try {
    if (!on) {
      if (window._yurecWake) {
        try { window._yurecWake.release(); } catch (e2) {}
        window._yurecWake = null;
      }
      return;
    }
    if (document.visibilityState !== "visible") return;
    if (!navigator.wakeLock || !navigator.wakeLock.request) return;
    navigator.wakeLock.request("screen").then(function (sent) {
      if (!showKeepAwake()) {
        try { sent.release(); } catch (e3) {}
        return;
      }
      window._yurecWake = sent;
      sent.addEventListener("release", function () {
        if (window._yurecWake === sent) window._yurecWake = null;
      });
    }).catch(function () {});
  } catch (e) {}
}
var GAME_FACTORY = ["quest", "crosswords", "av", "ark", "svoya"];
function readGameOrder() {
  try {
    var raw = localStorage.getItem(GAME_ORDER_KEY);
    var parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return parsed.filter(function (x) { return typeof x === "string"; });
  } catch (e) {}
  return [];
}
function orderedGameIds() {
  var saved = readGameOrder();
  var seen = {};
  var out = [];
  var i, id;
  for (i = 0; i < saved.length; i++) {
    id = saved[i];
    if (GAME_FACTORY.indexOf(id) >= 0 && !seen[id]) { out.push(id); seen[id] = 1; }
  }
  for (i = 0; i < GAME_FACTORY.length; i++) {
    id = GAME_FACTORY[i];
    if (!seen[id]) out.push(id);
  }
  return out;
}
function setGameOrder(ids) {
  var next = orderedGameIds();
  if (ids && ids.length) {
    var seen = {};
    next = [];
    var i, id;
    for (i = 0; i < ids.length; i++) {
      id = ids[i];
      if (GAME_FACTORY.indexOf(id) >= 0 && !seen[id]) { next.push(id); seen[id] = 1; }
    }
    for (i = 0; i < GAME_FACTORY.length; i++) {
      id = GAME_FACTORY[i];
      if (!seen[id]) next.push(id);
    }
  }
  var same = next.length === GAME_FACTORY.length;
  for (var j = 0; j < next.length; j++) if (next[j] !== GAME_FACTORY[j]) same = false;
  try {
    if (same) localStorage.removeItem(GAME_ORDER_KEY);
    else localStorage.setItem(GAME_ORDER_KEY, JSON.stringify(next));
  } catch (e) {}
}
function resetGameOrder() {
  try { localStorage.removeItem(GAME_ORDER_KEY); } catch (e) {}
}
function hasCustomGameOrder() {
  var ids = orderedGameIds();
  for (var i = 0; i < GAME_FACTORY.length; i++) if (ids[i] !== GAME_FACTORY[i]) return true;
  return false;
}
function readTheme() {
  try {
    var v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "black" || v === "system") return v;
    if (localStorage.getItem(PAPER_KEY) === "1") return "light";
  } catch (e) {}
  return "dark";
}
function resolveTheme(choice) {
  choice = choice || readTheme();
  if (choice === "system") {
    try {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch (e) { return "dark"; }
  }
  return choice;
}
function applyTheme(choice) {
  var resolved = resolveTheme(choice);
  var root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  try { root.style.colorScheme = resolved === "light" ? "light" : "dark"; } catch (e) {}
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "light" ? "#e7dfd0" : resolved === "black" ? "#000000" : "#0b0b0c");
}
function setTheme(next) {
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  applyTheme(next);
}
function cycleTheme() {
  setTheme(resolveTheme() === "light" ? "dark" : "light");
}
function deviceInfoLine() {
  return (deviceInfoBlock().split("\n")[0] || "браузер");
}
function deviceInfoBlock() {
  var lines = [];
  try {
    if (window.YurecNative && typeof window.YurecNative.deviceInfo === "function") {
      var s = window.YurecNative.deviceInfo();
      if (s) {
        var nativeLines = String(s).split(/\n+/);
        for (var i = 0; i < nativeLines.length; i++) if (nativeLines[i]) lines.push(nativeLines[i]);
      }
    }
  } catch (e) {}
  try {
    var n = navigator;
    var ua = n.userAgent || "";
    var hasUa = false;
    for (var u = 0; u < lines.length; u++) if (lines[u].indexOf("UA:") === 0 || lines[u].indexOf("Браузер:") === 0) hasUa = true;
    if (!hasUa && ua) lines.push("UA: " + ua);
    if (n.platform) lines.push("Платформа: " + n.platform);
    if (n.language) lines.push("Язык: " + n.language + (n.languages ? " (" + Array.prototype.join.call(n.languages, ", ") + ")" : ""));
    if (typeof n.hardwareConcurrency === "number") lines.push("Потоки CPU: " + n.hardwareConcurrency);
    if (typeof n.deviceMemory === "number") lines.push("ОЗУ (оценка): " + n.deviceMemory + " ГБ");
    if (n.connection) {
      var c = n.connection;
      var bits = [];
      if (c.effectiveType) bits.push(c.effectiveType);
      if (c.downlink) bits.push(c.downlink + " Мбит/с");
      if (c.rtt) bits.push("rtt " + c.rtt + " мс");
      if (bits.length) lines.push("Сеть: " + bits.join(" · "));
    }
    lines.push("Онлайн: " + (n.onLine ? "да" : "нет"));
    var sc = window.screen;
    lines.push("Экран JS: " + sc.width + "×" + sc.height + " · окно " + window.innerWidth + "×" + window.innerHeight + " · dpr " + (window.devicePixelRatio || 1));
    if (window.visualViewport) {
      lines.push("visualViewport: " + Math.round(window.visualViewport.width) + "×" + Math.round(window.visualViewport.height));
    }
    lines.push("Касания: " + (n.maxTouchPoints || 0));
    try { lines.push("Пояс: " + Intl.DateTimeFormat().resolvedOptions().timeZone); } catch (tz) {}
    var theme = document.documentElement.getAttribute("data-theme") || "";
    var wide = document.documentElement.getAttribute("data-wide") || "";
    if (theme) lines.push("Тема: " + theme);
    if (wide) lines.push("Широкий экран: " + (wide === "1" ? "да" : "нет"));
    try {
      var paid = localStorage.getItem("yurec-license");
      var dev = localStorage.getItem("yurec-dev");
      lines.push("Лицензия: " + (dev === "1" ? "разработчик" : paid ? "есть" : "нет"));
    } catch (lic) {}
  } catch (e2) {}
  if (!lines.length) return "браузер";
  var seen = {};
  var out = [];
  for (var k = 0; k < lines.length; k++) {
    if (seen[lines[k]]) continue;
    seen[lines[k]] = 1;
    out.push(lines[k]);
  }
  return out.join("\n");
}
function buildBugBody(text) {
  var ver = (APP && APP.version) ? APP.version : "1.50.4";
  return "Баг в «Жизнь Юрца»\n\n" + String(text || "").replace(/^\s+|\s+$/g, "") +
    "\n\n— — —\n" +
    (ver ? "Версия: " + ver + "\n" : "") +
    deviceInfoBlock() +
    "\n\n(Если есть скриншот или запись экрана — прикрепите к письму или пришлите следом в Telegram.)";
}
function readSlugs() {
  try {
    var raw = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function readSkip() {
  try {
    var raw = JSON.parse(localStorage.getItem(READ_SKIP) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function isRead(slug) {
  return readSlugs().indexOf(slug) !== -1;
}
function canAutoMark(slug) {
  return readSkip().indexOf(slug) === -1;
}
function markRead(slug, force) {
  if (!slug) return;
  if (!force && !canAutoMark(slug)) return;
  var list = readSlugs();
  if (list.indexOf(slug) === -1) list.unshift(slug);
  var skip = readSkip().filter(function (s) { return s !== slug; });
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(list));
    localStorage.setItem(READ_SKIP, JSON.stringify(skip));
  } catch (e) {}
}
function unmarkRead(slug) {
  if (!slug) return;
  var list = readSlugs().filter(function (s) { return s !== slug; });
  var skip = readSkip();
  if (skip.indexOf(slug) === -1) skip.unshift(slug);
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(list));
    localStorage.setItem(READ_SKIP, JSON.stringify(skip));
  } catch (e) {}
}
function toggleRead(slug) {
  if (isRead(slug)) unmarkRead(slug);
  else markRead(slug, true);
}
function clearAllRead() {
  try {
    localStorage.setItem(READ_KEY, "[]");
    localStorage.setItem(READ_SKIP, "[]");
  } catch (e) {}
}
function readCount() {
  return readSlugs().length;
}
function formatSpan(ms) {
  var sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return sec + " сек";
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  if (s === 0) return m + " мин";
  return m + " мин " + s + " сек";
}
function rankByMs(ms, names) {
  var min = ms / 60000;
  if (min < 1) return names[0];
  if (min < 3) return names[1];
  if (min < 5) return names[2];
  if (min < 7) return names[3];
  return names[4];
}
function crosswordFlavor(ms) {
  var rank = rankByMs(ms, ["читер", "читатель", "задрот", "зануда", "алкаш"]);
  var tail = {
    "читер": "Гоша даже клюв не успел открыть.",
    "читатель": "Газету «Вечерний Шотман» вы, видимо, всё-таки читаете.",
    "задрот": "Сетка стала личной обидой. Уважаем.",
    "зануда": "Золотое слово уже стыдилось за вас.",
    "алкаш": "Пока вы думали, Юрец успел сбегать в ларёк дважды."
  };
  return "На этот раз вы потратили " + formatSpan(ms) + " на разгадывание кроссворда! Звание: " + rank + ". " + tail[rank];
}
function questFlavor(ms) {
  var rank = rankByMs(ms, ["ясновидец", "гуляка", "сменщик", "вахтёр", "пациент вытрезвителя"]);
  var tail = {
    "ясновидец": "Юрец орёт, что вы подглядывали в сценарий.",
    "гуляка": "Двор пройден без лишней драмы. Почти.",
    "сменщик": "Как смена в «Олимпике», только без линолеума.",
    "вахтёр": "Сидели долго, чай остыл, концовка всё равно та же.",
    "пациент вытрезвителя": "Маршрут потерялся между шагом и рюмкой."
  };
  return "Этот заход занял " + formatSpan(ms) + ". Звание: " + rank + ". " + tail[rank];
}
function cwStartKey(id) { return "yurec-cw-t:" + id; }
function cwLastKey(id) { return "yurec-cw-last:" + id; }
function qStartKey(id) { return "yurec-quest-t:" + id; }
function qLastKey(id) { return "yurec-quest-last:" + id; }
function readTimer(key) {
  try {
    var n = Number(localStorage.getItem(key) || "");
    return isFinite(n) && n > 0 ? n : null;
  } catch (e) { return null; }
}
function writeTimer(key, n) {
  try { localStorage.setItem(key, String(n)); } catch (e) {}
}
function dropTimer(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}
function startCwTimer(id, restart) {
  if (restart || readTimer(cwStartKey(id)) == null) writeTimer(cwStartKey(id), Date.now());
}
function finishCwTimer(id) {
  var start = readTimer(cwStartKey(id));
  var ms = start ? Math.max(0, Date.now() - start) : readTimer(cwLastKey(id));
  if (ms == null) return null;
  writeTimer(cwLastKey(id), ms);
  dropTimer(cwStartKey(id));
  return ms;
}
function readCwLast(id) { return readTimer(cwLastKey(id)); }
function clearCwTimer(id) { dropTimer(cwStartKey(id)); dropTimer(cwLastKey(id)); }
function startQuestTimer(id, restart) {
  if (restart || readTimer(qStartKey(id)) == null) writeTimer(qStartKey(id), Date.now());
}
function finishQuestTimer(id) {
  var start = readTimer(qStartKey(id));
  var ms = start ? Math.max(0, Date.now() - start) : readTimer(qLastKey(id));
  if (ms == null) return null;
  writeTimer(qLastKey(id), ms);
  dropTimer(qStartKey(id));
  return ms;
}
function readQuestLast(id) { return readTimer(qLastKey(id)); }
function clearQuestTimer(id) { dropTimer(qStartKey(id)); dropTimer(qLastKey(id)); }
function licenseLabel() {
  if (isDev()) return "Разработчик";
  if (isPaid()) return "Приобретена";
  return "Отсутствует";
}
function parseEpisodeCode(code, title) {
  var src = String(code || "") + " " + String(title || "");
  var m = src.match(/s\s*(\d+)\s*e\s*(\d+)([a-z])?/i);
  if (!m) return null;
  var teaser = /\(тизер\)|\bтизер\b/i.test(src) ? 0 : 1;
  var suffix = m[3] ? m[3].toLowerCase().charCodeAt(0) - 96 : 0;
  return { season: Number(m[1]), episode: Number(m[2]), suffix: suffix, teaser: teaser };
}
function displayEpisodeCode(code, title) {
  var k = parseEpisodeCode(code, title);
  if (!k) return code || "";
  var letter = k.suffix ? String.fromCharCode(96 + k.suffix) : "";
  var s = String(k.season);
  var e = String(k.episode);
  if (s.length < 2) s = "0" + s;
  if (e.length < 2) e = "0" + e;
  return "s" + s + "e" + e + letter;
}
function episodeRank(code, title) {
  var k = parseEpisodeCode(code, title);
  if (!k) return null;
  return k.season * 1000000 + k.episode * 1000 + k.suffix * 10 + k.teaser;
}
function isEpisodeItem(item) {
  if (item.kind && item.kind !== "episode") return false;
  return episodeRank(item.code, item.title) != null;
}
function alphaTitle(item) {
  return String(item.title || "").replace(/s\s*\d+\s*e\s*\d+[a-z]?\s*[—\-:.]?\s*/i, "").replace(/^\s+|\s+$/g, "");
}
function applyOrder(list, mode) {
  var copy = list.slice();
  var i, d;
  if (mode === "az" || mode === "za") {
    copy.sort(function (a, b) {
      var t = alphaTitle(a).localeCompare(alphaTitle(b), "ru");
      return mode === "za" ? -t : t;
    });
    return copy;
  }
  var newest = mode === "new";
  var episodes = [];
  var others = [];
  for (i = 0; i < copy.length; i++) {
    if (isEpisodeItem(copy[i])) episodes.push(copy[i]);
    else others.push(copy[i]);
  }
  function byDateTitle(a, b, rev) {
    d = String(a.date || "").localeCompare(String(b.date || ""));
    if (d) return rev ? -d : d;
    return String(a.title || "").localeCompare(String(b.title || ""), "ru");
  }
  if (!others.length) {
    copy.sort(function (a, b) {
      var ra = episodeRank(a.code, a.title);
      var rb = episodeRank(b.code, b.title);
      if (ra != null && rb != null && ra !== rb) return newest ? rb - ra : ra - rb;
      return byDateTitle(a, b, newest);
    });
    return copy;
  }
  if (!episodes.length) {
    copy.sort(function (a, b) { return byDateTitle(a, b, newest); });
    return copy;
  }
  episodes.sort(function (a, b) {
    return (episodeRank(a.code, a.title) || 0) - (episodeRank(b.code, b.title) || 0);
  });
  others.sort(function (a, b) { return byDateTitle(a, b, false); });
  var result = episodes.slice();
  for (i = 0; i < others.length; i++) {
    var extra = others[i];
    var idx = result.length;
    var j;
    for (j = 0; j < result.length; j++) {
      if (isEpisodeItem(result[j]) && String(result[j].date || "") > String(extra.date || "")) {
        idx = j;
        break;
      }
    }
    result.splice(idx, 0, extra);
  }
  return newest ? result.reverse() : result;
}
function channelForCat(id) {
  if (id === "video") return { href: YT, kind: "yt" };
  if (id === "shorts" || id === "songs") return { href: YT_SHORTS, kind: "yt" };
  return { href: TG, kind: "tg" };
}
function formatCode(s) {
  return s.kind === "episode" ? displayEpisodeCode(s.code, s.title) : (KIND_LABEL[s.kind] || s.kind);
}
function bySlug(slug) {
  return stories.find(function (s) { return s.slug === slug; });
}
function filtered() {
  var q = fold(state.q).replace(/^\s+|\s+$/g, "");
  var list = stories.filter(function (s) {
    if (state.kind !== "all" && s.kind !== state.kind) return false;
    if (!q) return true;
    var blob = fold(
      [s.title, s.code, s.excerpt, s.body, (s.tags || []).join(" ")].join("\n")
    );
    return blob.indexOf(q) !== -1;
  });
  return applyOrder(list, state.sort);
}

function videoCover(v) {
  if (v.thumb) return String(v.thumb).replace(/^\//, "").replace(/\?.*$/, "");
  if (v.mediaType === "image") return "";
  if (v.kind === "episode" && v.code) {
    var t = String(v.title || "");
    if (t.indexOf("тизер") !== -1) return "thumbs/" + v.code + "-teaser.jpg";
    return "thumbs/" + v.code + ".jpg";
  }
  if (v.storySlug) return "thumbs/" + v.storySlug + ".jpg";
  return "";
}
function ytRemoteThumb(id) {
  return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
}
function coverLast(kind) {
  if (kind === "song") return BANNER.song;
  return BANNER.episode;
}
function yurecCoverErr(img) {
  if (!img) return;
  var step = img.getAttribute("data-cover-step") || "0";
  if (step === "0") {
    var fb = img.getAttribute("data-fb");
    if (fb) {
      img.setAttribute("data-cover-step", "1");
      img.src = fb;
      img.setAttribute("data-zoom", fb);
      return;
    }
  }
  img.setAttribute("data-cover-step", "2");
  img.onerror = null;
  var last = img.getAttribute("data-last");
  if (last) {
    img.src = last;
    img.setAttribute("data-zoom", last);
  }
}
function coverImgHtml(v, cls) {
  var src = videoCover(v);
  if (!src) return "";
  var fb = v.id && v.mediaType !== "image" ? ytRemoteThumb(v.id) : "";
  var last = coverLast(v.kind);
  var html = '<img src="' + esc(src) + '" alt="" referrerpolicy="no-referrer" decoding="async" data-zoom="' + esc(src) + '"';
  if (cls) html += ' class="' + cls + '"';
  if (fb) html += ' data-fb="' + esc(fb) + '"';
  html += ' data-last="' + esc(last) + '" onerror="yurecCoverErr(this)" />';
  return html;
}

function formatRuDate(iso) {
  var p = String(iso || "").split("-");
  if (p.length < 3) return iso || "";
  return p[2] + "." + p[1] + "." + p[0];
}
function pressTitle(issue) {
  var base = "Выпуск №" + issue.number + " от " + formatRuDate(issue.date);
  return issue.headline ? base + " — " + issue.headline : base;
}
function sortLabel() {
  if (state.sort === "new") return "↑ Новые";
  if (state.sort === "az") return "А↓Я";
  if (state.sort === "za") return "Я↑А";
  return "↓ Старые";
}
function cycleSort() {
  var order = ["old", "new", "az", "za"];
  var i = order.indexOf(state.sort);
  state.sort = order[(i + 1) % order.length];
  try { localStorage.setItem(SORT_KEY, state.sort); } catch (e) {}
}

function iconSun() {
  return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
}
function iconMoon() {
  return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>';
}
function iconGear() {
  return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
}
function iconSpark() {
  return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>';
}
function iconBook(on) {
  if (on) {
    return '<svg class="i" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';
  }
  return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';
}
function navIco(inner) {
  return '<span class="navico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg></span>";
}

function card(s) {
  var read = isRead(s.slug);
  var pill = s.kind === "episode"
    ? '<button type="button" class="read-pill' + (read ? "" : " off") + '" data-read-toggle="' + esc(s.slug) + '">' +
      (read ? "прочитано" : "не прочитано") + "</button>"
    : "";
  return '<a class="card" href="#/story/' + esc(s.slug) + '">' +
    '<div class="meta"><span class="meta-left"><span class="badge' + (s.kind === "episode" ? " ep" : "") + '">' + esc(formatCode(s)) + "</span>" +
    pill +
    "</span><span>" +
    s.minutes + " мин" + (s.youtubeId ? (s.kind === "song" ? " · музыка" : " · видео") : "") + "</span></div>" +
    "<h2>" + esc(s.title) + "</h2>" +
    '<p class="excerpt">' + esc(s.excerpt) + "</p>" +
    (s.kind === "sms" && s.youtubeId ? '<img class="card-cover" src="thumbs/' + esc(s.slug) + '.jpg" alt="" />' : "") +
    "</a>";
}

function shell(inner, active, mediaCat, flags) {
  flags = flags || {};
  function onNav(id) { return active === id ? "on" : ""; }
  function onMedia(id) { return mediaCat === id ? "on" : ""; }
  var isMedia = active === "videos";
  var sub = "";
  if (isMedia) {
    sub = '<nav class="subnav" aria-label="Разделы медиа">' +
      '<a href="#/videos/video" class="' + onMedia("video") + '" aria-label="Видео">' +
        navIco('<rect x="2" y="2" width="20" height="20" rx="2.5"/><path d="M7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 7h5M17 17h5"/>') +
        "<span>Видео</span></a>" +
      '<a href="#/videos/shorts" class="' + onMedia("shorts") + '" aria-label="Shorts">' +
        navIco('<rect x="7" y="2" width="10" height="20" rx="2"/>') +
        "<span>Shorts</span></a>" +
      '<a href="#/videos/songs" class="' + onMedia("songs") + '" aria-label="Песни">' +
        navIco('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') +
        "<span>Песни</span></a>" +
      '<a href="#/videos/press" class="' + onMedia("press") + '" aria-label="Газета">' +
        navIco('<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>') +
        "<span>Газета</span></a>" +
      '<a href="#/videos/call" class="' + onMedia("call") + '" aria-label="Звонки">' +
        navIco('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>') +
        "<span>Звонки</span></a>" +
      '<a href="#/videos/other" class="' + onMedia("other") + '" aria-label="Другое">' +
        navIco('<rect x="3" y="5" width="14" height="14" rx="2"/><circle cx="9.5" cy="10.5" r="1.5"/><path d="m21 15-5-5-3 3-4-4"/><path d="M21 11v8a2 2 0 0 1-2 2H7"/>') +
        "<span>Другое</span></a>" +
      "</nav>";
  }
  var light = resolveTheme() === "light";
  var booksOn = showBookNav();
  var infoOn = showInfoNav();
  var zashOn = showZashNav();
  var aiOn = showAiNav();
  var nNav = 5 + (aiOn ? 1 : 0) + (booksOn ? 1 : 0) + (zashOn ? 1 : 0) + (infoOn ? 1 : 0);
  var navMod = nNav >= 9 ? " nav-9" : nNav >= 8 ? " nav-8" : nNav >= 7 ? " nav-7" : nNav === 6 ? "" : nNav === 5 ? " nav-5" : " nav-4";
  var brand = brandMeta();
  var header = '<header class="top">' +
      '<button type="button" class="brandbtn" data-zoom="' + brand.src + '" aria-label="Открыть баннер">' +
        '<img src="' + brand.src + '" alt="" />' +
        '<div><div class="kicker">' + brand.kicker + '</div><div class="brand">Жизнь Юрца</div></div>' +
      "</button>" +
      '<div class="top-actions">' +
        (showAiTop() ? '<a class="iconbtn" href="#/chat" aria-label="Юрец AI">' + iconSpark() + "</a>" : "") +
        '<button type="button" class="iconbtn" id="theme-btn" aria-label="Тема оформления">' + (light ? iconMoon() : iconSun()) + "</button>" +
        '<a class="iconbtn" href="#/settings" aria-label="Настройки">' + iconGear() + "</a>" +
      "</div></header>";
  var nav = '<nav class="nav' + navMod + '">' +
    '<a href="#/" class="' + onNav("home") + '">' + navIco('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>') + "<span>Сборник</span></a>" +
    '<a href="#/citats" class="' + onNav("citats") + '">' + navIco('<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>') + "<span>Цитатник</span></a>" +
    '<a href="#/videos" class="' + onNav("videos") + '">' + navIco('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M8 6V4M16 6V4"/>') + "<span>Медиа</span></a>" +
    '<a href="#/game" class="' + onNav("game") + '"><span class="navico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><circle cx="7" cy="7" r=".9" fill="currentColor" stroke="none"/><circle cx="17" cy="17" r=".9" fill="currentColor" stroke="none"/></svg></span><span>Игры</span></a>';
  if (aiOn) {
    nav += '<a href="#/chat" class="' + onNav("chat") + '"><span class="navico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg><span class="beta">бета</span></span><span>Юрец AI</span></a>';
  }
  nav += '<a href="#/characters" class="' + onNav("chars") + '">' + navIco('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') + "<span>Герои</span></a>";
  if (booksOn) {
    nav += '<a href="#/saved" class="' + onNav("saved") + '">' + navIco('<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>') + "<span>Закладки</span></a>";
  }
  if (zashOn) {
    nav += '<a href="#/zashkvary" class="' + onNav("zash") + '">' + navIco('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>') + "<span>Зашквары</span></a>";
  }
  if (infoOn) {
    nav += '<a href="#/about" class="' + onNav("about") + '">' + navIco('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>') + "<span>Инфо</span></a>";
  }
  nav += "</nav>";
  var hideDock = !!flags.hideDock;
  return '<div class="app' + (isMedia ? " media" : "") + (active === "chat" ? " chat" : "") + (hideDock ? " av-play" : "") + '">' +
    header +
    '<div class="page">' + inner + "</div>" +
    (hideDock ? "" : '<div class="dock">' + sub + nav + "</div>") +
    '<button type="button" class="totop" id="totop" aria-label="Наверх">↑</button></div>';
}

function citatOfDay() {
  if (!CITATS || !CITATS.length) return null;
  if (window._yurecSessionCitat) return window._yurecSessionCitat;
  var last = "";
  try { last = localStorage.getItem("yurec-citat-last") || ""; } catch (e) {}
  var pool = [], i;
  for (i = 0; i < CITATS.length; i++) if (CITATS[i].id !== last) pool.push(CITATS[i]);
  if (!pool.length) pool = CITATS;
  var pick = pool[Math.floor(Math.random() * pool.length)];
  window._yurecSessionCitat = pick;
  try { if (pick && pick.id) localStorage.setItem("yurec-citat-last", pick.id); } catch (e2) {}
  return pick;
}

function renderHome() {
  var list = filtered();
  var last = null;
  try { last = JSON.parse(localStorage.getItem(LAST_KEY) || "null"); } catch (e) {}
  var cont = last ? bySlug(last.slug) : null;
  var bsrc = BANNER[state.kind] || BANNER.all;
  var html = '<section class="hero" data-zoom="' + bsrc + '" role="button" aria-label="Открыть баннер"><img src="' + bsrc + '" alt="" /><div class="cap">' +
    '<div class="kicker">Сборник рассказов</div><h2>Жизнь Юрца</h2>' +
    '<p class="muted">рассказы · ролики · песни · игры</p></div></section>';
  if (CITATS && CITATS.length) {
    var qd = citatOfDay();
    if (qd) {
      html += '<a class="card quote-day" href="#/citats">' +
        '<div class="kicker">Цитата дня</div>' +
        '<p class="quote-text">«' + esc(qd.text) + '»</p>' +
        '<p class="subtle">' + esc(qd.speaker) + " · " + CITATS.length + " в цитатнике</p></a>";
    }
  }
  if (cont && last && last.percent > 3 && last.percent < 99) {
    html += '<a class="card" href="#/story/' + esc(cont.slug) + '"><div class="kicker">Продолжить</div><h2>' +
      esc(cont.title) + "</h2></a>";
  }
  html += '<div class="home-sticky">';
  html += '<input class="search" id="q" placeholder="Найти Юрца, Зинаиду, Гошу…" value="' + esc(state.q) + '" />';
  html += '<div class="chips" id="chips">';
  for (var i = 0; i < KINDS.length; i++) {
    var id = KINDS[i][0];
    var label = KINDS[i][1];
    html += '<button class="chip' + (state.kind === id ? " on" : "") + '" data-kind="' + id + '">' + label + "</button>";
  }
  html += '<button class="chip" id="rand">Случайный</button></div>';
  html += '<div class="statrow"><span class="stat">' + ruCount(list.length, state.kind) + "</span>" +
    '<div class="sort-actions"><button class="chip sort-chip" id="sort">' + sortLabel() + "</button>" +
    '<a class="btn tg" href="' + TG + '">Канал</a></div></div></div>';
  html += '<div id="list" class="board">';
  if (!list.length) html += '<p class="empty">По этому запросу на Шотмана тишина.</p>';
  else for (var j = 0; j < list.length; j++) html += card(list[j]);
  html += "</div>";
  return shell(html, "home");
}

function parseSms(body) {
  var lines = String(body || "").split("\n");
  var intro = [];
  var messages = [];
  var cur = null;
  var started = false;
  var dateRe = /^(\d{1,2} [а-яёА-ЯЁ]+ \d{4}, \d{1,2}:\d{2})(?:\s*[:—]\s*(.*))?$/;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/^\s+|\s+$/g, "");
    var m = line.match(dateRe);
    if (m) {
      if (cur && cur.text) messages.push(cur);
      cur = { at: m[1], text: m[2] ? m[2].replace(/^\s+|\s+$/g, "") : "" };
      started = true;
    } else if (!started) {
      if (line) intro.push(line);
    } else if (!line) {
      if (cur && cur.text) { messages.push(cur); cur = null; }
    } else if (cur) {
      cur.text = cur.text ? cur.text + "\n" + line : line;
    }
  }
  if (cur && cur.text) messages.push(cur);
  return { intro: intro, messages: messages };
}

var storyFind = { slug: "", q: "", i: 0, n: 0 };

function markEsc(text, q, acc) {
  var raw = String(text || "");
  if (!q) return esc(raw);
  var fq = fold(q);
  var ft = fold(raw);
  if (!fq) return esc(raw);
  var html = "";
  var last = 0;
  var i = 0;
  while (i <= ft.length - fq.length) {
    var p = ft.indexOf(fq, i);
    if (p < 0) break;
    html += esc(raw.slice(last, p));
    var cls = acc.n === acc.cur ? "find-cur" : "find-hit";
    html += '<mark class="' + cls + '" data-find="' + acc.n + '">' + esc(raw.slice(p, p + fq.length)) + "</mark>";
    acc.n += 1;
    last = p + fq.length;
    i = last;
  }
  html += esc(raw.slice(last));
  return html;
}

var STORY_PLACES = [
  "строительный гипермаркет «Олимпик»",
  "строительного гипермаркета «Олимпик»",
  "строительный магазин «Олимпик»",
  "строительного магазина «Олимпик»",
  "строймага «Олимпик»",
  "строймаге «Олимпик»",
  "улица Шотмана",
  "улице Шотмана",
  "улицы Шотмана",
  "улицу Шотмана",
  "переулок Челиева",
  "переулке Челиева",
  "переулка Челиева",
  "Искровский проспект",
  "Искровском проспекте",
  "Искровского проспекта",
  "Невский район",
  "Невском районе",
  "Невского района",
  "Санкт-Петербург",
  "Центр занятости",
  "Центре занятости",
  "Центра занятости",
  "Красного & Белого",
  "Красное & Белое",
  "ларёк Анжелы",
  "ларьке Анжелы",
  "ларька Анжелы",
  "шавермечная",
  "шавермечную",
  "шавермечной",
  "Максидоме",
  "Максидома",
  "Максидом",
  "Пятёрочке",
  "Пятёрочки",
  "Пятёрочку",
  "Пятёрочка",
  "«Олимпик»",
  '"Олимпик"',
  "Олимпика",
  "Олимпике",
  "Олимпик",
  "Дикси",
  "МФЦ",
  "«Лента»",
  '"Лента"',
  "«Магнит»",
  '"Магнит"',
  "Магните",
  "Шотмана",
  "Челиева",
  "Ленты"
].slice().sort(function (a, b) { return b.length - a.length; });

function isStoryLetter(ch) {
  return /[A-Za-zА-Яа-яЁё0-9]/.test(ch || "");
}

function collectPlaceRanges(text) {
  var used = [];
  var i;
  for (i = 0; i < text.length; i++) used[i] = 0;
  var out = [];
  var n, p, ok, k;
  for (n = 0; n < STORY_PLACES.length; n++) {
    var needle = STORY_PLACES[n];
    i = 0;
    while (i <= text.length - needle.length) {
      p = text.indexOf(needle, i);
      if (p < 0) break;
      ok = !isStoryLetter(text.charAt(p - 1)) && !isStoryLetter(text.charAt(p + needle.length));
      if (ok) {
        for (k = p; k < p + needle.length; k++) if (used[k]) { ok = false; break; }
      }
      if (ok) {
        for (k = p; k < p + needle.length; k++) used[k] = 1;
        out.push([p, p + needle.length]);
      }
      i = p + 1;
    }
  }
  out.sort(function (a, b) { return a[0] - b[0]; });
  return out;
}

function collectQuoteRanges(text) {
  var out = [];
  var re = /«[^»]{1,500}»|"[^"]{1,500}"/g;
  var m;
  while ((m = re.exec(text))) {
    if (m[0].length >= 3) out.push([m.index, m.index + m[0].length]);
  }
  return out;
}

function isSceneHead(p) {
  var s = String(p || "").replace(/^\s+|\s+$/g, "");
  if (!s || s.indexOf("\n") >= 0 || s.length > 92 || s.length < 4 || s.charAt(0) === "—") return false;
  if (/сказала|хмыкнула|вопит/.test(s)) return false;
  if (/^(Санкт-Петербург|Петербург,|\d{4} год|Январ|Феврал|Март |Март:|Апрел|Май \d|Июн|Июл|Август|Сентябр|Октябр|Ноябр|Декабр|Раннее |Поздн|Глубокая ночь|Ночь |Утро |Вечер|День |Через |Спустя |На следующий|Лебединый трип|Максидом как|Финал сцены|Шутка|Эпилог:|Версия \d|Мысли Юрца|Одноразовый анекдот|Рабочие будни|Условия работы|Туалет и еда|Разговоры с Женей|Любовь в пещерном|Середина декабря|Ноябрь-декабрь|ЧЕРНОВИК|📰|Склад |Погрузочная зона|Строительный гипермаркет)/.test(s)) return true;
  if (/^(Январ|Феврал|Март|Апрел|Май|Июн|Июл|Август|Сентябр|Октябр|Ноябр|Декабр).{0,40}: /.test(s) && s.length < 85) return true;
  if (/^\d{4} год: /.test(s)) return true;
  return false;
}

function inRange(ranges, a, b) {
  var i;
  for (i = 0; i < ranges.length; i++) {
    if (a >= ranges[i][0] && b <= ranges[i][1]) return i;
  }
  return -1;
}

function formatEsc(raw, q, acc) {
  var text = String(raw || "");
  var marks = [];
  if (q) {
    var fq = fold(q);
    var ft = fold(text);
    if (fq) {
      var i = 0;
      while (i <= ft.length - fq.length) {
        var p = ft.indexOf(fq, i);
        if (p < 0) break;
        marks.push([p, p + fq.length]);
        i = p + fq.length;
      }
    }
  }
  var quotes = collectQuoteRanges(text);
  var places = collectPlaceRanges(text);
  var bounds = { 0: 1 };
  bounds[text.length] = 1;
  function addB(a, b) { bounds[a] = 1; bounds[b] = 1; }
  var r;
  for (r = 0; r < marks.length; r++) addB(marks[r][0], marks[r][1]);
  for (r = 0; r < quotes.length; r++) addB(quotes[r][0], quotes[r][1]);
  for (r = 0; r < places.length; r++) addB(places[r][0], places[r][1]);
  var pts = Object.keys(bounds).map(Number).sort(function (a, b) { return a - b; });
  var html = "";
  var startN = acc.n;
  for (r = 0; r < pts.length - 1; r++) {
    var a = pts[r];
    var b = pts[r + 1];
    if (a >= b) continue;
    var slice = text.slice(a, b);
    if (!slice) continue;
    var italic = inRange(quotes, a, b) >= 0;
    var bold = inRange(places, a, b) >= 0;
    var mi = inRange(marks, a, b);
    var piece = esc(slice);
    if (mi >= 0) {
      var cls = (startN + mi) === acc.cur ? "find-cur" : "find-hit";
      piece = '<mark class="' + cls + '" data-find="' + (startN + mi) + '">' + piece + "</mark>";
    }
    if (bold) piece = "<b>" + piece + "</b>";
    if (italic) piece = "<i>" + piece + "</i>";
    html += piece;
  }
  acc.n = startN + marks.length;
  return html;
}

function storyBodyHtml(s, q, cur) {
  var acc = { n: 0, cur: cur || 0 };
  var html = "";
  var ii, p;
  if (s.kind === "sms") {
    var sms = parseSms(s.body);
    if (!sms.messages.length) {
      var chunks0 = String(s.body || "").split(/\n{2,}/);
      for (ii = 0; ii < chunks0.length; ii++) {
        p = chunks0[ii].replace(/^\s+|\s+$/g, "");
        if (p) html += "<p" + (isSceneHead(p) ? ' class="scene-head"' : "") + ">" + formatEsc(p, q, acc) + "</p>";
      }
    } else {
      for (ii = 0; ii < sms.intro.length; ii++) {
        html += "<p" + (isSceneHead(sms.intro[ii]) ? ' class="scene-head"' : "") + ">" + formatEsc(sms.intro[ii], q, acc) + "</p>";
      }
      html += '<p class="subtle" style="margin:8px 0 12px">' + sms.messages.length + " SMS · Fly</p>";
      html += '<ol class="sms">';
      for (ii = 0; ii < sms.messages.length; ii++) {
        html += '<li><span class="when">' + esc(sms.messages[ii].at) + '</span><span class="bubble">' +
          formatEsc(sms.messages[ii].text, q, acc) + "</span></li>";
      }
      html += "</ol>";
    }
  } else {
    var chunks = String(s.body || "").split(/\n{2,}/);
    for (var i = 0; i < chunks.length; i++) {
      p = chunks[i].replace(/^\s+|\s+$/g, "");
      if (!p) continue;
      if (/^слушать на (youtube|ютуб)/i.test(p)) continue;
      html += "<p" + (isSceneHead(p) ? ' class="scene-head"' : "") + ">" + formatEsc(p, q, acc) + "</p>";
    }
  }
  storyFind.n = acc.n;
  return html;
}

function applyStoryFind() {
  var body = $("#body");
  var s = bySlug(storyFind.slug);
  if (!body || !s) return;
  if (storyFind.n > 0) storyFind.i = ((storyFind.i % storyFind.n) + storyFind.n) % storyFind.n;
  else storyFind.i = 0;
  body.innerHTML = storyBodyHtml(s, storyFind.q, storyFind.i);
  var stat = $("#findstat");
  if (stat) {
    var q = String(storyFind.q || "").replace(/^\s+|\s+$/g, "");
    if (!q) stat.textContent = "";
    else if (!storyFind.n) stat.textContent = "нет";
    else stat.textContent = (storyFind.i + 1) + " / " + storyFind.n;
  }
  var next = $("#findnext");
  if (next) next.style.display = String(storyFind.q || "").replace(/^\s+|\s+$/g, "") ? "" : "none";
  if (storyFind.n > 0) {
    var el = document.querySelector('mark[data-find="' + storyFind.i + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

function renderStory(slug) {
  var s = bySlug(slug);
  if (!s) return shell('<p class="empty">Этого рассказа нет. <a href="#/">Назад</a></p>', "home");
  if (storyFind.slug !== s.slug) {
    storyFind.slug = s.slug;
    storyFind.q = "";
    storyFind.i = 0;
    storyFind.n = 0;
  }
  var saved = books().indexOf(s.slug) !== -1;
  var paper = resolveTheme() === "light";
  var scrubOn = showScrub();
  var font = 19;
  try { font = Number(localStorage.getItem(FONT_KEY) || 19); } catch (e) {}
  var bodyHtml = storyBodyHtml(s, storyFind.q, storyFind.i);
  var findStat = "";
  var qshow = String(storyFind.q || "").replace(/^\s+|\s+$/g, "");
  if (qshow) findStat = storyFind.n ? (storyFind.i + 1) + " / " + storyFind.n : "нет";
  var findBar = '<div class="findbar sticky-find">' +
    '<input class="search" id="findq" placeholder="Найти в рассказе…" value="' + esc(storyFind.q) + '" aria-label="Найти в рассказе" />' +
    '<span id="findstat" class="subtle">' + esc(findStat) + "</span>" +
    '<button type="button" class="btn ghost" id="findnext"' + (qshow ? "" : ' style="display:none"') + ">Далее</button></div>";
  var eps = stories.filter(function (x) { return x.kind === "episode"; });
  var idx = -1;
  for (var k = 0; k < eps.length; k++) if (eps[k].slug === s.slug) idx = k;
  var prev = idx > 0 ? eps[idx - 1] : null;
  var next = idx >= 0 && idx < eps.length - 1 ? eps[idx + 1] : null;
  var links = '<div class="links row3">';
  var ytLbl = "YouTube";
  var tgLbl = "Telegram";
  var ytHtml = "";
  var tgHtml = "";
  if (s.paid) {
    if (isPaid()) {
      var href = s.youtubeId ? ("https://www.youtube.com/watch?v=" + esc(s.youtubeId)) : YT;
      ytHtml = '<a class="btn yt" href="' + href + '">' + ytLbl + "</a>";
    } else {
      ytHtml = '<button class="btn yt" id="paid-open">' + ytLbl + "</button>";
    }
  } else if (s.youtubeId) {
    ytHtml = '<a class="btn yt" href="https://www.youtube.com/watch?v=' + esc(s.youtubeId) + '">' + ytLbl + "</a>";
  }
  if (s.telegramUrl) tgHtml = '<a class="btn tg" href="' + esc(s.telegramUrl) + '">' + tgLbl + "</a>";
  else if (s.telegramId) tgHtml = '<a class="btn tg" href="' + TG + "/" + s.telegramId + '">' + tgLbl + "</a>";
  else tgHtml = '<span class="btn ghost">Telegram</span>';
  links += tgHtml + ytHtml;
  links += offlineBtnHtml(offlineItemForStory(s));
  links += "</div>";
  if (s.kind === "sms" && s.youtubeId) {
    links += '<a class="yt-cover" href="https://www.youtube.com/watch?v=' + esc(s.youtubeId) + '"><img src="thumbs/' + esc(s.slug) + '.jpg" alt="" /></a>';
  }
  var nav = '<nav class="links" style="margin-top:32px">';
  if (prev) nav += '<a class="btn ghost" href="#/story/' + esc(prev.slug) + '">← ' + esc(prev.title) + "</a>";
  if (next) nav += '<a class="btn ghost" href="#/story/' + esc(next.slug) + '">' + esc(next.title) + " →</a>";
  nav += "</nav>";
  return '<div class="reader' + (paper ? " paper" : "") + (scrubOn ? " has-scrub" : "") + '" id="reader">' +
    '<header class="rbar">' +
    '<button class="iconbtn" id="back" aria-label="Назад">←</button>' +
    '<div style="min-width:0;flex:1"><div class="kicker' + (s.kind === "episode" ? " ep" : "") + '">' + esc(formatCode(s)) + "</div>" +
    '<div class="brand" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(s.title) + "</div></div>" +
    '<button class="iconbtn" id="font" aria-label="Шрифт">A±</button>' +
    '<button class="iconbtn" id="paper" aria-label="Тема оформления">' +
    (paper ? iconMoon() : iconSun()) + "</button>" +
    '<button class="iconbtn" id="book" aria-label="Закладка">' + iconBook(saved) + "</button>" +
    "</header><article class='article'>" +
    '<p class="kicker">' + esc(KIND_LABEL[s.kind] || "") + (s.date ? " · " + esc(formatRuDate(s.date)) : "") + "</p>" +
    "<h1>" + esc(s.title) + "</h1>" +
    '<p class="muted">' + s.minutes + " мин " +
    (s.kind === "episode"
      ? '<button type="button" class="read-pill' + (isRead(s.slug) ? "" : " off") + '" id="read-toggle">' +
        (isRead(s.slug) ? "прочитано" : "не прочитано") + "</button>"
      : "") + "</p>" +
    links +
    findBar +
    '<div class="body" id="body" style="font-size:' + font + 'px">' + bodyHtml + "</div>" +
    nav + "</article>" +
    (scrubOn ? '<div class="rscrub" id="rscrub" aria-hidden="true"><i class="rscrub-track"><b class="rscrub-thumb" id="rscrub-thumb"></b></i></div>' : "") +
    '<button type="button" class="totop" id="totop" aria-label="Наверх">↑</button></div>';
}

function mediaCats() {
  return [
    { id: "video", kind: "episode", label: "Видео", kicker: "Радуга", image: "media/tile-video.jpg", hint: "серии" },
    { id: "shorts", kind: "short", label: "Shorts", kicker: "Лента", image: "media/tile-shorts.jpg", hint: "шортсы" },
    { id: "songs", kind: "song", label: "Песни", kicker: "Магнитофон", image: "media/tile-songs.jpg", hint: "песни" },
    { id: "press", kind: "press", label: "Газета", kicker: "Пресса", image: "media/tile-press.jpg", hint: "выпуски" },
    { id: "call", kind: "call", label: "Звонки", kicker: "Трубка", image: "media/tile-calls.jpg", hint: "записи" },
    { id: "other", kind: "other", label: "Другое", kicker: "Альбом", image: "media/tile-other.jpg", hint: "приколы" }
  ];
}
function mediaByCat(id) {
  var cat = null, i, list = [];
  var cats = mediaCats();
  for (i = 0; i < cats.length; i++) if (cats[i].id === id) cat = cats[i];
  if (!cat) return list;
  if (id === "press") return PRESS.slice();
  for (i = 0; i < videos.length; i++) if (videos[i].kind === cat.kind) list.push(videos[i]);
  return list;
}
function ruMediaCount(n, id) {
  if (id === "video") return n === 1 ? "1 серия" : (n < 5 ? n + " серии" : n + " серий");
  if (id === "shorts") return n === 1 ? "1 шортс" : n + " шортсов";
  if (id === "songs") return n === 1 ? "1 песня" : (n < 5 ? n + " песни" : n + " песен");
  if (id === "press") return n === 1 ? "1 выпуск" : (n < 5 ? n + " выпуска" : n + " выпусков");
  if (id === "call") return n === 1 ? "1 звонок" : (n < 5 ? n + " звонка" : n + " звонков");
  return n === 1 ? "1 прикол" : (n < 5 ? n + " прикола" : n + " приколов");
}
function applyMediaOrder(list) {
  return applyOrder(list, state.sort);
}
function matchTitle(item, q) {
  if (!q) return true;
  return fold((item.title || "") + " " + (item.code || "") + " " + (item.kicker || "")).indexOf(q) !== -1;
}
function searchMediaList(list) {
  var q = fold(state.mq || "").replace(/^\s+|\s+$/g, "");
  if (!q) return list;
  var out = [];
  for (var i = 0; i < list.length; i++) if (matchTitle(list[i], q)) out.push(list[i]);
  return out;
}
function ytUrl(v) {
  if (v.kind === "short") return "https://www.youtube.com/shorts/" + v.id;
  return "https://www.youtube.com/watch?v=" + v.id;
}
function isPhoto(v) {
  return v.mediaType === "image";
}

function renderMediaHub() {
  var q = fold(state.mq || "").replace(/^\s+|\s+$/g, "");
  var html = '<p class="kicker">Архив Шотмана</p><h2 style="font-size:28px;margin-top:6px">Медиа</h2>' +
    '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:10px">Серии, шортсы, песни, газета, звонки и прочий угар. Жми плитку — внутри своя полка.</p>';
  html += '<div class="home-sticky" style="margin-top:8px"><input class="search" id="mq" placeholder="Найти по названию…" value="' + esc(state.mq || "") + '" /></div>';
  if (q) {
    var vids = searchMediaList(videos);
    var press = searchMediaList(PRESS);
    html += '<p class="stat">' + (vids.length + press.length) + " по запросу</p><div id=\"list\" class=\"board\">";
    if (!vids.length && !press.length) html += '<p class="empty">По этому запросу на Шотмана тишина.</p>';
    else {
      var i;
      for (i = 0; i < vids.length; i++) html += renderMediaCard(vids[i]);
      for (i = 0; i < press.length; i++) html += renderMediaCard(press[i], i);
    }
    html += "</div>";
    return shell(html, "videos");
  }
  html += '<div class="mgrid">';
  var cats = mediaCats();
  for (var i = 0; i < cats.length; i++) {
    var c = cats[i];
    var n = mediaByCat(c.id).length;
    html += '<a class="mtile" href="#/videos/' + c.id + '">' +
      '<img src="' + esc(c.image) + '" alt="" />' +
      '<div class="cap"><div class="kicker">' + esc(c.kicker) + "</div><b>" + esc(c.label) +
      "</b><span>" + ruMediaCount(n, c.id) + "</span></div></a>";
  }
  html += "</div>";
  return shell(html, "videos");
}

function renderMediaCard(v, i) {
  if (v.pages) {
    return '<a class="vcard issue-card' + (i % 2 ? " zebra" : "") + '" href="#/press/' + esc(v.id) + '">' +
      '<div class="pad"><h2>' + esc(pressTitle(v)) + "</h2></div></a>";
  }
  if (isPhoto(v)) {
    var src = v.kind === "call" ? "" : videoCover(v);
    var html = '<article class="vcard">';
    if (src) html += coverImgHtml(v, v.kind === "press" ? "scan" : "");
    html += '<div class="pad"><div class="kicker' + (parseEpisodeCode(v.code, v.title) ? " ep" : "") + '">' + esc(mediaStamp(v)) + "</div><h2>" + esc(v.title) + "</h2>";
    if (v.caption) html += '<p class="excerpt" style="-webkit-line-clamp:6">' + esc(v.caption) + "</p>";
    html += '<div class="links">';
    if (v.telegramId) html += '<a class="btn tg" href="' + TG + "/" + v.telegramId + '">' + (v.kind === "call" ? "Слушать" : "Пост в Telegram") + "</a>";
    if (v.storySlug) html += '<a class="btn ghost" href="#/story/' + esc(v.storySlug) + '">Читать</a>';
    if (v.kind === "call") html += offlineBtnHtml(offlineItemForVideo(v));
    html += "</div></div></article>";
    return html;
  }
  var watch = ytUrl(v);
  var portrait = v.kind === "short" && !v.thumb;
  var html = '<article class="vcard">' +
    coverImgHtml(v, portrait ? "portrait" : "") +
    '<div class="pad"><div class="kicker' + (parseEpisodeCode(v.code, v.title) ? " ep" : "") + '">' + esc(mediaStamp(v)) + "</div><h2>" + esc(v.title) + "</h2>" +
    '<div class="links">';
  if (v.storySlug && v.kind !== "short") html += '<a class="btn tg" href="#/story/' + esc(v.storySlug) + '">' + (v.kind === "song" ? "Текст" : "Читать") + "</a>";
  else if (v.telegramId) html += '<a class="btn tg" href="' + TG + "/" + v.telegramId + '">Пост в Telegram</a>';
  html += '<a class="btn yt" href="' + watch + '">' + (v.kind === "song" ? "Слушать" : "Смотреть") + "</a>";
  html += offlineBtnHtml(offlineItemForVideo(v));
  html += "</div></div></article>";
  return html;
}

function renderVideos(catId) {
  if (!catId) return renderMediaHub();
  var cats = mediaCats();
  var cat = null, i;
  for (i = 0; i < cats.length; i++) if (cats[i].id === catId) cat = cats[i];
  if (!cat) return renderMediaHub();
  var list = applyMediaOrder(searchMediaList(mediaByCat(catId)));
  var ch = channelForCat(catId);
  var html = '<div class="sticky-sort media-sort">' +
    "<div><a class=\"back\" href=\"#/videos\">← Медиа</a>" +
    "<h2>" + esc(cat.label) + "</h2></div>" +
    '<input class="search" id="mq" placeholder="Найти по названию…" value="' + esc(state.mq || "") + '" />' +
    '<div class="statrow" style="margin:8px 0 0">' +
    '<span class="stat">' + esc(cat.kicker) + " · " + list.length + "</span>" +
    '<div class="sort-actions">' +
    '<button class="chip sort-chip" id="sort">' + sortLabel() + "</button>" +
    '<a class="btn ' + ch.kind + '" href="' + ch.href + '">Канал</a></div></div></div>';
  if (!list.length) html += '<p class="empty">' + (fold(state.mq || "").replace(/^\s+|\s+$/g, "") ? "По этому запросу на Шотмана тишина." : "Пока пусто. Юрец ещё не начудил.") + "</p>";
  else if (catId === "press") {
    html += '<div class="press-list">';
    for (i = 0; i < list.length; i++) html += renderMediaCard(list[i], i);
    html += "</div>";
  } else {
    html += '<div class="board">';
    for (i = 0; i < list.length; i++) html += renderMediaCard(list[i], i);
    html += "</div>";
  }
  return shell(html, "videos", catId);
}

function renderPressIssue(id) {
  var issue = null, i;
  for (i = 0; i < PRESS.length; i++) if (String(PRESS[i].id) === String(id)) issue = PRESS[i];
  if (!issue) {
    return shell('<p class="empty">Этого выпуска в киоске нет.</p><a class="btn" href="#/videos/press">К газете</a>', "videos", "press");
  }
  var page = issue.pages[0];
  var src = String(page.src || "").replace(/^\//, "");
  var html = '<a class="back" href="#/videos/press">← К киоску</a>' +
    '<p class="kicker" style="margin-top:16px">' + esc(issue.kicker) + "</p>" +
    '<h2 style="font-size:28px;margin-top:4px">' + esc(pressTitle(issue)) + "</h2>" +
    '<p class="subtle" id="pager-topn" style="margin-top:8px">1 из ' + issue.pages.length + "</p>" +
    '<div class="paper-frame paper-stage" id="pager">' +
      '<img class="paper-preview paper-leaf" id="pager-img" src="' + esc(src) + '" alt="" />' +
    "</div>" +
    '<div class="paper-nav">' +
      '<button type="button" class="paper-arr" id="pager-prev" aria-label="Предыдущая полоса">‹</button>' +
      '<div class="paper-meta"><div class="kicker" id="pager-title">' + esc(page.title || "") + "</div>" +
      '<p class="subtle" id="pager-n">1 / ' + issue.pages.length + "</p></div>" +
      '<button type="button" class="paper-arr" id="pager-next" aria-label="Следующая полоса">›</button>' +
    "</div>" +
    '<p class="muted" id="pager-cap" style="font-family:var(--serif);font-size:14px;margin-top:8px">' + esc(page.caption || "") + "</p>";
  return shell(html, "videos", "press");
}

function bindPress() {
  var id = decodeURIComponent((route().split("/")[2] || "").split("?")[0]);
  var issue = null, i;
  for (i = 0; i < PRESS.length; i++) if (String(PRESS[i].id) === String(id)) issue = PRESS[i];
  if (!issue) return;
  var n = issue.pages.length;
  var page = 0;
  var x0 = 0, y0 = 0, dx = 0, dy = 0, dragging = false, swiped = false, flipping = false;
  function show(idx, dir) {
    if (idx < 0 || idx >= n) return;
    var img = $("#pager-img");
    if (img && dir) {
      if (flipping) return;
      flipping = true;
      img.className = "paper-preview paper-leaf " + (dir === 1 ? "turn-next" : "turn-prev");
      window.setTimeout(function () {
        page = idx;
        applyPage();
      }, 220);
      window.setTimeout(function () {
        if (img) img.className = "paper-preview paper-leaf";
        flipping = false;
      }, 480);
      return;
    }
    page = idx;
    applyPage();
  }
  function applyPage() {
    var p = issue.pages[page];
    var src = String(p.src || "").replace(/^\//, "");
    var img = $("#pager-img");
    if (img) {
      img.src = src;
      img.removeAttribute("data-zoom");
    }
    var lab = $("#pager-n");
    if (lab) lab.textContent = (page + 1) + " / " + n;
    var t = $("#pager-title");
    if (t) t.textContent = p.title || "";
    var c = $("#pager-cap");
    if (c) c.textContent = p.caption || "";
    var prev = $("#pager-prev");
    var next = $("#pager-next");
    if (prev) prev.disabled = page === 0;
    if (next) next.disabled = page === n - 1;
    var topn = $("#pager-topn");
    if (topn) topn.textContent = (page + 1) + " из " + n;
  }
  show(0);
  var prevBtn = $("#pager-prev");
  var nextBtn = $("#pager-next");
  if (prevBtn) prevBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    show(page - 1, -1);
  });
  if (nextBtn) nextBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    show(page + 1, 1);
  });
  var pager = $("#pager");
  var img = $("#pager-img");
  if (img) img.removeAttribute("data-zoom");
  function ptrStart(x, y) { dragging = true; swiped = false; x0 = x; y0 = y; dx = 0; dy = 0; }
  function ptrMove(x, y) { if (!dragging) return; dx = x - x0; dy = y - y0; }
  function ptrEnd() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) + 8) {
      swiped = true;
      if (dx < 0) show(page + 1, 1);
      else show(page - 1, -1);
    }
  }
  if (pager) {
    pager.addEventListener("pointerdown", function (e) { ptrStart(e.clientX, e.clientY); });
    pager.addEventListener("pointermove", function (e) { ptrMove(e.clientX, e.clientY); });
    pager.addEventListener("pointerup", ptrEnd);
    pager.addEventListener("pointercancel", ptrEnd);
    pager.addEventListener("touchstart", function (e) {
      if (!e.touches || !e.touches.length) return;
      ptrStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    pager.addEventListener("touchmove", function (e) {
      if (!e.touches || !e.touches.length) return;
      ptrMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    pager.addEventListener("touchend", ptrEnd);
  }
  if (img) img.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (swiped) { swiped = false; return; }
    var srcs = [];
    var i;
    for (i = 0; i < n; i++) srcs.push(String(issue.pages[i].src || "").replace(/^\//, ""));
    openZoom(String(img.getAttribute("src") || ""), srcs, page, function (idx) { show(idx); });
  });
}

function burstFireworks() {
  try {
    var root = document.getElementById("fw-dom");
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = document.createElement("div");
    root.id = "fw-dom";
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("data-testid", "fireworks");
    root.style.cssText = "position:fixed;inset:0;z-index:120;pointer-events:none;overflow:hidden;";
    var colors = ["#e8c547", "#f4e4a1", "#ff6b4a", "#ffffff", "#c43b6e", "#8a9a4a"];
    var burst, i, a, dist, s, color, cx, cy, n;
    n = 8;
    for (burst = 0; burst < 6; burst++) {
      cx = 16 + Math.random() * 68;
      cy = 14 + Math.random() * 36;
      color = colors[burst % colors.length];
      for (i = 0; i < n; i++) {
        a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        dist = 4 + Math.random() * 7;
        s = document.createElement("span");
        s.className = "fw-spark";
        s.style.left = (cx + Math.cos(a) * dist) + "%";
        s.style.top = (cy + Math.sin(a) * dist * 0.55) + "%";
        s.style.background = color;
        s.style.animationDelay = burst * 140 + "ms";
        root.appendChild(s);
      }
    }
    document.body.appendChild(root);
    window.setTimeout(function () {
      var el = document.getElementById("fw-dom");
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 2400);
  } catch (e) {}
}

function burstRain() {
  try {
    var root = document.getElementById("rain-dom");
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = document.createElement("div");
    root.id = "rain-dom";
    root.className = "rain-layer";
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("data-testid", "rain");
    var i, d;
    for (i = 0; i < 42; i++) {
      d = document.createElement("span");
      d.className = "rain-drop";
      d.style.left = (Math.random() * 100) + "%";
      d.style.height = (12 + Math.random() * 16) + "px";
      d.style.animationDelay = (Math.random() * 400) + "ms";
      d.style.animationDuration = (700 + Math.random() * 700) + "ms";
      root.appendChild(d);
    }
    document.body.appendChild(root);
    window.setTimeout(function () {
      var el = document.getElementById("rain-dom");
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 2200);
  } catch (e) {}
}

var ACH_ITEMS = [
  { id: "rjumka", title: "Первая рюмка", flavor: "Горло обожгло. Сага началась. Дальше — только громче.", hint: "Дочитай любой рассказ и поставь «прочитано»." },
  { id: "serii", title: "Царь линолеума", flavor: "Все серии внутри. Песни можешь орать отдельно — это уже не считается.", hint: "Прочитай все серии саги. Визиты и песни — не серии." },
  { id: "vizity", title: "Гость трёшки", flavor: "Два раза переступил порог. Третий раз Юрец уже будет звать сам.", hint: "Прочитай оба визита к Юрцу." },
  { id: "pesni", title: "Горловар", flavor: "Все припевы внутри. Соседи вызвали участкового — голос признали уликой.", hint: "Прочитай все песни саги." },
  { id: "bonus", title: "Fly пиликнул", flavor: "Кнопочный бог ответил. Юрец орёт, что это шифровка ФСБ.", hint: "Прочитай все спецвыпуски и бонусы." },
  { id: "kvest", title: "Я — Юрец", flavor: "Шкуру надел. Логика осталась в ларьке.", hint: "Пройди любой уровень Юрцовского квеста до любой концовки." },
  { id: "questall", title: "Пять шкур", flavor: "Пять раз был Юрцом. Шестой уже не отличить от оригинала.", hint: "Пройди все пять уровней квеста хотя бы до одной концовки каждый." },
  { id: "revel", title: "Каркнуть", flavor: "Гоша открыл небо. Юрец орёт, что знал с первой клетки.", hint: "Сложи золотое слово в кроссворде №1." },
  { id: "kiosk", title: "Киоск на Шотмана", flavor: "Двадцать сеток. Киоск больше не смеётся.", hint: "Разгадай все кроссворды киоска. Все двадцать." },
  { id: "povar", title: "Колобок", flavor: "Повар улетел в помойку. Первый колобок — самый вкусный.", hint: "Выиграй первый уровень Помойкобола." },
  { id: "yasher", title: "Язык из бака", flavor: "Ящер не достал. Бак остался голодный, двор рукоплещет.", hint: "Уделай Бабку-ящера в Помойкоболе." },
  { id: "fsb", title: "Купол ФСБ", flavor: "Батя пальнул. Фольга выдержала. Медаль уже в кармане.", hint: "Уделай Батю в Помойкоболе." },
  { id: "sveta", title: "Поцелуй Светки", flavor: "Королева Максидома упала. Поцелуи сами нашли рот.", hint: "Уделай Светлану в Помойкоболе." },
  { id: "zerkalo", title: "Зеркало Кости", flavor: "Выиграл у себя. Это уже не спорт — это диагноз.", hint: "Дойди до Кости в Помойкоболе и выиграй." },
  { id: "avall", title: "Шесть помоек", flavor: "Колобков больше нет. Ворота пустые, двор орёт «легенда».", hint: "Пройди все шесть уровней Помойкобола." },
  { id: "alk", title: "Харя-ракетка", flavor: "Лицо стало платформой. Кирпичи сами виноваты.", hint: "Разнеси хотя бы один двор в Алконоиде." },
  { id: "drob", title: "Дробь Бати", flavor: "Залп прошёл мимо. Батя ещё придёт, но медаль уже твоя.", hint: "Пройди девятый уровень Алконоида. Там Батя." },
  { id: "arkall", title: "Алконавт", flavor: "Десять дворов в пыль. Харя ещё служит ракеткой.", hint: "Пройди все десять уровней Алконоида." },
  { id: "zhilet", title: "Жилетка куплена", flavor: "Ключ «Легенда» подошёл. Жилетка блестит, двор завидует.", hint: "Введи лицензионный ключ. Без него двор считает тебя гостем." },
  { id: "groza", title: "Гроза над Шотманом", flavor: "Пять тычков — и сага показала второе лицо. Артхаус сам себя не включит.", hint: "Потыкай название саги в разделе «О приложении». Не сразу." }
];
var achWait = [];
var achShowing = false;

function achSrc(id) {
  var v = (APP && APP.version) ? APP.version : "";
  var p = (id === "cover" || id === "locked") ? ("achievements/" + id + ".jpg") : ("achievements/" + id + ".jpg");
  return p + (v ? ("?v=" + v) : "");
}
function readAchStore() {
  try {
    var raw = JSON.parse(localStorage.getItem(ACH_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch (e) { return {}; }
}
function writeAchStore(s) {
  try { localStorage.setItem(ACH_KEY, JSON.stringify(s)); } catch (e) {}
}
function achCount() {
  var s = readAchStore(), n = 0, i;
  for (i = 0; i < ACH_ITEMS.length; i++) if (s[ACH_ITEMS[i].id]) n++;
  return n;
}
function endingsOf(id) {
  try {
    if (id === "day" && !localStorage.getItem("yurec-game-endings:day")) {
      var old = localStorage.getItem("yurec-game-endings");
      if (old) localStorage.setItem("yurec-game-endings:day", old);
    }
    var raw = JSON.parse(localStorage.getItem("yurec-game-endings:" + id) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function winsOf(key) {
  try {
    var raw = JSON.parse(localStorage.getItem(key) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch (e) { return {}; }
}
function achQualified(id) {
  var read = readSlugs();
  var set = {};
  var i;
  for (i = 0; i < read.length; i++) set[read[i]] = 1;
  var av = winsOf("yurec-av-wins");
  var ark = winsOf("yurec-ark-wins");
  var stories = window.STORIES || [];
  var cws = window.YUREC_CROSSWORDS || [];
  var quests = ["day", "olimpik", "tsar", "mirage", "dinner"];
  if (id === "rjumka") return read.length >= 1;
  if (id === "serii") {
    for (i = 0; i < stories.length; i++) if (stories[i].kind === "episode" && !set[stories[i].slug]) return false;
    return stories.some(function (s) { return s.kind === "episode"; });
  }
  if (id === "vizity") {
    for (i = 0; i < stories.length; i++) if (stories[i].kind === "visit" && !set[stories[i].slug]) return false;
    return stories.some(function (s) { return s.kind === "visit"; });
  }
  if (id === "kvest") {
    for (i = 0; i < quests.length; i++) if (endingsOf(quests[i]).length) return true;
    return false;
  }
  if (id === "revel") return endingsOf("crossword").length > 0;
  if (id === "kiosk") {
    if (!cws.length) return false;
    for (i = 0; i < cws.length; i++) if (!endingsOf(cws[i].id).length) return false;
    return true;
  }
  if (id === "povar") return Number(av.povar) > 0;
  if (id === "sveta") return Number(av.sveta) > 0;
  if (id === "zerkalo") return Number(av.kostya) > 0;
  if (id === "alk") {
    var k;
    for (k in ark) if (Object.prototype.hasOwnProperty.call(ark, k) && Number(ark[k]) > 0) return true;
    return false;
  }
  if (id === "drob") return Number(ark.batya) > 0;
  if (id === "pesni") {
    var sn = 0, sok = 0;
    for (i = 0; i < stories.length; i++) if (stories[i].kind === "song") { sn++; if (set[stories[i].slug]) sok++; }
    return sn > 0 && sok === sn;
  }
  if (id === "bonus") {
    var bn = 0, bok = 0;
    for (i = 0; i < stories.length; i++) if (stories[i].kind === "sms") { bn++; if (set[stories[i].slug]) bok++; }
    return bn > 0 && bok === bn;
  }
  if (id === "questall") {
    for (i = 0; i < quests.length; i++) if (!endingsOf(quests[i]).length) return false;
    return true;
  }
  if (id === "yasher") return Number(av.yasher) > 0;
  if (id === "fsb") return Number(av.batya) > 0;
  if (id === "avall") {
    var avIds = ["povar", "lysy", "yasher", "batya", "sveta", "kostya"];
    for (i = 0; i < avIds.length; i++) if (!(Number(av[avIds[i]]) > 0)) return false;
    return true;
  }
  if (id === "arkall") {
    var arkIds = ["flat", "olimp", "maxi", "yard", "boss", "tolik", "pharm", "fsb", "batya", "kostya"];
    for (i = 0; i < arkIds.length; i++) if (!(Number(ark[arkIds[i]]) > 0)) return false;
    return true;
  }
  if (id === "zhilet") {
    try { return localStorage.getItem(PAID_KEY) === "1" || localStorage.getItem(DEV_KEY) === "1"; } catch (e) { return false; }
  }
  if (id === "groza") {
    try { return localStorage.getItem(EGG_KEY) === "1"; } catch (e) { return false; }
  }
  return false;
}
function getAch(id) {
  var i;
  for (i = 0; i < ACH_ITEMS.length; i++) if (ACH_ITEMS[i].id === id) return ACH_ITEMS[i];
  return null;
}
function evaluateAchievements() {
  var store = readAchStore();
  var fresh = [];
  var i, a;
  for (i = 0; i < ACH_ITEMS.length; i++) {
    a = ACH_ITEMS[i];
    if (store[a.id]) continue;
    if (!achQualified(a.id)) continue;
    store[a.id] = Date.now();
    fresh.push(a);
  }
  if (!fresh.length) {
    flushAchWait();
    return;
  }
  writeAchStore(store);
  presentAch(fresh);
}
function inAvArk() {
  return document.body.classList.contains("av-nodock");
}
function presentAch(items) {
  if (!items || !items.length) return;
  if (inAvArk()) {
    achWait = achWait.concat(items);
    return;
  }
  if (achShowing) {
    achWait = achWait.concat(items);
    return;
  }
  burstStarfall(items);
}
function flushAchWait() {
  if (inAvArk() || !achWait.length || achShowing) return;
  var batch = achWait.slice();
  achWait = [];
  burstStarfall(batch);
}
function burstStarfall(items) {
  try {
    var old = document.getElementById("starfall-dom");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    achShowing = true;
    var root = document.createElement("div");
    root.id = "starfall-dom";
    root.className = "starfall";
    root.setAttribute("aria-hidden", "true");
    var i, s, colors = ["#f6e7c2", "#e8c547", "#fff6d2", "#c9a227", "#ffe27a"];
    for (i = 0; i < 48; i++) {
      s = document.createElement("span");
      s.className = "star-fall";
      s.style.left = (Math.random() * 100) + "%";
      s.style.width = (8 + Math.random() * 16) + "px";
      s.style.height = s.style.width;
      s.style.animationDelay = (Math.random() * 700) + "ms";
      s.style.animationDuration = (1800 + Math.random() * 1200) + "ms";
      s.style.background = colors[i % colors.length];
      root.appendChild(s);
    }
    var card = document.createElement("div");
    card.className = "starfall-card";
    var one = items.length === 1 ? items[0] : null;
    if (one) {
      card.innerHTML = '<img class="starfall-shot" src="' + achSrc(one.id) + '" alt="" />' +
        '<p class="starfall-kicker">Зашквар открыт</p>' +
        '<p class="starfall-title">' + esc(one.title) + "</p>" +
        '<p class="starfall-flavor">' + esc(one.flavor) + "</p>" +
        '<button type="button" class="starfall-close">Закрыть</button>';
    } else {
      var thumbs = "", n = Math.min(4, items.length);
      for (i = 0; i < n; i++) thumbs += '<img src="' + achSrc(items[i].id) + '" alt="" />';
      card.innerHTML = '<div class="starfall-thumbs">' + thumbs + "</div>" +
        '<p class="starfall-kicker">Зашквары двора</p>' +
        '<p class="starfall-title">Открыто ' + items.length + "</p>" +
        '<p class="starfall-flavor">Двор уже помнил. Медали просто догнали.</p>' +
        '<button type="button" class="starfall-close">Закрыть</button>';
    }
    root.appendChild(card);
    document.body.appendChild(root);
    try {
      if (localStorage.getItem(VIBRATE_KEY) !== "0" && navigator.vibrate) navigator.vibrate([18, 40, 28]);
    } catch (e2) {}
    function closeFall() {
      var el = document.getElementById("starfall-dom");
      if (el && el.parentNode) el.parentNode.removeChild(el);
      achShowing = false;
      flushAchWait();
    }
    card.addEventListener("click", function (e) { e.stopPropagation(); });
    root.addEventListener("click", closeFall);
    var closeBtn = card.querySelector(".starfall-close");
    if (closeBtn) closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      closeFall();
    });
  } catch (e) {
    achShowing = false;
  }
}

function afterUnlock() {
  window.setTimeout(function () {
    try { paint(); } catch (e) {}
    window.setTimeout(function () {
      try { burstFireworks(); } catch (err) {}
    }, 80);
  }, 0);
}

function renderSaved() {
  var slugs = books();
  var list = [];
  for (var i = 0; i < slugs.length; i++) {
    var s = bySlug(slugs[i]);
    if (s) list.push(s);
  }
  var html = "<h2>Закладки</h2><p class='muted'>Хранятся на этом телефоне.</p>";
  if (!list.length) html += '<p class="empty">Пусто. Откройте рассказ и нажмите закладку.</p>';
  else for (var j = 0; j < list.length; j++) html += card(list[j]);
  return shell(html, "saved");
}

function citatTone(id) {
  if (id === "yurec") return " yurec";
  if (id === "svetlana") return " svetlana";
  if (id === "kostya") return " kostya";
  if (id === "lysy") return " lysy";
  if (id === "zinaida") return " zinaida";
  if (id === "povar") return " povar";
  if (id === "tolik") return " tolik";
  if (id === "gosha") return " gosha";
  if (id === "zhenya") return " zhenya";
  if (id === "batya") return " batya";
  return "";
}

function renderCitats() {
  var html = '<button type="button" class="citat-cover" data-zoom="covers/citats.jpg" aria-label="Открыть обложку: Зашквары Юрца">' +
    '<img src="covers/citats.jpg" alt="Юрец читает книгу «Зашквары Юрца»" /></button>' +
    '<p class="kicker" style="margin-top:20px">Цитатник</p>' +
    '<h2 style="font-size:28px;margin-top:6px">Зашквары Юрца</h2>' +
    '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:8px">Самые громкие фразы двора: ор, зашквар и тосты за РЕВЭЛ. Нажми цитату — откроется рассказ, откуда ор.</p>' +
    '<p class="subtle" style="text-align:center;margin-top:16px">' + CITATS.length + " цитат</p>";
  html += '<div class="citat-board">';
  var i, c, st;
  for (i = 0; i < CITATS.length; i++) {
    c = CITATS[i];
    st = bySlug(c.slug);
    if (!st) continue;
    html += '<a class="citat" href="#/story/' + esc(c.slug) + '">' +
      '<div class="citat-top"><span class="citat-who' + citatTone(c.speakerId) + '">' + esc(c.speaker) + "</span>" +
      '<span class="citat-code">' + esc(formatCode(st)) + "</span></div>" +
      '<p class="citat-text">«' + esc(c.text) + "»</p>" +
      '<p class="citat-story">' + esc(st.title) + " ▸</p></a>";
  }
  html += "</div>";
  return shell(html, "citats");
}

function chatWelcome(mode) {
  return mode === "sms"
    ? "прив это юрец пиши чо хош я тута бета кароч не ругайся если туплю"
    : "Алё. Юрец на проводе. Бета, Fly может залагать. Говори по делу — я не лектор.";
}
function readChatMode() {
  try { return localStorage.getItem("yurec-ai-mode") === "sms" ? "sms" : "yurec"; } catch (e) { return "yurec"; }
}
function writeChatMode(mode) {
  try { localStorage.setItem("yurec-ai-mode", mode); } catch (e) {}
}
function loadChatLog() {
  if (chatLog) return chatLog;
  try {
    var raw = chatStore().getItem("yurec-ai-log");
    var arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr) && arr.length) {
      chatLog = arr;
      return chatLog;
    }
  } catch (e) {}
  chatLog = [{ role: "yurec", text: chatWelcome(readChatMode()) }];
  return chatLog;
}
function saveChatLog() {
  try { chatStore().setItem("yurec-ai-log", JSON.stringify((chatLog || []).slice(-80))); } catch (e) {}
}
function clearChatLog() {
  chatLog = null;
  try { localStorage.removeItem("yurec-ai-log"); } catch (e) {}
  try { sessionStorage.removeItem("yurec-ai-log"); } catch (e2) {}
}
function formatChatText(list, indexes) {
  var src = list || [];
  if (indexes && indexes.length) {
    src = [];
    var j;
    for (j = 0; j < indexes.length; j++) if (list[indexes[j]]) src.push(list[indexes[j]]);
  }
  var head = "Чат с Юрцом · " + (readChatMode() === "sms" ? "SMS-ки" : "Разговор") + "\n\n";
  var i, lines = [];
  for (i = 0; i < src.length; i++) lines.push((src[i].role === "user" ? "Я: " : "Юрец: ") + src[i].text);
  return (head + lines.join("\n\n")).replace(/^\s+|\s+$/g, "");
}
function copyChatText(text) {
  if (!text) return "empty";
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return "copy";
    }
  } catch (e) {}
  try {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    if (ta.parentNode) ta.parentNode.removeChild(ta);
    return "copy";
  } catch (e2) {
    return "empty";
  }
}
function saveChatFile(text) {
  if (!text) return "empty";
  try {
    if (window.YurecNative && typeof window.YurecNative.appendChatLog === "function") {
      var r = window.YurecNative.appendChatLog(text);
      if (r === "need") return "need";
      if (r !== "fail") return "native";
    }
  } catch (e) {}
  try {
    var blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Юрец AI.txt";
    document.body.appendChild(a);
    a.click();
    if (a.parentNode) a.parentNode.removeChild(a);
    window.setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e3) {} }, 2000);
    return "file";
  } catch (e4) {
    return "empty";
  }
}
function shareChatText(text) {
  return copyChatText(text);
}
function flyBeep() {
  if (!showSound()) return;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ctx = new AC();
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 920;
    g.gain.value = 0.045;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.055);
  } catch (e) {}
}
function pinChatShortcut() {
  try {
    if (window.YurecNative && typeof window.YurecNative.pinChatShortcut === "function") {
      var r = window.YurecNative.pinChatShortcut();
      return r === "need" ? "need" : "ok";
    }
  } catch (e) {}
  return "web";
}
function chatHas(t, keys) {
  var i;
  for (i = 0; i < keys.length; i++) if (t.indexOf(keys[i]) !== -1) return true;
  return false;
}
function chatPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function localChatReply(mode, userText) {
  var t = fold(userText);
  var topic = "default";
  if (chatHas(t, ["привет", "здравств", "ало", "але", "здаров", "хай"])) topic = "hi";
  else if (chatHas(t, ["как дела", "как ты", "че как", "чё как", "как жизнь"])) topic = "how";
  else if (chatHas(t, ["пока", "бывай", "свидан", "отбой"])) topic = "bye";
  else if (chatHas(t, ["водк", "бух", "пить", "алкаш", "путинк", "рюм"])) topic = "vodka";
  else if (chatHas(t, ["шаверм", "лаваш"])) topic = "shawarma";
  else if (chatHas(t, ["светк", "светлан"])) topic = "sveta";
  else if (chatHas(t, ["костя", "кастян", "костян"])) topic = "kostya";
  else if (chatHas(t, ["зин", "ящер", "половник"])) topic = "zina";
  else if (chatHas(t, ["гош", "ворон", "ревэл", "ревел"])) topic = "gosha";
  else if (chatHas(t, ["бат", "фсб", "дробов"])) topic = "batya";
  else if (chatHas(t, ["людмил", "аптек"])) topic = "lyuda";
  else if (chatHas(t, ["олимп", "лыс", "линол"])) topic = "olymp";
  else if (chatHas(t, ["максидом"])) topic = "maxim";
  else if (chatHas(t, ["гранат", "тротил"])) topic = "grenade";
  else if (chatHas(t, ["fly", "флай", "телефон", "кнопочн"])) topic = "fly";
  else if (chatHas(t, ["нло", "тарелк"])) topic = "nlo";
  else if (chatHas(t, ["трешк", "квартир", "хата", "шотман"])) topic = "home";
  else if (chatHas(t, ["работ", "госуслуг", "резюме"])) topic = "work";
  else if (chatHas(t, ["деньг", "бабк", "коммунал"])) topic = "money";
  else if (chatHas(t, ["мент", "мусор", "полиц"])) topic = "cop";
  else if (chatHas(t, ["алис", "яндекс"])) topic = "alice";
  else if (chatHas(t, ["ты кто", "кто ты"])) topic = "who";
  else if (chatHas(t, ["помойкобол", "алконоид", "квест", "кроссворд"])) topic = "game";
  else if (chatHas(t, ["газет", "ваканс"])) topic = "paper";
  else if (chatHas(t, ["помойк", "просроч"])) topic = "dumpster";
  else if (chatHas(t, ["ларек", "ларёк", "толян", "в долг"])) topic = "kiosk";
  else if (chatHas(t, ["ссыт", "бак", "мусоропровод"])) topic = "chute";
  else if (chatHas(t, ["ссср", "совок", "музей"])) topic = "soviet";
  else if (chatHas(t, ["сенсор", "смартфон"])) topic = "sensor";
  else if (chatHas(t, ["анекдот", "боян"])) topic = "joke";
  else if (chatHas(t, ["лох", "дурак", "дебил", "нахуй"])) topic = "insult";
  else if (chatHas(t, ["молодец", "крутой", "легенд", "царь"])) topic = "nice";
  var Y = {
    hi: ["Алё. Это Юрец. Царь Шотмана на проводе. Говори, лох, только коротко — шаверма стынет.", "Ну здарова. Я, бля, легенда, а ты кто? Пиши, не мямли."],
    how: ["Нормально. Тушёнка, макароны, пол-литра «Путинки». Живу, как царь, только без скидки.", "Гоша орёт «РЕВЭЛ», Зина стучит половником, Светка не берёт трубку. Классика."],
    vodka: ["Водка — это не бухло, это инвестиция в легенду! «Путинка» — моя нефть.", "Без пол-литра я не царь, я просто Юра из трёшки."],
    shawarma: ["ШАВЕРМУ В ЛАВАШЕ, ЛОХИ! Без огурцов, или гриль улетит в Харьков!", "Жизнь без шавермы — пустая хрень."],
    sveta: ["Светка… богиня Максидома. Целую портрет на серванте, потом швыряю огурец. Любовь, бля.", "Она говорит «Юр, ну ты даёшь» и вешает трубку. Канон."],
    kostya: ["Кастян жрёт икру, а я ему с Fly орy, что менты у ног валялись. Он: «не вздумай». Я вздумаю."],
    zina: ["Зинаида Петровна. Половник. Ящер. В бак ссышь — она орёт. Я орy громче.", "Зина, вали нахуй, я бог!"],
    gosha: ["Гоша — ворон без хвоста. Орёт «РЕВЭЛ». Лучший советник на Шотмана."],
    batya: ["Батя из ФСБ. Дробовик. «Сынок, ты дебил!» — и вытаскивает из мусарни."],
    lyuda: ["Людмила Ивановна сказала «приятного дня» — я решил, она запала. Притащил «Мишку». Она: «я занята»."],
    olymp: ["«Олимпик» — это моё! Выперли за дичь. Лысый хер орёт «вали» — а я царь линолеума."],
    maxim: ["Максидом. Светка там дрели продаёт. Я туда как на свидание — с перегаром."],
    grenade: ["Граната — мой талисман, тротил — мой кореш. Дед с войны принёс."],
    fly: ["Кнопочный Fly — мой космический шаттл. Смартфон — говно для ботанов."],
    nlo: ["НЛО спиздило водку и улетело на Луну. Без меня."],
    home: ["Трёшка на Шотмана. Тушёнка спорит с «Путинкой». Я ОДИН В ТРЁШКЕ, АХАХА!"],
    work: ["ГосУслуги — код ящеров. Резюме — пережиток капитализма. Я царь."],
    money: ["Коммуналку не плачу, я царь. Пельмени, кабачки, Гоша орёт."],
    cop: ["Не сажайте меня, я просто хотел шаверму! Батя вытаскивает. Цирк."],
    alice: ["ДА ТЫ ОХУЕЛА, АЛИСА ЕБАНАЯ! Колонка думает, что умная. Я умнее. Я с куполами."],
    dumpster: ["На помойке меня знают. Просрочку дают бесплатно, как царю."],
    kiosk: ["Толян в ларьке наливает в долг. Я их главный спонсор."],
    chute: ["В мусоропровод ссышь — Зина уже с половником. А куда ещё."],
    paper: ["Газету «Работа» с помойки взял. Вакансия: ключник. Это я."],
    soviet: ["Дома музей СССР плюс помойка. Совок не умер — он на кухне."],
    sensor: ["Сенсорный тычу — сам в Китай звонит. Fly меня понимает."],
    joke: ["Боян про Вовочку. Смешно мне и Гоше."],
    who: ["Юрец. Царь Шотмана. Выперли из «Олимпика», люблю Светку."],
    game: ["Помойкобол, Алконоид, квест — это я в кнопки свою жизнь запихал. Кроссворды шотманские тоже мои."],
    insult: ["Сам лох. Я — бля, легенда, а ты таракан без скидки."],
    nice: ["Ну хоть кто-то в курсе. Я, бля, легенда. Передай Светке."],
    bye: ["Ладно, вали. Тушёнка стынет, Гоша гадит, Зина стучит. Пиши, как напьёшься."],
    default: ["Ну ты даёшь, конечно. Кастян такое не поймёт. Дальше конкретней, лох.", "Fly трещит, мозг как миксер с кирпичом. Повтори короче."]
  };
  var S = {
    hi: ["прив это юрец ваще пиши чо хош я тута", "алооо это я юрец из шотмана лол ну здарова"],
    how: ["норм всм тушенка макароны пол литра классика лол", "голова боле блин вчера перебрал но я ж легенда"],
    vodka: ["ааа водка канеш путинка это ваще база без неё никак"],
    shawarma: ["ШАВЕРМУ БЕЗ ОГУРЦОВ БЛИН жизнь без шавермы хрень"],
    sveta: ["светкаааа она в максидоме дрели продаёт а я думал овощи лол"],
    kostya: ["кастян он богатый икру жрёт а я ему с флай ору он ржёт"],
    zina: ["зина бабка ящер блин стучит половником орёт алкаш открой"],
    gosha: ["гоша ворон мой он ревэл орёт без хвоста на шкафу живёт топ"],
    batya: ["батя фсбшник с дробовиком сынок ты дебил класика"],
    lyuda: ["людмила из аптеки приятного дня сказала я подумал она влюбилась лол"],
    olymp: ["олимпик меня выперли лысый хер орёт вали а я царь линолеума"],
    maxim: ["максидом это светка там я к ней хожу как на свидание с перегаром лол"],
    grenade: ["граната под подушкой дед с войны принёс это не моё честно"],
    fly: ["флай кнопочный заряд раз в неделю и хватает смартфон для лохов"],
    nlo: ["нло водку спёрло и на луну улетело без меня ваще обидно"],
    home: ["трёшка на шотмана я один ахаха гоша на шкафу тушенка воняет"],
    work: ["работу ищу но госуслуги это код ящеров да пошли они"],
    money: ["коммуналку не плачу я царь пельмени кабачки гоша орёт"],
    cop: ["менты пришли склад нашли ржут не сажайте я шаверму хотел"],
    alice: ["алиса ебаная колонка тупая я ей про рептилоидов она мне погоду"],
    dumpster: ["на помойке меня знают просрочку дают как царю"],
    kiosk: ["толян в долг наливает я спонсор ларька"],
    chute: ["в бак ссышь зина орёт класика"],
    paper: ["газету с помойки взял вакансия ключник это я"],
    soviet: ["совок у меня на кухне сервант радуга"],
    sensor: ["сенсор сам звонит кнопочный меня понимает"],
    joke: ["боян про вовочку гоша ржёт"],
    who: ["я юрец царь шотмана кто не пон перечитай пилот"],
    game: ["помойкобол алконоид квест это ваще я в этом живу"],
    insult: ["сам лох я легенда а ты таракан блин"],
    nice: ["ооо спасибо кароч я ж легенда передай светке"],
    bye: ["пока лох тушенка стынет гоша гадит пиши как напьёшься"],
    default: ["хз кароч повтори короче флай тормозит", "ну ты даёшь я б это в шаверме рассказал да повар орёт вали"]
  };
  var pool = (mode === "sms" ? S : Y)[topic] || (mode === "sms" ? S.default : Y.default);
  return chatPick(pool);
}
function renderChat() {
  chatMode = readChatMode();
  var log = loadChatLog();
  try {
    if (sessionStorage.getItem("yurec-ai-pick") === "1") {
      sessionStorage.removeItem("yurec-ai-pick");
      chatSelecting = true;
      chatShareOpen = false;
      chatPicked = [];
    } else if (sessionStorage.getItem("yurec-ai-share") === "1") {
      sessionStorage.removeItem("yurec-ai-share");
      chatShareOpen = true;
      chatSelecting = false;
    }
  } catch (e0) {}
  var chips = ["Как там Светка?", "Батя звонил?", "Гошу покормил?", "Что на помойке дали?", "Нашёл работу в газете?", "НЛО водку спёрло?"];
  var html = '<div class="chat-page">' +
    '<div class="chat-sticky">' +
    '<div class="chat-head">' +
      '<img src="covers/chat.jpg" alt="" class="chat-cover" />' +
      '<div style="flex:1;min-width:0"><p class="kicker">Бета</p><h2>Чат с Юрцом</h2></div>' +
      '<button type="button" class="iconbtn" id="chat-share-btn" aria-label="Поделиться">' +
        '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>' +
      "</button>" +
    "</div>" +
    '<div class="chat-modes">' +
      '<button type="button" class="chat-mode' + (chatMode === "yurec" ? " on" : "") + '" data-chat-mode="yurec">Разговор</button>' +
      '<button type="button" class="chat-mode' + (chatMode === "sms" ? " on" : "") + '" data-chat-mode="sms">SMS-ки</button>' +
    "</div></div>" +
    '<div class="chat-log" id="chat-log">';
  var i, m, on;
  for (i = 0; i < log.length; i++) {
    m = log[i];
    on = chatSelecting && chatPicked.indexOf(i) >= 0;
    html += '<button type="button" class="chat-row ' + (m.role === "user" ? "mine" : "his") + (chatSelecting ? " chat-pick" : "") + (on ? " on" : "") + '" data-chat-i="' + i + '">' +
      (m.role === "yurec" ? '<img src="characters/yurec.jpg" alt="" class="chat-ava" />' : "") +
      '<p class="chat-bubble ' + (m.role === "user" ? "mine" : "his") + (chatMode === "sms" && m.role === "yurec" ? " sms" : "") + '">' + esc(m.text) + "</p></button>";
  }
  if (chatBusy) {
    html += '<div class="chat-row his"><img src="characters/yurec.jpg" alt="" class="chat-ava" /><p class="chat-bubble his typing"><span></span><span></span><span></span></p></div>';
  }
  html += "</div>";
  if (chatSelecting) {
    html += '<div class="chat-dock"><div class="chat-composer">' +
      '<button type="button" class="chat-wipe" id="chat-pick-cancel">×</button>' +
      '<button type="button" class="chat-share-go" id="chat-pick-copy"' + (chatPicked.length ? "" : " disabled") + ">Буфер (" + chatPicked.length + ")</button>" +
      '<button type="button" class="chat-share-file" id="chat-pick-file"' + (chatPicked.length ? "" : " disabled") + ">Backup</button>" +
    "</div></div>";
  } else {
    html += '<div class="chat-dock">' +
      '<div class="chat-chips">' +
        chips.map(function (c) { return '<button type="button" class="chat-chip" data-chip="' + esc(c) + '">' + esc(c) + "</button>"; }).join("") +
        '<button type="button" class="chat-chip gold" id="chat-random">Случайный звонок</button>' +
      "</div>" +
      '<form class="chat-composer" id="chat-form">' +
      '<button type="button" class="chat-wipe" id="chat-wipe" aria-label="Стереть переписку">×</button>' +
      '<textarea id="chat-input" rows="1" maxlength="500" placeholder="' + (chatMode === "sms" ? "пиши смс…" : "Написать Юрцу…") + '">' + esc(chatDraft) + "</textarea>" +
      '<button type="submit" class="chat-send" ' + (chatBusy ? "disabled" : "") + ' aria-label="Отправить">➤</button>' +
    "</form></div>";
  }
  if (chatShareOpen) {
    html += '<div class="chat-share" id="chat-share">' +
      '<p style="text-align:center;font-weight:650">Куда сохранить чат</p>' +
      '<button type="button" class="btn wide tg" id="chat-share-copy" style="margin-top:12px">В буфер обмена</button>' +
      '<button type="button" class="btn wide gold" id="chat-share-file" style="margin-top:8px">Файл в Backup</button>' +
      '<button type="button" class="btn wide off" id="chat-share-pick" style="margin-top:8px">Выбрать сообщения</button>' +
      '<button type="button" class="btn wide" id="chat-share-cancel" style="margin-top:8px">Отмена</button>' +
    "</div>";
  }
  if (chatNote) html += '<p class="chat-note">' + esc(chatNote) + "</p>";
  html += "</div>";
  return shell(html, "chat");
}
function bindChat() {
  var i, modes = document.querySelectorAll("[data-chat-mode]");
  for (i = 0; i < modes.length; i++) {
    modes[i].addEventListener("click", function () {
      var next = this.getAttribute("data-chat-mode") === "sms" ? "sms" : "yurec";
      chatMode = next;
      writeChatMode(next);
      paint();
    });
  }
  var chips = document.querySelectorAll("[data-chip]");
  for (i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      chatDraft = this.getAttribute("data-chip") || "";
      paint();
    });
  }
  on($("#chat-random"), "click", function () {
    var pool = ["Алё, чем двор дышит?", "Толян в долг ещё наливает?", "Светка трубку взяла?", "Зина опять половником?", "Расскажи, как сенсорный тыкал.", "Есть свежий зашквар?", "Батя с дробовиком дома?", "Шаверму уже взял?"];
    chatDraft = pool[Math.floor(Math.random() * pool.length)];
    paint();
  });
  on($("#chat-share-btn"), "click", function () { chatShareOpen = true; chatSelecting = false; paint(); });
  on($("#chat-share-cancel"), "click", function () { chatShareOpen = false; paint(); });
  on($("#chat-share-copy"), "click", function () {
    var how = copyChatText(formatChatText(loadChatLog()));
    chatShareOpen = false;
    chatNote = how === "copy" ? "Скопировано в буфер." : "Не удалось скопировать.";
    paint();
  });
  on($("#chat-share-file"), "click", function () {
    var how = saveChatFile(formatChatText(loadChatLog()));
    chatShareOpen = false;
    chatNote = how === "native" ? "Дописано в /sdcard/Backup/Юрец AI.txt" : (how === "need" ? "Разреши доступ к файлам и нажми ещё раз." : (how === "file" ? "Скачан файл «Юрец AI.txt»." : "Пока нечем делиться."));
    paint();
  });
  on($("#chat-share-pick"), "click", function () { chatShareOpen = false; chatSelecting = true; chatPicked = []; paint(); });
  on($("#chat-pick-cancel"), "click", function () { chatSelecting = false; chatPicked = []; paint(); });
  on($("#chat-pick-copy"), "click", function () {
    var how = copyChatText(formatChatText(loadChatLog(), chatPicked));
    chatSelecting = false;
    chatPicked = [];
    chatNote = how === "copy" ? "Скопировано в буфер." : "Не удалось скопировать.";
    paint();
  });
  on($("#chat-pick-file"), "click", function () {
    var how = saveChatFile(formatChatText(loadChatLog(), chatPicked));
    chatSelecting = false;
    chatPicked = [];
    chatNote = how === "native" ? "Дописано в /sdcard/Backup/Юрец AI.txt" : (how === "need" ? "Разреши доступ к файлам и нажми ещё раз." : (how === "file" ? "Скачан файл «Юрец AI.txt»." : ""));
    paint();
  });
  var rows = document.querySelectorAll("[data-chat-i]");
  for (i = 0; i < rows.length; i++) {
    rows[i].addEventListener("click", function () {
      if (!chatSelecting) return;
      var n = Number(this.getAttribute("data-chat-i"));
      var at = chatPicked.indexOf(n);
      if (at >= 0) chatPicked.splice(at, 1);
      else chatPicked.push(n);
      chatPicked.sort(function (a, b) { return a - b; });
      paint();
    });
  }
  on($("#chat-wipe"), "click", function () {
    chatLog = [{ role: "yurec", text: chatWelcome(chatMode) }];
    saveChatLog();
    paint();
  });
  var inp = $("#chat-input");
  if (inp) {
    inp.addEventListener("input", function () { chatDraft = this.value; });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChat();
      }
    });
    try { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e2) {}
  }
  on($("#chat-form"), "submit", function (e) {
    e.preventDefault();
    sendChat();
  });
  var logEl = $("#chat-log");
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
}
function sendChat() {
  if (chatBusy) return;
  var inp = $("#chat-input");
  var text = String((inp && inp.value) || chatDraft || "").replace(/\s+/g, " ").trim();
  if (!text) return;
  loadChatLog();
  chatLog.push({ role: "user", text: text.slice(0, 500) });
  chatDraft = "";
  chatBusy = true;
  saveChatLog();
  if (showVibrate() && navigator.vibrate) try { navigator.vibrate(18); } catch (e) {}
  flyBeep();
  paint();
  window.setTimeout(function () {
    var reply = localChatReply(chatMode, text);
    chatLog.push({ role: "yurec", text: reply });
    chatBusy = false;
    saveChatLog();
    paint();
  }, 420 + Math.floor(Math.random() * 280));
}

function renderChannel() {
  var episodes = 0, songs = 0;
  for (var i = 0; i < stories.length; i++) {
    if (stories[i].kind === "episode") episodes++;
    if (stories[i].kind === "song") songs++;
  }
  return shell(
    '<p class="kicker">О саге</p><h2 style="font-size:28px;margin-top:6px">Жизнь Юрца</h2>' +
    '<p class="muted" style="font-family:var(--serif);font-size:17px;line-height:1.55;margin-top:12px">' +
    "Комедийная сага в декорациях невской хрущёвки. Юрец, бабка Зинаида, Гоша без хвоста, «Олимпик», «Пятёрочка» и улица Шотмана.</p>" +
    '<div class="grid3"><div><b>' + episodes + "</b><span>серий</span></div><div><b>" + songs +
    "</b><span>песен</span></div><div><b>" + videos.length + "</b><span>роликов</span></div></div>" +
    '<div class="links" style="margin-top:20px;flex-direction:column">' +
    '<a class="btn yt wide" href="' + YT + '">YouTube · @yurec_xuec</a>' +
    '<a class="btn tg wide" href="' + TG + '">Telegram · t.me/yurec_xuec</a></div>' +
    '<section class="block"><h3>Автор</h3><p class="muted" style="margin-top:8px">' +
    "Сценарий и режиссура: Константин Смирнов. Тексты — из открытого телеграм-канала «Жизнь Юрца: Артхаусный хоррор».</p></section>" +
    '<p class="subtle" style="font-family:var(--serif);margin-top:24px;line-height:1.55">' +
    "Основано на реальных событиях. Отдельные сцены драматизированы для усиления эмоционального воздействия. Все совпадения с реальными лицами и событиями случайны.</p>",
    "channel"
  );
}


function themeBtnHtml(id, label) {
  var on = readTheme() === id;
  return '<button type="button" class="theme-btn theme-' + id + (on ? " on" : "") + '" data-theme-set="' + id + '">' +
    (id === "light" ? iconSun() : iconMoon()) + "<span>" + label + "</span></button>";
}
function nameBtnHtml() {
  var cur = readAppName();
  var ids = [
    ["short", "Жизнь Юрца"],
    ["saga", "Жизнь Юрца: Комедийная сага"],
    ["arthouse", "Жизнь Юрца: Артхаусный хоррор"]
  ];
  var html = '<div class="name-pick">', i;
  for (i = 0; i < ids.length; i++) {
    html += '<button type="button" class="name-opt' + (cur === ids[i][0] ? " on" : "") + '" data-app-name="' + ids[i][0] + '">' +
      esc(ids[i][1]) + "</button>";
  }
  html += "</div>";
  return html;
}
function widgetHourBtn(h, label) {
  var on = readWidgetHours() === h;
  return '<button type="button" class="freq-btn' + (on ? " on" : "") + '" data-widget-h="' + h + '">' + label + "</button>";
}
function setIco(inner) {
  return '<svg class="set-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg>";
}

function makeBackup() {
  var keys = {}, i, k, v;
  try {
    for (i = 0; i < localStorage.length; i++) {
      k = localStorage.key(i);
      if (!k || k.indexOf("yurec-") !== 0) continue;
      v = localStorage.getItem(k);
      if (v != null) keys[k] = v;
    }
  } catch (e) {}
  return { kind: "yurec-spravka", version: 1, at: new Date().toISOString(), keys: keys };
}
function exportBackup() {
  var pack = makeBackup();
  var text = JSON.stringify(pack, null, 2);
  try {
    if (window.YurecNative && typeof window.YurecNative.saveBackup === "function") {
      var r = window.YurecNative.saveBackup("Жизнь Юрца.json", text);
      return r === "need" ? "need" : "native";
    }
  } catch (e) {}
  try {
    var blob = new Blob([text], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Жизнь Юрца.json";
    document.body.appendChild(a);
    a.click();
    if (a.parentNode) a.parentNode.removeChild(a);
    window.setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e2) {} }, 2000);
    return "file";
  } catch (e3) {
    return "";
  }
}
function parseBackup(text) {
  var raw = JSON.parse(text);
  if (!raw || typeof raw !== "object") throw new Error("Пустой файл");
  var keys = raw.keys;
  if (!keys || typeof keys !== "object") throw new Error("Нет прогресса в файле");
  var clean = {}, k, n = 0;
  for (k in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, k)) continue;
    if (k.indexOf("yurec-") !== 0) continue;
    if (typeof keys[k] === "string") { clean[k] = keys[k]; n++; }
  }
  if (!n) throw new Error("В справке пусто");
  return { kind: "yurec-spravka", version: raw.version || 1, at: raw.at || "", keys: clean };
}
function applyBackup(pack) {
  var old = [], i, k;
  try {
    for (i = 0; i < localStorage.length; i++) {
      k = localStorage.key(i);
      if (k && k.indexOf("yurec-") === 0) old.push(k);
    }
    for (i = 0; i < old.length; i++) localStorage.removeItem(old[i]);
    for (k in pack.keys) {
      if (Object.prototype.hasOwnProperty.call(pack.keys, k)) localStorage.setItem(k, pack.keys[k]);
    }
  } catch (e) {}
}

function renderSettings() {
  var choice = readTheme();
  var booksOn = showBookNav();
  var infoOn = showInfoNav();
  var zashOn = showZashNav();
  var aiOn = showAiNav();
  var scrubOn = showScrub();
  var vibeOn = showVibrate();
  var soundOn = showSound();
  var awakeOn = showKeepAwake();
  var readN = readCount();
  var html = '<p class="kicker" style="text-align:center">Приложение</p>' +
    '<h2 style="font-size:28px;margin-top:4px;text-align:center">Настройки</h2>' +
    '<p class="muted" style="margin-top:8px;text-align:center">Тема на весь сборник, письма о багах и пара кнопок, которые нужны автору, а не двору.</p>' +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="17" r="2"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.5-.7-.5-1.1a1.6 1.6 0 0 1 1.7-1.7h2c3 0 5.5-2.5 5.5-5.5C22 6 17.5 2 12 2z"/>') + "Тема оформления</p>" +
      '<p class="subtle">Светлая — бумага. Тёмная — сумерки. Чёрная — OLED. «Как в системе» слушает телефон.</p>' +
      '<div class="theme-grid">' +
        themeBtnHtml("light", "Светлая") +
        themeBtnHtml("dark", "Тёмная") +
        themeBtnHtml("black", "Чёрная") +
      "</div>" +
      '<button type="button" class="btn wide' + (choice === "system" ? " on-sys" : " ghost") + '" id="theme-system">Задано системой</button>' +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<rect x="4" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/>') + "Нижнее меню</p>" +
      '<p class="subtle">Закладки, Зашквары и Инфо можно убрать из нижнего ряда — остальные кнопки растянутся. По умолчанию Зашквары на месте, Закладки спрятаны. Сами разделы никуда не денутся.</p>' +
      '<button type="button" class="set-switch" id="book-nav" role="switch" aria-checked="' + (booksOn ? "true" : "false") + '">' +
        "<span>Закладки</span><span class=\"pill" + (booksOn ? " on" : "") + '">' + (booksOn ? "включены" : "отключены") + "</span></button>" +
      '<button type="button" class="set-switch" id="zash-nav" role="switch" aria-checked="' + (zashOn ? "true" : "false") + '">' +
        "<span>Зашквары</span><span class=\"pill" + (zashOn ? " on" : "") + '">' + (zashOn ? "включены" : "отключены") + "</span></button>" +
      '<button type="button" class="set-switch" id="info-nav" role="switch" aria-checked="' + (infoOn ? "true" : "false") + '">' +
        "<span>Инфо</span><span class=\"pill" + (infoOn ? " on" : "") + '">' + (infoOn ? "включено" : "отключено") + "</span></button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>') + "Юрец AI · бета</p>" +
      '<p class="subtle">Импровизация: пишешь Юрцу. Кнопку можно поставить вниз, наверх рядом с темой — или оба сразу.</p>' +
      '<button type="button" class="set-switch" id="ai-nav" role="switch" aria-checked="' + (aiOn ? "true" : "false") + '">' +
        "<span>Кнопка в нижнем меню</span><span class=\"pill" + (aiOn ? " on" : "") + '">' + (aiOn ? "включена" : "отключена") + "</span></button>" +
      '<button type="button" class="set-switch" id="ai-top" role="switch" aria-checked="' + (showAiTop() ? "true" : "false") + '">' +
        "<span>Кнопка сверху слева</span><span class=\"pill" + (showAiTop() ? " on" : "") + '">' + (showAiTop() ? "включена" : "отключена") + "</span></button>" +
      '<button type="button" class="set-switch" id="ai-keep" role="switch" aria-checked="' + (showAiKeep() ? "true" : "false") + '">' +
        "<span>Сохранять историю</span><span class=\"pill" + (showAiKeep() ? " on" : "") + '">' + (showAiKeep() ? "включено" : "отключено") + "</span></button>" +
      '<p class="subtle">По умолчанию переписка сгорает, когда закрыл сборник.</p>' +
      '<a class="btn wide gold" href="#/chat" style="margin-top:8px">Открыть чат</a>' +
      '<button type="button" class="btn wide tg" id="ai-share" style="margin-top:8px">Поделиться</button>' +
      '<button type="button" class="btn wide gold" id="ai-pin" style="margin-top:8px">Ярлык «Юрец AI» на рабочий стол</button>' +
      '<button type="button" class="btn wide danger" id="ai-wipe" style="margin-top:8px">' + (wipeChatAsk ? "Точно стереть чат?" : "Очистить историю") + "</button>" +
      (chatNote && location.hash.indexOf("settings") >= 0 ? '<p class="bak-note">' + esc(chatNote) + "</p>" : "") +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>') + "Виджет</p>" +
      '<p class="subtle">«Цитата дня из Жизни Юрца» на рабочий стол — только фраза и кто орёт. Меняется сама, по выбранному интервалу. По умолчанию раз в сутки.</p>' +
      '<button type="button" class="btn wide gold" id="widget-pin">Добавить виджет на рабочий стол</button>' +
      '<p class="subtle" style="margin-top:12px">Как часто менять цитату</p>' +
      '<div class="freq-grid">' +
        widgetHourBtn(1, "1 ч") + widgetHourBtn(6, "6 ч") + widgetHourBtn(12, "12 ч") + widgetHourBtn(24, "24 ч") +
      "</div>" +
      (widgetNote ? '<p class="bak-note">' + esc(widgetNote) + "</p>" : "") +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>') + "Мультимедиа</p>" +
      '<p class="subtle">Звук и вибрация на всё приложение: Помойкобол, Алконоид, Юрца игра, отбив, гол, перетаскивание карточек. По умолчанию оба включены.</p>' +
      '<button type="button" class="set-switch" id="sound-nav" role="switch" aria-checked="' + (soundOn ? "true" : "false") + '">' +
        "<span>Звук</span><span class=\"pill" + (soundOn ? " on" : "") + '">' + (soundOn ? "включён" : "отключён") + "</span></button>" +
      '<button type="button" class="set-switch" id="vibe-nav" role="switch" aria-checked="' + (vibeOn ? "true" : "false") + '">' +
        "<span>Вибрация</span><span class=\"pill" + (vibeOn ? " on" : "") + '">' + (vibeOn ? "включена" : "отключена") + "</span></button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>') + "Экран</p>" +
      '<p class="subtle">Полезно в Помойкоболе, Алконоиде и Юрца игре: телефон не уснёт посреди розыгрыша. Пока включено — экран горит, пока сборник открыт.</p>' +
      '<button type="button" class="set-switch" id="awake-nav" role="switch" aria-checked="' + (awakeOn ? "true" : "false") + '">' +
        "<span>Не гасить экран</span><span class=\"pill" + (awakeOn ? " on" : "") + '">' + (awakeOn ? "включено" : "отключено") + "</span></button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>') + "Читалка</p>" +
      '<p class="subtle">Справа в рассказе — полоса, чтобы мотать пальцем, не свайпая. Если накладывается на системную — выключи, вернётся обычный скролл.</p>' +
      '<button type="button" class="set-switch" id="scrub-nav" role="switch" aria-checked="' + (scrubOn ? "true" : "false") + '">' +
        "<span>Полоса прокрутки</span><span class=\"pill" + (scrubOn ? " on" : "") + '">' + (scrubOn ? "включена" : "отключена") + "</span></button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="m9 10 2 2 4-4"/>') + "Прочитанное</p>" +
      '<p class="subtle">Сбросит отметки «прочитано» у всех рассказов. Сами тексты на месте.</p>' +
      '<button type="button" class="btn wide danger" id="wipe-read">' +
        (wipeReadAsk ? "Точно сбросить всё?" : ("Очистить прочитанное" + (readN ? " · " + readN : ""))) +
      "</button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') + "Герои</p>" +
      '<p class="subtle">Вернёт карточки во вкладке «Герои» к заводскому порядку. Сами герои на месте.</p>' +
      '<button type="button" class="btn wide danger" id="wipe-char">' +
        (wipeCharAsk ? "Точно сбросить всё?" : "Сбросить позиции Героев") +
      "</button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/>') + "Игры</p>" +
      '<p class="subtle">Вернёт карточки во вкладке «Игры» к заводскому порядку: квест, кроссворды, Помойкобол, Алконоид, Юрца игра.</p>' +
      '<button type="button" class="btn wide danger" id="wipe-games">' +
        (wipeGamesAsk ? "Точно сбросить всё?" : "Сбросить порядок игр") +
      "</button>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>') + "Иконка приложения</p>" +
      '<p class="subtle">На телефоне меняется ярлык в лаунчере. Иногда система думает пару секунд.</p>' +
      '<div class="icon-pick">' +
        '<button type="button" class="icon-opt' + (readAppIcon() === "comedy" ? " on" : "") + '" data-icon="comedy">' +
          '<img src="icons/comedy.jpg" alt="" /><span>Комедийная сага</span></button>' +
        '<button type="button" class="icon-opt' + (readAppIcon() === "horror" ? " on" : "") + '" data-icon="horror">' +
          '<img src="icons/horror.jpg" alt="" /><span>Артхаусный хоррор</span></button>' +
      "</div>" +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>') + "Название приложения</p>" +
      '<p class="subtle">Подпись под ярлыком на телефоне. Три варианта — короткий и два с подзаголовком. Иногда система думает пару секунд.</p>' +
      nameBtnHtml() +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h2"/><path d="M20 8v11a2 2 0 0 1-2 2h-2"/><path d="m9 15 3-3 3 3"/><path d="M12 12v9"/>') + "Резервное копирование</p>" +
      '<p class="subtle">Лицензия, прочитанное, игры, зашквары и тумблеры — всё в одном файле. Забери справку двора на диск и верни на другом телефоне.</p>' +
      '<button type="button" class="btn wide tg" id="bak-export">Забрать справку (экспорт)</button>' +
      '<input id="bak-file" type="file" accept="application/json,.json" style="display:none" />' +
      '<button type="button" class="btn wide off" id="bak-import" style="margin-top:8px">' +
        (wipeBakAsk ? "Точно вернуть справку?" : "Вернуть справку (импорт)") + "</button>" +
      (bakNote ? '<p class="bak-note">' + esc(bakNote) + "</p>" : "") +
      (bakErr ? '<p class="bak-err">' + esc(bakErr) + "</p>" : "") +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M8 2l2 4M16 2l-2 4M12 8a6 6 0 0 1 6 6v2a6 6 0 0 1-12 0v-2a6 6 0 0 1 6-6zM5 13h3M16 13h3M5 19l3-2M19 19l-3-2"/>') + "Поддержка</p>" +
      '<p class="subtle">Нашли дыру? Опишите, что сломалось, на каком экране, и по возможности приложите скриншот или запись экрана. Автор получит это в Telegram или на электронную почту.</p>' +
      '<button type="button" class="btn wide tg" id="bug-open">Сообщить о баге</button>' +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/>') + "Обновление</p>" +
      '<p class="subtle">Проверить, вышла ли новая сборка. Пока ведёт в пост канала, откуда ставится приложение.</p>' +
      '<a class="btn wide gold" href="' + UPDATE_URL + '">Проверить обновления</a>' +
    "</section>" +
    '<div class="set-rule" role="separator"><span></span><span class="set-rule-lab">' +
      setIco('<path d="M12 3l8 4v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7z"/>') +
      "Админка</span><span></span></div>" +
    '<p class="subtle" style="text-align:center;margin-top:8px">Предназначено исключительно для разработчика приложения. Здесь быстрые ссылки автора — чужой аккаунт сюда не пустят.</p>' +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 2l4 5 4-5"/>') + "Творческая студия</p>" +
      '<p class="subtle">Панель управления каналом на YouTube: комментарии, статистика, загрузка.</p>' +
      '<button type="button" class="btn wide yt" id="studio-open">Открыть студию</button>' +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>') + "Разработка</p>" +
      '<p class="subtle">Быстрый вход в облачный чат с Grok, где собирается это приложение.</p>' +
      '<button type="button" class="btn wide code" id="dev-open">Открыть разработку</button>' +
    "</section>" +
    '<section class="set-card">' +
      '<p class="set-head">' + setIco('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z"/>') + "Связь</p>" +
      '<p class="subtle">Позвонить помойному королю. Короткий набор, как его зовут. Живой номер в приложении не лежит.</p>' +
      '<button type="button" class="btn wide call" id="king-call">Позвонить</button>' +
    "</section>" +
    '<p class="subtle" style="text-align:center;margin-top:28px">Версия ' + esc((APP && APP.version) || "1.50.4") +
    "<br/>Лицензия: " + licenseLabel() + "</p>" +
    '<a class="btn wide gold" href="#/about" style="margin-top:16px;height:56px;font-size:16px">О приложении</a>';
  return shell(html, "about");
}
function openUrl(url) {
  try { window.open(url, "_blank"); } catch (e) { window.location.href = url; }
}
var KING_TEL = "962";
function openKingDial() {
  try {
    if (window.YurecNative && typeof window.YurecNative.openDial === "function") {
      window.YurecNative.openDial(KING_TEL);
      return;
    }
  } catch (e) {}
  try { window.location.href = "tel:" + KING_TEL; } catch (e2) {}
}
var modalLockY = 0;
function lockModal(on) {
  var html = document.documentElement;
  var body = document.body;
  if (on) {
    modalLockY = window.scrollY || 0;
    html.classList.add("modal-lock");
    body.style.top = "-" + modalLockY + "px";
    if (!window._yurecModalTouch) {
      window._yurecModalTouch = function (e) {
        if (!document.documentElement.classList.contains("modal-lock")) return;
        var t = e.target;
        while (t && t.nodeType === 1) {
          var tag = (t.tagName || "").toLowerCase();
          var cls = String(t.className || "");
          if (tag === "textarea" || tag === "input" || cls.indexOf("bug-facts") !== -1 || cls.indexOf("box") !== -1) return;
          t = t.parentElement;
        }
        e.preventDefault();
      };
      document.addEventListener("touchmove", window._yurecModalTouch, { passive: false });
    }
  } else {
    html.classList.remove("modal-lock");
    body.style.top = "";
    try { window.scrollTo(0, modalLockY); } catch (e) {}
  }
}
function openBugModal() {
  var el = document.getElementById("bug-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "bug-modal";
    el.className = "modal";
    el.innerHTML = '<form class="box">' +
      '<p class="ttl">Нашли баг?</p>' +
      '<p class="hint">Напишите, что сломалось и на каком экране. К сообщению сама пришьётся карточка устройства. Скриншот или запись экрана очень помогают.</p>' +
      '<textarea id="bug-text" rows="5" placeholder="Что нажал, что увидел, чего ждал…"></textarea>' +
      '<pre class="bug-facts" id="bug-dev"></pre>' +
      '<a class="btn wide tg" id="bug-tg" href="#">В Telegram</a>' +
      '<a class="btn wide purple" id="bug-mail" href="#">На почту</a>' +
      '<button type="button" class="btn danger wide" id="bug-cancel">Отмена</button></form>';
    document.body.appendChild(el);
    function closeBug() { el.style.display = "none"; lockModal(false); }
    el.addEventListener("click", function (e) { if (e.target === el) closeBug(); });
    document.getElementById("bug-cancel").addEventListener("click", closeBug);
    function refreshLinks() {
      var body = buildBugBody((document.getElementById("bug-text") || {}).value || "Опишите, что случилось.");
      var tg = document.getElementById("bug-tg");
      var mail = document.getElementById("bug-mail");
      if (tg) tg.href = SUPPORT_TG + "?text=" + encodeURIComponent(body);
      if (mail) mail.href = "mailto:" + SUPPORT_MAIL + "?subject=" + encodeURIComponent("Баг: Жизнь Юрца") + "&body=" + encodeURIComponent(body);
    }
    document.getElementById("bug-text").addEventListener("input", refreshLinks);
    var mailBtn = document.getElementById("bug-mail");
    if (mailBtn) mailBtn.addEventListener("click", function (e) {
      var body = buildBugBody((document.getElementById("bug-text") || {}).value || "Опишите, что случилось.");
      if (window.YurecNative && typeof window.YurecNative.openMail === "function") {
        e.preventDefault();
        window.YurecNative.openMail(SUPPORT_MAIL, "Баг: Жизнь Юрца", body);
      }
    });
    refreshLinks();
  }
  var ta = document.getElementById("bug-text");
  if (ta) ta.value = "";
  var body = buildBugBody("Опишите, что случилось.");
  var tg = document.getElementById("bug-tg");
  var mail = document.getElementById("bug-mail");
  if (tg) tg.href = SUPPORT_TG + "?text=" + encodeURIComponent(body);
  if (mail) mail.href = "mailto:" + SUPPORT_MAIL + "?subject=" + encodeURIComponent("Баг: Жизнь Юрца") + "&body=" + encodeURIComponent(body);
  var d = document.getElementById("bug-dev");
  if (d) d.textContent = deviceInfoBlock();
  el.style.display = "flex";
  lockModal(true);
}
function openDevModal() {
  var el = document.getElementById("dev-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "dev-modal";
    el.className = "modal";
    el.innerHTML = '<form class="box">' +
      '<p class="ttl">Ключ разработчика</p>' +
      '<p class="hint" id="dev-hint">Быстрые ссылки для перехода в Творческую студию YouTube и в облачный чат с Grok. Полезно исключительно для разработчика приложения.</p>' +
      '<input id="dev-key" type="text" autocomplete="off" placeholder="ключ" />' +
      '<p class="hint" id="dev-err"></p>' +
      '<div class="row"><button type="button" class="btn danger" id="dev-cancel">Отмена</button>' +
      '<button type="submit" class="btn gold" id="dev-enter">Войти</button></div></form>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) { if (e.target === el) { el.style.display = "none"; lockModal(false); } });
    document.getElementById("dev-cancel").addEventListener("click", function () { el.style.display = "none"; lockModal(false); });
    el.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = ((document.getElementById("dev-key") || {}).value || "");
      if (!unlockDeveloper(v)) {
        var h = document.getElementById("dev-err");
        if (h) { h.textContent = "Неверный ключ."; h.className = "hint err"; }
        return;
      }
      el.style.display = "none";
      try { burstFireworks(); } catch (err) {}
      try { paint(); } catch (err2) {}
      lockModal(false);
    });
  }
  var inp = document.getElementById("dev-key");
  if (inp) inp.value = "";
  var err = document.getElementById("dev-err");
  if (err) { err.className = "hint"; err.textContent = "Один раз — и окно больше не появится."; }
  var hint = document.getElementById("dev-hint");
  if (hint) {
    hint.textContent = "Быстрые ссылки для перехода в Творческую студию YouTube и в облачный чат с Grok. Полезно исключительно для разработчика приложения.";
  }
  el.style.display = "flex";
  lockModal(true);
  window.setTimeout(function () { if (inp) inp.focus(); }, 50);
}
function bindSettings() {
  var i, btns = document.querySelectorAll("[data-theme-set]");
  for (i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      setTheme(this.getAttribute("data-theme-set"));
      paint();
    });
  }
  on($("#theme-system"), "click", function () { setTheme("system"); paint(); });
  on($("#book-nav"), "click", function () { setBookNav(!showBookNav()); paint(); });
  on($("#zash-nav"), "click", function () { setZashNav(!showZashNav()); paint(); });
  on($("#info-nav"), "click", function () { setInfoNav(!showInfoNav()); paint(); });
  on($("#ai-nav"), "click", function () { setAiNav(!showAiNav()); paint(); });
  on($("#ai-top"), "click", function () { setAiTop(!showAiTop()); paint(); });
  on($("#ai-keep"), "click", function () { setAiKeep(!showAiKeep()); paint(); });
  on($("#ai-share"), "click", function () {
    try { sessionStorage.setItem("yurec-ai-share", "1"); } catch (e) {}
    location.hash = "#/chat";
  });
  on($("#ai-pin"), "click", function () {
    var how = pinChatShortcut();
    chatNote = how === "ok" ? "Android спросит: добавить ярлык «Юрец AI»." : (how === "need" ? "Разреши ярлыки и нажми ещё раз." : "Ярлык ставится в телефонной сборке.");
    paint();
  });
  on($("#widget-pin"), "click", function () {
    var how = pinQuoteWidget();
    widgetNote = how === "ok" ? "Android спросит: добавить виджет на рабочий стол." : (how === "old" ? "Зажми пустое место на рабочем столе → Виджеты → Жизнь Юрца." : (how === "need" ? "Добавь вручную: долгий тап по столу → виджеты." : "Виджет ставится в телефонной сборке."));
    paint();
  });
  var freq = document.querySelectorAll("[data-widget-h]");
  var fi;
  for (fi = 0; fi < freq.length; fi++) {
    freq[fi].addEventListener("click", function () {
      setWidgetHours(Number(this.getAttribute("data-widget-h")));
      paint();
    });
  }
  on($("#ai-wipe"), "click", function () {
    if (!wipeChatAsk) { wipeChatAsk = true; paint(); return; }
    clearChatLog();
    wipeChatAsk = false;
    burstRain();
    chatNote = "История стёрта. Можно звонить сначала.";
    paint();
  });
  on($("#vibe-nav"), "click", function () { setVibrate(!showVibrate()); paint(); });
  on($("#sound-nav"), "click", function () { setSound(!showSound()); paint(); });
  on($("#awake-nav"), "click", function () { setKeepAwake(!showKeepAwake()); paint(); });
  on($("#scrub-nav"), "click", function () { setScrub(!showScrub()); paint(); });
  on($("#wipe-read"), "click", function () {
    if (!wipeReadAsk) { wipeReadAsk = true; paint(); return; }
    clearAllRead();
    wipeReadAsk = false;
    burstRain();
    paint();
  });
  on($("#wipe-char"), "click", function () {
    if (!wipeCharAsk) { wipeCharAsk = true; paint(); return; }
    resetCharOrder();
    wipeCharAsk = false;
    burstRain();
    paint();
  });
  on($("#wipe-games"), "click", function () {
    if (!wipeGamesAsk) { wipeGamesAsk = true; paint(); return; }
    resetGameOrder();
    wipeGamesAsk = false;
    burstRain();
    paint();
  });
  on($("#bak-export"), "click", function () {
    bakErr = "";
    var how = exportBackup();
    if (how === "native") bakNote = "Справка: /sdcard/Backup/Жизнь Юрца.json";
    else if (how === "need") bakNote = "Разреши доступ к файлам и нажми экспорт ещё раз.";
    else if (how) bakNote = "Файл «Жизнь Юрца.json» скачан. На телефоне — /sdcard/Backup/.";
    else bakNote = "Не удалось забрать справку.";
    if (!how) bakErr = bakNote, bakNote = "";
    paint();
  });
  on($("#bak-import"), "click", function () {
    if (!wipeBakAsk) { wipeBakAsk = true; paint(); return; }
    var inp = $("#bak-file");
    if (inp) inp.click();
  });
  on($("#bak-file"), "change", function () {
    var f = this.files && this.files[0];
    this.value = "";
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var pack = parseBackup(String(reader.result || ""));
        applyBackup(pack);
        wipeBakAsk = false;
        bakErr = "";
        bakNote = "Справка двора вернулась. Двор всё вспомнил.";
        paint();
        window.setTimeout(function () { window.location.reload(); }, 400);
      } catch (err) {
        bakErr = (err && err.message) ? err.message : "Файл не справка.";
        bakNote = "";
        paint();
      }
    };
    reader.readAsText(f);
  });
  var icos = document.querySelectorAll("[data-icon]");
  for (i = 0; i < icos.length; i++) {
    icos[i].addEventListener("click", function () {
      setAppIcon(this.getAttribute("data-icon"));
      paint();
    });
  }
  var names = document.querySelectorAll("[data-app-name]");
  for (i = 0; i < names.length; i++) {
    names[i].addEventListener("click", function () {
      setAppName(this.getAttribute("data-app-name"));
      paint();
    });
  }
  on($("#bug-open"), "click", function () { openBugModal(); });
  on($("#studio-open"), "click", function () {
    if (isDev()) openUrl(STUDIO_URL);
    else openDevModal();
  });
  on($("#dev-open"), "click", function () {
    if (isDev()) openUrl(DEV_CHAT_URL);
    else openDevModal();
  });
  on($("#king-call"), "click", function () {
    if (isDev()) openKingDial();
    else openDevModal();
  });
}

function collectPassport() {
  var read = readSlugs();
  var set = {};
  var i;
  for (i = 0; i < read.length; i++) set[read[i]] = 1;
  var ep = 0, epN = 0, vis = 0, visN = 0, song = 0, songN = 0, sms = 0, smsN = 0;
  var list = window.STORIES || stories || [];
  for (i = 0; i < list.length; i++) {
    var k = list[i].kind;
    var on = !!set[list[i].slug];
    if (k === "episode") { ep++; if (on) epN++; }
    else if (k === "visit") { vis++; if (on) visN++; }
    else if (k === "song") { song++; if (on) songN++; }
    else if (k === "sms") { sms++; if (on) smsN++; }
  }
  var questIds = ["day", "olimpik", "tsar", "mirage", "dinner"];
  var questDone = 0, questEnds = 0, questMax = 0;
  for (i = 0; i < questIds.length; i++) {
    var ends = endingsOf(questIds[i]);
    if (ends.length) questDone++;
    questEnds += ends.length;
  }
  for (i = 0; i < LEVELS.length; i++) questMax += (LEVELS[i].endings || []).length;
  var cwN = 0;
  for (i = 0; i < CWS.length; i++) if (endingsOf(CWS[i].id).length) cwN++;
  var avIds = ["povar", "lysy", "yasher", "batya", "sveta", "kostya"];
  var avLabel = { povar: "Повар", lysy: "Лысый хер", yasher: "Бабка-ящер", batya: "Батя", sveta: "Светлана", kostya: "Костя" };
  var av = winsOf("yurec-av-wins");
  var avN = 0;
  for (i = 0; i < avIds.length; i++) if (Number(av[avIds[i]]) > 0) avN++;
  var ast = {};
  try { ast = JSON.parse(localStorage.getItem("yurec-av-stats") || "{}") || {}; } catch (e) { ast = {}; }
  var svetaBest = ast.sveta && typeof ast.sveta.best === "number" && ast.sveta.best > 0 ? ast.sveta.best : null;
  var avBest = null;
  for (i = 0; i < avIds.length; i++) {
    var row = ast[avIds[i]];
    var b = row && typeof row.best === "number" ? row.best : null;
    if (b != null && (avBest == null || b < avBest.ms)) avBest = { id: avIds[i], ms: b };
  }
  var arkIds = ["flat", "olimp", "maxi", "yard", "boss", "tolik", "pharm", "fsb", "batya", "kostya"];
  var ark = winsOf("yurec-ark-wins");
  var arkN = 0;
  for (i = 0; i < arkIds.length; i++) if (Number(ark[arkIds[i]]) > 0) arkN++;
  var kst = {};
  try { kst = JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}") || {}; } catch (e2) { kst = {}; }
  var arkBest = null;
  for (i = 0; i < arkIds.length; i++) {
    var bb = kst[arkIds[i]] && kst[arkIds[i]].best;
    if (typeof bb === "number" && (arkBest == null || bb < arkBest)) arkBest = bb;
  }
  var paid = false, dev = false;
  try {
    paid = localStorage.getItem(PAID_KEY) === "1";
    dev = localStorage.getItem(DEV_KEY) === "1";
  } catch (e3) {}
  var rows = [
    { k: "Серии", v: epN + " / " + ep, gold: epN === ep && ep > 0 },
    { k: "Песни", v: songN + " / " + song, gold: false },
    { k: "Визиты", v: visN + " / " + vis, gold: false },
    { k: "Бонусы", v: smsN + " / " + sms, gold: false },
    { k: "Квест", v: "уровней " + questDone + " / " + questIds.length, gold: false },
    { k: "Концовки квеста", v: questEnds + " / " + questMax, gold: false },
    { k: "Кроссворды", v: cwN + " / " + CWS.length, gold: cwN === CWS.length && CWS.length > 0 },
    { k: "Помойкобол", v: avN + " / " + avIds.length, gold: avN === avIds.length },
    { k: "Алконоид", v: arkN + " / " + arkIds.length, gold: arkN === arkIds.length },
    { k: "Юрца игра", v: svoyaPlays() ? ("рекорд " + svoyaBest()) : "ещё не играл", gold: svoyaBest() >= 15000 },
    { k: "Зашквары двора", v: achCount() + " / " + ACH_ITEMS.length, gold: achCount() >= ACH_ITEMS.length },
    { k: "Лицензия", v: dev ? "Разработчик" : paid ? "Приобретена" : "Гость двора", gold: paid || dev }
  ];
  var lines = [];
  if (svetaBest != null) lines.push("Быстрее всего уделал Светку — " + formatSpan(svetaBest) + ".");
  if (avBest && avBest.id !== "sveta") lines.push("Рекорд Помойкобола: " + (avLabel[avBest.id] || avBest.id) + " за " + formatSpan(avBest.ms) + ".");
  if (arkBest != null) lines.push("Алконоид, лучший заход — " + formatSpan(arkBest) + ".");
  if (svoyaBest() > 0) lines.push("Юрца игра, лучший счёт — " + svoyaBest() + ".");
  var streak = typeof ast.bestStreak === "number" ? ast.bestStreak : 0;
  if (streak > 1) lines.push("Максимальная серия побед в Помойкоболе — " + streak + ".");
  if (!lines.length) lines.push("Двор ещё ничего не запомнил. Читай, бей, разгадывай.");
  return { rows: rows, lines: lines };
}
function renderPassport() {
  var data = collectPassport();
  var cover = "covers/passport.jpg";
  var html = '<a class="back" href="#/about">← Назад в Инфо</a>' +
    '<button type="button" class="iconzoom" data-zoom="' + cover + '" aria-label="Открыть обложку: Паспорт двора">' +
    '<img src="' + cover + '" alt="Паспорт двора" style="width:100%;max-width:22rem;margin:12px auto 0;display:block;border-radius:16px" /></button>' +
    '<p class="kicker" style="margin-top:16px;text-align:center">Справка</p>' +
    '<h2 style="font-size:28px;margin-top:4px;text-align:center">Паспорт двора</h2>' +
    '<p class="muted" style="text-align:center;margin-top:8px;font-family:var(--serif);font-size:16px;line-height:1.6">Что двор уже запомнил. Скринь в канал — или молчи, как Юрец после рюмки.</p>' +
    '<section class="pass-board">';
  var i, r;
  for (i = 0; i < data.rows.length; i++) {
    r = data.rows[i];
    html += '<div class="pass-row"><span class="k">' + esc(r.k) + '</span><span class="v' + (r.gold ? " gold" : "") + '">' + esc(r.v) + "</span></div>";
  }
  html += "</section><section class=\"pass-lines\">";
  for (i = 0; i < data.lines.length; i++) {
    html += "<p>" + esc(data.lines[i]) + "</p>";
  }
  html += "</section>";
  return shell(html, "about");
}
function bindPassport() {
  var zooms = document.querySelectorAll("[data-zoom]");
  var i;
  for (i = 0; i < zooms.length; i++) {
    on(zooms[i], "click", function () { openZoom(this.getAttribute("data-zoom")); });
  }
}

function renderAbout() {
  var ver = (APP && APP.version) ? APP.version : "1.50.4";
  var built = (APP && APP.buildAt) ? APP.buildAt : "";
  var cover = aboutEgg ? "easter-horror.jpg" : "yurec-icon.jpg";
  var html = '<button type="button" class="iconzoom" data-zoom="' + cover + '" aria-label="Открыть обложку">' +
    '<img src="' + cover + '" alt="Жизнь Юрца" /></button>' +
    '<button type="button" class="egg-title" id="egg-title">' +
    '<p class="kicker" style="text-align:center;margin-top:18px">О приложении</p>' +
    '<h2 style="font-size:28px;text-align:center;margin-top:4px">Жизнь Юрца</h2>' +
    '<p class="muted" style="text-align:center;margin-top:4px">' + (aboutEgg ? "Артхаусный хоррор" : "Комедийная сага") + "</p></button>" +
    '<div class="about-copy">' +
    "<p>Сначала был открытый Telegram-канал: рассказы про Юрца, Лысого хера из «Олимпика», его «девушку» Светлану, бабку Зинаиду, ворона Гошу и хрущёвскую трёшку на улице Шотмана. Истории несколько раз редактировались с целью доведения до совершенства! Позднее к сериям были сгенерированы интерактивные обложки, отражающие содержимое конкретного эпизода — " +
    '<a href="https://t.me/yurec_xuec">https://t.me/yurec_xuec</a> <span class="subtle">(ID: 2552620595)</span></p>' +
    "<p>Потом те же серии начали получать экранизацию на YouTube — в какой-то момент уже с лицом, голосом и картинкой — " +
    '<a href="https://www.youtube.com/@yurec_xuec">https://www.youtube.com/@yurec_xuec</a> <span class="subtle">(ID: UCUe2h3bjoip1jAD2eX1stIA)</span></p>' +
    "<p>Дальше была попытка сделать небольшую текстовую игру (с помощью «Grok Build») для Windows с помощью автоматизированных скриптов на Python — " +
    '<a href="https://t.me/yurec_xuec/464">https://t.me/yurec_xuec/464</a></p>' +
    "<p>Теперь появилось это приложение (с помощью «Grok Build: Create apps»). Теперь есть возможность читать всю «комедийную сагу» прямо с телефона, будучи оффлайн. Без ленты. Без рекламы. Все рассказы, ссылки на ролики и песни, закладки, поиск, карточки персонажей и вкладка «Игры». Игра полностью переписана с нуля (в отличие от версии для Windows) и интегрирована в приложение — " +
    '<a href="https://t.me/yurec_xuec/479">https://t.me/yurec_xuec/479</a></p>' +
    "</div>";
  html += '<div class="links about-btns">' +
    '<a class="btn tg wide" href="' + TG + '">Telegram · t.me/yurec_xuec</a>' +
    '<a class="btn yt wide" href="' + YT + '">YouTube · @yurec_xuec</a>' +
    '<a class="btn pass wide" href="#/passport">Паспорт двора</a>' +
    '<a class="btn zash wide" href="#/zashkvary">Зашквары двора · ' + achCount() + " / " + ACH_ITEMS.length + "</a>" +
    '<a class="btn ideas wide" href="#/ideas">Нереализованные идеи</a>' +
    '<a class="btn log wide" href="#/changelog">История изменений</a>' +
    '<a class="btn gold wide" href="#/donate">Пожертвование</a></div>' +
    '<section class="disclaimer">' +
    '<p class="disc-label">· ДИСКЛЕЙМЕР ·</p>' +
    '<p class="disc-text">Основано на реальных событиях. Отдельные сцены драматизированы для усиления эмоционального воздействия. Материал носит исключительно юмористический и развлекательный характер и не преследует цели кого-либо оскорбить. Все совпадения с реальными лицами и событиями случайны.</p>' +
    '<p class="ver">Версия: ' + esc(ver) + "<br/>" +
    (built ? "Дата релиза: " + esc(built) + "<br/>" : "") +
    "Лицензия: " + licenseLabel() + "<br/>" +
    "Автор: Константин Смирнов<br/>Сборка: Grok</p>" +
    "</section>";
  if (aboutEgg) html += '<div class="egg-storm" id="egg-storm" aria-hidden="true"><i></i><i></i><i></i><span class="egg-bolt">⚡</span></div>';
  return shell(html, "about");
}

function renderIdeas() {
  var ideas = [
    "Публикация приложения в Google Play Market или RuStore (для Android);",
    "Порт приложения на iOS (для iPhone);",
    "Новые уровни «Юрцовского квеста» и «Кроссворды»;",
    "Третий визит к Юрцу (ещё больше треш-контента)."
  ];
  var html = '<a class="back" href="#/about">← Назад в Инфо</a>' +
    '<p class="kicker" style="margin-top:16px">О приложении</p>' +
    '<h2 style="font-size:28px;margin-top:4px">Нереализованные идеи</h2>' +
    '<p class="ideas-lead">Здесь лежит то, до чего руки пока не доходят. Это не обещание и не дорожная карта — просто мысли, чтобы не стёрлись. Если когда-нибудь появятся время, бензин и вдохновение, часть этого может ожить. Пока — черновик Шотмана.</p>';
  var i;
  for (i = 0; i < ideas.length; i++) {
    html += '<p class="ideas-item">· ' + esc(ideas[i]) + "</p>";
  }
  return shell(html, "about");
}

function renderZashkvary() {
  var store = readAchStore();
  var html = '<a class="back" href="#/about">← Назад в Инфо</a>' +
    '<button type="button" class="iconzoom" data-zoom="' + achSrc("cover") + '" aria-label="Открыть обложку">' +
    '<img src="' + achSrc("cover") + '" alt="Зашквары двора" style="width:100%;max-width:22rem;margin:12px auto 0;display:block;border-radius:16px" /></button>' +
    '<p class="kicker" style="margin-top:16px;text-align:center">Инфо</p>' +
    '<h2 style="font-size:28px;margin-top:4px;text-align:center">Зашквары двора</h2>' +
    '<p class="ideas-lead">Двор не выдаёт медали. Двор выдаёт зашквары. Список закрыт, пока сам не нажрёшься славы. На закрытый — подсказка. На открытый — ор и дата.</p>' +
    '<p class="subtle" style="text-align:center;margin-top:12px">открыто ' + achCount() + " / " + ACH_ITEMS.length + "</p>" +
    '<ul class="ach-board">';
  var i, a, on;
  for (i = 0; i < ACH_ITEMS.length; i++) {
    a = ACH_ITEMS[i];
    on = !!store[a.id];
    html += '<li><button type="button" class="ach-card' + (on ? " on" : "") + '" data-ach="' + a.id + '">' +
      '<span class="ach-shot"><img src="' + (on ? achSrc(a.id) : achSrc("locked")) + '" alt=""' + (on ? "" : ' class="ach-locked-img"') + ' />' +
      (on ? "" : '<span class="ach-lock-label">???</span>') + "</span>" +
      '<span class="ach-name">' + esc(on ? a.title : "Закрыто") + "</span></button></li>";
  }
  html += "</ul>";
  return shell(html, showZashNav() ? "zash" : "about");
}

function bindZashkvary() {
  var zooms = document.querySelectorAll("[data-zoom]");
  var i;
  for (i = 0; i < zooms.length; i++) {
    on(zooms[i], "click", function () { openZoom(this.getAttribute("data-zoom")); });
  }
  var btns = document.querySelectorAll("[data-ach]");
  var i;
  for (i = 0; i < btns.length; i++) {
    on(btns[i], "click", function () {
      var id = this.getAttribute("data-ach");
      var a = getAch(id);
      if (!a) return;
      var store = readAchStore();
      var open = !!store[a.id];
      var when = "";
      if (open && store[a.id]) {
        try {
          when = new Date(store[a.id]).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch (e) {}
      }
      var overlay = document.createElement("div");
      overlay.className = "ach-modal";
      overlay.innerHTML = '<div class="ach-modal-card">' +
        '<img src="' + (open ? achSrc(a.id) : achSrc("locked")) + '" alt="" />' +
        '<p class="starfall-kicker">' + (open ? "Зашквар открыт" : "Пока закрыто") + "</p>" +
        '<p class="starfall-title">' + esc(open ? a.title : "???") + "</p>" +
        '<p class="starfall-flavor">' + esc(open ? a.flavor : a.hint) + "</p>" +
        (when ? '<p class="subtle" style="text-align:center;margin-top:8px">' + esc(when) + "</p>" : "") +
        '<button type="button" class="btn bar wide ach-modal-close" style="margin-top:16px">Закрыть</button></div>';
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.parentNode && overlay.parentNode.removeChild(overlay);
      });
      overlay.querySelector(".ach-modal-close").addEventListener("click", function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      });
      document.body.appendChild(overlay);
    });
  }
}

function renderChangelog() {
  var html = '<a class="back" href="#/about">← Назад в Инфо</a>' +
    '<p class="kicker" style="margin-top:16px">О приложении</p>' +
    '<h2 style="font-size:28px;margin-top:4px">История изменений</h2>' +
    '<p class="subtle" style="margin-top:8px">Краткая история сборок.</p>';
  var hist = (APP && APP.history) ? APP.history : [];
  var i, j, e;
  for (i = 0; i < hist.length; i++) {
    e = hist[i];
    html += '<div class="log">' +
      '<div class="loghead"><b>' + esc(e.version) + "</b><span>" + esc(e.at || "") + "</span></div><ul>";
    var items = e.items || [];
    for (j = 0; j < items.length; j++) {
      html += "<li>" + esc(items[j]) + "</li>";
    }
    html += "</ul></div>";
  }
  return shell(html, "about");
}

function renderDonate() {
  var html = '<a class="back" href="#/about">← Назад в Инфо</a>';
  if (isPaid() && !donateAgain) {
    html += '<img src="donate/yes.jpg" alt="" class="donate-hero" data-zoom="donate/yes.jpg" />' +
      '<p class="kicker" style="margin-top:20px;color:#c9a227;text-align:center;letter-spacing:0.02em;text-transform:none;font-size:30px;font-weight:650">Спасибо за поддержку!</p>' +
      '<div class="about-copy donate-copy">' +
      "<p>Лицензия открыта. Навсегда.</p>" +
      "<p>Юрец уже орёт в голос, что вы — его лучший холоп, и он готов за вас хоть в окно выпрыгнуть (с третьего, аккуратно).</p>" +
      "<p>Это не подписка на страдание. Это комедийная сага. Рассказы, серии, песни — были бесплатными и останутся бесплатными. Без рекламы. Без «ещё 15 секунд». Без «посмотрите, как красиво мы вам жизнь портим».</p>" +
      "<p>Если когда-нибудь снова захочется кинуть бензин в бак — кнопка «Пожертвование» никуда не денется.</p>" +
      "<p>Шотман помнит своих. И любит.</p>" +
      "<p>Читайте дальше. Здесь ещё много шума.</p>" +
      "</div>" +
      renderOfflineBox() +
      '<button type="button" class="btn gold wide" id="donate-again" style="margin-top:24px">Пожертвовать ещё раз</button>' +
      '<button type="button" class="btn danger wide" id="donate-lock" style="margin-top:12px">Удалить лицензию</button>';
    return shell(html, "about");
  }
  html += '<img src="donate/no.jpg" alt="" class="donate-hero" data-zoom="donate/no.jpg" />' +
    '<p class="kicker" style="margin-top:20px;color:#c9a227;text-align:center;letter-spacing:0.02em;text-transform:none;font-size:30px;font-weight:650">Добровольное пожертвование</p>' +
    '<p class="muted" style="font-family:var(--serif);font-size:17px;margin-top:8px;text-align:center">единовременная покупка</p>' +
    '<div class="about-copy donate-copy">' +
    "<p>Для новых историй и свежих видео мне нужно вдохновение — а оно, как известно, сидит на Шотмана и периодически выдаёт шедевры безумия! Каждая встреча с Юрцом — это новый порционный зашквар, от которого хочется и ржать, и немного бояться. А каждый выезд к нему — полноценное приключение с непредсказуемым финалом (обычно мокрым, странным и очень смешным).</p>" +
    "<p>Если тебе нравится этот цирк и ты хочешь, чтобы комедийная сага продолжалась регулярно и без пауз — поддержи автора! Все средства пойдут строго по делу: телефонные разговоры с Юрцом (он ведь не всегда на связи, когда надо), бензин, новые вылазки, съёмка, монтаж и генерация новых серий с помощью нейросетей. Чем больше донатов — тем быстрее выходят свежие ролики. Хочешь, чтобы следующий эпизод вышел через неделю, а не через месяц? Решаешь ты!</p>" +
    "<p>Каждый донат — это не просто «спасибо», это прямой ускоритель контента. Юрец уже на низком старте и готов рассказывать про свою жизнь, нейросети ждут команд, а я готов звонить, ехать и монтировать. Жми донат, пока Юрец не начал рассказывать историю без нас!</p>" +
    "</div>" +
    '<div class="block" style="margin-top:20px">' +
    '<p class="kicker" style="color:#c9a227;text-transform:none;letter-spacing:0.08em;text-align:center;font-size:15px">Стоимость</p>' +
    '<p style="font-size:28px;font-weight:650;margin-top:8px;text-align:center">1000 ₽</p>' +
    '<p class="muted" style="margin-top:8px">Это не подписка. Один платёж — и лицензионный ключ откроет весь платный контент в приложении навсегда!</p>' +
    '<p class="muted" style="margin-top:12px">Для приобретения лицензии необходимо сделать перевод по следующим реквизитам: <button type="button" class="card-copy" id="copy-card">2200 7001 4728 7493</button> (Т-Банк) и обязательно указать комментарий «Жизнь Юрца». После этого напишите автору канала и получите свой лицензионный ключ!</p>' +
    '<p class="hint" id="copy-hint" style="display:none">Номер карты скопирован</p>' +
    '<a class="btn tg wide" href="https://t.me/nick_stokes" style="margin-top:12px">Написать автору в Telegram</a></div>' +
    '<p class="subtle" style="margin-top:16px;font-family:var(--serif);font-size:15px;line-height:1.55">Текстовые рассказы в Telegram, видеоролики и песни на YouTube — всё это по-прежнему бесплатно и без рекламы. Оплата открывает доступ к эксклюзивному контенту, даёт возможность смотреть все материалы оффлайн, а также существенно ускоряет развитие канала!</p>';
  if (!isPaid()) {
    html += '<form class="block" id="donate-key" style="margin-top:24px">' +
      '<p class="ttl">Уже куплено? Введите ключ:</p>' +
      '<input id="donate-input" type="text" autocomplete="off" placeholder="лицензионный ключ" />' +
      '<p class="hint" id="donate-hint">После ввода ключа это окно больше не появится.</p></form>';
  }
  return shell(html, "about");
}

function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t);
    return;
  }
  var i = document.createElement("input");
  i.value = t;
  document.body.appendChild(i);
  i.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(i);
}

function openLockModal() {
  var el = document.getElementById("lock-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "lock-modal";
    el.className = "modal";
    el.innerHTML = '<div class="box">' +
      '<p class="ttl">Удалить лицензию?</p>' +
      '<p class="hint">После этого нужно будет заново ввести лицензионный ключ. Платный контент снова закроется. Если был доступ разработчика — он тоже сбросится.</p>' +
      '<div class="row"><button type="button" class="btn ghost" id="lock-cancel">Отмена</button>' +
      '<button type="button" class="btn danger" id="lock-ok">Удалить</button></div></div>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) { if (e.target === el) el.style.display = "none"; });
    el.querySelector("#lock-cancel").addEventListener("click", function () { el.style.display = "none"; });
    el.querySelector("#lock-ok").addEventListener("click", function () {
      el.style.display = "none";
      burstRain();
      lockPaid();
      donateAgain = false;
      paint();
    });
  }
  el.style.display = "flex";
}

function bindDonate() {
  on($("#donate-again"), "click", function () {
    donateAgain = true;
    paint();
  });
  on($("#donate-lock"), "click", function () { openLockModal(); });
  on($("#copy-card"), "click", function () {
    copyText("2200 7001 4728 7493");
    var h = $("#copy-hint");
    if (h) h.style.display = "block";
  });
  var inp = $("#donate-input");
  function applyKey() {
    var v = (inp && inp.value) || "";
    if (tryUnlock(v)) {
      donateAgain = false;
      try { if (inp && inp.blur) inp.blur(); } catch (e) {}
      afterUnlock();
    } else if (v.replace(/^\s+|\s+$/g, "")) {
      var h = $("#donate-hint");
      if (h) { h.textContent = "Неверный ключ."; h.className = "hint err"; }
    }
  }
  on(inp, "input", function () {
    var v = (inp.value || "").replace(/^\s+|\s+$/g, "");
    if (window.YurecGate && (window.YurecGate.paid(v) || window.YurecGate.dev(v))) applyKey();
  });
  var form = $("#donate-key");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    applyKey();
  });
  var zooms = document.querySelectorAll("[data-zoom]");
  for (var i = 0; i < zooms.length; i++) {
    zooms[i].addEventListener("click", function () { openZoom(this.getAttribute("data-zoom")); });
  }
  bindOfflinePage();
}

function bindOfflinePage() {
  on($("#off-all"), "click", function () { openOffAllModal(); });
  on($("#off-player-mode"), "click", function () {
    setOffPlayerMode(offPlayerMode() === "ext" ? "in" : "ext");
    paint();
  });
  bindOfflineBtns();
  var dels = document.querySelectorAll("[data-off-del]");
  var i;
  for (i = 0; i < dels.length; i++) {
    dels[i].addEventListener("click", function () {
      var id = this.getAttribute("data-off-del");
      if (window.YurecNative && window.YurecNative.remove) window.YurecNative.remove(id);
      OFFLINE.cached[id] = false;
      paint();
    });
  }
  var plays = document.querySelectorAll("[data-off-play]");
  for (i = 0; i < plays.length; i++) {
    plays[i].addEventListener("click", function () {
      clickOffline(this.getAttribute("data-off-play"));
    });
  }
}

function openOffAllModal() {
  var el = document.getElementById("off-all-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "off-all-modal";
    el.className = "modal";
    el.innerHTML = '<div class="box"><p class="ttl">Скачать всё?</p>' +
      '<p class="hint" id="off-all-hint"></p>' +
      '<div class="row"><button type="button" class="btn danger" id="off-all-cancel">Отмена</button>' +
      '<button type="button" class="btn off" id="off-all-ok">Скачать</button></div></div>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) { if (e.target === el) el.style.display = "none"; });
    el.querySelector("#off-all-cancel").addEventListener("click", function () { el.style.display = "none"; });
    el.querySelector("#off-all-ok").addEventListener("click", function () {
      el.style.display = "none";
      downloadAllOffline();
    });
  }
  var h = document.getElementById("off-all-hint");
  if (h) h.textContent = "Весь медиа-контент весит " + formatBytes(packBytes()) + ". Файлы качаются по очереди и останутся на телефоне для просмотра без сети.";
  el.style.display = "flex";
}

function downloadAllOffline() {
  if (!isPaid()) { openPaidModal(); return; }
  var items = OFFLINE.items || [];
  var i, item;
  offBoxOpen = true;
  for (i = 0; i < items.length; i++) {
    item = items[i];
    if (OFFLINE.cached[item.id]) continue;
    if (window.YurecNative && window.YurecNative.download) {
      window.YurecNative.download(JSON.stringify({ id: item.id, url: item.url, size: item.size, sha256: item.sha256, ext: item.ext || (/\.mp3$/i.test(item.file || "") || item.kind === "call" ? "mp3" : "mp4") }));
    }
  }
  paint();
}

function saveKey(id) { return "yurec-game-save:" + id; }
function endKey(id) { return "yurec-game-endings:" + id; }
function migrateDay() {
  try {
    if (!localStorage.getItem(saveKey("day"))) {
      var old = localStorage.getItem(GSAVE_LEGACY);
      if (old) localStorage.setItem(saveKey("day"), old);
    }
    if (!localStorage.getItem(endKey("day"))) {
      var old2 = localStorage.getItem(GEND_LEGACY);
      if (old2) localStorage.setItem(endKey("day"), old2);
    }
  } catch (e) {}
}
function getLevel(id) {
  for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return LEVELS[i];
  return null;
}
function setLevel(id) {
  var lvl = getLevel(id);
  var changed = gLevelId !== id;
  GAME = lvl;
  gLevelId = lvl ? id : "";
  if (changed) {
    gPhase = "title";
    gSteps = 0;
    gNode = lvl && lvl.start ? lvl.start : "wake";
    gStats = lvl ? gFresh() : {};
  }
}
function gReadSaveId(id) {
  if (id === "day") migrateDay();
  try {
    var raw = JSON.parse(localStorage.getItem(saveKey(id)) || "null");
    if (raw && raw.node && raw.stats) return raw;
  } catch (e) {}
  return null;
}
function gReadSave() {
  return gReadSaveId(gLevelId || "day");
}
function gWriteSave(save) {
  var id = gLevelId || "day";
  try {
    if (save) localStorage.setItem(saveKey(id), JSON.stringify(save));
    else localStorage.removeItem(saveKey(id));
  } catch (e) {}
}
function gEndingsId(id) {
  if (id === "day") migrateDay();
  try {
    var raw = JSON.parse(localStorage.getItem(endKey(id)) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function gEndings() {
  return gEndingsId(gLevelId || "day");
}
function gRecord(id) {
  var lid = gLevelId || "day";
  var cur = gEndingsId(lid);
  if (cur.indexOf(id) !== -1) return;
  cur.push(id);
  try { localStorage.setItem(endKey(lid), JSON.stringify(cur)); } catch (e) {}
}
function gUnlockAll() {
  if (!GAME) return;
  var ids = [], i, ends = GAME.endings || [];
  for (i = 0; i < ends.length; i++) ids.push(ends[i].id);
  try { localStorage.setItem(endKey(gLevelId || "day"), JSON.stringify(ids)); } catch (e) {}
}
function gClamp(n) {
  n = Math.round(n);
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
function gFresh() {
  var out = {};
  var keys = GAME.stats || [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i].key;
    out[k] = gClamp((GAME.startStats && GAME.startStats[k]) || 0);
  }
  return out;
}
function gApply(stats, delta) {
  var next = {};
  var k;
  for (k in stats) if (Object.prototype.hasOwnProperty.call(stats, k)) next[k] = stats[k];
  if (!delta) return next;
  for (k in delta) if (Object.prototype.hasOwnProperty.call(delta, k)) {
    next[k] = gClamp((next[k] || 0) + delta[k]);
  }
  return next;
}
function gHud(stats) {
  var html = '<ul class="hud">';
  var list = GAME.stats || [];
  for (var i = 0; i < list.length; i++) {
    var k = list[i].key;
    var v = gClamp(stats[k] || 0);
    html += '<li><div class="row"><span>' + esc(list[i].label) + '</span><span class="n">' + v +
      '</span></div><div class="bar"><i style="width:' + v + '%"></i></div></li>';
  }
  return html + "</ul>";
}
function gMeta(id) {
  var ends = GAME.endings || [];
  for (var i = 0; i < ends.length; i++) if (ends[i].id === id) return ends[i];
  return { id: id, title: id, rank: "" };
}
function gRankClass(rank) {
  if (rank === "триумф") return " r-win";
  if (rank === "канон") return " r-canon";
  if (rank === "позор") return " r-shame";
  if (rank === "тишина") return " r-quiet";
  if (rank === "редкая") return " r-rare";
  if (rank === "хвастовство") return " r-boast";
  if (rank === "триумф мелкий") return " r-small";
  return "";
}
function gMeets(stats, need) {
  if (!need) return true;
  var k;
  for (k in need) if (Object.prototype.hasOwnProperty.call(need, k)) {
    if ((stats[k] || 0) < need[k]) return false;
  }
  return true;
}
function gNeedHint(need) {
  if (!need) return "";
  var list = GAME.stats || [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
    if (need[list[i].key] != null) out.push(list[i].label + " " + need[list[i].key] + "+");
  }
  return out.join(" · ");
}
function gVerdict(stats) {
  var parts = [];
  if (GAME && GAME.id === "mirage") {
    var vodkaM = stats.vodka || 0, svetkaM = stats.svetka || 0, romance = stats.romance || 0, doubt = stats.doubt || 0;
    if (vodkaM >= 70) parts.push("тосты за мираж");
    else if (vodkaM >= 40) parts.push("романтика на «Путинке»");
    if (svetkaM >= 70) parts.push("на одной волне");
    else if (svetkaM >= 40) parts.push("ещё целует портрет");
    else if (svetkaM <= 12) parts.push("НЛО над сервантом");
    if (romance >= 60) parts.push("люстра как дворец");
    else if (romance >= 30) parts.push("шпроты на скатерти");
    if (doubt >= 55) parts.push("мираж, как НЛО");
    else if (doubt >= 30) parts.push("Костя уже ржёт");
    return parts.length ? parts.join(" · ") : "просто Юрец и его царица";
  }
  if (GAME && GAME.id === "tsar") {
    var vodkaT = stats.vodka || 0, analog = stats.analog || 0, svetkaT = stats.svetka || 0, net = stats.net || 0;
    if (vodkaT >= 70) parts.push("Путинка в 1978-м");
    else if (vodkaT >= 40) parts.push("перегар как антенна");
    if (analog >= 70) parts.push("царь без Wi-Fi");
    else if (analog >= 40) parts.push("диск ещё тёплый");
    else if (analog <= 20) parts.push("почти купил смартфон");
    if (svetkaT >= 50) parts.push("стихи на газете");
    else if (svetkaT <= 8) parts.push("SMS так и не ушло");
    if (net >= 60) parts.push("шпионы в розетке");
    else if (net >= 30) parts.push("Зинаида уже в эфире");
    return parts.length ? parts.join(" · ") : "просто Юрец без интернета";
  }
  if (GAME && GAME.id === "olimpik") {
    var vodka = stats.vodka || 0, craft = stats.craft || 0, boss = stats.boss || 0, nerve = stats.nerve || 0;
    if (vodka >= 70) parts.push("Путинка в жилетке");
    else if (vodka >= 40) parts.push("перегар как знамя");
    if (craft >= 70) parts.push("фараон линолеума");
    else if (craft >= 40) parts.push("режет, как ниндзя");
    if (boss >= 60) parts.push("лысый уже орёт");
    else if (boss >= 30) parts.push("кабинет не спит");
    if (nerve <= 20) parts.push("смена мертва");
    else if (nerve >= 55) parts.push("ещё в штате, чудом");
    return parts.length ? parts.join(" · ") : "просто Юрец на Челиева";
  }
  var vodka2 = stats.vodka || 0, legend = stats.legend || 0, svetka = stats.svetka || 0, heat = stats.heat || 0;
  if (vodka2 >= 70) parts.push("Наполеон без бахил");
  else if (vodka2 >= 40) parts.push("после трёх «Путинок»");
  if (legend >= 70) parts.push("император Шотмана");
  else if (legend >= 40) parts.push("царь линолеума");
  if (svetka >= 50) parts.push("ещё верит в Светку");
  else if (svetka <= 8) parts.push("трубка давно молчит");
  if (heat >= 60) parts.push("на карандаше у ментов");
  else if (heat >= 30) parts.push("район уже шушукается");
  return parts.length ? parts.join(" · ") : "просто Юрец, и этого хватает";
}

var CWS = [];
var CW = null;
var cwId = "";
var cwFill = {};
var cwSecret = [];
var cwSel = { r: 0, c: 0 };
var cwDir = "across";
var cwPhase = "title";
var CW_KB = ["ЙЦУКЕНГШЩЗХ", "ФЫВАПРОЛДЖЭ", "ЯЧСМИТЬБЮЁ"];

function getCrossword(id) {
  var i;
  for (i = 0; i < CWS.length; i++) if (CWS[i].id === id) return CWS[i];
  return null;
}
function cwKey(r, c) { return r + "," + c; }
function cwFillKey(id) { return "yurec-cw:v2:" + id + ":fill"; }
function cwSecretKey(id) { return "yurec-cw:" + id + ":secret"; }
function cwEmptySecret(data) {
  var n = (data && data.secret ? data.secret.length : 5), a = [], i;
  for (i = 0; i < n; i++) a.push("");
  return a;
}
function cwMigrate(id) {
  if (id !== "crossword") return;
  try {
    if (!localStorage.getItem(cwFillKey(id))) {
      var old = localStorage.getItem("yurec-crossword:fill");
      if (old) localStorage.setItem(cwFillKey(id), old);
    }
    if (!localStorage.getItem(cwSecretKey(id))) {
      var oldS = localStorage.getItem("yurec-crossword:secret");
      if (oldS) localStorage.setItem(cwSecretKey(id), oldS);
    }
  } catch (e) {}
}
function setCrossword(id) {
  var data = getCrossword(id);
  if (!data) { CW = null; cwId = ""; return false; }
  var changed = cwId !== id;
  if (changed) {
    cwId = id;
    cwSel = { r: 0, c: 0 };
    cwDir = "across";
  }
  CW = data;
  cwLoad();
  if (changed) cwPhase = cwIsSolved() ? "win" : "title";
  return true;
}
function cwLoad() {
  if (!CWS.length) {
    if (window.YUREC_CROSSWORDS && window.YUREC_CROSSWORDS.length) CWS = window.YUREC_CROSSWORDS;
    else if (window.YUREC_CROSSWORD) CWS = [window.YUREC_CROSSWORD];
  }
  if (!CW) return;
  cwMigrate(CW.id);
  try { cwFill = JSON.parse(localStorage.getItem(cwFillKey(CW.id)) || "{}") || {}; } catch (e) { cwFill = {}; }
  try { cwSecret = JSON.parse(localStorage.getItem(cwSecretKey(CW.id)) || "[]"); } catch (e) { cwSecret = []; }
  if (!cwSecret || cwSecret.length !== (CW.secret || "").length) cwSecret = cwEmptySecret(CW);
}
function cwSave() {
  if (!CW) return;
  try { localStorage.setItem(cwFillKey(CW.id), JSON.stringify(cwFill)); } catch (e) {}
  try { localStorage.setItem(cwSecretKey(CW.id), JSON.stringify(cwSecret)); } catch (e) {}
}
function cwWipeStorage(id) {
  try {
    localStorage.removeItem(cwFillKey(id));
    localStorage.removeItem(cwSecretKey(id));
    localStorage.removeItem(endKey(id));
    if (id === "crossword") {
      localStorage.removeItem("yurec-crossword:fill");
      localStorage.removeItem("yurec-crossword:secret");
    }
  } catch (e) {}
  clearCwTimer(id);
  cwFill = {};
  cwSecret = cwEmptySecret(CW);
}
function cwGrid() {
  if (!CW) return [];
  var g = [], r, c;
  for (r = 0; r < CW.rows; r++) { g[r] = []; for (c = 0; c < CW.cols; c++) g[r][c] = null; }
  (CW.words || []).forEach(function (w) {
    var i, rr, cc;
    for (i = 0; i < w.answer.length; i++) {
      rr = w.dir === "down" ? w.r + i : w.r;
      cc = w.dir === "across" ? w.c + i : w.c;
      var prev = g[rr][cc] || {};
      g[rr][cc] = { ch: w.answer[i], n: i === 0 ? w.n : prev.n, key: false };
    }
  });
  (CW.keys || []).forEach(function (k) {
    if (g[k.r] && g[k.r][k.c]) g[k.r][k.c].key = true;
  });
  return g;
}
function cwFilledOk() {
  var g = cwGrid(), r, c, cell;
  for (r = 0; r < g.length; r++) for (c = 0; c < g[r].length; c++) {
    cell = g[r][c];
    if (cell && cwFill[cwKey(r, c)] !== cell.ch) return false;
  }
  return true;
}
function cwCount() {
  var g = cwGrid(), n = 0, f = 0, r, c;
  for (r = 0; r < g.length; r++) for (c = 0; c < g[r].length; c++) if (g[r][c]) {
    n++;
    if (cwFill[cwKey(r, c)]) f++;
  }
  return { n: n, f: f };
}
function cwSolvedMark() {
  if (!CW) return;
  try {
    var raw = JSON.parse(localStorage.getItem(endKey(CW.id)) || "[]");
    var endId = CW.endId || "revel";
    if (raw.indexOf(endId) === -1) {
      raw.push(endId);
      localStorage.setItem(endKey(CW.id), JSON.stringify(raw));
    }
  } catch (e) {}
}
function cwIsSolved() {
  if (!CW) return false;
  return gEndingsId(CW.id).indexOf(CW.endId || "revel") !== -1;
}
function cwGoldText() {
  var letters = (CW.keys || []).map(function (k) { return cwFill[cwKey(k.r, k.c)] || ""; });
  if (!letters.length || letters.some(function (ch) { return !ch; })) return "";
  return letters.slice().sort(function (a, b) { return a.localeCompare(b, "ru"); }).join(" · ");
}
function cwWordsAt(r, c) {
  return (CW.words || []).filter(function (w) {
    if (w.dir === "across") return w.r === r && c >= w.c && c < w.c + w.answer.length;
    return w.c === c && r >= w.r && r < w.r + w.answer.length;
  });
}
function cwWordFilled(w) {
  var i, r, c;
  for (i = 0; i < w.answer.length; i++) {
    r = w.dir === "down" ? w.r + i : w.r;
    c = w.dir === "across" ? w.c + i : w.c;
    if (cwFill[cwKey(r, c)] !== w.answer[i]) return false;
  }
  return true;
}
function cwCellDone(r, c) {
  var hits = cwWordsAt(r, c), i;
  for (i = 0; i < hits.length; i++) if (cwWordFilled(hits[i])) return true;
  return false;
}
function cwNextCell(r, c, dir) {
  var g = cwGrid();
  if (dir === "across") {
    if (g[r] && g[r][c + 1]) return { r: r, c: c + 1 };
  } else if (g[r + 1] && g[r + 1][c]) return { r: r + 1, c: c };
  return { r: r, c: c };
}
function cwPrevCell(r, c, dir) {
  var g = cwGrid();
  if (dir === "across") {
    if (g[r] && g[r][c - 1]) return { r: r, c: c - 1 };
  } else if (g[r - 1] && g[r - 1][c]) return { r: r - 1, c: c };
  return { r: r, c: c };
}
function cwPickDir(r, c, prefer) {
  var hits = cwWordsAt(r, c);
  var i, starts = [], down;
  if (prefer) for (i = 0; i < hits.length; i++) if (hits[i].dir === prefer) return prefer;
  for (i = 0; i < hits.length; i++) if (hits[i].r === r && hits[i].c === c) starts.push(hits[i]);
  if (starts.length === 1) return starts[0].dir;
  if (starts.length > 1) {
    for (i = 0; i < starts.length; i++) if (starts[i].dir === "down") return "down";
  }
  for (i = 0; i < hits.length; i++) if (hits[i].dir === cwDir) return cwDir;
  return (hits[0] && hits[0].dir) || "across";
}
function cwApplyCheat() {
  var g = cwGrid(), r, c;
  cwFill = {};
  for (r = 0; r < g.length; r++) for (c = 0; c < g[r].length; c++) {
    if (g[r][c]) cwFill[cwKey(r, c)] = g[r][c].ch;
  }
  cwSave();
  try { burstFireworks(); } catch (e) {}
  paint();
}
function openCheatModal(kind) {
  var el = document.getElementById("cheat-modal");
  var isLevel = kind === "level";
  if (!el) {
    el = document.createElement("div");
    el.id = "cheat-modal";
    el.className = "modal";
    el.innerHTML = '<form class="box">' +
      '<p class="ttl">Чит-код: введите слово</p>' +
      '<input id="cheat-key" type="text" autocomplete="off" placeholder="код" />' +
      '<p class="hint" id="cheat-hint"></p>' +
      '<div class="row"><button type="button" class="btn ghost" id="cheat-cancel">Отмена</button>' +
      '<button type="submit" class="btn yt">Открыть</button></div></form>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) { if (e.target === el) el.style.display = "none"; });
    el.querySelector("#cheat-cancel").addEventListener("click", function () { el.style.display = "none"; });
    el.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = ((document.getElementById("cheat-key") || {}).value || "").replace(/^\s+|\s+$/g, "");
      if (window.YurecGate && window.YurecGate.cheat(v)) {
        el.style.display = "none";
        if (el.getAttribute("data-kind") === "level") {
          gUnlockAll();
          try { burstFireworks(); } catch (err) {}
          paint();
        } else {
          cwApplyCheat();
        }
      } else {
        var h = document.getElementById("cheat-hint");
        if (h) { h.textContent = "Неверный код."; h.className = "hint err"; }
      }
    });
  }
  el.setAttribute("data-kind", isLevel ? "level" : "cw");
  var inp = document.getElementById("cheat-key");
  if (inp) inp.value = "";
  var h = document.getElementById("cheat-hint");
  if (h) {
    h.className = "hint";
    h.textContent = isLevel
      ? "Концовки не идут? Можно схитрить. После кода откроются все концовки этого уровня. Юрец орёт, что так и задумано."
      : "Сил на сетку не хватает? Можно схитрить и взломать кроссворд. После кода все слова откроются — останется разгадать золотое слово. Чит-кода на золото нет. Гоша смотрит, но молчит.";
  }
  el.style.display = "flex";
  window.setTimeout(function () { if (inp) inp.focus(); }, 50);
}
function renderCrossword() {
  cwLoad();
  if (!CW) return shell('<p class="empty">Кроссворд потерялся на Шотмана.</p><a class="btn wide" href="#/game">К играм</a>', "game");
  if (cwPhase === "win") {
    return shell(
      '<a class="back" href="#/game/crosswords">← Кроссворды</a>' +
      '<p class="kicker" style="margin-top:16px;color:#c9a227">Разгадан</p>' +
      '<h2 style="font-size:28px;margin-top:6px">' + esc(CW.secret) + "</h2>" +
      '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:12px">' + esc(CW.winText || "") + "</p>" +
      (readCwLast(CW.id) != null ? '<p class="stat-flavor">' + esc(crosswordFlavor(readCwLast(CW.id))) + "</p>" : "") +
      '<button class="btn play wide" id="cw-again" style="margin-top:20px">Вернуться к кроссворду</button>' +
      '<a class="btn danger wide" href="#/game" style="margin-top:8px">Выйти из игры</a>',
      "game"
    );
  }
  if (cwPhase === "title") {
    var solved = cwIsSolved();
    return shell(
      '<a class="back" href="#/game/crosswords">← Кроссворды</a>' +
      '<button type="button" class="pic" data-zoom="' + esc(photoSrc(CW.cover)) + '" style="margin-top:16px;border-radius:16px;overflow:hidden;position:relative;display:block;width:100%;aspect-ratio:16/9;border:0;padding:0">' +
      '<img src="' + esc(photoSrc(CW.cover)) + '" alt="" style="width:100%;height:100%;object-fit:cover" /></button>' +
      '<h2 style="font-size:28px;margin-top:16px">' + esc(CW.title) + "</h2>" +
      '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:12px">' + esc(CW.pitch) + "</p>" +
      '<button class="btn play wide" id="cw-start" style="margin-top:20px">' + (solved ? "Открыть сетку" : "Разгадывать") + "</button>" +
      '<button class="btn danger wide" id="cw-wipe" style="margin-top:8px">Сбросить кроссворд</button>',
      "game"
    );
  }
  var g = cwGrid();
  var cnt = cwCount();
  var html = '<a class="back" href="#/game/crosswords">← Кроссворды</a>' +
    "<h2 style=\"margin-top:16px\">" + esc(CW.title) + "</h2>" +
    '<p class="subtle">клеток ' + cnt.f + " / " + cnt.n + "</p>" +
    '<div class="xwrap"><div class="xgrid" id="cw-grid" style="grid-template-columns:repeat(' + CW.cols + ',minmax(0,1fr))">';
  var r, c, cell, k, cls, done;
  for (r = 0; r < CW.rows; r++) {
    for (c = 0; c < CW.cols; c++) {
      cell = g[r][c];
      if (!cell) { html += '<span class="xcell xcell-dead"></span>'; continue; }
      k = cwKey(r, c);
      done = cwCellDone(r, c);
      cls = "xcell" + (cell.key ? " xcell-key" : "") + (done ? " xcell-ok" : "") + (cwSel.r === r && cwSel.c === c ? " xcell-on" : "");
      if (cwFill[k] && cwFill[k] !== cell.ch) cls += " xcell-bad";
      html += '<button type="button" class="' + cls + '" data-r="' + r + '" data-c="' + c + '">' +
        (cell.n ? '<span class="xnum">' + cell.n + "</span>" : "") +
        esc(cwFill[k] || "") + "</button>";
    }
  }
  html += "</div></div>";
  html += '<div class="xkb">';
  CW_KB.forEach(function (row, ri) {
    html += '<div class="xkb-row">';
    row.split("").forEach(function (ch) {
      html += '<button type="button" class="xkb-key" data-ch="' + ch + '">' + ch + "</button>";
    });
    if (ri === CW_KB.length - 1) {
      html += '<button type="button" class="xkb-key xkb-bs" id="cw-bs" aria-label="Стереть">⌫</button>';
    }
    html += "</div>";
  });
  html += "</div>";
  function clues(dir, title) {
    var out = '<p class="kicker" style="margin-top:16px">' + title + '</p><ul class="cw-clues">';
    (CW.words || []).forEach(function (w) {
      if (w.dir !== dir) return;
      out += '<li><button type="button" class="cw-clue' + (cwWordFilled(w) ? " ok" : "") + '" data-n="' + w.n + '" data-dir="' + w.dir + '">' + w.n + ". " + esc(w.clue) + " (" + w.answer.length + ")</button></li>";
    });
    return out + "</ul>";
  }
  html += clues("across", "По горизонтали") + clues("down", "По вертикали");
  var gold = cwGoldText();
  html += '<div class="block" style="margin-top:20px"><p class="kicker" style="color:#c9a227">Золотое слово</p>' +
    '<p class="muted" style="margin-top:8px">' + esc(CW.secretHint || "") + "</p>" +
    '<p class="gold-letters-lab" data-testid="gold-letters">Буквы из золотых клеток:</p>' +
    '<p class="gold-letters-val' + (gold ? "" : " empty") + '">' + (gold ? esc(gold) : "откроются, когда заполнишь золото") + "</p>" +
    '<div class="xslots">';
  var i;
  for (i = 0; i < (CW.secret || "").length; i++) {
    html += '<input class="xslot" data-i="' + i + '" maxlength="1" value="' + esc(cwSecret[i] || "") + '" />';
  }
  html += '</div><button type="button" class="btn play wide" id="cw-go" style="margin-top:12px">' + esc(CW.submitLabel || "Каркнуть") + '</button>' +
    '<p class="hint" id="cw-err" style="color:#ff8a80"></p></div>' +
    '<button type="button" class="btn tg wide" id="cw-cheat" style="margin-top:12px">Чит-код</button>' +
    '<button type="button" class="btn danger wide" id="cw-wipe" style="margin-top:8px">Сбросить кроссворд</button>';
  return shell(html, "game");
}
function bindCrossword() {
  cwLoad();
  on($("#cw-start"), "click", function () { startCwTimer(CW.id, false); cwPhase = "play"; paint(); });
  on($("#cw-again"), "click", function () { cwPhase = "play"; paint(); });
  on($("#cw-wipe"), "click", function () { openWipeModal("crossword"); });
  on($("#cw-cheat"), "click", function () { openCheatModal("cw"); });
  var grid = document.getElementById("cw-grid");
  if (!grid) {
    var z = document.querySelectorAll("[data-zoom]");
    var i;
    for (i = 0; i < z.length; i++) z[i].addEventListener("click", function () { openZoom(this.getAttribute("data-zoom")); });
    return;
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button[data-r]") : null;
    if (!b) return;
    var r = Number(b.getAttribute("data-r"));
    var c = Number(b.getAttribute("data-c"));
    if (cwSel.r === r && cwSel.c === c) {
      var hits = cwWordsAt(r, c);
      if (hits.length > 1) cwDir = cwDir === "across" ? "down" : "across";
    } else {
      cwDir = cwPickDir(r, c);
      cwSel = { r: r, c: c };
    }
    paint();
  });
  document.querySelectorAll(".xkb-key[data-ch]").forEach(function (b) {
    b.addEventListener("click", function () {
      var g = cwGrid();
      if (!g[cwSel.r] || !g[cwSel.r][cwSel.c]) return;
      b.classList.add("xkb-hit");
      window.setTimeout(function () { b.classList.remove("xkb-hit"); }, 140);
      cwFill[cwKey(cwSel.r, cwSel.c)] = b.getAttribute("data-ch");
      cwSave();
      cwSel = cwNextCell(cwSel.r, cwSel.c, cwDir);
      paint();
    });
  });
  on($("#cw-bs"), "click", function () {
    var k = cwKey(cwSel.r, cwSel.c);
    if (cwFill[k]) {
      delete cwFill[k];
      cwSave();
      paint();
      return;
    }
    var prev = cwPrevCell(cwSel.r, cwSel.c, cwDir);
    delete cwFill[cwKey(prev.r, prev.c)];
    cwSel = prev;
    cwSave();
    paint();
  });
  document.querySelectorAll(".cw-clue").forEach(function (b) {
    b.addEventListener("click", function () {
      var n = Number(b.getAttribute("data-n"));
      var dir = b.getAttribute("data-dir");
      var w = (CW.words || []).filter(function (x) { return x.n === n && (!dir || x.dir === dir); })[0];
      if (!w) return;
      cwDir = w.dir;
      var i, r, c, placed = false;
      for (i = 0; i < w.answer.length; i++) {
        r = w.dir === "down" ? w.r + i : w.r;
        c = w.dir === "across" ? w.c + i : w.c;
        if (!cwFill[cwKey(r, c)]) {
          cwSel = { r: r, c: c };
          placed = true;
          break;
        }
      }
      if (!placed) cwSel = { r: w.r, c: w.c };
      paint();
    });
  });
  document.querySelectorAll(".xslot").forEach(function (inp) {
    inp.addEventListener("input", function () {
      var i = Number(inp.getAttribute("data-i"));
      cwSecret[i] = String(inp.value || "").toUpperCase().slice(0, 1);
      inp.value = cwSecret[i];
      cwSave();
      if (cwSecret[i]) {
        var next = document.querySelector('.xslot[data-i="' + (i + 1) + '"]');
        if (next) next.focus();
      }
    });
    inp.addEventListener("keydown", function (e) {
      var i = Number(inp.getAttribute("data-i"));
      if (e.key === "Backspace" && !inp.value && i > 0) {
        var prev = document.querySelector('.xslot[data-i="' + (i - 1) + '"]');
        if (prev) prev.focus();
      }
    });
  });
  on($("#cw-go"), "click", function () {
    var err = $("#cw-err");
    if (!cwFilledOk()) {
      if (err) err.textContent = "Сначала сетка на 100%. Гоша не принимает черновики.";
      return;
    }
    if (cwSecret.join("") !== (CW.secret || "")) {
      var msg = "Золотое слово не то. Ворон смотрит. Переложи буквы.";
      if (CW.secret && /ё/i.test(CW.secret)) msg += " Буквы «е» и «ё» — разные. Попробуй верную.";
      if (err) err.textContent = msg;
      return;
    }
    cwSolvedMark();
    finishCwTimer(CW.id);
    try { burstFireworks(); } catch (e) {}
    cwPhase = "win";
    paint();
  });
}

function arkBeatenCount() {
  try {
    var w = JSON.parse(localStorage.getItem("yurec-ark-wins") || "{}");
    var ids = ["flat", "olimp", "maxi", "yard", "boss", "tolik", "pharm", "fsb", "batya", "kostya"];
    var n = 0, i;
    for (i = 0; i < ids.length; i++) if ((w[ids[i]] || 0) > 0) n += 1;
    return n;
  } catch (e) { return 0; }
}

function svoyaPack() { return window.YUREC_SVOYA || { categories: [], roundValues: [[100,200,300,400,500],[200,400,600,800,1000],[300,600,900,1200,1500]], questions: [] }; }
function svoyaRead(key, fb) {
  try { var x = JSON.parse(localStorage.getItem(key) || "null"); return x == null ? fb : x; } catch (e) { return fb; }
}
function svoyaWrite(key, v) {
  try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
}
function svoyaHall() {
  var list = svoyaRead("yurec-svoya-hall", []);
  if (!list || !list.length) return [];
  list.sort(function (a, b) { return (b.score - a.score) || (a.at - b.at); });
  return list.slice(0, 5);
}
function svoyaBest() {
  var h = svoyaHall();
  return h.length ? Number(h[0].score) || 0 : 0;
}
function svoyaPlays() {
  try { return Number(localStorage.getItem("yurec-svoya-plays") || "0") || 0; } catch (e) { return 0; }
}

function avBeatenCount() {
  try {
    var w = JSON.parse(localStorage.getItem("yurec-av-wins") || "{}");
    var ids = ["povar", "lysy", "yasher", "batya", "sveta", "kostya"];
    var n = 0, i;
    for (i = 0; i < ids.length; i++) if ((w[ids[i]] || 0) > 0) n += 1;
    return n;
  } catch (e) { return 0; }
}
function renderGamesHub() {
  var questOpen = 0, questTotal = LEVELS.length, i, lvl, ends;
  for (i = 0; i < LEVELS.length; i++) {
    ends = (LEVELS[i].endings || []).length;
    if (ends && gEndingsId(LEVELS[i].id).length >= ends) questOpen += 1;
  }
  var cwOpen = 0;
  for (i = 0; i < CWS.length; i++) cwOpen += gEndingsId(CWS[i].id).length;
  var catalog = {
    quest: { id: "quest", href: "#/game/quest", cover: "game/quest.jpg", title: "Юрцовский квест", score: "пройдено " + questOpen + " / " + questTotal, blurb: "Ты — Юрец. Шаверма, «Путинка» или смена к Лысому. Пять сценариев, концовки разные, логика отдыхает." },
    crosswords: { id: "crosswords", href: "#/game/crosswords", cover: "game/crosswords.jpg", title: "Шотманские кроссворды", score: "разгадано " + cwOpen + " / " + CWS.length, blurb: "Кроссворд из киоска на Шотмана. Гоша орёт золотые клетки. Не знаешь слово — ври, как Юрец." },
    av: { id: "av", href: "#/game/av", cover: "game/av.jpg", title: "Помойкобол", score: "отбито " + avBeatenCount() + " / 6", blurb: "Юрец снизу, колобок сверху. Пилюли с помойки, лазер и просрочка. Кто взял яд — сам сдох. Двор орёт с каждого гола." },
    ark: { id: "ark", href: "#/game/ark", cover: "game/ark.jpg", title: "Алконоид", score: "разбито " + arkBeatenCount() + " / 10", blurb: "Харя Юрца — ракетка. Десять дворов: от квартиры до Кости. Батя с дробовиком, аптека, камера. Юрец всё равно легенда." },
    svoya: { id: "svoya", href: "#/game/svoya", cover: "game/svoya.jpg", title: "Юрца игра", score: "рекорд " + svoyaBest(), blurb: "Своя игра Шотмана. 25 тем, 10 000 вопросов. Раунды 3 → 4 → 5 тем и финал со ставкой. Ошибка уходит в минус." }
  };
  var ids = orderedGameIds();
  var html = '<p class="kicker">Игры</p>' +
    '<h2 style="font-size:28px;margin-top:6px">Игры двора</h2>' +
    '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:8px">Пять игр. На телефоне столбик, на планшете — два ряда. Зажми карточку — перетащи любимую наверх.</p>' +
    '<a class="card pass-hub" href="#/passport"><div class="pass-hub-body">' +
      '<div class="kicker">Справка</div><h2>Паспорт двора</h2>' +
      '<p class="subtle" style="margin-top:4px">Что уже прочитано, отбито и разгадано.</p></div>' +
      '<span class="subtle">▸</span></a>' +
    '<ul class="game-board">';
  for (i = 0; i < ids.length; i++) {
    var g = catalog[ids[i]];
    if (!g) continue;
    html += '<li data-gid="' + g.id + '"><article class="game-row">' +
      '<button type="button" class="game-row-pic" data-zoom="' + g.cover + '" aria-label="Открыть обложку">' +
      '<img src="' + g.cover + '" alt="" /></button>' +
      '<div class="game-row-body"><h3>' + g.title + "</h3>" +
      (g.score ? '<p class="subtle" style="margin-top:2px">' + g.score + "</p>" : "") +
      (g.blurb ? '<p class="game-row-blurb">' + g.blurb + "</p>" : "") +
      '<a class="go" href="' + g.href + '">Открыть</a></div></article></li>';
  }
  html += "</ul>";
  if (hasCustomGameOrder()) {
    html += '<button type="button" class="btn wide ghost" id="games-reset-order" style="margin-top:16px">Вернуть заводской порядок</button>';
  }
  return shell(html, "game");
}

var gameDrag = { hold: 0, x: 0, y: 0, id: null, swallowed: false, bound: false, el: null, downAt: 0 };
function closestGcard(el) {
  while (el && el !== document) {
    if (el.getAttribute && el.getAttribute("data-gid")) return el;
    el = el.parentNode;
  }
  return null;
}
function gameDragClearHold() {
  if (gameDrag.hold) { window.clearTimeout(gameDrag.hold); gameDrag.hold = 0; }
}
function gameDragEnd() {
  gameDragClearHold();
  if (!gameDrag.id) return;
  if (gameDrag.el) gameDrag.el.className = String(gameDrag.el.className || "").replace(/\bis-dragging\b/g, "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  document.body.className = String(document.body.className || "").replace(/\bchar-dragging\b/g, "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  gameDrag.id = null;
  gameDrag.el = null;
}
function gameDragSave() {
  var grid = document.querySelector(".game-board");
  if (!grid) return;
  var kids = grid.querySelectorAll("[data-gid]");
  var ids = [];
  for (var i = 0; i < kids.length; i++) ids.push(kids[i].getAttribute("data-gid"));
  setGameOrder(ids);
}
function gameDragPoint(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function gameDragHit(x, y) {
  var skip = gameDrag.el;
  var prev = "";
  if (skip) { prev = skip.style.pointerEvents; skip.style.pointerEvents = "none"; }
  var hit = document.elementFromPoint(x, y);
  if (skip) skip.style.pointerEvents = prev;
  return closestGcard(hit);
}
function gameDragShift(card) {
  var grid = document.querySelector(".game-board");
  if (!grid || !gameDrag.id || !card) return;
  var over = card.getAttribute("data-gid");
  if (!over || over === gameDrag.id) return;
  var from = grid.querySelector('[data-gid="' + gameDrag.id + '"]');
  if (!from || from === card) return;
  var kids = [];
  for (var i = 0; i < grid.children.length; i++) kids.push(grid.children[i]);
  var fi = kids.indexOf(from);
  var ti = kids.indexOf(card);
  if (fi < 0 || ti < 0 || fi === ti) return;
  if (fi < ti) {
    if (card.nextSibling) grid.insertBefore(from, card.nextSibling);
    else grid.appendChild(from);
  } else grid.insertBefore(from, card);
  gameDrag.el = from;
  gameDragSave();
}
function gameDragMoveAt(x, y) {
  if (gameDrag.id) {
    var card = gameDragHit(x, y);
    if (card) gameDragShift(card);
    return;
  }
  var dx = x - gameDrag.x;
  var dy = y - gameDrag.y;
  if (dx * dx + dy * dy > 144) gameDragClearHold();
}
function bindGameDragOnce() {
  if (gameDrag.bound) return;
  gameDrag.bound = true;
  function onDown(e) {
    if (!document.querySelector(".game-board")) return;
    var el = closestGcard(e.target);
    if (!el) return;
    if (e.button != null && e.button !== 0) return;
    var now = Date.now();
    if (gameDrag.downAt && now - gameDrag.downAt < 40) return;
    gameDrag.downAt = now;
    var p = gameDragPoint(e);
    gameDrag.x = p.x;
    gameDrag.y = p.y;
    gameDrag.swallowed = false;
    gameDragClearHold();
    var id = el.getAttribute("data-gid");
    gameDrag.hold = window.setTimeout(function () {
      gameDrag.hold = 0;
      gameDrag.id = id;
      gameDrag.el = el;
      gameDrag.swallowed = true;
      if ((" " + el.className + " ").indexOf(" is-dragging ") === -1) el.className += (el.className ? " " : "") + "is-dragging";
      if ((" " + document.body.className + " ").indexOf(" char-dragging ") === -1) document.body.className += (document.body.className ? " " : "") + "char-dragging";
      try { if (showVibrate() && navigator.vibrate) navigator.vibrate(18); } catch (err2) {}
    }, 400);
  }
  function onPointerMove(e) {
    if (!gameDrag.id && !gameDrag.hold) return;
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (gameDrag.id && e.cancelable) e.preventDefault();
    var p = gameDragPoint(e);
    gameDragMoveAt(p.x, p.y);
  }
  function onTouchMove(e) {
    if (!gameDrag.id && !gameDrag.hold) return;
    var p = gameDragPoint(e);
    if (gameDrag.id && e.cancelable) e.preventDefault();
    gameDragMoveAt(p.x, p.y);
  }
  function onUp() { gameDragEnd(); }
  function onCancel() { if (gameDrag.hold || gameDrag.id) return; gameDragEnd(); }
  document.addEventListener("pointerdown", onDown, true);
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onUp, true);
  window.addEventListener("pointercancel", onCancel, true);
  document.addEventListener("touchstart", onDown, { passive: false, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onUp, true);
  window.addEventListener("touchcancel", onCancel, true);
  document.addEventListener("click", function (e) {
    if (!gameDrag.swallowed) return;
    if (!closestGcard(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    gameDrag.swallowed = false;
  }, true);
  document.addEventListener("contextmenu", function (e) {
    if (closestGcard(e.target)) e.preventDefault();
  }, true);
}
function bindGameHub() {
  bindGameDragOnce();
  on($("#games-reset-order"), "click", function () {
    resetGameOrder();
    paint();
  });
}

var avHandle = null;
function stopAv() {
  if (avHandle && avHandle.destroy) {
    try { avHandle.destroy(); } catch (e) {}
  }
  avHandle = null;
}
function renderAv() {
  var html = '<a class="back av-back" href="#/game">← Игры</a>' +
    '<div id="av-root" class="av-host"></div>';
  return shell(html, "game", null, { hideDock: true }).replace('<div class="page">', '<div class="page av-fill">');
}
function bindAv() {
  stopAv();
  var el = document.getElementById("av-root");
  if (!el || !window.YurecAv) return;
  avHandle = window.YurecAv.mount(el, {
    yurec: "characters/yurec.jpg",
    povar: "characters/povar.jpg",
    lysy: "characters/lysy.jpg",
    zinaida: "characters/zinaida.jpg",
    batya: "characters/batya.jpg",
    svetlana: "characters/svetlana.jpg",
    kostya: "characters/kostya.jpg"
  });
}

var arkHandle = null;
function stopArk() {
  if (arkHandle && arkHandle.destroy) {
    try { arkHandle.destroy(); } catch (e) {}
  }
  arkHandle = null;
}
function renderArk() {
  var html = '<a class="back av-back" href="#/game">← Игры</a>' +
    '<div id="ark-root" class="av-host"></div>';
  return shell(html, "game", null, { hideDock: true }).replace('<div class="page">', '<div class="page av-fill">');
}
function bindArk() {
  stopArk();
  var el = document.getElementById("ark-root");
  if (!el || !window.YurecArk) return;
  arkHandle = window.YurecArk.mount(el, {
    yurec: "characters/yurec.jpg",
    lysy: "characters/lysy.jpg",
    zinaida: "characters/zinaida.jpg",
    svetlana: "characters/svetlana.jpg",
    tolik: "characters/tolik.jpg",
    lyudmila: "characters/lyudmila.jpg",
    batya: "characters/batya.jpg",
    kostya: "characters/kostya.jpg"
  });
}

var svoyaUi = { screen: "hub", qid: null, picked: null, name: "", wipe: false, anew: false, named: false, bet: 0, fx: false };
var svoyaStoriesWin = [
  "Юрец сгрёб фишки в жилетку Олимпика и потащил их в ларёк. Толик не понял номинал, но налил «Путинки» как императору. К утру фишки стали пробками, а Юрец орёт, что выиграл Максидом.",
  "Выигрыш он понёс Светке «на дрель». Светка повесила трубку на слове «номинал». Юрец купил тушёнку, чмокнул портрет и объявил себя акционером Шотмана.",
  "Купола из фольги он обклеил купюрами из головы. Гоша каркнул РЕВЭЛ. Юрец решил, что это курс валюты, и пошёл в Пятёрочку как олигарх просрочки.",
  "Батя спросил, откуда плюс. Юрец: «Своя игра, пап, я Якубович бака». Батя сказал «дебил», но водки не отнял. Значит, победа.",
  "Косте он надиктовал SMS: «Кастян я сорвал куш». Костя ответил «не вздумай». Юрец всё равно купил три шавермы без капусты и назвал это инвестиционным портфелем.",
  "НЛО над баком моргнуло. Юрец помахал фишками: «на, лохи, не водку — рейтинг». Тарелка улетела голодная. Двор признал чемпиона.",
  "Он отнёс плюс в киоск и купил «Вечерний Шотман» с кроссвордом. Золотое слово сложилось в РЕВЭЛ. Гоша каркнул с шкафа, как кассир.",
  "Людмиле Ивановне он снова потащил «Мишку», уже «на дивиденды». Она сказала «приятного дня». Юрец записал это как IPO аптеки.",
  "Лысый в голове орнул «вали». Юрец показал табло: плюс. «Вали сам, лысый, у меня номинал». Гипсокартон на этот раз промолчал.",
  "Шаверму он взял без капусты «как олигарх». Повар сунул лаваш и отвернулся. Юрец решил, что это реверанс императору."
];
var svoyaStoriesLose = [
  "Минус на табло. Юрец объявил, что это кредит под купола, и пошёл к Толику в долг. Толик налил. Значит, вселенная ещё должна.",
  "Он проиграл как Олимпик в 2020-м: линолеум раскатился, Лысый в голове орёт «вали». Юрец валит в бак и объявляет техническое поражение рептилоидов.",
  "Светке он сказал, что «чуть-чуть в минусе, как ипотека». Светка: «Юр, ну ты даёшь». Гудки. Портрет снова получил огурец — уже как налог.",
  "Гоша каркнул что-то не золотое. Юрец решил, что ворон сдал ставки НЛО, и обмотал клетку фольгой. Проигрыш стал спецоперацией.",
  "Батя: «сынок, ты дебил». Юрец: «это стратегия, пап, финал не дали — значит, ФСБ боится». Подписка о невыезде с табло не снимается.",
  "Костя не взял трубку. Юрец съел просрочку «в счёт дивидендов» и лёг спать с гранатой. Завтра, орёт, отыграется на ячейке за сто.",
  "Женя с килькой ржал в трубку: «опять легенда в минусе». Юрец повесил. Килька, говорит, не имеет лицензии на комментарий.",
  "В «Пятёрочке» он попросил вакансию охранника «чтобы отбить номинал». Вакансия шипела в «Радуге». Резюме осталось на салфетке.",
  "Анжела в ларьке посчитала минус вслух. Юрец: «это не минус, это касса до зарплаты». Анжела налила как на похороны империи.",
  "НЛО забрало остаток «Путинки» и оставило квитанцию: «дегустация прошла, рейтинг сгорел». Юрец повесил её на сервант рядом с огурцом."
];
function svoyaUnpack(d) {
  var qs = (d.questions || []).map(function (r) {
    if (r && r.id) return r;
    return { id: r[0], cat: r[1], t: r[2], q: r[3], a: r[4], ok: r[5] };
  });
  return {
    categories: d.categories || [],
    roundValues: d.roundValues || [[100, 200, 300, 400, 500], [200, 400, 600, 800, 1000], [300, 600, 900, 1200, 1500]],
    questions: qs
  };
}
function svoyaEnsure(cb) {
  if (window.YUREC_SVOYA && window.YUREC_SVOYA.questions && window.YUREC_SVOYA.questions.length) { cb(); return; }
  fetch("game/svoya-q.json").then(function (r) { return r.json(); }).then(function (d) {
    window.YUREC_SVOYA = svoyaUnpack(d);
    cb();
  }).catch(function () { cb(); });
}
function svoyaQ(id) {
  var pack = svoyaPack().questions || [], i;
  for (i = 0; i < pack.length; i++) if (pack[i].id === id) return pack[i];
  return null;
}
function svoyaPool(cat, t) {
  var pack = svoyaPack().questions || [], out = [], i;
  for (i = 0; i < pack.length; i++) if (pack[i].cat === cat && pack[i].t === t) out.push(pack[i]);
  return out;
}
function svoyaRun() {
  var run = svoyaRead("yurec-svoya-run", null);
  if (!run || run.v !== 3 || !run.rounds) return null;
  return run;
}
function svoyaOpen(run) {
  run = run || svoyaRun();
  return !!(run && !run.ended);
}
function svoyaDone(run) {
  run = run || svoyaRun();
  return !!(run && run.ended);
}
function svoyaCur(run) {
  run = run || svoyaRun();
  if (!run) return null;
  if (run.round < 1 || run.round > 3) return run.rounds[run.rounds.length - 1] || null;
  return run.rounds[run.round - 1] || null;
}
function svoyaShuffle(list) {
  var out = list.slice(), i, j, t;
  for (i = out.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = out[i]; out[i] = out[j]; out[j] = t; }
  return out;
}
function svoyaPickQ(cat, t, used, bag) {
  var pool = svoyaPool(cat, t), free = [], i, pos, ranked, pick;
  for (i = 0; i < pool.length; i++) if (!used[pool[i].id]) free.push(pool[i]);
  if (free.length) {
    pick = free[Math.floor(Math.random() * free.length)];
    used[pick.id] = 1; bag.push(pick.id); return pick.id;
  }
  pos = {};
  for (i = 0; i < bag.length; i++) pos[bag[i]] = i;
  ranked = pool.slice().sort(function (a, b) {
    var pa = pos[a.id]; var pb = pos[b.id];
    if (pa == null) pa = -1; if (pb == null) pb = -1;
    return pa - pb;
  });
  pick = ranked[0] || pool[0];
  if (!pick) return cat + ":" + t + ":00";
  used[pick.id] = 1; bag.push(pick.id); return pick.id;
}
function svoyaOrd() {
  var o = [0, 1, 2, 3], i, j, t;
  for (i = o.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = o[i]; o[i] = o[j]; o[j] = t; }
  return o;
}
function svoyaDealRound(n, usedCats, used, bag) {
  var pack = svoyaPack();
  var values = (pack.roundValues && pack.roundValues[n - 1]) || [100, 200, 300, 400, 500];
  var nCats = [3, 4, 5][n - 1] || 5;
  var all = [], i;
  for (i = 0; i < (pack.categories || []).length; i++) all.push(pack.categories[i].id);
  var left = [];
  for (i = 0; i < all.length; i++) if (usedCats.indexOf(all[i]) < 0) left.push(all[i]);
  var pool = left.length >= nCats ? left : all;
  var cats = svoyaShuffle(pool).slice(0, nCats);
  var cells = [], c, t;
  for (c = 0; c < cats.length; c++) {
    for (t = 1; t <= 5; t++) cells.push({ cat: cats[c], t: t, v: values[t - 1], qid: svoyaPickQ(cats[c], t, used, bag), ord: svoyaOrd() });
  }
  return { n: n, cats: cats, cells: cells, values: values };
}
function svoyaDeal() {
  var usedList = svoyaRead("yurec-svoya-used", []) || [];
  var used = {}, i;
  for (i = 0; i < usedList.length; i++) used[usedList[i]] = 1;
  var bag = usedList.slice();
  var r1 = svoyaDealRound(1, [], used, bag);
  svoyaWrite("yurec-svoya-used", bag.slice(-10000));
  var run = { v: 3, round: 1, score: 0, right: 0, wrong: 0, started: Date.now(), usedCats: r1.cats.slice(), rounds: [r1], final: null };
  svoyaWrite("yurec-svoya-run", run);
  return run;
}
function svoyaStory(score, salt) {
  var pack = score > 0 ? svoyaStoriesWin : svoyaStoriesLose;
  return pack[Math.abs(salt) % pack.length];
}
function svoyaAdvance() {
  var run = svoyaRun();
  if (!run) return null;
  var cur = svoyaCur(run), i;
  if (!cur) return run;
  for (i = 0; i < cur.cells.length; i++) if (!cur.cells[i].done) return run;
  if (run.round === 3) {
    if (run.score <= 0) {
      run.skippedFinal = true; run.ended = true; run.story = svoyaStory(run.score, run.started + run.score);
      svoyaWrite("yurec-svoya-run", run); return run;
    }
    var usedList = svoyaRead("yurec-svoya-used", []) || [];
    var used = {}; for (i = 0; i < usedList.length; i++) used[usedList[i]] = 1;
    var bag = usedList.slice();
    var pack = svoyaPack(), all = [], left = [];
    for (i = 0; i < (pack.categories || []).length; i++) all.push(pack.categories[i].id);
    for (i = 0; i < all.length; i++) if (run.usedCats.indexOf(all[i]) < 0) left.push(all[i]);
    var cat = (left.length ? svoyaShuffle(left) : svoyaShuffle(all))[0];
    run.final = { cat: cat, qid: svoyaPickQ(cat, 5, used, bag), bet: 0, ord: svoyaOrd() };
    run.round = 4;
    svoyaWrite("yurec-svoya-used", bag.slice(-10000));
    svoyaWrite("yurec-svoya-run", run);
    return run;
  }
  if (run.round < 3) {
    usedList = svoyaRead("yurec-svoya-used", []) || [];
    used = {}; for (i = 0; i < usedList.length; i++) used[usedList[i]] = 1;
    bag = usedList.slice();
    var next = svoyaDealRound(run.round + 1, run.usedCats, used, bag);
    run.rounds.push(next);
    run.usedCats = run.usedCats.concat(next.cats);
    run.round += 1;
    svoyaWrite("yurec-svoya-used", bag.slice(-10000));
    svoyaWrite("yurec-svoya-run", run);
  }
  return run;
}
function svoyaAnswer(qid, pick) {
  var run = svoyaRun();
  var q = svoyaQ(qid);
  if (!run || !q) return null;
  var i, cell, ok, delta;
  if (run.round === 4 && run.final && run.final.qid === qid) {
    if (run.final.done) return { run: run, q: q, correct: false };
    ok = pick === q.ok;
    var bet = Math.max(0, Math.min(run.final.bet, Math.max(0, run.score)));
    delta = ok ? bet : -bet;
    run.final.done = true; run.final.ok = ok; run.score += delta;
    if (ok) run.right += 1; else run.wrong += 1;
    run.ended = true; run.story = svoyaStory(run.score, run.started + run.score);
    svoyaWrite("yurec-svoya-run", run);
    return { run: run, q: q, correct: ok };
  }
  var round = svoyaCur(run);
  if (!round) return { run: run, q: q, correct: false };
  for (i = 0; i < round.cells.length; i++) if (round.cells[i].qid === qid) cell = round.cells[i];
  if (!cell || cell.done) return { run: run, q: q, correct: false };
  ok = pick === q.ok;
  cell.done = true; cell.ok = ok;
  delta = ok ? cell.v : -cell.v;
  run.score += delta;
  if (ok) run.right += 1; else run.wrong += 1;
  svoyaWrite("yurec-svoya-run", run);
  return { run: run, q: q, correct: ok };
}
function svoyaBeep(ok) {
  if (!showSound()) return;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ctx = new AC();
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = "square"; o.frequency.value = ok ? 880 : 180; g.gain.value = 0.05;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + (ok ? 0.09 : 0.16));
    window.setTimeout(function () { try { ctx.close(); } catch (e) {} }, 200);
  } catch (e2) {}
}
function svoyaCatTitle(id) {
  var cats = svoyaPack().categories || [], i;
  for (i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i].title;
  return id;
}
function svoyaRoundOpen(run) {
  var cur = svoyaCur(run), i;
  if (!cur) return false;
  for (i = 0; i < cur.cells.length; i++) if (!cur.cells[i].done) return true;
  return false;
}
function renderSvoya() {
  var pack = svoyaPack();
  var run = svoyaRun();
  var html = '<a class="back av-back" href="#/game">← Игры</a><div class="svoya-page">';
  var s = svoyaUi.screen, i;
  if (!pack.questions || !pack.questions.length) {
    html += '<div class="svoya-hub"><p class="svoya-pitch">Колода грузится…</p></div></div>';
    return shell(html, "game", null, { hideDock: true });
  }
  if (s === "hub") {
    html += '<div class="svoya-hub"><button type="button" class="svoya-cover" id="svoya-zoom"><img src="game/svoya.jpg" alt="" /></button>' +
      '<p class="svoya-kicker">Игры двора</p><h2>Юрца игра</h2>' +
      '<p class="svoya-blurb">Своя игра Шотмана. 25 тем, 10 000 вопросов. Раунды 3 → 4 → 5 тем и финал со ставкой. Ошибка уходит в минус.</p>' +
      '<p class="svoya-pitch">Своя игра двора. Раунд 1 — три темы, раунд 2 — четыре, раунд 3 — пять, потом финал со ставкой.</p>' +
      '<p class="svoya-pitch">Десять тысяч вопросов в баке. Генератор тасует темы и ячейки так, чтобы не жевать одно и то же.</p>' +
      '<p class="svoya-pitch">Угадал — номинал в карман. Ошибся — номинал сгорает в минус. Без таймера. На нуле после третьего раунда финала нет: ты уже труп.</p>' +
      '<p class="svoya-scoreline">рекорд ' + svoyaBest() + " · партий " + svoyaPlays() + "</p>";
    if (svoyaOpen(run)) html += '<button type="button" class="svoya-btn gold" id="svoya-cont">Продолжить</button>';
    else if (svoyaDone(run)) html += '<button type="button" class="svoya-btn gold" id="svoya-fin">Итог партии</button>';
    if (svoyaOpen(run) || svoyaDone(run)) html += '<button type="button" class="svoya-btn hero" id="svoya-new">' + (svoyaUi.anew ? "Точно сначала? Партия сгорит" : "Начать заново") + "</button>";
    else html += '<button type="button" class="svoya-btn gold" id="svoya-play">Играть</button>';
    html += '<button type="button" class="svoya-btn tg" id="svoya-hall">Таблица рекордов</button>' +
      '<button type="button" class="svoya-btn off" id="svoya-rules">Правила</button>' +
      '<button type="button" class="svoya-btn danger" id="svoya-wipe">' + (svoyaUi.wipe ? "Точно обнулить статистику?" : "Сбросить статистику") + "</button></div>";
  } else if (s === "board" && run && run.round <= 3) {
    var round = svoyaCur(run), doneN = 0, vals = (round && round.values) || [100, 200, 300, 400, 500];
    if (round) for (i = 0; i < round.cells.length; i++) if (round.cells[i].done) doneN++;
    html += '<div class="svoya-play"><div class="svoya-top"><p class="svoya-kicker">Раунд ' + run.round + " из 3 · счёт " + run.score + '</p><p class="svoya-mini">' + doneN + " / " + (round ? round.cells.length : 0) + " · верно " + run.right + " · мимо " + run.wrong + "</p></div><div class=\"svoya-grid\"" + (round ? ' data-cols="' + round.cats.length + '"' : "") + ">";
    var c, t, cell, k;
    if (round) for (c = 0; c < round.cats.length; c++) {
      html += '<div class="svoya-col"><div class="svoya-cat">' + esc(svoyaCatTitle(round.cats[c])) + "</div>";
      for (t = 0; t < vals.length; t++) {
        cell = null;
        for (k = 0; k < round.cells.length; k++) if (round.cells[k].cat === round.cats[c] && round.cells[k].t === t + 1) cell = round.cells[k];
        if (!cell) continue;
        html += '<button type="button" class="svoya-cell' + (cell.done ? (cell.ok ? " ok" : " bad") : "") + '" data-svoya-q="' + esc(cell.qid) + '"' + (cell.done ? " disabled" : "") + ">" + (cell.done ? (cell.ok ? "✓" : "✗") : vals[t]) + "</button>";
      }
      html += "</div>";
    }
    html += "</div></div>";
  } else if (s === "gap" && run) {
    html += '<div class="svoya-hub"><p class="svoya-kicker">Раунд ' + Math.min(run.round, 3) + " сыгран</p><h2>" + run.score + "</h2>" +
      '<p class="svoya-blurb">верно ' + run.right + " · мимо " + run.wrong + "</p>";
    if (run.round >= 3 && run.score <= 0) html += '<p class="svoya-pitch">Ноль или минус. Финала не будет — Юрец уже в баке.</p>';
    else if (run.round >= 3) html += '<p class="svoya-pitch">Финал. Одна тема, одна ставка, один вопрос.</p>';
    else html += '<p class="svoya-pitch">Дальше темы новые и ценники злее.</p>';
    html += '<button type="button" class="svoya-btn gold" id="svoya-nextround">' + (run.round >= 3 ? (run.score <= 0 ? "К итогу" : "На финал") : "Следующий раунд") + "</button></div>";
  } else if (s === "bet" && run && run.final) {
    html += '<div class="svoya-hub"><p class="svoya-kicker">Финал · счёт ' + run.score + "</p><h2>" + esc(svoyaCatTitle(run.final.cat)) + "</h2>" +
      '<p class="svoya-pitch">Тема открыта. Ставка — не больше баланса.</p><div class="svoya-name">' +
      '<input id="svoya-bet" type="number" min="0" max="' + Math.max(0, run.score) + '" value="' + (svoyaUi.bet || 0) + '" />' +
      '<button type="button" class="svoya-btn" id="svoya-allin">Ва-банк ' + Math.max(0, run.score) + "</button>" +
      '<button type="button" class="svoya-btn gold" id="svoya-go">Поставить и смотреть вопрос</button></div></div>';
  } else if (s === "q") {
    var q = svoyaQ(svoyaUi.qid);
    if (q) {
      var cellv = "";
      if (run && run.round === 4 && run.final) cellv = " · ставка " + run.final.bet;
      else if (run) {
        var rr = svoyaCur(run);
        if (rr) for (i = 0; i < rr.cells.length; i++) if (rr.cells[i].qid === q.id) cellv = " · " + rr.cells[i].v;
      }
      html += '<div class="svoya-q"><p class="svoya-kicker">' + esc(svoyaCatTitle(q.cat)) + cellv + "</p>" +
        '<p class="svoya-ask">' + esc(q.q) + '</p><div class="svoya-answers">';
      var ord = [0, 1, 2, 3], oi, ai;
      if (run && run.round === 4 && run.final && run.final.ord) ord = run.final.ord;
      else if (run) {
        rr = svoyaCur(run);
        if (rr) for (i = 0; i < rr.cells.length; i++) if (rr.cells[i].qid === q.id && rr.cells[i].ord) ord = rr.cells[i].ord;
      }
      for (oi = 0; oi < ord.length; oi++) {
        ai = ord[oi];
        if (ai == null || !q.a[ai]) continue;
        var show = svoyaUi.picked != null;
        html += '<button type="button" class="svoya-ans' + (show && ai === q.ok ? " ok" : "") + (show && ai === svoyaUi.picked && ai !== q.ok ? " bad" : "") + '" data-svoya-a="' + ai + '"' + (show ? " disabled" : "") + ">" + esc(q.a[ai]) + "</button>";
      }
      html += "</div>";
      if (svoyaUi.picked != null) html += '<button type="button" class="svoya-btn gold" id="svoya-next">Дальше</button>';
      html += "</div>";
    }
  } else if (s === "fin" && run) {
    html += '<div class="svoya-hub"><p class="svoya-kicker">' + (run.score > 0 ? "Плюс двора" : "Минус двора") + "</p><h2>" + run.score + "</h2>" +
      '<p class="svoya-blurb">верно ' + run.right + " · мимо " + run.wrong + (run.skippedFinal ? " · финал не дали" : "") + "</p>" +
      '<p class="svoya-pitch">' + esc(run.story || "") + "</p>";
    var hall = svoyaHall();
    var fits = hall.length < 5 ? true : run.score > (hall[hall.length - 1].score || -999999);
    if (fits && !svoyaUi.named) {
      html += '<form class="svoya-name" id="svoya-name"><p class="svoya-pitch">Ты влез в таблицу. Как подписать стыд?</p>' +
        '<input id="svoya-nick" maxlength="16" placeholder="Юрец" value="' + esc(svoyaUi.name) + '" />' +
        '<button type="submit" class="svoya-btn gold">Вписать</button></form>';
    } else html += '<button type="button" class="svoya-btn gold" id="svoya-tohall">К таблице</button>';
    html += '<button type="button" class="svoya-btn" id="svoya-again">Ещё круг</button></div>';
  } else if (s === "hall") {
    hall = svoyaHall();
    html += '<div class="svoya-hub"><p class="svoya-kicker">Стыд двора</p><h2>Таблица</h2>';
    if (hall.length) {
      html += '<ol class="svoya-hall">';
      for (i = 0; i < hall.length; i++) html += "<li><span>" + (i + 1) + ". " + esc(hall[i].name) + "</span><b>" + hall[i].score + "</b></li>";
      html += "</ol>";
    } else html += '<p class="svoya-pitch">Пока пусто. Первый, кто доиграет, станет царём сетки.</p>';
    html += '<button type="button" class="svoya-btn gold" id="svoya-back">Назад</button></div>';
  } else if (s === "rules") {
    html += '<div class="svoya-hub"><p class="svoya-kicker">Регламент</p><h2>Правила</h2>' +
      '<p class="svoya-pitch">Раунд 1. Три случайные темы. Ячейки 100, 200, 300, 400, 500.</p>' +
      '<p class="svoya-pitch">Раунд 2. Четыре новые темы. 200, 400, 600, 800, 1000.</p>' +
      '<p class="svoya-pitch">Раунд 3. Пять тем. 300, 600, 900, 1200, 1500. Третья, четвёртая и пятая ячейки — с подвохом: бред Юрца рядом с паспортом.</p>' +
      '<p class="svoya-pitch">Верный ответ: плюс номинал. Ошибка: минус номинал. Баланс может уйти ниже нуля.</p>' +
      '<p class="svoya-pitch">После третьего раунда, если очков 0 или меньше — финала нет, ты проиграл.</p>' +
      '<p class="svoya-pitch">Финал. Одна случайная тема. Сначала ставка: от нуля до текущего баланса. Потом один вопрос. Угадал — плюс ставка, ошибся — минус ставка.</p>' +
      '<p class="svoya-pitch">Темы и вопросы каждый заход другие. Отыгранное кладётся на дно бака и всплывает, только когда колода клетки кончится.</p>' +
      '<p class="svoya-pitch">Партию можно бросить и продолжить. Статистику во вкладке игры сбрасывает красная кнопка — с дождём, как лицензию.</p>' +
      '<p class="svoya-pitch">Плюс на финише — салют. Минус или ноль — дождь. Юрец всё равно что-то сделает с этим «выигрышем».</p>' +
      '<button type="button" class="svoya-btn gold" id="svoya-back">Назад</button></div>';
  }
  html += "</div>";
  return shell(html, "game", null, { hideDock: true });
}
function svoyaBump() {
  try { localStorage.setItem("yurec-svoya-plays", String(svoyaPlays() + 1)); } catch (e) {}
}
function bindSvoya() {
  if (!svoyaPack().questions || !svoyaPack().questions.length) {
    svoyaEnsure(function () { paint(); });
    return;
  }
  if (svoyaUi.screen === "fin" && !svoyaUi.fx) {
    var run0 = svoyaRun();
    if (run0 && run0.ended) {
      svoyaUi.fx = true;
      if (run0.score > 0) burstFireworks(); else burstRain();
    }
  }
  on($("#svoya-zoom"), "click", function () { openZoom("game/svoya.jpg"); });
  on($("#svoya-play"), "click", function () { svoyaUi = { screen: "board", qid: null, picked: null, name: "", wipe: false, anew: false, named: false, bet: 0, fx: false }; svoyaDeal(); paint(); });
  on($("#svoya-cont"), "click", function () {
    var run = svoyaRun();
    if (!run) { svoyaUi.screen = "hub"; paint(); return; }
    if (run.ended) svoyaUi.screen = "fin";
    else if (run.round === 4 && run.final && !run.final.done) { svoyaUi.bet = run.final.bet; svoyaUi.screen = "bet"; }
    else if (svoyaRoundOpen(run)) svoyaUi.screen = "board";
    else svoyaUi.screen = "gap";
    paint();
  });
  on($("#svoya-fin"), "click", function () { svoyaUi.screen = "fin"; paint(); });
  on($("#svoya-new"), "click", function () {
    if (!svoyaUi.anew) { svoyaUi.anew = true; paint(); return; }
    svoyaUi = { screen: "board", qid: null, picked: null, name: "", wipe: false, anew: false, named: false, bet: 0, fx: false };
    svoyaDeal(); paint();
  });
  on($("#svoya-hall"), "click", function () { svoyaUi.screen = "hall"; paint(); });
  on($("#svoya-rules"), "click", function () { svoyaUi.screen = "rules"; paint(); });
  on($("#svoya-wipe"), "click", function () {
    if (!svoyaUi.wipe) { svoyaUi.wipe = true; paint(); return; }
    try {
      localStorage.removeItem("yurec-svoya-run");
      localStorage.removeItem("yurec-svoya-used");
      localStorage.removeItem("yurec-svoya-hall");
      localStorage.removeItem("yurec-svoya-plays");
    } catch (e) {}
    svoyaUi.wipe = false;
    burstRain();
    paint();
  });
  on($("#svoya-back"), "click", function () { svoyaUi.screen = "hub"; paint(); });
  on($("#svoya-tohall"), "click", function () { svoyaWrite("yurec-svoya-run", null); svoyaUi.screen = "hall"; paint(); });
  on($("#svoya-again"), "click", function () {
    svoyaUi = { screen: "board", qid: null, picked: null, name: "", wipe: false, anew: false, named: false, bet: 0, fx: false };
    svoyaDeal(); paint();
  });
  on($("#svoya-nextround"), "click", function () {
    var next = svoyaAdvance();
    if (next && next.ended) { svoyaBump(); svoyaUi.screen = "fin"; }
    else if (next && next.round === 4) { svoyaUi.bet = 0; svoyaUi.screen = "bet"; }
    else svoyaUi.screen = "board";
    paint();
  });
  on($("#svoya-allin"), "click", function () {
    var run = svoyaRun();
    svoyaUi.bet = run ? Math.max(0, run.score) : 0;
    paint();
  });
  on($("#svoya-go"), "click", function () {
    var run = svoyaRun();
    if (!run || !run.final) return;
    var n = Number(($("#svoya-bet") && $("#svoya-bet").value) || svoyaUi.bet || 0);
    run.final.bet = Math.max(0, Math.min(Math.max(0, run.score), Math.floor(n) || 0));
    svoyaWrite("yurec-svoya-run", run);
    svoyaUi.qid = run.final.qid; svoyaUi.picked = null; svoyaUi.screen = "q";
    paint();
  });
  on($("#svoya-name"), "submit", function (e) {
    e.preventDefault();
    var nick = (($("#svoya-nick") && $("#svoya-nick").value) || "Юрец").replace(/^\s+|\s+$/g, "").slice(0, 16) || "Юрец";
    var run = svoyaRun();
    var hall = svoyaHall();
    hall.push({ name: nick, score: run ? run.score : 0, at: Date.now() });
    hall.sort(function (a, b) { return (b.score - a.score) || (a.at - b.at); });
    svoyaWrite("yurec-svoya-hall", hall.slice(0, 5));
    svoyaWrite("yurec-svoya-run", null);
    svoyaUi.named = true; svoyaUi.screen = "hall";
    paint();
  });
  on($("#svoya-next"), "click", function () {
    svoyaUi.qid = null; svoyaUi.picked = null;
    var run = svoyaRun();
    if (run && run.ended) { svoyaBump(); svoyaUi.screen = "fin"; }
    else if (run && !svoyaRoundOpen(run)) svoyaUi.screen = "gap";
    else svoyaUi.screen = "board";
    paint();
  });
  var cells = document.querySelectorAll("[data-svoya-q]");
  var i;
  for (i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", function () {
      svoyaUi.qid = this.getAttribute("data-svoya-q");
      svoyaUi.picked = null; svoyaUi.screen = "q"; paint();
    });
  }
  var ans = document.querySelectorAll("[data-svoya-a]");
  for (i = 0; i < ans.length; i++) {
    ans[i].addEventListener("click", function () {
      if (svoyaUi.picked != null) return;
      var n = Number(this.getAttribute("data-svoya-a"));
      var res = svoyaAnswer(svoyaUi.qid, n);
      svoyaUi.picked = n;
      if (res) {
        svoyaBeep(res.correct);
        try { if (showVibrate()) navigator.vibrate(res.correct ? 18 : [40, 30, 40]); } catch (e) {}
      }
      paint();
    });
  }
}

function renderQuestHub() {
  var open = 0, total = LEVELS.length, i, lvl, save, ends;
  for (i = 0; i < LEVELS.length; i++) {
    ends = (LEVELS[i].endings || []).length;
    if (ends && gEndingsId(LEVELS[i].id).length >= ends) open += 1;
  }
  var html = '<a class="back" href="#/game">← Игры</a>' +
    '<p class="kicker" style="margin-top:12px">Игра</p>' +
    '<h2 style="font-size:28px;margin-top:6px">Юрцовский квест</h2>' +
    '<div class="hub-pitch"><p>Ты — Юрец. Не читатель саги и не Костя с красной икрой — а сам император панельных джунглей!</p><p>Читать про него — одно. Быть им — совсем другое. Это твой уникальный шанс залезть в шкуру помойного короля с куполами и каждый день решать главный вопрос его жизни: шаверма, «Путинка» или снова на смену к Лысому херу.</p><p>Почувствуй себя легендой! Принимай решения, будто уже выпил литр «Финляндии».</p><p>Логика здесь отдыхает (это же Юрец).</p><p>У каждого уровня свой нелинейный сюжет и альтернативные концовки.</p></div>' +
    '<p class="subtle" style="margin-top:20px;text-align:center">пройдено ' + open + " / " + total + "</p>" +
    '<div class="gdiv"></div>';
  html += '<ul class="levels">';
  for (i = 0; i < LEVELS.length; i++) {
    lvl = LEVELS[i];
    save = gReadSaveId(lvl.id);
    ends = (lvl.endings || []).length;
    html += '<li><article class="lcard">' +
      '<button type="button" class="pic" data-zoom="' + esc(photoSrc(lvl.cover)) + '" aria-label="Открыть обложку">' +
      '<img src="' + esc(photoSrc(lvl.cover)) + '" alt="" />' +
      '<div class="cap"><p class="kicker">Уровень ' + (lvl.number || (i + 1)) + "</p><h3>" +
      esc(lvl.shortTitle || lvl.title) + "</h3></div></button>" +
      '<a class="pad" href="#/game/' + esc(lvl.id) + '"><p class="muted">' + esc(lvl.pitch || "") + "</p>" +
      '<div class="row"><span class="subtle">концовок ' + gEndingsId(lvl.id).length + " / " + ends + "</span>" +
      '<span class="go' + (save ? " on" : "") + '">' +
      (save ? ("Продолжить · " + (save.steps || 0)) : "Играть") +
      "</span></div></a></article></li>";
  }
  html += "</ul>";
  return shell(html, "game");
}

function renderCrosswordsHub() {
  var open = 0, i, cw;
  for (i = 0; i < CWS.length; i++) open += gEndingsId(CWS[i].id).length;
  var html = '<a class="back" href="#/game">← Игры</a>' +
    '<p class="kicker" style="margin-top:12px">Игра</p>' +
    '<h2 style="font-size:28px;margin-top:6px">Шотманские кроссворды</h2>' +
    '<div class="hub-pitch"><p>Ты не Юрец. Ты — тот самый дурак с карандашом, который в киоске на Шотмана купил «Метро» и решил, что кроссворд — это судьба.</p><p>Золотые клетки орёт Гоша. Лысый хер смотрит через плечо и говорит, что ты никто. Зинаида орёт из бака, что буква «Ы» — это не буква, а образ жизни.</p><p>Если не знаешь слово — ври, как Юрец. Если знаешь — всё равно ври. Двор не любит умников. Двор любит буквы.</p><p>Чит-код открывает сетку. Золотое слово — нет. Гоша смотрит. Гоша всегда смотрит.</p></div>' +
    '<p class="subtle" style="margin-top:20px;text-align:center">разгадано ' + open + " / " + CWS.length + "</p>" +
    '<div class="gdiv"></div>';
  html += '<ul class="levels">';
  for (i = 0; i < CWS.length; i++) {
    cw = CWS[i];
    var solved = gEndingsId(cw.id).length > 0;
    html += '<li><article class="lcard">' +
      '<button type="button" class="pic" data-zoom="' + esc(photoSrc(cw.cover)) + '" aria-label="Открыть обложку">' +
      '<img src="' + esc(photoSrc(cw.cover)) + '" alt="" />' +
      '<div class="cap"><h3>' +
      esc(cw.shortTitle || cw.title) + "</h3></div></button>" +
      '<a class="pad" href="#/game/' + esc(cw.id) + '"><p class="muted">' + esc(cw.pitch || "") + "</p>" +
      '<p class="cw-status">' + (solved ? "разгадан" : "не разгадан") + "</p>" +
      '<span class="go' + (solved ? " on" : "") + '">' + (solved ? "Открыть сетку" : "Разгадывать") +
      "</span></a></article></li>";
  }
  html += "</ul>";
  return shell(html, "game");
}

function renderGameHub() {
  return renderGamesHub();
}

function renderGame() {
  if (!GAME) {
    return shell('<p class="empty">Такого уровня нет.</p><a class="btn wide" href="#/game" style="margin-top:16px">К играм</a>', "game");
  }
  if (gPhase === "title") return shell(renderGameTitle(), "game");
  var node = GAME.nodes[gNode];
  if (!node) {
    return shell('<p class="empty">Сцена потерялась. <button class="btn" id="g-reset">Начать заново</button></p>', "game");
  }
  if (gPhase === "end" || node.end) return shell(renderGameEnd(node), "game");
  return shell(renderGamePlay(node), "game");
}

function renderGameTitle() {
  var save = gReadSave();
  var found = gEndings();
  var html = '<a class="back" href="#/game/quest">← Квест</a>' +
    '<p class="kicker" style="margin-top:16px">' + esc(GAME.kicker || "Игра") + '</p><h2 style="font-size:28px;margin-top:6px">' +
    esc(GAME.title) + '</h2><p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:12px">' +
    esc(GAME.pitch) + "</p>";
  html += '<div class="links" style="margin-top:20px;flex-direction:column">';
  if (save) {
    html += '<button class="btn play" id="g-cont">Продолжить · шаг ' + (save.steps || 0) + "</button>";
    html += '<button class="btn ghost" id="g-new">Начать заново</button>';
  } else {
    html += '<button class="btn play" id="g-new">Начать</button>';
  }
  html += "</div>";
  html += '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px">' +
    "<h3>Концовки</h3><span class='subtle'>" + found.length + " / " + (GAME.endings || []).length + "</span></div>";
  html += '<ul class="ends">';
  var ends = GAME.endings || [];
  for (var i = 0; i < ends.length; i++) {
    var open = found.indexOf(ends[i].id) !== -1;
    html += '<li class="' + (open ? "open" + gRankClass(ends[i].rank) : "") + '"' +
      (open ? ' data-end="' + esc(ends[i].id) + '"' : "") + '><div><b>' + esc(open ? ends[i].title : "Ещё не открыта") +
      "</b><span>" + esc(open ? ends[i].rank : "скрыта") + "</span></div>" +
      '<i class="dot' + (open ? " on" : "") + '"></i></li>';
  }
  html += "</ul>";
  html += '<div class="gdiv"></div>';
  html += '<button class="btn tg wide" id="g-cheat">Чит-код</button>';
  html += '<button class="btn danger wide" id="g-wipe" style="margin-top:8px">Сбросить прогресс уровня</button>';
  html += '<p class="subtle" style="font-family:var(--serif);margin-top:24px;line-height:1.55;white-space:pre-wrap">В этой версии доступны несколько первых серий с оригинальным сюжетом. Кое-где ветки могут идти нелинейно, потому что... ну, это же Юрец. Логика здесь отдыхает.\nИграйте!\nВозможны баги.\nВозможны очень сильные баги.\nВозможно, игра сама начнёт пить ревэл и каркать РЕВЭЛ.</p>';
  return html;
}

function renderGamePlay(node) {
  var html = '<div class="game-play"><div>';
  html += '<div class="kicker">' + esc(GAME.kicker || "Игра") + "</div>" +
    '<div class="subtle" style="float:right;margin-top:-16px">шаг ' + (gSteps + 1) + "</div>";
  html += gHud(gStats);
  html += '</div><div>';
  html += '<h2 style="font-size:22px;margin-top:20px">' + esc(node.title) + "</h2>";
  html += '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:12px;white-space:pre-wrap">' +
    esc(node.text) + "</p>";
  html += '<div class="choices">';
  var ch = node.choices || [];
  for (var i = 0; i < ch.length; i++) {
    var ok = gMeets(gStats, ch[i].need);
    var hint = gNeedHint(ch[i].need);
    html += '<button class="choice' + (ok ? "" : " off") + '" data-to="' + esc(ch[i].to) + '" data-i="' + i + '"' +
      (ok ? "" : " disabled") + ">" + esc(ch[i].label);
    if (!ok && hint) html += '<span class="need">закрыто · ' + esc(hint) + "</span>";
    html += "</button>";
  }
  html += "</div></div></div>";
  return html;
}

function renderGameEnd(node) {
  var meta = gMeta(node.end);
  var found = gEndings().slice();
  if (found.indexOf(node.end) === -1) found.push(node.end);
  var html = '<div class="read-col"><p class="kicker">Финал · ' + esc(meta.rank) + "</p>";
  html += '<h2 style="font-size:28px;margin-top:6px">' + esc(node.title) + "</h2>";
  html += '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:14px;white-space:pre-wrap">' +
    esc(node.text) + "</p>";
  html += '<section class="block"><h3>Статистика дня</h3><p class="subtle" style="margin-top:6px">' +
    gSteps + " выборов · концовок " + found.length + " из " + (GAME.endings || []).length + "</p>" +
    '<p class="muted" style="font-family:var(--serif);margin-top:8px">' + esc(gVerdict(gStats)) + "</p>" +
    (function () {
      var last = readQuestLast(gLevelId || "day");
      return last != null ? '<p class="stat-flavor">' + esc(questFlavor(last)) + "</p>" : "";
    })() +
    gHud(gStats) + "</section>";
  html += '<div class="links" style="margin-top:20px;flex-direction:column">';
  html += '<button class="btn" id="g-new">Пройти ещё раз</button>';
  html += '<button class="btn wide soft-ends" id="g-menu">Альтернативные концовки</button>';
  html += '<a class="btn wide soft-story" href="#/story/' + esc(GAME.storySlug || "s01e00") + '">' +
    esc(GAME.storyCta || "Как было на самом деле?") + "</a>";
  html += '<a class="btn danger wide" href="#/game/quest">Выйти из игры</a></div></div>';
  return html;
}

function photoSrc(p) {
  return String(p || "").replace(/^\//, "").replace(/\?.*$/, "");
}

function qParse(item) {
  var file = String((item && item.file) || "");
  var base = file.replace(/\.mp3$/i, "");
  var d = base.indexOf(" - ");
  return {
    src: photoSrc((item && item.src) || ""),
    speaker: d === -1 ? base.replace(/^\s+|\s+$/g, "") : base.slice(0, d).replace(/^\s+|\s+$/g, ""),
    title: d === -1 ? "" : base.slice(d + 3).replace(/^\s+|\s+$/g, "")
  };
}

function qShuffle(avoidFirst) {
  var ids = [];
  var i;
  for (i = 0; i < QUOTES.length; i++) ids.push(i);
  for (i = ids.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = ids[i];
    ids[i] = ids[j];
    ids[j] = t;
  }
  if (avoidFirst != null && ids.length > 1 && ids[0] === avoidFirst) {
    var x = ids[0];
    ids[0] = ids[1];
    ids[1] = x;
  }
  qOrder = ids;
  qPos = 0;
}

function qClip() {
  if (!qOrder.length || !QUOTES.length) return null;
  return qParse(QUOTES[qOrder[qPos]]);
}

function qFmt(sec) {
  if (!(sec > 0)) return "0:00";
  var s = Math.floor(sec);
  var m = Math.floor(s / 60);
  var r = s % 60;
  return m + ":" + (r < 10 ? "0" : "") + r;
}

function readQVol() {
  try {
    var raw = localStorage.getItem(Q_VOL_KEY);
    if (raw == null || raw === "") return 100;
    var n = Number(raw);
    if (n >= 0 && n <= 100) return Math.round(n);
  } catch (e) {}
  return 100;
}
function setQVol(n) {
  n = Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  try { localStorage.setItem(Q_VOL_KEY, String(n)); } catch (e) {}
  if (qAudio) qAudio.volume = n / 100;
  return n;
}

function qInit() {
  if (qAudio) {
    qAudio.volume = readQVol() / 100;
    return;
  }
  qAudio = new Audio();
  qAudio.preload = "none";
  qAudio.volume = readQVol() / 100;
  qAudio.addEventListener("timeupdate", qSyncUi);
  qAudio.addEventListener("loadedmetadata", qSyncUi);
  qAudio.addEventListener("play", qSyncUi);
  qAudio.addEventListener("pause", qSyncUi);
  qAudio.addEventListener("ended", function () {
    if (qLoop) return;
    try { qAudio.currentTime = 0; } catch (e) {}
    qSyncUi();
  });
}

function qIco(kind) {
  if (kind === "prev") {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12l10-8v16z"/><rect x="5" y="4" width="2.4" height="16" rx="1"/></svg>';
  }
  if (kind === "next") {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4z"/><rect x="16.6" y="4" width="2.4" height="16" rx="1"/></svg>';
  }
  if (kind === "pause") {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4.5" height="16" rx="1"/><rect x="13.5" y="4" width="4.5" height="16" rx="1"/></svg>';
  }
  if (kind === "loop") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function qReset() {
  if (qAudio) {
    try {
      qAudio.pause();
      qAudio.removeAttribute("src");
      qAudio.removeAttribute("data-src");
      qAudio.load();
    } catch (e) {}
  }
  qOrder = [];
  qPos = 0;
}

function quotePlayerHtml() {
  if (!QUOTES.length) return "";
  var clip = qClip();
  var playing = qAudio && !qAudio.paused && !qAudio.ended;
  var speaker = clip ? clip.speaker : "Случайный голос";
  var title = clip ? clip.title : "Жми play — двор орёт сам";
  var dur = qAudio && isFinite(qAudio.duration) ? qAudio.duration : 0;
  var cur = qAudio ? qAudio.currentTime : 0;
  var pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
  return '<section class="qplayer" aria-label="Плеер цитат">' +
    '<p class="kicker">Голос двора</p>' +
    '<p class="q-speaker">' + (playing ? '<i class="q-dot"></i>' : "") + esc(speaker) + "</p>" +
    '<p class="q-title">«' + esc(title) + "»</p>" +
    '<button type="button" class="q-prog" id="q-prog" aria-label="Перемотка"><i style="width:' + pct + '%"></i></button>' +
    '<div class="q-times"><span id="q-cur">' + qFmt(cur) + '</span><span id="q-dur">' + qFmt(dur) + "</span></div>" +
    '<div class="q-controls">' +
    '<div class="q-btns">' +
    '<button type="button" class="q-btn" id="q-prev" aria-label="Назад">' + qIco("prev") + "</button>" +
    '<button type="button" class="q-btn q-play" id="q-play" aria-label="' + (playing ? "Пауза" : "Играть") + '">' +
    qIco(playing ? "pause" : "play") + "</button>" +
    '<button type="button" class="q-btn" id="q-next" aria-label="Дальше">' + qIco("next") + "</button>" +
    '<button type="button" class="q-btn' + (qLoop ? " on" : "") + '" id="q-loop" aria-label="Повторить" aria-pressed="' + (qLoop ? "true" : "false") + '">' +
    qIco("loop") + "</button>" +
    "</div>" +
    '<div class="q-vol">' +
    '<svg class="q-vol-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>' +
    '<input type="range" id="q-vol" min="0" max="100" step="1" value="' + readQVol() + '" aria-label="Громкость ' + readQVol() + '%" />' +
    '<span id="q-vol-val" class="q-vol-val">' + readQVol() + "%</span>" +
    "</div></div></section>";
}

function qSyncUi() {
  var root = document.querySelector(".qplayer");
  if (!root || !qAudio) return;
  var clip = qClip();
  var playing = !qAudio.paused && !qAudio.ended;
  var speaker = clip ? clip.speaker : "Случайный голос";
  var title = clip ? clip.title : "Жми play — двор орёт сам";
  var dur = isFinite(qAudio.duration) ? qAudio.duration : 0;
  var cur = qAudio.currentTime || 0;
  var pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
  var sp = root.querySelector(".q-speaker");
  if (sp) sp.innerHTML = (playing ? '<i class="q-dot"></i>' : "") + esc(speaker);
  var tt = root.querySelector(".q-title");
  if (tt) tt.textContent = "«" + title + "»";
  var bar = root.querySelector(".q-prog i");
  if (bar) bar.style.width = pct + "%";
  var c = document.getElementById("q-cur");
  if (c) c.textContent = qFmt(cur);
  var d = document.getElementById("q-dur");
  if (d) d.textContent = qFmt(dur);
  var play = document.getElementById("q-play");
  if (play) {
    play.setAttribute("aria-label", playing ? "Пауза" : "Играть");
    play.innerHTML = qIco(playing ? "pause" : "play");
  }
  var loopBtn = document.getElementById("q-loop");
  if (loopBtn) {
    loopBtn.className = "q-btn" + (qLoop ? " on" : "");
    loopBtn.setAttribute("aria-pressed", qLoop ? "true" : "false");
  }
  var vol = readQVol();
  var volInp = document.getElementById("q-vol");
  if (volInp && volInp.value !== String(vol)) volInp.value = String(vol);
  var volVal = document.getElementById("q-vol-val");
  if (volVal) volVal.textContent = vol + "%";
  if (volInp) volInp.setAttribute("aria-label", "Громкость " + vol + "%");
}

function qLoad(autoplay) {
  qInit();
  var clip = qClip();
  if (!clip || !qAudio) return;
  var abs = clip.src;
  if (qAudio.getAttribute("data-src") !== abs) {
    qAudio.src = abs;
    qAudio.setAttribute("data-src", abs);
  }
  qAudio.loop = qLoop;
  qAudio.volume = readQVol() / 100;
  if (autoplay) {
    var p = qAudio.play();
    if (p && p.catch) p.catch(function () {});
  }
  qSyncUi();
}

function qPlayPause() {
  qInit();
  if (qAudio && !qAudio.paused && !qAudio.ended) {
    qAudio.pause();
    qSyncUi();
    return;
  }
  if (!qOrder.length) qShuffle();
  qLoad(true);
}

function qNext() {
  if (!QUOTES.length) return;
  var last = qOrder.length ? qOrder[qPos] : null;
  if (!qOrder.length) qShuffle();
  else {
    qPos += 1;
    if (qPos >= qOrder.length) qShuffle(last);
  }
  qLoad(true);
}

function qPrev() {
  qInit();
  if (qAudio && qAudio.currentTime > 2) {
    qAudio.currentTime = 0;
    qSyncUi();
    return;
  }
  if (!qOrder.length) qShuffle();
  qPos = (qPos - 1 + qOrder.length) % qOrder.length;
  qLoad(true);
}

function bindQuotePlayer() {
  var play = document.getElementById("q-play");
  if (!play) return;
  play.addEventListener("click", qPlayPause);
  document.getElementById("q-prev").addEventListener("click", qPrev);
  document.getElementById("q-next").addEventListener("click", qNext);
  document.getElementById("q-loop").addEventListener("click", function () {
    qLoop = !qLoop;
    if (qAudio) qAudio.loop = qLoop;
    qSyncUi();
  });
  document.getElementById("q-prog").addEventListener("click", function (e) {
    if (!qAudio || !(qAudio.duration > 0)) return;
    var rect = this.getBoundingClientRect();
    var x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    qAudio.currentTime = x * qAudio.duration;
    qSyncUi();
  });
  var volInp = document.getElementById("q-vol");
  if (volInp) {
    volInp.addEventListener("input", function () {
      var v = setQVol(this.value);
      var lab = document.getElementById("q-vol-val");
      if (lab) lab.textContent = v + "%";
    });
  }
  qSyncUi();
}

function charactersForGroup(cur) {
  var list = CHARACTERS.filter(function (c) { return cur === "all" || c.group === cur; });
  var tailIds = null;
  if (cur === "бестиарий") tailIds = ["zhiletka", "pero", "portret", "kurtka"];
  else if (cur === "двор") tailIds = ["svetdom"];
  if (!tailIds) return list;
  var rest = [];
  var map = {};
  for (var i = 0; i < list.length; i++) map[list[i].id] = list[i];
  for (var i = 0; i < list.length; i++) {
    if (tailIds.indexOf(list[i].id) === -1) rest.push(list[i]);
  }
  for (var t = 0; t < tailIds.length; t++) {
    if (map[tailIds[t]]) rest.push(map[tailIds[t]]);
  }
  return rest;
}

var CHAR_ORDER_KEY = "yurec-char-order";
function readCharOrder() {
  try {
    var raw = localStorage.getItem(CHAR_ORDER_KEY);
    var parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      var out = {};
      for (var k in parsed) {
        if (!Object.prototype.hasOwnProperty.call(parsed, k)) continue;
        if (Array.isArray(parsed[k])) {
          out[k] = parsed[k].filter(function (x) { return typeof x === "string"; });
        }
      }
      return out;
    }
  } catch (e) {}
  return {};
}
function writeCharOrder(map) {
  try {
    var n = 0;
    for (var k in map) if (Object.prototype.hasOwnProperty.call(map, k)) n++;
    if (!n) localStorage.removeItem(CHAR_ORDER_KEY);
    else localStorage.setItem(CHAR_ORDER_KEY, JSON.stringify(map));
  } catch (e) {}
}
function mergeCharOrder(saved, factory) {
  var factorySet = {};
  var i, id, j, idx, insertAt;
  for (i = 0; i < factory.length; i++) factorySet[factory[i]] = 1;
  var seen = {};
  var kept = [];
  if (saved) {
    for (i = 0; i < saved.length; i++) {
      id = saved[i];
      if (factorySet[id] && !seen[id]) {
        kept.push(id);
        seen[id] = 1;
      }
    }
  }
  var result = kept.slice();
  for (i = 0; i < factory.length; i++) {
    id = factory[i];
    if (seen[id]) continue;
    insertAt = result.length;
    for (j = i + 1; j < factory.length; j++) {
      idx = result.indexOf(factory[j]);
      if (idx !== -1) {
        insertAt = idx;
        break;
      }
    }
    result.splice(insertAt, 0, id);
    seen[id] = 1;
  }
  return result;
}
function orderedCharacters(cur) {
  var factory = charactersForGroup(cur);
  var saved = readCharOrder()[cur];
  if (!saved || !saved.length) return factory;
  var map = {};
  var ids = [];
  for (var i = 0; i < factory.length; i++) {
    map[factory[i].id] = factory[i];
    ids.push(factory[i].id);
  }
  var order = mergeCharOrder(saved, ids);
  var out = [];
  for (var j = 0; j < order.length; j++) {
    if (map[order[j]]) out.push(map[order[j]]);
  }
  return out;
}
function setGroupOrder(group, ids) {
  var all = readCharOrder();
  all[group] = ids.slice();
  writeCharOrder(all);
}
function resetCharOrder() {
  writeCharOrder({});
}

function yardLayers() {
  return (window.YUREC_YARD && window.YUREC_YARD.layers) || [];
}
function getYardLayer(id) {
  var layers = yardLayers();
  var i;
  for (i = 0; i < layers.length; i++) if (layers[i].id === id) return layers[i];
  return layers[0] || { id: "peter", pins: [], src: "maps/peter.jpg", title: "Петербург", kicker: "", hint: "", wide: false };
}
function setYardLayer(id) {
  state.ylayer = id;
  state.ypin = null;
  try { sessionStorage.setItem("yurec-yard-layer", id); } catch (e) {}
}
function yardTeaserHtml() {
  return '<article class="lcard" style="margin-top:16px">' +
    '<a class="pic" href="#/characters/map" aria-label="Открыть карту двора">' +
    '<img src="maps/yard.jpg" alt="" />' +
    '<div class="cap"><div class="kicker">Карта двора</div><h3>Петербург · Шотмана · трёшка</h3></div></a>' +
    '<a class="pad" href="#/characters/map">' +
    '<p class="muted" style="font-family:var(--serif);font-size:15px;line-height:1.45;margin:0">Сначала город, потом двор, потом холодильник, который не закрывается. Жми на огни.</p>' +
    '<span class="go on" style="display:grid;margin-top:8px;height:44px;place-items:center;border-radius:12px">Открыть карту</span></a></article>';
}
function yardSheetHtml(pin) {
  var ch = pin.char ? CHARACTERS.find(function (x) { return x.id === pin.char; }) : null;
  var html = '<aside class="ymap-sheet">';
  html += '<div class="ymap-sheet-top">';
  if (ch) html += '<img src="' + esc(photoSrc(ch.photo)) + '" alt="" />';
  html += '<div><p class="kicker">' + (pin.offscreen || pin.cloud ? "За кадром" : pin.kind === "goto" ? "Войти" : (ch ? esc(ch.role) : "Точка двора")) + "</p>";
  html += "<h3>" + esc(pin.label) + "</h3></div>";
  html += '<button type="button" class="ymap-x" id="ypin-x" aria-label="Закрыть">×</button></div>';
  html += '<p class="muted" style="font-family:var(--serif);font-size:15px;line-height:1.55;margin-top:12px">' + esc(pin.blurb) + "</p>";
  if (pin.kind === "goto" && pin.goto) {
    html += '<button type="button" class="go on" id="ypin-go" data-ylayer="' + esc(pin.goto) + '" style="display:grid;margin-top:12px;height:44px;place-items:center;border-radius:12px;width:100%;border:0">' +
      (pin.goto === "yard" ? "Спуститься во двор" : "Войти в трёшку") + "</button>";
  }
  if (ch) {
    html += '<a class="btn bar" style="margin-top:8px;display:grid;height:44px;place-items:center" href="#/characters/' + encodeURIComponent(ch.id) + '" id="ypin-char">Карточка: ' + esc(ch.name) + "</a>";
  }
  html += "</aside>";
  return html;
}
function renderYardMap() {
  try {
    var saved = sessionStorage.getItem("yurec-yard-layer");
    if (saved && !state.ylayer) state.ylayer = saved;
    if (saved && state.ylayer === "peter" && saved !== "peter") state.ylayer = saved;
  } catch (e) {}
  var layer = getYardLayer(state.ylayer || "peter");
  if (!layer) return shell('<p class="empty">Карты нет. <a href="#/characters">Назад</a></p>', "chars");
  var crumbs = [["peter", "Петербург"], ["yard", "Шотмана"], ["flat", "Трёшка"]];
  var at = 0, i, p;
  for (i = 0; i < crumbs.length; i++) if (crumbs[i][0] === layer.id) at = i;
  var html = '<a class="back" href="#/characters" id="yard-home">← К героям</a>';
  html += '<p class="kicker" style="margin-top:12px">' + esc(layer.kicker || "Карта двора") + "</p>";
  html += '<h2 style="font-size:28px;margin-top:6px">' + esc(layer.title) + "</h2>";
  html += '<nav class="ymap-crumb">';
  for (i = 0; i < crumbs.length; i++) {
    if (i) html += '<span class="ymap-sep">›</span>';
    html += '<button type="button" class="ymap-cr' + (i === at ? " on" : "") + '" data-ylayer="' + crumbs[i][0] + '">' + crumbs[i][1] + "</button>";
  }
  html += "</nav>";
  html += '<p class="muted" style="font-family:var(--serif);font-size:15px;line-height:1.5;margin-top:8px">' + esc(layer.hint || "") + "</p>";
  html += '<div class="ymap-scroller"><div class="ymap-stage' + (layer.wide ? " is-wide" : "") + '">';
  html += '<img src="' + esc(photoSrc(layer.src)) + '" alt="' + esc(layer.title) + '" />';
  var pins = layer.pins || [];
  var open = state.ypin;
  var offHtml = "";
  for (i = 0; i < pins.length; i++) {
    p = pins[i];
    if (p.offscreen && !p.cloud) {
      offHtml += '<button type="button" class="ymap-off-pin' + (open === p.id ? " is-on" : "") + '" data-ypin="' + esc(p.id) + '" aria-label="' + esc(p.label) + ', за кадром">' + esc(p.label) + "</button>";
      continue;
    }
    var chp = p.char ? CHARACTERS.find(function (x) { return x.id === p.char; }) : null;
    var thumb = p.thumb || (chp ? chp.photo : "");
    var isFace = !!thumb && (p.cloud || p.kind === "goto" || layer.id === "peter");
    var cls = "ymap-pin" + (p.kind === "goto" ? " is-goto" : "") + (p.cloud ? " is-cloud" : "") + (isFace ? " is-face" : "") + (p.tone ? " is-" + p.tone : "") + (open === p.id ? " is-on" : "");
    var inner;
    if (isFace) {
      inner = '<span class="ymap-bubble"><img src="' + esc(photoSrc(thumb)) + '" alt="" />' + (p.kind === "goto" ? '<span class="ymap-go">▸</span>' : "") + "</span>";
    } else if (p.kind === "goto") {
      inner = '<i class="ymap-dot"><span class="ymap-go">▸</span></i>';
    } else {
      inner = '<i class="ymap-dot"></i>';
    }
    var lab = p.kind === "goto" ? p.label + " ▸" : p.label;
    html += '<button type="button" class="' + cls + '" style="left:' + p.x + "%;top:" + p.y + '%" data-ypin="' + esc(p.id) + '" aria-label="' + esc(p.label) + (p.cloud ? ", за кадром" : p.kind === "goto" ? ", войти" : "") + '">' +
      inner + '<span class="ymap-name">' + esc(lab) + "</span></button>";
  }
  if (offHtml) html += '<div class="ymap-off"><span class="ymap-off-lab">За кадром</span>' + offHtml + "</div>";
  html += "</div></div>";
  if (open) {
    var pin = null;
    for (i = 0; i < pins.length; i++) if (pins[i].id === open) pin = pins[i];
    if (pin) html += yardSheetHtml(pin);
  }
  return shell(html, "chars");
}
function bindYardMap() {
  var pins = document.querySelectorAll("[data-ypin]");
  var i;
  for (i = 0; i < pins.length; i++) {
    pins[i].addEventListener("click", function () {
      var id = this.getAttribute("data-ypin");
      state.ypin = state.ypin === id ? null : id;
      paint();
    });
  }
  var layers = document.querySelectorAll("[data-ylayer]");
  for (i = 0; i < layers.length; i++) {
    layers[i].addEventListener("click", function () {
      setYardLayer(this.getAttribute("data-ylayer"));
      paint();
    });
  }
  var x = document.getElementById("ypin-x");
  if (x) x.addEventListener("click", function () { state.ypin = null; paint(); });
  var ch = document.getElementById("ypin-char");
  if (ch) ch.addEventListener("click", function () {
    try { sessionStorage.setItem("yurec-char-from", "map"); } catch (e) {}
  });
  var home = document.getElementById("yard-home");
  if (home) home.addEventListener("click", function () {
    try { sessionStorage.removeItem("yurec-char-from"); } catch (e) {}
  });
}
function yardHardwareBack() {
  if (state.ypin) { state.ypin = null; paint(); return true; }
  var cur = state.ylayer || "peter";
  if (cur === "flat") { setYardLayer("yard"); paint(); return true; }
  if (cur === "yard") { setYardLayer("peter"); paint(); return true; }
  return false;
}

function renderCharacters() {
  try { sessionStorage.removeItem("yurec-char-from"); } catch (e) {}
  var html = quotePlayerHtml();
  html += yardTeaserHtml();
  html += '<p class="kicker" style="margin-top:20px">Двор на Шотмана</p><h2 style="font-size:28px;margin-top:6px">Персонажи</h2>';
  html += '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:10px">Карточки тех, кто орёт, спасает, продаёт водку и каркает «РЕВЭЛ». Жми — будет смешно и чуть страшно. Зажми карточку и тащи, если хочешь другой порядок.</p>';
  html += '<div class="chips" id="cg">';
  var groups = [["all","Все"],["двор","Двор"],["банда","Банда"],["семья","Семья"],["друзья","Друзья"],["любовь","Любовь"],["работа","Работа"],["бестиарий","Дом"]];
  var cur = state.cgroup || "all";
  for (var i = 0; i < groups.length; i++) {
    html += '<button class="chip' + (cur === groups[i][0] ? " on" : "") + '" data-cg="' + groups[i][0] + '">' + groups[i][1] + "</button>";
  }
  html += "</div>";
  var list = orderedCharacters(cur);
  html += '<p class="stat">' + list.length + " карточек</p>";
  html += '<div class="cgrid">';
  for (var j = 0; j < list.length; j++) {
    var c = list[j];
    html += '<div class="ccard" role="link" tabindex="0" data-cid="' + esc(c.id) + '">' +
      '<img src="' + esc(photoSrc(c.photo)) + '" alt="' + esc(c.name) + '" draggable="false" />' +
      "<b>" + esc(c.name) + "</b><span>" + esc(c.role) + "</span>" +
      '<p>«' + esc(c.quote) + "»</p></div>";
  }
  html += "</div>";
  return shell(html, "chars");
}

function renderCharacter(id) {
  var c = CHARACTERS.find(function (x) { return x.id === id; });
  if (!c) return shell('<p class="empty">Этого героя нет. <a href="#/characters">Назад</a></p>', "chars");
  var qi = state.cqi || 0;
  var quotes = [c.quote].concat(c.quotes || []);
  var quote = quotes[qi % quotes.length];
  var fromMap = false;
  try { fromMap = sessionStorage.getItem("yurec-char-from") === "map"; } catch (e) {}
  var backHref = fromMap ? "#/characters/map" : "#/characters";
  var backLab = fromMap ? "← К карте" : "← К героям";
  var html = '<a class="back" href="' + backHref + '">' + backLab + "</a>" +
    '<div class="chero" style="margin-top:12px"><img src="' + esc(photoSrc(c.photo)) + '" alt="' + esc(c.name) + '" data-zoom="' + esc(photoSrc(c.photo)) + '"' + (id === "zhiletka" || id === "kurtka" || id === "portret" || id === "svetdom" || id === "granata" || id === "drobovik" ? ' style="object-position:center"' : "") + " />" +
    '<div class="cap"><div class="kicker">' + esc(c.vibe) + "</div><h2>" + esc(c.name) +
    "</h2><p class='muted'>" + esc(c.role) + "</p></div></div>";
  html += '<p class="subtle" style="margin-top:12px">' + esc(c.aka) + "</p>";
  html += '<button class="block" id="cquote" style="width:100%;text-align:left;margin-top:16px"><div class="kicker">Голос · жми</div>' +
    '<p class="muted" style="font-family:var(--serif);font-size:17px;line-height:1.55;margin-top:8px">«' + esc(quote) + "»</p></button>";
  html += '<p class="muted" style="font-family:var(--serif);font-size:16px;line-height:1.6;margin-top:18px">' + esc(c.bio) + "</p>";
  return shell(html, "chars");
}

function bindCharacters() {
  var chips = document.querySelectorAll("[data-cg]");
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("mousedown", function (e) {
      e.preventDefault();
      var el = document.querySelector(".chips");
      if (el) chipMap[route()] = el.scrollLeft;
    });
    chips[i].addEventListener("touchstart", function () {
      var el = document.querySelector(".chips");
      if (el) chipMap[route()] = el.scrollLeft;
    }, { passive: true });
    chips[i].addEventListener("click", function () {
      var el = document.querySelector(".chips");
      if (el) chipMap[route()] = el.scrollLeft;
      state.cgroup = this.getAttribute("data-cg") || "all";
      paint();
    });
  }
  bindQuotePlayer();
  bindCharDragOnce();
}

var CHAR_HOLD_MS = 400;
var charDrag = { hold: 0, x: 0, y: 0, id: null, swallowed: false, bound: false, el: null, downAt: 0 };
function closestCcard(el) {
  while (el && el !== document) {
    if (el.getAttribute && el.getAttribute("data-cid") && (el.className || "").indexOf("ccard") !== -1) return el;
    el = el.parentNode;
  }
  return null;
}
function charDragClearHold() {
  if (charDrag.hold) {
    window.clearTimeout(charDrag.hold);
    charDrag.hold = 0;
  }
}
function charDragEnd() {
  charDragClearHold();
  if (!charDrag.id) return;
  if (charDrag.el) charDrag.el.className = String(charDrag.el.className || "").replace(/\bdragging\b/g, "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  document.body.className = String(document.body.className || "").replace(/\bchar-dragging\b/g, "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  charDrag.id = null;
  charDrag.el = null;
}
function charDragSave() {
  var grid = document.querySelector(".cgrid");
  if (!grid) return;
  var kids = grid.querySelectorAll("[data-cid]");
  var ids = [];
  for (var i = 0; i < kids.length; i++) ids.push(kids[i].getAttribute("data-cid"));
  setGroupOrder(state.cgroup || "all", ids);
}
function charDragPoint(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function charDragHit(x, y) {
  var skip = charDrag.el;
  var prev = "";
  if (skip) {
    prev = skip.style.pointerEvents;
    skip.style.pointerEvents = "none";
  }
  var hit = document.elementFromPoint(x, y);
  if (skip) skip.style.pointerEvents = prev;
  return closestCcard(hit);
}
function charDragShift(card) {
  var grid = document.querySelector(".cgrid");
  if (!grid || !charDrag.id || !card) return;
  var over = card.getAttribute("data-cid");
  if (!over || over === charDrag.id) return;
  var from = grid.querySelector('[data-cid="' + charDrag.id + '"]');
  if (!from || from === card) return;
  var kids = [];
  for (var i = 0; i < grid.children.length; i++) kids.push(grid.children[i]);
  var fi = kids.indexOf(from);
  var ti = kids.indexOf(card);
  if (fi < 0 || ti < 0 || fi === ti) return;
  if (fi < ti) {
    if (card.nextSibling) grid.insertBefore(from, card.nextSibling);
    else grid.appendChild(from);
  } else {
    grid.insertBefore(from, card);
  }
  charDrag.el = from;
  charDragSave();
}
function charDragMoveAt(x, y) {
  if (charDrag.id) {
    var card = charDragHit(x, y);
    if (card) charDragShift(card);
    return;
  }
  var dx = x - charDrag.x;
  var dy = y - charDrag.y;
  if (dx * dx + dy * dy > 144) charDragClearHold();
}
function charDragIgnoreCancel() {
  // Android: pointercancel/touchcancel на длинном тапе. Если уже зажали — не рвать перенос.
  return !!(charDrag.hold || charDrag.id);
}
function bindCharDragOnce() {
  if (charDrag.bound) return;
  charDrag.bound = true;
  function onDown(e) {
    var el = closestCcard(e.target);
    if (!el) return;
    if (e.button != null && e.button !== 0) return;
    var now = Date.now();
    if (charDrag.downAt && now - charDrag.downAt < 40) return;
    charDrag.downAt = now;
    var p = charDragPoint(e);
    charDrag.x = p.x;
    charDrag.y = p.y;
    charDrag.swallowed = false;
    charDragClearHold();
    var id = el.getAttribute("data-cid");
    charDrag.hold = window.setTimeout(function () {
      charDrag.hold = 0;
      charDrag.id = id;
      charDrag.el = el;
      charDrag.swallowed = true;
      if ((" " + el.className + " ").indexOf(" dragging ") === -1) {
        el.className += (el.className ? " " : "") + "dragging";
      }
      if ((" " + document.body.className + " ").indexOf(" char-dragging ") === -1) {
        document.body.className += (document.body.className ? " " : "") + "char-dragging";
      }
      try { if (showVibrate() && navigator.vibrate) navigator.vibrate(18); } catch (err2) {}
    }, CHAR_HOLD_MS);
  }
  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (charDrag.id && e.cancelable) e.preventDefault();
    var p = charDragPoint(e);
    charDragMoveAt(p.x, p.y);
  }
  function onTouchMove(e) {
    var p = charDragPoint(e);
    if (charDrag.id && e.cancelable) e.preventDefault();
    charDragMoveAt(p.x, p.y);
  }
  function onUp() {
    charDragEnd();
  }
  function onCancel() {
    if (charDragIgnoreCancel()) return;
    charDragEnd();
  }
  function onScroll() {
    if (!charDrag.id) charDragClearHold();
  }
  window.addEventListener("scroll", onScroll, true);
  document.addEventListener("pointerdown", onDown, true);
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onUp, true);
  window.addEventListener("pointercancel", onCancel, true);
  document.addEventListener("touchstart", onDown, { passive: false, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onUp, true);
  window.addEventListener("touchcancel", onCancel, true);
  document.addEventListener("click", function (e) {
    var el = closestCcard(e.target);
    if (!el) return;
    if (charDrag.swallowed) {
      e.preventDefault();
      e.stopPropagation();
      charDrag.swallowed = false;
      return;
    }
    e.preventDefault();
    location.hash = "#/characters/" + encodeURIComponent(el.getAttribute("data-cid"));
  }, true);
  document.addEventListener("contextmenu", function (e) {
    if (closestCcard(e.target)) e.preventDefault();
  }, true);
}

function bindCharacter() {
  on($("#cquote"), "click", function () {
    state.cqi = (state.cqi || 0) + 1;
    paint();
  });
}

function gStart(fromSave) {
  if (fromSave) {
    gNode = fromSave.node;
    gStats = fromSave.stats || gFresh();
    gSteps = fromSave.steps || 0;
    startQuestTimer(gLevelId || "day", false);
  } else {
    gNode = GAME.start || "wake";
    gStats = gFresh();
    gSteps = 0;
    gWriteSave(null);
    startQuestTimer(gLevelId || "day", true);
  }
  var node = GAME.nodes[gNode];
  gPhase = node && node.end ? "end" : "play";
  gForceTop = true;
  paint();
}

function bindHome() {
  var q = $("#q");
  if (q) {
    q.addEventListener("input", function () {
      state.q = q.value;
      var list = filtered();
      var box = $("#list");
      var stat = $(".stat");
      if (stat) stat.textContent = ruCount(list.length, state.kind);
      if (box) {
        if (!list.length) box.innerHTML = '<p class="empty">По этому запросу на Шотмана тишина.</p>';
        else {
          var h = "";
          for (var i = 0; i < list.length; i++) h += card(list[i]);
          box.innerHTML = h;
          bindReadToggles();
        }
      }
    });
  }
  var chips = document.querySelectorAll("[data-kind]");
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("mousedown", function (e) {
      e.preventDefault();
      var el = document.querySelector(".chips");
      if (el) chipMap[route()] = el.scrollLeft;
    });
    chips[i].addEventListener("touchstart", function () {
      var el = document.querySelector(".chips");
      if (el) chipMap[route()] = el.scrollLeft;
    }, { passive: true });
    chips[i].addEventListener("click", function () {
      var el = document.querySelector(".chips");
      if (el) chipMap[route()] = el.scrollLeft;
      state.kind = this.getAttribute("data-kind") || "all";
      state.q = "";
      paint();
    });
  }
  var rand = $("#rand");
  if (rand) {
    rand.addEventListener("click", function () {
      var pick = stories[Math.floor(Math.random() * stories.length)];
      if (pick) go("/story/" + pick.slug);
    });
  }
  bindSort();
  bindReadToggles();
}

function bindSort() {
  on($("#sort"), "click", function () {
    cycleSort();
    paint();
  });
}

function bindMedia() {
  bindSort();
  bindOfflineBtns();
  var q = $("#mq");
  if (q) {
    q.addEventListener("input", function () {
      state.mq = q.value;
      var pos = q.selectionStart;
      paint();
      var nq = $("#mq");
      if (nq) {
        nq.focus();
        try { nq.setSelectionRange(pos, pos); } catch (e) {}
      }
    });
  }
}

function on(el, ev, fn) {
  if (el) el.addEventListener(ev, fn);
}

function bindAbout() {
  on($("#egg-title"), "click", function () {
    var now = Date.now();
    if (now - aboutTaps.t > 1600) aboutTaps.n = 0;
    aboutTaps.t = now;
    aboutTaps.n += 1;
    if (aboutTaps.n >= 5) {
      aboutTaps.n = 0;
      aboutEgg = true;
      try { localStorage.setItem(EGG_KEY, "1"); } catch (e) {}
      paint();
      window.setTimeout(function () {
        var storm = document.getElementById("egg-storm");
        if (storm && storm.parentNode) storm.parentNode.removeChild(storm);
      }, 2200);
    }
  });
}

function bindReadToggles() {
  var btns = document.querySelectorAll("[data-read-toggle]");
  var i;
  for (i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function (e) {
      e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      toggleRead(this.getAttribute("data-read-toggle"));
      paint();
    });
  }
}

function bindReaderScrub(reader) {
  var bar = document.getElementById("rscrub");
  var thumb = document.getElementById("rscrub-thumb");
  if (!reader || !bar || !thumb) return;
  var track = bar.querySelector(".rscrub-track") || bar;
  var drag = false;
  function layout() {
    var max = reader.scrollHeight - reader.clientHeight;
    if (max <= 48) { bar.style.display = "none"; return; }
    bar.style.display = "";
    var th = thumb.offsetHeight || 38;
    var h = track.clientHeight || bar.clientHeight;
    var y = (reader.scrollTop / max) * Math.max(1, h - th);
    thumb.style.transform = "translateY(" + Math.max(0, Math.min(h - th, y)) + "px)";
  }
  function fromY(clientY) {
    var rect = track.getBoundingClientRect();
    var th = thumb.offsetHeight || 38;
    var y = Math.max(0, Math.min(rect.height - th, clientY - rect.top - th / 2));
    var max = reader.scrollHeight - reader.clientHeight;
    if (max > 0 && rect.height > th) reader.scrollTop = (y / (rect.height - th)) * max;
    thumb.style.transform = "translateY(" + y + "px)";
  }
  function start(e) {
    drag = true;
    var t = e.touches ? e.touches[0] : e;
    fromY(t.clientY);
    e.preventDefault();
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
  }
  function move(e) {
    if (!drag) return;
    var t = e.touches ? e.touches[0] : e;
    fromY(t.clientY);
    e.preventDefault();
  }
  function end() {
    drag = false;
    document.removeEventListener("touchmove", move);
    document.removeEventListener("touchend", end);
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", end);
  }
  bar.addEventListener("touchstart", start, { passive: false });
  bar.addEventListener("mousedown", start);
  on(reader, "scroll", function () { if (!drag) layout(); });
  window._yurecScrubLayout = layout;
  layout();
}

function bindStory(slug) {
  var s = bySlug(slug);
  if (!s) return;
  bindOfflineBtns();
  on($("#read-toggle"), "click", function () {
    toggleRead(s.slug);
    paint();
  });
  on($("#back"), "click", function () { go(state.returnTo || "/"); });
  on($("#font"), "click", function () {
    var steps = [17, 19, 21];
    var cur = 19;
    try { cur = Number(localStorage.getItem(FONT_KEY) || 19); } catch (e) {}
    var next = steps[(Math.max(0, steps.indexOf(cur)) + 1) % steps.length];
    try { localStorage.setItem(FONT_KEY, String(next)); } catch (e) {}
    var body = $("#body");
    if (body) body.style.fontSize = next + "px";
    if (window._yurecScrubLayout) window._yurecScrubLayout();
  });
  on($("#paper"), "click", function () {
    cycleTheme();
    paint();
  });
  on($("#book"), "click", function () {
    var cur = books();
    var nxt = [];
    if (cur.indexOf(s.slug) !== -1) {
      for (var i = 0; i < cur.length; i++) if (cur[i] !== s.slug) nxt.push(cur[i]);
    } else {
      nxt = [s.slug].concat(cur);
    }
    setBooks(nxt);
    paint();
  });
  var reader = $("#reader");
  var lastWrite = 0, lastPct = -1;
  on(reader, "scroll", function () {
    updateTotop();
    var max = reader.scrollHeight - reader.clientHeight;
    var pct = max <= 0 ? 100 : Math.round((reader.scrollTop / max) * 100);
    var now = Date.now();
    if (pct === lastPct && now - lastWrite < 400) return;
    if (Math.abs(pct - lastPct) < 2 && now - lastWrite < 400 && pct < 98) return;
    if (pct < 3) return;
    lastPct = pct;
    lastWrite = now;
    try { localStorage.setItem(LAST_KEY, JSON.stringify({ slug: s.slug, percent: pct })); } catch (e) {}
    if (pct >= 90 && s.kind === "episode") markRead(s.slug);
  });
  bindReaderScrub(reader);
  try {
    var last = JSON.parse(localStorage.getItem(LAST_KEY) || "null");
    if (reader && last && last.slug === s.slug && last.percent > 3 && last.percent < 99) {
      setTimeout(function () {
        var max = reader.scrollHeight - reader.clientHeight;
        if (max > 0) reader.scrollTop = Math.round((last.percent / 100) * max);
        else if (s.kind === "episode") markRead(s.slug);
      }, 80);
    } else if (reader) {
      setTimeout(function () {
        var max = reader.scrollHeight - reader.clientHeight;
        if (max <= 0 && s.kind === "episode") markRead(s.slug);
      }, 80);
    }
  } catch (e) {}
  on($("#paid-open"), "click", function () { openPaidModal(); });
  var fq = $("#findq");
  on(fq, "input", function () {
    storyFind.q = fq.value;
    storyFind.i = 0;
    applyStoryFind();
  });
  on(fq, "keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (storyFind.n > 0) {
        storyFind.i = (storyFind.i + 1) % storyFind.n;
        applyStoryFind();
      }
    }
  });
  on($("#findnext"), "click", function () {
    if (storyFind.n > 0) {
      storyFind.i = (storyFind.i + 1) % storyFind.n;
      applyStoryFind();
    }
  });
}

function gEndNode(id) {
  var nodes = GAME && GAME.nodes ? GAME.nodes : {};
  var k;
  for (k in nodes) {
    if (nodes[k] && nodes[k].end === id) return nodes[k];
  }
  return null;
}
function openEndModal(id) {
  var node = gEndNode(id);
  var meta = gMeta(id);
  if (!node) return;
  var el = document.getElementById("end-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "end-modal";
    el.className = "modal";
    el.innerHTML = '<div class="box">' +
      '<p class="kicker" id="end-rank" style="text-align:center"></p>' +
      '<p class="ttl" id="end-title"></p>' +
      '<p class="hint" id="end-text" style="font-family:var(--serif);font-size:15px;line-height:1.6;text-align:left;white-space:pre-wrap;color:var(--muted)"></p>' +
      '<button type="button" class="btn wide" id="end-close">Закрыть</button></div>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) { if (e.target === el) el.style.display = "none"; });
    el.querySelector("#end-close").addEventListener("click", function () { el.style.display = "none"; });
  }
  var r = document.getElementById("end-rank");
  var t = document.getElementById("end-title");
  var x = document.getElementById("end-text");
  if (r) r.textContent = "Финал · " + ((meta && meta.rank) || "");
  if (t) t.textContent = node.title || "";
  if (x) x.textContent = node.text || "";
  el.style.display = "flex";
}

function doWipeLevel() {
  var id = gLevelId || "day";
  gWriteSave(null);
  try {
    localStorage.removeItem(endKey(id));
    if (id === "day") {
      localStorage.removeItem(GSAVE_LEGACY);
      localStorage.removeItem(GEND_LEGACY);
    }
  } catch (e) {}
  gPhase = "title";
  gNode = (GAME && GAME.start) || "wake";
  gStats = gFresh();
  gSteps = 0;
  clearQuestTimer(id);
  gForceTop = true;
  paint();
}

function openWipeModal(kind) {
  var el = document.getElementById("wipe-modal");
  var isCw = kind === "crossword";
  if (!el) {
    el = document.createElement("div");
    el.id = "wipe-modal";
    el.className = "modal";
    el.innerHTML = '<div class="box">' +
      '<p class="ttl" id="wipe-title">Сбросить прогресс уровня?</p>' +
      '<p class="hint" id="wipe-hint">Сохранение и открытые концовки этого конкретного уровня будут удалены.</p>' +
      '<div class="row"><button type="button" class="btn off" id="wipe-cancel">Отмена</button>' +
      '<button type="button" class="btn danger" id="wipe-ok">Сбросить</button></div></div>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el) el.style.display = "none";
    });
    el.querySelector("#wipe-cancel").addEventListener("click", function () { el.style.display = "none"; });
    el.querySelector("#wipe-ok").addEventListener("click", function () {
      el.style.display = "none";
      if (el.getAttribute("data-kind") === "crossword") {
        if (CW) cwWipeStorage(CW.id);
        cwPhase = "title";
        paint();
      } else {
        doWipeLevel();
      }
    });
  }
  el.setAttribute("data-kind", isCw ? "crossword" : "level");
  var t = document.getElementById("wipe-title");
  var h = document.getElementById("wipe-hint");
  if (isCw) {
    if (t) t.textContent = "Сбросить кроссворд?";
    if (h) h.textContent = "Буквы, золотое слово и отметка «разгадан» этого кроссворда сотрутся.";
  } else {
    if (t) t.textContent = "Сбросить прогресс уровня?";
    if (h) h.textContent = "Сохранение и открытые концовки этого конкретного уровня будут удалены.";
  }
  el.style.display = "flex";
}

function bindGame() {
  on($("#g-new"), "click", function () { gStart(null); });
  on($("#g-cont"), "click", function () { gStart(gReadSave()); });
  on($("#g-menu"), "click", function () { gPhase = "title"; gForceTop = true; paint(); });
  on($("#g-reset"), "click", function () { gStart(null); });
  on($("#g-wipe"), "click", function () { openWipeModal("level"); });
  on($("#g-cheat"), "click", function () { openCheatModal("level"); });
  var endRows = document.querySelectorAll(".ends li[data-end]");
  for (var ei = 0; ei < endRows.length; ei++) {
    endRows[ei].addEventListener("click", function () {
      openEndModal(this.getAttribute("data-end"));
    });
  }
  var btns = document.querySelectorAll(".choice");
  var node = GAME && GAME.nodes ? GAME.nodes[gNode] : null;
  var ch = node && node.choices ? node.choices : [];
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      var idx = Number(this.getAttribute("data-i"));
      var choice = ch[idx];
      if (!choice) return;
      if (!gMeets(gStats, choice.need)) return;
      gStats = gApply(gStats, choice.delta);
      gNode = choice.to;
      gSteps += 1;
      var next = GAME.nodes[gNode];
      if (next && next.end) {
        gPhase = "end";
        gRecord(next.end);
        gWriteSave(null);
        finishQuestTimer(gLevelId || "day");
      } else {
        gPhase = "play";
        gWriteSave({ node: gNode, stats: gStats, steps: gSteps });
      }
      gForceTop = true;
      paint();
    });
  }
}

var lastRoute = "";
var scrollMap = {};

function updateTotop() {
  var btn = document.getElementById("totop");
  if (!btn) return;
  var reader = document.getElementById("reader");
  if (reader) {
    var rm = reader.scrollHeight - reader.clientHeight;
    btn.style.display = rm > 80 && reader.scrollTop > 160 ? "grid" : "none";
    return;
  }
  var r = route();
  var allow = r === "/" || r.indexOf("/videos") === 0 || r.indexOf("/press/") === 0;
  var y = window.scrollY;
  var max = document.documentElement.scrollHeight - window.innerHeight;
  btn.style.display = allow && max > 80 && y > 160 ? "grid" : "none";
}

function tabKey(path) {
  if (!path || path === "/") return "home";
  if (path.indexOf("/citats") === 0) return "citats";
  if (path.indexOf("/chat") === 0) return "chat";
  if (path.indexOf("/videos") === 0 || path.indexOf("/press") === 0) return "media";
  if (path.indexOf("/game") === 0) return "game";
  if (path.indexOf("/characters") === 0) return "chars";
  if (path.indexOf("/saved") === 0) return "saved";
  return "about";
}

function paint() {
  var r = route();
  var avNow = r === "/game/av" || r.indexOf("/game/av") === 0;
  var arkNow = r === "/game/ark" || r.indexOf("/game/ark") === 0;
  var svoyaNow = r === "/game/svoya" || r.indexOf("/game/svoya") === 0;
  try {
    document.documentElement.classList.toggle("av-nodock", avNow || arkNow || svoyaNow);
    document.body.classList.toggle("av-nodock", avNow || arkNow || svoyaNow);
  } catch (e) {}
  if (!avNow) stopAv();
  if (!arkNow) stopArk();
  if (r.indexOf("/game") === 0) {
    var lastGame = "/game";
    if (r === "/game/av" || r.indexOf("/game/av") === 0) lastGame = "/game/av";
    else if (r === "/game/ark" || r.indexOf("/game/ark") === 0) lastGame = "/game/ark";
    else if (r === "/game/svoya" || r.indexOf("/game/svoya") === 0) lastGame = "/game/svoya";
    else if (r.indexOf("/game/crossword") === 0) lastGame = "/game/crosswords";
    else if (r.indexOf("/game/") === 0) lastGame = "/game/quest";
    try { localStorage.setItem("yurec-game-last", lastGame); } catch (e) {}
  }
  var onCharList = r === "/characters" || r === "/characters/";
  if (!onCharList) qReset();
  var same = r === lastRoute;
  var chipsNow = document.querySelector(".chips");
  if (chipsNow) chipMap[lastRoute] = chipsNow.scrollLeft;
  if (!same) {
    try { scrollMap[lastRoute] = window.scrollY; } catch (e) {}
    var a = tabKey(lastRoute), b = tabKey(r);
    if (a !== b) { state.q = ""; state.mq = ""; }
    if (a === "media" && b === "media") state.mq = "";
  }
  if (r.indexOf("/settings") !== 0) { wipeReadAsk = false; wipeCharAsk = false; wipeBakAsk = false; }
  if (r.indexOf("/about") !== 0) aboutEgg = false;
  var root = document.getElementById("app");
  var m = r.match(/^\/story\/([^/]+)/);
  if (m) {
    root.innerHTML = renderStory(decodeURIComponent(m[1]));
    bindStory(decodeURIComponent(m[1]));
    lastRoute = r;
    window.scrollTo(0, 0);
    return;
  }
  var vm = r.match(/^\/videos\/([^/]+)/);
  if (vm) { root.innerHTML = renderVideos(decodeURIComponent(vm[1])); bindMedia(); }
  else if (r.indexOf("/videos") === 0) { root.innerHTML = renderVideos(); bindMedia(); }
  else if (r.indexOf("/press/") === 0) {
    root.innerHTML = renderPressIssue(decodeURIComponent((r.split("/")[2] || "").split("?")[0]));
    bindPress();
  }
  else if (r.indexOf("/citats") === 0) root.innerHTML = renderCitats();
  else if (r.indexOf("/chat") === 0) { root.innerHTML = renderChat(); bindChat(); }
  else if (r.indexOf("/saved") === 0) root.innerHTML = renderSaved();
  else if (r.indexOf("/ideas") === 0) root.innerHTML = renderIdeas();
  else if (r.indexOf("/passport") === 0) { root.innerHTML = renderPassport(); bindPassport(); }
  else if (r.indexOf("/zashkvary") === 0) { root.innerHTML = renderZashkvary(); bindZashkvary(); }
  else if (r.indexOf("/changelog") === 0) root.innerHTML = renderChangelog();
  else if (r.indexOf("/offline") === 0) {
    if (!isPaid()) {
      root.innerHTML = renderDonate();
      bindDonate();
    } else {
      root.innerHTML = renderOffline();
      bindOfflinePage();
    }
  }
  else if (r.indexOf("/donate") === 0) {
    if (r !== lastRoute) donateAgain = false;
    root.innerHTML = renderDonate();
    bindDonate();
  }
  else if (r.indexOf("/settings") === 0) { root.innerHTML = renderSettings(); bindSettings(); }
  else if (r.indexOf("/about") === 0) { root.innerHTML = renderAbout(); bindAbout(); }
  else if (r.indexOf("/channel") === 0) root.innerHTML = renderChannel();
  else if (r === "/characters/map" || r === "/characters/map/") {
    root.innerHTML = renderYardMap();
    bindYardMap();
  } else if (r.indexOf("/characters/") === 0) {
    root.innerHTML = renderCharacter(decodeURIComponent(r.split("/")[2] || ""));
    bindCharacter();
  } else if (r.indexOf("/characters") === 0) {
    root.innerHTML = renderCharacters();
    bindCharacters();
  } else if (r === "/game" || r === "/game/") {
    root.innerHTML = renderGamesHub();
    bindGameHub();
  } else if (r === "/game/av" || r === "/game/av/") {
    if (!same || !document.getElementById("av-root")) {
      root.innerHTML = renderAv();
      bindAv();
    }
  } else if (r === "/game/ark" || r === "/game/ark/") {
    if (!same || !document.getElementById("ark-root")) {
      root.innerHTML = renderArk();
      bindArk();
    }
  } else if (r === "/game/svoya" || r === "/game/svoya/") {
    root.innerHTML = renderSvoya();
    bindSvoya();
  } else if (r === "/game/quest" || r === "/game/quest/") {
    root.innerHTML = renderQuestHub();
  } else if (r === "/game/crosswords" || r === "/game/crosswords/") {
    root.innerHTML = renderCrosswordsHub();
  } else if (r.indexOf("/game/") === 0) {
    var lid = decodeURIComponent((r.split("/")[2] || "").split("?")[0]);
    if (getCrossword(lid)) {
      setCrossword(lid);
      if (!same) cwPhase = (cwIsSolved() && cwPhase !== "play") ? "title" : cwPhase;
      root.innerHTML = renderCrossword();
      bindCrossword();
    } else {
      setLevel(lid);
      if (!same) gPhase = "title";
      root.innerHTML = renderGame();
      bindGame();
    }
  } else {
    root.innerHTML = renderHome();
    bindHome();
  }
  if (r === "/" || r.indexOf("/videos") === 0 || r.indexOf("/press") === 0 || r.indexOf("/saved") === 0 || r.indexOf("/citats") === 0 || r.indexOf("/game") === 0 || r.indexOf("/characters") === 0) {
    if (r.indexOf("/story") !== 0) state.returnTo = r;
  }
  lastRoute = r;
  bindReadToggles();
  var y = gForceTop ? 0 : (same ? window.scrollY : (scrollMap[r] || 0));
  if (gForceTop) {
    try { scrollMap[r] = 0; } catch (e) {}
    gForceTop = false;
  }
  window.setTimeout(function () {
    window.scrollTo(0, y);
    var chipsAfter = document.querySelector(".chips");
    if (chipsAfter && chipMap[r] != null) chipsAfter.scrollLeft = chipMap[r];
    updateTotop();
    try { evaluateAchievements(); } catch (errAch) {}
  }, 0);
}

var zOpen = false;
var zGallery = null;
var zIndex = 0;
var zSrc = "";
var zSync = null;
var zScale = 1;
var zX = 0;
var zY = 0;
var zMoved = false;
var zSwiped = false;
var zStartDist = 0;
var zStartScale = 1;
var zLastX = 0;
var zLastY = 0;
var zStartX = 0;
var zStartY = 0;
var zBound = false;
var zFlipping = false;

function zLeaf() {
  var el = document.getElementById("zoom");
  return el ? el.querySelector(".zoom-leaf") : null;
}
function zImg() {
  var el = document.getElementById("zoom");
  return el ? el.querySelector("img") : null;
}

function openZoom(src, gallery, index, syncFn) {
  zEnsure();
  zGallery = gallery && gallery.length ? gallery : null;
  zIndex = index || 0;
  zSync = typeof syncFn === "function" ? syncFn : null;
  zSrc = zGallery ? zGallery[zIndex] || src : src;
  zFlipping = false;
  var leaf = zLeaf();
  if (leaf) leaf.className = "zoom-leaf";
  zReset();
  var el = document.getElementById("zoom");
  var img = zImg();
  if (img) img.src = zSrc;
  el.style.display = "block";
  el.className = "zoom on";
  zOpen = true;
}
function closeZoom() {
  zOpen = false;
  zGallery = null;
  zSync = null;
  zFlipping = false;
  zReset();
  var el = document.getElementById("zoom");
  if (el) {
    el.style.display = "none";
    el.className = "zoom";
  }
}

function zReset() {
  zScale = 1;
  zX = 0;
  zY = 0;
  zMoved = false;
  zSwiped = false;
  zApply();
}
function zApply() {
  var el = document.getElementById("zoom");
  if (!el) return;
  var img = el.querySelector("img");
  if (!img) return;
  img.style.transform = "translate(" + zX + "px," + zY + "px) scale(" + zScale + ")";
}
function zShow(dir) {
  if (zGallery && zGallery.length) {
    if (zIndex < 0) zIndex = 0;
    if (zIndex > zGallery.length - 1) zIndex = zGallery.length - 1;
    zSrc = zGallery[zIndex];
  }
  var img = zImg();
  if (img) img.src = zSrc;
  zReset();
  if (zSync) zSync(zIndex);
}
function zFlip(dir, nextIndex) {
  if (zFlipping) return;
  if (!zGallery || nextIndex < 0 || nextIndex > zGallery.length - 1) return;
  if (nextIndex === zIndex) return;
  var leaf = zLeaf();
  var img = zImg();
  if (!leaf || !img) {
    zIndex = nextIndex;
    zShow();
    return;
  }
  zFlipping = true;
  leaf.className = "zoom-leaf " + (dir === 1 ? "turn-next" : "turn-prev");
  window.setTimeout(function () {
    zIndex = nextIndex;
    zSrc = zGallery[zIndex];
    img.src = zSrc;
    zReset();
    if (zSync) zSync(zIndex);
  }, 220);
  window.setTimeout(function () {
    leaf.className = "zoom-leaf";
    zFlipping = false;
  }, 480);
}
function zTouches(e) {
  return e.touches || [];
}
function zDist(a, b) {
  var dx = a.clientX - b.clientX;
  var dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
function zEnsure() {
  var el = document.getElementById("zoom");
  if (!el) {
    el = document.createElement("div");
    el.id = "zoom";
    el.className = "zoom";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Просмотр");
    el.innerHTML = "<div class='zoom-leaf'><img alt='' draggable='false' /></div>";
    document.body.appendChild(el);
  } else if (!el.querySelector(".zoom-leaf")) {
    var old = el.querySelector("img");
    el.innerHTML = "<div class='zoom-leaf'><img alt='' draggable='false' /></div>";
    if (old && old.src) {
      var nimg = el.querySelector("img");
      if (nimg) nimg.src = old.src;
    }
  }
  if (zBound) return;
  zBound = true;
  el.addEventListener("touchstart", function (e) {
    if (!zOpen) return;
    var t = zTouches(e);
    zMoved = false;
    zSwiped = false;
    if (t.length === 1) {
      zLastX = t[0].clientX;
      zLastY = t[0].clientY;
      zStartX = t[0].clientX;
      zStartY = t[0].clientY;
    } else if (t.length >= 2) {
      zStartDist = zDist(t[0], t[1]);
      zStartScale = zScale;
    }
  }, { passive: true });
  el.addEventListener("touchmove", function (e) {
    if (!zOpen) return;
    var t = zTouches(e);
    if (t.length >= 2) {
      if (e.cancelable) e.preventDefault();
      zMoved = true;
      var d = zDist(t[0], t[1]);
      if (zStartDist > 8) {
        zScale = zStartScale * (d / zStartDist);
        if (zScale < 1) zScale = 1;
        if (zScale > 5) zScale = 5;
        if (zScale <= 1.02) { zScale = 1; zX = 0; zY = 0; }
        zApply();
      }
      return;
    }
    if (t.length !== 1) return;
    var dx = t[0].clientX - zLastX;
    var dy = t[0].clientY - zLastY;
    zLastX = t[0].clientX;
    zLastY = t[0].clientY;
    if (Math.abs(dx) + Math.abs(dy) > 6) zMoved = true;
    if (zScale > 1.05) {
      if (e.cancelable) e.preventDefault();
      zX += dx;
      zY += dy;
      zApply();
    }
  }, { passive: false });
  el.addEventListener("touchend", function (e) {
    if (!zOpen) return;
    var t = zTouches(e);
    if (t.length >= 2) {
      zStartDist = zDist(t[0], t[1]);
      zStartScale = zScale;
      return;
    }
    if (t.length === 1) {
      zLastX = t[0].clientX;
      zLastY = t[0].clientY;
      zStartScale = zScale;
      return;
    }
    if (zMoved && zScale <= 1.05 && zGallery && zGallery.length > 1 && !zFlipping) {
      var dx = zLastX - zStartX;
      var dy = zLastY - zStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) + 8) {
        zSwiped = true;
        zFlip(dx < 0 ? 1 : -1, zIndex + (dx < 0 ? 1 : -1));
      }
    }
  });
  el.addEventListener("click", function (e) {
    e.stopPropagation();
    if (zSwiped) { zSwiped = false; return; }
    if (zMoved) return;
    if (zScale > 1.05) return;
    if (zFlipping) return;
    closeZoom();
  });
  el.addEventListener("pointerdown", function (e) {
    if (!zOpen || e.pointerType === "touch") return;
    if (e.pointerType !== "mouse" && e.isPrimary === false) return;
    zMoved = false;
    zSwiped = false;
    zLastX = e.clientX;
    zLastY = e.clientY;
    zStartX = e.clientX;
    zStartY = e.clientY;
  });
  el.addEventListener("pointerup", function (e) {
    if (!zOpen || e.pointerType === "touch") return;
    if (zFlipping) return;
    var dx = e.clientX - zStartX;
    var dy = e.clientY - zStartY;
    if (zScale <= 1.05 && zGallery && zGallery.length > 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) + 8) {
      zSwiped = true;
      zFlip(dx < 0 ? 1 : -1, zIndex + (dx < 0 ? 1 : -1));
    }
  });
}

function parentPath(r) {
  if (r.indexOf("/press/") === 0) return "/videos/press";
  if (r.indexOf("/offline") === 0) return "/donate";
  if (r.indexOf("/story/") === 0) return state.returnTo || "/";
  if (r.indexOf("/characters/") === 0) {
    if (r === "/characters/map" || r === "/characters/map/") return "/characters";
    return "/characters";
  }
  if (r === "/game/crosswords" || r === "/game/crosswords/") return "/game";
  if (r.indexOf("/game/crossword") === 0) return "/game/crosswords";
  if (r.indexOf("/game/") === 0) return "/game";
  if (r.indexOf("/videos/") === 0) return "/videos";
  if (r === "/videos" || r === "/game" || r === "/characters" || r === "/citats" || r === "/saved" || r === "/about" || r === "/donate" || r === "/offline" || r === "/changelog" || r === "/apk" || r === "/ideas" || r === "/channel" || r === "/settings" || r === "/passport" || r === "/zashkvary") return "/";
  return "/";
}
function yurecBack() {
  if (offOpen) {
    closeOffPlayer();
    return true;
  }
  var allm = document.getElementById("off-all-modal");
  if (allm && allm.style.display === "flex") {
    allm.style.display = "none";
    return true;
  }
  var cheat = document.getElementById("cheat-modal");
  if (cheat && cheat.style.display === "flex") {
    cheat.style.display = "none";
    return true;
  }
  var paid = document.getElementById("paid-modal");
  if (paid && paid.style.display === "flex") {
    paid.style.display = "none";
    return true;
  }
  var bugm = document.getElementById("bug-modal");
  if (bugm && bugm.style.display === "flex") {
    bugm.style.display = "none";
    return true;
  }
  var devm = document.getElementById("dev-modal");
  if (devm && devm.style.display === "flex") {
    devm.style.display = "none";
    return true;
  }
  if (zOpen) {
    closeZoom();
    return true;
  }
  var r = route();
  if (r === "/characters/map" || r === "/characters/map/") {
    if (yardHardwareBack()) return true;
  }
  if (r && r !== "/") {
    go(parentPath(r));
    return true;
  }
  return false;
}
window.yurecBack = yurecBack;
window.yurecPause = function () {
  if (qAudio) try { qAudio.pause(); } catch (e) {}
  var nodes = document.querySelectorAll("audio,video");
  for (var i = 0; i < nodes.length; i++) try { nodes[i].pause(); } catch (e) {}
};
document.addEventListener("visibilitychange", function () {
  if (document.hidden && window.yurecPause) window.yurecPause();
  if (!document.hidden) applyKeepAwake();
});

function openPaidModal() {
  var el = document.getElementById("paid-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "paid-modal";
    el.className = "modal";
    el.innerHTML = '<form class="box">' +
      '<p class="ttl">Платный контент: введите лицензионный ключ</p>' +
      '<input id="paid-key" type="text" autocomplete="off" placeholder="ключ" />' +
      '<p class="hint" id="paid-hint">Один раз — и контент открыт навсегда. Это окно больше не появится.</p>' +
      '<div class="row"><button type="button" class="btn ghost" id="paid-cancel">Отмена</button>' +
      '<button type="submit" class="btn yt">Открыть</button></div>' +
      '<button type="button" class="btn gold wide" id="paid-buy" style="margin-top:8px">Купить</button></form>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el) el.style.display = "none";
    });
    el.querySelector("#paid-cancel").addEventListener("click", function () { el.style.display = "none"; });
    el.querySelector("#paid-buy").addEventListener("click", function () {
      el.style.display = "none";
      go("/donate");
    });
    el.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (document.getElementById("paid-key") || {}).value || "";
      if (tryUnlock(v)) {
        el.style.display = "none";
        try {
          var k = document.getElementById("paid-key");
          if (k && k.blur) k.blur();
        } catch (err) {}
        afterUnlock();
      } else {
        var h = document.getElementById("paid-hint");
        if (h) { h.textContent = "Неверный ключ."; h.className = "hint err"; }
      }
    });
  }
  var inp = document.getElementById("paid-key");
  if (inp) inp.value = "";
  var h = document.getElementById("paid-hint");
  if (h) { h.textContent = "Один раз — и контент открыт навсегда. Это окно больше не появится."; h.className = "hint"; }
  el.style.display = "flex";
  window.setTimeout(function () { if (inp) inp.focus(); }, 50);
}

function boot() {
  stories = window.STORIES || [];
  videos = window.VIDEOS || [];
  GAME = window.YUREC_GAME || window.GAME || null;
  if (window.YUREC_CROSSWORDS && window.YUREC_CROSSWORDS.length) CWS = window.YUREC_CROSSWORDS;
  else if (window.YUREC_CROSSWORD) CWS = [window.YUREC_CROSSWORD];
  else CWS = [];
  CW = CWS[0] || null;
  LEVELS = window.YUREC_LEVELS || [];
  if (!LEVELS.length && GAME) LEVELS = [GAME];
  if (LEVELS.length) {
    GAME = getLevel("day") || LEVELS[0] || GAME;
    gLevelId = GAME && GAME.id ? GAME.id : "";
  }
  CHARACTERS = window.YUREC_CHARACTERS || window.CHARACTERS || [];
  PRESS = window.YUREC_PRESS || [];
  QUOTES = window.YUREC_QUOTES || [];
  CITATS = window.YUREC_CITATS || [];
  OFFLINE.items = (window.YUREC_OFFLINE && window.YUREC_OFFLINE.items) || [];
  syncNativeCache();
  qInit();
  APP = window.YUREC_APP || window.APP || APP;
  try {
    if (window.YUREC_ACHIEVEMENTS && window.YUREC_ACHIEVEMENTS.items && window.YUREC_ACHIEVEMENTS.items.length) {
      ACH_ITEMS = window.YUREC_ACHIEVEMENTS.items;
    }
  } catch (eAch) {}
  try {
    var sm = localStorage.getItem(SORT_KEY);
    if (sm === "old" || sm === "new" || sm === "az" || sm === "za") state.sort = sm;
    else if (localStorage.getItem(SORT_LEGACY) === "1") state.sort = "new";
  } catch (e) {}
  if (!stories.length) throw new Error("архив не загрузился");
  migrateDay();
  if (GAME) {
    gNode = GAME.start || "wake";
    gStats = gFresh();
  }
  applyTheme();
  syncWideLayout();
  try {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () {
      if (readTheme() === "system") { applyTheme("system"); }
    });
  } catch (e2) {}
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t) return;
    var el = t.nodeType === 1 ? t : t.parentNode;
    var toTop = el && el.closest ? el.closest("#totop") : null;
    if (toTop) {
      e.preventDefault();
      var reader = document.getElementById("reader");
      if (reader) {
        reader.scrollTop = 0;
        updateTotop();
        return;
      }
      try { scrollMap[route()] = 0; } catch (err) {}
      window.scrollTo(0, 0);
      updateTotop();
      return;
    }
    var themeBtn = el && el.closest ? el.closest("#theme-btn") : null;
    if (themeBtn) {
      e.preventDefault();
      cycleTheme();
      paint();
      return;
    }
    var navHome = el && el.closest ? el.closest('nav.nav a[href="#/"]') : null;
    if (navHome && route() === "/") {
      e.preventDefault();
      if (window.scrollY > 24) {
        try { scrollMap["/"] = 0; } catch (err) {}
        window.scrollTo(0, 0);
        return;
      }
      state.kind = "all";
      state.q = "";
      try { scrollMap["/"] = 0; } catch (err) {}
      var chipsHome = document.querySelector(".chips");
      if (chipsHome) chipsHome.scrollLeft = 0;
      chipMap["/"] = 0;
      paint();
      window.scrollTo(0, 0);
      chipsHome = document.querySelector(".chips");
      if (chipsHome) chipsHome.scrollLeft = 0;
      chipMap["/"] = 0;
      return;
    }
    var navVideos = el && el.closest ? el.closest('nav.nav a[href="#/videos"]') : null;
    if (navVideos) {
      var vr = route();
      if (vr.indexOf("/videos/") === 0 || vr.indexOf("/press/") === 0) {
        if (window.scrollY > 24) {
          e.preventDefault();
          try { scrollMap[vr] = 0; } catch (err) {}
          window.scrollTo(0, 0);
          return;
        }
      } else if (vr === "/videos" || vr === "/videos/") {
        e.preventDefault();
        if (window.scrollY > 24) {
          try { scrollMap["/videos"] = 0; } catch (err) {}
          window.scrollTo(0, 0);
          return;
        }
        state.mq = "";
        paint();
        window.scrollTo(0, 0);
        return;
      }
    }
    var navChars = el && el.closest ? el.closest('nav.nav a[href="#/characters"]') : null;
    if (navChars) {
      var cr = route();
      if (cr.indexOf("/characters/") === 0) {
        if (window.scrollY > 24) {
          e.preventDefault();
          try { scrollMap[cr] = 0; } catch (err) {}
          window.scrollTo(0, 0);
          return;
        }
      } else if (cr === "/characters" || cr === "/characters/") {
        e.preventDefault();
        if (window.scrollY > 24) {
          try { scrollMap["/characters"] = 0; } catch (err) {}
          window.scrollTo(0, 0);
          return;
        }
        state.cgroup = "all";
        paint();
        window.scrollTo(0, 0);
        return;
      }
    }
    var navGame = el && el.closest ? el.closest('nav.nav a[href="#/game"]') : null;
    if (navGame) {
      var gr = route();
      if (gr.indexOf("/game") !== 0) {
        var lastG = "/game";
        try { lastG = localStorage.getItem("yurec-game-last") || "/game"; } catch (err) {}
        if (lastG !== "/game") {
          e.preventDefault();
          go(lastG);
          return;
        }
      } else if (gr.indexOf("/game/") === 0) {
        if (window.scrollY > 24) {
          e.preventDefault();
          try { scrollMap[gr] = 0; } catch (err) {}
          window.scrollTo(0, 0);
          return;
        }
      } else if (gr === "/game" || gr === "/game/") {
        e.preventDefault();
        try { scrollMap["/game"] = 0; } catch (err) {}
        window.scrollTo(0, 0);
        return;
      }
    }
    var subNav = el && el.closest ? el.closest("nav.subnav a") : null;
    if (subNav) {
      var want = (subNav.getAttribute("href") || "").replace(/^#/, "");
      if (want && route() === want) {
        e.preventDefault();
        try { scrollMap[want] = 0; } catch (err) {}
        window.scrollTo(0, 0);
        return;
      }
    }
    if (t.closest && t.closest(".back")) return;
    var z = t.closest ? t.closest("[data-zoom]") : null;
    if (z) {
      e.preventDefault();
      openZoom(z.getAttribute("data-zoom"));
    }
  });
  window.addEventListener("scroll", updateTotop, { passive: true });
  applyStoredIcon();
  applyKeepAwake();
  paint();
  window.addEventListener("hashchange", paint);
}

try {
  boot();
} catch (err) {
  document.getElementById("app").innerHTML =
    '<p class="empty">Не удалось открыть сборник: ' + esc(err.message) + "</p>";
}
