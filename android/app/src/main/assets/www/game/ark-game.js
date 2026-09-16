/* Дворовый арканоид «Алконоид» — квартира, Олимпик, Максидом, двор, бабка-ящер */
(function (root) {
  "use strict";
  var W = 360;
  var H = 640;
  var COLS = 11;
  var GAP = 3;
  var BW = 27;
  var BH = 18;
  var OX = 16;
  var OY = 78;
  function fitGrid() {
    var pad = 16;
    BW = Math.max(20, Math.floor((W - pad * 2 - GAP * (COLS - 1)) / COLS));
    var used = COLS * BW + (COLS - 1) * GAP;
    OX = Math.floor((W - used) / 2);
  }
  fitGrid();
  var CHAIN = ["flat", "olimp", "maxi", "yard", "boss", "tolik", "pharm", "fsb", "batya", "kostya"];
  var NEXT_NAME = { flat: "Олимпик", olimp: "Максидом", maxi: "Двор", yard: "Бабка-ящер", boss: "Толик", tolik: "Аптека", pharm: "Тюрьма", fsb: "Батя", batya: "Костя" };
  var QUOTES = {
    flat: [
      "Я — бля, легенда!",
      "Купола сами выросли!",
      "Квартира сыпется — значит, живём!",
      "Я — бог Шотмана!",
      "Граната — мой талисман!",
      "Совок не умрёт, пока жив Юрец.",
      "Я один в трёшке!",
      "Кастян, я инвестирую в легенду!"
    ],
    olimp: [
      "Юра, вали отсюда, придурок!",
      "Фараон Олимпика? Ты никто.",
      "Линолеум тебя уволил.",
      "Смена закрыта. Ты — тем более.",
      "Юрец, ты чё, опять в говно?",
      "Гипсокартон сам на свалку.",
      "Шваброй махал — зарплату забудь.",
      "На следующей неделе тебя не возьмут."
    ],
    maxi: [
      "Юр, ну ты даёшь...",
      "Юр, я на кассе, не ори.",
      "Юр, я продаю дрели. Ты — сказки.",
      "Иди за шваброй, а не за водкой.",
      "Ещё один звонок — и портрет в бак.",
      "Юрец, опять ты? Что на этот раз?",
      "Если это любовь — лучше инвентаризация.",
      "Юр, я овощи не продаю. И тебя тоже."
    ],
    yard: [
      "Юрец, алкаш наш любимый!",
      "Водку изъяли. Для науки.",
      "Луна близко. Шотмана ближе.",
      "НЛО — свои с Луны!",
      "Мы не похищаем. Мы дегустируем.",
      "Квартира под наблюдением. Особенно бачок.",
      "Обратный рейс: кончилась «Путинка».",
      "Паранойя — это протокол."
    ],
    boss: [
      "Юрец, алкаш, открой!",
      "В бак ссышь, водку хлещешь!",
      "Юрец, ещё раз в бак — вызову СЭС!",
      "Ящер я или нет — цветы мои!",
      "Половник — это антенна.",
      "Стена тонкая, сынок. Я всё знаю.",
      "ЖЭК меня боится. Ты — пока нет.",
      "Юрец, алкаш, заткнись!"
    ],
    tolik: [
      "О, Юрец, легенда Шотмана!",
      "Юрец, бог водки!",
      "Путинка в долг — инвестиция в легенду.",
      "Касса плачет, когда тебя нет.",
      "Очередь не резиновая, для тебя — растянем.",
      "Шпроты даром, репутация — в кредит.",
      "Жму руку, как спонсору.",
      "Путинка в рассрочку — наш нацпроект."
    ],
    pharm: [
      "Приятного дня!",
      "Без рецепта — на выход.",
      "Мужчина, вам точно это надо?",
      "Нет, спасибо, я занята.",
      "Опять он? И опять этот запах!",
      "Псих, точно псих.",
      "Лишь бы не вернулся — обои отклеятся!",
      "Спасибо, мужчина, но зачем?"
    ],
    fsb: [
      "Не сажайте, я хотел шаверму!",
      "Купола сами выросли!",
      "Менты у ног — обычный вторник.",
      "Корочка ФСБ — не проездной.",
      "Граната — мой талисман.",
      "Камера смотрит. Юрец орёт.",
      "Подписка о невыезде. И без тротила.",
      "РЕВЭЛ с нарами не спорит."
    ],
    batya: [
      "Сынок, ты дебил!",
      "Подписка о невыезде. И без тротила.",
      "Корочка не резиновая.",
      "Ещё одна граната — посажу сам.",
      "В мусарню больше не приеду такси.",
      "Я тебя родился спасать. Устал.",
      "Корочка ФСБ — не проездной на пьянки.",
      "Сынок, ФСБ увольняет. Соседи — нет."
    ],
    kostya: [
      "Юрец, ты легенда!",
      "Юр, ты опять литр водки выжрал?",
      "Не вздумай.",
      "Юра, я в офисе. Ты в баке.",
      "Юра, я икру ем. Ты — тушёнку.",
      "Ещё одно SMS про РЕВЭЛ — сменю номер.",
      "BMW знает дорогу на Шотмана.",
      "Glenfiddich 18 — тебе. Разум — себе."
    ]
  };
  var CAP_META = {
    glue: { name: "КЛЕЙ", fill: "#7ec8e3", dur: 60 },
    fast: { name: "ГАЗ", fill: "#ff6b4a", dur: 0 },
    slow: { name: "ТОРМОЗ", fill: "#8b5cff", dur: 0 },
    fly: { name: "ТОРПЕДА", fill: "#c9a227", dur: 10 },
    split: { name: "ДВОЙНЯ", fill: "#e08a2c", dur: 0 },
    grow: { name: "КАБАН", fill: "#c46a3a", dur: 0 },
    shrink: { name: "КАРЛИК", fill: "#6a9a52", dur: 0 },
    life: { name: "ЖИЗНЬ", fill: "#c43b6e", dur: 0 },
    laser: { name: "ЛАЗЕР", fill: "#ff2a6a", dur: 0 },
    through: { name: "ОГОНЬ", fill: "#ff3b1f", dur: 8 },
    bomb: { name: "ГРАНАТА", fill: "#5a7a3a", dur: 0 },
    vodka: { name: "ВОДКА", fill: "#d4c48a", dur: 15 },
    triple: { name: "ТРОЙНЯ", fill: "#ff9a3a", dur: 0 },
    foil: { name: "ФОЛЬГА", fill: "#c8c8d0", dur: 6 },
    clean: { name: "ДОБИТЬ", fill: "#ffe14a", dur: 0 }
  };
  var CAP_GOOD = ["slow", "grow", "life", "laser", "through", "vodka", "foil"];
  var CAP_BAD = ["fast", "shrink", "glue", "split"];
  var CAP_KEYS = Object.keys(CAP_META);
  var LEVELS = {
    flat: {
      id: "flat",
      label: "Квартира на Шотмана",
      sub: "стены сыплются вместе с совком",
      bg: ["#2a1c14", "#5a3a28", "#c46a3a"],
      speed: 310,
      lives: 3,
      paddleW: 108,
      cap: 1.32,
      skin: "flat",
      face: "yurec",
      rows: [
        "###########",
        "22222222222",
        "##3311133##",
        "#2.22222.2#",
        "##3311133##",
        "2222...2222",
        "..1111111.."
      ]
    },
    olimp: {
      id: "olimp",
      label: "Олимпик",
      sub: "отделы строймага Лысого",
      bg: ["#241c08", "#6a5210", "#e8c36a"],
      speed: 335,
      lives: 3,
      paddleW: 102,
      cap: 1.36,
      skin: "olimp",
      face: "lysy",
      rows: [
        "33333333333",
        ".2G2G2G2G2.",
        "22222222222",
        "G.........G",
        "333.....333",
        "2222...2222",
        ".2.2.2.2.2."
      ]
    },
    maxi: {
      id: "maxi",
      label: "Максидом",
      sub: "отдел Светланы — добраться до неё",
      bg: ["#2a0818", "#7a2048", "#ff7ab0"],
      speed: 355,
      lives: 3,
      paddleW: 98,
      cap: 1.4,
      skin: "maxi",
      face: "svetlana",
      rows: [
        "GG.......GG",
        "G333333333G",
        "G322222223G",
        "G3.21112.3G",
        "G322222223G",
        "G333333333G",
        "GG.2.2.2.GG"
      ]
    },
    yard: {
      id: "yard",
      label: "Двор на Шотмана",
      sub: "сбей НЛО Зинаиды. Помойки золотые. Яйца лови.",
      bg: ["#0a1020", "#243060", "#7ec8e3"],
      speed: 385,
      lives: 3,
      paddleW: 94,
      cap: 1.45,
      skin: "yard",
      face: "zinaida",
      rows: [
        "GG.......GG",
        "GG.22222.GG",
        "G..33333..G",
        "G.2.....2.G",
        "G222...222G",
        "..3333333..",
        ".2.2.2.2.2."
      ]
    },
    boss: {
      id: "boss",
      label: "Бабка-ящер",
      sub: "бей в морду. Панцирь отрастает. Яйца — минус жизнь.",
      bg: ["#102010", "#2a4a18", "#8fba5a"],
      speed: 410,
      lives: 0,
      paddleW: 90,
      cap: 1.5,
      skin: "boss",
      face: "zinaida",
      rows: [
        "SSS.....SSS",
        "S.........S",
        "..222.222..",
        "...3...3...",
        "S.2.....2.S",
        "..S.....S.."
      ]
    },
    tolik: {
      id: "tolik",
      label: "Толик и алкаха",
      sub: "выбей все бутылки. Толик смотрит, не наливает.",
      bg: ["#241808", "#5a3a10", "#c9a227"],
      speed: 370,
      lives: 3,
      paddleW: 96,
      cap: 1.42,
      skin: "tolik",
      face: "tolik",
      rows: [
        "33333333333",
        "2.2.2.2.2.2",
        "22222222222",
        "...33333...",
        "2.2.2.2.2.2",
        "1111.1111.."
      ]
    },
    pharm: {
      id: "pharm",
      label: "Аптечная любовь",
      sub: "Людмила Ивановна. Кубы — таблетки. Приятного дня.",
      bg: ["#201018", "#6a2040", "#ff9ac8"],
      speed: 380,
      lives: 3,
      paddleW: 96,
      cap: 1.42,
      skin: "pharm",
      face: "lyudmila",
      rows: [
        "22222222222",
        "3.3.3.3.3.3",
        "11111111111",
        "G.........G",
        "222.333.222",
        "..1111111.."
      ]
    },
    fsb: {
      id: "fsb",
      label: "Камера ФСБ",
      sub: "купола. Выбей стены камеры. Мечтай о гранатах.",
      bg: ["#12141a", "#2a3040", "#8a909a"],
      speed: 395,
      lives: 3,
      paddleW: 94,
      cap: 1.45,
      skin: "fsb",
      face: "yurec",
      rows: [
        "G.G.G.G.G.G",
        "33333333333",
        "G222222222G",
        "G.........G",
        "G222222222G",
        "333.....333"
      ]
    },
    batya: {
      id: "batya",
      label: "Батя с дробовиком",
      sub: "босс. Дробь пачками, пауза 2–4 с. Не поймай телом.",
      bg: ["#1a1208", "#4a2810", "#c46a3a"],
      speed: 405,
      lives: 0,
      paddleW: 92,
      cap: 1.48,
      skin: "batya",
      face: "batya",
      rows: [
        "GGG.....GGG",
        "..222.222..",
        "S.........S",
        "...3...3...",
        "..2.....2.."
      ]
    },
    kostya: {
      id: "kostya",
      label: "Костя против Юрца",
      sub: "перевёртыш. Ты — Костя-читер. Юрец орёт, двор прикрывает. Тщетно.",
      bg: ["#081018", "#1a3050", "#7ec8e3"],
      speed: 360,
      lives: 0,
      paddleW: 110,
      cap: 1.35,
      skin: "kostya",
      face: "yurec",
      paddleFace: "kostya",
      invert: true,
      rows: [
        "22222222222",
        ".3.3.3.3.3.",
        "11.11111.11",
        "....333....",
        ".2.2.2.2.2."
      ]
    }
  };

  function pillRow(col, name, text) {
    return '<div class="av-man-pill"><i style="background:' + col + '"></i><div><b>' + name + "</b><span>" + text + "</span></div></div>";
  }
  function lvlRow(n, name, text) {
    return '<div class="av-man-lvl"><b>' + n + ". " + name + "</b><span>" + text + "</span></div>";
  }
  var MANUAL_HTML =
    '<button type="button" class="av-manual-close">Закрыть</button>' +
    '<p class="av-dos">C:\\SHOTMAN> ark</p>' +
    "<h3>Методичка двора</h3>" +
    '<p class="av-lead">Как устроен Алконоид Шотмана. Дальше спойлеры. Двор предупредил.</p>' +
    '<p class="av-man-h">Как это работает</p>' +
    '<p class="av-man-p">Ты снизу — узкая ракетка с мордой Юрца. Шарик сверху. Подставь ракетку, не дай упасть. Кирпич сыплется от удара. Все кирпичи уровня — дверь скрипнула.</p>' +
    '<p class="av-man-p">Жизни — запас ракеток. На боссе новых не дают: сколько принёс, столько и воюешь. Нижнее меню на время игры снимается. Звук и вибрация — в Настройках, раздел «Мультимедиа», на всё приложение.</p>' +
    '<p class="av-man-h">Как играть</p>' +
    '<ul class="av-man-tips">' +
      "<li>Палец водит ракетку. Подача — тычок по корту.</li>" +
      "<li>Бей центром — угол спокойный. Кромкой — шарик улетает в бок, как с балкона.</li>" +
      "<li>Капсулы падают из кирпичей. Лови ракеткой. Пропустил — сам виноват.</li>" +
      "<li>Золотые кирпичи голыми руками не берутся. Лазер берёт.</li>" +
      "<li>После победы — зелёная «Следующий уровень». «Сыграть ещё раз» — тот же двор.</li>" +
      "<li>Пять тычков подряд по слову «Алконоид» сверху — щит из водки на 15 секунд.</li>" +
    "</ul>" +
    '<p class="av-man-h">Капсулы</p>' +
    pillRow("#7ec8e3", "Клей · 60 с", "Шарик липнет к ракетке. Кидай, когда готов. Высох — сам улетел.") +
    pillRow("#ff6b4a", "Газ · сейчас", "Шарик звереет. Двор орёт.") +
    pillRow("#8b5cff", "Тормоз · сейчас", "Шарик тупеет. Передышка.") +
    pillRow("#c9a227", "Торпеда · 10 с", "Ракетка летает вверх-вниз. Юрец думает, что это НЛО.") +
    pillRow("#e08a2c", "Двойня · сейчас", "Два шарика. Хаос, как помойка.") +
    pillRow("#c46a3a", "Кабан · сейчас", "Ракетка шире.") +
    pillRow("#6a9a52", "Карлик · сейчас", "Ракетка уже. Лови кромкой, плачь.") +
    pillRow("#c43b6e", "Жизнь · сейчас", "Плюс одна ракетка в запасе.") +
    pillRow("#ff3b1f", "Огонь · 8 с", "Шарик прожигает кирпичи насквозь.") +
    pillRow("#5a7a3a", "Граната · сейчас", "Сносит весь ряд, куда попала.") +
    pillRow("#d4c48a", "Водка · 15 с", "Щит: мяч не падает, дробь и яйца не берут. Стена из «Столичной».") +
    pillRow("#ff9a3a", "Тройня · сейчас", "Три шарика. Двор орёт.") +
    pillRow("#c8c8d0", "Фольга · 6 с", "Враги встают колом.") +
    pillRow("#ffe14a", "Добить · сейчас", "Падает с неба, когда осталось мало кирпичей. Лови — доест остаток. Золото не берёт.") +
    '<p class="av-man-p">Золотые стойки не ломаются. Это рикошет. Палочки на кирпиче — сколько ударов осталось.</p>' +
    '<p class="av-man-p">Подача: пунктир — куда полетит. Ракетка слева — бьёт влево-вверх, справа — вправо. Без рандома. Кромкой отбиваешь — угол такой же, как нарисован.</p>' +
    '<p class="av-man-p">Осталось 3 кирпича — каждые 20 секунд с неба плюшка. Два — 15 секунд. Один — 10. Двор не даёт мурыжить вечность.</p>' +
    '<p class="av-man-h">Десять уровней · спойлеры</p>' +
    lvlRow("1", "Квартира", "Стены комнат. Шарик уже злой.") +
    lvlRow("2", "Олимпик", "Полки оранжевые и жёлтые — бьются. Золотые стойки Лысого — нет.") +
    lvlRow("3", "Максидом", "Клетка Светки из золота. Враги сбивают угол.") +
    lvlRow("4", "Двор", "Цель — НЛО Зинаиды. Яйца лови. Помойки золотые.") +
    lvlRow("5", "Бабка-ящер", "Бей В МОРДУ. Панцирь отрастает. Яйца — минус жизнь.") +
    lvlRow("6", "Толик", "Бутылки. Выбей алкаху. Водка падает чаще.") +
    lvlRow("7", "Аптека", "Людмила Ивановна. Таблетки. Приятного дня — и в морду кубом.") +
    lvlRow("8", "Тюрьма ФСБ", "Прутья золотые. Стены серые. Гранаты — мечта камеры.") +
    lvlRow("9", "Батя", "Босс. Дробовик раз в 2–4 секунды, каждый залп 2–5 дробин. Поймал телом — минус жизнь. Бей батю в морду. Водка спасает.") +
    lvlRow("10", "Костя", "Перевёртыш. Снизу Костя-читер, сверху Юрец швыряет бутылки. Через 30 с — Лысый, ещё через 30 — НЛО с Зинаидой. Когда Юрец почти сдох — Батя с дробовиком. Против Кости нет приёма.") +
    '<p class="av-man-foot">Методичка врёт меньше, чем Юрец. Дальше — сам.</p>';

  function clamp(n, a, b) { return n < a ? a : n > b ? b : n; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pickQuote(id) {
    var list = QUOTES[id] || QUOTES.flat;
    return pick(list);
  }
  function capDurLabel(kind) {
    var m = CAP_META[kind];
    if (!m) return "сейчас";
    if (m.dur) return m.dur + " с";
    if (kind === "laser") return "1 заряд";
    if (kind === "life") return "+1";
    if (kind === "bomb") return "ряд";
    if (kind === "clean") return "остаток";
    if (kind === "split" || kind === "triple") return "шары";
    if (kind === "grow" || kind === "shrink") return "ракетка";
    return "сейчас";
  }

  function loadImg(src) {
    return new Promise(function (res) {
      if (!src) return res(null);
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
  }

  function mount(host, opts) {
    opts = opts || {};
    var FACE = {
      yurec: opts.yurec || "/characters/yurec.jpg",
      lysy: opts.lysy || "/characters/lysy.jpg",
      zinaida: opts.zinaida || "/characters/zinaida.jpg",
      svetlana: opts.svetlana || "/characters/svetlana.jpg",
      tolik: opts.tolik || "/characters/tolik.jpg",
      lyudmila: opts.lyudmila || "/characters/lyudmila.jpg",
      batya: opts.batya || "/characters/batya.jpg",
      kostya: opts.kostya || "/characters/kostya.jpg"
    };
    host.innerHTML = "";
    host.classList.add("av-shell");
    try {
      document.documentElement.classList.add("av-nodock");
      document.body.classList.add("av-nodock");
    } catch (e) {}

    var head = document.createElement("div");
    head.className = "av-head";
    head.innerHTML = '<button type="button" class="av-title">Алконоид</button>';
    var titleTaps = 0;
    var titleTapAt = 0;
    var pendingVodka = false;

    var wrap = document.createElement("div");
    wrap.className = "av-stage";
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Алконоид");
    wrap.appendChild(canvas);

    var hud = document.createElement("div");
    hud.className = "av-hud ark-hud";
    hud.innerHTML = '<span class="av-score av-score-z">R1</span><span class="av-score av-score-y">×3</span>';

    var shotBtn = document.createElement("button");
    shotBtn.type = "button";
    shotBtn.className = "av-shot av-shot-laser";
    shotBtn.hidden = true;
    shotBtn.textContent = "ЛАЗЕР";

    var kitEl = document.createElement("div");
    kitEl.className = "av-gods ark-kit";
    kitEl.hidden = true;
    var KIT = [
      { kind: "laser", name: "ЛАЗЕР" },
      { kind: "bomb", name: "ГРАНАТА" },
      { kind: "clean", name: "ДОБИТЬ" },
      { kind: "through", name: "ОГОНЬ" },
      { kind: "triple", name: "ТРОЙНЯ" },
      { kind: "grow", name: "КАБАН" },
      { kind: "life", name: "ЖИЗНЬ" },
      { kind: "glue", name: "КЛЕЙ" },
      { kind: "vodka", name: "ВОДКА" },
      { kind: "foil", name: "ФОЛЬГА" },
      { kind: "split", name: "ДВОЙНЯ" },
      { kind: "fast", name: "ГАЗ" }
    ];
    KIT.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "av-god";
      b.textContent = k.name;
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        unlockAudio();
        if (phase !== "play" && phase !== "serve") return;
        if (k.kind === "laser") { laserShots += 1; fireLaser(); paintHud(); }
        else catchCap(k.kind);
      });
      kitEl.appendChild(b);
    });

    var menu = document.createElement("div");
    menu.className = "av-menu";
    menu.innerHTML =
      '<p class="av-dos">C:\\SHOTMAN> ark</p>' +
      '<p class="av-lead">Харя Юрца — ракетка. Десять дворов: от квартиры до Кости в зеркале. Автомат 80-х, но двор подбрасывает плюшки, если осталось мало.</p>' +
      '<p class="av-sheet"></p>' +
      '<div class="av-diffs"></div>' +
      '<div class="av-help-rule" role="separator"><span>Помощь</span></div>' +
      '<button type="button" class="av-info">Информация</button>' +
      '<div class="av-help-rule" role="separator"><span>служебный вход</span></div>' +
      '<button type="button" class="av-cheat-btn">Чит-код</button>' +
      '<button type="button" class="av-reset">Сбросить прогресс</button>' +
      '<div class="av-confirm" hidden><p>Снести весь прогресс? Победы, рекорды и открытые уровни сгорят.</p><div class="av-confirm-row"><button type="button" class="av-confirm-no">Оставить</button><button type="button" class="av-confirm-yes">Снести</button></div></div>' +
      '<p class="av-cheat-msg" hidden></p>';

    var end = document.createElement("div");
    end.className = "av-end";
    end.hidden = true;

    var manual = document.createElement("div");
    manual.className = "av-manual";
    manual.hidden = true;
    manual.innerHTML = MANUAL_HTML;

    var cheatModal = document.createElement("div");
    cheatModal.className = "av-cheat-modal";
    cheatModal.hidden = true;
    cheatModal.innerHTML =
      '<form class="av-cheat-box" role="dialog" aria-modal="true" aria-labelledby="ark-cheat-title">' +
        '<p id="ark-cheat-title">Чит-код: введите слово</p>' +
        '<input class="av-cheat-in" type="text" placeholder="код" autocomplete="off" />' +
        '<p class="av-cheat-hint">Кирпичи не берутся? Можно схитрить. Гоша смотрит, но молчит.</p>' +
        '<div class="av-cheat-actions"><button type="button" class="av-cheat-cancel">Отмена</button><button type="submit" class="av-cheat-go">Открыть</button></div>' +
      "</form>";

    wrap.appendChild(hud);
    wrap.appendChild(menu);
    wrap.appendChild(end);
    wrap.appendChild(manual);
    wrap.appendChild(cheatModal);
    host.appendChild(head);
    host.appendChild(wrap);
    host.appendChild(shotBtn);
    host.appendChild(kitEl);

    var diffsEl = menu.querySelector(".av-diffs");
    var cheatBtn = menu.querySelector(".av-cheat-btn");
    var cheatForm = cheatModal.querySelector(".av-cheat-box");
    var cheatIn = cheatModal.querySelector(".av-cheat-in");
    var cheatMsg = menu.querySelector(".av-cheat-msg");
    var resetBtn = menu.querySelector(".av-reset");
    var confirmEl = menu.querySelector(".av-confirm");
    var sheetEl = menu.querySelector(".av-sheet");
    var infoBtn = menu.querySelector(".av-info");

    function winsMap() {
      try { return JSON.parse(localStorage.getItem("yurec-ark-wins") || "{}"); } catch (e) { return {}; }
    }
    function statsMap() {
      try { return JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}"); } catch (e) { return {}; }
    }
    function allOn() {
      try { return localStorage.getItem("yurec-ark-all") === "1"; } catch (e) { return false; }
    }
    function emptyRow() { return { w: 0, l: 0, best: null }; }
    function fmtTime(ms) {
      if (ms == null) return "";
      var s = Math.round(ms / 1000);
      var m = Math.floor(s / 60);
      s = s % 60;
      return m + ":" + (s < 10 ? "0" : "") + s;
    }
    function isOpen(id) {
      if (allOn()) return true;
      var idx = CHAIN.indexOf(id);
      if (idx <= 0) return true;
      var w = winsMap();
      return (w[CHAIN[idx - 1]] || 0) > 0;
    }
    function unlockAll() {
      try { localStorage.setItem("yurec-ark-all", "1"); } catch (e) {}
    }
    function paintSheet() {
      var w = winsMap();
      var n = 0, i;
      for (i = 0; i < CHAIN.length; i++) if ((w[CHAIN[i]] || 0) > 0) n += 1;
      sheetEl.innerHTML = "<b>разбито " + n + " / " + CHAIN.length + "</b>";
    }
    function paintDiffs() {
      diffsEl.innerHTML = "";
      var stats = statsMap();
      CHAIN.forEach(function (id) {
        var d = LEVELS[id];
        var open = isOpen(id);
        var b = document.createElement("button");
        b.type = "button";
        b.className = "av-diff" + (open ? "" : " locked");
        b.disabled = !open;
        var row = stats[id] || emptyRow();
        var sub;
        if (!open) sub = "закрыто · сначала предыдущий";
        else if (row.w || row.l) sub = "выиграл " + row.w + " · проиграл " + row.l + (row.best != null ? " · " + fmtTime(row.best) : "");
        else sub = d.sub;
        b.innerHTML = '<span class="av-diff-txt"><b>' + d.label + "</b><span>" + sub + "</span></span>";
        if (open) b.addEventListener("click", function () { startLevel(id); });
        diffsEl.appendChild(b);
      });
      paintSheet();
    }
    paintDiffs();

    function tapAlkonoid() {
      var now = Date.now();
      if (now - titleTapAt > 4000) titleTaps = 0;
      titleTapAt = now;
      titleTaps += 1;
      if (titleTaps < 5) return;
      titleTaps = 0;
      unlockAudio();
      if (phase === "play" || phase === "serve") {
        catchCap("vodka");
      } else {
        pendingVodka = true;
        cheatMsg.hidden = false;
        cheatMsg.textContent = "Чит: водка на 15 секунд. Зайди в уровень — щит сам встанет.";
        say("Чит: водка. Щит 15 секунд.");
        beep(880, 0.12, 0.05);
      }
    }
    head.querySelector(".av-title").addEventListener("click", tapAlkonoid);

    infoBtn.addEventListener("click", function () {
      confirmEl.hidden = true;
      cheatMsg.hidden = true;
      cheatModal.hidden = true;
      manual.hidden = false;
      try { manual.scrollTop = 0; } catch (e) {}
    });
    manual.querySelector(".av-manual-close").addEventListener("click", function () { manual.hidden = true; });
    cheatBtn.addEventListener("click", function () {
      confirmEl.hidden = true;
      manual.hidden = true;
      cheatMsg.hidden = true;
      cheatModal.hidden = false;
      cheatIn.value = "";
      try { cheatIn.focus(); } catch (e) {}
    });
    cheatModal.querySelector(".av-cheat-cancel").addEventListener("click", function () { cheatModal.hidden = true; });
    cheatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = String(cheatIn.value || "").trim().toLowerCase().replace(/ё/g, "е");
      cheatMsg.hidden = false;
      if (window.YurecGate && window.YurecGate.cheat(v)) {
        unlockAll();
        paintDiffs();
        cheatModal.hidden = true;
        cheatMsg.textContent = "Все уровни открыты. Даже бабка вышла из бака.";
        cheatIn.value = "";
      } else if (window.YurecGate && window.YurecGate.life(v)) {
        lives += 2;
        cheatModal.hidden = true;
        cheatMsg.textContent = "Плюс две ракетки. Юрец не тонет.";
        cheatIn.value = "";
        paintHud();
      } else {
        var hint = cheatModal.querySelector(".av-cheat-hint");
        if (hint) hint.textContent = "Не тот код. Гоша смотрит.";
        cheatMsg.textContent = "Не тот код. Гоша смотрит.";
      }
    });
    resetBtn.addEventListener("click", function () {
      confirmEl.hidden = false;
      cheatMsg.hidden = true;
      try { confirmEl.scrollIntoView({ block: "nearest" }); } catch (e) {}
    });
    confirmEl.querySelector(".av-confirm-no").addEventListener("click", function () { confirmEl.hidden = true; });
    confirmEl.querySelector(".av-confirm-yes").addEventListener("click", function () {
      try {
        localStorage.removeItem("yurec-ark-wins");
        localStorage.removeItem("yurec-ark-stats");
        localStorage.removeItem("yurec-ark-all");
      } catch (e) {}
      try { window.dispatchEvent(new Event("yurec-ark-wins")); } catch (e2) {}
      confirmEl.hidden = true;
      paintDiffs();
      cheatMsg.hidden = false;
      cheatMsg.textContent = "Прогресс снесён. Двор забыл.";
      beep(90, 0.14, 0.05);
      try { window.dispatchEvent(new Event("yurec-rain")); } catch (e) {}
    });

    var ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) || canvas.getContext("2d");
      try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; } catch (e) {}
    var imgs = { yurec: null, lysy: null, zinaida: null, svetlana: null, tolik: null, lyudmila: null, batya: null, kostya: null };
    Promise.all([
      loadImg(FACE.yurec), loadImg(FACE.lysy), loadImg(FACE.zinaida), loadImg(FACE.svetlana),
      loadImg(FACE.tolik), loadImg(FACE.lyudmila), loadImg(FACE.batya), loadImg(FACE.kostya)
    ]).then(function (arr) {
      imgs.yurec = arr[0]; imgs.lysy = arr[1]; imgs.zinaida = arr[2]; imgs.svetlana = arr[3];
      imgs.tolik = arr[4]; imgs.lyudmila = arr[5]; imgs.batya = arr[6]; imgs.kostya = arr[7];
    });

    var dpr = 1, lastCssW = 0, lastCssH = 0, lastDpr = 0;
    var raf = 0, running = true, phase = "menu";
    var levelId = "flat", cfg = LEVELS.flat;
    var last = 0, acc = 0;
    var paddle = { x: W / 2, y: H - 62, w: 118, h: 56, fly: 0 };
    var balls = [];
    var bricks = [];
    var caps = [];
    var enemies = [];
    var lasers = [];
    var particles = [];
    var lives = 3;
    var score = 0;
    var laserShots = 0;
    var glue = false;
    var glueT = 0;
    var fireball = 0;
    var freeze = 0;
    var vodkaT = 0;
    var magnet = 0;
    var facePop = 0;
    var facePopX = W / 2;
    var facePopY = H * 0.38;
    var serveStuck = true;
    var banner = "", bannerT = 0;
    var matchAt = 0;
    var boss = null;
    var helpers = [];
    var helpFlags = { lysy: false, ufo: false, batya: false };
    var rainT = 0;
    var rainN = -1;
    var goldTold = false;
    var pointerX = W / 2;
    var pointerY = H - 46;
    var keys = { l: false, r: false, u: false, d: false };
    var audioCtx = null;
    var reduced = false;
    try { reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}

    function layout() {
      var rect = wrap.getBoundingClientRect();
      var cssW = Math.max(1, rect.width);
      var cssH = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cssW === lastCssW && cssH === lastCssH && dpr === lastDpr) return;
      lastCssW = cssW; lastCssH = cssH; lastDpr = dpr;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      ctx.setTransform(dpr * (cssW / W), 0, 0, dpr * (cssH / H), 0, 0);
      fitGrid();
    }

    function beep(freq, dur, gain) {
      try {
        if (!soundOn()) return;
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") audioCtx.resume();
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = "square";
        o.frequency.value = freq;
        g.gain.value = gain || 0.04;
        o.connect(g); g.connect(audioCtx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.08));
        o.stop(audioCtx.currentTime + (dur || 0.08) + 0.02);
      } catch (err) {}
    }
    var lastBuzz = 0;
    function vibeOn() { try { return localStorage.getItem("yurec-vibrate") !== "0"; } catch (e) { return true; } }
    function soundOn() { try { return localStorage.getItem("yurec-sound") !== "0"; } catch (e) { return true; } }
    function buzz(pat, force) {
      if (!vibeOn()) return;
      var now = Date.now();
      if (!force && now - lastBuzz < 80) return;
      lastBuzz = now;
      var spec = typeof pat === "number" ? String(pat) : (pat && pat.join ? pat.join(",") : "45");
      try { if (typeof window.__avBuzz === "function") window.__avBuzz(pat); } catch (e) {}
      try { var native = window.YurecNative; if (native && typeof native.buzz === "function") native.buzz(spec); } catch (e) {}
      try { if (navigator.vibrate) navigator.vibrate(pat); } catch (e) {}
    }
    function unlockAudio() {
      if (audioCtx) return;
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    function say(text, hold) { banner = text; bannerT = hold == null ? 2.4 : hold; }
    function paintHud() {
      hud.querySelector(".av-score-z").textContent = "R" + (CHAIN.indexOf(levelId) + 1);
      hud.querySelector(".av-score-y").textContent = "";
      shotBtn.hidden = !(laserShots > 0 && (phase === "play" || phase === "serve") && levelId !== "kostya");
      shotBtn.textContent = laserShots > 1 ? ("ЛАЗЕР ×" + laserShots) : "ЛАЗЕР";
    }
    function addPart(x, y, col, n) {
      var i;
      for (i = 0; i < (n || 6); i++) {
        particles.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 180,
          vy: (Math.random() - 0.8) * 180,
          t: 0, col: col, r: 2 + Math.random() * 3
        });
      }
    }
    function makeBall(x, y, vx, vy) {
      return { x: x, y: y, vx: vx, vy: vy, r: 11, stuck: false, trail: [] };
    }
    function buildBricks(rows) {
      bricks = [];
      var r, c, ch, hp, gold, ufo;
      for (r = 0; r < rows.length; r++) {
        for (c = 0; c < COLS; c++) {
          ch = rows[r].charAt(c) || ".";
          if (ch === "." || ch === " ") continue;
          gold = ch === "G";
          ufo = ch === "U";
          var shell = ch === "S";
          hp = gold ? 99 : (ch === "3" ? 3 : ch === "2" ? 2 : 1);
          if (ufo) hp = 4;
          if (shell) hp = 2;
          bricks.push({
            c: c, r: r,
            x: OX + c * (BW + GAP),
            y: OY + r * (BH + GAP),
            w: BW, h: BH,
            hp: hp, max: hp, gold: gold, ufo: ufo, shell: shell, alive: true
          });
        }
      }
    }
    function breakableLeft() {
      var n = 0, i;
      for (i = 0; i < bricks.length; i++) if (bricks[i].alive && !bricks[i].gold) n += 1;
      return n;
    }
    function serveDir() {
      var dx = clamp((paddle.x - W / 2) / (W * 0.38), -1, 1);
      var maxAng = Math.PI * 0.32;
      var ang = dx * maxAng;
      return { vx: Math.sin(ang), vy: -Math.cos(ang), ang: ang };
    }
    function resetServe() {
      serveStuck = true;
      balls = [makeBall(paddle.x, paddle.y - 16, 0, 0)];
      balls[0].stuck = true;
      phase = "serve";
      paintHud();
    }
    function launch() {
      if (phase !== "serve" && !balls.some(function (b) { return b.stuck; })) return;
      var i, b, d = serveDir();
      var spd = cfg.speed;
      for (i = 0; i < balls.length; i++) {
        b = balls[i];
        if (!b.stuck) continue;
        b.stuck = false;
        b.vx = d.vx * spd;
        b.vy = d.vy * spd;
      }
      serveStuck = false;
      phase = "play";
      beep(520, 0.08, 0.05);
    }

    function startLevel(id) {
      unlockAudio();
      levelId = id;
      cfg = LEVELS[id];
      lives = (id === "boss" || id === "batya" || id === "kostya") ? Math.max(1, lives || 3) : (cfg.lives || 3);
      if ((id === "boss" || id === "batya" || id === "kostya") && lives < 1) lives = 3;
      score = score || 0;
      laserShots = 0;
      glue = false;
      glueT = 0;
      fireball = 0;
      freeze = 0;
      vodkaT = pendingVodka ? 15 : 0;
      pendingVodka = false;
      facePop = 0;
      rainT = 0;
      rainN = -1;
      goldTold = false;
      paddle.w = cfg.paddleW || 88;
      paddle.h = 48;
      paddle.y = H - 58;
      paddle.fly = 0;
      paddle.x = W / 2;
      caps = [];
      enemies = [];
      lasers = [];
      particles = [];
      helpers = [];
      helpFlags = { lysy: false, ufo: false, batya: false };
      boss = null;
      buildBricks(cfg.rows);
      if (id === "maxi") {
        enemies.push({ x: 80, y: 300, vx: 70, r: 12, kind: "bat" });
        enemies.push({ x: 260, y: 340, vx: -80, r: 12, kind: "bat" });
      }
      if (id === "yard") {
        boss = { x: W / 2, y: 50, vx: 130, r: 28, hp: 12, max: 12, t: 0, kind: "ufo", spit: 1.8 };
      }
      if (id === "boss") {
        boss = { x: W / 2, y: 62, vx: 150, r: 36, hp: 22, max: 22, t: 0, kind: "lizard", spit: 2.0, regen: 0 };
      }
      if (id === "batya") {
        boss = { x: W / 2, y: 58, vx: 155, r: 34, hp: 26, max: 26, t: 0, kind: "batya", spit: randInt(2, 4) };
      }
      if (id === "kostya") {
        boss = { x: W / 2, y: 56, vx: 110, r: 36, hp: 16, max: 16, t: 0, kind: "yurec", spit: 2.2 + Math.random() * 1.2 };
      }
      kitEl.hidden = id !== "kostya";
      matchAt = Date.now();
      menu.hidden = true;
      end.hidden = true;
      manual.hidden = true;
      cheatModal.hidden = true;
      hud.hidden = false;
      resetServe();
      if (vodkaT > 0) say("ВОДКА! Щит " + Math.round(vodkaT) + " с. Мяч не падает.", 3.2);
      else say(cfg.label);
      if (!raf) loop(0);
    }

    function saveWin() {
      try {
        var raw = JSON.parse(localStorage.getItem("yurec-ark-wins") || "{}");
        raw[levelId] = (raw[levelId] || 0) + 1;
        localStorage.setItem("yurec-ark-wins", JSON.stringify(raw));
        var st = JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}");
        var row = st[levelId] || emptyRow();
        row.w = (row.w || 0) + 1;
        var took = Date.now() - matchAt;
        if (row.best == null || took < row.best) row.best = took;
        st[levelId] = row;
        localStorage.setItem("yurec-ark-stats", JSON.stringify(st));
        window.dispatchEvent(new Event("yurec-ark-wins"));
      } catch (e) {}
    }
    function saveLose() {
      try {
        var st = JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}");
        var row = st[levelId] || emptyRow();
        row.l = (row.l || 0) + 1;
        st[levelId] = row;
        localStorage.setItem("yurec-ark-stats", JSON.stringify(st));
      } catch (e) {}
    }

    function burstWin() {
      try {
        var old = document.getElementById("fw-dom");
        if (old && old.parentNode) old.parentNode.removeChild(old);
        var rootEl = document.createElement("div");
        rootEl.id = "fw-dom";
        rootEl.setAttribute("aria-hidden", "true");
        rootEl.style.cssText = "position:fixed;inset:0;z-index:120;pointer-events:none;overflow:hidden;";
        var colors = ["#e8c547", "#f4e4a1", "#ff6b4a", "#ffffff", "#c43b6e", "#8a9a4a"];
        var burst, i, a, dist, s, color, cx, cy;
        for (burst = 0; burst < 6; burst++) {
          cx = 16 + Math.random() * 68;
          cy = 14 + Math.random() * 36;
          color = colors[burst % colors.length];
          for (i = 0; i < 8; i++) {
            a = (Math.PI * 2 * i) / 8 + Math.random() * 0.2;
            dist = 4 + Math.random() * 7;
            s = document.createElement("span");
            s.className = "fw-spark";
            s.style.left = (cx + Math.cos(a) * dist) + "%";
            s.style.top = (cy + Math.sin(a) * dist * 0.55) + "%";
            s.style.background = color;
            s.style.animationDelay = burst * 140 + "ms";
            rootEl.appendChild(s);
          }
        }
        document.body.appendChild(rootEl);
        setTimeout(function () {
          if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
        }, 2800);
      } catch (e) {}
    }

    function goMenu() {
      phase = "menu";
      menu.hidden = false;
      end.hidden = true;
      hud.hidden = true;
      shotBtn.hidden = true;
      kitEl.hidden = true;
      paintDiffs();
    }

    function finish(won) {
      if (phase === "over" || phase === "menu") return;
      phase = "over";
      shotBtn.hidden = true;
      kitEl.hidden = true;
      if (won) {
        saveWin();
        burstWin();
        say("ПОБЕДА! " + pickQuote(levelId), 3);
      } else {
        saveLose();
        say("Шарик в помойку. " + pickQuote(levelId), 3);
      }
      var next = NEXT_NAME[levelId];
      var winTitle = "Кирпичи сыплются!";
      var winLead = "Уровень закрыт. " + cfg.label + ".";
      if (levelId === "boss") { winTitle = "Ящер в баке!"; winLead = "Салют. Юрец — легенда Шотмана."; }
      if (levelId === "batya") { winTitle = "Дробовик затих!"; winLead = "Батя убрал ствол. Юрец цел. Пока."; }
      if (levelId === "kostya") { winTitle = "Юрец — легенда!"; winLead = "Костя — читер. Лысый, НЛО и Батя прикрывали. Тщетно. Юрец всё равно легенда Шотмана."; }
      var html = "<h3>" + (won ? winTitle : "Проиграл двор") + "</h3>";
      html += '<p class="av-lead">' + (won ? winLead : "Ракетки кончились. Совок победил на этот раз.") + "</p>";
      html += '<div class="ark-end-btns">';
      if (won && next) html += '<button type="button" class="av-next">Следующий уровень</button>';
      html += '<button type="button" class="av-again">Сыграть ещё раз</button>';
      html += '<button type="button" class="av-menu-btn">Выйти из игры</button>';
      html += "</div>";
      end.innerHTML = html;
      end.hidden = false;
      if (won && next) {
        end.querySelector(".av-next").onclick = function () { startLevel(CHAIN[CHAIN.indexOf(levelId) + 1]); };
      }
      end.querySelector(".av-again").onclick = function () { startLevel(levelId); };
      end.querySelector(".av-menu-btn").onclick = function () { goMenu(); };
    }

    function fireLaser() {
      if (laserShots <= 0) return;
      if (phase !== "play" && phase !== "serve") return;
      laserShots -= 1;
      lasers.push({ x: paddle.x, y: paddle.y - 8, vy: -720, t: 0.6 });
      beep(980, 0.1, 0.05);
      buzz(20);
      paintHud();
    }

    function catchCap(kind) {
      var meta = CAP_META[kind] || {};
      var dur = meta.dur || 0;
      if (kind === "glue") { glue = true; glueT = dur || 60; say("КЛЕЙ на " + Math.round(glueT) + " с. Кидай, когда готов."); }
      else if (kind === "fast") {
        balls.forEach(function (b) { b.vx *= 1.28; b.vy *= 1.28; });
        say("ГАЗ! Шарик звереет.");
      } else if (kind === "slow") {
        balls.forEach(function (b) { b.vx *= 0.72; b.vy *= 0.72; });
        say("ТОРМОЗ. Передышка.");
      } else if (kind === "fly") { paddle.fly = dur || 10; say("ТОРПЕДА! " + Math.round(paddle.fly) + " с. Ракетка летает."); }
      else if (kind === "split") {
        if (balls[0]) {
          balls.push(makeBall(balls[0].x, balls[0].y, -balls[0].vx || -120, balls[0].vy || -200));
        }
        say("ДВОЙНЯ! Как помойка.");
      } else if (kind === "grow") { paddle.w = clamp(paddle.w + 16, 52, 120); say("КАБАН. Шире двор."); }
      else if (kind === "shrink") { paddle.w = clamp(paddle.w - 16, 52, 120); say("КАРЛИК. Лови кромкой."); }
      else if (kind === "life") { lives += 1; say("ЖИЗНЬ! Ещё ракетка."); paintHud(); }
      else if (kind === "laser") { laserShots += 1; say("ЛАЗЕР! Один заряд. Жми."); paintHud(); }
      else if (kind === "through") { fireball = dur || 8; say("ОГОНЬ! " + Math.round(fireball) + " с. Шарик жрёт кирпичи."); }
      else if (kind === "bomb") {
        var row = bricks.filter(function (br) { return br.alive && Math.abs(br.y - paddle.y) > 40; });
        var targetY = 0, counts = {};
        bricks.forEach(function (br) {
          if (!br.alive) return;
          counts[br.r] = (counts[br.r] || 0) + 1;
        });
        var best = 0, rk;
        for (rk in counts) if (counts[rk] >= best) { best = counts[rk]; targetY = Number(rk); }
        bricks.forEach(function (br) {
          if (br.alive && !br.gold && br.r === targetY) { br.hp = 1; hitBrick(br); }
        });
        say("ГРАНАТА! Ряд снёс, как стену в хрущёвке.");
      } else if (kind === "vodka") { vodkaT = dur || 15; say("ВОДКА! Щит " + Math.round(vodkaT) + " с. Мяч не падает."); }
      else if (kind === "triple") {
        var src = balls[0] || makeBall(paddle.x, paddle.y - 14, 0, -cfg.speed);
        balls.push(makeBall(src.x, src.y, -180, -Math.abs(src.vy || cfg.speed)));
        balls.push(makeBall(src.x, src.y, 180, -Math.abs(src.vy || cfg.speed)));
        say("ТРОЙНЯ! Как после «Путинки».");
      } else if (kind === "foil") { freeze = Math.max(freeze, dur || 6); say("ФОЛЬГА! " + Math.round(freeze) + " с. Все встали колом."); }
      else if (kind === "clean") {
        bricks.forEach(function (br) {
          if (br.alive && !br.gold) { br.hp = 1; hitBrick(br); }
        });
        say("ДОБИЛ! Остаток сгорел.", 3.5);
      }
      beep(420, 0.1, 0.05);
      buzz(18);
    }

    function hitBrick(br) {
      if (!br.alive) return;
      if (br.gold) {
        beep(140, 0.04, 0.03);
        if (!goldTold) {
          goldTold = true;
          say("Золото не ломается. Ищи щель.");
        }
        return;
      }
      br.hp -= 1;
      addPart(br.x + br.w / 2, br.y + br.h / 2, cfg.bg[2], 5);
      buzz(12);
      if (br.hp <= 0) {
        br.alive = false;
        score += 50;
        facePop = 0.38;
        facePopX = br.x + br.w / 2;
        facePopY = br.y + br.h / 2;
        if (Math.random() < 0.28) say(pickQuote(levelId), 3.6);
        beep(660, 0.07, 0.05);
        if (Math.random() < 0.16) {
          var drop = Math.random() < 0.62 ? pick(CAP_BAD) : pick(CAP_GOOD);
          if (cfg.skin === "tolik") drop = Math.random() < 0.45 ? "vodka" : drop;
          if (cfg.skin === "pharm") drop = Math.random() < 0.4 ? "life" : drop;
          if (cfg.skin === "fsb") drop = Math.random() < 0.45 ? "bomb" : drop;
          caps.push({
            x: br.x + br.w / 2,
            y: br.y + br.h,
            kind: drop,
            vy: 140
          });
        }
        if (levelId !== "boss" && levelId !== "yard" && levelId !== "batya" && levelId !== "kostya" && breakableLeft() <= 0) finish(true);
        if (levelId === "yard" && boss && boss.hp <= 0 && breakableLeft() <= 0) finish(true);
      } else beep(300, 0.05, 0.04);
    }

    function bouncePaddle(b) {
      var dx = (b.x - paddle.x) / (paddle.w * 0.5);
      dx = clamp(dx, -1, 1);
      var spd = Math.max(cfg.speed * 0.95, Math.hypot(b.vx, b.vy) || cfg.speed);
      var cap = cfg.cap || 1.42;
      spd = Math.min(spd * 1.02, cfg.speed * cap);
      var maxAng = Math.PI * 0.32;
      var ang = dx * maxAng;
      b.vx = Math.sin(ang) * spd;
      b.vy = -Math.cos(ang) * spd;
      if (glue && glueT > 0) {
        b.stuck = true;
        b.vx = 0; b.vy = 0;
        phase = "serve";
        serveStuck = true;
      }
      beep(180, 0.05, 0.04);
      buzz(8);
    }

    function step(dt) {
      if (phase === "over" || phase === "menu") return;
      if (bannerT > 0) bannerT -= dt;
      if (paddle.fly > 0) paddle.fly = Math.max(0, paddle.fly - dt);
      if (fireball > 0) fireball = Math.max(0, fireball - dt);
      if (freeze > 0) freeze = Math.max(0, freeze - dt);
      if (vodkaT > 0) vodkaT = Math.max(0, vodkaT - dt);
      if (facePop > 0) facePop = Math.max(0, facePop - dt);
      if (glueT > 0) {
        glueT -= dt;
        if (glueT <= 0) {
          glueT = 0;
          glue = false;
          say("Клей высох.");
          if (phase === "serve" && balls.some(function (b) { return b.stuck; })) launch();
        }
      }

      var leftN = breakableLeft();
      var rainEvery = 0;
      if (phase === "play" && leftN > 0 && leftN <= 3 && levelId !== "boss" && levelId !== "batya" && levelId !== "kostya") {
        rainEvery = leftN === 1 ? 10 : leftN === 2 ? 15 : 20;
      }
      if (rainEvery) {
        if (rainN !== leftN) { rainN = leftN; rainT = 0; }
        rainT += dt;
        if (rainT >= rainEvery) {
          rainT = 0;
          var dropKind = "clean";
          if (leftN === 1) dropKind = Math.random() < 0.6 ? "clean" : pick(CAP_GOOD);
          else dropKind = Math.random() < 0.4 ? "clean" : pick(CAP_GOOD);
          caps.push({ x: 36 + Math.random() * (W - 72), y: 48, kind: dropKind, vy: 105 });
          say("С неба: " + ((CAP_META[dropKind] && CAP_META[dropKind].name) || dropKind) + ". Осталось " + leftN + ".", 3.5);
        }
      } else {
        rainT = 0;
        rainN = -1;
      }

      var wantX = pointerX;
      if (keys.l) wantX -= 420 * dt * 8;
      if (keys.r) wantX += 420 * dt * 8;
      paddle.x = clamp(lerp(paddle.x, wantX, 1 - Math.exp(-16 * dt)), paddle.w * 0.5, W - paddle.w * 0.5);
      if (paddle.fly > 0) {
        var wantY = pointerY;
        if (keys.u) wantY -= 280 * dt * 8;
        if (keys.d) wantY += 280 * dt * 8;
        paddle.y = clamp(lerp(paddle.y, wantY, 1 - Math.exp(-12 * dt)), 220, H - 28);
      } else {
        paddle.y = lerp(paddle.y, H - 58, 1 - Math.exp(-10 * dt));
      }

      var i, b, e, cap, L, br, j, nx, ny, h;
      for (i = enemies.length - 1; i >= 0; i--) {
        e = enemies[i];
        if (e.kind === "egg" || e.kind === "shot" || e.kind === "bottle") {
          e.x += (e.vx || 0) * dt;
          e.y += (e.fall || 210) * dt;
          var hitPad = Math.abs(e.x - paddle.x) < paddle.w * 0.5 + e.r && e.y > paddle.y - 8 && e.y < paddle.y + paddle.h;
          if (e.kind === "shot" || e.kind === "bottle") {
            if (hitPad) {
              enemies.splice(i, 1);
              if (e.cheat) {
                addPart(paddle.x, paddle.y - 8, "#e8c36a", 10);
                say("ЧИТЕР! Против Кости нет приёма.");
                beep(520, 0.09, 0.05);
                continue;
              }
              if (vodkaT > 0) {
                beep(240, 0.05, 0.04);
                say(e.kind === "bottle" ? "ЩИТ! Бутылка в водку." : "ЩИТ! Дробь в водку.");
                continue;
              }
              lives -= 1;
              paintHud();
              buzz([50, 20, 50], true);
              say(e.kind === "bottle" ? ("Бутылка в Костю! ×" + lives) : (e.from === "lysy" ? ("Лысый вмазал! ×" + lives) : ("ДРОБЬ! Батя попал. ×" + lives)));
              if (lives <= 0) { finish(false); return; }
              continue;
            }
            if (e.y > H + 8) { enemies.splice(i, 1); continue; }
            continue;
          }
          if (hitPad) {
            enemies.splice(i, 1);
            beep(320, 0.05, 0.04);
            continue;
          }
          if (e.y > H - 6) {
            enemies.splice(i, 1);
            if (vodkaT > 0) {
              beep(180, 0.04, 0.03);
              continue;
            }
            lives -= 1;
            paintHud();
            buzz([40, 30, 40], true);
            say("Яйцо в помойку. −жизнь. ×" + lives);
            if (lives <= 0) { finish(false); return; }
            continue;
          }
          continue;
        }
        if (freeze > 0) continue;
        e.x += e.vx * dt;
        if (e.x < 20 || e.x > W - 20) e.vx *= -1;
        e.y += Math.sin((last || 0) * 0.004 + i) * 12 * dt;
      }
      if (boss && boss.hp > 0) {
        boss.t += dt;
        if (freeze <= 0) {
          boss.x += boss.vx * dt;
          if (boss.x < 46 || boss.x > W - 46) boss.vx *= -1;
        }
        var spitEvery = boss.spit || 2.2;
        if (boss.t > spitEvery) {
          boss.t = 0;
          if (boss.kind === "batya") {
            var nShot = randInt(2, 5);
            var k, t, spread = 36 + nShot * 18;
            for (k = 0; k < nShot; k++) {
              t = nShot === 1 ? 0 : (k / (nShot - 1) - 0.5) * 2;
              enemies.push({ x: boss.x, y: boss.y + boss.r, vx: t * spread, fall: 300 + Math.random() * 70, r: 5, kind: "shot" });
            }
            boss.spit = randInt(2, 4);
            say("БАБАХ! Дробь ×" + nShot + "!");
            beep(90, 0.12, 0.06);
            buzz(30, true);
          } else if (boss.kind === "yurec") {
            var nBot = randInt(1, 3);
            var kb;
            for (kb = 0; kb < nBot; kb++) {
              var aim = (paddle.x - boss.x) * 0.55 + (kb - (nBot - 1) / 2) * 46;
              enemies.push({ x: boss.x + (kb - (nBot - 1) / 2) * 8, y: boss.y + boss.r, vx: aim, fall: 220 + Math.random() * 70, r: 6, kind: "bottle" });
            }
            boss.spit = 1.8 + Math.random() * 1.4;
            say(nBot > 1 ? "Юрец швыряет бутылки!" : "Юрец швыряет бутылку!");
            beep(140, 0.09, 0.05);
            buzz(18, true);
          } else {
            enemies.push({ x: boss.x, y: boss.y + boss.r, vx: 0, fall: 200 + Math.random() * 80, r: 9, kind: "egg" });
            say(boss.kind === "ufo" ? "НЛО сыпет!" : "Ящер плюётся!");
          }
        }
        if (boss.kind === "lizard") {
          boss.regen = (boss.regen || 0) + dt;
          if (boss.regen > 9) {
            boss.regen = 0;
            bricks.forEach(function (br) {
              if (br.shell && !br.alive) {
                br.alive = true;
                br.hp = br.max || 2;
              }
            });
            say("Панцирь отрос!");
          }
        }
      }

      if (levelId === "kostya" && phase === "play" && boss && boss.hp > 0) {
        var fightT = (Date.now() - matchAt) / 1000;
        if (!helpFlags.lysy && fightT >= 30) {
          helpFlags.lysy = true;
          helpers.push({ kind: "lysy", x: boss.x - 52, y: boss.y + 10, vx: -90, r: 20, t: 0, spit: 0, ghost: 0 });
          say("Лысый хер на подмогу Юрцу!", 3.2);
          beep(180, 0.1, 0.05);
        }
        if (!helpFlags.ufo && fightT >= 60) {
          helpFlags.ufo = true;
          helpers.push({ kind: "ufo", x: boss.x + 52, y: boss.y - 6, vx: 100, r: 22, t: 0, spit: 0, ghost: 0 });
          say("НЛО с Зинаидой! Тарелка над Юрцом!", 3.2);
          beep(260, 0.1, 0.05);
        }
        if (!helpFlags.batya && boss.hp <= Math.max(4, Math.ceil(boss.max * 0.28))) {
          helpFlags.batya = true;
          helpers.push({ kind: "batya", x: boss.x, y: boss.y + 18, vx: 70, r: 22, t: 0, spit: 0, ghost: 0 });
          say("Батя с дробовиком! Сын, держись!", 3.4);
          beep(90, 0.14, 0.06);
          buzz(40, true);
        }
      }
      var hi;
      for (hi = 0; hi < helpers.length; hi++) {
        h = helpers[hi];
        h.t += dt;
        if (h.ghost > 0) h.ghost -= dt;
        if (freeze <= 0) {
          h.x += h.vx * dt;
          var orbitL = boss && boss.hp > 0 ? Math.max(28, boss.x - 86) : 40;
          var orbitR = boss && boss.hp > 0 ? Math.min(W - 28, boss.x + 86) : W - 40;
          if (h.x < orbitL || h.x > orbitR || h.x < 28 || h.x > W - 28) h.vx *= -1;
          h.x = clamp(h.x, 28, W - 28);
          var hy = (boss && boss.hp > 0 ? boss.y : 56) + (h.kind === "ufo" ? -10 : 14);
          h.y = hy + Math.sin(h.t * 2.2 + hi) * 8;
        }
        h.spit += dt;
        var hEvery = h.kind === "batya" ? 2.6 : h.kind === "ufo" ? 3.1 : 2.7;
        if (h.spit > hEvery && (phase === "play" || phase === "serve")) {
          h.spit = 0;
          if (h.kind === "batya") {
            var hn = randInt(2, 5);
            var hk, ht, hspread = 34 + hn * 16;
            for (hk = 0; hk < hn; hk++) {
              ht = hn === 1 ? 0 : (hk / (hn - 1) - 0.5) * 2;
              enemies.push({ x: h.x, y: h.y + h.r, vx: ht * hspread + (paddle.x - h.x) * 0.15, fall: 280 + Math.random() * 60, r: 5, kind: "shot", cheat: true });
            }
            say("Батя кроет Костю! Дробь ×" + hn + " — и мимо, читер.");
            beep(90, 0.1, 0.05);
          } else if (h.kind === "ufo") {
            enemies.push({ x: h.x, y: h.y + h.r, vx: (paddle.x - h.x) * 0.2, fall: 190 + Math.random() * 70, r: 9, kind: "egg" });
            say("Зинаида сыпет с тарелки!");
          } else {
            enemies.push({ x: h.x, y: h.y + h.r, vx: (paddle.x - h.x) * 0.6, fall: 250 + Math.random() * 50, r: 6, kind: "shot", from: "lysy" });
            say("Лысый хер швыряет пропуск!");
            beep(160, 0.07, 0.04);
          }
        }
      }

      for (i = lasers.length - 1; i >= 0; i--) {
        L = lasers[i];
        L.y += L.vy * dt;
        L.t -= dt;
        var hit = false;
        for (j = 0; j < bricks.length; j++) {
          br = bricks[j];
          if (!br.alive) continue;
          if (L.x > br.x && L.x < br.x + br.w && L.y > br.y && L.y < br.y + br.h) {
            if (br.gold) { hit = true; break; }
            hitBrick(br);
            hit = true;
            break;
          }
        }
        if (boss && boss.hp > 0 && Math.hypot(L.x - boss.x, L.y - boss.y) < boss.r) {
          boss.hp -= 1;
          addPart(boss.x, boss.y, boss.kind === "ufo" ? "#9b6bff" : "#6a9a52", 10);
          say((boss.kind === "ufo" ? "В тарелку! " : boss.kind === "batya" ? "В батю! " : boss.kind === "yurec" ? "В Юрца! " : "В ящера! ") + boss.hp);
          if (boss.hp <= 0) {
            if (levelId === "yard") {
              if (breakableLeft() <= 0) finish(true);
              else say("НЛО сбито! Добей кирпичи.");
            } else finish(true);
          }
          hit = true;
        }
        if (hit || L.y < 8 || L.t <= 0) lasers.splice(i, 1);
      }

      for (i = caps.length - 1; i >= 0; i--) {
        cap = caps[i];
        cap.y += cap.vy * dt;
        if (cap.y > H + 10) { caps.splice(i, 1); continue; }
        if (Math.abs(cap.x - paddle.x) < paddle.w * 0.5 + 22 && cap.y > paddle.y - 18 && cap.y < paddle.y + paddle.h + 10) {
          catchCap(cap.kind);
          caps.splice(i, 1);
        }
      }

      for (i = balls.length - 1; i >= 0; i--) {
        b = balls[i];
        if (b.stuck) {
          b.x = paddle.x;
          b.y = paddle.y - 18;
          continue;
        }
        var steps = (Math.abs(b.vx) + Math.abs(b.vy) > 480) ? 2 : 1;
        var sdt = dt / steps, s;
        var fell = false;
        for (s = 0; s < steps; s++) {
          b.x += b.vx * sdt;
          b.y += b.vy * sdt;
          if (b.x < 12) {
            b.x = 12; b.vx = Math.abs(b.vx);
            beep(200, 0.04, 0.03);
          }
          if (b.x > W - 12) {
            b.x = W - 12; b.vx = -Math.abs(b.vx);
            beep(200, 0.04, 0.03);
          }
          if (b.y < 10) { b.y = 10; b.vy = Math.abs(b.vy); beep(200, 0.04, 0.03); }
          if (vodkaT > 0 && b.vy > 0 && b.y + b.r >= H - 22) {
            b.y = H - 22 - b.r;
            b.vy = -Math.abs(b.vy);
            beep(180, 0.05, 0.04);
          }
          if (b.y > H + 16) {
            if (vodkaT > 0) {
              b.y = H - 24 - b.r;
              b.vy = -Math.abs(b.vy);
            } else { fell = true; break; }
          }
          if (b.vy > 0 && b.y + b.r >= paddle.y && b.y < paddle.y + paddle.h && Math.abs(b.x - paddle.x) < paddle.w * 0.5 + b.r) {
            b.y = paddle.y - b.r - 0.5;
            bouncePaddle(b);
          }
          for (j = 0; j < bricks.length; j++) {
            br = bricks[j];
            if (!br.alive) continue;
            if (b.x + b.r < br.x || b.x - b.r > br.x + br.w || b.y + b.r < br.y || b.y - b.r > br.y + br.h) continue;
            if (fireball > 0 && !br.gold) {
              hitBrick(br);
              continue;
            }
            nx = b.x - (br.x + br.w / 2);
            ny = b.y - (br.y + br.h / 2);
            if (Math.abs(nx) * br.h > Math.abs(ny) * br.w) b.vx *= -1;
            else b.vy *= -1;
            b.x += Math.sign(b.vx) * 1.2;
            b.y += Math.sign(b.vy) * 1.2;
            hitBrick(br);
            break;
          }
        }
        var spdNow = Math.hypot(b.vx, b.vy) || cfg.speed;
        var floor = cfg.speed * 0.88;
        if (spdNow < floor) {
          b.vx *= floor / spdNow;
          b.vy *= floor / spdNow;
          spdNow = floor;
        }
        if (Math.abs(b.vy) < spdNow * 0.38) {
          b.vy = (b.vy < 0 ? -1 : 1) * spdNow * 0.38;
        }
        if (fell) {
          balls.splice(i, 1);
          if (balls.length === 0) {
            lives -= 1;
            paintHud();
            buzz([30, 40, 30], true);
            if (lives <= 0) { finish(false); return; }
            say("Ракетка сгорела. Осталось ×" + lives);
            resetServe();
          }
          continue;
        }
        for (j = 0; j < enemies.length; j++) {
          e = enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r) {
            var ang = Math.atan2(b.y - e.y, b.x - e.x);
            var spd = Math.hypot(b.vx, b.vy) || cfg.speed;
            b.vx = Math.cos(ang) * spd;
            b.vy = Math.sin(ang) * spd;
            beep(90, 0.06, 0.04);
          }
        }
        for (j = 0; j < helpers.length; j++) {
          h = helpers[j];
          if (Math.hypot(b.x - h.x, b.y - h.y) < b.r + h.r + 4) {
            if (h.kind === "batya") {
              if (h.ghost <= 0) {
                h.ghost = 0.8;
                addPart(h.x, h.y, "#e8c36a", 8);
                say("Батя грудью! Костя читер — летит навылет.");
                beep(70, 0.06, 0.04);
              }
            } else {
              var ha = Math.atan2(b.y - h.y, b.x - h.x);
              var hs = Math.hypot(b.vx, b.vy) || cfg.speed;
              b.vx = Math.cos(ha) * hs;
              b.vy = Math.sin(ha) * hs;
              addPart(h.x, h.y, h.kind === "ufo" ? "#9b6bff" : "#c46a3a", 6);
              if (h.ghost <= 0) {
                h.ghost = 1.1;
                say(h.kind === "lysy" ? "Лысый отбил!" : "НЛО перехватило!");
              }
              beep(120, 0.06, 0.04);
            }
          }
        }
        if (boss && boss.hp > 0 && Math.hypot(b.x - boss.x, b.y - boss.y) < b.r + boss.r) {
          var ba = Math.atan2(b.y - boss.y, b.x - boss.x);
          var bs = Math.hypot(b.vx, b.vy) || cfg.speed;
          b.vx = Math.cos(ba) * bs;
          b.vy = Math.sin(ba) * bs;
          boss.hp -= 1;
          addPart(boss.x, boss.y, boss.kind === "ufo" ? "#9b6bff" : "#8fba5a", 8);
          say((boss.kind === "ufo" ? "В тарелку! " : boss.kind === "batya" ? "В батю! " : boss.kind === "yurec" ? "В Юрца! " : "В морду ящеру! ") + boss.hp);
          beep(110, 0.08, 0.05);
          buzz(25, true);
          if (boss.hp <= 0) {
            if (levelId === "yard") {
              if (breakableLeft() <= 0) finish(true);
              else say("НЛО сбито! Добей кирпичи двора.");
            } else finish(true);
          }
        }
      }

      for (i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.t += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        if (p.t > 0.45) particles.splice(i, 1);
      }
    }

    var CANDY = ["#ff4d6d", "#ff9f1c", "#ffe14a", "#2ec4b6", "#4d7cff", "#b388ff", "#ff7ab0", "#7cff6b"];
    function brickColor(br) {
      if (br.gold) return "#e8c36a";
      if (br.shell) return br.hp >= 2 ? "#3a6a22" : "#8fba5a";
      if (br.ufo) return "#9b6bff";
      var skin = cfg.skin || levelId;
      if (skin === "flat") return CANDY[(br.r + br.c) % CANDY.length];
      if (skin === "olimp") return br.max >= 3 ? "#c46a28" : br.max >= 2 ? "#ff9f1c" : "#ffe14a";
      if (skin === "maxi") return br.max >= 2 ? "#ff4d8d" : "#ff9ac8";
      if (skin === "yard") return br.max >= 2 ? "#4d7cff" : "#7ec8ff";
      if (skin === "tolik") return br.max >= 2 ? "#6a9a22" : "#c9a227";
      if (skin === "pharm") return br.max >= 2 ? "#ff7ab0" : "#e8f0ff";
      if (skin === "fsb") return br.max >= 2 ? "#5a6068" : "#8a909a";
      if (skin === "batya") return br.max >= 2 ? "#8a4a18" : "#c46a3a";
      if (skin === "kostya") return CANDY[(br.r + br.c + 3) % CANDY.length];
      return br.max >= 2 ? "#6a9a52" : "#b8f06a";
    }
    function rr(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }
    }
    function drawFaceClip(img, cx, cy, rw, rh, sx, sy, sw, sh) {
      if (!img) return;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
      ctx.clip();
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      ctx.drawImage(img, iw * sx, ih * sy, iw * sw, ih * sh, cx - rw, cy - rh, rw * 2, rh * 2);
      ctx.restore();
    }

    function drawScene() {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#4a1020");
      g.addColorStop(0.35, cfg.bg[1] || "#6a1830");
      g.addColorStop(1, "#1a0810");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      var i, j;
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (i = -1; i < 7; i++) {
        for (j = -1; j < 9; j++) {
          var mx = (i * 92 + (j % 2) * 46) - 20;
          var my = j * 78 - 10;
          ctx.fillStyle = (i + j) % 2 ? "#7a1c32" : "#5a1428";
          ctx.beginPath();
          ctx.ellipse(mx + 46, my + 40, 40, 28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(232,195,106,0.28)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(mx + 46, my + 40, 22, 14, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
      if (imgs.yurec || imgs.lysy || imgs.svetlana || imgs.zinaida) {
        var bgImg = imgs[cfg.face || "yurec"] || imgs.yurec;
        if (bgImg) {
          ctx.save();
          ctx.globalAlpha = 0.2;
          drawFaceClip(bgImg, W / 2, H * 0.42, 96, 112, 0.12, 0.04, 0.76, 0.7);
          ctx.restore();
        }
      }
      ctx.strokeStyle = "rgba(80,220,255,0.45)";
      ctx.lineWidth = 4;
      ctx.strokeRect(5, 5, W - 10, H - 10);
      ctx.strokeStyle = "rgba(255,80,160,0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 10, W - 20, H - 20);
    }

    function drawBrickFace(br) {
      var col = brickColor(br);
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      rr(br.x, br.y, br.w, br.h, 5);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
      var hi = ctx.createLinearGradient(br.x, br.y, br.x, br.y + br.h);
      hi.addColorStop(0, "rgba(255,255,255,0.55)");
      hi.addColorStop(0.45, "rgba(255,255,255,0.08)");
      hi.addColorStop(1, "rgba(0,0,0,0.25)");
      rr(br.x, br.y, br.w, br.h, 5);
      ctx.fillStyle = hi;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      rr(br.x + 0.5, br.y + 0.5, br.w - 1, br.h - 1, 5);
      ctx.stroke();
      if (br.gold) {
        ctx.strokeStyle = "#fff6c0";
        ctx.lineWidth = 2;
        rr(br.x + 2, br.y + 2, br.w - 4, br.h - 4, 3);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,220,0.85)";
        ctx.fillRect(br.x + 4, br.y + 3, br.w - 8, 3);
        ctx.fillStyle = "rgba(90,50,10,0.55)";
        ctx.font = "800 9px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("З", br.x + br.w / 2, br.y + br.h / 2 + 3);
      } else if (br.max > 1) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        var t, tw = 4;
        var total = br.max;
        var start = br.x + (br.w - (total * tw + (total - 1) * 2)) / 2;
        for (t = 0; t < total; t++) {
          ctx.fillStyle = t < br.hp ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.35)";
          ctx.fillRect(start + t * (tw + 2), br.y + br.h - 5, tw, 3);
        }
      }
      if (br.ufo && imgs.zinaida) {
        drawFaceClip(imgs.zinaida, br.x + br.w / 2, br.y + br.h / 2, br.w * 0.42, br.h * 0.46, 0.15, 0.08, 0.7, 0.7);
      }
      var skin = cfg.skin || levelId;
      if (skin === "maxi" && br.c === 5 && imgs.svetlana) {
        drawFaceClip(imgs.svetlana, br.x + br.w / 2, br.y + br.h / 2, br.w * 0.4, br.h * 0.46, 0.15, 0.08, 0.7, 0.7);
      }
      if (skin === "olimp" && br.c % 4 === 1 && imgs.lysy) {
        drawFaceClip(imgs.lysy, br.x + br.w / 2, br.y + br.h / 2, br.w * 0.38, br.h * 0.44, 0.15, 0.08, 0.7, 0.7);
      }
    }

    function drawAim() {
      var d = serveDir();
      var x = paddle.x;
      var y = paddle.y - 18;
      var vx = d.vx * cfg.speed;
      var vy = d.vy * cfg.speed;
      var i, sp = 1 / 50, br, j, hit = false;
      ctx.save();
      for (i = 0; i < 70 && !hit; i++) {
        x += vx * sp;
        y += vy * sp;
        if (x < 12) { x = 12; vx = Math.abs(vx); }
        if (x > W - 12) { x = W - 12; vx = -Math.abs(vx); }
        if (y < 10) { y = 10; vy = Math.abs(vy); }
        for (j = 0; j < bricks.length; j++) {
          br = bricks[j];
          if (!br.alive) continue;
          if (x > br.x && x < br.x + br.w && y > br.y && y < br.y + br.h) { hit = true; break; }
        }
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.2 + (i / 70) * 0.45;
          ctx.fillStyle = "#ffe14a";
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(255,225,74,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(paddle.x, paddle.y - 8);
      ctx.lineTo(paddle.x + d.vx * 36, paddle.y - 8 + d.vy * 36);
      ctx.stroke();
      ctx.restore();
    }

    function drawPaddle() {
      var x = paddle.x - paddle.w / 2, y = paddle.y, w = paddle.w, h = paddle.h;
      var cx = paddle.x, cy = y + h * 0.48;
      ctx.save();
      ctx.shadowColor = "#4df";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#1a2840";
      rr(x - 8, y + h * 0.35, 16, h * 0.45, 6);
      ctx.fill();
      rr(x + w - 8, y + h * 0.35, 16, h * 0.45, 6);
      ctx.fill();
      ctx.restore();
      var flame = 6 + Math.sin((last || 0) * 0.02) * 3;
      ctx.fillStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.moveTo(x - 2, y + h * 0.4);
      ctx.lineTo(x - 10 - flame, y + h * 0.55);
      ctx.lineTo(x - 2, y + h * 0.72);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + w + 2, y + h * 0.4);
      ctx.lineTo(x + w + 10 + flame, y + h * 0.55);
      ctx.lineTo(x + w + 2, y + h * 0.72);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = "#ff7ab0";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#c46a3a";
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, h * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawFaceClip(imgs[cfg.paddleFace || "yurec"] || imgs.yurec, cx, cy, w * 0.5, h * 0.52, 0.12, 0.04, 0.76, 0.62);
      if (cfg.skin === "fsb") {
        ctx.fillStyle = "#c8c8d0";
        ctx.beginPath();
        ctx.moveTo(cx, cy - h * 0.62);
        ctx.lineTo(cx - 14, cy - h * 0.28);
        ctx.lineTo(cx + 14, cy - h * 0.28);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(180,240,255,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, h * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (paddle.fly > 0) {
        ctx.fillStyle = "rgba(80,220,255,0.75)";
        ctx.fillRect(x + 16, y + h, w - 32, 5);
      }
    }

    function draw() {
      drawScene();

      var i, br, e, cap, L, p, b, meta, h;
      for (i = 0; i < bricks.length; i++) {
        br = bricks[i];
        if (!br.alive) continue;
        drawBrickFace(br);
      }
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i];
        if (e.kind === "ufo") {
          ctx.fillStyle = "#c8b0ff";
          ctx.beginPath(); ctx.ellipse(e.x, e.y, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.ellipse(e.x, e.y - 6, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
          if (imgs.zinaida) {
            ctx.save();
            ctx.beginPath(); ctx.arc(e.x, e.y - 6, 6, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(imgs.zinaida, e.x - 8, e.y - 14, 16, 16);
            ctx.restore();
          }
        } else if (e.kind === "shot") {
          ctx.fillStyle = e.cheat ? "#ffe14a" : "#e8c36a";
          ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff6c0";
          ctx.beginPath(); ctx.arc(e.x - 1, e.y - 1, 2, 0, Math.PI * 2); ctx.fill();
        } else if (e.kind === "bottle") {
          ctx.fillStyle = "#6a9a22";
          ctx.fillRect(e.x - 4, e.y - 7, 8, 14);
          ctx.fillStyle = "#c9a227";
          ctx.fillRect(e.x - 2, e.y - 12, 4, 6);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fillRect(e.x - 2, e.y - 4, 3, 6);
        } else {
          ctx.fillStyle = e.kind === "egg" ? "#8fba5a" : "#ff7ab0";
          ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (boss && boss.hp > 0) {
        if (boss.kind === "ufo") {
          ctx.fillStyle = "#c8b0ff";
          ctx.beginPath(); ctx.ellipse(boss.x, boss.y, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.ellipse(boss.x, boss.y - 8, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
          if (imgs.zinaida) {
            ctx.save();
            ctx.beginPath(); ctx.arc(boss.x, boss.y - 8, 10, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(imgs.zinaida, boss.x - 12, boss.y - 20, 24, 24);
            ctx.restore();
          }
        } else {
          var bcol = boss.kind === "batya" ? "#c46a3a" : boss.kind === "yurec" ? "#c43b6e" : "#6a9a52";
          var bimg = boss.kind === "batya" ? imgs.batya : boss.kind === "yurec" ? imgs.yurec : imgs.zinaida;
          ctx.fillStyle = bcol;
          ctx.beginPath(); ctx.ellipse(boss.x, boss.y, boss.r * 1.15, boss.r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
          if (bimg) {
            ctx.save();
            ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.r * 0.85, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(bimg, boss.x - boss.r, boss.y - boss.r, boss.r * 2, boss.r * 2);
            ctx.restore();
          }
        }
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(W / 2 - 70, 12, 140, 8);
        ctx.fillStyle = boss.kind === "ufo" ? "#9b6bff" : boss.kind === "batya" ? "#e8c36a" : boss.kind === "yurec" ? "#7ec8e3" : "#c43b6e";
        ctx.fillRect(W / 2 - 70, 12, 140 * (boss.hp / boss.max), 8);
      }
      for (i = 0; i < helpers.length; i++) {
        h = helpers[i];
        ctx.save();
        if (h.kind === "batya") ctx.globalAlpha = 0.55 + 0.35 * Math.abs(Math.sin(h.t * 6));
        if (h.kind === "ufo") {
          ctx.fillStyle = "#c8b0ff";
          ctx.beginPath(); ctx.ellipse(h.x, h.y, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.ellipse(h.x, h.y - 6, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
          if (imgs.zinaida) {
            ctx.beginPath(); ctx.arc(h.x, h.y - 6, 6, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(imgs.zinaida, h.x - 8, h.y - 14, 16, 16);
          }
        } else {
          var hcol = h.kind === "batya" ? "#c46a3a" : "#c46a28";
          var himg = h.kind === "batya" ? imgs.batya : imgs.lysy;
          ctx.fillStyle = hcol;
          ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r * 1.1, h.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
          if (himg) {
            ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 0.82, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(himg, h.x - h.r, h.y - h.r, h.r * 2, h.r * 2);
          }
        }
        ctx.restore();
      }
      for (i = 0; i < caps.length; i++) {
        cap = caps[i];
        meta = CAP_META[cap.kind] || CAP_META.glue;
        ctx.fillStyle = meta.fill;
        ctx.fillRect(cap.x - 28, cap.y - 16, 56, 32);
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(cap.x - 28, cap.y - 16, 56, 32);
        ctx.fillStyle = "#111";
        ctx.font = "800 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(meta.name || "?", cap.x, cap.y - 1);
        ctx.font = "800 10px Manrope, sans-serif";
        ctx.fillText(capDurLabel(cap.kind), cap.x, cap.y + 12);
      }
      for (i = 0; i < lasers.length; i++) {
        L = lasers[i];
        ctx.strokeStyle = "#ff2a6a";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(L.x, L.y - 36); ctx.stroke();
      }
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        ctx.globalAlpha = Math.max(0, 1 - p.t / 0.45);
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (phase === "serve") drawAim();
      drawPaddle();
      if (vodkaT > 0) {
        var pulse = 0.28 + 0.12 * Math.sin((last || 0) * 0.01);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = "#ffe14a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(paddle.x, paddle.y, paddle.w * 0.62, paddle.h * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(232,195,106,0.22)";
        ctx.fill();
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = "#e8c36a";
        ctx.fillRect(8, H - 20, W - 16, 14);
        ctx.fillStyle = "#111";
        ctx.font = "800 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("щит " + Math.ceil(vodkaT) + "с", W / 2, H - 9);
        ctx.restore();
      }
      var fxY = 36;
      ctx.font = "800 11px Manrope, sans-serif";
      ctx.textAlign = "left";
      if (glueT > 0) {
        ctx.fillStyle = "rgba(126,200,227,0.95)";
        ctx.fillText("клей " + Math.ceil(glueT) + "с", 12, fxY);
        fxY += 13;
      }
      if (fireball > 0) {
        ctx.fillStyle = "rgba(255,80,40,0.95)";
        ctx.fillText("огонь " + Math.ceil(fireball) + "с", 12, fxY);
        fxY += 13;
      }
      if (vodkaT > 0) {
        ctx.fillStyle = "rgba(232,195,106,0.95)";
        ctx.fillText("водка " + Math.ceil(vodkaT) + "с", 12, fxY);
        fxY += 13;
      }
      if (freeze > 0) {
        ctx.fillStyle = "rgba(200,200,208,0.95)";
        ctx.fillText("фольга " + Math.ceil(freeze) + "с", 12, fxY);
        fxY += 13;
      }
      if (paddle.fly > 0) {
        ctx.fillStyle = "rgba(201,162,39,0.95)";
        ctx.fillText("торпеда " + Math.ceil(paddle.fly) + "с", 12, fxY);
      }
      if (facePop > 0 && imgs.yurec) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, facePop * 3);
        var sc = 18 + (0.38 - facePop) * 70;
        drawFaceClip(imgs.yurec, facePopX, facePopY, sc, sc * 1.15, 0.12, 0.04, 0.76, 0.7);
        ctx.restore();
      }
      for (i = 0; i < balls.length; i++) {
        b = balls[i];
        if (!b.trail) b.trail = [];
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 10) b.trail.shift();
        var ti;
        for (ti = 0; ti < b.trail.length; ti++) {
          ctx.globalAlpha = (ti + 1) / b.trail.length * 0.4;
          ctx.fillStyle = fireball > 0 ? "#ff6b4a" : "#7ef";
          ctx.beginPath(); ctx.arc(b.trail[ti].x, b.trail[ti].y, b.r * (0.4 + ti * 0.05), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.shadowColor = fireball > 0 ? "#ff3b1f" : "#7ef";
        ctx.shadowBlur = 16;
        var rad = ctx.createRadialGradient(b.x - 3, b.y - 3, 2, b.x, b.y, b.r + 2);
        rad.addColorStop(0, "#fff");
        rad.addColorStop(0.35, fireball > 0 ? "#ff9a3a" : "#7efcff");
        rad.addColorStop(1, fireball > 0 ? "#c43010" : "#2a6aff");
        ctx.fillStyle = rad;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (imgs.yurec) drawFaceClip(imgs.yurec, b.x, b.y, b.r * 0.72, b.r * 0.82, 0.14, 0.06, 0.7, 0.6);
      }
      var hi;
      for (hi = 0; hi < Math.max(3, lives); hi++) {
        ctx.fillStyle = hi < lives ? "#ff4d6d" : "rgba(255,255,255,0.18)";
        ctx.beginPath();
        var hx2 = 16 + hi * 18, hy2 = 18;
        ctx.moveTo(hx2, hy2 + 3);
        ctx.bezierCurveTo(hx2 - 7, hy2 - 6, hx2 - 12, hy2 + 6, hx2, hy2 + 12);
        ctx.bezierCurveTo(hx2 + 12, hy2 + 6, hx2 + 7, hy2 - 6, hx2, hy2 + 3);
        ctx.fill();
      }
      if (bannerT > 0 && banner) {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(12, H * 0.38, W - 24, 52);
        ctx.fillStyle = "#f4e4a1";
        ctx.font = "800 15px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(banner, W / 2, H * 0.38 + 32);
      }
      ctx.fillStyle = "rgba(236,234,228,0.85)";
      ctx.font = "800 13px Manrope, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(score), W - 14, 22);
    }

    function loop(ts) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (phase === "menu") { layout(); return; }
      if (!last) last = ts;
      var dt = Math.min(0.032, (ts - last) / 1000);
      last = ts;
      acc += dt;
      while (acc >= 1 / 60) { step(1 / 60); acc -= 1 / 60; }
      layout();
      draw();
    }

    function eventX(e) {
      var rect = canvas.getBoundingClientRect();
      return clamp((e.clientX - rect.left) * (W / rect.width), 0, W);
    }
    function eventY(e) {
      var rect = canvas.getBoundingClientRect();
      return clamp((e.clientY - rect.top) * (H / rect.height), 0, H);
    }
    function onDown(e) {
      unlockAudio();
      if (e.cancelable) e.preventDefault();
      pointerX = eventX(e);
      pointerY = eventY(e);
      if (phase === "serve") launch();
    }
    function onMove(e) {
      if (e.cancelable) e.preventDefault();
      pointerX = eventX(e);
      pointerY = eventY(e);
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.style.touchAction = "none";
    shotBtn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      unlockAudio();
      fireLaser();
    });
    function onKey(e, down) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.l = down;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.r = down;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.u = down;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.d = down;
      if (down && (e.code === "Space" || e.code === "Enter")) {
        if (phase === "serve") { e.preventDefault(); launch(); }
        else if (laserShots > 0) { e.preventDefault(); fireLaser(); }
      }
    }
    function kd(e) { onKey(e, true); }
    function ku(e) { onKey(e, false); }
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    hud.hidden = true;
    layout();
    raf = requestAnimationFrame(loop);

    function destroy() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      try {
        document.documentElement.classList.remove("av-nodock");
        document.body.classList.remove("av-nodock");
      } catch (e) {}
      try { host.innerHTML = ""; } catch (e) {}
    }
    return { destroy: destroy };
  }

  root.YurecArk = { mount: mount };
})(typeof window !== "undefined" ? window : this);
