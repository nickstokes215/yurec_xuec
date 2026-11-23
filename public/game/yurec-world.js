/**
 * «МИР ЮРЦА» — трёхэтапный геоскоп в стиле UFO: Enemy Unknown (1994).
 */
(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    BEST_PATROL: 'yurec-world-best',
    BEST_GOSHA_CATCH: 'yurec-world-gosha-best',
    BEST_VODKA_DEFEND: 'yurec-world-vodka-best',
    VISITED_PINS: 'yurec-world-visited'
  };

  // Варианты шкалы времени вращения и смены дня/ночи
  const TIME_SCALES = [
    { id: '5s', label: '5 СЕК', radPerSec: 0.032, sunStepRad: 0.014, weatherFactor: 0.45, desc: '5 сек / шаг' },
    { id: '30s', label: '30 СЕК', radPerSec: 0.1, sunStepRad: 0.045, weatherFactor: 0.85, desc: '30 сек / шаг' },
    { id: '5m', label: '5 МИН', radPerSec: 0.22, sunStepRad: 0.12, weatherFactor: 1.35, desc: '5 мин / шаг' },
    { id: '1h', label: '1 ЧАС', radPerSec: 0.48, sunStepRad: 0.26, weatherFactor: 2.1, desc: '1 час / шаг' },
    { id: '1d', label: '1 ДЕНЬ', radPerSec: 0.95, sunStepRad: 0.5, weatherFactor: 3.4, desc: '1 день / шаг' },
    { id: '1mo', label: '1 МЕСЯЦ', radPerSec: 1.65, sunStepRad: 0.95, weatherFactor: 6.5, desc: '1 месяц / шаг' }
  ];

  // Режимы погоды для 1-го и 2-го этапов
  const WEATHER_MODES = [
    { id: 'off', label: 'Погода: ВЫКЛ' },
    { id: 'auto', label: 'Погода: АВТО' },
    { id: 'rain', label: 'Погода: Дождь' },
    { id: 'sun', label: 'Погода: Солнце' },
    { id: 'storm', label: 'Погода: Ураган' },
    { id: 'tornado', label: 'Погода: Торнадо' },
    { id: 'snow', label: 'Погода: Снег' }
  ];

  const WEATHER_RU_NAMES = {
    rain: 'дождь',
    sun: 'солнце',
    storm: 'ураган',
    tornado: 'торнадо',
    snow: 'снег',
    off: 'выкл'
  };

  const AUTO_WEATHER_POOL = ['rain', 'sun', 'storm', 'tornado', 'snow'];

  // Палитра геоскопа в стиле UFO: Enemy Unknown
  const TONE_COLORS = {
    hero: { fill: '#f5be4f', text: '#070c14' },
    gold: { fill: '#e6b24a', text: '#070c14' },
    copper: { fill: '#df7844', text: '#f3f8ff' },
    violet: { fill: '#9482f0', text: '#f3f8ff' },
    teal: { fill: '#3ec4be', text: '#051214' }
  };

  // Эмодзи-стикеры объектов и точек
  const PIN_STICKERS = {
    shotman: '🏙️',
    'back-to-earth': '🌍',
    'back-to-yard': '🏡',
    khrushchevka: '🏢',
    nlo: '🛸',
    neva: '🌊',
    iskrovsky: '✨',
    pyaterochka: '🛒',
    apteka: '🏥',
    'earth-sausage': '🌭',
    'earth-linoleum': '🪵',
    'earth-polovnik': '🥄',
    maxidom: '🛠️',
    olimpik: '🏗️',
    zinaida: '🪟',
    trolley: '🚎',
    larek: '🏪',
    kiosk: '📰',
    pomoyka: '🗑️',
    luzha: '💧',
    'yard-semki': '🌻',
    'yard-antenna': '📡',
    vodka: '🍾',
    fridge: '🧊',
    gosha: '🐦‍⬛',
    raduga: '📺',
    portret: '🖼️',
    granata: '💣',
    drobovik: '🔫',
    pero: '🪶',
    'flat-pelmeni': '🥟',
    'flat-kasetnik': '📼',
    'flat-kluchi': '🔑',
    'spoiled-kefir': '🥛',
    'spoiled-potato': '🥔',
    'spoiled-tomato': '🍅',
    'spoiled-cabbage': '🥬'
  };

  const SPOILED_IDS = new Set(['spoiled-kefir', 'spoiled-potato', 'spoiled-tomato', 'spoiled-cabbage']);

  const SPOILED_REACTIONS = {
    'spoiled-kefir': {
      title: '🥛 Кефир с характером',
      text: 'Кефир уже сам научился открывать крышку — свежесть ушла в отпуск, мошки в восторге.'
    },
    'spoiled-potato': {
      title: '🥔 Картошка-ветеран',
      text: 'Картошка пустила ростки в сторону прихожей и явно ведёт переговоры с мошками.'
    },
    'spoiled-tomato': {
      title: '🍅 Помидоры на дежурстве',
      text: 'Помидоры выглядят так, будто пережили три осады — мошки кружат почётным караулом.'
    },
    'spoiled-cabbage': {
      title: '🥬 Пекинская капуста',
      text: 'Капуста шелестит листьями на весь стол: про свежесть лучше не спрашивать, мошки уже заселились.'
    }
  };

  const NEWSPAPER_ISSUES = [
    {
      headline: '«ВЕЧЕРНИЙ ШОТМАН» №404 — СПЕЦВЫПУСК',
      ticker: 'СРОЧНО: казна у баков проверена Гошей • НЛО замечена у подъезда • Свежий курс пельменей: 1 кастрюля = 100% уюта • '
    },
    {
      headline: '«ВЕЧЕРНИЙ ШОТМАН» №405 — ВТОРАЯ ПОЛОСА',
      ticker: 'ХРОНИКА ДВОРА: половник Зинаиды на дежурстве • Казна у баков снова в топе • Курс пельменей стабильно горячий • '
    },
    {
      headline: '«ВЕЧЕРНИЙ ШОТМАН» №406 — ВЕЧЕРНИЙ НОМЕР',
      ticker: 'НОВОСТИ СЕКТОРА: пришельцы у подъезда торгуются за водку • Казна у баков охраняется • Свежий курс пельменей растёт • '
    }
  ];

  const BLACKOUT_WHISPERS = [
    '🐦‍⬛ *шёпот в темноте*: Свет погас, а я на шкафу вижу каждый шаг...',
    '🐦‍⬛ *шёпот в темноте*: Холодильник опять пустой, а я на шкафу всё вижу...',
    '🐦‍⬛ *шёпот в темноте*: За окном мелькнула тарелка — похоже, пришельцы снова прилетели...',
    '🐦‍⬛ *шёпот в темноте*: Кинескоп тёплый, в трёшке тихо — самое время для тайных планов.'
  ];

  const FIFTH_CLICK_EASTER_EGGS = {
    vodka: {
      caption: '🍾✨ РЕДКИЙ ДУБЛЬ (5 КЛИКОВ): Бутылка сама засияла и сказала: «Я — канон Шотмана, меня так просто не утащишь!»',
      sub: 'Скрытая пасхалка сработала — в трёшке наступил момент абсолютного почёта.'
    },
    pero: {
      caption: '🪶✨ РЕДКИЙ ДУБЛЬ (5 КЛИКОВ): Перо написало в воздухе целый тост и сделало почётную петлю над рюмкой!',
      sub: 'Пять касаний подряд разбудили вдохновение старого пера.'
    },
    gosha: {
      caption: '🐦‍⬛✨ РЕДКИЙ ДУБЛЬ (5 КЛИКОВ): Гоша поправил перья и прошептал: «Пять раз нажал — теперь я главный по орбите!»',
      sub: 'Ворон оценил упорство и выдал секретный доклад.'
    },
    nlo: {
      caption: '🛸✨ РЕДКИЙ ДУБЛЬ (5 КЛИКОВ): Тарелка моргнула всеми огнями и передала: «Землянин, мы сдаёмся — бери запасную воронку!»',
      sub: 'Пять кликов по НЛО вывели орбитальный сигнал на максимум.'
    }
  };

  const GIANT_UFO_LINES = [
    '🛸 Над отдалённой Землёй медленно выплывает гигантский НЛО.',
    '😈 Из тёмного купола доносится зловещий смех... «Му-ха-ха!»',
    '👁️ Огни на корпусе вспыхивают — тарелка замечает нас!',
    '⚡ Вспышка телепортации — корабль уходит в неизвестность, а мы возвращаемся к Земле.'
  ];

  const MOON_BASE_LINES = [
    '🌕 На орбите открывается огромная Луна с кратерами.',
    '🛸 На поверхности видна секретная лунная база пришельцев.',
    '🚨 Нас заметили! База начинает растворяться в дымке.',
    '🌑 Остаётся только голая Луна — плавный возврат обратно к Земле.'
  ];

  const SOLAR_SYSTEM_LINES = [
    '☀️ Вся Солнечная система на виду — планеты идут по своим орбитам.',
    '☄️ Внезапно мимо Юпитера проносится комета с пельменным хвостом и мигает маяк «ШОТМАН»!',
    '🪐 Планеты салютуют в такт орбитальному ритму — возвращаемся к Земле.'
  ];

  function smoothStep01(x) {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  }

  function bellCurve01(rawT) {
    return Math.sin(smoothStep01(Math.max(0, Math.min(1, rawT))) * Math.PI);
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function wrapCaptionLines(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = `${current} ${words[i]}`;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
    return lines;
  }

  function mapAsset(name) {
    try {
      var path = String(location.pathname || "/");
      if (path.indexOf("/assets/www") !== -1) return "maps/" + name;
      var cut = path.search(/\/(characters|game|story|videos|press|settings|about|wall|chat|saved|ideas|apk|passport|zashkvary|changelog|offline|donate|channel|citats)(\/|$)/);
      var base = cut >= 0 ? path.slice(0, cut + 1) : (path.charAt(path.length - 1) === "/" ? path : path.replace(/[^/]*$/, ""));
      if (!base || base.charAt(0) !== "/") base = "/" + (base || "");
      if (base.charAt(base.length - 1) !== "/") base += "/";
      return base + "maps/" + name;
    } catch (e) {
      return "maps/" + name;
    }
  }

  const WORLD_STAGES = [
    {
      id: 'earth',
      stageNum: 1,
      title: 'Этап 1 · Земля',
      kicker: 'ГЕОСКОП // СЕКТОР 01 · ЗЕМЛЯ (ПРОСПЕКТ ПЕЛЬМЕНЕЙ И ШОТМАНА)',
      hint: 'Клик по стикеру плавно приближает камеру к точке и запускает сценку. Отдали Землю — посмотришь космические мини-фильмы.',
      src: mapAsset('peter.jpg'),
      defaultZoom: 1.14,
      pins: [
        {
          id: 'shotman',
          label: 'Шотмана',
          icon: 'tower',
          x: 78,
          y: 64,
          kind: 'goto',
          goto: 'yard',
          tone: 'hero',
          blurb: 'Улица Шотмана и Переулок Вечного Минтая. Плавный залёт на 2-й этап — Двор Шотмана.'
        },
        {
          id: 'nlo',
          label: 'НЛО',
          icon: 'ufo',
          x: 38,
          y: 15,
          kind: 'look',
          tone: 'violet',
          blurb: 'Тарелка на орбите: лучи, похищение, гипноз на всю планету, рост, коровы, водка, рой НЛО и рептилоиды.'
        },
        {
          id: 'neva',
          label: 'Нева',
          icon: 'wave',
          x: 16,
          y: 58,
          kind: 'look',
          tone: 'teal',
          blurb: 'Нева у набережной: разливается по планете или устраивает футбольный парад «Зенит - чемпион!».'
        },
        {
          id: 'iskrovsky',
          label: 'Искровский',
          icon: 'block',
          x: 86,
          y: 38,
          kind: 'look',
          tone: 'gold',
          blurb: 'Искровский: бенгальский огонь или звёзды над кварталом.'
        },
        {
          id: 'pyaterochka',
          label: 'Пятёрочка',
          icon: 'shop',
          x: 30,
          y: 83,
          kind: 'look',
          tone: 'copper',
          blurb: 'Пятёрочка: плавная анимация еды и продуктов с полок.'
        },
        {
          id: 'apteka',
          label: 'Аптека',
          icon: 'cross',
          x: 58,
          y: 83,
          kind: 'look',
          tone: 'gold',
          blurb: 'Аптека: фармацевтка вежливо говорит «🏥: Приятного дня!».'
        },
        {
          id: 'earth-sausage',
          label: 'Батон колбасы',
          icon: 'sausage',
          x: 52,
          y: 34,
          kind: 'look',
          tone: 'copper',
          blurb: 'Батон колбасы: кошка пытается стащить, либо колбаса растёт, уменьшается и нарезается на части.'
        },
        {
          id: 'earth-linoleum',
          label: 'Рулон линолеума',
          icon: 'roll',
          x: 66,
          y: 50,
          kind: 'look',
          tone: 'violet',
          blurb: 'Рулон линолеума: расстилается на всю планету или кто-то режет линолеум на части.'
        },
        {
          id: 'earth-polovnik',
          label: 'Половник Зинаиды',
          icon: 'ladle',
          x: 25,
          y: 32,
          kind: 'look',
          tone: 'gold',
          blurb: 'Половник Зинаиды: мягко покачивается или бьёт по НЛО.'
        }
      ]
    },
    {
      id: 'yard',
      stageNum: 2,
      title: 'Этап 2 · Двор Шотмана',
      kicker: 'ГЕОСКОП // СЕКТОР 02 · ДВОР (ПЕРЕУЛОК КАЗНЫ И КИОСКОВ)',
      hint: 'Двор Шотмана: «Назад на Землю» возвращает на 1-й этап, «Хрущёвка» ведёт на 3-й этап с плавным залётом.',
      src: mapAsset('yard.jpg'),
      defaultZoom: 1.18,
      pins: [
        {
          id: 'back-to-earth',
          label: 'Назад на Землю',
          icon: 'tower',
          x: 12,
          y: 12,
          kind: 'goto',
          goto: 'earth',
          tone: 'teal',
          blurb: 'Плавный переход обратно на 1-й этап — Земля.'
        },
        {
          id: 'khrushchevka',
          label: 'Хрущёвка',
          icon: 'house',
          x: 70,
          y: 50,
          kind: 'goto',
          goto: 'flat',
          tone: 'hero',
          blurb: 'Дом у Переулка Тёплого Радиатора. Плавный залёт на 3-й этап — Квартира Юрца.'
        },
        {
          id: 'maxidom',
          label: 'Максидом',
          icon: 'shop',
          x: 24,
          y: 15,
          kind: 'look',
          tone: 'gold',
          blurb: 'Максидом: «👱‍♀️: Юр, ну ты даёшь!»'
        },
        {
          id: 'olimpik',
          label: 'Олимпик',
          icon: 'gym',
          x: 82,
          y: 15,
          kind: 'look',
          tone: 'copper',
          blurb: 'Строительный магазин «Олимпик»: «👷‍♂️: Юрец, ты уволен!»'
        },
        {
          id: 'zinaida',
          label: 'Балкон',
          icon: 'balcony',
          x: 75,
          y: 24,
          kind: 'look',
          tone: 'violet',
          blurb: 'Балкон: улетает в космос или падает вниз.'
        },
        {
          id: 'trolley',
          label: 'Троллейбус',
          icon: 'bus',
          x: 34,
          y: 38,
          kind: 'look',
          tone: 'teal',
          blurb: 'Троллейбус: едет вдаль или едет в «Олимпик».'
        },
        {
          id: 'larek',
          label: 'Ларёк',
          icon: 'kiosk',
          x: 44,
          y: 72,
          kind: 'look',
          tone: 'copper',
          blurb: 'Ларёк: сыпется водка или Толик продаёт водку.'
        },
        {
          id: 'kiosk',
          label: 'Киоск',
          icon: 'news',
          x: 55,
          y: 73,
          kind: 'look',
          tone: 'teal',
          blurb: 'Киоск: свежие номера газеты «Вечерний Шотман» с бегущей строкой.'
        },
        {
          id: 'pomoyka',
          label: 'Помойка',
          icon: 'bin',
          x: 15,
          y: 80,
          kind: 'look',
          tone: 'copper',
          blurb: 'Помойка: просрочка и находки, либо запах и бомж вокруг баков.'
        },
        {
          id: 'luzha',
          label: 'Лужа',
          icon: 'puddle',
          x: 68,
          y: 88,
          kind: 'look',
          tone: 'teal',
          blurb: 'Лужа: брызги и вода во все стороны.'
        },
        {
          id: 'yard-semki',
          label: 'Кулёк семок',
          icon: 'seeds',
          x: 60,
          y: 81,
          kind: 'look',
          tone: 'gold',
          blurb: 'Кулёк семок: семечки сыплются, а вокруг грязно от шелухи.'
        },
        {
          id: 'yard-antenna',
          label: 'Антенна Гоши',
          icon: 'raven',
          x: 26,
          y: 25,
          kind: 'look',
          tone: 'violet',
          blurb: 'Антенна Гоши: ворон каркает «РЕВЭЛ!» или много ворон летает и улетает мимо.'
        }
      ]
    },
    {
      id: 'flat',
      stageNum: 3,
      title: 'Этап 3 · Квартира Юрца',
      kicker: 'ГЕОСКОП // СЕКТОР 03 · ПЛАН КВАРТИРЫ ЮРЦА',
      hint: 'Схема квартиры: комнаты, диван, ковёр, стол и припасы с просрочкой. Жми на стикеры или припасы; «Живность» включает мошек и мух.',
      src: mapAsset('flat.jpg'),
      defaultZoom: 1.24,
      pins: [
        {
          id: 'back-to-yard',
          label: 'Назад во двор',
          icon: 'house',
          x: 13,
          y: 14,
          kind: 'goto',
          goto: 'yard',
          tone: 'teal',
          blurb: 'Плавный переход обратно на 2-й этап — Двор Шотмана.'
        },
        {
          id: 'vodka',
          label: 'Водка',
          icon: 'bottle',
          x: 20,
          y: 70,
          kind: 'look',
          tone: 'teal',
          blurb: 'Водка на кухонном столе: пришельцы похищают бутылку в луче или Юрец выпивает сам.'
        },
        {
          id: 'fridge',
          label: 'Холодильник',
          icon: 'fridge',
          x: 26,
          y: 42,
          kind: 'look',
          tone: 'teal',
          blurb: 'Холодильник у кухонного гарнитура: морозит всё вокруг или открывается дверца — а там пусто!'
        },
        {
          id: 'gosha',
          label: 'Гоша',
          icon: 'raven',
          x: 34,
          y: 18,
          kind: 'look',
          tone: 'violet',
          blurb: 'Гоша на шкафу у стены: ворон летает, каркает и клюёт.'
        },
        {
          id: 'raduga',
          label: 'Радуга',
          icon: 'tv',
          x: 47,
          y: 34,
          kind: 'look',
          tone: 'copper',
          blurb: 'Телевизор «Радуга» у дивана: цветной эфир, отключение света со шёпотом или Зинаида с репликой «Юрец, алкаш мой любимый!».'
        },
        {
          id: 'portret',
          label: 'Портрет',
          icon: 'frame',
          x: 54,
          y: 20,
          kind: 'look',
          tone: 'gold',
          blurb: 'Портрет на стене гостиной: разговаривает по-свойски.'
        },
        {
          id: 'granata',
          label: 'Граната',
          icon: 'grenade',
          x: 78,
          y: 30,
          kind: 'look',
          tone: 'violet',
          blurb: 'Граната на диване: 4 варианта взрыва с вибрацией.'
        },
        {
          id: 'drobovik',
          label: 'Дробовик',
          icon: 'gun',
          x: 89,
          y: 26,
          kind: 'look',
          tone: 'copper',
          blurb: 'Дробовик у стены: очередь из двух выстрелов, перезарядка и огонь из оружия.'
        },
        {
          id: 'pero',
          label: 'Перо',
          icon: 'feather',
          x: 24,
          y: 63,
          kind: 'look',
          tone: 'violet',
          blurb: 'Перо на столе: взлетает под потолок или встаёт в рюмку.'
        },
        {
          id: 'flat-pelmeni',
          label: 'Кастрюля пельменей',
          icon: 'pot',
          x: 33,
          y: 78,
          kind: 'look',
          tone: 'gold',
          blurb: 'Кастрюля пельменей на плите: горит или сгорает дотла.'
        },
        {
          id: 'flat-kasetnik',
          label: 'Магнитофон',
          icon: 'tape',
          x: 56,
          y: 66,
          kind: 'look',
          tone: 'teal',
          blurb: 'Магнитофон на тумбе: поёт нотами или сам играет музыку.'
        },
        {
          id: 'flat-kluchi',
          label: 'Связка ключей',
          icon: 'keys',
          x: 66,
          y: 54,
          kind: 'look',
          tone: 'copper',
          blurb: 'Связка ключей у двери: звон ключей или ключи и открытая дверь.'
        },
        {
          id: 'spoiled-kefir',
          label: 'Кефир',
          icon: 'spoiled',
          x: 16,
          y: 62,
          kind: 'look',
          tone: 'gold',
          hideLabel: true,
          blurb: 'Кефир с просрочкой на кухне — свежесть под вопросом, мошки на чеку.'
        },
        {
          id: 'spoiled-potato',
          label: 'Картошка',
          icon: 'spoiled',
          x: 25,
          y: 75,
          kind: 'look',
          tone: 'copper',
          hideLabel: true,
          blurb: 'Картошка на кухне — не первой свежести, но с характером.'
        },
        {
          id: 'spoiled-tomato',
          label: 'Помидоры',
          icon: 'spoiled',
          x: 21,
          y: 84,
          kind: 'look',
          tone: 'copper',
          hideLabel: true,
          blurb: 'Помидоры на столе — мошки уже составили расписание.'
        },
        {
          id: 'spoiled-cabbage',
          label: 'Пекинская капуста',
          icon: 'spoiled',
          x: 46,
          y: 46,
          kind: 'look',
          tone: 'teal',
          hideLabel: true,
          blurb: 'Пекинская капуста у проёма — шуршит и привлекает мошек.'
        }
      ]
    }
  ];

  // План квартиры с разбросанными точками просрочки
  function buildApartmentTexture(spoiledCoords) {
    const off = document.createElement('canvas');
    off.width = 512;
    off.height = 256;
    const ctx = off.getContext('2d');

    ctx.fillStyle = '#0d1a2c';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(110, 205, 235, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#9fd8eb';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 464, 208);

    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(168, 24);
    ctx.lineTo(168, 96);
    ctx.moveTo(168, 134);
    ctx.lineTo(168, 232);
    ctx.moveTo(344, 24);
    ctx.lineTo(344, 112);
    ctx.moveTo(344, 150);
    ctx.lineTo(344, 232);
    ctx.moveTo(168, 124);
    ctx.lineTo(252, 124);
    ctx.moveTo(292, 124);
    ctx.lineTo(344, 124);
    ctx.stroke();

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = 'rgba(185, 230, 248, 0.75)';
    ctx.fillText('КУХНЯ', 36, 42);
    ctx.fillText('ПРИХОЖАЯ', 182, 42);
    ctx.fillText('ГОСТИНАЯ', 182, 144);
    ctx.fillText('СПАЛЬНЯ', 358, 42);

    ctx.fillStyle = 'rgba(62, 196, 190, 0.22)';
    drawRoundedRect(ctx, 196, 162, 116, 36, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(62, 196, 190, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 190, 79, 0.35)';
    ctx.strokeRect(204, 170, 100, 20);

    ctx.fillStyle = 'rgba(217, 114, 66, 0.25)';
    drawRoundedRect(ctx, 42, 156, 98, 56, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 114, 66, 0.6)';
    ctx.stroke();

    const palette = ['#e8f4f8', '#c4935a', '#e64c3c', '#8fd165'];
    (spoiledCoords || []).forEach((pt, idx) => {
      const px = Math.round((pt.x / 100) * 512);
      const py = Math.round((pt.y / 100) * 256);
      ctx.fillStyle = palette[idx % palette.length];
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    return off;
  }

  // Синтезатор звуков в ретро-стиле
  class RetroAudio90s {
    constructor(isSoundOnFn) {
      this.ctx = null;
      this.isSoundOnFn = isSoundOnFn;
    }

    ensureCtx() {
      if (!this.isSoundOnFn || !this.isSoundOnFn()) return null;
      try {
        if (!this.ctx) {
          const AudioCtx = global.AudioContext || global.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      } catch (_) {
        return null;
      }
    }

    playTone(freq, durSec, type, gainPeak, delaySec) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        const t0 = ctx.currentTime + (delaySec || 0);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(gainPeak || 0.045, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + durSec);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + durSec + 0.02);
      } catch (_) {}
    }

    playStageShift() {
      this.playTone(260, 0.14, 'triangle', 0.045, 0);
      this.playTone(390, 0.18, 'triangle', 0.045, 0.08);
    }

    playPinFocus() {
      this.playTone(349.23, 0.08, 'sine', 0.04, 0);
      this.playTone(440, 0.1, 'triangle', 0.04, 0.05);
    }

    playLadle() {
      this.playTone(190, 0.09, 'triangle', 0.055, 0);
      this.playTone(145, 0.11, 'square', 0.035, 0.05);
    }

    playShotgun() {
      this.playTone(130, 0.16, 'sawtooth', 0.07, 0);
      this.playTone(75, 0.22, 'square', 0.06, 0.04);
    }

    playTape() {
      this.playTone(440, 0.1, 'triangle', 0.04, 0);
      this.playTone(554.37, 0.1, 'triangle', 0.04, 0.09);
      this.playTone(659.25, 0.14, 'triangle', 0.04, 0.18);
    }

    playKeys() {
      this.playTone(987.77, 0.07, 'sine', 0.045, 0);
      this.playTone(1318.51, 0.09, 'sine', 0.04, 0.05);
    }

    playCrow() {
      this.playTone(320, 0.08, 'sawtooth', 0.04, 0);
      this.playTone(240, 0.11, 'sawtooth', 0.04, 0.07);
    }

    playUfo() {
      this.playTone(520, 0.11, 'sine', 0.04, 0);
      this.playTone(780, 0.12, 'sine', 0.04, 0.09);
      this.playTone(460, 0.13, 'sine', 0.035, 0.18);
    }

    playSplash() {
      this.playTone(210, 0.09, 'sine', 0.04, 0);
      this.playTone(310, 0.08, 'triangle', 0.035, 0.05);
    }

    playWhisper() {
      this.playTone(175, 0.14, 'sine', 0.03, 0);
      this.playTone(215, 0.14, 'sine', 0.025, 0.1);
    }

    playCatch() {
      this.playTone(587.33, 0.07, 'triangle', 0.045, 0);
      this.playTone(880, 0.11, 'triangle', 0.045, 0.06);
    }

    playCometSurprise() {
      this.playTone(660, 0.09, 'sine', 0.04, 0);
      this.playTone(990, 0.11, 'triangle', 0.045, 0.07);
      this.playTone(1320, 0.15, 'sine', 0.04, 0.15);
    }

    playSadRain() {
      this.playTone(220, 0.18, 'sine', 0.035, 0);
      this.playTone(185, 0.22, 'sine', 0.035, 0.14);
    }

    playConfirmStep() {
      this.playTone(330, 0.08, 'triangle', 0.04, 0);
    }
  }

  function drawEmojiSticker(ctx, stickerChar, x, y, fontPx, tone, nowSec) {
    ctx.save();
    const pulse = 1 + 0.04 * Math.sin(nowSec * 1.8);
    const pad = Math.max(8, Math.round(fontPx * 0.34));
    const boxSize = Math.round((fontPx + pad * 2) * pulse);

    const glow = ctx.createRadialGradient(x, y, 2, x, y, boxSize * 0.72);
    glow.addColorStop(0, tone.fill + '55');
    glow.addColorStop(1, tone.fill + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, boxSize * 0.72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(9, 18, 34, 0.86)';
    ctx.strokeStyle = tone.fill;
    ctx.lineWidth = 1.6;
    drawRoundedRect(ctx, Math.round(x - boxSize / 2), Math.round(y - boxSize / 2), boxSize, boxSize, Math.round(boxSize * 0.24));
    ctx.fill();
    ctx.stroke();

    ctx.font = `${Math.round(fontPx * pulse)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stickerChar || '✨', Math.round(x), Math.round(y + 1));
    ctx.restore();
  }

  function readStorage(key, fallback) {
    try {
      const raw = global.localStorage && global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (_) {}
  }

  function buildXcomTexture(stageId, spoiledCoords) {
    if (stageId === 'flat') {
      return buildApartmentTexture(spoiledCoords);
    }

    const off = document.createElement('canvas');
    off.width = 512;
    off.height = 256;
    const ctx = off.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    if (stageId === 'earth') {
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(0.5, '#122c4d');
      grad.addColorStop(1, '#081324');
    } else {
      grad.addColorStop(0, '#101d30');
      grad.addColorStop(0.5, '#1b2f48');
      grad.addColorStop(1, '#0c1524');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = stageId === 'earth' ? 'rgba(42, 128, 98, 0.38)' : 'rgba(217, 114, 66, 0.25)';
    const blocks = [
      [36, 40, 100, 62],
      [165, 65, 125, 70],
      [315, 38, 135, 78],
      [85, 145, 115, 58],
      [255, 150, 155, 62]
    ];
    for (const [bx, by, bw, bh] of blocks) {
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(125, 226, 232, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
    }

    ctx.strokeStyle = 'rgba(110, 215, 225, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    return off;
  }

  function pinToSpherical(pin) {
    const u = Math.max(0.05, Math.min(0.95, Number(pin.x || 50) / 100));
    const v = Math.max(0.11, Math.min(0.89, Number(pin.y || 50) / 100));
    const lon = (u - 0.5) * Math.PI * 2;
    const lat = (0.5 - v) * Math.PI * 0.8;
    return { lon, lat };
  }

  function projectSpherePoint(lon, lat, yaw, pitch, radius, cx, cy) {
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const theta = lon + yaw;

    const x0 = cosLat * Math.sin(theta);
    const y0 = sinLat;
    const z0 = cosLat * Math.cos(theta);

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    const y1 = y0 * cosP - z0 * sinP;
    const z1 = y0 * sinP + z0 * cosP;

    return {
      x: cx + x0 * radius,
      y: cy - y1 * radius,
      z: z1,
      visible: z1 > 0.05
    };
  }

  class YurecWorldController {
    constructor(hostEl) {
      this.hostEl = hostEl;
      this.stages = WORLD_STAGES;
      this.stageIndex = 0;

      this.yaw = 0;
      this.pitch = 0.05;
      this.targetYaw = null;
      this.targetPitch = null;
      this.velYaw = 0;
      this.velPitch = 0;
      this.sunLon = -0.8;
      this.lastDaySide = null;
      this.dayNightNote = '';
      this.dayNightNoteTimer = 0;

      this.zoom = this.stages[0].defaultZoom;
      this.targetZoom = this.stages[0].defaultZoom;

      this.stageTransition = null;
      this.deepSpaceSecret = null;
      this.deepSpaceToggle = 0;

      this.autoSpin = true;
      this.calmMode = false;
      this.eveningBroadcastMode = false;
      this.invertControls = false;
      this.showGrid = true;
      this.showDayNight = true;
      this.vibrationEnabled = true;
      this.soundEnabled = true;
      try {
        if (localStorage.getItem('yurec-sound') === '0') this.soundEnabled = false;
        if (localStorage.getItem('yurec-vibrate') === '0') this.vibrationEnabled = false;
      } catch (e) {}
      this.flatCrittersEnabled = false;
      this.timeScaleIndex = 0;

      this.resetConfirmStep = 0;

      this.weatherIndex = 0;
      this.autoWeatherId = 'rain';
      this.weatherRotateProgress = 0;
      this.weatherRotateThreshold = 1.6 + Math.random() * 2.2;
      this.weatherParticles = Array.from({ length: 48 }, (_, i) => ({
        x: ((i * 73) % 1000) / 1000,
        y: ((i * 41) % 1000) / 1000,
        speed: 0.25 + (i % 5) * 0.09,
        size: 1.5 + (i % 3)
      }));

      this.flatCritters = Array.from({ length: 18 }, (_, i) => ({
        x: 0.15 + ((i * 61) % 700) / 1000,
        y: 0.2 + ((i * 83) % 600) / 1000,
        phase: i * 0.9,
        isFly: i % 3 === 0
      }));

      this.audio = new RetroAudio90s(() => this.soundEnabled);
      this.whisperIdx = 0;

      this.endFx = null;
      this.gameSummary = null;

      this.isDragging = false;
      this.dragMoved = false;
      this.lastPtrX = 0;
      this.lastPtrY = 0;

      this.pinchStartDist = 0;
      this.pinchStartZoom = this.zoom;

      this.textures = {};
      this.projectedPins = [];
      this.selectedPin = null;
      this.sceneAnim = null;

      this.pinSequenceMap = {};
      this.consecutivePinId = null;
      this.consecutivePinCount = 0;

      this.ambientSpawn = null;
      this.ambientCooldown = 1.6;

      this.patrolActive = false;
      this.patrolTargetPin = null;
      this.patrolScore = 0;
      this.patrolTimeLeft = 24;
      this.bestPatrol = Number(readStorage(STORAGE_KEYS.BEST_PATROL, 0)) || 0;

      this.goshaHuntActive = false;
      this.goshaHuntScore = 0;
      this.goshaHuntTimeLeft = 20;
      this.goshaBird = { x: 180, y: 150, vx: 140, vy: 100 };
      this.bestGoshaCatch = Number(readStorage(STORAGE_KEYS.BEST_GOSHA_CATCH, 0)) || 0;

      this.vodkaDefendActive = false;
      this.vodkaDefendScore = 0;
      this.vodkaDefendTimeLeft = 22;
      this.vodkaDefendHits = 0;
      this.vodkaDefendHitsNeeded = 2;
      this.ufoRaid = { x: 180, y: 105, vx: 115, bottleY: 225, stealing: true };
      this.bestVodkaDefend = Number(readStorage(STORAGE_KEYS.BEST_VODKA_DEFEND, 0)) || 0;

      this.visitedPins = Array.isArray(readStorage(STORAGE_KEYS.VISITED_PINS, []))
        ? readStorage(STORAGE_KEYS.VISITED_PINS, [])
        : [];

      this.stars = Array.from({ length: 85 }, (_, i) => ({
        x: ((i * 97) % 1000) / 1000,
        y: ((i * 53) % 1000) / 1000,
        r: i % 4 === 0 ? 1.8 : 1.0,
        phase: i * 0.61
      }));

      this.rafId = null;
      this.lastTime = 0;
      this.destroyed = false;

      this.buildDom();
      this.randomizeSpoiledSpots();
      this.loadTextures();
      this.bindEvents();
      this.selectInitialPin();
      this.syncUi();
      this.startLoop();
    }

    currentStage() {
      return this.stages[this.stageIndex] || this.stages[0];
    }

    currentTimeScale() {
      return TIME_SCALES[this.timeScaleIndex] || TIME_SCALES[0];
    }

    currentWeather() {
      return WEATHER_MODES[this.weatherIndex] || WEATHER_MODES[0];
    }

    activeWeatherEffectId() {
      const mode = this.currentWeather().id;
      if (mode === 'off') return 'off';
      if (mode === 'auto') return this.autoWeatherId;
      return mode;
    }

    randomizeSpoiledSpots() {
      const flatStage = this.stages.find((s) => s.id === 'flat');
      if (!flatStage) return;
      const coords = [];
      for (const pin of flatStage.pins) {
        if (!SPOILED_IDS.has(pin.id)) continue;
        pin.x = Math.round(14 + Math.random() * 72);
        pin.y = Math.round(22 + Math.random() * 64);
        coords.push({ x: pin.x, y: pin.y });
      }
      this.textures.flat = buildApartmentTexture(coords);
    }

    triggerVibrate(pattern) {
      if (!this.vibrationEnabled) return;
      try {
        if (global.navigator && typeof global.navigator.vibrate === 'function') {
          global.navigator.vibrate(pattern);
        }
      } catch (_) {}
    }

    pickSequentialVariant(pinId, variants) {
      const idx = this.pinSequenceMap[pinId] || 0;
      const chosen = variants[idx % variants.length];
      this.pinSequenceMap[pinId] = (idx + 1) % variants.length;
      return {
        item: chosen,
        variantIndex: (idx % variants.length) + 1,
        variantTotal: variants.length
      };
    }

    loadTextures() {
      this.stages.forEach((st) => {
        if (!this.textures[st.id]) {
          this.textures[st.id] = buildXcomTexture(st.id);
        }
        const img = new Image();
        img.onload = () => {
          if (this.destroyed) return;
          const texCanvas = document.createElement('canvas');
          texCanvas.width = 512;
          texCanvas.height = 256;
          const tctx = texCanvas.getContext('2d');
          tctx.drawImage(img, 0, 0, texCanvas.width, texCanvas.height);
          tctx.fillStyle = st.id === 'flat' ? 'rgba(13, 26, 44, 0.25)' : 'rgba(12, 28, 48, 0.34)';
          tctx.fillRect(0, 0, texCanvas.width, texCanvas.height);
          this.textures[st.id] = texCanvas;
        };
        img.onerror = () => {};
        img.src = st.src;
      });
    }

    selectInitialPin() {
      const st = this.currentStage();
      const pin = st.pins.find((p) => p.kind === 'goto') || st.pins[0];
      if (pin) {
        this.focusOnPin(pin, false, false, false);
      }
    }

    goToStage(stageIdOrIdx) {
      let nextIdx = typeof stageIdOrIdx === 'number'
        ? stageIdOrIdx
        : this.stages.findIndex((s) => s.id === stageIdOrIdx);
      if (nextIdx < 0 || nextIdx >= this.stages.length) nextIdx = 0;
      if (nextIdx === this.stageIndex && !this.stageTransition) return;

      this.deepSpaceSecret = null;
      this.sceneAnim = null;
      const dir = nextIdx > this.stageIndex ? 1 : -1;

      if (this.stages[nextIdx] && this.stages[nextIdx].id === 'flat') {
        this.randomizeSpoiledSpots();
      }

      this.stageTransition = {
        phase: 'out',
        timer: 0.95,
        duration: 0.95,
        nextIdx,
        dir
      };

      this.targetZoom = dir > 0 ? Math.min(2.1, this.zoom * 1.45) : Math.max(0.58, this.zoom * 0.72);
      this.triggerVibrate(35);
      this.audio.playStageShift();
      this.syncUi();
    }

    triggerDeepSpaceSecret() {
      if (this.deepSpaceSecret || this.stageIndex !== 0) return;
      const seq = ['giant-ufo', 'moon-base', 'solar-system'];
      const kind = seq[this.deepSpaceToggle % seq.length];
      this.deepSpaceToggle += 1;
      this.sceneAnim = null;
      this.ambientSpawn = null;
      this.triggerVibrate([60, 40, 80]);
      if (kind === 'solar-system') {
        this.audio.playCometSurprise();
      } else {
        this.audio.playUfo();
      }

      this.deepSpaceSecret = {
        kind,
        timer: 13.6,
        duration: 13.6
      };
      this.syncUi();
    }

    createSceneForPin(pin) {
      const id = pin.id;
      const baseMeta = {
        pin,
        timer: 7.2,
        duration: 7.2,
        variantIndex: 1,
        variantTotal: 1
      };

      if (SPOILED_REACTIONS[id]) {
        this.triggerVibrate(25);
        this.audio.playWhisper();
        const sp = SPOILED_REACTIONS[id];
        return {
          ...baseMeta,
          kind: 'spoiled-item',
          caption: `${sp.title}: ${sp.text}`,
          sub: pin.blurb
        };
      }

      if (this.consecutivePinId === id && this.consecutivePinCount >= 5) {
        this.consecutivePinCount = 0;
        const egg = FIFTH_CLICK_EASTER_EGGS[id] || {
          caption: `✨ РЕДКИЙ ДУБЛЬ (5 КЛИКОВ): ${pin.label} выдал секретный канон Шотмана!`,
          sub: 'Пять нажатий подряд открыли бонусную реплику.'
        };
        this.triggerVibrate([50, 30, 50, 30, 70]);
        this.audio.playKeys();
        return {
          ...baseMeta,
          kind: 'funny-spark',
          caption: egg.caption,
          sub: egg.sub
        };
      }

      if (id === 'nlo') {
        this.triggerVibrate([70, 50, 90]);
        this.audio.playUfo();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'ufo-creepy-abduct',
            caption: '🛸 НЛО: тревожный луч похищения! «Тёмная тарелка тянет трофей в пустоту!»',
            sub: 'Зловещий луч плавно пульсирует над планетой.'
          },
          {
            kind: 'ufo-creepy-hypnosis',
            caption: '🌀 НЛО: гипноз накрывает всю планету! «Вся сфера погружается в транс...»',
            sub: 'Гипнотические кольца расширяются на всю планету.'
          },
          {
            kind: 'ufo-grow-giant',
            caption: '🛸 НЛО: увеличивается до большого размера! «Тарелка накрыла горизонт!»',
            sub: 'Корабль пришельцев плавно вырастает.'
          },
          {
            kind: 'ufo-cow-abduct',
            caption: '🐄 НЛО: похищение коров! «Му-у-у... корова улетает в зелёном луче!»',
            sub: 'Пришельцы забрали парнокопытный образец на орбиту.'
          },
          {
            kind: 'ufo-drink-vodka',
            caption: '🍾 НЛО: пришельцы пьют водку! «За земной контакт, до дна!»',
            sub: 'Экипаж тарелки устроил дегустацию прямо на орбите.'
          },
          {
            kind: 'ufo-swarm-and-back',
            caption: '🛸 НЛО: тарелок становится много, а потом снова мало! «Орбитальный рой!»',
            sub: 'Сначала появляется целая эскадрилья, затем лишние улетают.'
          },
          {
            kind: 'ufo-reptiloids-globe',
            caption: '🦎 НЛО: огромные рептилоиды выходят из тарелки и обхватывают земной шар целиком!',
            sub: '«Шотман под надёжным рептилоидным обхватом!»'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'neva') {
        this.triggerVibrate([55, 35, 65]);
        this.audio.playSplash();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'neva-flood',
            caption: '🌊 Нева разливается и накрывает всю планету! «Вода прибывает по кругу!»',
            sub: 'Река заливает сферу на несколько секунд и плавно отступает.'
          },
          {
            kind: 'neva-zenit-football',
            caption: '⚽ Зенит - чемпион! 🏆',
            sub: 'Яркий футбольный праздник: мячи, ворота и трибуны на всю сцену.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'iskrovsky') {
        this.triggerVibrate(45);
        this.audio.playKeys();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'iskrovsky-sparkler',
            caption: '🎇 Искровский: искры летят как бенгальский огонь!',
            sub: 'Праздничные искорки разлетаются крупным снопом.'
          },
          {
            kind: 'iskrovsky-stars',
            caption: '⭐ Искровский: звёзды сияют над районом!',
            sub: 'Крупные звёзды ярко сияют над планетой.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'pyaterochka') {
        this.triggerVibrate(40);
        this.audio.playTape();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'pyaterochka-food-1',
            caption: '🧀 Пятёрочка: сыр, кефир и батон вышли на прогулку!',
            sub: 'Еда крупным планом над магазином.'
          },
          {
            kind: 'pyaterochka-food-2',
            caption: '🥟 Пятёрочка: пельмени, минтай и пряники в сборе!',
            sub: 'Продукты кружат крупным планом.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'apteka') {
        this.triggerVibrate(30);
        this.audio.playKeys();
        return {
          ...baseMeta,
          kind: 'apteka-greet',
          caption: '🏥: Приятного дня!',
          sub: 'Фармацевтка желает хорошего дня.'
        };
      }

      if (id === 'earth-sausage') {
        this.triggerVibrate(45);
        this.audio.playTape();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'cat-sausage',
            caption: '🐱 Батон колбасы: кошка хочет его стащить! «Мяу, почти унесла!»',
            sub: 'Крупный батон колбасы и кошка рядом.'
          },
          {
            kind: 'sausage-grow-slice',
            caption: '🌭 Батон колбасы: растёт, уменьшается и нарезается на части!',
            sub: 'Крупный батон меняется в размере и делится на куски.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'earth-linoleum') {
        this.triggerVibrate(50);
        this.audio.playLadle();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'linoleum-earth',
            caption: '🪵 Рулон линолеума накрывает всю планету — линолеумная земля!',
            sub: 'Через несколько секунд покрытие сворачивается обратно.'
          },
          {
            kind: 'linoleum-cut-parts',
            caption: '✂️ Рулон линолеума: кто-то режет линолеум на части!',
            sub: 'Крупный рулон линолеума делится на части.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'earth-polovnik') {
        this.triggerVibrate([65, 35, 85]);
        this.audio.playLadle();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'ladle-gentle',
            caption: '🥄 Половник Зинаиды мягко покачивается туда-сюда.',
            sub: 'Крупный половник плавно качается.'
          },
          {
            kind: 'ladle-hit-ufo',
            caption: '🥄💥 Половник Зинаиды бьёт прямо по НЛО! «Получай с орбиты!»',
            sub: 'Половник летит в тарелку и наносит точный удар!'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'maxidom') {
        this.triggerVibrate(40);
        this.audio.playKeys();
        return {
          ...baseMeta,
          kind: 'sveta-card',
          caption: '👱‍♀️: Юр, ну ты даёшь!',
          sub: 'Светлана и сердце — без вспышки экрана.'
        };
      }

      if (id === 'olimpik') {
        this.triggerVibrate(50);
        this.audio.playLadle();
        return {
          ...baseMeta,
          kind: 'lysyi-card',
          caption: '👷‍♂️: Юрец, ты уволен!',
          sub: 'Лысый у строительного магазина «Олимпик» — без вспышки экрана.'
        };
      }

      if (id === 'zinaida') {
        this.triggerVibrate([65, 40, 65]);
        this.audio.playUfo();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'balcony-space',
            caption: '🚀 Балкон улетает в космос! «Курс — выше крыш!»',
            sub: 'Крупный балкон поднимается к звёздам.'
          },
          {
            kind: 'balcony-fall-down',
            caption: '⬇️ Балкон падает вниз! «Спуск на первый этаж!»',
            sub: 'Крупный балкон опускается вниз.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'trolley') {
        this.triggerVibrate(45);
        this.audio.playTape();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'trolley-far',
            caption: '🚎 Троллейбус едет вдаль! «Уходит за горизонт!»',
            sub: 'Крупный троллейбус катит вдаль.'
          },
          {
            kind: 'trolley-to-olimpik',
            caption: '🚎🏗️ Троллейбус едет в «Олимпик»! «Прямой рейс к стройке!»',
            sub: 'Троллейбус едет к магазину «Олимпик».'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'larek') {
        this.triggerVibrate(45);
        this.audio.playKeys();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'vodka-shower',
            caption: '🍾 Из ларька сыпется водка! «Окошко работает!»',
            sub: 'Крупные бутылки сыплются у ларька.'
          },
          {
            kind: 'tolik-sells-vodka',
            caption: '🧑‍🔧 Толик продаёт водку в ларьке!',
            sub: 'Крупная сцена в ларьке: Толик подаёт бутылку.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'kiosk') {
        this.triggerVibrate(40);
        this.audio.playTape();
        const picked = this.pickSequentialVariant(id, NEWSPAPER_ISSUES);
        return {
          ...baseMeta,
          timer: 12.8,
          duration: 12.8,
          kind: 'kiosk-newspaper',
          headline: picked.item.headline,
          ticker: picked.item.ticker,
          caption: picked.item.headline,
          sub: 'Свежий выпуск «Вечернего Шотмана» с бегущей строкой новостей.',
          variantIndex: picked.variantIndex,
          variantTotal: picked.variantTotal
        };
      }

      if (id === 'pomoyka') {
        this.triggerVibrate(45);
        this.audio.playSplash();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'pomoyka-trash',
            caption: '🗑️ Помойка: просрочка и дворовые находки вышли наружу!',
            sub: '«Вся казна на месте!»'
          },
          {
            kind: 'pomoyka-stink-hobo',
            caption: '🤢 Помойка: запах неприятный, бомж тусуется вокруг!',
            sub: 'Волны запаха и дворовый гость у баков.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'luzha') {
        this.triggerVibrate(45);
        this.audio.playSplash();
        return {
          ...baseMeta,
          kind: 'puddle-splash',
          caption: '💧 Лужа: брызги воды во все стороны!',
          sub: 'Крупные брызги и круги на воде.'
        };
      }

      if (id === 'yard-semki') {
        this.triggerVibrate(40);
        this.audio.playTape();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'seeds-rain',
            caption: '🌻 Кулёк семок: семечки сыплются!',
            sub: 'Крупный кулёк и падающие семечки.'
          },
          {
            kind: 'seeds-dirty-around',
            caption: '🧹 Кулёк семок: грязно вокруг от шелухи!',
            sub: 'Весь пятачок усыпан шелухой.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'yard-antenna') {
        this.triggerVibrate(45);
        this.audio.playCrow();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'gosha-revel',
            caption: '🐦‍⬛ Ворон Гоша летает и каркает: РЕВЭЛ!',
            sub: 'Крупный ворон Гоша над антенной.'
          },
          {
            kind: 'flock-ravens-flyby',
            caption: '🐦‍⬛ Много ворон летает и улетает мимо!',
            sub: 'Стая ворон пролетает через экран.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'vodka') {
        this.triggerVibrate([55, 35, 55]);
        this.audio.playUfo();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'vodka-alien-steal',
            caption: '🛸 Пришельцы похищают водку в луче! «Забираем на тарелку!»',
            sub: 'Крупная бутылка поднимается к НЛО в луче.'
          },
          {
            kind: 'vodka-yurec-drink',
            caption: '🥂 Юрец выпивает водку сам! «За Шотман, до дна!»',
            sub: 'Крупный тост на кухне.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'fridge') {
        this.triggerVibrate(45);
        this.audio.playSplash();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'fridge-freeze',
            caption: '🧊 Холодильник морозит всё вокруг!',
            sub: 'Крупный холодильник и ледяной иней.'
          },
          {
            kind: 'fridge-open-empty',
            caption: '🚪 Холодильник открывается и там пусто!',
            sub: 'Крупный холодильник с пустыми полками.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'gosha') {
        this.triggerVibrate(50);
        this.audio.playCrow();
        return {
          ...baseMeta,
          kind: 'gosha-peck',
          caption: '🐦‍⬛ Гоша: ворон летает, каркает «РЕВЭЛ!» и клюёт!',
          sub: 'Крупный ворон Гоша на шкафу и в полёте.'
        };
      }

      if (id === 'raduga') {
        this.triggerVibrate(35);
        this.audio.playWhisper();
        const whisperText = BLACKOUT_WHISPERS[this.whisperIdx % BLACKOUT_WHISPERS.length];
        this.whisperIdx = (this.whisperIdx + 1) % BLACKOUT_WHISPERS.length;
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'raduga-tv-show',
            caption: '📺 Радуга: телевизор крутит цветные полосы и ретро-эфир!',
            sub: 'Крупный телевизор «Радуга» с ярким сигналом.'
          },
          {
            kind: 'blackout-whisper',
            whisperText,
            caption: `🕯️ Свет отключили в трёшке! ${whisperText}`,
            sub: 'Ночной режим кинескопа с лёгким шумом; тапни по центру экрана для нового шёпота Гоши.'
          },
          {
            kind: 'zinaida-tv-beloved',
            caption: '👵: Юрец, алкаш мой любимый!',
            sub: 'Бабка Зинаида в хрущёвке комментирует эфир у телевизора.'
          }
        ]);
        return {
          ...baseMeta,
          timer: 12.8,
          duration: 12.8,
          ...picked.item,
          variantIndex: picked.variantIndex,
          variantTotal: picked.variantTotal
        };
      }

      if (id === 'portret') {
        this.triggerVibrate(35);
        this.audio.playKeys();
        return {
          ...baseMeta,
          kind: 'portrait-talk',
          caption: '🖼️ Портрет разговаривает: «Юр, ну ты даёшь!»',
          sub: 'Крупный портрет в рамке с репликой.'
        };
      }

      if (id === 'granata') {
        this.triggerVibrate([150, 60, 170, 60, 150]);
        this.audio.playShotgun();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'granade-shockwave',
            caption: '💣 Однажды, став жертвой своей бесконечной депрессии, он вышел на улицу с гранатой',
            sub: 'Крупная граната и взрывная волна.'
          },
          {
            kind: 'granade-blast',
            caption: '💥 Кажется, что даже серо-бетонные стены вздохнули с облегчением и улица стала на одно безмолвное одинокое место меньше',
            sub: 'Крупный взрыв с дымом и искрами.'
          },
          {
            kind: 'granade-chain',
            caption: '🌯 Шаверму в лаваше!!! И скидку!',
            sub: 'Цепная реакция взрывов крупным планом.'
          },
          {
            kind: 'granade-planet-boom',
            caption: '🌍💥 Он взорвал всю улицу Шотмана!',
            sub: 'Крупный взрыв всей планеты с вибрацией.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'drobovik') {
        this.triggerVibrate([130, 70, 130, 180, 150]);
        this.audio.playShotgun();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'shotgun-double-reload',
            caption: '🔫 Дробовик: БА-БАХ, БА-БАХ! Перезарядка — и снова БА-БАХ!',
            sub: 'Крупный дробовик: два выстрела, перезарядка и выстрел.'
          },
          {
            kind: 'shotgun-fire-flame',
            caption: '🔥 Дробовик: яркий огонь из ствола!',
            sub: 'Крупный дробовик с огнём и вибрацией.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'pero') {
        this.triggerVibrate(35);
        this.audio.playKeys();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'feather-fly',
            caption: '🪶 Перо взлетает под потолок!',
            sub: 'Крупное перо плавно летит вверх.'
          },
          {
            kind: 'feather-into-shotglass',
            caption: '🥃 Перо встаёт в рюмку!',
            sub: 'Крупное перо опускается прямо в рюмку.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'flat-pelmeni') {
        this.triggerVibrate(50);
        this.audio.playLadle();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'pelmeni-fire',
            caption: '🥟🔥 Кастрюля пельменей горит! Огонь на плите!',
            sub: 'Крупная кастрюля пельменей в пламени.'
          },
          {
            kind: 'pelmeni-burn-out',
            caption: '🥟💨 Кастрюля пельменей сгорает!',
            sub: 'Крупная кастрюля после сильного огня.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'flat-kasetnik') {
        this.triggerVibrate(40);
        this.audio.playTape();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'tape-sing',
            caption: '📼 Магнитофон поёт: ♪ ♫ ♪',
            sub: 'Крупный магнитофон с летящими нотами.'
          },
          {
            kind: 'tape-auto-music',
            caption: '🎵 Магнитофон сам играет музыку!',
            sub: 'Крупный магнитофон крутит кассету сам.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      if (id === 'flat-kluchi') {
        this.triggerVibrate([60, 30, 60]);
        this.audio.playKeys();
        const picked = this.pickSequentialVariant(id, [
          {
            kind: 'keys-jingle',
            caption: '🔑 Связка ключей звенит: ДЗИНЬ-ДЗИНЬ!',
            sub: 'Крупная связка ключей звенит.'
          },
          {
            kind: 'keys-open-door',
            caption: '🔑🚪 Ключи и открытая дверь: замок щёлкнул, дверь распахнута!',
            sub: 'Крупные ключи рядом с открытой дверью.'
          }
        ]);
        return { ...baseMeta, ...picked.item, variantIndex: picked.variantIndex, variantTotal: picked.variantTotal };
      }

      this.triggerVibrate(35);
      this.audio.playKeys();
      return {
        ...baseMeta,
        kind: 'funny-spark',
        caption: `${PIN_STICKERS[id] || '✨'} ${pin.label}: «Всё по лору!»`,
        sub: pin.blurb
      };
    }

    focusOnPin(pin, markVisited = true, allowStageJump = true, launchAnim = true) {
      if (!pin) return;
      this.selectedPin = pin;

      if (this.consecutivePinId === pin.id) {
        this.consecutivePinCount += 1;
      } else {
        this.consecutivePinId = pin.id;
        this.consecutivePinCount = 1;
      }

      if (allowStageJump && pin.kind === 'goto' && pin.goto) {
        if (markVisited) {
          const key = `${this.currentStage().id}:${pin.id}`;
          if (!this.visitedPins.includes(key)) {
            this.visitedPins.push(key);
            writeStorage(STORAGE_KEYS.VISITED_PINS, this.visitedPins);
          }
        }
        this.goToStage(pin.goto);
        return;
      }

      const { lon, lat } = pinToSpherical(pin);
      this.targetYaw = -lon;
      this.targetPitch = lat * 0.7;
      this.targetZoom = Math.min(1.92, Math.max(this.targetZoom, this.currentStage().defaultZoom * 1.28));
      this.velYaw = 0;
      this.velPitch = 0;

      if (launchAnim) {
        this.ambientSpawn = null;
        this.sceneAnim = this.createSceneForPin(pin);
        this.audio.playPinFocus();
      }

      if (markVisited) {
        const key = `${this.currentStage().id}:${pin.id}`;
        if (!this.visitedPins.includes(key)) {
          this.visitedPins.push(key);
          writeStorage(STORAGE_KEYS.VISITED_PINS, this.visitedPins);
        }
      }

      if (this.patrolActive && this.patrolTargetPin && pin.id === this.patrolTargetPin.id) {
        this.patrolScore += 1;
        this.audio.playCatch();
        const bonusSec = Math.max(1.0, 3.6 - this.patrolScore * 0.25);
        this.patrolTimeLeft = Math.min(24, this.patrolTimeLeft + bonusSec);
        if (this.patrolScore > this.bestPatrol) {
          this.bestPatrol = this.patrolScore;
          writeStorage(STORAGE_KEYS.BEST_PATROL, this.bestPatrol);
        }
        this.pickPatrolTarget();
      }

      this.syncUi();
    }

    triggerRandomGag() {
      const stage = this.currentStage();
      const pool = stage.pins.filter((p) => p.kind !== 'goto');
      if (!pool.length) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      this.focusOnPin(pick, true, false, true);
    }

    applyEveningBroadcastPreset() {
      this.eveningBroadcastMode = !this.eveningBroadcastMode;
      if (this.eveningBroadcastMode) {
        this.calmMode = false;
        this.showDayNight = true;
        this.autoSpin = true;
        if (this.weatherIndex === 0) {
          this.weatherIndex = 2;
        }
        if (this.ambientCooldown > 100) this.ambientCooldown = 1.6;
      }
      this.audio.playStageShift();
      this.syncUi();
    }

    toggleCalmPreset() {
      this.calmMode = !this.calmMode;
      if (this.calmMode) {
        this.eveningBroadcastMode = false;
        this.autoSpin = false;
        this.weatherIndex = 0;
        this.flatCrittersEnabled = false;
        this.ambientSpawn = null;
        this.ambientCooldown = 999999;
        this.velYaw = 0;
        this.velPitch = 0;
      } else {
        this.autoSpin = true;
        this.ambientCooldown = 1.6;
      }
      this.audio.playStageShift();
      this.syncUi();
    }

    handleResetRecordsClick() {
      if (this.resetConfirmStep === 0) {
        this.resetConfirmStep = 1;
        this.audio.playConfirmStep();
        this.syncUi();
        return;
      }

      this.resetConfirmStep = 0;
      this.bestPatrol = 0;
      this.bestGoshaCatch = 0;
      this.bestVodkaDefend = 0;
      this.visitedPins = [];
      this.pinSequenceMap = {};
      this.consecutivePinId = null;
      this.consecutivePinCount = 0;
      this.gameSummary = null;

      writeStorage(STORAGE_KEYS.BEST_PATROL, 0);
      writeStorage(STORAGE_KEYS.BEST_GOSHA_CATCH, 0);
      writeStorage(STORAGE_KEYS.BEST_VODKA_DEFEND, 0);
      writeStorage(STORAGE_KEYS.VISITED_PINS, []);

      this.endFx = { kind: 'sad-rain', timer: 3.0, duration: 3.0 };
      this.triggerVibrate([60, 50, 60]);
      this.audio.playSadRain();
      this.syncUi();
    }

    finishMiniGame(gameId) {
      if (gameId === 'patrol') {
        this.patrolActive = false;
        this.patrolTargetPin = null;
        this.gameSummary = {
          gameId: 'patrol',
          title: '🔎 Поиск предметов завершён',
          summaryText: `Найдено: ${this.patrolScore} · Рекорд: ${this.bestPatrol}`
        };
        this.endFx = { kind: 'patrol-salute', timer: 3.0, duration: 3.0 };
        this.audio.playCometSurprise();
      } else if (gameId === 'gosha') {
        this.goshaHuntActive = false;
        this.gameSummary = {
          gameId: 'gosha',
          title: '🐦‍⬛ Ловля Гоши завершена',
          summaryText: `Поймано: ${this.goshaHuntScore} · Рекорд: ${this.bestGoshaCatch}`
        };
        this.endFx = { kind: 'gosha-stars', timer: 3.0, duration: 3.0 };
        this.audio.playCatch();
      } else if (gameId === 'vodka') {
        this.vodkaDefendActive = false;
        this.gameSummary = {
          gameId: 'vodka',
          title: '🍾 Защита водки завершена',
          summaryText: `Отбито: ${this.vodkaDefendScore} · Рекорд: ${this.bestVodkaDefend}`
        };
        this.endFx = { kind: 'vodka-confetti', timer: 3.0, duration: 3.0 };
        this.audio.playKeys();
      }
      this.syncUi();
    }

    restartMiniGameById(gameId) {
      this.gameSummary = null;
      this.endFx = null;
      if (gameId === 'patrol') this.startPatrolGame();
      else if (gameId === 'gosha') this.startGoshaHuntGame();
      else if (gameId === 'vodka') this.startVodkaDefendGame();
    }

    spawnAmbientForStage() {
      if (this.calmMode || this.sceneAnim || this.deepSpaceSecret || this.stageTransition || this.patrolActive || this.goshaHuntActive || this.vodkaDefendActive) {
        return;
      }

      const stage = this.currentStage();
      const w = this.canvas ? Math.max(260, this.canvas.clientWidth || 360) : 360;
      const h = this.canvas ? Math.max(260, this.canvas.clientHeight || 420) : 420;
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? 32 : w - 32;
      const startY = 52 + Math.random() * Math.max(80, h - 130);
      const speedX = (fromLeft ? 1 : -1) * (95 + Math.random() * 65);
      const speedY = (Math.random() - 0.5) * 70;

      if (stage.id === 'earth') {
        this.ambientSpawn = {
          kind: 'ufo-quick',
          sticker: '🛸',
          text: 'НЛО',
          x: startX,
          y: startY,
          vx: speedX,
          vy: speedY,
          timer: 1.55,
          duration: 1.55
        };
      } else if (stage.id === 'yard') {
        this.ambientSpawn = {
          kind: 'raven-quick',
          sticker: '🐦‍⬛',
          text: 'КАР!',
          x: startX,
          y: startY,
          vx: speedX * 1.15,
          vy: speedY,
          timer: 1.55,
          duration: 1.55
        };
      } else {
        this.ambientSpawn = {
          kind: 'yurec-legend',
          sticker: '👑',
          text: 'Я, бля, легенда!',
          x: 64 + Math.random() * Math.max(80, w - 140),
          y: 74 + Math.random() * Math.max(80, h - 140),
          vx: (Math.random() < 0.5 ? -1 : 1) * 145,
          vy: (Math.random() < 0.5 ? -1 : 1) * 115,
          timer: 1.7,
          duration: 1.7
        };
      }
    }

    clearMiniGames() {
      this.patrolActive = false;
      this.patrolTargetPin = null;
      this.goshaHuntActive = false;
      this.vodkaDefendActive = false;
      this.gameSummary = null;
      this.ambientSpawn = null;
    }

    startPatrolGame() {
      this.clearMiniGames();
      this.patrolActive = true;
      this.patrolScore = 0;
      this.patrolTimeLeft = 24;
      this.autoSpin = false;
      this.pickPatrolTarget();
      this.audio.playStageShift();
      this.syncUi();
    }

    stopPatrolGame() {
      this.patrolActive = false;
      this.patrolTargetPin = null;
      this.syncUi();
    }

    startGoshaHuntGame() {
      this.clearMiniGames();
      this.goshaHuntActive = true;
      this.goshaHuntScore = 0;
      this.goshaHuntTimeLeft = 20;
      this.goshaBird = { x: 140, y: 130, vx: 140, vy: 100 };
      this.audio.playCrow();
      this.syncUi();
    }

    stopGoshaHuntGame() {
      this.goshaHuntActive = false;
      this.syncUi();
    }

    startVodkaDefendGame() {
      this.clearMiniGames();
      this.vodkaDefendActive = true;
      this.vodkaDefendScore = 0;
      this.vodkaDefendTimeLeft = 22;
      this.vodkaDefendHits = 0;
      this.vodkaDefendHitsNeeded = 2;
      const w = this.canvas ? Math.max(240, this.canvas.clientWidth || 360) : 360;
      const h = this.canvas ? Math.max(240, this.canvas.clientHeight || 420) : 420;
      this.ufoRaid = {
        x: w * 0.5,
        y: Math.max(70, h * 0.24),
        vx: 115,
        bottleY: Math.min(h - 46, h * 0.68),
        stealing: true
      };
      this.audio.playUfo();
      this.syncUi();
    }

    stopVodkaDefendGame() {
      this.vodkaDefendActive = false;
      this.syncUi();
    }

    pickPatrolTarget() {
      const pins = this.currentStage().pins;
      if (!pins.length) return;
      const candidates = pins.filter((p) => !this.patrolTargetPin || p.id !== this.patrolTargetPin.id);
      const list = candidates.length ? candidates : pins;
      this.patrolTargetPin = list[Math.floor(Math.random() * list.length)];
    }

    update(dtSec) {
      const scale = this.currentTimeScale();
      const wMode = this.currentWeather().id;
      const activeWeather = this.activeWeatherEffectId();

      if (this.endFx) {
        this.endFx.timer -= dtSec;
        if (this.endFx.timer <= 0) {
          this.endFx = null;
        }
      }

      if (wMode === 'auto' && !this.calmMode && this.stageIndex < 2) {
        const rotRate = (this.autoSpin ? scale.radPerSec : 0.05) * scale.weatherFactor;
        this.weatherRotateProgress += rotRate * dtSec;
        if (this.weatherRotateProgress >= this.weatherRotateThreshold) {
          this.weatherRotateProgress = 0;
          this.weatherRotateThreshold = 1.6 + Math.random() * 2.4;
          const others = AUTO_WEATHER_POOL.filter((id) => id !== this.autoWeatherId);
          this.autoWeatherId = others[Math.floor(Math.random() * others.length)] || 'rain';
          this.syncUi();
        }
      }

      if (!this.calmMode && this.stageIndex < 2 && activeWeather !== 'off') {
        for (const p of this.weatherParticles) {
          if (activeWeather === 'rain') {
            p.y += p.speed * 0.65 * dtSec;
            p.x -= 0.06 * dtSec;
          } else if (activeWeather === 'snow') {
            p.y += p.speed * 0.26 * dtSec;
            p.x += Math.sin(performance.now() / 900 + p.y * 8) * 0.04 * dtSec;
          } else if (activeWeather === 'storm') {
            p.x += p.speed * 1.05 * dtSec;
            p.y += Math.sin(performance.now() / 280 + p.x * 10) * 0.22 * dtSec;
          } else if (activeWeather === 'tornado') {
            p.x += Math.cos(performance.now() / 340 + p.y * 12) * 0.35 * dtSec;
            p.y -= p.speed * 0.32 * dtSec;
          }
          if (p.y > 1.05) p.y = -0.05;
          if (p.y < -0.05) p.y = 1.05;
          if (p.x > 1.05) p.x = -0.05;
          if (p.x < -0.05) p.x = 1.05;
        }
      }

      if (!this.calmMode && this.stageIndex === 2 && this.flatCrittersEnabled) {
        const nowS = performance.now() / 1000;
        for (const c of this.flatCritters) {
          c.x += Math.cos(nowS * 2.1 + c.phase) * 0.14 * dtSec;
          c.y += Math.sin(nowS * 2.7 + c.phase) * 0.14 * dtSec;
          c.x = Math.max(0.08, Math.min(0.92, c.x));
          c.y = Math.max(0.14, Math.min(0.88, c.y));
        }
      }

      if (this.stageTransition) {
        this.stageTransition.timer -= dtSec;
        if (this.stageTransition.phase === 'out' && this.stageTransition.timer <= 0) {
          this.stageIndex = this.stageTransition.nextIdx;
          const nextStage = this.currentStage();
          this.stageTransition.phase = 'in';
          this.stageTransition.timer = 1.05;
          this.stageTransition.duration = 1.05;

          this.zoom = this.stageTransition.dir > 0
            ? Math.max(0.68, nextStage.defaultZoom * 0.62)
            : Math.min(1.9, nextStage.defaultZoom * 1.38);
          this.targetZoom = nextStage.defaultZoom;

          const firstPin = nextStage.pins.find((p) => p.kind === 'goto') || nextStage.pins[0] || null;
          this.selectedPin = firstPin;
          if (firstPin) {
            const { lon, lat } = pinToSpherical(firstPin);
            this.targetYaw = -lon;
            this.targetPitch = lat * 0.7;
          }
          if (this.patrolActive) {
            this.pickPatrolTarget();
          }
          this.syncUi();
        } else if (this.stageTransition.phase === 'in' && this.stageTransition.timer <= 0) {
          this.stageTransition = null;
          this.syncUi();
        }
      }

      if (this.deepSpaceSecret) {
        this.deepSpaceSecret.timer -= dtSec;
        if (this.deepSpaceSecret.timer <= 2.6) {
          this.targetZoom = this.stages[0].defaultZoom;
        }
        if (this.deepSpaceSecret.timer <= 0) {
          this.deepSpaceSecret = null;
          this.targetZoom = this.stages[0].defaultZoom;
          this.syncUi();
        }
      } else if (this.stageIndex === 0 && !this.stageTransition && !this.sceneAnim && this.targetZoom <= 0.68) {
        this.triggerDeepSpaceSecret();
      }

      const zoomBlend = 1 - Math.exp(-3.0 * dtSec);
      this.zoom += (this.targetZoom - this.zoom) * zoomBlend;

      if (this.targetYaw !== null) {
        const diffYaw = this.targetYaw - this.yaw;
        this.yaw += diffYaw * (1 - Math.exp(-1.55 * dtSec));
        if (Math.abs(diffYaw) < 0.0004) {
          this.yaw = this.targetYaw;
          this.targetYaw = null;
        }
      }
      if (this.targetPitch !== null) {
        const diffPitch = this.targetPitch - this.pitch;
        this.pitch += diffPitch * (1 - Math.exp(-1.55 * dtSec));
        if (Math.abs(diffPitch) < 0.0004) {
          this.pitch = this.targetPitch;
          this.targetPitch = null;
        }
      }

      if (!this.calmMode && !this.sceneAnim && !this.deepSpaceSecret && !this.stageTransition && !this.patrolActive && !this.goshaHuntActive && !this.vodkaDefendActive) {
        if (this.ambientSpawn) {
          this.ambientSpawn.timer -= dtSec;
          this.ambientSpawn.x += this.ambientSpawn.vx * dtSec;
          this.ambientSpawn.y += this.ambientSpawn.vy * dtSec;
          if (this.ambientSpawn.kind === 'yurec-legend') {
            const w = this.canvas ? Math.max(240, this.canvas.clientWidth || 360) : 360;
            const h = this.canvas ? Math.max(240, this.canvas.clientHeight || 420) : 420;
            if (this.ambientSpawn.x < 48 || this.ambientSpawn.x > w - 48) this.ambientSpawn.vx *= -1;
            if (this.ambientSpawn.y < 48 || this.ambientSpawn.y > h - 48) this.ambientSpawn.vy *= -1;
          }
          if (this.ambientSpawn.timer <= 0) {
            this.ambientSpawn = null;
          }
        } else {
          this.ambientCooldown -= dtSec;
          if (this.ambientCooldown <= 0) {
            this.ambientCooldown = 3.2 + Math.random() * 2.5;
            this.spawnAmbientForStage();
          }
        }
      } else {
        this.ambientSpawn = null;
      }

      if (this.goshaHuntActive) {
        this.goshaHuntTimeLeft -= dtSec;
        const w = this.canvas ? Math.max(240, this.canvas.clientWidth || 360) : 360;
        const h = this.canvas ? Math.max(240, this.canvas.clientHeight || 420) : 420;
        const speedBoost = 1 + this.goshaHuntScore * 0.14;
        this.goshaBird.x += this.goshaBird.vx * speedBoost * dtSec;
        this.goshaBird.y += (this.goshaBird.vy * speedBoost + Math.sin(performance.now() / 150) * (45 + this.goshaHuntScore * 6)) * dtSec;
        if (this.goshaBird.x < 28 || this.goshaBird.x > w - 28) this.goshaBird.vx *= -1;
        if (this.goshaBird.y < 28 || this.goshaBird.y > h - 28) this.goshaBird.vy *= -1;

        if (this.goshaHuntTimeLeft <= 0) {
          this.goshaHuntTimeLeft = 0;
          this.finishMiniGame('gosha');
        } else if (this.goshaTimerEl) {
          this.goshaTimerEl.textContent = `${Math.ceil(this.goshaHuntTimeLeft)} с`;
        }
      }

      if (this.vodkaDefendActive) {
        this.vodkaDefendTimeLeft -= dtSec;
        const w = this.canvas ? Math.max(240, this.canvas.clientWidth || 360) : 360;
        const h = this.canvas ? Math.max(240, this.canvas.clientHeight || 420) : 420;
        const raidFactor = 1 + this.vodkaDefendScore * 0.16;
        this.ufoRaid.x += this.ufoRaid.vx * raidFactor * dtSec;
        if (this.ufoRaid.x < 42 || this.ufoRaid.x > w - 42) this.ufoRaid.vx *= -1;

        const minBottleY = this.ufoRaid.y + 42;
        const maxBottleY = Math.min(h - 46, h * 0.68);
        if (this.ufoRaid.stealing) {
          this.ufoRaid.bottleY -= 32 * raidFactor * dtSec;
          if (this.ufoRaid.bottleY <= minBottleY) {
            this.vodkaDefendTimeLeft = Math.max(0, this.vodkaDefendTimeLeft - 3.5);
            this.ufoRaid.bottleY = maxBottleY;
            this.vodkaDefendHits = 0;
          }
        }

        if (this.vodkaDefendTimeLeft <= 0) {
          this.vodkaDefendTimeLeft = 0;
          this.finishMiniGame('vodka');
        } else if (this.vodkaTimerEl) {
          this.vodkaTimerEl.textContent = `${Math.ceil(this.vodkaDefendTimeLeft)} с`;
        }
      }

      if (this.sceneAnim) {
        this.sceneAnim.timer -= dtSec;
        if (this.sceneAnim.timer <= 0) {
          this.sceneAnim = null;
          this.syncUi();
        }
      }

      if (this.patrolActive) {
        const timeDrain = 1 + this.patrolScore * 0.14;
        this.patrolTimeLeft -= dtSec * timeDrain;
        if (this.patrolTimeLeft <= 0) {
          this.patrolTimeLeft = 0;
          this.finishMiniGame('patrol');
        } else if (this.timerEl) {
          this.timerEl.textContent = `${Math.ceil(this.patrolTimeLeft)} с`;
        }
      }

      if (this.showDayNight) {
        this.sunLon += scale.sunStepRad * dtSec;
        const isDay = Math.cos(this.sunLon + this.yaw) >= 0;
        if (this.lastDaySide !== null && this.lastDaySide !== isDay) {
          this.dayNightNote = isDay
            ? '☀️ Над сектором светает — день вступает в силу.'
            : '🌙 На Шотмана темнеет — самое время для орбитального патруля.';
          this.dayNightNoteTimer = 4.2;
          this.syncUi();
        }
        this.lastDaySide = isDay;
      }

      if (this.dayNightNoteTimer > 0) {
        this.dayNightNoteTimer -= dtSec;
        if (this.dayNightNoteTimer <= 0) {
          this.dayNightNote = '';
          this.syncUi();
        }
      }

      if (!this.isDragging && this.targetYaw === null) {
        if (this.autoSpin && !this.calmMode && !this.patrolActive && !this.goshaHuntActive && !this.vodkaDefendActive && !this.sceneAnim && !this.deepSpaceSecret) {
          const spinDir = this.invertControls ? -1 : 1;
          this.yaw += scale.radPerSec * dtSec * spinDir;
        } else {
          this.yaw += this.velYaw;
          this.pitch += this.velPitch;
          this.velYaw *= 0.94;
          this.velPitch *= 0.94;
        }
      }

      this.pitch = Math.max(-0.88, Math.min(0.88, this.pitch));
    }

    render() {
      const ctx = this.ctx;
      if (!ctx || !this.canvas) return;

      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      const cssW = Math.max(240, this.canvas.clientWidth || 360);
      const cssH = Math.max(260, this.canvas.clientHeight || 420);

      if (this.canvas.width !== Math.floor(cssW * dpr) || this.canvas.height !== Math.floor(cssH * dpr)) {
        this.canvas.width = Math.floor(cssW * dpr);
        this.canvas.height = Math.floor(cssH * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const isBlackout = this.sceneAnim && this.sceneAnim.kind === 'blackout-whisper';
      const bgGrad = ctx.createRadialGradient(cssW * 0.5, cssH * 0.5, 20, cssW * 0.5, cssH * 0.5, Math.max(cssW, cssH) * 0.72);
      if (isBlackout) {
        bgGrad.addColorStop(0, '#140c09');
        bgGrad.addColorStop(0.65, '#070608');
        bgGrad.addColorStop(1, '#020204');
      } else {
        bgGrad.addColorStop(0, '#0d1b30');
        bgGrad.addColorStop(0.65, '#070e1a');
        bgGrad.addColorStop(1, '#04070e');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cssW, cssH);

      const nowSec = performance.now() / 1000;
      for (const st of this.stars) {
        const a = (isBlackout ? 0.12 : 0.25) + 0.4 * (0.5 + 0.5 * Math.sin(nowSec * 1.1 + st.phase));
        ctx.fillStyle = `rgba(165, 224, 240, ${a.toFixed(2)})`;
        ctx.fillRect(Math.round(st.x * cssW), Math.round(st.y * cssH), st.r, st.r);
      }

      let shakeX = 0;
      let shakeY = 0;
      if (this.sceneAnim) {
        const k = this.sceneAnim.kind;
        const heavyBoom =
          k === 'granade-shockwave' ||
          k === 'granade-blast' ||
          k === 'granade-chain' ||
          k === 'granade-planet-boom' ||
          k === 'shotgun-double-reload' ||
          k === 'shotgun-fire-flame' ||
          k === 'balcony-fall-down' ||
          k === 'ladle-hit-ufo';
        const mildVib =
          k === 'neva-flood' ||
          k === 'linoleum-earth' ||
          k === 'ufo-creepy-abduct' ||
          k === 'ufo-cow-abduct' ||
          k === 'ufo-reptiloids-globe';
        if (heavyBoom) {
          shakeX = Math.sin(nowSec * 22) * 2.2;
          shakeY = Math.cos(nowSec * 19) * 1.8;
        } else if (mildVib) {
          shakeX = Math.sin(nowSec * 12) * 1.0;
          shakeY = Math.cos(nowSec * 11) * 0.9;
        }
      }

      let transitionAlpha = 1;
      let transitionOffsetY = 0;
      if (this.stageTransition) {
        const tr = this.stageTransition;
        const p = 1 - Math.max(0, tr.timer / tr.duration);
        const eased = smoothStep01(p);
        if (tr.phase === 'out') {
          transitionAlpha = 1 - eased * 0.85;
          transitionOffsetY = -tr.dir * eased * 24;
        } else {
          transitionAlpha = 0.15 + eased * 0.85;
          transitionOffsetY = tr.dir * (1 - eased) * 26;
        }
      }

      const cx = cssW / 2 + shakeX;
      const cy = cssH / 2 + shakeY + transitionOffsetY;
      const radius = Math.min(cssW, cssH) * 0.44 * this.zoom;

      const stage = this.currentStage();
      const texSource = this.textures[stage.id];

      ctx.save();
      ctx.globalAlpha = transitionAlpha;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = isBlackout ? '#060508' : '#091424';
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      if (texSource) {
        this.drawSphereTexture(ctx, texSource, cx, cy, radius);
      }
      if (this.showGrid) {
        this.drawSphereGrid(ctx, cx, cy, radius);
      }
      if (this.showDayNight) {
        this.drawDayNightOverlay(ctx, cx, cy, radius);
      }

      const activeWeather = this.activeWeatherEffectId();
      if (!this.calmMode && this.stageIndex < 2 && activeWeather !== 'off') {
        this.renderWeatherOverSphere(ctx, cx, cy, radius, nowSec, activeWeather);
      }

      if (!this.calmMode && this.stageIndex === 2 && this.flatCrittersEnabled) {
        this.renderFlatCritters(ctx, cx, cy, radius, nowSec);
      }

      if (isBlackout) {
        const env = bellCurve01(1 - Math.max(0, this.sceneAnim.timer / this.sceneAnim.duration));
        const flicker = 0.9 + 0.1 * Math.sin(nowSec * 5.2);
        ctx.save();
        ctx.fillStyle = `rgba(2, 3, 7, ${(0.82 * env).toFixed(2)})`;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        const crtGlow = ctx.createRadialGradient(cx, cy + 12, 4, cx, cy + 12, radius * 0.68);
        crtGlow.addColorStop(0, `rgba(255, 178, 92, ${(0.38 * env * flicker).toFixed(2)})`);
        crtGlow.addColorStop(0.55, `rgba(255, 130, 65, ${(0.14 * env * flicker).toFixed(2)})`);
        crtGlow.addColorStop(1, 'rgba(255, 130, 65, 0)');
        ctx.fillStyle = crtGlow;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

        ctx.strokeStyle = `rgba(255, 225, 175, ${(0.12 * env).toFixed(2)})`;
        ctx.lineWidth = 1;
        for (let sy = Math.floor(cy - radius * 0.7); sy < cy + radius * 0.7; sy += 7) {
          const jitter = Math.sin(nowSec * 14 + sy * 0.5) * 14;
          ctx.beginPath();
          ctx.moveTo(cx - radius * 0.55 + jitter, sy);
          ctx.lineTo(cx + radius * 0.55 + jitter, sy);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (this.sceneAnim && this.sceneAnim.kind === 'linoleum-earth') {
        const rawT = 1 - Math.max(0, this.sceneAnim.timer / this.sceneAnim.duration);
        const env = bellCurve01(rawT);
        ctx.save();
        ctx.globalAlpha = 0.78 * env;
        ctx.fillStyle = '#634125';
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.strokeStyle = 'rgba(240, 200, 150, 0.45)';
        ctx.lineWidth = 1.6;
        for (let py = Math.floor(cy - radius); py < cy + radius; py += 16) {
          ctx.beginPath();
          ctx.moveTo(cx - radius, py);
          ctx.lineTo(cx + radius, py + Math.sin(py * 0.06 + nowSec * 1.2) * 3);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (this.sceneAnim && this.sceneAnim.kind === 'neva-flood') {
        const rawT = 1 - Math.max(0, this.sceneAnim.timer / this.sceneAnim.duration);
        const env = bellCurve01(rawT);
        ctx.save();
        ctx.globalAlpha = 0.62 * env;
        const waveGrad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
        waveGrad.addColorStop(0, 'rgba(38, 132, 196, 0.55)');
        waveGrad.addColorStop(0.5, 'rgba(62, 196, 190, 0.62)');
        waveGrad.addColorStop(1, 'rgba(20, 88, 148, 0.72)');
        ctx.fillStyle = waveGrad;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();
      }

      if (this.sceneAnim && this.sceneAnim.kind === 'fridge-freeze') {
        const rawT = 1 - Math.max(0, this.sceneAnim.timer / this.sceneAnim.duration);
        const env = bellCurve01(rawT);
        ctx.save();
        ctx.globalAlpha = 0.68 * env;
        const frost = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
        frost.addColorStop(0, 'rgba(180, 245, 255, 0.12)');
        frost.addColorStop(1, 'rgba(155, 238, 255, 0.5)');
        ctx.fillStyle = frost;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();
      }

      if (this.sceneAnim && this.sceneAnim.kind === 'raduga-tv-show') {
        const rawT = 1 - Math.max(0, this.sceneAnim.timer / this.sceneAnim.duration);
        const env = bellCurve01(rawT);
        ctx.save();
        ctx.globalAlpha = 0.55 * env;
        const rainbow = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        rainbow.addColorStop(0, 'rgba(255, 85, 105, 0.34)');
        rainbow.addColorStop(0.25, 'rgba(255, 195, 70, 0.34)');
        rainbow.addColorStop(0.5, 'rgba(85, 225, 140, 0.34)');
        rainbow.addColorStop(0.75, 'rgba(80, 175, 255, 0.34)');
        rainbow.addColorStop(1, 'rgba(180, 110, 255, 0.34)');
        ctx.fillStyle = rainbow;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();
      }

      ctx.restore();

      ctx.save();
      ctx.globalAlpha = transitionAlpha;
      ctx.strokeStyle = 'rgba(245, 190, 79, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      this.renderPins(ctx, stage, cx, cy, radius, nowSec);
      ctx.restore();

      this.renderDeepSpaceSecret(ctx, cssW, cssH, cx, cy, radius, nowSec);
      this.renderSceneAnimation(ctx, cx, cy, radius, nowSec);
      this.renderAmbientSpawn(ctx, nowSec);
      this.renderGoshaHuntBird(ctx, nowSec);
      this.renderVodkaDefendScene(ctx, nowSec);
      this.renderEndFx3Sec(ctx, cssW, cssH, cx, cy, radius, nowSec);
      this.renderVariantCounterTopRight(ctx, cssW);

      ctx.restore();
    }

    renderEndFx3Sec(ctx, cssW, cssH, cx, cy, radius, nowSec) {
      if (!this.endFx) return;
      const fx = this.endFx;
      const rawT = 1 - Math.max(0, fx.timer / fx.duration);
      const env = bellCurve01(rawT);

      ctx.save();
      ctx.globalAlpha = Math.min(1, env * 1.4);

      if (fx.kind === 'sad-rain') {
        ctx.fillStyle = 'rgba(14, 22, 36, 0.34)';
        ctx.fillRect(0, 0, cssW, cssH);
        for (let i = 0; i < 30; i++) {
          const rx = ((i * 59 + Math.sin(nowSec * 0.7 + i) * 10) % Math.max(100, cssW - 20)) + 10;
          const ry = ((rawT * 260 + i * 29) % Math.max(120, cssH - 20)) + 10;
          ctx.strokeStyle = 'rgba(130, 185, 235, 0.72)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 10);
          ctx.stroke();
        }
        drawEmojiSticker(ctx, '🌧️', cx, cy - 12, 34, TONE_COLORS.teal, nowSec);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#b9d8f5';
        ctx.textAlign = 'center';
        ctx.fillText('Рекорды сброшены... грустим под дождём', Math.round(cx), Math.round(cy + 28));
      } else if (fx.kind === 'patrol-salute') {
        for (let s = 0; s < 14; s++) {
          const ang = (s / 14) * Math.PI * 2;
          const dist = 14 + rawT * 68;
          const sx = cx + Math.cos(ang) * dist;
          const sy = cy + Math.sin(ang) * dist;
          ctx.fillStyle = s % 2 === 0 ? '#ffd452' : '#ff6b6b';
          ctx.beginPath();
          ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.fillText('🎆 ПОИСК ЗАВЕРШЁН!', Math.round(cx), Math.round(cy - radius - 14));
      } else if (fx.kind === 'gosha-stars') {
        for (let st = 0; st < 10; st++) {
          const ang = (st / 10) * Math.PI * 2 + rawT * 1.4;
          const dist = 20 + rawT * 58;
          drawEmojiSticker(ctx, '⭐', cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 22, TONE_COLORS.gold, nowSec);
        }
      } else if (fx.kind === 'vodka-confetti') {
        for (let c = 0; c < 16; c++) {
          const cfX = ((c * 43 + Math.sin(nowSec * 3 + c) * 14) % Math.max(100, cssW - 20)) + 10;
          const cfY = ((rawT * 240 + c * 24) % Math.max(120, cssH - 20)) + 10;
          ctx.fillStyle = c % 3 === 0 ? '#3ec4be' : c % 3 === 1 ? '#f5be4f' : '#9482f0';
          ctx.fillRect(Math.round(cfX - 3), Math.round(cfY - 3), 6, 6);
        }
      }

      ctx.restore();
    }

    renderVariantCounterTopRight(ctx, cssW) {
      if (!this.sceneAnim || !this.sceneAnim.variantTotal || this.sceneAnim.variantTotal <= 1) return;
      const label = `${this.sceneAnim.variantIndex} из ${this.sceneAnim.variantTotal}`;
      ctx.save();
      ctx.font = 'bold 11px monospace';
      const w = ctx.measureText(label).width + 16;
      const x = Math.round(cssW - w - 10);
      const y = 10;

      ctx.fillStyle = 'rgba(10, 18, 34, 0.92)';
      ctx.strokeStyle = '#f5be4f';
      ctx.lineWidth = 1.4;
      drawRoundedRect(ctx, x, y, w, 20, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffe599';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, Math.round(x + w / 2), Math.round(y + 10.5));
      ctx.restore();
    }

    renderFlatCritters(ctx, cx, cy, radius, nowSec) {
      ctx.save();
      for (const c of this.flatCritters) {
        const px = cx - radius + c.x * radius * 2;
        const py = cy - radius + c.y * radius * 2;
        const wing = Math.sin(nowSec * 35 + c.phase) * 2.2;

        ctx.fillStyle = c.isFly ? '#181c22' : '#586270';
        ctx.beginPath();
        ctx.arc(px, py, c.isFly ? 2.4 : 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(225, 245, 255, 0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 2.5, py - 2.5 - wing);
        ctx.moveTo(px, py);
        ctx.lineTo(px + 2.5, py - 2.5 + wing);
        ctx.stroke();
      }
      ctx.restore();
    }

    renderWeatherOverSphere(ctx, cx, cy, radius, nowSec, wMode) {
      ctx.save();
      if (wMode === 'sun') {
        const sunGlow = ctx.createRadialGradient(cx - radius * 0.45, cy - radius * 0.45, 4, cx - radius * 0.45, cy - radius * 0.45, radius * 0.92);
        sunGlow.addColorStop(0, 'rgba(255, 236, 150, 0.34)');
        sunGlow.addColorStop(1, 'rgba(255, 220, 120, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      } else if (wMode === 'tornado') {
        ctx.strokeStyle = 'rgba(215, 235, 250, 0.42)';
        ctx.lineWidth = 1.8;
        for (let ring = 0; ring < 5; ring++) {
          const ry = cy - radius * 0.48 + ring * 20;
          const rw = 12 + ring * 9 + Math.sin(nowSec * 2.2 + ring) * 3;
          ctx.beginPath();
          ctx.ellipse(cx + Math.sin(nowSec * 1.4 + ring) * 5, ry, rw, 5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        for (const p of this.weatherParticles) {
          const px = cx - radius + p.x * radius * 2;
          const py = cy - radius + p.y * radius * 2;
          if (wMode === 'rain') {
            ctx.strokeStyle = 'rgba(135, 215, 255, 0.5)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - 2, py + 7);
            ctx.stroke();
          } else if (wMode === 'snow') {
            ctx.fillStyle = 'rgba(245, 250, 255, 0.72)';
            ctx.beginPath();
            ctx.arc(px, py, p.size * 0.9, 0, Math.PI * 2);
            ctx.fill();
          } else if (wMode === 'storm') {
            ctx.strokeStyle = 'rgba(165, 210, 240, 0.55)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + 9, py + 2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    renderDeepSpaceSecret(ctx, cssW, cssH, cx, cy, radius, nowSec) {
      if (!this.deepSpaceSecret) return;
      const sec = this.deepSpaceSecret;
      const rawT = 1 - Math.max(0, sec.timer / sec.duration);

      ctx.save();

      if (sec.kind === 'giant-ufo') {
        const appear = smoothStep01(Math.min(1, rawT / 0.14));
        const noticed = rawT >= 0.44 && rawT < 0.72;
        const teleporting = rawT >= 0.72;
        const teleportOut = teleporting ? smoothStep01((rawT - 0.72) / 0.24) : 0;
        const alpha = appear * (1 - teleportOut);

        if (alpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = alpha;
          const ufoW = Math.min(cssW - 24, Math.max(220, radius * 2.8));
          const ufoH = Math.max(82, ufoW * 0.34);
          const ux = cx + Math.sin(nowSec * 1.2) * 8;
          const uy = Math.max(58, cy - radius * 0.35);

          if (noticed) {
            const beamGrad = ctx.createLinearGradient(ux, uy + 10, cx, cy + 20);
            beamGrad.addColorStop(0, 'rgba(255, 95, 115, 0.44)');
            beamGrad.addColorStop(1, 'rgba(255, 95, 115, 0.02)');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(ux - 24, uy + 10);
            ctx.lineTo(ux + 24, uy + 10);
            ctx.lineTo(cx + radius * 0.75, cy + 20);
            ctx.lineTo(cx - radius * 0.75, cy + 20);
            ctx.closePath();
            ctx.fill();
          }

          ctx.fillStyle = noticed ? 'rgba(255, 115, 130, 0.38)' : 'rgba(110, 245, 220, 0.32)';
          ctx.beginPath();
          ctx.ellipse(ux, uy - ufoH * 0.24, ufoW * 0.24, ufoH * 0.32, 0, Math.PI, 0);
          ctx.fill();

          const hullGrad = ctx.createLinearGradient(ux - ufoW / 2, uy, ux + ufoW / 2, uy);
          hullGrad.addColorStop(0, '#271a45');
          hullGrad.addColorStop(0.5, noticed ? '#9e3b52' : '#7b61d1');
          hullGrad.addColorStop(1, '#271a45');

          ctx.fillStyle = hullGrad;
          ctx.strokeStyle = '#f5be4f';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.ellipse(ux, uy, ufoW * 0.5, ufoH * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          for (let i = -4; i <= 4; i++) {
            const lit = Math.sin(nowSec * 4.5 + i) > 0;
            ctx.fillStyle = noticed ? (lit ? '#ff6b6b' : '#ffe599') : (lit ? '#ffe599' : '#3ec4be');
            ctx.beginPath();
            ctx.arc(ux + i * (ufoW * 0.1), uy + 2, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          if (teleporting) {
            ctx.strokeStyle = `rgba(140, 245, 255, ${(1 - teleportOut).toFixed(2)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ux, uy, ufoW * (0.35 + teleportOut * 0.45), 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        const lineIdx = rawT < 0.24 ? 0 : rawT < 0.48 ? 1 : rawT < 0.72 ? 2 : 3;
        this.drawFilmSubtitleBox(ctx, cssW, cssH, GIANT_UFO_LINES[lineIdx], '#9482f0', '#f3e8ff');
      } else if (sec.kind === 'moon-base') {
        const moonAppear = smoothStep01(Math.min(1, rawT / 0.16));
        const baseVisible = rawT < 0.72;
        const baseFade = rawT >= 0.5 ? Math.max(0, 1 - smoothStep01((rawT - 0.5) / 0.22)) : 1;

        ctx.save();
        ctx.globalAlpha = moonAppear;

        const mr = Math.min(96, Math.max(66, Math.min(cssW, cssH) * 0.24));
        const mx = Math.min(cssW - mr - 14, cx + radius * 0.62 + mr * 0.55);
        const my = Math.max(mr + 24, cy - radius * 0.25);

        const moonGrad = ctx.createRadialGradient(mx - mr * 0.32, my - mr * 0.32, mr * 0.08, mx, my, mr);
        moonGrad.addColorStop(0, '#f4f7fb');
        moonGrad.addColorStop(0.55, '#aeb8c6');
        moonGrad.addColorStop(0.88, '#687385');
        moonGrad.addColorStop(1, '#3b424f');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();

        const craters = [
          { dx: -0.34, dy: -0.18, r: 0.22 },
          { dx: 0.24, dy: -0.28, r: 0.16 },
          { dx: 0.08, dy: 0.24, r: 0.25 },
          { dx: -0.22, dy: 0.34, r: 0.14 },
          { dx: 0.42, dy: 0.12, r: 0.13 },
          { dx: -0.04, dy: -0.46, r: 0.11 }
        ];
        for (const c of craters) {
          const crX = mx + c.dx * mr;
          const crY = my + c.dy * mr;
          const crR = Math.max(5, c.r * mr);

          ctx.strokeStyle = 'rgba(248, 251, 255, 0.55)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(crX, crY, crR, 0, Math.PI * 2);
          ctx.stroke();

          const bowlGrad = ctx.createRadialGradient(crX + crR * 0.25, crY + crR * 0.25, crR * 0.1, crX, crY, crR * 0.92);
          bowlGrad.addColorStop(0, 'rgba(55, 62, 74, 0.25)');
          bowlGrad.addColorStop(1, 'rgba(38, 44, 54, 0.65)');
          ctx.fillStyle = bowlGrad;
          ctx.beginPath();
          ctx.arc(crX, crY, crR * 0.92, 0, Math.PI * 2);
          ctx.fill();
        }

        if (baseVisible && baseFade > 0.02) {
          ctx.save();
          ctx.globalAlpha = moonAppear * baseFade;
          const bx = mx - mr * 0.12;
          const by = my - mr * 0.88;

          ctx.fillStyle = '#3ec4be';
          ctx.strokeStyle = '#f5be4f';
          ctx.lineWidth = 1.6;
          drawRoundedRect(ctx, bx - 22, by - 8, 44, 14, 5);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(bx, by - 8, 11, Math.PI, 0);
          ctx.fillStyle = 'rgba(130, 245, 225, 0.65)';
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#ffe599';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx + 14, by - 8);
          ctx.lineTo(bx + 14, by - 22);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();

        const lineIdx = rawT < 0.24 ? 0 : rawT < 0.48 ? 1 : rawT < 0.74 ? 2 : 3;
        this.drawFilmSubtitleBox(ctx, cssW, cssH, MOON_BASE_LINES[lineIdx], '#3ec4be', '#c8fff9');
      } else if (sec.kind === 'solar-system') {
        const env = smoothStep01(Math.min(1, rawT / 0.15));
        ctx.save();
        ctx.globalAlpha = env;

        const sunX = cx - Math.min(72, cssW * 0.18);
        const sunY = cy - 12;

        const sGrad = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 24);
        sGrad.addColorStop(0, '#fff4b8');
        sGrad.addColorStop(0.6, '#f5be4f');
        sGrad.addColorStop(1, 'rgba(245, 190, 79, 0)');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd452';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 11, 0, Math.PI * 2);
        ctx.fill();

        const planets = [
          { r: 22, color: '#b5b8c2', sz: 3, speed: 1.5 },
          { r: 34, color: '#e6c27a', sz: 4.5, speed: 1.1 },
          { r: 48, color: '#4da6ff', sz: 5, speed: 0.85 },
          { r: 62, color: '#e06c4b', sz: 4, speed: 0.68 },
          { r: 80, color: '#d9a46c', sz: 8.5, speed: 0.42 },
          { r: 100, color: '#ebd294', sz: 7, speed: 0.3 },
          { r: 118, color: '#7ad7e8', sz: 5.5, speed: 0.2 },
          { r: 134, color: '#4c6ef5', sz: 5.5, speed: 0.15 }
        ];

        for (let i = 0; i < planets.length; i++) {
          const pl = planets[i];
          ctx.strokeStyle = 'rgba(130, 190, 225, 0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sunX, sunY, pl.r, 0, Math.PI * 2);
          ctx.stroke();

          const ang = nowSec * pl.speed + i * 0.9;
          const px = sunX + Math.cos(ang) * pl.r;
          const py = sunY + Math.sin(ang) * pl.r;
          ctx.fillStyle = pl.color;
          ctx.beginPath();
          ctx.arc(px, py, pl.sz, 0, Math.PI * 2);
          ctx.fill();
        }

        if (rawT >= 0.3 && rawT <= 0.78) {
          const cp = smoothStep01((rawT - 0.3) / 0.48);
          const comX = cx - 95 + cp * 195;
          const comY = cy - 75 + cp * 110;

          const tailGrad = ctx.createLinearGradient(comX - 36, comY - 20, comX, comY);
          tailGrad.addColorStop(0, 'rgba(255, 229, 153, 0)');
          tailGrad.addColorStop(1, 'rgba(255, 229, 153, 0.85)');
          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(comX - 36, comY - 20);
          ctx.lineTo(comX, comY);
          ctx.stroke();

          drawEmojiSticker(ctx, '🥟', comX, comY, 22, TONE_COLORS.hero, nowSec);

          const beaconAlpha = bellCurve01((rawT - 0.35) / 0.38);
          ctx.save();
          ctx.globalAlpha = beaconAlpha;
          ctx.fillStyle = 'rgba(12, 22, 38, 0.92)';
          ctx.strokeStyle = '#3ec4be';
          ctx.lineWidth = 1.5;
          drawRoundedRect(ctx, Math.round(cx + 28), Math.round(cy - 68), 86, 22, 5);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#a8fffb';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('📡 ШОТМАН', Math.round(cx + 71), Math.round(cy - 57));
          ctx.restore();
        }

        ctx.restore();

        const lineIdx = rawT < 0.34 ? 0 : rawT < 0.68 ? 1 : 2;
        this.drawFilmSubtitleBox(ctx, cssW, cssH, SOLAR_SYSTEM_LINES[lineIdx], '#f5be4f', '#fff3c4');
      }

      ctx.restore();
    }

    drawFilmSubtitleBox(ctx, cssW, cssH, text, borderColor, textColor) {
      ctx.save();
      ctx.font = 'bold 11px monospace';
      const maxBoxW = Math.max(180, cssW - 24);
      const lines = wrapCaptionLines(ctx, text, maxBoxW - 20);
      const lineHeight = 15;
      const boxH = Math.max(30, lines.length * lineHeight + 12);
      const boxX = Math.round((cssW - maxBoxW) / 2);
      const boxY = Math.round(cssH - boxH - 10);

      ctx.fillStyle = 'rgba(7, 13, 24, 0.94)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.6;
      drawRoundedRect(ctx, boxX, boxY, maxBoxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < lines.length; i++) {
        const ly = boxY + 12 + i * lineHeight;
        ctx.fillText(lines[i], Math.round(cssW / 2), Math.round(ly));
      }
      ctx.restore();
    }

    drawDayNightOverlay(ctx, cx, cy, radius) {
      const sunAngle = this.sunLon + this.yaw;
      const lx = Math.sin(sunAngle);
      const ly = Math.sin(this.pitch) * 0.35;

      const grad = ctx.createLinearGradient(cx - lx * radius, cy - ly * radius, cx + lx * radius, cy + ly * radius);
      grad.addColorStop(0, 'rgba(255, 244, 205, 0.14)');
      grad.addColorStop(0.45, 'rgba(10, 20, 38, 0.08)');
      grad.addColorStop(0.65, 'rgba(4, 9, 20, 0.6)');
      grad.addColorStop(1, 'rgba(2, 5, 12, 0.85)');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.restore();
    }

    drawSphereTexture(ctx, texSource, cx, cy, radius) {
      const tw = texSource.width;
      const th = texSource.height;
      const latBands = 16;
      const lonSlices = 24;

      for (let i = 0; i < latBands; i++) {
        const v0 = i / latBands;
        const v1 = (i + 1) / latBands;
        const lat0 = (0.5 - v0) * Math.PI;
        const lat1 = (0.5 - v1) * Math.PI;
        const latMid = (lat0 + lat1) * 0.5;
        const sy = Math.floor(v0 * th);
        const sh = Math.max(1, Math.ceil((v1 - v0) * th));

        for (let j = 0; j < lonSlices; j++) {
          const u0 = j / lonSlices;
          const u1 = (j + 1) / lonSlices;
          const lon0 = (u0 - 0.5) * Math.PI * 2;
          const lon1 = (u1 - 0.5) * Math.PI * 2;
          const lonMid = (lon0 + lon1) * 0.5;

          const pMid = projectSpherePoint(lonMid, latMid, this.yaw, this.pitch, radius, cx, cy);
          if (pMid.z < -0.1) continue;

          const pTL = projectSpherePoint(lon0, lat0, this.yaw, this.pitch, radius, cx, cy);
          const pTR = projectSpherePoint(lon1, lat0, this.yaw, this.pitch, radius, cx, cy);
          const pBL = projectSpherePoint(lon0, lat1, this.yaw, this.pitch, radius, cx, cy);

          const dw = Math.max(pTL.x, pTR.x, pBL.x) - Math.min(pTL.x, pTR.x, pBL.x);
          const dh = Math.max(pTL.y, pTR.y, pBL.y) - Math.min(pTL.y, pTR.y, pBL.y);
          if (dw <= 0.5 || dh <= 0.5) continue;

          const sx = Math.floor(u0 * tw);
          const sw = Math.max(1, Math.ceil((u1 - u0) * tw));
          ctx.drawImage(
            texSource,
            sx,
            sy,
            sw,
            sh,
            Math.min(pTL.x, pTR.x, pBL.x) - 0.7,
            Math.min(pTL.y, pTR.y, pBL.y) - 0.7,
            dw + 1.4,
            dh + 1.4
          );
        }
      }
    }

    drawSphereGrid(ctx, cx, cy, radius) {
      ctx.save();
      ctx.strokeStyle = 'rgba(110, 224, 232, 0.22)';
      ctx.lineWidth = 0.85;

      for (let deg = -180; deg < 180; deg += 30) {
        const lon = (deg * Math.PI) / 180;
        ctx.beginPath();
        let started = false;
        for (let latDeg = -85; latDeg <= 85; latDeg += 10) {
          const lat = (latDeg * Math.PI) / 180;
          const pt = projectSpherePoint(lon, lat, this.yaw, this.pitch, radius, cx, cy);
          if (pt.z > 0) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
        const lat = (latDeg * Math.PI) / 180;
        ctx.beginPath();
        let started = false;
        for (let deg = -180; deg <= 180; deg += 12) {
          const lon = (deg * Math.PI) / 180;
          const pt = projectSpherePoint(lon, lat, this.yaw, this.pitch, radius, cx, cy);
          if (pt.z > 0) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    renderPins(ctx, stage, cx, cy, radius, nowSec) {
      const projected = [];
      for (const pin of stage.pins) {
        const { lon, lat } = pinToSpherical(pin);
        const pt = projectSpherePoint(lon, lat, this.yaw, this.pitch, radius, cx, cy);
        if (!pt.visible) continue;
        projected.push({ pin, x: pt.x, y: pt.y, z: pt.z });
      }
      projected.sort((a, b) => a.z - b.z);
      this.projectedPins = projected;

      for (const item of projected) {
        const { pin, x, y, z } = item;
        const isSelected = this.selectedPin && this.selectedPin.id === pin.id;
        const isAnimTarget = this.sceneAnim && this.sceneAnim.pin && this.sceneAnim.pin.id === pin.id;
        const isGoto = pin.kind === 'goto';
        const isTarget = this.patrolActive && this.patrolTargetPin && this.patrolTargetPin.id === pin.id;
        const tone = isTarget ? { fill: '#ff5d5d', text: '#070c14' } : TONE_COLORS[pin.tone] || TONE_COLORS.gold;

        const clickBoost = isSelected || isAnimTarget ? 1.55 : 1.0;
        const fontPx = Math.max(13, Math.round((isGoto ? 17 : pin.hideLabel ? 13 : 15) * (0.85 + 0.18 * z) * clickBoost));
        const sticker = PIN_STICKERS[pin.id] || '✨';

        drawEmojiSticker(ctx, sticker, x, y, fontPx, tone, nowSec);

        if (!pin.hideLabel && (z > 0.24 || isSelected || isGoto || isAnimTarget)) {
          const text = pin.label;
          ctx.font = isSelected || isGoto || isAnimTarget ? 'bold 11px monospace' : '10px monospace';
          const textW = ctx.measureText(text).width;
          const boxW = textW + 10;
          const boxH = 16;
          const bx = Math.round(x - boxW / 2);
          const by = Math.round(y - fontPx * 0.9 - boxH);

          ctx.fillStyle = isSelected || isGoto || isAnimTarget ? tone.fill : 'rgba(6, 13, 24, 0.9)';
          drawRoundedRect(ctx, bx, by, boxW, boxH, 3);
          ctx.fill();

          ctx.strokeStyle = isSelected || isGoto || isAnimTarget ? '#fff4d6' : 'rgba(110, 224, 232, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = isSelected || isGoto || isAnimTarget ? tone.text : '#e6f2ff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, Math.round(x), Math.round(by + boxH / 2 + 0.5));
        }
      }
    }

    renderSceneAnimation(ctx, cx, cy, radius, nowSec) {
      if (!this.sceneAnim) return;
      const anim = this.sceneAnim;
      const rawT = 1 - Math.max(0, anim.timer / anim.duration);
      const t = smoothStep01(rawT);
      const cycle = bellCurve01(rawT);

      const heroX = cx;
      const heroY = cy;

      ctx.save();

      if (anim.kind === 'spoiled-item') {
        const st = PIN_STICKERS[anim.pin.id] || '🥬';
        drawEmojiSticker(ctx, st, heroX, heroY - 6, 40, TONE_COLORS.gold, nowSec);
        this.renderFlatCritters(ctx, cx, cy, Math.min(radius, 95), nowSec);
      } else if (anim.kind === 'raduga-tv-show') {
        ctx.fillStyle = 'rgba(16, 12, 34, 0.95)';
        ctx.strokeStyle = '#f5be4f';
        ctx.lineWidth = 1.6;
        drawRoundedRect(ctx, heroX - 108, heroY - 72, 216, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📺 ЦВЕТНОЙ ЭФИР «РАДУГА»', heroX, heroY - 60);

        drawEmojiSticker(ctx, '📺', heroX, heroY + 4, 44, TONE_COLORS.copper, nowSec);
      } else if (anim.kind === 'blackout-whisper') {
        const wText = anim.whisperText || BLACKOUT_WHISPERS[0];
        ctx.font = 'bold 11px monospace';
        const lines = wrapCaptionLines(ctx, wText, 220);
        const boxH = Math.max(28, lines.length * 14 + 10);
        ctx.fillStyle = 'rgba(10, 8, 16, 0.95)';
        ctx.strokeStyle = '#9482f0';
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, heroX - 120, heroY - 58 - boxH, 240, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffdca8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], heroX, heroY - 50 - boxH + 10 + i * 14);
        }

        drawEmojiSticker(ctx, '📺', heroX, heroY + 6, 42, TONE_COLORS.gold, nowSec);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#d8c8ff';
        ctx.fillText('(тапни по центру для нового шёпота)', heroX, heroY + 48);
      } else if (anim.kind === 'zinaida-tv-beloved') {
        drawEmojiSticker(ctx, '👵', heroX - 42, heroY - 4, 42, TONE_COLORS.gold, nowSec);
        drawEmojiSticker(ctx, '📺', heroX + 40, heroY - 4, 42, TONE_COLORS.copper, nowSec);

        ctx.fillStyle = 'rgba(24, 15, 34, 0.95)';
        ctx.strokeStyle = '#f5be4f';
        ctx.lineWidth = 1.6;
        drawRoundedRect(ctx, heroX - 122, heroY - 70, 244, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Юрец, алкаш мой любимый!', heroX, heroY - 57);
      } else if (anim.kind === 'ufo-creepy-abduct') {
        const ufoX = heroX + Math.sin(nowSec * 1.1) * 14;
        const lift = cycle * 44;
        const ufoY = heroY - 68 - lift * 0.25;
        ctx.globalAlpha = 0.45 * cycle;
        const beam = ctx.createLinearGradient(ufoX, ufoY + 14, heroX, heroY - lift + 10);
        beam.addColorStop(0, 'rgba(185, 85, 255, 0.7)');
        beam.addColorStop(1, 'rgba(10, 20, 35, 0.04)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(ufoX - 18, ufoY + 14);
        ctx.lineTo(ufoX + 18, ufoY + 14);
        ctx.lineTo(heroX + 36, heroY - lift + 12);
        ctx.lineTo(heroX - 36, heroY - lift + 12);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.96;
        drawEmojiSticker(ctx, '🛸', ufoX, ufoY, 40, TONE_COLORS.violet, nowSec);
        drawEmojiSticker(ctx, '🍾', heroX, heroY + 12 - lift * 0.55, 34, TONE_COLORS.teal, nowSec);
      } else if (anim.kind === 'ufo-creepy-hypnosis') {
        for (let r = 1; r <= 4; r++) {
          const ringR = (radius * 0.26 * r + nowSec * 11) % Math.max(24, radius * 0.96);
          ctx.globalAlpha = 0.52 * cycle;
          ctx.strokeStyle = r % 2 === 0 ? '#ff6b8b' : '#b57cff';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(heroX, heroY, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        drawEmojiSticker(ctx, '🌀', heroX, heroY, 42, TONE_COLORS.violet, nowSec);
      } else if (anim.kind === 'ufo-grow-giant') {
        drawEmojiSticker(ctx, '🛸', heroX, heroY - cycle * 10, 38 + cycle * 26, TONE_COLORS.violet, nowSec);
      } else if (anim.kind === 'ufo-cow-abduct') {
        const lift = cycle * 42;
        drawEmojiSticker(ctx, '🛸', heroX, heroY - 64 - lift * 0.25, 38, TONE_COLORS.teal, nowSec);
        drawEmojiSticker(ctx, '🐄', heroX, heroY + 14 - lift * 0.55, 36, TONE_COLORS.gold, nowSec);
      } else if (anim.kind === 'ufo-drink-vodka') {
        drawEmojiSticker(ctx, '🛸', heroX - 38, heroY - 10, 36, TONE_COLORS.teal, nowSec);
        drawEmojiSticker(ctx, '🍾', heroX + 38, heroY - 8 - cycle * 12, 36, TONE_COLORS.gold, nowSec);
      } else if (anim.kind === 'ufo-swarm-and-back') {
        const count = cycle > 0.45 ? 5 : 2;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2 + nowSec * 0.55;
          const sx = heroX + Math.cos(ang) * (38 + cycle * 36);
          const sy = heroY + Math.sin(ang) * (24 + cycle * 22);
          drawEmojiSticker(ctx, '🛸', sx, sy, 32, TONE_COLORS.violet, nowSec);
        }
      } else if (anim.kind === 'ufo-reptiloids-globe') {
        drawEmojiSticker(ctx, '🛸', heroX, heroY - radius * 0.72, 36, TONE_COLORS.teal, nowSec);
        ctx.globalAlpha = 0.72 * cycle;
        ctx.strokeStyle = '#43d17a';
        ctx.lineCap = 'round';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(heroX, heroY, radius * 0.72, -Math.PI * 0.85, Math.PI * 0.85);
        ctx.stroke();
        drawEmojiSticker(ctx, '🦎', heroX - radius * 0.58, heroY, 32, TONE_COLORS.teal, nowSec);
        drawEmojiSticker(ctx, '🦎', heroX + radius * 0.58, heroY, 32, TONE_COLORS.teal, nowSec);
      } else if (anim.kind === 'neva-zenit-football') {
        const fieldW = Math.min(264, radius * 1.48);
        const fieldH = 116;
        const fx = heroX - fieldW / 2;
        const fy = heroY - fieldH / 2 + 6;

        ctx.fillStyle = 'rgba(14, 66, 44, 0.9)';
        ctx.strokeStyle = '#9cf5c7';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, fx, fy, fieldW, fieldH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(heroX, fy + 6);
        ctx.lineTo(heroX, fy + fieldH - 6);
        ctx.stroke();

        ctx.strokeStyle = '#ffe599';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(fx + fieldW - 24, fy + fieldH / 2 - 24, 18, 48);

        const ballX = fx + 26 + t * (fieldW - 44);
        const ballY = fy + fieldH / 2 + Math.sin(t * Math.PI * 2.5) * 15;
        drawEmojiSticker(ctx, '⚽', ballX, ballY, 32, TONE_COLORS.hero, nowSec);
        drawEmojiSticker(ctx, '🏆', fx + fieldW - 14, fy + fieldH / 2, 28, TONE_COLORS.gold, nowSec);

        ctx.fillStyle = 'rgba(7, 24, 48, 0.95)';
        ctx.strokeStyle = '#3ec4be';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, heroX - 114, fy - 34, 228, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#a8fffb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚽ ЗЕНИТ - ЧЕМПИОН! ⚽', heroX, fy - 21);
      } else if (anim.kind === 'iskrovsky-sparkler') {
        ctx.globalAlpha = 0.85 * cycle;
        for (let s = 0; s < 14; s++) {
          const ang = (s / 14) * Math.PI * 2 + nowSec * 0.75;
          const len = 14 + cycle * 48;
          ctx.strokeStyle = s % 2 === 0 ? '#ffe47a' : '#ff9f43';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(heroX, heroY);
          ctx.lineTo(heroX + Math.cos(ang) * len, heroY + Math.sin(ang) * len);
          ctx.stroke();
        }
        drawEmojiSticker(ctx, '🎇', heroX, heroY, 40, TONE_COLORS.gold, nowSec);
      } else if (anim.kind === 'iskrovsky-stars') {
        for (let st = 0; st < 8; st++) {
          const ang = (st / 8) * Math.PI * 2 + t * 0.9;
          const dist = 28 + cycle * 42;
          drawEmojiSticker(ctx, '⭐', heroX + Math.cos(ang) * dist, heroY + Math.sin(ang) * dist, 28, TONE_COLORS.gold, nowSec);
        }
      } else if (anim.kind === 'pyaterochka-food-1' || anim.kind === 'pyaterochka-food-2') {
        const stickers = anim.kind === 'pyaterochka-food-1' ? ['🧀', '🥛', '🌭', '🍞'] : ['🥟', '🐟', '🍪', '🫖'];
        for (let i = 0; i < 4; i++) {
          const fx = heroX + (i - 1.5) * 48 + Math.sin(nowSec * 1.4 + i) * 6;
          const fy = heroY - 10 - cycle * 16;
          drawEmojiSticker(ctx, stickers[i], fx, fy, 36, TONE_COLORS.gold, nowSec);
        }
      } else if (anim.kind === 'apteka-greet') {
        drawEmojiSticker(ctx, '🏥', heroX, heroY - 24, 42, TONE_COLORS.gold, nowSec);
        ctx.fillStyle = 'rgba(10, 22, 36, 0.94)';
        ctx.strokeStyle = '#3ec4be';
        ctx.lineWidth = 1.6;
        drawRoundedRect(ctx, heroX - 96, heroY + 14, 192, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#a6fffb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏥: Приятного дня!', heroX, heroY + 27);
      } else if (anim.kind === 'cat-sausage') {
        const pull = Math.sin(nowSec * 1.6) * 14;
        drawEmojiSticker(ctx, '🌭', heroX + pull - 18, heroY - 8, 38, TONE_COLORS.copper, nowSec);
        drawEmojiSticker(ctx, '🐱', heroX + pull + 26, heroY - 8, 36, TONE_COLORS.gold, nowSec);
      } else if (anim.kind === 'sausage-grow-slice') {
        if (rawT < 0.65) {
          const growPx = 36 + Math.sin(Math.min(1, rawT * 1.5) * Math.PI) * 20;
          drawEmojiSticker(ctx, '🌭', heroX, heroY - 8, growPx, TONE_COLORS.copper, nowSec);
        } else {
          const spread = smoothStep01((rawT - 0.65) / 0.35) * 42;
          for (let part = -1; part <= 1; part++) {
            drawEmojiSticker(ctx, '🌭', heroX + part * spread, heroY - 8, 34, TONE_COLORS.copper, nowSec);
          }
        }
      } else if (anim.kind === 'linoleum-cut-parts') {
        const partShift = cycle * 34;
        for (let p = -1; p <= 1; p++) {
          drawEmojiSticker(ctx, '🪵', heroX + p * partShift, heroY - 8, 36, TONE_COLORS.violet, nowSec);
        }
        drawEmojiSticker(ctx, '✂️', heroX, heroY - 34 + cycle * 20, 30, TONE_COLORS.hero, nowSec);
      } else if (anim.kind === 'ladle-gentle') {
        const swayX = Math.sin(nowSec * 1.6) * 14;
        drawEmojiSticker(ctx, '🥄', heroX + swayX, heroY - 6, 42, TONE_COLORS.gold, nowSec);
      } else if (anim.kind === 'ladle-hit-ufo') {
        const hitProg = Math.min(1, cycle * 1.15);
        const ladleX = heroX - 38 + hitProg * 44;
        const ladleY = heroY + 12 - hitProg * 26;
        const ufoX = heroX + 26 + hitProg * 32;
        const ufoY = heroY - 26 - hitProg * 18;

        drawEmojiSticker(ctx, '🛸', ufoX, ufoY, 38, TONE_COLORS.violet, nowSec);
        drawEmojiSticker(ctx, '🥄', ladleX, ladleY, 42, TONE_COLORS.hero, nowSec);

        if (hitProg > 0.55) {
          drawEmojiSticker(ctx, '💥', ufoX, ufoY, 34, TONE_COLORS.copper, nowSec);
        }
      } else if (anim.kind === 'sveta-card') {
        drawEmojiSticker(ctx, '👱‍♀️', heroX - 22, heroY - 24, 40, TONE_COLORS.gold, nowSec);
        drawEmojiSticker(ctx, '❤️', heroX + 24, heroY - 24, 36, TONE_COLORS.copper, nowSec);
        ctx.fillStyle = 'rgba(22, 16, 36, 0.94)';
        ctx.strokeStyle = '#ff7eb6';
        ctx.lineWidth = 1.6;
        drawRoundedRect(ctx, heroX - 102, heroY + 14, 204, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffe5f0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👱‍♀️: Юр, ну ты даёшь!', heroX, heroY + 27);
      } else if (anim.kind === 'lysyi-card') {
        drawEmojiSticker(ctx, '👷‍♂️', heroX, heroY - 24, 42, TONE_COLORS.copper, nowSec);
        ctx.fillStyle = 'rgba(28, 14, 18, 0.94)';
        ctx.strokeStyle = '#ff6b4a';
        ctx.lineWidth = 1.6;
        drawRoundedRect(ctx, heroX - 106, heroY + 14, 212, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffd6c9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👷‍♂️: Юрец, ты уволен!', heroX, heroY + 27);
      } else if (anim.kind === 'balcony-space') {
        drawEmojiSticker(ctx, '🪟', heroX, heroY - cycle * 52, 42, TONE_COLORS.violet, nowSec);
      } else if (anim.kind === 'balcony-fall-down') {
        drawEmojiSticker(ctx, '🪟', heroX, heroY - 20 + cycle * 46, 42, TONE_COLORS.copper, nowSec);
      } else if (anim.kind === 'trolley-far') {
        drawEmojiSticker(ctx, '🚎', heroX - 28 + cycle * 54, heroY - 6, 42, TONE_COLORS.teal, nowSec);
      } else if (anim.kind === 'trolley-to-olimpik') {
        drawEmojiSticker(ctx, '🚎', heroX - 32 + cycle * 48, heroY + 10 - cycle * 28, 40, TONE_COLORS.hero, nowSec);
        drawEmojiSticker(ctx, '🏗️', heroX + 46, heroY - 28, 36, TONE_COLORS.copper, nowSec);
      } else if (anim.kind === 'vodka-shower') {
        drawEmojiSticker(ctx, '🏪', heroX, heroY - 38, 38, TONE_COLORS.copper, nowSec);
        for (let i = 0; i < 6; i++) {
          const dropPhase = (rawT * 0.7 + i * 0.16) % 1;
          const bx = heroX + (i - 2.5) * 28;
          const by = heroY - 12 + dropPhase * 52;
          drawEmojiSticker(ctx, '🍾', bx, by, 28, TONE_COLORS.teal, nowSec);
        }
      } else if (anim.kind === 'tolik-sells-vodka') {
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.fillText('ТОЛИК ПРОДАЁТ ВОДКУ', heroX, heroY - 58);
        drawEmojiSticker(ctx, '🧑‍🔧', heroX - 36, heroY - 6, 40, TONE_COLORS.hero, nowSec);
        drawEmojiSticker(ctx, '🍾', heroX + 36, heroY - 6 - cycle * 10, 38, TONE_COLORS.teal, nowSec);
      } else if (anim.kind === 'kiosk-newspaper') {
        const cardW = Math.min(256, Math.max(190, radius * 1.5));
        const cardH = 82;
        const cardX = Math.round(heroX - cardW / 2);
        const cardY = Math.round(heroY - cardH / 2);

        ctx.fillStyle = 'rgba(238, 232, 214, 0.96)';
        ctx.strokeStyle = '#f5be4f';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#0a1424';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(anim.headline || '«ВЕЧЕРНИЙ ШОТМАН»', heroX, cardY + 18);

        ctx.save();
        ctx.beginPath();
        ctx.rect(cardX + 8, cardY + 34, cardW - 16, 26);
        ctx.clip();

        ctx.fillStyle = '#102038';
        ctx.fillRect(cardX + 8, cardY + 34, cardW - 16, 26);

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'left';
        const tickerStr = anim.ticker || '';
        const textWidth = Math.max(120, ctx.measureText(tickerStr).width);
        const scrollX = cardX + cardW - 10 - ((nowSec * 38) % (textWidth + cardW * 0.4));
        ctx.fillText(tickerStr, Math.round(scrollX), cardY + 47);
        ctx.restore();
      } else if (anim.kind === 'pomoyka-trash' || anim.kind === 'pomoyka-stink-hobo') {
        drawEmojiSticker(ctx, '🗑️', heroX, heroY - 6, 42, TONE_COLORS.copper, nowSec);
        if (anim.kind === 'pomoyka-stink-hobo') {
          drawEmojiSticker(ctx, '🧔', heroX + 40, heroY - 4, 34, TONE_COLORS.gold, nowSec);
        }
        ctx.globalAlpha = 0.75 * cycle;
        for (let s = 0; s < 5; s++) {
          const sx = heroX - 10 + (s - 2) * 20 + Math.sin(nowSec * 1.4 + s) * 5;
          const sy = heroY - 36 - cycle * 20;
          ctx.strokeStyle = '#9be36b';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(sx, sy, 8, 0, Math.PI * 1.5);
          ctx.stroke();
        }
      } else if (anim.kind === 'puddle-splash') {
        drawEmojiSticker(ctx, '💧', heroX, heroY - 6, 42, TONE_COLORS.teal, nowSec);
        ctx.globalAlpha = 0.8 * cycle;
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * Math.PI * 2;
          const dist = 14 + cycle * 42;
          ctx.fillStyle = '#7ce8ff';
          ctx.beginPath();
          ctx.arc(heroX + Math.cos(ang) * dist, heroY - 6 + Math.sin(ang) * dist, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (anim.kind === 'seeds-rain' || anim.kind === 'seeds-dirty-around') {
        drawEmojiSticker(ctx, '🌻', heroX, heroY - 30, 38, TONE_COLORS.gold, nowSec);
        ctx.globalAlpha = 0.85 * cycle;
        for (let s = 0; s < 10; s++) {
          const f = (rawT * 0.75 + s * 0.1) % 1;
          const sx = heroX + (s - 4.5) * 18;
          const sy = heroY - 12 + f * 48;
          ctx.fillStyle = s % 2 === 0 ? '#f5be4f' : '#a8845c';
          ctx.fillRect(Math.round(sx - 2), Math.round(sy - 3), 5, 7);
        }
      } else if (anim.kind === 'gosha-revel' || anim.kind === 'gosha-peck') {
        const ang = -Math.PI * 0.8 + t * Math.PI * 1.6;
        const r = Math.min(90, radius * 0.62);
        const gx = heroX + Math.cos(ang) * r;
        const gy = heroY + Math.sin(ang) * (r * 0.52);
        drawEmojiSticker(ctx, '🐦‍⬛', gx, gy, 42, TONE_COLORS.violet, nowSec);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.fillText('РЕВЭЛ!', Math.round(gx), Math.round(gy - 36));
      } else if (anim.kind === 'flock-ravens-flyby') {
        for (let v = 0; v < 5; v++) {
          const vx = heroX - 110 + ((rawT * 0.9 + v * 0.16) % 1.3) * 220;
          const vy = heroY - 56 + v * 24 + Math.sin(nowSec * 2 + v) * 5;
          drawEmojiSticker(ctx, '🐦‍⬛', vx, vy, 34, TONE_COLORS.violet, nowSec);
        }
      } else if (anim.kind === 'fridge-open-empty') {
        drawEmojiSticker(ctx, '🧊', heroX, heroY - 6, 44, TONE_COLORS.teal, nowSec);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#d6f7ff';
        ctx.textAlign = 'center';
        ctx.fillText('ПУСТО', heroX, heroY - 48);
      } else if (
        anim.kind === 'granade-shockwave' ||
        anim.kind === 'granade-blast' ||
        anim.kind === 'granade-chain' ||
        anim.kind === 'granade-planet-boom'
      ) {
        const waveR = anim.kind === 'granade-planet-boom' ? radius * 0.92 : 22 + cycle * 62;
        ctx.globalAlpha = 0.85 * cycle;
        ctx.strokeStyle = '#ff9d3b';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(heroX, heroY, waveR, 0, Math.PI * 2);
        ctx.stroke();

        for (let p = 0; p < 12; p++) {
          const ang = (p / 12) * Math.PI * 2;
          const dist = 12 + cycle * (waveR * 0.8);
          ctx.fillStyle = p % 2 === 0 ? '#ffd24c' : '#ff5757';
          ctx.beginPath();
          ctx.arc(heroX + Math.cos(ang) * dist, heroY + Math.sin(ang) * dist, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
        drawEmojiSticker(ctx, '💣', heroX, heroY, 40, TONE_COLORS.violet, nowSec);
      } else if (anim.kind === 'shotgun-double-reload') {
        const pulse = Math.abs(Math.sin(rawT * Math.PI * 2.5));
        drawEmojiSticker(ctx, '🔫', heroX - 14, heroY - 4, 42, TONE_COLORS.copper, nowSec);
        ctx.globalAlpha = 0.85 * pulse;
        ctx.fillStyle = '#ffd978';
        ctx.beginPath();
        ctx.arc(heroX + 36, heroY - 4, 14 + pulse * 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ffe08a';
        ctx.textAlign = 'center';
        ctx.fillText(rawT > 0.45 && rawT < 0.72 ? 'ПЕРЕЗАРЯДКА...' : 'БА-БАХ!', heroX, heroY - 46);
      } else if (anim.kind === 'shotgun-fire-flame') {
        drawEmojiSticker(ctx, '🔫', heroX - 18, heroY - 4, 42, TONE_COLORS.copper, nowSec);
        drawEmojiSticker(ctx, '🔥', heroX + 36, heroY - 4, 40, TONE_COLORS.hero, nowSec);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ffe08a';
        ctx.textAlign = 'center';
        ctx.fillText('ОГОНЬ!', heroX, heroY - 46);
      } else if (anim.kind === 'feather-fly') {
        const fx = heroX + Math.sin(t * Math.PI * 2) * 28;
        const fy = heroY + 12 - cycle * 42;
        drawEmojiSticker(ctx, '🪶', fx, fy, 44, TONE_COLORS.violet, nowSec);
      } else if (anim.kind === 'feather-into-shotglass') {
        const fy = heroY - 42 + cycle * 32;
        drawEmojiSticker(ctx, '🪶', heroX, fy, 44, TONE_COLORS.violet, nowSec);
      } else if (anim.kind === 'pelmeni-fire' || anim.kind === 'pelmeni-burn-out') {
        drawEmojiSticker(ctx, '🥟', heroX, heroY - 4, 42, anim.kind === 'pelmeni-burn-out' ? { fill: '#6d584d' } : TONE_COLORS.gold, nowSec);
        ctx.globalAlpha = 0.82 * cycle;
        for (let f = 0; f < 6; f++) {
          const fx = heroX + (f - 2.5) * 14;
          const fy = heroY - 34 - cycle * 16;
          ctx.fillStyle = f % 2 === 0 ? '#ff8243' : '#ffd24c';
          ctx.beginPath();
          ctx.arc(fx, fy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (anim.kind === 'tape-sing' || anim.kind === 'tape-auto-music') {
        drawEmojiSticker(ctx, '📼', heroX, heroY - 4, 42, TONE_COLORS.teal, nowSec);
        const notes = ['♪', '♫', '♪'];
        ctx.globalAlpha = 0.88 * cycle;
        for (let n = 0; n < 3; n++) {
          const ny = heroY - 36 - cycle * 30 - n * 10;
          const nx = heroX + (n - 1) * 28;
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = '#ffd978';
          ctx.textAlign = 'center';
          ctx.fillText(notes[n], nx, ny);
        }
      } else if (anim.kind === 'keys-jingle' || anim.kind === 'keys-open-door') {
        const jiggle = Math.sin(nowSec * 4.5) * 6;
        drawEmojiSticker(ctx, '🔑', heroX - 18 + jiggle, heroY - 8, 40, TONE_COLORS.gold, nowSec);
        if (anim.kind === 'keys-open-door') {
          drawEmojiSticker(ctx, '🚪', heroX + 28, heroY - 8, 40, TONE_COLORS.teal, nowSec);
        }
      } else if (anim.kind === 'vodka-alien-steal') {
        const ufoX = heroX + Math.sin(nowSec * 1.2) * 14;
        const lift = cycle * 46;
        const ufoY = heroY - 62 - lift * 0.25;
        ctx.globalAlpha = 0.45 * cycle;
        const beam = ctx.createLinearGradient(ufoX, ufoY + 14, heroX, heroY + 10 - lift);
        beam.addColorStop(0, 'rgba(110, 245, 200, 0.65)');
        beam.addColorStop(1, 'rgba(110, 245, 200, 0.04)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(ufoX - 16, ufoY + 14);
        ctx.lineTo(ufoX + 16, ufoY + 14);
        ctx.lineTo(heroX + 30, heroY + 10 - lift + 8);
        ctx.lineTo(heroX - 30, heroY + 10 - lift + 8);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.96;
        drawEmojiSticker(ctx, '🛸', ufoX, ufoY, 38, TONE_COLORS.teal, nowSec);
        drawEmojiSticker(ctx, '🍾', heroX, heroY + 10 - lift * 0.55, 34, TONE_COLORS.teal, nowSec);
      } else if (anim.kind === 'vodka-yurec-drink') {
        const toastY = heroY - 12 - cycle * 22;
        drawEmojiSticker(ctx, '🍾', heroX, toastY, 42, TONE_COLORS.hero, nowSec);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.fillText('🥂 ЗА ШОТМАН!', heroX, toastY - 42);
      } else if (anim.kind === 'portrait-talk') {
        drawEmojiSticker(ctx, '🖼️', heroX, heroY - 22, 42, TONE_COLORS.gold, nowSec);
        ctx.fillStyle = 'rgba(12, 20, 36, 0.94)';
        ctx.strokeStyle = '#f5be4f';
        ctx.lineWidth = 1.6;
        drawRoundedRect(ctx, heroX - 96, heroY + 14, 192, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Юр, ну ты даёшь!', heroX, heroY + 27);
      }

      ctx.restore();
    }

    renderAmbientSpawn(ctx, nowSec) {
      if (!this.ambientSpawn) return;
      const sp = this.ambientSpawn;
      const rawT = 1 - Math.max(0, sp.timer / sp.duration);
      const fade = bellCurve01(rawT);

      ctx.save();
      ctx.globalAlpha = Math.min(1, fade * 1.5);

      if (sp.kind === 'ufo-quick') {
        drawEmojiSticker(ctx, '🛸', sp.x, sp.y, 24, TONE_COLORS.violet, nowSec);
      } else if (sp.kind === 'raven-quick') {
        drawEmojiSticker(ctx, '🐦‍⬛', sp.x, sp.y, 24, TONE_COLORS.violet, nowSec);
      } else if (sp.kind === 'yurec-legend') {
        drawEmojiSticker(ctx, '👑', sp.x, sp.y, 26, TONE_COLORS.hero, nowSec);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffe599';
        ctx.textAlign = 'center';
        ctx.fillText(sp.text, Math.round(sp.x), Math.round(sp.y - 24));
      }

      ctx.restore();
    }

    renderGoshaHuntBird(ctx, nowSec) {
      if (!this.goshaHuntActive) return;
      const b = this.goshaBird;
      const targetFont = Math.max(18, 28 - this.goshaHuntScore);
      const boxHalf = Math.max(13, 20 - Math.floor(this.goshaHuntScore * 0.6));
      ctx.save();
      ctx.strokeStyle = '#ff5d5d';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(Math.round(b.x - boxHalf), Math.round(b.y - boxHalf), boxHalf * 2, boxHalf * 2);
      drawEmojiSticker(ctx, '🐦‍⬛', b.x, b.y, targetFont, TONE_COLORS.hero, nowSec);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffe599';
      ctx.textAlign = 'center';
      ctx.fillText('ГОША', Math.round(b.x), Math.round(b.y - boxHalf - 8));
      ctx.restore();
    }

    renderVodkaDefendScene(ctx, nowSec) {
      if (!this.vodkaDefendActive) return;
      const r = this.ufoRaid;
      ctx.save();

      ctx.strokeStyle = 'rgba(110, 245, 200, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + 16);
      ctx.lineTo(r.x, r.bottleY);
      ctx.stroke();

      drawEmojiSticker(ctx, '🛸', r.x, r.y, 32, TONE_COLORS.violet, nowSec);
      drawEmojiSticker(ctx, '🍾', r.x, r.bottleY, 28, TONE_COLORS.teal, nowSec);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#b9fff0';
      ctx.textAlign = 'center';
      ctx.fillText(`ТАПНИ ПО НЛО ИЛИ ВОДКЕ (${this.vodkaDefendHits}/${this.vodkaDefendHitsNeeded})`, Math.round(r.x), Math.round(r.y - 28));
      ctx.restore();
    }

    syncUi() {
      const stage = this.currentStage();
      const totalPins = this.stages.reduce((sum, s) => sum + s.pins.length, 0);

      this.kickerEl.textContent = stage.kicker;
      this.titleEl.textContent = `Мир Юрца · ${stage.title}`;
      this.hintEl.textContent = this.dayNightNote || stage.hint;
      this.visitedEl.textContent = `Точек: ${this.visitedPins.length} / ${totalPins}`;
      this.bestEl.textContent = `Поиск: ${this.bestPatrol} · Гоша: ${this.bestGoshaCatch} · Водка: ${this.bestVodkaDefend}`;

      this.spinBtn.textContent = this.autoSpin ? 'Автоповорот: ВКЛ' : 'Автоповорот: ВЫКЛ';
      this.invertBtn.textContent = this.invertControls ? 'Инверсия: ВКЛ' : 'Инверсия: ВЫКЛ';
      this.gridBtn.textContent = this.showGrid ? 'Сетка: ВКЛ' : 'Сетка: ВЫКЛ';
      this.dayNightBtn.textContent = this.showDayNight ? 'День/Ночь: ВКЛ' : 'День/Ночь: ВЫКЛ';

      if (this.stageIndex === 2) {
        this.weatherBtn.textContent = this.flatCrittersEnabled ? 'Живность: ВКЛ' : 'Живность: ВЫКЛ';
      } else {
        const wMode = this.currentWeather();
        const ruActive = WEATHER_RU_NAMES[this.autoWeatherId] || 'дождь';
        this.weatherBtn.textContent = wMode.id === 'auto'
          ? `Погода: АВТО (${ruActive})`
          : wMode.label;
      }

      this.soundBtn.textContent = this.soundEnabled ? 'Звук: ВКЛ' : 'Звук: ВЫКЛ';
      this.vibBtn.textContent = this.vibrationEnabled ? 'Вибрация: ВКЛ' : 'Вибрация: ВЫКЛ';
      this.calmBtn.textContent = this.calmMode ? '🧘 Спокойный осмотр: ВКЛ' : '🧘 Спокойный осмотр: ВЫКЛ';
      this.calmBtn.classList.toggle('is-active', this.calmMode);
      this.eveningBtn.textContent = this.eveningBroadcastMode ? '🌙 Вечерний эфир: ВКЛ' : '🌙 Вечерний эфир';
      this.eveningBtn.classList.toggle('is-active', this.eveningBroadcastMode);

      this.resetRecordsBtn.textContent = this.resetConfirmStep === 1
        ? 'Нажми ещё раз для сброса рекордов'
        : 'Сброс рекордов';
      this.resetRecordsBtn.classList.toggle('is-armed', this.resetConfirmStep === 1);

      this.stageTabsEl.innerHTML = this.stages
        .map(
          (s, idx) =>
            `<button type="button" class="yw-tab ${idx === this.stageIndex ? 'is-active' : ''}" data-stage="${s.id}">${s.title}</button>`
        )
        .join('');

      this.stageTabsEl.querySelectorAll('[data-stage]').forEach((btn) => {
        btn.addEventListener('click', () => this.goToStage(btn.getAttribute('data-stage')));
      });

      this.timeScaleBoxEl.innerHTML = TIME_SCALES.map(
        (ts, idx) =>
          `<button type="button" class="yw-time-btn ${idx === this.timeScaleIndex ? 'is-active' : ''}" data-tscale="${idx}">${ts.label}</button>`
      ).join('');

      this.timeScaleBoxEl.querySelectorAll('[data-tscale]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.timeScaleIndex = Number(btn.getAttribute('data-tscale')) || 0;
          this.syncUi();
        });
      });

      if (this.sceneAnim) {
        this.sceneBannerEl.style.display = 'block';
        this.sceneBannerEl.innerHTML = `<strong>${this.sceneAnim.caption}</strong><div class="yw-scene-sub">${this.sceneAnim.sub}</div>`;
      } else {
        this.sceneBannerEl.style.display = 'none';
        this.sceneBannerEl.innerHTML = '';
      }

      if (this.gameSummary) {
        this.summaryBoxEl.style.display = 'flex';
        this.summaryTextEl.textContent = `${this.gameSummary.title} — ${this.gameSummary.summaryText}`;
        this.retryBtn.onclick = () => this.restartMiniGameById(this.gameSummary.gameId);
      } else {
        this.summaryBoxEl.style.display = 'none';
        this.summaryTextEl.textContent = '';
        this.retryBtn.onclick = null;
      }

      if (this.patrolActive && this.patrolTargetPin) {
        this.patrolBoxEl.style.display = 'flex';
        this.patrolTargetEl.textContent = `Найди: «${this.patrolTargetPin.label}» (счёт: ${this.patrolScore})`;
      } else {
        this.patrolBoxEl.style.display = 'none';
      }

      if (this.goshaHuntActive) {
        this.goshaBoxEl.style.display = 'flex';
        this.goshaTargetEl.textContent = `Лови летающего Гошу! Поймано: ${this.goshaHuntScore}`;
      } else {
        this.goshaBoxEl.style.display = 'none';
      }

      if (this.vodkaDefendActive) {
        this.vodkaBoxEl.style.display = 'flex';
        this.vodkaTargetEl.textContent = `Отбей водку от НЛО! Счёт: ${this.vodkaDefendScore}`;
      } else {
        this.vodkaBoxEl.style.display = 'none';
      }

      if (this.selectedPin) {
        const pin = this.selectedPin;
        const stIcon = PIN_STICKERS[pin.id] || '✨';
        this.pinTitleEl.textContent = `${stIcon} ${pin.label}`;
        this.pinBlurbEl.textContent = pin.blurb;
        if (pin.kind === 'goto' && pin.goto) {
          const targetStage = this.stages.find((s) => s.id === pin.goto);
          this.gotoBtn.style.display = 'inline-block';
          this.gotoBtn.textContent = `Перейти: ${targetStage ? targetStage.title : pin.goto} ▸`;
          this.gotoBtn.onclick = () => this.goToStage(pin.goto);
        } else {
          this.gotoBtn.style.display = 'none';
          this.gotoBtn.onclick = null;
        }
      }

      this.pinsListEl.innerHTML = stage.pins
        .map((p) => {
          const active = this.selectedPin && this.selectedPin.id === p.id ? ' is-selected' : '';
          const jumpMark = p.kind === 'goto' ? ' ▸' : '';
          const sticker = PIN_STICKERS[p.id] || '✨';
          return `<button type="button" class="yw-chip${active}" data-pin="${p.id}"><span class="yw-chip-emoji">${sticker}</span><span>${p.label}${jumpMark}</span></button>`;
        })
        .join('');

      this.pinsListEl.querySelectorAll('[data-pin]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const found = stage.pins.find((p) => p.id === btn.getAttribute('data-pin'));
          if (found) this.focusOnPin(found, true, true, true);
        });
      });
    }

    buildDom() {
      this.hostEl.innerHTML = `
        <style>
          .yw-wrap {
            --yw-bg: #050a14;
            --yw-panel: #0a1424;
            --yw-card: #102038;
            --yw-border: #25486e;
            --yw-text: #e6f3ff;
            --yw-muted: #86a8cc;
            --yw-accent: #f5be4f;
            --yw-cyan: #3ec4be;
            color: var(--yw-text);
            background: var(--yw-bg);
            border: 2px solid var(--yw-border);
            border-radius: 4px;
            padding: 12px;
            box-sizing: border-box;
            font-family: monospace, sans-serif;
          }
          .yw-wrap *, .yw-wrap *::before, .yw-wrap *::after { box-sizing: border-box; }
          .yw-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; padding-bottom: 8px; margin-bottom: 10px; border-bottom: 1px solid var(--yw-border); }
          .yw-kicker { font-size: 11px; color: var(--yw-cyan); letter-spacing: 0.08em; }
          .yw-head h2 { margin: 2px 0 0; font-size: 18px; color: var(--yw-accent); }
          .yw-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: var(--yw-muted); margin-top: 4px; }
          .yw-top-btns, .yw-tabs, .yw-controls { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
          .yw-zoom-bar {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: -4px;
            margin-bottom: 10px;
          }
          .yw-zoom-btn {
            flex: 1;
            max-width: 170px;
            background: var(--yw-card);
            color: var(--yw-accent);
            border: 1px solid var(--yw-border);
            border-radius: 4px;
            padding: 7px 12px;
            font-size: 12px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
          }
          .yw-minigames {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            background: var(--yw-panel);
            border: 1px solid var(--yw-border);
            border-radius: 4px;
            padding: 7px 9px;
            margin-bottom: 8px;
          }
          .yw-minigames-label { font-size: 11px; color: var(--yw-muted); font-weight: 700; }
          .yw-minigames-btns { display: flex; flex-wrap: wrap; gap: 6px; }
          .yw-btn-gosha {
            background: #2b1a4a;
            color: #efe6ff;
            border-color: #9e7bff;
            font-weight: 700;
          }
          .yw-btn-patrol {
            background: #f5be4f;
            color: #070c14;
            border-color: #ffe49e;
            font-weight: 700;
          }
          .yw-btn-vodka {
            background: #123c42;
            color: #c8fff9;
            border-color: #3ec4be;
            font-weight: 700;
          }
          .yw-btn-stop {
            background: #c92a2a;
            color: #ffffff;
            border: 1px solid #ff8787;
            border-radius: 4px;
            padding: 5px 12px;
            font-size: 12px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
          }
          .yw-btn-retry {
            background: #2b8a3e;
            color: #ffffff;
            border: 1px solid #8ce99a;
            border-radius: 4px;
            padding: 5px 11px;
            font-size: 11px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
          }
          .yw-summary-box {
            display: none;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            background: #142238;
            border: 1px solid var(--yw-accent);
            color: #fff3c4;
            border-radius: 4px;
            padding: 7px 10px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .yw-reset-zone {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
          }
          .yw-btn-reset-records {
            background: #131c2b;
            color: #9bb4cf;
            border: 1px dashed #35587d;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 11px;
            font-family: inherit;
            cursor: pointer;
          }
          .yw-btn-reset-records.is-armed {
            background: #47141c;
            color: #ffd6dc;
            border: 1px solid #ff6b81;
            font-weight: 700;
          }
          .yw-divider { border: 0; border-top: 1px solid var(--yw-border); margin: 10px 0; }
          .yw-chips { display: flex; flex-wrap: wrap; gap: 6px; }
          .yw-tab, .yw-btn { background: var(--yw-card); color: var(--yw-text); border: 1px solid var(--yw-border); border-radius: 3px; padding: 6px 10px; font-size: 12px; font-family: inherit; cursor: pointer; }
          .yw-tab.is-active, .yw-btn.is-active { background: var(--yw-accent); color: #070c14; border-color: #ffe49e; font-weight: 700; }
          .yw-timebar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; background: var(--yw-panel); border: 1px solid var(--yw-border); border-radius: 3px; padding: 6px 8px; margin-bottom: 8px; }
          .yw-timebar-label { font-size: 11px; color: var(--yw-cyan); font-weight: 700; }
          .yw-time-group { display: flex; flex-wrap: wrap; gap: 4px; }
          .yw-time-btn { background: #08101e; color: var(--yw-muted); border: 1px solid #1e3a5c; border-radius: 2px; padding: 4px 7px; font-size: 11px; font-family: inherit; cursor: pointer; }
          .yw-time-btn.is-active { background: var(--yw-cyan); color: #051014; border-color: #a8fffb; font-weight: 700; }
          .yw-hint { font-size: 12px; color: var(--yw-muted); background: var(--yw-panel); border: 1px solid var(--yw-border); border-radius: 3px; padding: 7px 10px; margin-bottom: 8px; }
          .yw-scene { display: none; background: #121833; border: 1px solid #9482f0; color: #f2eeff; border-radius: 3px; padding: 8px 10px; font-size: 12px; margin-bottom: 8px; }
          .yw-scene-sub { font-size: 11px; color: #b8c8e6; margin-top: 3px; }
          .yw-patrol, .yw-gosha-hunt, .yw-vodka-box { display: none; justify-content: space-between; align-items: center; gap: 8px; background: #291018; border: 1px solid #ff5d5d; color: #ffd6d6; border-radius: 3px; padding: 7px 10px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
          .yw-gosha-hunt { background: #1d1433; border-color: #9482f0; color: #ece6ff; }
          .yw-vodka-box { background: #0d2b30; border-color: #3ec4be; color: #c8fff9; }
          .yw-mg-right { display: inline-flex; align-items: center; gap: 8px; }
          .yw-stage { background: #040812; border: 1px solid var(--yw-border); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
          .yw-canvas { width: 100%; height: 420px; display: block; cursor: grab; touch-action: none; }
          .yw-inspector { background: var(--yw-panel); border: 1px solid var(--yw-border); border-radius: 3px; padding: 10px 12px; margin-bottom: 10px; }
          .yw-inspector-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
          .yw-inspector h3 { margin: 0; font-size: 15px; color: var(--yw-accent); }
          .yw-inspector p { margin: 0; font-size: 13px; line-height: 1.45; }
          .yw-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: var(--yw-card);
            color: var(--yw-text);
            border: 1px solid var(--yw-border);
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 11px;
            font-family: inherit;
            cursor: pointer;
          }
          .yw-chip-emoji { font-size: 15px; line-height: 1; }
          .yw-chip.is-selected { border-color: var(--yw-accent); color: #ffe49e; background: #1a2d4b; }
        </style>

        <div class="yw-wrap">
          <div class="yw-head">
            <div>
              <div class="yw-kicker" data-role="kicker"></div>
              <h2 data-role="title">Мир Юрца</h2>
              <div class="yw-meta">
                <span data-role="visited">Точек: 0</span>
                <span data-role="best">Поиск: 0</span>
              </div>
            </div>
            <div class="yw-top-btns">
              <button type="button" class="yw-btn" data-act="gag">🎲 Случайная сценка</button>
              <button type="button" class="yw-btn" data-act="evening">🌙 Вечерний эфир</button>
              <button type="button" class="yw-btn" data-act="calm">🧘 Спокойный осмотр: ВЫКЛ</button>
            </div>
          </div>

          <div class="yw-minigames">
            <span class="yw-minigames-label">МИНИ-ИГРЫ:</span>
            <div class="yw-minigames-btns">
              <button type="button" class="yw-btn yw-btn-gosha" data-act="gosha-hunt">🐦‍⬛ Ловля Гоши</button>
              <button type="button" class="yw-btn yw-btn-patrol" data-act="patrol">🔎 Поиск предметов</button>
              <button type="button" class="yw-btn yw-btn-vodka" data-act="vodka-defend">🍾 Отбей водку от НЛО</button>
            </div>
          </div>

          <div class="yw-tabs" data-role="stage-tabs"></div>

          <div class="yw-timebar">
            <span class="yw-timebar-label">ШКАЛА ВРАЩЕНИЯ:</span>
            <div class="yw-time-group" data-role="time-scales"></div>
          </div>

          <div class="yw-hint" data-role="hint"></div>
          <div class="yw-scene" data-role="scene-banner"></div>
          <div class="yw-summary-box" data-role="summary-box">
            <span data-role="summary-text"></span>
            <button type="button" class="yw-btn-retry" data-role="retry-btn">Ещё раз</button>
          </div>
          <div class="yw-patrol" data-role="patrol-box">
            <span data-role="patrol-target"></span>
            <span class="yw-mg-right">
              <strong data-role="timer">24 с</strong>
              <button type="button" class="yw-btn-stop" data-stop="patrol">СТОП</button>
            </span>
          </div>
          <div class="yw-gosha-hunt" data-role="gosha-box">
            <span data-role="gosha-target"></span>
            <span class="yw-mg-right">
              <strong data-role="gosha-timer">20 с</strong>
              <button type="button" class="yw-btn-stop" data-stop="gosha">СТОП</button>
            </span>
          </div>
          <div class="yw-vodka-box" data-role="vodka-box">
            <span data-role="vodka-target"></span>
            <span class="yw-mg-right">
              <strong data-role="vodka-timer">22 с</strong>
              <button type="button" class="yw-btn-stop" data-stop="vodka">СТОП</button>
            </span>
          </div>

          <div class="yw-stage">
            <canvas class="yw-canvas" data-role="canvas"></canvas>
          </div>

          <div class="yw-zoom-bar">
            <button type="button" class="yw-zoom-btn" data-act="zoom-out">Дальше −</button>
            <button type="button" class="yw-zoom-btn" data-act="zoom-in">Ближе +</button>
          </div>

          <div class="yw-inspector">
            <div class="yw-inspector-head">
              <h3 data-role="pin-title">🏙️ Шотмана</h3>
              <button type="button" class="yw-btn yw-btn-patrol" data-role="goto-btn" style="display:none;"></button>
            </div>
            <p data-role="pin-blurb"></p>
          </div>

          <div class="yw-controls">
            <button type="button" class="yw-btn" data-act="spin">Автоповорот: ВКЛ</button>
            <button type="button" class="yw-btn" data-act="sound">Звук: ВКЛ</button>
            <button type="button" class="yw-btn" data-act="vib">Вибрация: ВКЛ</button>
            <button type="button" class="yw-btn" data-act="weather">Погода: ВЫКЛ</button>
            <button type="button" class="yw-btn" data-act="invert">Инверсия: ВЫКЛ</button>
            <button type="button" class="yw-btn" data-act="daynight">День/Ночь: ВКЛ</button>
            <button type="button" class="yw-btn" data-act="grid">Сетка: ВКЛ</button>
            <button type="button" class="yw-btn" data-act="reset">Сброс</button>
          </div>

          <hr class="yw-divider" />

          <div class="yw-chips" data-role="pins-list"></div>

          <hr class="yw-divider" />

          <div class="yw-reset-zone">
            <button type="button" class="yw-btn-reset-records" data-act="reset-records">Сброс рекордов</button>
          </div>
        </div>
      `;

      this.kickerEl = this.hostEl.querySelector('[data-role="kicker"]');
      this.titleEl = this.hostEl.querySelector('[data-role="title"]');
      this.visitedEl = this.hostEl.querySelector('[data-role="visited"]');
      this.bestEl = this.hostEl.querySelector('[data-role="best"]');
      this.stageTabsEl = this.hostEl.querySelector('[data-role="stage-tabs"]');
      this.timeScaleBoxEl = this.hostEl.querySelector('[data-role="time-scales"]');
      this.hintEl = this.hostEl.querySelector('[data-role="hint"]');
      this.sceneBannerEl = this.hostEl.querySelector('[data-role="scene-banner"]');
      this.summaryBoxEl = this.hostEl.querySelector('[data-role="summary-box"]');
      this.summaryTextEl = this.hostEl.querySelector('[data-role="summary-text"]');
      this.retryBtn = this.hostEl.querySelector('[data-role="retry-btn"]');
      this.patrolBoxEl = this.hostEl.querySelector('[data-role="patrol-box"]');
      this.patrolTargetEl = this.hostEl.querySelector('[data-role="patrol-target"]');
      this.timerEl = this.hostEl.querySelector('[data-role="timer"]');
      this.goshaBoxEl = this.hostEl.querySelector('[data-role="gosha-box"]');
      this.goshaTargetEl = this.hostEl.querySelector('[data-role="gosha-target"]');
      this.goshaTimerEl = this.hostEl.querySelector('[data-role="gosha-timer"]');
      this.vodkaBoxEl = this.hostEl.querySelector('[data-role="vodka-box"]');
      this.vodkaTargetEl = this.hostEl.querySelector('[data-role="vodka-target"]');
      this.vodkaTimerEl = this.hostEl.querySelector('[data-role="vodka-timer"]');
      this.canvas = this.hostEl.querySelector('[data-role="canvas"]');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.spinBtn = this.hostEl.querySelector('[data-act="spin"]');
      this.soundBtn = this.hostEl.querySelector('[data-act="sound"]');
      this.eveningBtn = this.hostEl.querySelector('[data-act="evening"]');
      this.calmBtn = this.hostEl.querySelector('[data-act="calm"]');
      this.resetRecordsBtn = this.hostEl.querySelector('[data-act="reset-records"]');
      this.vibBtn = this.hostEl.querySelector('[data-act="vib"]');
      this.weatherBtn = this.hostEl.querySelector('[data-act="weather"]');
      this.invertBtn = this.hostEl.querySelector('[data-act="invert"]');
      this.dayNightBtn = this.hostEl.querySelector('[data-act="daynight"]');
      this.gridBtn = this.hostEl.querySelector('[data-act="grid"]');
      this.goshaBtn = this.hostEl.querySelector('[data-act="gosha-hunt"]');
      this.patrolBtn = this.hostEl.querySelector('[data-act="patrol"]');
      this.vodkaBtn = this.hostEl.querySelector('[data-act="vodka-defend"]');
      this.pinTitleEl = this.hostEl.querySelector('[data-role="pin-title"]');
      this.pinBlurbEl = this.hostEl.querySelector('[data-role="pin-blurb"]');
      this.gotoBtn = this.hostEl.querySelector('[data-role="goto-btn"]');
      this.pinsListEl = this.hostEl.querySelector('[data-role="pins-list"]');
    }

    bindEvents() {
      this.spinBtn.addEventListener('click', () => {
        this.autoSpin = !this.autoSpin;
        if (this.autoSpin) {
          this.calmMode = false;
          if (this.ambientCooldown > 100) this.ambientCooldown = 1.6;
        }
        this.audio.playKeys();
        this.syncUi();
      });

      this.soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) this.audio.playKeys();
        this.syncUi();
      });

      this.vibBtn.addEventListener('click', () => {
        this.vibrationEnabled = !this.vibrationEnabled;
        this.audio.playKeys();
        this.syncUi();
      });

      this.weatherBtn.addEventListener('click', () => {
        if (this.stageIndex === 2) {
          this.flatCrittersEnabled = !this.flatCrittersEnabled;
          if (this.flatCrittersEnabled) this.calmMode = false;
          this.audio.playSplash();
          this.syncUi();
          return;
        }
        this.weatherIndex = (this.weatherIndex + 1) % WEATHER_MODES.length;
        if (this.currentWeather().id !== 'off') {
          this.calmMode = false;
        }
        if (this.currentWeather().id === 'auto') {
          this.autoWeatherId = AUTO_WEATHER_POOL[Math.floor(Math.random() * AUTO_WEATHER_POOL.length)];
          this.weatherRotateProgress = 0;
          this.weatherRotateThreshold = 1.6 + Math.random() * 2.2;
        }
        this.audio.playSplash();
        this.syncUi();
      });

      this.invertBtn.addEventListener('click', () => {
        this.invertControls = !this.invertControls;
        this.audio.playKeys();
        this.syncUi();
      });

      this.dayNightBtn.addEventListener('click', () => {
        this.showDayNight = !this.showDayNight;
        this.audio.playKeys();
        this.syncUi();
      });

      this.gridBtn.addEventListener('click', () => {
        this.showGrid = !this.showGrid;
        this.audio.playKeys();
        this.syncUi();
      });

      this.hostEl.querySelector('[data-act="gag"]').addEventListener('click', () => {
        this.triggerRandomGag();
      });

      this.eveningBtn.addEventListener('click', () => {
        this.applyEveningBroadcastPreset();
      });

      this.calmBtn.addEventListener('click', () => {
        this.toggleCalmPreset();
      });

      this.resetRecordsBtn.addEventListener('click', () => {
        this.handleResetRecordsClick();
      });

      this.goshaBtn.addEventListener('click', () => {
        if (this.goshaHuntActive) {
          this.stopGoshaHuntGame();
        } else {
          this.startGoshaHuntGame();
        }
      });

      this.patrolBtn.addEventListener('click', () => {
        if (this.patrolActive) {
          this.stopPatrolGame();
        } else {
          this.startPatrolGame();
        }
      });

      this.vodkaBtn.addEventListener('click', () => {
        if (this.vodkaDefendActive) {
          this.stopVodkaDefendGame();
        } else {
          this.startVodkaDefendGame();
        }
      });

      this.hostEl.querySelector('[data-stop="patrol"]').addEventListener('click', () => this.stopPatrolGame());
      this.hostEl.querySelector('[data-stop="gosha"]').addEventListener('click', () => this.stopGoshaHuntGame());
      this.hostEl.querySelector('[data-stop="vodka"]').addEventListener('click', () => this.stopVodkaDefendGame());

      this.hostEl.querySelector('[data-act="zoom-in"]').addEventListener('click', () => {
        this.targetZoom = Math.min(1.95, +(this.targetZoom + 0.14).toFixed(2));
        this.audio.playKeys();
      });

      this.hostEl.querySelector('[data-act="zoom-out"]').addEventListener('click', () => {
        this.targetZoom = Math.max(0.58, +(this.targetZoom - 0.14).toFixed(2));
        this.audio.playKeys();
      });

      this.hostEl.querySelector('[data-act="reset"]').addEventListener('click', () => {
        this.weatherIndex = 0;
        this.flatCrittersEnabled = false;
        this.eveningBroadcastMode = false;
        this.resetConfirmStep = 0;
        this.targetZoom = this.currentStage().defaultZoom;
        this.velYaw = 0;
        this.velPitch = 0;
        this.selectInitialPin();
        this.audio.playStageShift();
        this.syncUi();
      });

      if (!this.canvas) return;

      this.canvas.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        this.dragMoved = false;
        this.targetYaw = null;
        this.targetPitch = null;
        this.lastPtrX = e.clientX;
        this.lastPtrY = e.clientY;
        this.velYaw = 0;
        this.velPitch = 0;
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastPtrX;
        const dy = e.clientY - this.lastPtrY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          this.dragMoved = true;
        }
        this.lastPtrX = e.clientX;
        this.lastPtrY = e.clientY;

        const dir = this.invertControls ? -1 : 1;
        const sens = 0.0052 / Math.max(0.65, this.zoom);
        this.velYaw = dx * sens * dir;
        this.velPitch = dy * sens * dir;
        this.yaw += this.velYaw;
        this.pitch += this.velPitch;
      });

      const releasePointer = (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (!this.dragMoved) {
          this.handleTap(e.clientX, e.clientY);
        }
      };

      this.canvas.addEventListener('pointerup', releasePointer);
      this.canvas.addEventListener('pointercancel', () => {
        this.isDragging = false;
      });

      this.canvas.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches && e.touches.length === 2) {
            this.isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            this.pinchStartDist = Math.hypot(dx, dy);
            this.pinchStartZoom = this.targetZoom;
          }
        },
        { passive: true }
      );

      this.canvas.addEventListener(
        'touchmove',
        (e) => {
          if (e.touches && e.touches.length === 2 && this.pinchStartDist > 0) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const ratio = dist / this.pinchStartDist;
            this.targetZoom = Math.max(0.58, Math.min(1.95, +(this.pinchStartZoom * ratio).toFixed(2)));
          }
        },
        { passive: false }
      );

      this.canvas.addEventListener(
        'touchend',
        () => {
          this.pinchStartDist = 0;
        },
        { passive: true }
      );

      this.canvas.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();
          const step = e.deltaY < 0 ? 0.1 : -0.1;
          this.targetZoom = Math.max(0.58, Math.min(1.95, +(this.targetZoom + step).toFixed(2)));
        },
        { passive: false }
      );
    }

    handleTap(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (this.sceneAnim && this.sceneAnim.kind === 'blackout-whisper') {
        const centerDist = Math.hypot(x - rect.width / 2, y - rect.height / 2);
        if (centerDist < 90) {
          const nextWhisper = BLACKOUT_WHISPERS[this.whisperIdx % BLACKOUT_WHISPERS.length];
          this.whisperIdx = (this.whisperIdx + 1) % BLACKOUT_WHISPERS.length;
          this.sceneAnim.whisperText = nextWhisper;
          this.sceneAnim.caption = `🕯️ Свет отключили в трёшке! ${nextWhisper}`;
          this.sceneAnim.timer = this.sceneAnim.duration;
          this.triggerVibrate(25);
          this.audio.playWhisper();
          this.syncUi();
          return;
        }
      }

      if (this.goshaHuntActive) {
        const hitRad = Math.max(18, 32 - this.goshaHuntScore);
        const dGosha = Math.hypot(this.goshaBird.x - x, this.goshaBird.y - y);
        if (dGosha < hitRad) {
          this.goshaHuntScore += 1;
          this.goshaHuntTimeLeft = Math.min(24, this.goshaHuntTimeLeft + Math.max(0.6, 2.0 - this.goshaHuntScore * 0.2));
          this.triggerVibrate(45);
          this.audio.playCatch();
          if (this.goshaHuntScore > this.bestGoshaCatch) {
            this.bestGoshaCatch = this.goshaHuntScore;
            writeStorage(STORAGE_KEYS.BEST_GOSHA_CATCH, this.bestGoshaCatch);
          }
          this.goshaBird.x = 40 + Math.random() * Math.max(80, rect.width - 80);
          this.goshaBird.y = 40 + Math.random() * Math.max(80, rect.height - 80);
          this.goshaBird.vx = (Math.random() < 0.5 ? -1 : 1) * (145 + this.goshaHuntScore * 14);
          this.goshaBird.vy = (Math.random() < 0.5 ? -1 : 1) * (110 + this.goshaHuntScore * 10);
          this.syncUi();
          return;
        }
      }

      if (this.vodkaDefendActive) {
        const r = this.ufoRaid;
        const hitUfo = Math.hypot(r.x - x, r.y - y) < 34;
        const hitBottle = Math.hypot(r.x - x, r.bottleY - y) < 32;
        if (hitUfo || hitBottle) {
          this.vodkaDefendHits += 1;
          this.triggerVibrate(45);
          this.audio.playKeys();
          if (this.vodkaDefendHits >= this.vodkaDefendHitsNeeded) {
            this.vodkaDefendScore += 1;
            this.audio.playCatch();
            this.vodkaDefendHits = 0;
            this.vodkaDefendHitsNeeded = Math.min(5, 2 + Math.floor(this.vodkaDefendScore / 2));
            this.vodkaDefendTimeLeft = Math.min(26, this.vodkaDefendTimeLeft + Math.max(1.0, 2.8 - this.vodkaDefendScore * 0.25));
            this.ufoRaid.bottleY = Math.min(rect.height - 46, rect.height * 0.68);
            this.ufoRaid.x = 48 + Math.random() * Math.max(80, rect.width - 96);
            if (this.vodkaDefendScore > this.bestVodkaDefend) {
              this.bestVodkaDefend = this.vodkaDefendScore;
              writeStorage(STORAGE_KEYS.BEST_VODKA_DEFEND, this.bestVodkaDefend);
            }
          }
          this.syncUi();
          return;
        }
      }

      let closest = null;
      let minDist = 30;
      for (const item of this.projectedPins) {
        const d = Math.hypot(item.x - x, item.y - y);
        if (d < minDist) {
          minDist = d;
          closest = item.pin;
        }
      }

      if (closest) {
        this.focusOnPin(closest, true, true, true);
      }
    }

    startLoop() {
      this.lastTime = performance.now();
      const loop = (now) => {
        if (this.destroyed) return;
        try {
          const dtSec = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
          this.lastTime = now;
          this.update(dtSec);
          this.render();
        } catch (_) {}
        this.rafId = global.requestAnimationFrame(loop);
      };
      this.rafId = global.requestAnimationFrame(loop);
    }

    destroy() {
      this.destroyed = true;
      if (this.rafId) {
        global.cancelAnimationFrame(this.rafId);
      }
    }
  }

  function mount(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return null;
    return new YurecWorldController(el);
  }

  global.YurecWorld = {
    mount
  };
})(typeof window !== 'undefined' ? window : globalThis);
