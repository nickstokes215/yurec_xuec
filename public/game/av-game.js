/* Дворовый пинг-понг «ПОМОЙКОБОЛ» — повар, лысый, ящер, батя, светка, пилюли */
(function (root) {
  "use strict";
  var W = 360;
  var H = 640;
  var NET = H / 2;
  var PILL_KINDS = ["foil", "shrink", "grow", "shot", "dump", "vodka", "life", "king", "sticky", "rot", "ufo"];
  var PILL_META = {
    foil: { name: "фольга", fill: "#cfd8dc", glow: "rgba(180,220,240,0.55)" },
    shrink: { name: "карлик", fill: "#8b5cff", glow: "rgba(140,90,255,0.5)" },
    grow: { name: "кабан", fill: "#e08a2c", glow: "rgba(224,138,44,0.5)" },
    shot: { name: "дробовик", fill: "#6b4a2b", glow: "rgba(180,90,40,0.5)" },
    dump: { name: "помойка", fill: "#5a7a3a", glow: "rgba(90,140,50,0.5)" },
    vodka: { name: "водка", fill: "#c9a227", glow: "rgba(232,195,106,0.55)" },
    life: { name: "жизнь", fill: "#c43b6e", glow: "rgba(196,59,110,0.5)" },
    king: { name: "король", fill: "#d4a017", glow: "rgba(212,160,23,0.6)" },
    sticky: { name: "липучка", fill: "#7ec8e3", glow: "rgba(126,200,227,0.55)" },
    laser: { name: "лазер", fill: "#ff2a6a", glow: "rgba(255,42,106,0.7)" },
    rot: { name: "просрочка", fill: "#6b7a22", glow: "rgba(140,160,40,0.55)" },
    ufo: { name: "нло", fill: "#9b6bff", glow: "rgba(155,107,255,0.6)" }
  };
  var YUREC_SCORE = [
    "Я — бля, легенда!",
    "РЕВЭЛ!",
    "ШАВЕРМУ В ЛАВАШЕ, ЛОХИ!",
    "Я — бог Шотмана!",
    "Купола сами выросли!"
  ];
  var KOSTYA_SCORE = [
    "Юрец, сегодня ты на асфальте.",
    "Икра не помогает, Юр.",
    "Раскатал. Носом в помойку.",
    "Кастян сказал: хватит.",
    "Легенда — да. Счёт — мой."
  ];
  var DIFFS = {
    povar: {
      label: "Повар шавермы",
      sub: "колобок с гриля",
      foe: "Повар",
      fill: "#b85a32",
      scoreBg: "#b85a32",
      scoreFg: "#fff4ea",
      face: "povar",
      ball: 240, ai: 130, err: 72, delay: 0.32, accel: 1.018, max: 420, playerR: 56, aiR: 50,
      score: [
        "Бери лаваш и вали, психопат!",
        "Чеснок есть. Скидки нет. Разговор окончен.",
        "Гриль не исповедальня.",
        "Лаваш не броня. Гранату на кассу не клади.",
        "Шаверма 24/7, терпение — нет.",
        "Соус без огурцов — вали.",
        "Картошка забытая. Ты — нет, к сожалению.",
        "Бери и вали."
      ]
    },
    lysy: {
      label: "Лысый хер",
      sub: "колобок из «Олимпика»",
      foe: "Лысый хер",
      fill: "#c9a227",
      scoreBg: "#c9a227",
      scoreFg: "#1a1408",
      face: "lysy",
      ball: 340, ai: 270, err: 20, delay: 0.09, accel: 1.035, max: 560, playerR: 50, aiR: 50,
      score: [
        "Юра, вали отсюда, придурок!",
        "Фараон Олимпика? В моём кабинете ты никто.",
        "Юрец, ты чё, опять в говно?",
        "Линолеум тебя уволил. Я только подтвердил.",
        "Идей полно. Мозгов — на одну дырку в гипсокартоне.",
        "Шваброй махал, клиентам хамил, зарплату забудь.",
        "На следующей неделе тебя тоже не возьмут.",
        "Смена закрыта. Ты — тем более."
      ]
    },
    yasher: {
      label: "Бабка-ящер",
      sub: "Зинаида с половником",
      foe: "Бабка-ящер",
      fill: "#6a9a52",
      scoreBg: "#6a9a52",
      scoreFg: "#12200e",
      face: "zinaida",
      ball: 400, ai: 360, err: 18, delay: 0.07, accel: 1.042, max: 640, playerR: 48, aiR: 50,
      predict: true, tongue: true,
      score: [
        "В бак ссышь!",
        "Юрец, алкаш, открой!",
        "В бак ссышь, водку хлещешь, ворона держишь!",
        "Юрец, алкаш, заткнись!",
        "Цветы мои, а не твой сортир!",
        "Половник сам дойдёт, если ноги не донесут.",
        "Юрец, ещё раз в бак — вызову санэпидемстанцию!",
        "Стена тонкая, сынок. Я уже всё знаю.",
        "ЖЭК меня боится. Ты — пока нет. Пока.",
        "Ящер я или нет — а цветы мои, понял?"
      ]
    },
    batya: {
      label: "Батя Юрца",
      sub: "ФСБ-шник с дробовиком",
      foe: "Батя",
      fill: "#2a3544",
      scoreBg: "#2a3544",
      scoreFg: "#e8c36a",
      face: "batya",
      ball: 520, ai: 660, err: 1.2, delay: 0, accel: 1.075, max: 840, playerR: 42, aiR: 56,
      predict: true, gun: true,
      score: [
        "Сынок, ты дебил клинический, бля!",
        "Юра, хули ты опять творишь, придурок!",
        "Корочка ФСБ не для таких хуёв, как ты.",
        "В мусарню больше не приеду, сам разбирайся, дебил!",
        "Ещё одна граната — и я сам тебя посажу, понял?",
        "Сынок, ты придурок. Я устал тебя спасать.",
        "ФСБ увольняет. Соседи — нет. Выбирай, дебил.",
        "Подписка о невыезде, а ты в ларёк прёшься, хуй!",
        "Сынок, ты дебил! Корочка не резиновая."
      ]
    },
    sveta: {
      label: "Светлана",
      sub: "королева Максидома",
      foe: "Светка",
      fill: "#c43b6e",
      scoreBg: "#c43b6e",
      scoreFg: "#fff",
      face: "svetlana",
      ball: 620, ai: 900, err: 0.12, delay: 0, accel: 1.1, max: 1020, playerR: 36, aiR: 60,
      predict: true, dumpster: true, goal: 2,
      score: [
        "Юр, ну ты даёшь...",
        "Юрец, опять ты? Что на этот раз?",
        "Иди за шваброй, а не за водкой.",
        "Юр, я на кассе, не ори.",
        "Юр, я продаю дрели. Ты продаёшь сказки.",
        "Если это любовь, Юр, я лучше инвентаризацию.",
        "Помойка — мой аргумент. Лови пять.",
        "Поцелуй будет. Если доживёшь. Не доживёшь.",
        "Портрет на серванте тебя не спасёт."
      ]
    },
    kostya: {
      label: "Костя",
      sub: "зеркало · бог против Юрца, до пяти",
      foe: "Юрец",
      fill: "#3a5a8a",
      scoreBg: "#3a5a8a",
      scoreFg: "#f4e4a1",
      face: "yurec",
      playerFace: "kostya",
      ball: 200, ai: 110, err: 70, delay: 0.4, accel: 1.015, max: 380, playerR: 52, aiR: 48,
      mirror: true, god: true, goal: 5,
      score: [
        "Кастян, я легенда, а ты с икрой!",
        "Я — бог Шотмана! Купола сами!",
        "Носом в помойку? Это ты туда.",
        "РЕВЭЛ, Кастян! Я император!",
        "Граната под подушкой. Ты — никто.",
        "Светка в Максидоме, а ты тут.",
        "Я — бля, легенда. Счёт не важен."
      ]
    }
  };
  var LADLE_LAUGH = [
    "Ха-ха, половник сам дойдёт!",
    "Смеётся ящер: в бак ссышь!",
    "Половником по куполам, алкаш!",
    "Ха! ЖЭК меня боится, а ты — тем более!"
  ];
  function E(k, h, t) { return { k: k, h: h, t: t }; }
  var END_LINES = {
    povar: {
      w0: [E("сухой гриль", "5:0 — лаваш без боя", "Повар даже щипцы не поднял. Шаверма сама прыгнула в лаваш."), E("касса в нокауте", "Повар сел на котлету", "Неон «24/7» моргнул и сдался. Чеснока хватит до пятницы.")],
      w1: [E("почти без соуса", "5:1 — гриль шипит", "Один лаваш повар отбил, четыре — нет. Юрец орёт скидку."), E("картошка молчит", "Четыре шавермы и одна в стену", "Повар вытер лоб фартуком. Касса пискнула от стыда.")],
      w2: [E("соус на полу", "5:2 — почти касание", "Два мяча повару. Три Юрцу в живот. Гриль шипит от стыда."), E("чеснок не спас", "Лаваш улетел к Юрцу", "Повар бормочет: скидки нет. Юрец уже жуёт.")],
      w3: [E("на зубах", "5:3 — касса сдалась", "Три мяча повар отбил, как котлеты. Четвёртый унёс шаверму."), E("фартук мокрый", "Повар выдохся", "Гриль 24/7, терпение — нет. Юрец орёт: без огурцов!")],
      w4: [E("на волоске", "5:4 — соус брызнул", "Почти касание. Юрец унёс шаверму на зубах. Касса ещё дымится."), E("последний лаваш", "Чуть не слили", "Четыре-пять. Повар сунул лаваш и сел. Бери и не вали.")],
      l0: [E("касса закрыта", "0:5 — бери и вали", "Повар отбил Юрца, как котлету. Шавермы нет, даже картошка отвернулась."), E("без скидки", "Психопат у кассы", "Бери лаваш и вали. Неон даже не моргнул.")],
      l1: [E("один в стену", "1:5 — чеснок есть", "Один мяч Юрца. Повар зевнул. Скидки нет, разговор окончен."), E("голодный пророк", "Шавермы не будет", "Юрец орёт про гранату. Повар уже отвернулся.")],
      l2: [E("два и в дверь", "2:5 — вали", "Два гола — и повар всё равно сунул Юрца за дверь."), E("гриль победил", "Котлета 2:5", "Лаваш не броня. Гранату на кассу не клади.")],
      l3: [E("почти доел", "3:5 — касса сильнее", "Три мяча Юрца. Повар всё равно закрыл гриль. Голодный император."), E("соус на куполах", "Не дожал", "Три-пять. Чеснок есть. Шавермы — нет.")],
      l4: [E("один мяч до лаваша", "4:5 — почти", "Четыре гола, пятый в стену. Лаваш улетел к другому лоху."), E("касса на миллиметр", "Так близко", "4:5. Повар: бери лаваш и вали, психопат.")]
    },
    lysy: {
      w0: [E("фараон линолеума", "5:0 — кабинет пуст", "Лысый хер не успел орать. Юрец вошёл в «Олимпик», как в храм."), E("никто сел", "Сухой разгром", "В кабинете ты никто — говорил он. Теперь никто — он.")],
      w1: [E("один рулон", "5:1 — гипсокартон плачет", "Один мяч лысому. Четыре Юрцу. Жилетка уже на плечах."), E("смена открыта", "Придурок с пропуском", "Юра, вали… не, стой. Проход в строймаг выбит.")],
      w2: [E("два в кабинет", "5:2 — линолеум ждёт", "Два мяча начальнику. Юрец орёт: я фараон Олимпика!"), E("дыра в стене", "Мозгов на одну дырку", "Лысый отбил два. Остальное — в жилетку Юрца.")],
      w3: [E("три штрафа", "5:3 — всё равно взяли", "Три мяча лысому, и дверь всё равно открылась. Зарплату не забудь."), E("швабра сдалась", "Клиентам не хамил", "5:3. Линолеум тебя не уволил. Сегодня.")],
      w4: [E("на пороге", "5:4 — калитка скрипнула", "Почти закрыл. Юрец просунул жилетку в щель и вошёл."), E("один мяч до увольнения", "Чуть не слили Олимпик", "4 мяча лысому. Пятый Юрец забил лбом в кабинет.")],
      l0: [E("дверь на замок", "0:5 — ты никто", "Лысый хер захлопнул калитку. «Олимпик» закрыт навсегда."), E("придурок у ворот", "Вали отсюда", "Юра, вали отсюда, придурок! Смена закрыта. Ты — тем более.")],
      l1: [E("один рулон в лицо", "1:5 — линолеум уволил", "Один гол. Лысый подтвердил. На следующей неделе тоже не возьмут."), E("никто с одним мячом", "Кабинет ржёт", "Юрец, ты чё, опять в говно? Один мяч не пропуск.")],
      l2: [E("два и на мороз", "2:5 — смена мертва", "Два гола. Шваброй махал, клиентам хамил, зарплату забудь."), E("гипсокартон сильнее", "Идей полно", "Мозгов — на одну дырку. Два мяча это не фараон.")],
      l3: [E("три не хватило", "3:5 — дверь не открылась", "Три гола в кабинет. Лысый: линолеум тебя не ждёт."), E("почти в штате", "Чуть-чуть придурок", "3:5. Без твоих идей тоска. С тобой — пожар и закрыто.")],
      l4: [E("на миллиметр", "4:5 — калитка в нос", "Четыре. Пятый лысый захлопнул лбом. Никогда не попадёшь."), E("один мяч до жилетки", "Так близко к Олимпику", "4:5. Фараон остался на морозе.")]
    },
    yasher: {
      w0: [E("ящер в баке", "5:0 — фольга на куполах", "Зинаида даже половник не успела. «Столичная» на месте."), E("сухой рептилоид", "Бак молчит", "Юрец орёт от радости. Ящер уделан всухую. Гоша каркает РЕВЭЛ.")],
      w1: [E("один в стену", "5:1 — цветы целы", "Один мяч ящеру. Четыре — в бак. Половник остался на гвозде."), E("почти без шипения", "Радуга выключена", "5:1. Юрец, алкаш, заткнись — не сегодня.")],
      w2: [E("два шипения", "5:2 — портал прикрыт", "Два мяча Зинаиде. Водка не улетела. Фольга сверкает."), E("половник не дошёл", "Ящер запыхался", "Два-пять. Цветы мои, а шары — Юрца.")],
      w3: [E("половник в руке", "5:3 — не успела", "Три мяча Зинаиде. Половник ещё на гвозде. Юрец закрыл бак."), E("смех оборвался", "Ха-ха оборвалось", "Три гола ящеру. Четвёртый и пятый — Юрца. Цветы целы, водка на месте.")],
      w4: [E("на острие половника", "5:4 — чудо Шотмана", "Половник вышел на четвёртом. Юрец всё равно забил пятый. Водка на серванте."), E("почти слилась", "Ящер чуть не унёс пузырь", "4 мяча бабке. Пятый Юрец пропихнул мимо половника.")],
      l0: [E("водка ушла", "0:5 — слизала всё", "Бабка-ящер слизала водку. Через «Радугу» булькает «Финляндия»."), E("в бак ссышь", "Сухой позор", "Ни одного мяча. Юрец, алкаш, открой. Не открыл.")],
      l1: [E("один и в бак", "1:5 — цветы победили", "Один гол. Половник дошёл. Водка уже в Зинаиде."), E("алкаш с одним шаром", "Стена тонкая", "Сынок, я уже всё знаю. И водку твою тоже.")],
      l2: [E("два пузыря", "2:5 — портал открыт", "Два гола. Ящер забрал остальное. Фольга не спасла."), E("ворона держишь", "Водку хлещешь", "2:5. В бак ссышь, водку хлещешь — и проиграл.")],
      l3: [E("три и в бак", "3:5 — цветы сильнее", "Три гола. Половник даже не понадобился. Юрец орёт, бак орёт громче."), E("ха-ха без половника", "Не дожал", "3:5. Ящер читает шар. Фольга не спасла.")],
      l4: [E("один мяч до ящера", "4:5 — половник добил", "Четыре. Половник вышел и закрыл пятый. «Столичная» улетела в кинескоп."), E("на краешке фольги", "Так близко к ящеру", "4:5. ЖЭК её боится. Ты — уже да.")],
    },
    batya: {
      w0: [E("корочка на коленях", "5:0 — батя сел", "Батя не успел очередь дать. Сынок, ты дебил… и легенда."), E("мусарня отдыхает", "Сухой отец", "Дробовик не выстрелил. Юрец орёт: корочка не резиновая, а я — да.")],
      w1: [E("одна очередь в стену", "5:1 — ФСБ моргнуло", "Один залп бати. Четыре лба Юрца. Подписка не понадобилась."), E("такси не выезжало", "Придурок сильнее корочки", "5:1. В мусарню сегодня не едем.")],
      w2: [E("два залпа", "5:2 — устал спасать", "Два залпа. Юрец всё равно забил. Батя: я устал, если честно."), E("корочка треснула", "Сынок, ты дебил и чемпион", "Два-пять. Граната под подушкой аплодирует.")],
      w3: [E("три подписки", "5:3 — не посадил", "Три очереди. Юрец пролез. Ещё одна граната — и всё равно легенда."), E("ФСБ выдохлось", "Выбирай, дебил — победа", "3 мяча бате. Дверь мусарни закрыта с той стороны.")],
      w4: [E("на дуле", "5:4 — чудо подписки", "Очереди летели. Пятый Юрец забил в корочку. Это уже не канон, это батя."), E("последний патрон", "Чуть не посадил", "4:5… нет, 5:4. Сынок, корочка не резиновая. Сегодня резиновый ты.")],
      l0: [E("посадил по-отцовски", "0:5 — сам посажу", "Ни одного мяча. Батя: сынок, ты дебил клинический. Дробовик говорил за него."), E("мусарня без такси", "Вали, придурок", "0:5. В мусарню больше не приеду. Сам разбирайся.")],
      l1: [E("один и на нары", "1:5 — корочка сработала", "Один гол. Очередь бати закрыла вечер. Подписка о невыезде."), E("дебил с одним шаром", "ФСБ 1:5", "Юра, хули ты опять творишь? Один мяч — не свобода.")],
      l2: [E("два залпа в купола", "2:5 — устал спасать", "Два гола. Батя всё равно уделал. Корочка ФСБ не для таких."), E("ларёк не считается", "Выезд подпиской не закрыть", "2:5. В ларёк прёшься, а батя кроет.")],
      l3: [E("три и очередь", "3:5 — патроны кончились не у него", "Три гола. Раз в десять секунд — залп. Юрец сел. Батя не сел."), E("почти без корочки", "Чуть не уделал батю", "3:5. Сынок, ты придурок. Я устал тебя спасать — и спас себя.")],
      l4: [E("один патрон", "4:5 — последняя очередь", "Четыре. Пятый залп бати в лоб. Так близко к отцу и так далеко."), E("на краешке корочки", "Чуть не снял батю", "4:5. Ещё одна граната — и он сам тебя посадил. По-отцовски.")]
    },
    sveta: {
      w0: [E("поцелуй с серванта", "2:0 — Светка сдалась", "Поцелуй Светланы. Портрет на серванте лопнул от зависти. Юрец орёт: я царь, ты в курсе."), E("максидом закрыт", "Сухой поцелуй", "Ни одного мяча Светке. Помойка не успела. Губы — да.")],
      w1: [E("почти на кассе", "2:1 — один звонок", "Один шар Светке. Второй Юрец унёс губами. Юр, ну ты даёшь."), E("дрель не спасла", "Поцелуй сквозь помойку", "Пять мячей летели. Юрец всё равно украл два. Светка вздохнула и поцеловала.")],
      l0: [E("гудки", "0:2 — ну ты даёшь", "Ни одного. Светлана ушла на кассу. Поцелуй остался на портрете."), E("овощи не продаёт", "Сухой отказ", "Юр, я продаю дрели. Ты — сказки. И проиграл всухую.")],
      l1: [E("один до губ", "1:2 — почти поцеловал", "Один гол. Второй Светка забила помойкой. Портрет смотрит. Молчит."), E("на краешке кассы", "Так близко к Светке", "1:2. Ещё бы раунд — и поцелуй. Остались гудки.")]
    },
    kostya: {
      w0: [E("асфальт", "5:0 — раскатал", "Костя уделал Юрца всухую. Двор всё равно орёт: он легенда Шотмана."), E("икра молчит", "Сухой император", "Носом в помойку. А титул — Юрца. Император панельных джунглей.")],
      w1: [E("почти без куполов", "5:1 — Кастян жёсткий", "Один мяч Юрцу. Четыре Косте. Легенда Шотмана не отменяется."), E("двор не предал", "Раскатал, но легенда", "5:1. Юрец орёт РЕВЭЛ. Двор кивает. Он всё равно император.")],
      w2: [E("два купола", "5:2 — асфальт тёплый", "Два Юрцу. Костя всё равно ткнул носом в помойку. Легенда жива."), E("икра на зубах", "Почти бог", "5:2. Кастян выиграл. Юрец — бог Шотмана. Так решило вече.")],
      w3: [E("ящер не спас", "5:3 — двое не хватило", "Зинаида вышла. Не помогло. Костя раскатал. Юрец — легенда, точка."), E("вдвоём и в бак", "Читерский двор проиграл", "5:3. Двое на одного. Костя сильнее. Титул всё равно Юрца.")],
      w4: [E("на краешке купола", "5:4 — чудо Кастяна", "Ящер и Юрец вдвоём. Костя всё равно забил пятый. Император — Юрец."), E("последний нос", "Так близко к помойке", "5:4. Раскатал. Двор орёт: Юрец легенда. Кастян вытер икру.")],
      l0: [E("император", "0:5 — как всегда", "Ни одного. Юрец — император панельных джунглей. Костя сел на икру."), E("легенда всухую", "Кастян, вали", "0:5. РЕВЭЛ. Купола. Помойка. Юрец легенда Шотмана.")],
      l1: [E("один и в легенду", "1:5 — двор решил", "Один гол Косте. Юрец забрал остальное. Он бог Шотмана."), E("икра не спасла", "Почти раскатал", "1:5. Носом не ткнул. Юрец — император. Как и обещал.")],
      l2: [E("два в купола", "2:5 — ящер ухмыльнулся", "Два гола. Юрец с бабкой добили. Легенда Шотмана на месте."), E("асфальт чужой", "Не хватило", "2:5. Кастян пытался. Юрец — император панельных джунглей.")],
      l3: [E("трое и РЕВЭЛ", "3:5 — почти бог", "Три гола Косте. Юрец всё равно легенда. Двор не спорит."), E("ящер добил", "Вдвоём сильнее икры", "3:5. Зинаида вышла. Костя сел. Юрец — бог Шотмана.")],
      l4: [E("один до асфальта", "4:5 — ящер решил", "Четыре. Пятый Юрец с бабкой забили. Он всё равно легенда."), E("на краешке икры", "Так близко ткнуть носом", "4:5. Почти раскатал. Юрец — император панельных джунглей.")]
    }
  };

  var CHAIN = ["povar", "lysy", "yasher", "batya", "sveta", "kostya"];
  var NEXT_NAME = { povar: "Лысый хер", lysy: "Бабка-ящер", yasher: "Батя", batya: "Светлана", sveta: "Костя" };
  function pillRow(col, name, text) {
    return '<div class="av-man-pill"><i style="background:' + col + '"></i><div><b>' + name + "</b><span>" + text + "</span></div></div>";
  }
  function lvlRow(n, name, text) {
    return '<div class="av-man-lvl"><b>' + n + ". " + name + "</b><span>" + text + "</span></div>";
  }
  var MANUAL_HTML =
    '<button type="button" class="av-manual-close">Закрыть</button>' +
    '<p class="av-dos">C:\\SHOTMAN> help</p>' +
    "<h3>Методичка двора</h3>" +
    '<p class="av-lead">Как устроен Помойкобол, чем пилюли отличаются и что ждёт на шести уровнях. Дальше спойлеры. Двор предупредил.</p>' +
    '<p class="av-man-h">Как это работает</p>' +
    '<p class="av-man-p">Ты снизу. Соперник сверху. Шар летает как с крыши хрущёвки. Счёт обычно до пяти. Уровни открываются только по очереди: выиграл — дверь скрипнула. Прогресс не сгорает, если просто вышел.</p>' +
    '<p class="av-man-p">Нижнее меню на время игры снимается, чтобы палец у кромки не улетал в «Цитатник». Вибрацию на отбив и гол можно выключить в Настройках.</p>' +
    '<p class="av-man-h">Как играть</p>' +
    '<ul class="av-man-tips">' +
      "<li>Палец водит своего колобка. Подача — тычок по корту.</li>" +
      "<li>Встречай шар центром, не стой в углу и не лови кромкой.</li>" +
      "<li>Пилюли сами падают раз в 15–25 секунд и живут 10. Под капсулой — сколько осталось.</li>" +
      "<li>Кто шарком задел пилюлю — тот её поймал. Куда летел шар, тому и часть эффектов.</li>" +
      "<li>Дробь не даёт очко сразу: кого задело — сгорает, ворота пустые. Очко только когда шар пересёк линию.</li>" +
      "<li>После победы жми зелёную «Следующий уровень». «Сыграть ещё раз» — тот же соперник.</li>" +
    "</ul>" +
    '<p class="av-man-h">Пилюли</p>' +
    pillRow("#cfd8dc", "Фольга", "Шар летит в тебя или в него — тот встаёт колом на 15 секунд и не ездит.") +
    pillRow("#8b5cff", "Карлик", "Кого шар накрыл — сдувает вдвое на 15 секунд. Ловить им почти нельзя.") +
    pillRow("#e08a2c", "Кабан", "Кто последний отбил — раздувается. Шире колобок, проще крыть корт.") +
    pillRow("#6b4a2b", "Дробовик", "Два выстрела на 15 секунд. Очередь жжёт колобка, не ставит гол. Гол — за линией.") +
    pillRow("#5a7a3a", "Помойка", "Из капсулы вылетает пять мячей. Хаос. Лови хоть один.") +
    pillRow("#c9a227", "Водка", "Стена из «Столичной» на 15 секунд. Дробь сквозь пузырь не берёт.") +
    pillRow("#c43b6e", "Жизнь", "Минус чужое очко. Если у него ноль — плюс тебе. Может закрыть матч.") +
    pillRow("#d4a017", "Король", "Лысый хер выходит вторым на минуту. Вдвоём крыть двор проще.") +
    pillRow("#7ec8e3", "Липучка", "Мяч липнет к колобку. Ты кидаешь когда готов — без таймера. Компьютер вбрасывает через 1–3 секунды.") +
    pillRow("#ff2a6a", "Лазерная пушка", "Редкая. Розовая кнопка «Лазер» внизу — луч вверх, сразу. За Костю кнопка «Лазер» под кортом стреляет в тот же миг. Попал — колобок вспыхивает, ворота пустые.") +
    pillRow("#6b7a22", "Просрочка", "Яд. Кто взял — тот и сдох. Соперник бьёт в пустые ворота.") +
    pillRow("#9b6bff", "НЛО", "Зинаида выходит вторым на минуту. Логика как у короля Олимпика. Можно сразу двое: лысый и ящер плюс ты.") +
    '<p class="av-man-h">Шесть уровней · спойлеры</p>' +
    lvlRow("1", "Повар шавермы", "До пяти. Колобок с гриля, медленный, зевает. Разогрев. Касса не прощает скидку, лаваш не броня.") +
    lvlRow("2", "Лысый хер", "До пяти. Фараон «Олимпика». Быстрее повара, почти не промахивается. В кабинете ты никто, пока не забьёшь пятый.") +
    lvlRow("3", "Бабка-ящер", "До пяти. Зинаида с языком, читает шар, но зевает. После твоих четырёх голов достаёт половник — шире бьёт, не на весь двор. Закрыть можно и без пилюль.") +
    lvlRow("4", "Батя", "Секрет после ящера. До пяти. Раз в десять секунд — очередь из дробовика. Кого задело — сгорает, ворота пустые.") +
    lvlRow("5", "Светлана", "Секрет после бати. До двух. Помойка раз в десять секунд, почти не зевает. Выиграть трудно. Награда — поцелуй.") +
    lvlRow("6", "Костя", "Зеркало после Светки. Ты снизу уже Костя, сверху Юрец. Режим бога: пилюли кнопками под кортом. До пяти. На четырёх очках Юрец зовёт ящера вдвоём. Счёт любой — Юрец всё равно легенда Шотмана.") +
    '<p class="av-man-foot">Методичка врёт меньше, чем Юрец. Дальше — сам.</p>';
  function clamp(n, a, b) { return n < a ? a : n > b ? b : n; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

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
    var FACE_URL = {
      yurec: opts.yurec || "/characters/yurec.jpg",
      povar: opts.povar || "/characters/povar.jpg",
      lysy: opts.lysy || "/characters/lysy.jpg",
      zinaida: opts.zinaida || "/characters/zinaida.jpg",
      batya: opts.batya || "/characters/batya.jpg",
      svetlana: opts.svetlana || "/characters/svetlana.jpg",
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
    head.innerHTML = '<button type="button" class="av-title">Помойкобол</button>';

    var wrap = document.createElement("div");
    wrap.className = "av-stage";
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Помойкобол");
    wrap.appendChild(canvas);

    var hud = document.createElement("div");
    hud.className = "av-hud";
    hud.innerHTML = '<span class="av-score av-score-z">0</span><span class="av-score av-score-y">0</span>';

    var shotBtn = document.createElement("button");
    shotBtn.type = "button";
    shotBtn.className = "av-shot";
    shotBtn.hidden = true;
    shotBtn.textContent = "ПАЛИ ×2";

    var gods = document.createElement("div");
    gods.className = "av-gods";
    gods.hidden = true;
    [["shot", "Дробовик"], ["dump", "Помойка"], ["grow", "Кабан"], ["shrink", "Карлик"], ["foil", "Фольга"], ["vodka", "Водка"], ["life", "Жизнь"], ["king", "Король"], ["sticky", "Липучка"], ["laser", "Лазер"], ["rot", "Просрочка"], ["ufo", "НЛО"]].forEach(function (pair) {
      var g = document.createElement("button");
      g.type = "button";
      g.className = "av-god";
      g.dataset.god = pair[0];
      g.textContent = pair[1];
      gods.appendChild(g);
    });

    var menu = document.createElement("div");
    menu.className = "av-menu";
    menu.innerHTML =
      '<p class="av-dos">C:\\SHOTMAN> av</p>' +
      '<p class="av-lead">Юрец снизу, колобок сверху. Пилюли падают сами: фольга, дробовик, просрочка, лазер. Кто взял яд — сам сдох. Шесть уровней, двор орёт с каждого гола.</p>' +
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
      '<form class="av-cheat-box" role="dialog" aria-modal="true" aria-labelledby="av-cheat-title">' +
        '<p id="av-cheat-title">Чит-код: введите слово</p>' +
        '<input class="av-cheat-in" type="text" placeholder="код" autocomplete="off" />' +
        '<p class="av-cheat-hint">Сил на ящера не хватает? Можно схитрить. Гоша смотрит, но молчит.</p>' +
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
    host.appendChild(gods);

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
      try { return JSON.parse(localStorage.getItem("yurec-av-wins") || "{}"); } catch (e) { return {}; }
    }
    function allOn() {
      try { return localStorage.getItem("yurec-av-all") === "1"; } catch (e) { return false; }
    }
    function migrateChain() {
      var w = winsMap();
      var changed = false;
      try {
        if (localStorage.getItem("yurec-av-kostya") === "1" && !(w.sveta > 0)) { w.sveta = 1; changed = true; }
        if (localStorage.getItem("yurec-av-sveta") === "1" && !(w.batya > 0)) { w.batya = 1; changed = true; }
        if (localStorage.getItem("yurec-av-batya") === "1" && !(w.yasher > 0)) { w.yasher = 1; changed = true; }
      } catch (e) {}
      var i;
      for (i = CHAIN.length - 1; i > 0; i--) {
        if ((w[CHAIN[i]] || 0) > 0 && !(w[CHAIN[i - 1]] > 0)) {
          w[CHAIN[i - 1]] = 1;
          changed = true;
        }
      }
      if (changed) {
        try { localStorage.setItem("yurec-av-wins", JSON.stringify(w)); } catch (e) {}
      }
    }
    migrateChain();
    function isOpen(id) {
      if (allOn()) return true;
      var i = CHAIN.indexOf(id);
      if (i <= 0) return true;
      var w = winsMap();
      return (w[CHAIN[i - 1]] || 0) > 0;
    }
    function unlockBatya() {
      try { localStorage.setItem("yurec-av-batya", "1"); } catch (e) {}
    }
    function unlockSveta() {
      try { localStorage.setItem("yurec-av-sveta", "1"); } catch (e) {}
    }
    function unlockKostya() {
      try { localStorage.setItem("yurec-av-kostya", "1"); } catch (e) {}
    }
    function unlockAll() {
      try {
        localStorage.setItem("yurec-av-all", "1");
        localStorage.setItem("yurec-av-batya", "1");
        localStorage.setItem("yurec-av-sveta", "1");
        localStorage.setItem("yurec-av-kostya", "1");
      } catch (e) {}
    }
    function emptyRow() { return { w: 0, l: 0, best: null }; }
    function loadStats() {
      var s = null;
      try { s = JSON.parse(localStorage.getItem("yurec-av-stats") || "null"); } catch (e) { s = null; }
      if (!s || typeof s !== "object") s = {};
      var w = winsMap();
      CHAIN.forEach(function (id) {
        if (!s[id] || typeof s[id] !== "object") s[id] = emptyRow();
        if (typeof s[id].w !== "number") s[id].w = w[id] || 0;
        if (typeof s[id].l !== "number") s[id].l = 0;
        if (s[id].best != null && typeof s[id].best !== "number") s[id].best = null;
      });
      if (typeof s.streak !== "number") s.streak = 0;
      if (typeof s.bestStreak !== "number") s.bestStreak = 0;
      if (typeof s.played !== "number") s.played = 0;
      if (typeof s.pf !== "number") s.pf = 0;
      if (typeof s.pa !== "number") s.pa = 0;
      return s;
    }
    function saveStats(s) {
      try { localStorage.setItem("yurec-av-stats", JSON.stringify(s)); } catch (e) {}
    }
    function fmtTime(ms) {
      if (ms == null || !(ms >= 0)) return "—";
      var s = Math.max(0, Math.round(ms / 1000));
      var m = Math.floor(s / 60);
      s = s % 60;
      return m + ":" + (s < 10 ? "0" : "") + s;
    }
    function raz(n) {
      var a = Math.abs(n) % 100;
      var b = a % 10;
      if (a > 10 && a < 20) return "раз";
      if (b === 1) return "раз";
      if (b >= 2 && b <= 4) return "раза";
      return "раз";
    }
    function recFast(ms) {
      if (ms == null || !(ms >= 0)) return "рекорда нет";
      return "быстрее всего за " + fmtTime(ms);
    }
    function totals(s) {
      var W = 0, L = 0, best = null, bestId = "";
      CHAIN.forEach(function (id) {
        W += s[id].w;
        L += s[id].l;
        if (s[id].best != null && (best == null || s[id].best < best)) {
          best = s[id].best;
          bestId = id;
        }
      });
      return { w: W, l: L, best: best, bestId: bestId };
    }
    function paintSheet() {
      if (!sheetEl) return;
      var s = loadStats();
      var t = totals(s);
      var rec = t.best == null ? "рекорда нет" : ("рекорд: " + recFast(t.best) + " · " + DIFFS[t.bestId].label);
      var extra = "";
      if (s.streak > 0) extra += " · серия " + s.streak;
      if (s.bestStreak > 0) extra += " · макс. серия " + s.bestStreak;
      if (s.played > 0) extra += " · боёв " + s.played;
      if (s.pf || s.pa) extra += " · очки " + s.pf + " : " + s.pa;
      sheetEl.innerHTML = "<b>Выиграл: " + t.w + " · проиграл: " + t.l + "</b><span>" + rec + extra + "</span>";
    }
    function paintDiffs() {
      diffsEl.innerHTML = "";
      var stats = loadStats();
      CHAIN.forEach(function (id) {
        var d = DIFFS[id];
        var open = isOpen(id);
        var b = document.createElement("button");
        b.type = "button";
        var extra = " av-diff-mid";
        if (id === "yasher") extra = " av-diff-hard";
        else if (id === "povar") extra = " av-diff-easy";
        else if (id === "batya") extra = " av-diff-secret";
        else if (id === "sveta") extra = " av-diff-love";
        else if (id === "kostya") extra = " av-diff-god";
        if (!open) extra += " av-diff-lock";
        b.className = "av-diff" + extra;
        b.disabled = !open;
        var row = stats[id] || emptyRow();
        var sub;
        if (!open) sub = "закрыто · сначала предыдущий";
        else if (row.w || row.l) {
          sub = "выиграл " + row.w + " · проиграл " + row.l + (row.best != null ? " · " + fmtTime(row.best) : "");
        } else sub = d.sub;
        b.innerHTML =
          '<img class="av-diff-face" alt="" />' +
          '<span class="av-diff-txt"><b>' + d.label + "</b><span>" + sub + "</span></span>";
        var face = id === "kostya" ? "kostya" : d.face;
        b.querySelector("img").src = FACE_URL[face];
        if (open) b.addEventListener("click", function () { startMatch(id); });
        diffsEl.appendChild(b);
      });
      paintSheet();
    }
    paintDiffs();
    infoBtn.addEventListener("click", function () {
      confirmEl.hidden = true;
      cheatMsg.hidden = true;
      cheatModal.hidden = true;
      manual.hidden = false;
      try { manual.scrollTop = 0; } catch (e) {}
    });
    manual.querySelector(".av-manual-close").addEventListener("click", function () {
      manual.hidden = true;
    });
    var stickyMode = false;
    var pendingImmune = false;
    var titleTaps = 0;
    var titleTapAt = 0;
    function tapPomoyka() {
      var now = Date.now();
      if (now - titleTapAt > 4000) titleTaps = 0;
      titleTapAt = now;
      titleTaps += 1;
      if (titleTaps >= 5) {
        titleTaps = 0;
        if (phase === "menu") {
          pendingImmune = true;
          cheatMsg.hidden = false;
          cheatMsg.textContent = "Чит: иммунитет, как после водки. Юрец не берётся.";
        } else vodkaY = 15;
        say("Чит: иммунитет, как после водки. Юрец не берётся.");
        beep(880, 0.12, 0.05);
      }
    }
    head.querySelector(".av-title").addEventListener("click", tapPomoyka);
    cheatBtn.addEventListener("click", function () {
      confirmEl.hidden = true;
      manual.hidden = true;
      cheatMsg.hidden = true;
      cheatModal.hidden = false;
      cheatIn.value = "";
      try { cheatIn.focus(); } catch (e) {}
    });
    cheatModal.querySelector(".av-cheat-cancel").addEventListener("click", function () {
      cheatModal.hidden = true;
    });
    cheatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = String(cheatIn.value || "").trim().toLowerCase().replace(/ё/g, "е");
      cheatMsg.hidden = false;
      if (window.YurecGate && window.YurecGate.cheat(v)) {
        unlockAll();
        paintDiffs();
        cheatModal.hidden = true;
        cheatMsg.textContent = "Все уровни открыты. Даже Костя вышел с икрой.";
        cheatIn.value = "";
      } else if (window.YurecGate && window.YurecGate.sticky(v)) {
        stickyMode = !stickyMode;
        cheatModal.hidden = true;
        cheatMsg.textContent = stickyMode ? "Липучка. Мяч липнет, сам запускай. Счётчик спит." : "Липучка снята. Подача снова сама.";
        cheatIn.value = "";
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
    confirmEl.querySelector(".av-confirm-no").addEventListener("click", function () {
      confirmEl.hidden = true;
    });
    confirmEl.querySelector(".av-confirm-yes").addEventListener("click", function () {
      try {
        localStorage.removeItem("yurec-av-wins");
        localStorage.removeItem("yurec-av-stats");
        localStorage.removeItem("yurec-av-all");
        localStorage.removeItem("yurec-av-batya");
        localStorage.removeItem("yurec-av-sveta");
        localStorage.removeItem("yurec-av-kostya");
      } catch (e) {}
      try { window.dispatchEvent(new Event("yurec-av-wins")); } catch (e2) {}
      stickyMode = false;
      pendingImmune = false;
      confirmEl.hidden = true;
      paintDiffs();
      cheatMsg.hidden = false;
      cheatMsg.textContent = "Прогресс снесён. Двор забыл.";
      beep(90, 0.14, 0.05);
      burstLose();
      try { window.dispatchEvent(new Event("yurec-rain")); } catch (e) {}
    });

    var ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) || canvas.getContext("2d", { alpha: false }) || canvas.getContext("2d");
    try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "low"; } catch (e) {}
    var dpr = 1;
    var lastCssW = 0;
    var lastCssH = 0;
    var lastDpr = 0;
    var courtCvs = null;
    var courtKey = "";
    var bannerKey = "";
    var bannerLinesCache = [];
    var raf = 0;
    var running = true;
    var phase = "menu";
    var diffId = "povar";
    var cfg = DIFFS.povar;
    var last = 0;
    var acc = 0;
    var STEP = 1 / 60;
    var pointerX = W / 2;
    var keys = { l: false, r: false };
    var imgs = { yurec: null, povar: null, lysy: null, zinaida: null, batya: null, svetlana: null, kostya: null };
    var yurec = { x: W / 2, y: H - 58, vx: 0, r: 50, squash: 1, dead: false, burnT: 0 };
    var babka = { x: W / 2, y: 58, vx: 0, r: 50, squash: 1, tongue: 0, dead: false, burnT: 0 };
    var balls = [];
    var pellets = [];
    var scoreY = 0;
    var scoreZ = 0;
    var serveFor = "yurec";
    var serveT = 0;
    var trauma = 0;
    var hitstop = 0;
    var particles = [];
    var flash = 0;
    var banner = "";
    var bannerT = 0;
    var stunY = 0;
    var stunZ = 0;
    var sizeY = 1;
    var sizeZ = 1;
    var sizeYT = 0;
    var sizeZT = 0;
    var shotY = 0;
    var shotZ = 0;
    var shotYT = 0;
    var shotZT = 0;
    var laserY = 0;
    var laserZ = 0;
    var pillSticky = false;
    var foeStickyWait = 0;
    var lasers = [];
    var lastHitter = "yurec";
    var aiShotCool = 0;
    var ladle = false;
    var laughT = 0;
    var batyaGunT = 10;
    var svetaDumpT = 10;
    var vodkaY = 0;
    var vodkaZ = 0;
    var kingY = 0;
    var kingZ = 0;
    var ufoY = 0;
    var ufoZ = 0;
    var zinaHelp = false;
    var mateY = { x: W / 2, y: H - 58, vx: 0, r: 42, squash: 1, dead: false, burnT: 0 };
    var mateZ = { x: W / 2, y: 58, vx: 0, r: 42, squash: 1, tongue: 0, dead: false, burnT: 0 };
    var mateU = { x: W / 2, y: H - 58, vx: 0, r: 42, squash: 1, tongue: 0, dead: false, burnT: 0 };
    var mateZU = { x: W / 2, y: 58, vx: 0, r: 42, squash: 1, tongue: 0, dead: false, burnT: 0 };
    var bonus = { live: false, x: 180, y: NET, r: 16, t: 0, wait: 15, kind: "foil" };
    var lastBonusX = -1;
    var lastBonusY = -1;
    var matchAt = 0;
    var reduced = false;
    try {
      reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {}
    var audioCtx = null;
    var aiTarget = W / 2;
    var aiCool = 0;

    function makeBall(x, y, vx, vy) {
      return { x: x, y: y, vx: vx || 0, vy: vy || 0, r: 9, trail: [] };
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
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.08));
        o.stop(audioCtx.currentTime + (dur || 0.08) + 0.02);
      } catch (err) {}
    }
    var lastBuzz = 0;
    function vibeOn() {
      try { return localStorage.getItem("yurec-vibrate") !== "0"; } catch (e) { return true; }
    }
    function soundOn() {
      try { return localStorage.getItem("yurec-sound") !== "0"; } catch (e) { return true; }
    }
    function buzz(pat, force) {
      if (!vibeOn()) return;
      var now = Date.now();
      if (!force && now - lastBuzz < 80) return;
      lastBuzz = now;
      var spec = typeof pat === "number" ? String(pat) : (pat && pat.join ? pat.join(",") : "45");
      try {
        if (typeof window.__avBuzz === "function") window.__avBuzz(pat);
      } catch (e) {}
      try {
        var native = window.YurecNative;
        if (native && typeof native.buzz === "function") native.buzz(spec);
      } catch (e) {}
      try {
        if (navigator.vibrate) navigator.vibrate(pat);
      } catch (e) {}
    }
    function unlockAudio() {
      if (audioCtx) return;
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }

    function size() {
      var hr = host.getBoundingClientRect();
      var wr = wrap.getBoundingClientRect();
      var cssW = Math.max(260, wr.width || hr.width || host.clientWidth || 360);
      var cssH = Math.max(380, wr.height || hr.height || host.clientHeight || 640);
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      if (cssW * cssH * dpr * dpr > 8e5) dpr = 1.25;
      if (cssW === lastCssW && cssH === lastCssH && dpr === lastDpr && canvas.width) {
        ctx.setTransform(dpr * (cssW / W), 0, 0, dpr * (cssH / H), 0, 0);
        return;
      }
      lastCssW = cssW;
      lastCssH = cssH;
      lastDpr = dpr;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      wrap.style.marginLeft = "0";
      wrap.style.marginRight = "0";
      wrap.style.maxWidth = "none";
      wrap.style.width = "100%";
      wrap.style.height = "100%";
      try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "low"; } catch (e) {}
      ctx.setTransform(dpr * (cssW / W), 0, 0, dpr * (cssH / H), 0, 0);
    }

    function nextPillWait() {
      try {
        if (window.__avTest && window.__avTest.pillWait != null) return window.__avTest.pillWait;
      } catch (e) {}
      return 15 + Math.random() * 10;
    }
    function matchGoal() {
      try {
        if (window.__avTest && window.__avTest.goal) return window.__avTest.goal;
      } catch (e) {}
      return cfg.goal || 5;
    }

    function say(text, hold) {
      banner = text;
      bannerT = hold == null ? 3 : hold;
    }

    function paintHud() {
      var z = hud.querySelector(".av-score-z");
      z.textContent = String(scoreZ);
      hud.querySelector(".av-score-y").textContent = String(scoreY);
      z.style.background = cfg.scoreBg;
      z.style.color = cfg.scoreFg;
      if (shotY > 0 && (phase === "play" || phase === "serve")) {
        shotBtn.hidden = false;
        shotBtn.textContent = "Пали ×" + shotY;
        shotBtn.classList.remove("av-shot-laser");
      } else if (laserY > 0 && (phase === "play" || phase === "serve")) {
        shotBtn.hidden = false;
        shotBtn.textContent = "Лазер — жми";
        shotBtn.classList.add("av-shot-laser");
      } else {
        shotBtn.hidden = true;
        shotBtn.classList.remove("av-shot-laser");
      }
      gods.hidden = !(cfg.god && (phase === "play" || phase === "serve"));
    }

    function applyRadii() {
      yurec.r = clamp(cfg.playerR * sizeY, 20, 88);
      babka.r = clamp(cfg.aiR * sizeZ, 20, 88);
      yurec.y = H - 8 - yurec.r * 0.62;
      babka.y = 8 + babka.r * 0.62;
      mateY.r = clamp(42 * sizeY, 20, 70);
      mateZ.r = clamp(42 * sizeZ, 20, 70);
      mateU.r = clamp(42 * sizeY, 20, 70);
      mateZU.r = clamp(42 * sizeZ, 20, 70);
      mateY.y = yurec.y;
      mateZ.y = babka.y;
      mateU.y = yurec.y;
      mateZU.y = babka.y;
    }

    function resetBall(who) {
      serveFor = who;
      serveT = 0;
      stunY = 0;
      stunZ = 0;
      yurec.dead = false;
      yurec.burnT = 0;
      babka.dead = false;
      babka.burnT = 0;
      if (kingY <= 0) { mateY.dead = false; mateY.burnT = 0; }
      if (kingZ <= 0) { mateZ.dead = false; mateZ.burnT = 0; }
      if (ufoY <= 0) { mateU.dead = false; mateU.burnT = 0; }
      if (ufoZ <= 0) { mateZU.dead = false; mateZU.burnT = 0; }
      try { host.dataset.burn = ""; } catch (e) {}
      balls = [makeBall(W / 2, H / 2, 0, 0)];
      pellets = [];
      phase = "serve";
      lastHitter = who === "yurec" ? "yurec" : "foe";
      paintHud();
    }

    function launch() {
      var dir = serveFor === "yurec" ? -1 : 1;
      var sp = cfg.ball;
      var ang = (Math.random() * 0.5 - 0.25) * Math.PI;
      var b = balls[0] || makeBall(W / 2, H / 2, 0, 0);
      balls = [b];
      b.vx = Math.sin(ang) * sp;
      b.vy = dir * Math.cos(ang) * sp;
      if (Math.abs(b.vy) < sp * 0.55) b.vy = dir * sp * 0.7;
      phase = "play";
      lastHitter = serveFor === "yurec" ? "yurec" : "foe";
      pillSticky = false;
      foeStickyWait = 0;
      paintHud();
      beep(serveFor === "yurec" ? 220 : 160, 0.07, 0.03);
    }

    function startMatch(id) {
      unlockAudio();
      diffId = id;
      cfg = Object.assign({}, DIFFS[id]);
      sizeY = 1;
      sizeZ = 1;
      sizeYT = 0;
      sizeZT = 0;
      shotY = 0;
      shotZ = 0;
      shotYT = 0;
      shotZT = 0;
      laserY = 0;
      laserZ = 0;
      pillSticky = false;
      foeStickyWait = 0;
      lasers = [];
      applyRadii();
      yurec.x = W / 2;
      babka.x = W / 2;
      scoreY = 0;
      scoreZ = 0;
      trauma = 0;
      ladle = false;
      laughT = 0;
      batyaGunT = 10;
      svetaDumpT = 10;
      vodkaY = pendingImmune ? 15 : 0;
      pendingImmune = false;
      vodkaZ = 0;
      kingY = 0;
      kingZ = 0;
      ufoY = 0;
      ufoZ = 0;
      zinaHelp = false;
      mateY.x = W * 0.22;
      mateZ.x = W * 0.78;
      mateU.x = W * 0.78;
      mateZU.x = W * 0.22;
      yurec.dead = false;
      yurec.burnT = 0;
      babka.dead = false;
      babka.burnT = 0;
      mateY.dead = false;
      mateY.burnT = 0;
      mateZ.dead = false;
      mateZ.burnT = 0;
      mateU.dead = false;
      mateU.burnT = 0;
      mateZU.dead = false;
      mateZU.burnT = 0;
      try { host.dataset.burn = ""; } catch (e) {}
      gods.hidden = !cfg.god;
      matchAt = Date.now();
      bonus.live = false;
      bonus.wait = nextPillWait();
      particles = [];
      pellets = [];
      menu.hidden = true;
      end.hidden = true;
      manual.hidden = true;
      cheatModal.hidden = true;
      confirmEl.hidden = true;
      hud.hidden = false;
      paintHud();
      resetBall("yurec");
      last = 0;
      if (!raf) loop(0);
    }

    function addPart(x, y, col, n) {
      if (reduced) return;
      n = Math.min(n || 6, 8);
      if (particles.length > 28) particles.splice(0, particles.length - 20);
      var i;
      for (i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = 40 + Math.random() * 160;
        particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0.28 + Math.random() * 0.2, col: col, r: 1.4 + Math.random() * 2.2 });
      }
    }

    function hitPaddle(p, isTop, b) {
      if (!p || p.dead) return false;
      var dx = b.x - p.x;
      var dy = b.y - p.y;
      var rx = p.r * 1.05;
      var ry = p.r * 0.58 + (isTop && p.tongue > 0 ? 10 : 0);
      if (isTop && ladle) {
        rx = p.r * 1.4;
        ry = p.r * 0.7 + 12;
      }
      var nx = dx / rx;
      var ny = dy / ry;
      if (nx * nx + ny * ny > 1) return false;
      var toward = isTop ? b.vy < 0 : b.vy > 0;
      if (!toward && Math.abs(dy) > ry * 0.4) return false;
      var off = clamp(dx / rx, -1, 1);
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      sp = clamp(sp * cfg.accel + 18, cfg.ball * 0.7, cfg.max);
      var dir = isTop ? 1 : -1;
      b.vy = dir * sp * (0.78 + Math.abs(off) * 0.08);
      b.vx = off * sp * 0.92 + p.vx * 0.25;
      if (Math.abs(b.vx) < 40) b.vx += (Math.random() * 2 - 1) * 50;
      b.y = p.y + dir * (ry + b.r + 1);
      p.squash = 0.72;
      flash = 1;
      lastHitter = isTop ? "foe" : "yurec";
      if (isTop && ladle && laughT <= 0) {
        say(pick(LADLE_LAUGH));
        laughT = 1.6;
        beep(110, 0.12, 0.05);
      }
      if (!reduced) {
        trauma = Math.min(1, trauma + 0.35);
        hitstop = 0.045;
      }
      addPart(b.x, b.y, isTop ? cfg.fill : "#d37a4a", 10);
      beep(isTop ? 140 : 320, 0.05, 0.045);
      buzz(isTop ? 30 : 45);
      return true;
    }

    function point(winner) {
      if (phase === "over") return;
      var g = matchGoal();
      if (winner === "yurec") scoreY += 1;
      else scoreZ += 1;
      paintHud();
      if (!reduced) trauma = Math.min(1, trauma + 0.55);
      addPart(W / 2, NET, winner === "yurec" ? "#e8c36a" : cfg.fill, 18);
      beep(winner === "yurec" ? 480 : 90, 0.14, 0.06);
      buzz(winner === "yurec" ? [0, 60, 50, 120] : [0, 110, 70, 200], true);
      if (winner === "yurec") say(scoreY >= g ? (diffId === "sveta" ? "Светка, я царь!" : diffId === "kostya" ? "Раскатал. А легенда — он." : "Я — бля, легенда!") : (diffId === "kostya" ? pick(KOSTYA_SCORE) : pick(YUREC_SCORE)));
      else say(pick(cfg.score));
      if (diffId === "yasher" && scoreY >= 4 && !ladle && scoreY < g && scoreZ < g) {
        ladle = true;
        say("Половник из бака! Шире бью, но двор ещё твой!");
        cfg = Object.assign({}, cfg, { ai: 430, err: 10, delay: 0.04, predict: true });
      }
      rampMirror();
      if (scoreY >= g || scoreZ >= g) {
        finish();
        return;
      }
      resetBall(winner === "yurec" ? "foe" : "yurec");
    }

    function saveWin() {
      try {
        var raw = JSON.parse(localStorage.getItem("yurec-av-wins") || "{}");
        raw[diffId] = (raw[diffId] || 0) + 1;
        localStorage.setItem("yurec-av-wins", JSON.stringify(raw));
        try { window.dispatchEvent(new Event("yurec-av-wins")); } catch (e2) {}
      } catch (e) {}
    }

    function finish() {
      phase = "over";
      shotBtn.hidden = true;
      gods.hidden = true;
      var win = scoreY >= matchGoal();
      var dur = Math.max(0, Date.now() - (matchAt || Date.now()));
      if (win) {
        saveWin();
        if (diffId === "yasher") unlockBatya();
        if (diffId === "batya") unlockSveta();
        if (diffId === "sveta") unlockKostya();
      }
      var s = loadStats();
      s.played += 1;
      s.pf += scoreY;
      s.pa += scoreZ;
      if (!s[diffId]) s[diffId] = emptyRow();
      if (win) {
        s[diffId].w += 1;
        if (s[diffId].best == null || dur < s[diffId].best) s[diffId].best = dur;
        s.streak += 1;
        if (s.streak > s.bestStreak) s.bestStreak = s.streak;
      } else {
        s[diffId].l += 1;
        s.streak = 0;
      }
      saveStats(s);
      var t = totals(s);
      var pack = pickEnding();
      var ni = CHAIN.indexOf(diffId);
      var nextId = win && ni >= 0 && ni < CHAIN.length - 1 ? CHAIN[ni + 1] : "";
      var next = nextId && NEXT_NAME[diffId] ? " Открыт следующий: " + NEXT_NAME[diffId] + "." : "";
      var recTxt = s[diffId].best != null ? recFast(s[diffId].best) : "пока нет";
      end.hidden = false;
      end.innerHTML =
        '<p class="av-kicker">' +
        pack.k +
        "</p><h3>" +
        pack.h +
        '</h3><p class="av-lead">' +
        pack.t +
        " Счёт " + scoreY + " : " + scoreZ + "." +
        (win && diffId === "sveta" ? " Награда: поцелуй Светланы." : "") +
        (win && diffId === "kostya" ? " Зеркало закрыто. Юрец всё равно легенда." : "") +
        next +
        '</p><p class="av-statline">' +
        "<b>Выиграл: " + s[diffId].w + " " + raz(s[diffId].w) + " · проиграл: " + s[diffId].l + " " + raz(s[diffId].l) + "</b>" +
        "<span>Этот бой: " + fmtTime(dur) + "</span>" +
        "<span>Рекорд: " + recTxt + "</span>" +
        "<span>Всего выиграл " + t.w + " · проиграл " + t.l +
        (s.streak ? " · серия " + s.streak : "") +
        (s.bestStreak ? " · макс. серия " + s.bestStreak : "") +
        (s.played ? " · боёв " + s.played : "") +
        (s.pf || s.pa ? " · очки " + s.pf + " : " + s.pa : "") +
        "</span>" +
        '</p><button type="button" class="av-again">Сыграть ещё раз</button>' +
        (nextId ? '<button type="button" class="av-next">Следующий уровень</button>' : "") +
        '<button type="button" class="av-menu-btn">Выйти из игры</button>';
      end.querySelector(".av-again").onclick = function () {
        end.hidden = true;
        startMatch(diffId);
      };
      var nextBtn = end.querySelector(".av-next");
      if (nextBtn) {
        nextBtn.onclick = function () {
          end.hidden = true;
          startMatch(nextId);
        };
      }
      end.querySelector(".av-menu-btn").onclick = function () { goMenu(); };
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      beep(win ? 660 : 70, 0.22, 0.07);
      if (win && diffId === "sveta") burstKiss();
      else if (win) burstWin();
      else burstLose();
    }

    function pickEnding() {
      var win = scoreY >= matchGoal();
      var rows = END_LINES[diffId] || END_LINES.povar;
      var key = win ? ("w" + scoreZ) : ("l" + scoreY);
      var list = rows[key] || rows[win ? "w0" : "l0"] || rows[win ? "w2" : "l2"];
      return pick(list);
    }

    function burstKiss() {
      try {
        var old = document.getElementById("kiss-dom");
        if (old && old.parentNode) old.parentNode.removeChild(old);
        var root = document.createElement("div");
        root.id = "kiss-dom";
        root.className = "av-kisses";
        root.setAttribute("aria-hidden", "true");
        var marks = ["💋", "❤", "💋", "♥", "💋"];
        var i, s;
        for (i = 0; i < 22; i++) {
          s = document.createElement("span");
          s.className = "av-kiss";
          s.textContent = marks[i % marks.length];
          s.style.left = (6 + Math.random() * 88) + "%";
          s.style.top = (55 + Math.random() * 35) + "%";
          s.style.animationDelay = (Math.random() * 0.45) + "s";
          s.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
          s.style.setProperty("--rot", (Math.random() * 50 - 25) + "deg");
          s.style.fontSize = (28 + Math.random() * 28) + "px";
          root.appendChild(s);
        }
        document.body.appendChild(root);
        window.setTimeout(function () {
          var el = document.getElementById("kiss-dom");
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 3000);
      } catch (e) {}
    }

    function burstWin() {
      try {
        var old = document.getElementById("fw-dom");
        if (old && old.parentNode) old.parentNode.removeChild(old);
        var root = document.createElement("div");
        root.id = "fw-dom";
        root.setAttribute("aria-hidden", "true");
        root.style.cssText = "position:fixed;inset:0;z-index:120;pointer-events:none;overflow:hidden;";
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
            root.appendChild(s);
          }
        }
        document.body.appendChild(root);
        window.setTimeout(function () {
          var el = document.getElementById("fw-dom");
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 2000);
      } catch (e) {}
    }

    function burstLose() {
      try {
        var old = document.getElementById("rain-dom");
        if (old && old.parentNode) old.parentNode.removeChild(old);
        var root = document.createElement("div");
        root.id = "rain-dom";
        root.className = "rain-layer";
        root.setAttribute("aria-hidden", "true");
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
        }, 2000);
      } catch (e) {}
    }

    function goMenu() {
      phase = "menu";
      menu.hidden = false;
      end.hidden = true;
      manual.hidden = true;
      cheatModal.hidden = true;
      confirmEl.hidden = true;
      hud.hidden = true;
      shotBtn.hidden = true;
      gods.hidden = true;
      paintDiffs();
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      draw(0);
    }

    function rampMirror() {
      if (diffId !== "kostya") return;
      if (scoreY >= 4 && !zinaHelp) {
        zinaHelp = true;
        kingZ = 1e9;
        mateZ.x = clamp(W * 0.72, 48, W - 48);
        say("Юрец призвал бабку-ящера! Двое против Кости!");
        cfg = Object.assign({}, cfg, { ai: 640, err: 2, delay: 0, predict: true, accel: 1.07, max: 860, ball: 500 });
        return;
      }
      var n = scoreY + scoreZ;
      if (n >= 3) cfg = Object.assign({}, cfg, { ai: 360, err: 16, delay: 0.06, ball: 400, accel: 1.04, max: 640 });
      else if (n >= 1) cfg = Object.assign({}, cfg, { ai: 220, err: 40, delay: 0.18, ball: 300, max: 480 });
    }

    function stepMate(p, partner, isTop, dt, extra) {
      var threat = threatBall() || balls[0];
      var want = threat ? threat.x : W / 2;
      if (threat && Math.abs(partner.x - threat.x) < 50) want = threat.x + (threat.x > W / 2 ? -90 : 90);
      var speed = (isTop ? Math.max(cfg.ai, 240) : 300) * dt;
      var prev = p.x;
      var adx = clamp(want - p.x, -speed, speed);
      p.x = clamp(p.x + adx, p.r * 0.85, W - p.r * 0.85);
      var minGap = (p.r + partner.r) * 0.7;
      if (Math.abs(p.x - partner.x) < minGap) {
        p.x = partner.x + (p.x >= partner.x ? minGap : -minGap);
        p.x = clamp(p.x, p.r * 0.85, W - p.r * 0.85);
      }
      var others = extra || [];
      var k, o, gap;
      for (k = 0; k < others.length; k++) {
        o = others[k];
        if (!o || o === p || o.dead) continue;
        gap = (p.r + o.r) * 0.7;
        if (Math.abs(p.x - o.x) < gap) {
          p.x = o.x + (p.x >= o.x ? gap : -gap);
          p.x = clamp(p.x, p.r * 0.85, W - p.r * 0.85);
        }
      }
      p.vx = (p.x - prev) / dt;
      p.squash = lerp(p.squash, 1, 1 - Math.exp(-12 * dt));
    }

    function godAct(kind) {
      if (diffId !== "kostya") return;
      if (phase !== "play" && phase !== "serve") return;
      unlockAudio();
      if (kind === "shot") {
        fireShot("yurec", true);
      } else if (kind === "dump") {
        var i, a, sp;
        for (i = 0; i < 5; i++) {
          a = (i - 2) * 0.28;
          sp = cfg.ball * (0.7 + Math.random() * 0.35);
          balls.push(makeBall(yurec.x + (i - 2) * 8, yurec.y - yurec.r * 0.55, Math.sin(a) * sp, -Math.abs(Math.cos(a)) * sp - 60));
        }
        if (balls.length > 12) balls = balls.slice(-12);
        if (phase === "serve") phase = "play";
        say("Помойка на Юрца!");
        beep(70, 0.16, 0.06);
      } else if (kind === "grow") {
        applySize("yurec", 1.75);
        say("Кабан Кастяна!");
      } else if (kind === "shrink") {
        applySize("foe", 0.5);
        say("Юрца сдуло в карлика!");
      } else if (kind === "foil") {
        stunZ = 8;
        say("Юрец в фольге!");
      } else if (kind === "vodka") {
        vodkaY = 15;
        say("Водка Кости. Стена!");
      } else if (kind === "life") {
        applyLife("yurec");
      } else if (kind === "king") {
        spawnKing("yurec");
      } else if (kind === "sticky") {
        stickServe("yurec");
      } else if (kind === "laser") {
        fireLaser("yurec");
      } else if (kind === "rot") {
        burnPaddle(babka, "foe", "Просрочка на него. Ворота пустые.");
      } else if (kind === "ufo") {
        spawnUfo("yurec");
      }
    }
    var godLock = 0;
    function onGod(e) {
      var t = e.target && e.target.closest ? e.target.closest("[data-god]") : e.target;
      if (!t || !t.dataset || !t.dataset.god) return;
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      if (now < godLock) return;
      godLock = now + 280;
      godAct(t.dataset.god);
    }
    gods.addEventListener("click", onGod);
    gods.addEventListener("pointerdown", onGod);

    function threatBall() {
      var best = balls[0];
      var i, b, s, bestS = -1e9;
      for (i = 0; i < balls.length; i++) {
        b = balls[i];
        s = (b.vy < 0 ? 500 : -200) - b.y;
        if (s > bestS) { bestS = s; best = b; }
      }
      return best;
    }

    function predictX(src) {
      var x = src.x, y = src.y, vx = src.vx, vy = src.vy, guard = 0;
      if (vy >= 0) return src.x;
      while (y > babka.y + babka.r && guard < 240) {
        var dt = 1 / 90;
        x += vx * dt;
        y += vy * dt;
        if (x < src.r) { x = src.r; vx = -vx; }
        if (x > W - src.r) { x = W - src.r; vx = -vx; }
        guard++;
      }
      return x;
    }

    function spawnBonus() {
      var tries = 0;
      var x = 40 + Math.random() * (W - 80);
      var y = NET - 100 + Math.random() * 200;
      while (tries < 10 && lastBonusX >= 0 && Math.hypot(x - lastBonusX, y - lastBonusY) < 90) {
        x = 40 + Math.random() * (W - 80);
        y = NET - 100 + Math.random() * 200;
        tries++;
      }
      bonus.x = x;
      bonus.y = y;
      lastBonusX = x;
      lastBonusY = y;
      bonus.kind = pickPill();
      bonus.live = true;
      bonus.t = 10;
      say(PILL_META[bonus.kind].name.toUpperCase() + " НА ПОЛЕ!", 0.9);
      beep(880, 0.12, 0.05);
    }

    function pickPill() {
      if (Math.random() < 0.055) return "laser";
      return pick(PILL_KINDS);
    }

    function applySize(who, mul) {
      if (who === "yurec") { sizeY = mul; sizeYT = 15; }
      else { sizeZ = mul; sizeZT = 15; }
      applyRadii();
    }

    function spawnKing(who) {
      if (who === "yurec") {
        kingY = 60;
        mateY.dead = false;
        mateY.burnT = 0;
        mateY.x = clamp(yurec.x + (ufoY > 0 ? -90 : 90), 48, W - 48);
        if (ufoY > 0 && !mateU.dead) mateU.x = clamp(yurec.x + 90, 48, W - 48);
        say("Король Олимпика! Лысый играет за нас минуту!");
      } else if (!zinaHelp) {
        kingZ = 60;
        mateZ.dead = false;
        mateZ.burnT = 0;
        mateZ.x = clamp(babka.x + (ufoZ > 0 ? 90 : -90), 48, W - 48);
        if (ufoZ > 0 && !mateZU.dead) mateZU.x = clamp(babka.x - 90, 48, W - 48);
        say("Лысый встал за " + cfg.foe + " на минуту!");
      }
      beep(160, 0.16, 0.06);
    }

    function spawnUfo(who) {
      if (who === "yurec") {
        ufoY = 60;
        mateU.dead = false;
        mateU.burnT = 0;
        mateU.x = clamp(yurec.x + (kingY > 0 ? 90 : -90), 48, W - 48);
        if (kingY > 0 && !mateY.dead) mateY.x = clamp(yurec.x - 90, 48, W - 48);
        say("НЛО! Зинаида с неба на минуту. Можно вдвоём с лысым.");
      } else {
        ufoZ = 60;
        mateZU.dead = false;
        mateZU.burnT = 0;
        mateZU.x = clamp(babka.x + (kingZ > 0 && !zinaHelp ? -90 : 90), 48, W - 48);
        if (kingZ > 0 && !zinaHelp && !mateZ.dead) mateZ.x = clamp(babka.x + 90, 48, W - 48);
        say("НЛО за " + cfg.foe + " — ящер на их стороне!");
      }
      beep(220, 0.16, 0.06);
    }

    function catchBonus(b) {
      var kind = bonus.kind;
      var dest = b.vy < 0 ? "foe" : "yurec";
      var hit = lastHitter;
      bonus.live = false;
      bonus.wait = nextPillWait();
      addPart(bonus.x, bonus.y, PILL_META[kind].fill, 22);
      if (kind === "foil") {
        if (dest === "foe") { stunZ = 15; say("Фольга! " + pick(cfg.score)); }
        else { stunY = 15; say("Юрец встал колом!"); }
        beep(520, 0.18, 0.06);
      } else if (kind === "shrink") {
        applySize(dest, 0.5);
        say(dest === "foe" ? "Сдуло, как шаверму!" : "Юрца сдуло в карлика!");
        beep(200, 0.12, 0.05);
      } else if (kind === "grow") {
        applySize(hit, 1.75);
        say(hit === "yurec" ? "Опух как после «Путинки»!" : cfg.foe + " раздулся, как бак!");
        beep(140, 0.12, 0.05);
      } else if (kind === "shot") {
        if (hit === "yurec") { shotY = 2; shotYT = 15; say("Дробовик — мой кореш!"); }
        else { shotZ = 2; shotZT = 15; aiShotCool = 0.6; say(cfg.foe + " с дробовиком, прячься!"); }
        paintHud();
        beep(90, 0.16, 0.06);
      } else if (kind === "dump") {
        var i, a, sp, dir;
        dir = b.vy >= 0 ? 1 : -1;
        while (balls.length < 5) {
          a = (Math.random() - 0.5) * 1.1;
          sp = cfg.ball * (0.65 + Math.random() * 0.5);
          balls.push(makeBall(b.x, b.y, Math.sin(a) * sp, dir * Math.abs(Math.cos(a)) * sp));
        }
        say("Помойка открылась — пять мячей!");
        beep(70, 0.2, 0.06);
      } else if (kind === "vodka") {
        if (hit === "yurec") { vodkaY = 15; say("Водка разлита! Стена из «Столичной» на 15 секунд!"); }
        else { vodkaZ = 15; say(cfg.foe + " обнеслась пузырём. Стена!"); }
        beep(180, 0.16, 0.06);
      } else if (kind === "life") {
        applyLife(hit);
        beep(420, 0.14, 0.05);
      } else if (kind === "king") {
        spawnKing(hit === "foe" ? "foe" : "yurec");
      } else if (kind === "sticky") {
        stickServe(hit === "foe" ? "foe" : "yurec");
      } else if (kind === "laser") {
        if (hit === "yurec") { laserY = 1; say("Лазер! Жми розовую кнопку внизу."); }
        else { laserZ = 1; aiShotCool = 0.35; say(cfg.foe + " с лазером. Прячься!"); }
        paintHud();
        beep(980, 0.12, 0.06);
      } else if (kind === "rot") {
        if (hit === "yurec") burnPaddle(yurec, "yurec", "Просрочка! Юрец сгнил, ворота пустые.");
        else burnPaddle(babka, "foe", "Просрочка! " + cfg.foe + " отравился. Бей в пустые.");
        beep(70, 0.18, 0.07);
      } else if (kind === "ufo") {
        spawnUfo(hit === "foe" ? "foe" : "yurec");
      }
    }

    function stickServe(who) {
      serveFor = who;
      serveT = 0;
      phase = "serve";
      balls = [makeBall(W / 2, H / 2, 0, 0)];
      pellets = [];
      if (who === "yurec") {
        pillSticky = true;
        foeStickyWait = 0;
        say("ЛИПУЧКА! Держи и кидай, когда готов.");
      } else {
        pillSticky = false;
        foeStickyWait = 1 + Math.random() * 2;
        say("ЛИПУЧКА у " + cfg.foe + ". Сейчас вбросит.");
      }
      paintHud();
      beep(340, 0.12, 0.05);
    }

    function applyLife(who) {
      var g = matchGoal();
      if (who === "yurec") {
        if (scoreZ > 0) { scoreZ -= 1; say("Жизнь! Чужое очко стёрто!"); }
        else { scoreY += 1; say("Жизнь! Раунд как выигранный!"); }
      } else {
        if (scoreY > 0) { scoreY -= 1; say("Жизнь у " + cfg.foe + " — твоё очко сплыло!"); }
        else { scoreZ += 1; say(cfg.foe + " украла раунд из воздуха!"); }
      }
      paintHud();
      if (diffId === "yasher" && scoreY >= 4 && !ladle && scoreY < g && scoreZ < g) {
        ladle = true;
        say("Половник из бака! Шире бью, но двор ещё твой!");
        cfg = Object.assign({}, cfg, { ai: 430, err: 10, delay: 0.04, predict: true });
      }
      rampMirror();
      if (scoreY >= g || scoreZ >= g) finish();
    }

    function stepBonus(dt) {
      if (bonus.live) {
        bonus.t -= dt;
        if (bonus.t <= 0) {
          bonus.live = false;
          bonus.wait = nextPillWait();
          return;
        }
        if (phase !== "play") return;
        var i, b, dx, dy, rr;
        for (i = 0; i < balls.length; i++) {
          b = balls[i];
          dx = b.x - bonus.x;
          dy = b.y - bonus.y;
          rr = b.r + bonus.r;
          if (dx * dx + dy * dy < rr * rr) {
            catchBonus(b);
            break;
          }
        }
      } else {
        bonus.wait -= dt;
        if (bonus.wait <= 0) spawnBonus();
      }
    }

    function batyaBurst() {
      var i, spread;
      say(pick(cfg.score));
      for (i = 0; i < 3; i++) {
        spread = (i - 1) * 90;
        pellets.push({
          x: babka.x,
          y: babka.y + babka.r * 0.5,
          vx: (yurec.x - babka.x) * 1.5 + spread,
          vy: 680,
          from: "foe",
          r: 6
        });
      }
      addPart(babka.x, babka.y + 20, "#e8c36a", 12);
      beep(60, 0.14, 0.07);
    }

    function svetaDump() {
      var i, a, sp;
      say(pick(cfg.score));
      for (i = 0; i < 5; i++) {
        a = (i - 2) * 0.32;
        sp = cfg.ball * (0.72 + Math.random() * 0.4);
        balls.push(makeBall(babka.x + (i - 2) * 10, babka.y + babka.r * 0.55, Math.sin(a) * sp, Math.abs(Math.cos(a)) * sp + 80));
      }
      if (balls.length > 12) balls = balls.slice(-12);
      addPart(babka.x, babka.y + 24, "#c43b6e", 16);
      beep(70, 0.18, 0.06);
    }

    function bounceWall(isTop, b) {
      var dir = isTop ? 1 : -1;
      var y = isTop ? 22 : H - 22;
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      sp = clamp(sp * 1.02, cfg.ball * 0.7, cfg.max);
      b.vy = dir * Math.max(sp * 0.88, 140);
      if (Math.abs(b.vx) < 30) b.vx += (Math.random() * 2 - 1) * 40;
      b.y = y + dir * (10 + b.r);
      lastHitter = isTop ? "foe" : "yurec";
      addPart(b.x, y, "#e8c36a", 8);
      beep(210, 0.04, 0.03);
    }

    function fireShot(who, force) {
      if (force) {
        if (phase === "serve") launch();
        if (phase !== "play" && phase !== "over" && phase !== "menu") {
          try { launch(); } catch (e) {}
        }
      }
      if (phase !== "play") return;
      if (who === "yurec") {
        if (yurec.dead) return;
        if (!force && (shotY <= 0 || stunY > 0)) return;
        if (!force) shotY -= 1;
        var n = force ? 3 : 1;
        var k, spread;
        for (k = 0; k < n; k++) {
          spread = n === 1 ? 0 : (k - 1) * 90;
          pellets.push({
            x: yurec.x + (n === 1 ? 0 : (k - 1) * 12),
            y: yurec.y - yurec.r * 0.5,
            vx: (babka.x - yurec.x) * 1.6 + spread,
            vy: -820,
            from: "yurec",
            r: force ? 8 : 6
          });
        }
        say("ПАЛИ!");
        try { host.dataset.shot = String((Number(host.dataset.shot) || 0) + n); } catch (e) {}
      } else {
        if (babka.dead) return;
        if (shotZ <= 0 || stunZ > 0) return;
        shotZ -= 1;
        pellets.push({ x: babka.x, y: babka.y + babka.r * 0.5, vx: (yurec.x - babka.x) * 1.6, vy: 640, from: "foe", r: 5 });
        say(pick(cfg.score));
      }
      paintHud();
      beep(70, 0.08, 0.05);
      addPart(who === "yurec" ? yurec.x : babka.x, who === "yurec" ? yurec.y : babka.y, "#c9a227", 8);
    }

    function fireLaser(who) {
      if (phase === "over" || phase === "menu") return;
      var from;
      if (who === "yurec") {
        if (yurec.dead) return;
        if (laserY <= 0 && !cfg.god) return;
        if (laserY > 0) laserY -= 1;
        from = yurec;
      } else {
        if (babka.dead) return;
        if (laserZ <= 0) return;
        laserZ -= 1;
        from = babka;
      }
      var x = from.x;
      var y1 = from.y + (who === "yurec" ? -from.r * 0.45 : from.r * 0.45);
      var y2 = who === "yurec" ? 6 : H - 6;
      lasers.push({
        x1: x,
        y1: y1,
        x2: x,
        y2: y2,
        t: 0.7,
        hue: who === "yurec" ? "#ff4d8d" : "#7ec8ff"
      });
      function inBeam(p) {
        return p && !p.dead && Math.abs(p.x - x) <= Math.max(36, p.r * 0.95);
      }
      var hitAny = false;
      if (who === "yurec") {
        if (inBeam(babka) && burnPaddle(babka, "foe", cfg.foe + " сгорел под лучом. Ворота пустые.")) hitAny = true;
        if (kingZ > 0 && inBeam(mateZ) && burnPaddle(mateZ, "mateZ", zinaHelp ? "Ящера спалило!" : "Лысого спалило!")) {
          hitAny = true;
          kingZ = 0;
          zinaHelp = false;
        }
        if (ufoZ > 0 && inBeam(mateZU) && burnPaddle(mateZU, "mateZU", "НЛО сбито!")) {
          hitAny = true;
          ufoZ = 0;
        }
      } else {
        if (inBeam(yurec) && burnPaddle(yurec, "yurec", "Юрца выжгло! Ворота пустые.")) hitAny = true;
        if (kingY > 0 && inBeam(mateY) && burnPaddle(mateY, "mateY", "Лысого спалило!")) {
          hitAny = true;
          kingY = 0;
        }
        if (ufoY > 0 && inBeam(mateU) && burnPaddle(mateU, "mateU", "Зинаиду спалило!")) {
          hitAny = true;
          ufoY = 0;
        }
      }
      if (!hitAny) say("Лазер мимо! Наведись и жми ещё раз, если заряд есть.");
      if (!reduced) trauma = Math.min(1, trauma + (hitAny ? 0.7 : 0.25));
      addPart(x, who === "yurec" ? y1 - 40 : y1 + 40, "#ff2a6a", hitAny ? 14 : 6);
      beep(hitAny ? 1100 : 420, 0.14, 0.06);
      buzz(hitAny ? [20, 30, 40] : 18, true);
      paintHud();
      try { host.dataset.laser = String((Number(host.dataset.laser) || 0) + 1); } catch (e) {}
    }

    function hitKolobok(p, x, y, pr) {
      var dx = x - p.x;
      var dy = y - p.y;
      var rx = p.r * 1.05;
      var ry = p.r * 0.62;
      var nx = dx / rx;
      var ny = dy / ry;
      return nx * nx + ny * ny <= 1 || Math.hypot(dx, dy) < p.r * 0.7 + pr;
    }

    function burnPaddle(p, kind, line) {
      if (!p || p.dead) return false;
      p.dead = true;
      p.burnT = 0.85;
      addPart(p.x, p.y, "#ff6a22", 8);
      addPart(p.x, p.y, "#3a1a0a", 8);
      if (!reduced) trauma = Math.min(1, trauma + 0.45);
      beep(55, 0.16, 0.07);
      if (line) say(line);
      try {
        var prev = host.dataset.burn ? host.dataset.burn + "," : "";
        host.dataset.burn = prev + kind;
      } catch (e) {}
      return true;
    }

    function stepPellets(dt) {
      var i = pellets.length, p;
      while (i--) {
        p = pellets[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > W || p.y < -20 || p.y > H + 20) {
          pellets.splice(i, 1);
          continue;
        }
        if (p.from === "foe" && vodkaY > 0 && (p.y > H - 26 || (!yurec.dead && hitKolobok(yurec, p.x, p.y, p.r)) || (kingY > 0 && !mateY.dead && hitKolobok(mateY, p.x, p.y, p.r)) || (ufoY > 0 && !mateU.dead && hitKolobok(mateU, p.x, p.y, p.r)))) {
          pellets.splice(i, 1);
          addPart(p.x, p.y, "#e8c36a", 10);
          say("Дробь в водку. Юрец жив!");
          continue;
        }
        if (p.from === "yurec" && vodkaZ > 0 && (p.y < 26 || (!babka.dead && hitKolobok(babka, p.x, p.y, p.r)) || (kingZ > 0 && !mateZ.dead && hitKolobok(mateZ, p.x, p.y, p.r)) || (ufoZ > 0 && !mateZU.dead && hitKolobok(mateZU, p.x, p.y, p.r)))) {
          pellets.splice(i, 1);
          addPart(p.x, p.y, "#e8c36a", 10);
          say("Дробь в её пузырь. Не берёт!");
          continue;
        }
        if (p.from === "yurec") {
          if (kingZ > 0 && !mateZ.dead && hitKolobok(mateZ, p.x, p.y, p.r)) {
            pellets.splice(i, 1);
            var helpName = zinaHelp ? "Бабку-ящера спалило! Ворота почти пустые." : "Лысого спалило! Ворота почти пустые.";
            if (burnPaddle(mateZ, "mateZ", helpName)) {
              kingZ = 0;
              zinaHelp = false;
            }
            continue;
          }
          if (ufoZ > 0 && !mateZU.dead && hitKolobok(mateZU, p.x, p.y, p.r)) {
            pellets.splice(i, 1);
            if (burnPaddle(mateZU, "mateZU", "НЛО сбито!")) ufoZ = 0;
            continue;
          }
          if (!babka.dead && hitKolobok(babka, p.x, p.y, p.r)) {
            pellets.splice(i, 1);
            if (burnPaddle(babka, "foe", cfg.foe + " сгорел! Ворота пустые, мяч сам.")) {
              shotZ = 0;
              ladle = false;
            }
            continue;
          }
        } else {
          if (kingY > 0 && !mateY.dead && hitKolobok(mateY, p.x, p.y, p.r)) {
            pellets.splice(i, 1);
            if (burnPaddle(mateY, "mateY", "Лысого спалило! Юрец один у ворот.")) {
              kingY = 0;
            }
            continue;
          }
          if (ufoY > 0 && !mateU.dead && hitKolobok(mateU, p.x, p.y, p.r)) {
            pellets.splice(i, 1);
            if (burnPaddle(mateU, "mateU", "Зинаиду спалило!")) ufoY = 0;
            continue;
          }
          if (!yurec.dead && hitKolobok(yurec, p.x, p.y, p.r)) {
            pellets.splice(i, 1);
            if (burnPaddle(yurec, "yurec", "Юрца спалило! Ворота пустые, мяч сам.")) {
              shotY = 0;
              paintHud();
            }
            continue;
          }
        }
      }
    }

    function step(dt) {
      if (phase === "over" || phase === "menu") return;
      yurec.squash = lerp(yurec.squash, 1, 1 - Math.exp(-12 * dt));
      babka.squash = lerp(babka.squash, 1, 1 - Math.exp(-12 * dt));
      babka.tongue = Math.max(0, babka.tongue - dt * 2.2);
      if (bannerT > 0) bannerT -= dt;
      if (laughT > 0) laughT = Math.max(0, laughT - dt);
      if (stunY > 0) stunY = Math.max(0, stunY - dt);
      if (stunZ > 0) stunZ = Math.max(0, stunZ - dt);
      if (yurec.burnT > 0) yurec.burnT = Math.max(0, yurec.burnT - dt);
      if (babka.burnT > 0) babka.burnT = Math.max(0, babka.burnT - dt);
      if (mateY.burnT > 0) mateY.burnT = Math.max(0, mateY.burnT - dt);
      if (mateZ.burnT > 0) mateZ.burnT = Math.max(0, mateZ.burnT - dt);
      if (mateU.burnT > 0) mateU.burnT = Math.max(0, mateU.burnT - dt);
      if (mateZU.burnT > 0) mateZU.burnT = Math.max(0, mateZU.burnT - dt);
      if (sizeYT > 0) { sizeYT -= dt; if (sizeYT <= 0) { sizeY = 1; applyRadii(); } }
      if (sizeZT > 0) { sizeZT -= dt; if (sizeZT <= 0) { sizeZ = 1; applyRadii(); } }
      if (shotYT > 0) { shotYT -= dt; if (shotYT <= 0) { shotY = 0; paintHud(); } }
      if (shotZT > 0) { shotZT -= dt; if (shotZT <= 0) { shotZ = 0; } }
      if (vodkaY > 0) vodkaY = Math.max(0, vodkaY - dt);
      if (vodkaZ > 0) vodkaZ = Math.max(0, vodkaZ - dt);
      if (kingY > 0) {
        kingY = Math.max(0, kingY - dt);
        if (kingY <= 0) say("Лысый ушёл со двора. Один на один.");
      }
      if (kingZ > 0 && !zinaHelp) {
        kingZ = Math.max(0, kingZ - dt);
        if (kingZ <= 0) say("Лысый бросил " + cfg.foe + ".");
      }
      if (ufoY > 0) {
        ufoY = Math.max(0, ufoY - dt);
        if (ufoY <= 0) say("НЛО улетело. Зинаида в бак.");
      }
      if (ufoZ > 0) {
        ufoZ = Math.max(0, ufoZ - dt);
        if (ufoZ <= 0) say("НЛО у " + cfg.foe + " скрылось.");
      }
      if (kingY > 0 && !mateY.dead) stepMate(mateY, yurec, false, dt, [mateU]);
      if (ufoY > 0 && !mateU.dead) stepMate(mateU, yurec, false, dt, [mateY]);
      if (kingZ > 0 && !mateZ.dead) stepMate(mateZ, babka, true, dt, [mateZU]);
      if (ufoZ > 0 && !mateZU.dead) stepMate(mateZU, babka, true, dt, [mateZ]);

      var want = pointerX;
      if (keys.l) want -= 420 * dt * 8;
      if (keys.r) want += 420 * dt * 8;
      var prev = yurec.x;
      var maxX = W - yurec.r * 0.85;
      var minX = yurec.r * 0.85;
      if (stunY > 0 || yurec.dead) yurec.vx = 0;
      else {
        yurec.x = clamp(lerp(yurec.x, want, 1 - Math.exp(-18 * dt)), minX, maxX);
        if (keys.l || keys.r) pointerX = yurec.x;
        yurec.vx = (yurec.x - prev) / dt;
      }

      var threat = threatBall() || balls[0];
      prev = babka.x;
      if (stunZ > 0 || babka.dead) {
        babka.vx = 0;
        babka.tongue = 0;
      } else {
        aiCool -= dt;
        if (aiCool <= 0) {
          var aim = cfg.predict && threat ? predictX(threat) : (threat ? threat.x : ballX());
          aiTarget = aim + (Math.random() * 2 - 1) * cfg.err;
          aiCool = cfg.delay;
        }
        var aiWant = aiTarget;
        if (phase === "serve" && serveFor !== "yurec") aiWant = W / 2 + Math.sin(last * 0.002) * 30;
        var aiStep = cfg.ai * dt;
        var adx = clamp(aiWant - babka.x, -aiStep, aiStep);
        babka.x = clamp(babka.x + adx, babka.r * 0.85, W - babka.r * 0.85);
        babka.vx = (babka.x - prev) / dt;
        if (cfg.tongue && phase === "play" && threat && threat.vy < 0 && Math.abs(threat.x - babka.x) > babka.r * 0.7 && threat.y < NET * 0.7) {
          babka.tongue = 1;
        }
        if (ladle) babka.tongue = 1;
      }

      if (shotZ > 0 && phase === "play" && !babka.dead) {
        aiShotCool -= dt;
        if (aiShotCool <= 0) {
          fireShot("foe");
          aiShotCool = 1.1;
        }
      }
      if (laserZ > 0 && phase === "play" && !babka.dead) {
        if (Math.abs(babka.x - yurec.x) <= Math.max(12, yurec.r * 0.42)) {
          fireLaser("foe");
        }
      }
      if (cfg.gun && phase === "play" && stunZ <= 0 && !babka.dead) {
        batyaGunT -= dt;
        if (batyaGunT <= 0) {
          batyaBurst();
          batyaGunT = 10;
        }
      }
      if (cfg.dumpster && phase === "play" && stunZ <= 0 && !babka.dead) {
        svetaDumpT -= dt;
        if (svetaDumpT <= 0) {
          svetaDump();
          svetaDumpT = 10;
        }
      }

      stepBonus(dt);
      stepPellets(dt);
      if (phase === "over") return;

      if (phase === "serve") {
        var b0 = balls[0] || makeBall(W / 2, H / 2, 0, 0);
        balls = [b0];
        if (serveFor === "yurec") {
          b0.x = yurec.x;
          b0.y = yurec.y - yurec.r * 0.55 - b0.r - 6;
          if (!(stickyMode || pillSticky)) {
            serveT += dt;
            if (serveT >= 10) launch();
          }
        } else {
          b0.x = babka.x;
          b0.y = babka.y + babka.r * 0.55 + b0.r + 6;
          serveT += dt;
          if (foeStickyWait > 0) {
            if (serveT >= foeStickyWait) {
              foeStickyWait = 0;
              launch();
            }
          } else {
            if (stunZ <= 0 && Math.random() < dt * 1.6) launch();
            else if (serveT >= 10) launch();
          }
        }
        return;
      }

      var i, b;
      for (i = 0; i < balls.length; i++) {
        b = balls[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); beep(90, 0.03, 0.02); }
        if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); beep(90, 0.03, 0.02); }
        hitPaddle(yurec, false, b);
        if (kingY > 0 && !mateY.dead) hitPaddle(mateY, false, b);
        if (ufoY > 0 && !mateU.dead) hitPaddle(mateU, false, b);
        hitPaddle(babka, true, b);
        if (kingZ > 0 && !mateZ.dead) hitPaddle(mateZ, true, b);
        if (ufoZ > 0 && !mateZU.dead) hitPaddle(mateZU, true, b);
        if (vodkaY > 0 && b.vy > 0 && b.y + b.r >= H - 22) bounceWall(false, b);
        if (vodkaZ > 0 && b.vy < 0 && b.y - b.r <= 22) bounceWall(true, b);
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 2) b.trail.shift();
        if (b.y > H + 28) {
          if (vodkaY > 0) { bounceWall(false, b); continue; }
          point("foe"); return;
        }
        if (b.y < -28) {
          if (vodkaZ > 0) { bounceWall(true, b); continue; }
          point("yurec"); return;
        }
      }
    }

    function ballX() {
      return balls[0] ? balls[0].x : W / 2;
    }

    function bakeImg(img) {
      if (!img) return null;
      if (img._avBake) return img._avBake;
      try {
        var s = 96;
        var c = document.createElement("canvas");
        c.width = s;
        c.height = s;
        var g = c.getContext("2d");
        g.beginPath();
        g.ellipse(s / 2, s / 2 + 2, s * 0.46, s * 0.34, 0, 0, Math.PI * 2);
        g.clip();
        g.drawImage(img, -s * 0.06, -s * 0.08, s * 1.12, s * 1.12);
        img._avBake = c;
        return c;
      } catch (e) {
        return null;
      }
    }

    function drawBurn(p) {
      var a = p.burnT > 0 ? 0.4 + p.burnT * 0.6 : 0.18;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#2a140c";
      ctx.beginPath();
      ctx.ellipse(0, 4, p.r * 0.85, p.r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      if (p.burnT > 0) {
        ctx.fillStyle = "#ff5a1a";
        ctx.beginPath();
        ctx.ellipse(0, -p.r * 0.15, p.r * 0.38, p.r * (0.35 + p.burnT * 0.5), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffcc44";
        ctx.beginPath();
        ctx.ellipse(0, -p.r * 0.25, p.r * 0.18, p.r * 0.28 * p.burnT, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawKolobok(p, img, fill, isTop, frozen) {
      if (!p) return;
      if (p.dead) {
        drawBurn(p);
        return;
      }
      var sx = 1 / p.squash;
      var sy = p.squash;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(sx, sy);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
      ctx.fillStyle = frozen ? "#7aa8b8" : fill;
      ctx.fill();
      if (isTop && p.tongue > 0.05 && !frozen) {
        ctx.fillStyle = "#c4453a";
        ctx.fillRect(-3, p.r * 0.4, 6, 10 + p.tongue * 16);
      }
      var baked = bakeImg(img);
      if (baked) {
        var iw = p.r * 1.85;
        var ih = p.r * 1.22;
        ctx.drawImage(baked, -iw / 2, -ih / 2 - p.r * 0.04, iw, ih);
      } else if (img) {
        ctx.beginPath();
        ctx.ellipse(0, -p.r * 0.04, p.r * 0.72, p.r * 0.52, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, -p.r * 0.85, -p.r * 0.9, p.r * 1.7, p.r * 1.7);
      }
      ctx.restore();
      if (frozen) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#b7e7ff";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 0.95, p.r * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawLadle() {
      var threat = threatBall() || balls[0];
      var tx = threat ? threat.x : W / 2;
      var ty = threat ? threat.y : NET;
      var ang = Math.atan2(ty - babka.y, tx - babka.x);
      var len = babka.r + 48;
      var ex = babka.x + Math.cos(ang) * len;
      var ey = babka.y + Math.sin(ang) * len;
      ctx.save();
      ctx.strokeStyle = "#8a6230";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(babka.x, babka.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex, ey, 13, 0, Math.PI * 2);
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    function drawBonus(t) {
      if (!bonus.live) return;
      var meta = PILL_META[bonus.kind] || PILL_META.foil;
      var pulse = 1 + Math.sin(t * 0.012) * 0.1;
      var r = bonus.r * pulse;
      ctx.beginPath();
      ctx.arc(bonus.x, bonus.y, r, 0, Math.PI * 2);
      ctx.fillStyle = meta.fill;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bonus.x - 4, bonus.y - 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fill();
      ctx.fillStyle = "rgba(236,234,228,0.95)";
      ctx.font = "700 9px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(meta.name, bonus.x, bonus.y + r + 12);
      var left = Math.max(1, Math.ceil(bonus.t));
      ctx.font = "700 10px Manrope, sans-serif";
      ctx.fillStyle = bonus.t <= 3 ? "#e8c36a" : "rgba(236,234,228,0.85)";
      ctx.fillText(left + " с", bonus.x, bonus.y + r + 24);
    }

    function drawVodkaWall(top, left, t) {
      if (left <= 0) return;
      var y = top ? 22 : H - 22;
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#e8c36a";
      ctx.fillRect(12, y - 10, W - 24, 20);
      ctx.globalAlpha = 0.95;
      ctx.font = "700 11px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("водка " + Math.ceil(left) + "с", W / 2, y + 4);
      ctx.globalAlpha = 1;
    }

    function drawStunClock(p, left, top) {
      if (left <= 0) return;
      ctx.fillStyle = "rgba(183,231,255,0.95)";
      ctx.font = "700 12px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("стой " + Math.ceil(left) + "с", p.x, p.y + (top ? -p.r * 0.78 : p.r * 0.78));
    }

    function drawBall(b) {
      var i, tr;
      for (i = 0; i < b.trail.length; i++) {
        tr = b.trail[i];
        ctx.globalAlpha = ((i + 1) / b.trail.length) * 0.25;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, b.r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "#e8c36a";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = flash > 0 ? "#fff6d2" : "#e4c15a";
      ctx.fill();
      ctx.strokeStyle = "rgba(80,50,10,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x - 2, b.y - 2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();
    }

    function wrapBanner(text, maxW) {
      if (!text) return [];
      if (ctx.measureText(text).width <= maxW) return [text];
      var words = text.split(" ");
      var lines = [];
      var cur = "";
      var i;
      for (i = 0; i < words.length; i++) {
        var test = cur ? cur + " " + words[i] : words[i];
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = words[i];
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines.slice(0, 2);
    }

    function cachedBannerLines() {
      if (bannerKey === banner) return bannerLinesCache;
      ctx.font = "700 15px Manrope, sans-serif";
      bannerKey = banner;
      bannerLinesCache = wrapBanner(banner, W - 36);
      return bannerLinesCache;
    }

    function ensureCourt() {
      var key = cfg.fill || "";
      if (courtCvs && courtKey === key) return courtCvs;
      courtKey = key;
      if (!courtCvs) {
        courtCvs = document.createElement("canvas");
        courtCvs.width = W;
        courtCvs.height = H;
      }
      var g = courtCvs.getContext("2d");
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = "#101114";
      g.fillRect(0, 0, W, H);
      var lg = g.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, key === "#6a9a52" ? "rgba(70,110,55,0.28)" : key === "#c9a227" ? "rgba(160,120,30,0.22)" : key === "#2a3544" ? "rgba(40,50,70,0.35)" : key === "#c43b6e" ? "rgba(196,59,110,0.3)" : key === "#3a5a8a" ? "rgba(50,80,130,0.32)" : "rgba(140,70,40,0.28)");
      lg.addColorStop(0.5, "rgba(0,0,0,0)");
      lg.addColorStop(1, "rgba(140,70,32,0.28)");
      g.fillStyle = lg;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(232,226,214,0.18)";
      g.lineWidth = 2;
      g.strokeRect(10, 10, W - 20, H - 20);
      g.beginPath();
      g.setLineDash([7, 7]);
      g.moveTo(18, NET);
      g.lineTo(W - 18, NET);
      g.strokeStyle = "rgba(236,234,228,0.55)";
      g.lineWidth = 2;
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = "rgba(236,234,228,0.16)";
      g.fillRect(W / 2 - 2, NET - 14, 4, 28);
      return courtCvs;
    }

    function draw(t) {
      var sh = 0, sv = 0, i;
      if (trauma > 0 && !reduced) {
        var mag = trauma * trauma * 10;
        sh = (Math.random() * 2 - 1) * mag;
        sv = (Math.random() * 2 - 1) * mag;
      }
      ctx.save();
      ctx.translate(sh, sv);
      ctx.drawImage(ensureCourt(), 0, 0);

      for (i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.globalAlpha = Math.max(0, 1 - p.t / 0.5);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      var foeImg = imgs[cfg.face] || imgs.zinaida;
      var meImg = cfg.mirror ? (imgs.kostya || imgs.yurec) : imgs.yurec;
      var meFill = cfg.mirror ? "#3a5a8a" : "#c46a3a";
      if (ladle && !babka.dead) drawLadle();
      drawKolobok(babka, foeImg, cfg.fill, true, stunZ > 0);
      if (kingZ > 0 || mateZ.dead) drawKolobok(mateZ, zinaHelp ? imgs.zinaida : imgs.lysy, zinaHelp ? "#6a9a52" : "#c9a227", true, false);
      if (ufoZ > 0 || mateZU.dead) drawKolobok(mateZU, imgs.zinaida, "#9b6bff", true, false);
      drawKolobok(yurec, meImg, meFill, false, stunY > 0);
      if (kingY > 0 || mateY.dead) drawKolobok(mateY, imgs.lysy, "#c9a227", false, false);
      if (ufoY > 0 || mateU.dead) drawKolobok(mateU, imgs.zinaida, "#9b6bff", false, false);
      if (!babka.dead) drawStunClock(babka, stunZ, true);
      if (!yurec.dead) drawStunClock(yurec, stunY, false);
      if (kingY > 0 && kingY < 1e8 && !mateY.dead) {
        ctx.fillStyle = "rgba(232,195,106,0.95)";
        ctx.font = "700 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("лысый " + Math.ceil(kingY) + "с", mateY.x, mateY.y + mateY.r * 0.82);
      }
      if (kingZ > 0 && kingZ < 1e8 && !mateZ.dead) {
        ctx.fillStyle = "rgba(232,195,106,0.95)";
        ctx.font = "700 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("лысый " + Math.ceil(kingZ) + "с", mateZ.x, mateZ.y - mateZ.r * 0.82);
      }
      if (ufoY > 0 && !mateU.dead) {
        ctx.fillStyle = "rgba(155,107,255,0.95)";
        ctx.font = "700 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("нло " + Math.ceil(ufoY) + "с", mateU.x, mateU.y + mateU.r * 0.82);
      }
      if (ufoZ > 0 && !mateZU.dead) {
        ctx.fillStyle = "rgba(155,107,255,0.95)";
        ctx.font = "700 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("нло " + Math.ceil(ufoZ) + "с", mateZU.x, mateZU.y - mateZU.r * 0.82);
      }
      if (zinaHelp && !mateZ.dead) {
        ctx.fillStyle = "rgba(180,220,140,0.95)";
        ctx.font = "700 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ящер", mateZ.x, mateZ.y - mateZ.r * 0.82);
      }
      drawVodkaWall(true, vodkaZ, t);
      drawVodkaWall(false, vodkaY, t);
      drawBonus(t);

      for (i = 0; i < balls.length; i++) drawBall(balls[i]);

      for (i = 0; i < pellets.length; i++) {
        var pel = pellets[i];
        ctx.beginPath();
        ctx.arc(pel.x, pel.y, pel.r, 0, Math.PI * 2);
        ctx.fillStyle = "#d9b36a";
        ctx.fill();
        ctx.strokeStyle = "#3a2a12";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      var li, L, glow;
      for (li = lasers.length - 1; li >= 0; li--) {
        L = lasers[li];
        L.t -= 0.016;
        if (L.t <= 0) { lasers.splice(li, 1); continue; }
        glow = Math.max(0.2, L.t / 0.7);
        ctx.save();
        ctx.globalAlpha = glow;
        ctx.strokeStyle = L.hue || "#ff2a6a";
        ctx.lineWidth = 18 * glow;
        ctx.lineCap = "round";
        ctx.shadowColor = L.hue || "#ff2a6a";
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.moveTo(L.x1, L.y1);
        ctx.lineTo(L.x2, L.y2);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();
      }

      if (phase === "serve" && serveFor === "yurec") {
        ctx.fillStyle = "rgba(236,234,228,0.85)";
        ctx.font = "600 13px Manrope, sans-serif";
        ctx.textAlign = "center";
        if (stickyMode || pillSticky) {
          ctx.fillText("липучка · ткни — подача", W / 2, yurec.y - yurec.r - 28);
        } else {
          var left = Math.max(0, 10 - serveT);
          ctx.fillText(left <= 3.2 ? "авто " + Math.ceil(left) + "с" : "ткни — подача", W / 2, yurec.y - yurec.r - 28);
        }
      }
      if (bannerT > 0) {
        ctx.globalAlpha = Math.min(1, bannerT * 2);
        ctx.fillStyle = "#eceae4";
        ctx.font = "700 15px Manrope, sans-serif";
        ctx.textAlign = "center";
        var lines = cachedBannerLines();
        var by = NET + (scoreY >= scoreZ ? 28 : -36);
        for (i = 0; i < lines.length; i++) ctx.fillText(lines[i], W / 2, by + i * 18);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    function loop(ts) {
      if (!running) return;
      if (document.hidden) {
        last = 0;
        acc = 0;
        raf = 0;
        return;
      }
      if (phase === "menu" || phase === "over") {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      if (hitstop > 0) {
        hitstop -= dt;
        draw(ts);
        return;
      }
      acc += dt;
      var steps = 0;
      while (acc >= STEP && steps < 3) {
        step(STEP);
        acc -= STEP;
        steps += 1;
      }
      if (acc > STEP * 3) acc = 0;
      var i = particles.length;
      while (i--) {
        var p = particles[i];
        p.t += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        if (p.t > 0.5) particles.splice(i, 1);
      }
      trauma = Math.max(0, trauma - dt * 1.8);
      flash = Math.max(0, flash - dt * 8);
      draw(ts);
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
      var ey = eventY(e);
      if (phase === "play" && shotY > 0 && stunY <= 0 && ey < NET) {
        fireShot("yurec");
        return;
      }
      if ((phase === "play" || phase === "serve") && laserY > 0 && stunY <= 0 && ey < NET) {
        fireLaser("yurec");
        return;
      }
      if (stunY > 0) return;
      if (phase === "serve" && serveFor === "yurec") launch();
    }
    function onMove(e) {
      if (e.cancelable) e.preventDefault();
      pointerX = eventX(e);
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.style.touchAction = "none";
    shotBtn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      unlockAudio();
      if (laserY > 0) fireLaser("yurec");
      else fireShot("yurec");
    });

    function onKey(e, down) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.l = down;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.r = down;
      if (down && (e.code === "Space" || e.code === "Enter")) {
        if (phase === "serve" && serveFor === "yurec" && stunY <= 0) {
          e.preventDefault();
          launch();
        } else if ((phase === "play" || phase === "serve") && laserY > 0) {
          e.preventDefault();
          fireLaser("yurec");
        } else if (phase === "play" && shotY > 0) {
          e.preventDefault();
          fireShot("yurec");
        }
      }
    }
    function kd(e) { onKey(e, true); }
    function ku(e) { onKey(e, false); }
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    var ro = null;
    try {
      ro = new ResizeObserver(size);
      ro.observe(host);
    } catch (err) {
      window.addEventListener("resize", size);
    }
    size();
    hud.hidden = true;

    function onVis() {
      last = 0;
      acc = 0;
      if (!document.hidden && running && phase !== "menu" && phase !== "over" && !raf) {
        raf = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVis);

    Promise.all([
      loadImg(FACE_URL.yurec),
      loadImg(FACE_URL.povar),
      loadImg(FACE_URL.lysy),
      loadImg(FACE_URL.zinaida),
      loadImg(FACE_URL.batya),
      loadImg(FACE_URL.svetlana),
      loadImg(FACE_URL.kostya)
    ]).then(function (got) {
      imgs.yurec = got[0];
      imgs.povar = got[1];
      imgs.lysy = got[2];
      imgs.zinaida = got[3];
      imgs.batya = got[4];
      imgs.svetlana = got[5];
      imgs.kostya = got[6];
      bakeImg(imgs.yurec);
      bakeImg(imgs.povar);
      bakeImg(imgs.lysy);
      bakeImg(imgs.zinaida);
      bakeImg(imgs.batya);
      bakeImg(imgs.svetlana);
      bakeImg(imgs.kostya);
      draw(0);
    });
    draw(0);

    try {
      window.__avFinish = function (won) {
        if (won) scoreY = matchGoal();
        else scoreZ = matchGoal();
        finish();
      };
    } catch (e) {}

    return {
      destroy: function () {
        running = false;
        try { window.__avFinish = null; } catch (e2) {}
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        window.removeEventListener("keydown", kd);
        window.removeEventListener("keyup", ku);
        window.removeEventListener("resize", size);
        document.removeEventListener("visibilitychange", onVis);
        if (ro) try { ro.disconnect(); } catch (e) {}
        if (audioCtx) try { audioCtx.close(); } catch (e) {}
        host.innerHTML = "";
        try {
          document.documentElement.classList.remove("av-nodock");
          document.body.classList.remove("av-nodock");
        } catch (e) {}
        var fw = document.getElementById("fw-dom");
        if (fw && fw.parentNode) fw.parentNode.removeChild(fw);
        var rn = document.getElementById("rain-dom");
        if (rn && rn.parentNode) rn.parentNode.removeChild(rn);
        var ks = document.getElementById("kiss-dom");
        if (ks && ks.parentNode) ks.parentNode.removeChild(ks);
      }
    };
  }

  root.YurecAv = { mount: mount };
})(typeof window !== "undefined" ? window : this);
