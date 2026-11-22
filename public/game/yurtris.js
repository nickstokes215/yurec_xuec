/* «Юртрис» — ламповый тетрис двора. Стакан 10×20, семь героев, пять скоростей. */
(function (root) {
  "use strict";

  var COLS = 10;
  var ROWS = 20;
  var BASE_DROP = 780;
  var FACTOR = 1.3;
  var SCORES_KEY = "yurec-yt-scores";
  var PRIZES_KEY = "yurec-yt-prizes";
  var TUT_KEY = "yurec-yt-seen-tut";
  var COACH_KEY = "yurec-yt-coach";
  var CLEARS_KEY = "yurec-yt-clears";
  var SNAP_KEY = "yurec-yt-snap";
  var LINE_SCORES = [0, 100, 300, 500, 900];

  var LEVELS = [
    { level: 1, title: "Утро на Шотмана", target: 1200 },
    { level: 2, title: "Ларёк и линолеум", target: 3200 },
    { level: 3, title: "Вечерний Шотман", target: 6500 },
    { level: 4, title: "Радуга и диск", target: 11500 },
    { level: 5, title: "Трон Императора", target: 18500 }
  ];
  LEVELS.forEach(function (lv, i) {
    lv.drop = Math.round(BASE_DROP / Math.pow(FACTOR, i));
    lv.speed = i === 0 ? "обычная" : "+" + Math.round((Math.pow(FACTOR, i) - 1) * 100) + "%";
  });

  var PIECES = [
    { id: "yurec", name: "Юрец", badge: "ЮР", accent: "#e2a83e", dark: "#7c4d12", light: "#ffe08a", lore: "Длинная балка императора. Затыкает любую щель в линолеуме.",
      rots: [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],[[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],[[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]] },
    { id: "svetka", name: "Светлана", badge: "СВ", accent: "#d96b94", dark: "#782848", light: "#ffc2d9", lore: "Квадрат с портрета. Стоит намертво, как трубка дискового телефона.",
      rots: [[[1,1],[1,1]],[[1,1],[1,1]],[[1,1],[1,1]],[[1,1],[1,1]]] },
    { id: "zinaida", name: "Зинаида", badge: "ЗИ", accent: "#c85a32", dark: "#69240e", light: "#ffad8c", lore: "Тётя Зина с половником. Т-шка юркает в узкий проём между стенами.",
      rots: [[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],[[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]] },
    { id: "tolik", name: "Толик", badge: "ТО", accent: "#4f9d69", dark: "#215232", light: "#9be7b5", lore: "Ступенька из ларька. Левая, как долг за «Путинку».",
      rots: [[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]],[[0,0,0],[1,1,0],[0,1,1]],[[0,1,0],[1,1,0],[1,0,0]]] },
    { id: "kostya", name: "Костя", badge: "КО", accent: "#4a89dc", dark: "#1f4478", light: "#9ec5f8", lore: "Зеркальная ступенька Кастяна. Вправо, и сразу байка про «Олимпик».",
      rots: [[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]],[[0,0,0],[0,1,1],[1,1,0]],[[1,0,0],[1,1,0],[0,1,0]]] },
    { id: "lysyi", name: "Лысый", badge: "ЛЫ", accent: "#9b72cf", dark: "#4c3170", light: "#d5beff", lore: "Г-шка с рулоном линолеума. Давит углом, как смена в строймаге.",
      rots: [[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],[[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]] },
    { id: "gosha", name: "Гоша", badge: "ГО", accent: "#39a6a3", dark: "#175250", light: "#8ce6e3", lore: "Обратная Г-шка. Каркает и садится в другой угол, как НЛО на бак.",
      rots: [[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],[[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]] }
  ];

  var PRIZES = [
    { id: "first-line", title: "Порядок в трёшке", desc: "Собери первый полный ряд." },
    { id: "yurtris-quad", title: "Мастер четырёх этажей", desc: "Убери четыре ряда одним падением. Это и есть Юртрис." },
    { id: "level-3", title: "Свой в киоске", desc: "Дойди до вечернего Шотмана, третьего уровня." },
    { id: "combo-streak", title: "Холодная голова", desc: "Три уборки рядов подряд, без пустой постановки." },
    { id: "hall-of-fame", title: "Легенда двора", desc: "Набери 5 000 очков за одну партию." },
    { id: "champion-5", title: "Золотой половник", desc: "Пройди пятый уровень: 18 500 очков на троне." }
  ];

  function pieceBy(id) {
    var i;
    for (i = 0; i < PIECES.length; i++) if (PIECES[i].id === id) return PIECES[i];
    return PIECES[0];
  }
  function readJson(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fb;
      var v = JSON.parse(raw);
      return v == null ? fb : v;
    } catch (e) { return fb; }
  }
  function writeJson(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }
  function soundOn() {
    try { return localStorage.getItem("yurec-sound") !== "0"; } catch (e) { return true; }
  }
  function hallNick() {
    try { return localStorage.getItem("yurec-hall-name") || "Юрец"; } catch (e) { return "Юрец"; }
  }
  function esc(s) {
    var amp = "&" + "amp;";
    var lt = "&" + "lt;";
    var quot = "&" + "quot;";
    return String(s == null ? "" : s).replace(/&/g, amp).replace(/</g, lt).replace(/"/g, quot);
  }

  function mount(host) {
    host.innerHTML = "";
    host.classList.add("av-shell");
    try {
      document.documentElement.classList.add("av-nodock");
      document.body.classList.add("av-nodock");
    } catch (e) {}

    var audio = null;
    function beep(freq, ms, type, gain, delay) {
      if (!soundOn()) return;
      try {
        var AC = root.AudioContext || root.webkitAudioContext;
        if (!AC) return;
        if (!audio) audio = new AC();
        if (audio.state === "suspended") audio.resume();
        var t0 = audio.currentTime + (delay || 0) / 1000;
        var o = audio.createOscillator();
        var g = audio.createGain();
        o.type = type || "square";
        o.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(gain || 0.05, t0);
        g.gain.exponentialRampToValueAtTime(0.0008, t0 + ms / 1000);
        o.connect(g); g.connect(audio.destination);
        o.start(t0); o.stop(t0 + ms / 1000 + 0.02);
      } catch (e) {}
    }

    var head = document.createElement("div");
    head.className = "av-head";
    head.innerHTML = '<button type="button" class="av-title">Юртрис</button>';
    var pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "av-pause yt-off";
    pauseBtn.textContent = "ПАУЗА";
    head.appendChild(pauseBtn);

    var hud = document.createElement("div");
    hud.className = "av-hud";
    hud.hidden = true;
    hud.innerHTML = '<span class="av-score av-score-y"><i>счёт</i><b id="yt-score">0</b></span><span class="av-score av-score-z"><i>цель</i><b id="yt-goal">1200</b></span>';

    var wrap = document.createElement("div");
    wrap.className = "av-stage";
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Юртрис");
    wrap.appendChild(canvas);
    var veil = document.createElement("div");
    veil.className = "av-pause-veil";
    veil.hidden = true;
    veil.textContent = "Пауза";
    wrap.appendChild(veil);
    var coach = document.createElement("div");
    coach.className = "yt-coach";
    coach.hidden = true;
    wrap.appendChild(coach);

    var keys = document.createElement("div");
    keys.className = "yt-keys";
    keys.hidden = true;
    keys.innerHTML =
      '<button type="button" data-yt="left">←</button>' +
      '<button type="button" data-yt="rot">↻</button>' +
      '<button type="button" data-yt="right">→</button>' +
      '<button type="button" data-yt="soft">Вниз</button>' +
      '<button type="button" data-yt="hard">В пол</button>';

    var menu = document.createElement("div");
    menu.className = "av-menu";
    var end = document.createElement("div");
    end.className = "av-end";
    end.hidden = true;
    var sheet = document.createElement("div");
    sheet.className = "av-manual";
    sheet.hidden = true;

    wrap.appendChild(menu);
    wrap.appendChild(end);
    wrap.appendChild(sheet);
    host.appendChild(head);
    host.appendChild(hud);
    host.appendChild(wrap);
    host.appendChild(keys);

    var ctx = canvas.getContext("2d");
    var board = emptyBoard();
    var bag = [];
    var active = null;
    var nextId = null;
    var score = 0;
    var lines = 0;
    var combo = 0;
    var maxCombo = 0;
    var quads = 0;
    var levelIndex = 0;
    var phase = "menu";
    var paused = false;
    var dropAcc = 0;
    var lastT = 0;
    var raf = 0;
    var running = true;
    var particles = [];
    var coachStep = readJson(COACH_KEY, 0) || 0;
    var committed = false;
    var pointer = null;
    var holdTimer = 0;

    function emptyBoard() {
      var b = [], r, c;
      for (r = 0; r < ROWS; r++) {
        b[r] = [];
        for (c = 0; c < COLS; c++) b[r][c] = null;
      }
      return b;
    }
    function level() { return LEVELS[levelIndex] || LEVELS[0]; }
    function clears() { return readJson(CLEARS_KEY, {}); }
    function isOpen(n) {
      if (n <= 1) return true;
      var c = clears();
      return !!(c[n - 1] || c[String(n - 1)]);
    }
    function markClear(n) {
      var c = clears();
      c[String(n)] = 1;
      writeJson(CLEARS_KEY, c);
      try { root.dispatchEvent(new Event("yurec-yt")); } catch (e) {}
    }
    function prizes() {
      var p = readJson(PRIZES_KEY, []);
      return Array.isArray(p) ? p : [];
    }
    function unlock(id) {
      var p = prizes();
      if (p.indexOf(id) >= 0) return;
      p.push(id);
      writeJson(PRIZES_KEY, p);
      beep(880, 120, "sine", 0.06);
      beep(1174, 140, "sine", 0.05, 90);
    }
    function pull() {
      if (!bag.length) {
        bag = PIECES.map(function (p) { return p.id; });
        var i, j, t;
        for (i = bag.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          t = bag[i]; bag[i] = bag[j]; bag[j] = t;
        }
      }
      return bag.pop();
    }
    function matrix(id, rot) {
      var def = pieceBy(id);
      var i = ((rot % def.rots.length) + def.rots.length) % def.rots.length;
      return def.rots[i];
    }
    function hits(id, rot, col, row) {
      var mat = matrix(id, rot), r, c, br, bc;
      for (r = 0; r < mat.length; r++) for (c = 0; c < mat[r].length; c++) {
        if (!mat[r][c]) continue;
        bc = col + c; br = row + r;
        if (bc < 0 || bc >= COLS || br >= ROWS) return true;
        if (br >= 0 && board[br][bc]) return true;
      }
      return false;
    }
    function spawn() {
      if (!nextId) nextId = pull();
      var id = nextId;
      nextId = pull();
      var mat = matrix(id, 0);
      var col = Math.floor((COLS - mat[0].length) / 2);
      var row = 0;
      var r, seen = false;
      for (r = 0; r < mat.length; r++) {
        if (mat[r].some(function (v) { return v; })) { seen = true; break; }
      }
      if (seen) row = -r;
      if (hits(id, 0, col, row)) {
        finish(false, "Стакан забит до потолка. Смена окончена.");
        return false;
      }
      active = { id: id, rot: 0, col: col, row: row };
      dropAcc = 0;
      return true;
    }
    function ghostRow() {
      if (!active) return 0;
      var r = active.row;
      while (!hits(active.id, active.rot, active.col, r + 1)) r += 1;
      return r;
    }
    function sayCoach() {
      if (coachStep >= 4 || phase !== "play") { coach.hidden = true; return; }
      var linesC = [
        "Веди пальцем влево и вправо — фигура едет по стакану.",
        "Короткий тап по стакану или кнопка ↻ — поворот.",
        "«Вниз» роняет на клетку. «В пол» ставит сразу.",
        "Собери полный ряд. До цели уровня — и двор засчитает победу."
      ];
      coach.hidden = false;
      coach.textContent = linesC[coachStep] || "";
    }
    function bumpCoach(n) {
      if (coachStep !== n) return;
      coachStep = n + 1;
      writeJson(COACH_KEY, coachStep);
      sayCoach();
    }
    function paintHud() {
      var s = document.getElementById("yt-score");
      var g = document.getElementById("yt-goal");
      if (s) s.textContent = String(score);
      if (g) g.textContent = String(level().target);
    }
    function syncChrome() {
      var live = phase === "play";
      hud.hidden = !live && phase !== "over" && phase !== "win";
      keys.hidden = !(live && !paused);
      if (live) {
        pauseBtn.classList.remove("yt-off");
        pauseBtn.hidden = false;
        pauseBtn.textContent = paused ? "ДАЛЬШЕ" : "ПАУЗА";
        pauseBtn.classList.toggle("is-on", !!paused);
      } else {
        pauseBtn.classList.add("yt-off");
        pauseBtn.hidden = true;
      }
      veil.hidden = !(live && paused);
      if (!(live && !paused)) coach.hidden = true;
      else sayCoach();
    }
    function bestScore() {
      var list = hallRead();
      return list.length ? (list[0].score || 0) : 0;
    }
    function hallRead() {
      var list = readJson(SCORES_KEY, []);
      if (!Array.isArray(list)) return [];
      list.sort(function (a, b) { return (b.score - a.score) || ((a.at || 0) - (b.at || 0)); });
      return list.slice(0, 10);
    }
    function hallPush(name, points, line) {
      var nick = String(name || "Юрец").replace(/^\s+|\s+$/g, "").slice(0, 16) || "Юрец";
      try { localStorage.setItem("yurec-hall-name", nick); } catch (e) {}
      var list = hallRead();
      list.push({ name: nick, score: points, line: line, at: Date.now() });
      list.sort(function (a, b) { return (b.score - a.score) || ((a.at || 0) - (b.at || 0)); });
      writeJson(SCORES_KEY, list.slice(0, 10));
      try { root.dispatchEvent(new Event("yurec-yt")); } catch (e2) {}
    }
    function clearedCount() {
      var c = clears(), n = 0, i;
      for (i = 1; i <= 5; i++) if (c[i] || c[String(i)]) n += 1;
      return n;
    }
    function paintMenu() {
      var html = '<p class="av-dos">C:\\SHOTMAN> yt</p>' +
        '<h3>Юртрис</h3>' +
        '<p class="av-lead">Ламповый тетрис девяностых, только фигурки — герои Шотмана. Пять уровней, каждый на 30% быстрее. Набрал цель — уровень твой.</p>' +
        '<p class="av-sheet"><b>пройдено ' + clearedCount() + ' / 5</b><span>рекорд: ' + bestScore() + '</span></p>';
      if (readJson(SNAP_KEY, null)) html += '<button type="button" class="av-next" id="yt-resume">Продолжить</button>';
      html += '<div class="av-diffs" id="yt-diffs"></div>' +
        '<div class="av-help-rule" role="separator"><span>Помощь</span></div>' +
        '<button type="button" class="av-info" id="yt-about">Как играть</button>' +
        '<button type="button" class="av-info" id="yt-hall">Таблица рекордов</button>' +
        '<button type="button" class="av-info" id="yt-prizes">Призы</button>' +
        '<div class="av-help-rule" role="separator"><span>служебный вход</span></div>' +
        '<button type="button" class="av-reset" id="yt-wipe">Сбросить Юртрис</button>';
      menu.innerHTML = html;
      menu.hidden = false;
      end.hidden = true;
      var box = menu.querySelector("#yt-diffs");
      LEVELS.forEach(function (lv) {
        var open = isOpen(lv.level);
        var done = !!(clears()[lv.level] || clears()[String(lv.level)]);
        var b = document.createElement("button");
        b.type = "button";
        b.className = "av-diff" + (open ? "" : " locked");
        b.disabled = !open;
        var sub = open
          ? (done ? "пройден · " : "открыт · ") + lv.speed + " · цель " + lv.target
          : "закрыто · сначала предыдущий";
        b.innerHTML = '<span class="av-diff-txt"><b>' + lv.level + ". " + lv.title + "</b><span>" + sub + "</span></span>";
        if (open) b.addEventListener("click", function () { startLevel(lv.level, false); });
        box.appendChild(b);
      });
      var resume = menu.querySelector("#yt-resume");
      if (resume) resume.onclick = function () { resumeSnap(); };
      menu.querySelector("#yt-about").onclick = function () { openAbout(); };
      menu.querySelector("#yt-hall").onclick = function () { openHall(); };
      menu.querySelector("#yt-prizes").onclick = function () { openPrizes(); };
      menu.querySelector("#yt-wipe").onclick = function () {
        if (menu.querySelector("#yt-wipe").textContent.indexOf("Точно") === 0) wipeAll();
        else menu.querySelector("#yt-wipe").textContent = "Точно? Рекорды, призы и уровни сгорят";
      };
    }
    function wipeAll() {
      try {
        localStorage.removeItem(SCORES_KEY);
        localStorage.removeItem(PRIZES_KEY);
        localStorage.removeItem(CLEARS_KEY);
        localStorage.removeItem(SNAP_KEY);
        localStorage.removeItem(COACH_KEY);
      } catch (e) {}
      coachStep = 0;
      try { root.dispatchEvent(new Event("yurec-yt")); } catch (e2) {}
      paintMenu();
    }
    function openAbout() {
      sheet.hidden = false;
      menu.hidden = true;
      sheet.innerHTML =
        '<p class="av-dos">C:\\SHOTMAN> help</p><h3>Как играть</h3>' +
        '<p class="av-lead">Стакан как в тетрисе: десять клеток в ширину, двадцать в высоту. Семь фигур — Юрец, Светлана, Зинаида, Толик, Костя, Лысый и Гоша. Мешок из семи, без долгой засухи нужной.</p>' +
        '<p class="av-lead">Влево и вправо — сдвиг. Поворот — тап или ↻. «Вниз» даёт одно очко за клетку. «В пол» ставит сразу и даёт два очка за клетку падения.</p>' +
        '<p class="av-lead">Полный ряд исчезает. Один ряд — 100, два — 300, три — 500, четыре — 900. Сумма множится на номер уровня. Четыре ряда разом — Юртрис. Три уборки подряд без пустой постановки — комбо.</p>' +
        '<p class="av-lead">Уровень пройден, когда счёт дотянул до цели. Следующий быстрее на 30%. Не дотянул и упёрся в потолок — партия в таблицу, уровень закрыт как был.</p>' +
        '<p class="av-lead">Юрец — балка. Светлана — квадрат. Зинаида — буква Т. Толик и Костя — зеркальные ступеньки. Лысый и Гоша — углы в разные стороны.</p>' +
        '<button type="button" class="av-menu-btn" id="yt-back">Назад</button>';
      sheet.querySelector("#yt-back").onclick = closeSheet;
      try { localStorage.setItem(TUT_KEY, "1"); } catch (e) {}
    }
    function openHall() {
      var list = hallRead();
      var html = '<p class="av-dos">C:\\SHOTMAN> hall</p><h3>Таблица</h3>';
      if (!list.length) html += '<p class="av-lead">Пока пусто. Набери очки — двор запишет.</p>';
      else {
        html += '<ol class="svoya-hall">';
        var i;
        for (i = 0; i < list.length; i++) {
          html += "<li><span>" + (i + 1) + ". " + esc(list[i].name) + "<br>" + esc(list[i].line || "") + "</span><b>" + (list[i].score || 0) + "</b></li>";
        }
        html += "</ol>";
      }
      html += '<button type="button" class="av-menu-btn" id="yt-back">Назад</button>';
      sheet.innerHTML = html;
      sheet.hidden = false;
      menu.hidden = true;
      end.hidden = true;
      sheet.querySelector("#yt-back").onclick = closeSheet;
    }
    function openPrizes() {
      var got = prizes();
      var html = '<p class="av-dos">C:\\SHOTMAN> prizes</p><h3>Призы</h3>';
      var i, on;
      for (i = 0; i < PRIZES.length; i++) {
        on = got.indexOf(PRIZES[i].id) >= 0;
        html += '<p class="av-lead"' + (on ? "" : ' style="opacity:.45"') + "><b>" + esc(PRIZES[i].title) + "</b><br>" + esc(PRIZES[i].desc) + (on ? " · есть" : " · ещё нет") + "</p>";
      }
      html += '<button type="button" class="av-menu-btn" id="yt-back">Назад</button>';
      sheet.innerHTML = html;
      sheet.hidden = false;
      menu.hidden = true;
      sheet.querySelector("#yt-back").onclick = closeSheet;
    }
    function closeSheet() {
      sheet.hidden = true;
      if (phase === "menu") menu.hidden = false;
      else if (phase === "over" || phase === "win") end.hidden = false;
    }
    function clearSnap() {
      try { localStorage.removeItem(SNAP_KEY); } catch (e) {}
    }
    function saveSnap() {
      if (phase !== "play" || !active) return;
      writeJson(SNAP_KEY, {
        v: 1,
        levelIndex: levelIndex,
        board: board,
        active: active,
        nextId: nextId,
        bag: bag,
        score: score,
        lines: lines,
        combo: combo,
        maxCombo: maxCombo,
        quads: quads
      });
    }
    function resumeSnap() {
      var s = readJson(SNAP_KEY, null);
      if (!s || !s.board || !s.active) { startLevel(1, false); return; }
      board = s.board;
      active = s.active;
      nextId = s.nextId;
      bag = s.bag || [];
      score = s.score || 0;
      lines = s.lines || 0;
      combo = s.combo || 0;
      maxCombo = s.maxCombo || 0;
      quads = s.quads || 0;
      levelIndex = s.levelIndex || 0;
      committed = false;
      particles = [];
      phase = "play";
      paused = true;
      menu.hidden = true;
      end.hidden = true;
      sheet.hidden = true;
      lastT = performance.now();
      paintHud();
      syncChrome();
      draw();
    }
    function startLevel(n, keepSnap) {
      if (!keepSnap) clearSnap();
      levelIndex = Math.max(0, Math.min(4, n - 1));
      board = emptyBoard();
      bag = [];
      nextId = pull();
      score = 0;
      lines = 0;
      combo = 0;
      maxCombo = 0;
      quads = 0;
      committed = false;
      particles = [];
      phase = "play";
      paused = false;
      menu.hidden = true;
      end.hidden = true;
      sheet.hidden = true;
      lastT = performance.now();
      dropAcc = 0;
      spawn();
      paintHud();
      syncChrome();
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function commit(won) {
      if (committed) return;
      committed = true;
      if (score <= 0) return;
      hallPush(hallNick(), score, "ур. " + level().level + " · " + (won ? "пройден" : "стакан"));
    }
    function finish(won, text) {
      if (phase === "over" || phase === "win") return;
      phase = won ? "win" : "over";
      paused = false;
      active = null;
      clearSnap();
      commit(won);
      if (won) {
        markClear(level().level);
        beep(392, 90, "triangle", 0.05);
        beep(523, 90, "triangle", 0.05, 80);
        beep(659, 110, "triangle", 0.05, 160);
        if (level().level >= 3) unlock("level-3");
        if (level().level >= 5) unlock("champion-5");
      } else {
        beep(311, 140, "sawtooth", 0.04);
        beep(233, 160, "sawtooth", 0.035, 110);
      }
      if (score >= 5000) unlock("hall-of-fame");
      var next = won && level().level < 5 ? level().level + 1 : 0;
      end.innerHTML =
        '<p class="av-dos">C:\\SHOTMAN> ' + (won ? "win" : "over") + "</p><h3>" +
        (won ? "Уровень взят" : "Стакан закрыт") + "</h3>" +
        '<p class="av-lead">' + esc(text || "") + " Счёт " + score + " из " + level().target + ". Уровень «" + esc(level().title) + "».</p>" +
        '<p class="av-sheet"><b>рядов ' + lines + "</b><span>юртрисов " + quads + "</span></p>" +
        (!won ? '<button type="button" class="av-again" id="yt-again">Сыграть ещё раз</button>' : "") +
        (next ? '<button type="button" class="av-next" id="yt-next">Следующий уровень</button>' : "") +
        '<button type="button" class="av-info" id="yt-end-hall">Таблица рекордов</button>' +
        '<button type="button" class="av-menu-btn" id="yt-menu">В меню</button>';
      end.hidden = false;
      menu.hidden = true;
      syncChrome();
      var again = end.querySelector("#yt-again");
      if (again) again.onclick = function () { startLevel(level().level, false); };
      var nxt = end.querySelector("#yt-next");
      if (nxt) nxt.onclick = function () { startLevel(next, false); };
      end.querySelector("#yt-end-hall").onclick = function () { end.hidden = true; openHall(); };
      end.querySelector("#yt-menu").onclick = goMenu;
      draw();
    }
    function goMenu() {
      if (phase === "play") saveSnap();
      phase = "menu";
      paused = false;
      end.hidden = true;
      sheet.hidden = true;
      syncChrome();
      paintMenu();
      draw();
    }
    function shift(dx) {
      if (phase !== "play" || paused || !active) return;
      if (!hits(active.id, active.rot, active.col + dx, active.row)) {
        active.col += dx;
        beep(220, 30, "square", 0.03);
        bumpCoach(0);
      }
    }
    function rotate() {
      if (phase !== "play" || paused || !active) return;
      var def = pieceBy(active.id);
      var next = (active.rot + 1) % def.rots.length;
      var kicks = [0, -1, 1, -2, 2], i;
      for (i = 0; i < kicks.length; i++) {
        if (!hits(active.id, next, active.col + kicks[i], active.row)) {
          active.rot = next;
          active.col += kicks[i];
          beep(340, 45, "triangle", 0.04);
          bumpCoach(1);
          return;
        }
      }
    }
    function soft() {
      if (phase !== "play" || paused || !active) return;
      if (!hits(active.id, active.rot, active.col, active.row + 1)) {
        active.row += 1;
        score += 1;
        dropAcc = 0;
        bumpCoach(2);
        paintHud();
      } else lock();
    }
    function hard() {
      if (phase !== "play" || paused || !active) return;
      var n = 0;
      while (!hits(active.id, active.rot, active.col, active.row + 1)) {
        active.row += 1;
        n += 1;
      }
      score += n * 2;
      bumpCoach(2);
      lock();
    }
    function burst(row, id) {
      var def = pieceBy(id), c, k;
      for (c = 0; c < COLS; c++) for (k = 0; k < 3; k++) {
        particles.push({
          x: 0, y: 0, col: c, row: row,
          vx: (Math.random() - 0.5) * 90,
          vy: -30 - Math.random() * 70,
          life: 0.35 + Math.random() * 0.2,
          color: k % 2 ? def.light : def.accent
        });
      }
    }
    function lock() {
      if (!active) return;
      var id = active.id, rot = active.rot, col = active.col, row = active.row;
      var mat = matrix(id, rot);
      var r, c, br, bc, topped = false;
      for (r = 0; r < mat.length; r++) for (c = 0; c < mat[r].length; c++) {
        if (!mat[r][c]) continue;
        br = row + r; bc = col + c;
        if (br < 0) topped = true;
        else if (br < ROWS && bc >= 0 && bc < COLS) board[br][bc] = id;
      }
      beep(140, 60, "triangle", 0.05);
      var full = [], rr;
      for (rr = 0; rr < ROWS; rr++) {
        if (board[rr].every(function (cell) { return !!cell; })) full.push(rr);
      }
      if (full.length) {
        combo += 1;
        if (combo > maxCombo) maxCombo = combo;
        full.forEach(function (rowAt) { burst(rowAt, id); });
        var keep = [];
        var blank;
        for (rr = 0; rr < ROWS; rr++) if (full.indexOf(rr) < 0) keep.push(board[rr]);
        while (keep.length < ROWS) {
          blank = [];
          for (c = 0; c < COLS; c++) blank.push(null);
          keep.unshift(blank);
        }
        board = keep;
        var cleared = full.length;
        lines += cleared;
        var base = LINE_SCORES[cleared] || cleared * 200;
        var bonus = combo > 1 ? (combo - 1) * 50 * level().level : 0;
        var gained = base * level().level + bonus;
        score += gained;
        if (cleared >= 4) {
          quads += 1;
          unlock("yurtris-quad");
          [523, 659, 784, 1046].forEach(function (f, i) { beep(f, 100, "square", 0.05, i * 70); });
        } else {
          for (var i = 0; i < cleared; i++) beep(440 + i * 90, 70, "square", 0.04, i * 50);
        }
        unlock("first-line");
        if (combo >= 3) unlock("combo-streak");
        bumpCoach(3);
      } else combo = 0;
      if (score >= 5000) unlock("hall-of-fame");
      paintHud();
      if (score >= level().target) {
        finish(true, "Цель взята. Двор кивает.");
        return;
      }
      if (topped && !full.length) {
        finish(false, "Верхняя кромка закрыта.");
        return;
      }
      spawn();
    }
    function layout() {
      var w = wrap.clientWidth || 320;
      var h = wrap.clientHeight || 480;
      var dpr = Math.min(2, root.devicePixelRatio || 1);
      canvas.width = Math.max(2, Math.floor(w * dpr));
      canvas.height = Math.max(2, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function drawBlock(x, y, size, id, ghost) {
      var def = pieceBy(id);
      var pad = Math.max(1, size * 0.08);
      if (ghost) {
        ctx.strokeStyle = def.accent;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 2;
        roundRect(x + pad, y + pad, size - pad * 2, size - pad * 2, 4);
        ctx.stroke();
        ctx.globalAlpha = 1;
        return;
      }
      var g = ctx.createLinearGradient(x, y, x, y + size);
      g.addColorStop(0, def.light);
      g.addColorStop(0.45, def.accent);
      g.addColorStop(1, def.dark);
      roundRect(x + pad, y + pad, size - pad * 2, size - pad * 2, 5);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.35)";
      ctx.stroke();
      ctx.fillStyle = "rgba(20,12,4,.8)";
      ctx.font = "700 " + Math.max(8, Math.floor(size * 0.28)) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(def.badge, x + size / 2, y + size / 2 + 1);
    }
    function draw() {
      var box = layout();
      var w = box.w, h = box.h;
      ctx.fillStyle = "#07080c";
      ctx.fillRect(0, 0, w, h);
      var side = Math.min(108, Math.floor(w * 0.28));
      var cell = Math.floor(Math.min((w - side - 28) / COLS, (h - 16) / ROWS));
      if (cell < 8) cell = 8;
      var ox = 12;
      var oy = Math.max(8, Math.floor((h - cell * ROWS) / 2));
      ctx.fillStyle = "#12140f";
      roundRect(ox - 6, oy - 6, cell * COLS + 12, cell * ROWS + 12, 10);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2;
      ctx.stroke();
      var r, c;
      for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
        ctx.fillStyle = (r + c) % 2 ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.15)";
        ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
        if (board[r] && board[r][c]) drawBlock(ox + c * cell, oy + r * cell, cell, board[r][c], false);
      }
      if (active && phase === "play") {
        var gr = ghostRow();
        var mat = matrix(active.id, active.rot);
        for (r = 0; r < mat.length; r++) for (c = 0; c < mat[r].length; c++) if (mat[r][c]) {
          var br = gr + r;
          if (br >= 0) drawBlock(ox + (active.col + c) * cell, oy + br * cell, cell, active.id, true);
        }
        for (r = 0; r < mat.length; r++) for (c = 0; c < mat[r].length; c++) if (mat[r][c]) {
          br = active.row + r;
          if (br >= 0) drawBlock(ox + (active.col + c) * cell, oy + br * cell, cell, active.id, false);
        }
      }
      var nx = ox + cell * COLS + 16;
      ctx.fillStyle = "#e7c56a";
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("ДАЛЬШЕ", nx, oy);
      ctx.fillText(level().level + " · " + level().speed, nx, oy + 16);
      if (nextId) {
        var nm = matrix(nextId, 0);
        var ns = Math.max(10, Math.floor(side / 5));
        for (r = 0; r < nm.length; r++) for (c = 0; c < nm[r].length; c++) if (nm[r][c]) {
          drawBlock(nx + c * ns, oy + 36 + r * ns, ns, nextId, false);
        }
        ctx.fillStyle = "#9a958c";
        ctx.font = "12px sans-serif";
        ctx.fillText(pieceBy(nextId).name, nx, oy + 36 + nm.length * ns + 8);
      }
      var i, p;
      for (i = particles.length - 1; i >= 0; i--) {
        p = particles[i];
        p.life -= 0.016;
        p.vy += 180 * 0.016;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life * 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(ox + p.col * cell + p.vx * (0.4 - p.life), oy + p.row * cell + (0.4 - p.life) * p.vy, 4, 4);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "rgba(0,0,0,.12)";
      for (r = 0; r < h; r += 3) ctx.fillRect(0, r, w, 1);
    }
    function loop(t) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      var dt = Math.min(48, t - (lastT || t));
      lastT = t;
      if (phase === "play" && !paused && active) {
        dropAcc += dt;
        var step = level().drop;
        while (dropAcc >= step && phase === "play" && active) {
          dropAcc -= step;
          if (!hits(active.id, active.rot, active.col, active.row + 1)) active.row += 1;
          else { lock(); break; }
        }
      }
      if (phase === "play" || phase === "over" || phase === "win" || particles.length) draw();
    }
    function setPause(on) {
      if (phase !== "play") return;
      paused = !!on;
      if (!paused) lastT = performance.now();
      syncChrome();
      saveSnap();
    }
    pauseBtn.addEventListener("click", function () {
      if (phase === "play") setPause(!paused);
    });
    function bindHold(btn, fn, slow) {
      function stop() {
        if (holdTimer) { clearInterval(holdTimer); holdTimer = 0; }
      }
      btn.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        if (phase !== "play") return;
        fn();
        stop();
        holdTimer = setInterval(fn, slow ? 70 : 110);
      });
      btn.addEventListener("pointerup", stop);
      btn.addEventListener("pointercancel", stop);
      btn.addEventListener("pointerleave", stop);
    }
    var keyBtns = keys.querySelectorAll("button");
    var ki;
    for (ki = 0; ki < keyBtns.length; ki++) {
      (function (btn) {
        var kind = btn.getAttribute("data-yt");
        if (kind === "left") bindHold(btn, function () { shift(-1); draw(); });
        else if (kind === "right") bindHold(btn, function () { shift(1); draw(); });
        else if (kind === "soft") bindHold(btn, function () { soft(); draw(); }, true);
        else if (kind === "rot") btn.addEventListener("click", function () { rotate(); draw(); });
        else if (kind === "hard") btn.addEventListener("click", function () { hard(); draw(); });
      })(keyBtns[ki]);
    }
    canvas.addEventListener("pointerdown", function (e) {
      if (phase !== "play" || paused) return;
      pointer = { x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY, moved: false };
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!pointer || phase !== "play" || paused) return;
      var cellGuess = 28;
      var dx = e.clientX - pointer.x;
      var dy = e.clientY - pointer.y;
      if (Math.abs(e.clientX - pointer.ox) + Math.abs(e.clientY - pointer.oy) > 14) pointer.moved = true;
      while (dx <= -cellGuess) { shift(-1); pointer.x -= cellGuess; dx += cellGuess; }
      while (dx >= cellGuess) { shift(1); pointer.x += cellGuess; dx -= cellGuess; }
      while (dy >= cellGuess) { soft(); pointer.y += cellGuess; dy -= cellGuess; }
      draw();
    });
    function endPointer(e) {
      if (!pointer) return;
      var moved = pointer.moved;
      pointer = null;
      if (!moved && phase === "play" && !paused) { rotate(); draw(); }
    }
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", function () { pointer = null; });
    function onKey(e) {
      if (phase !== "play") return;
      var k = e.key;
      if (k === "ArrowLeft") { shift(-1); e.preventDefault(); }
      else if (k === "ArrowRight") { shift(1); e.preventDefault(); }
      else if (k === "ArrowDown") { soft(); e.preventDefault(); }
      else if (k === "ArrowUp" || k === "x" || k === "X") { rotate(); e.preventDefault(); }
      else if (k === " " || k === "Spacebar") { hard(); e.preventDefault(); }
      else if (k === "p" || k === "P" || k === "Escape") { setPause(!paused); e.preventDefault(); }
      draw();
    }
    root.addEventListener("keydown", onKey);
    function onVis() {
      if (document.hidden && phase === "play" && !paused) setPause(true);
    }
    document.addEventListener("visibilitychange", onVis);
    function onResize() { if (phase !== "menu") draw(); }
    root.addEventListener("resize", onResize);

    function gameBack() {
      if (sheet && !sheet.hidden) { closeSheet(); return true; }
      if (phase === "over" || phase === "win") { goMenu(); return true; }
      if (phase === "play" && !paused) { setPause(true); return true; }
      if (phase === "play" && paused) { goMenu(); return true; }
      return false;
    }
    root.__yurecPlayBack = gameBack;
    root.__ytSave = saveSnap;

    paintMenu();
    if (!readJson(TUT_KEY, false)) openAbout();
    raf = requestAnimationFrame(loop);

    return {
      destroy: function () {
        running = false;
        if (phase === "play") saveSnap();
        if (raf) cancelAnimationFrame(raf);
        if (holdTimer) clearInterval(holdTimer);
        if (root.__yurecPlayBack === gameBack) root.__yurecPlayBack = null;
        if (root.__ytSave === saveSnap) root.__ytSave = null;
        root.removeEventListener("keydown", onKey);
        root.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVis);
        try { if (audio) audio.close(); } catch (e) {}
      }
    };
  }

  root.YurecYt = { mount: mount };
})(window);
