import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  DONATION_AMOUNT,
  DONATION_BANK,
  DONATION_CARD,
  DONATION_COMMENT,
  DONATION_TG,
} from "@/data/catalog";
import { playRain } from "@/components/rain";
import { usePaid } from "@/lib/use-paid";
import { applyLicenseKey } from "@/lib/license-key";
import { openZoom } from "@/lib/zoom";
import { cachedCount, initOffline, offlineItems, subscribeOffline } from "@/lib/offline";

export const Route = createFileRoute("/donate")({ component: DonatePage });

function DonatePage() {
  const { paid, lock } = usePaid();
  const [again, setAgain] = useState(false);
  const [revoke, setRevoke] = useState(false);
  const [, bump] = useState(0);
  useEffect(() => {
    initOffline();
    return subscribeOffline(() => bump((n) => n + 1));
  }, []);

  if (paid && !again) {
    const have = cachedCount();
    const total = offlineItems().length;
    return (
      <main className="px-4 pt-4 pb-10">
        <Link to="/about" className="inline-flex h-10 items-center text-sm text-muted">
          ← Назад в Инфо
        </Link>
        <button
          type="button"
          onClick={() => openZoom("/donate/yes.jpg?v=1.53.8")}
          className="mt-3 block w-full overflow-hidden rounded-2xl"
          aria-label="Открыть картинку"
        >
          <img src="/donate/yes.jpg?v=1.53.8" alt="" className="w-full object-cover" />
        </button>
        <p className="mt-5 text-center font-sans text-[30px] font-semibold leading-tight text-gold">
          Спасибо за поддержку!
        </p>
        <section className="mt-4 space-y-1.5 font-serif text-[16px] leading-relaxed text-muted">
          <p>Лицензия открыта. Навсегда.</p>
          <p>
            Юрец уже орёт в голос, что вы — его лучший холоп, и он готов за вас хоть в окно
            выпрыгнуть (с третьего, аккуратно).
          </p>
          <p>
            Это не подписка на страдание. Это комедийная сага. Рассказы, серии, песни — были
            бесплатными и останутся бесплатными. Без рекламы. Без «ещё 15 секунд». Без «посмотрите,
            как красиво мы вам жизнь портим».
          </p>
          <p>
            Если когда-нибудь снова захочется кинуть бензин в бак — кнопка «Пожертвование» никуда не
            денется.
          </p>
          <p>Шотман помнит своих. И любит.</p>
          <p>Читайте дальше. Здесь ещё много шума.</p>
        </section>
        <Link
          to="/offline"
          className="mt-4 grid h-12 w-full place-items-center rounded-xl bg-off px-4 text-sm font-medium text-off-fg"
        >
          Оффлайн-доступ · {have} из {total}
        </Link>
        <button
          type="button"
          onClick={() => setAgain(true)}
          className="mt-8 grid h-12 w-full place-items-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          Пожертвовать ещё раз
        </button>
        <button
          type="button"
          onClick={() => setRevoke(true)}
          className="mt-3 grid h-12 w-full place-items-center rounded-xl bg-danger px-4 text-sm font-medium text-danger-fg"
        >
          Удалить лицензию
        </button>
        {revoke ? (
          <div
            className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-title"
          >
            <div className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <p id="revoke-title" className="text-center font-sans text-[15px] font-semibold leading-snug">
                Удалить лицензию?
              </p>
              <p className="mt-2 text-center text-[13px] leading-relaxed text-muted">
                После этого нужно будет заново ввести лицензионный ключ. Платный контент снова
                закроется. Если был доступ разработчика — он тоже сбросится.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRevoke(false)}
                  className="h-11 flex-1 rounded-xl bg-elevated text-sm font-medium"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRevoke(false);
                    playRain();
                    lock();
                  }}
                  className="h-11 flex-1 rounded-xl bg-danger text-sm font-medium text-danger-fg"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    );
  }

  return <PayBlock showKey={!paid} />;
}

function PayBlock({ showKey }: { showKey: boolean }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyCard() {
    const text = DONATION_CARD;
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(done, done);
      return;
    }
    try {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } catch {
      /* ignore */
    }
    done();
  }

  return (
    <main className="px-4 pt-4 pb-10">
      <Link to="/about" className="inline-flex h-10 items-center text-sm text-muted">
        ← Назад в Инфо
      </Link>
      <button
        type="button"
        onClick={() => openZoom("/donate/no.jpg?v=1.53.8")}
        className="mt-3 block w-full overflow-hidden rounded-2xl"
        aria-label="Открыть картинку"
      >
        <img src="/donate/no.jpg?v=1.53.8" alt="" className="w-full object-cover" />
      </button>
      <p className="mt-5 text-center font-sans text-[30px] font-semibold leading-tight text-gold">
        Добровольное пожертвование
      </p>
      <p className="mt-2 text-center font-serif text-[17px] leading-relaxed text-fg">
        единовременная покупка
      </p>

      <section className="mt-4 space-y-1.5 font-serif text-[16px] leading-relaxed text-muted">
        <p>
          Для новых историй и свежих видео мне нужно вдохновение — а оно, как известно, сидит на
          Шотмана и периодически выдаёт шедевры безумия! Каждая встреча с Юрцом — это новый
          порционный зашквар, от которого хочется и ржать, и немного бояться. А каждый выезд к нему
          — полноценное приключение с непредсказуемым финалом (обычно мокрым, странным и очень
          смешным).
        </p>
        <p>
          Если тебе нравится этот цирк и ты хочешь, чтобы комедийная сага продолжалась регулярно и
          без пауз — поддержи автора! Все средства пойдут строго по делу: телефонные разговоры с
          Юрцом (он ведь не всегда на связи, когда надо), бензин, новые вылазки, съёмка, монтаж и
          генерация новых серий с помощью нейросетей. Чем больше донатов — тем быстрее выходят
          свежие ролики. Хочешь, чтобы следующий эпизод вышел через неделю, а не через месяц?
          Решаешь ты!
        </p>
        <p>
          Каждый донат — это не просто «спасибо», это прямой ускоритель контента. Юрец уже на
          низком старте и готов рассказывать про свою жизнь, нейросети ждут команд, а я готов
          звонить, ехать и монтировать. Жми донат, пока Юрец не начал рассказывать историю без нас!
        </p>
      </section>

      <div className="mt-6 rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <p className="text-center text-[15px] font-medium tracking-[0.08em] text-gold">Стоимость</p>
        <p className="mt-2 text-center font-sans text-[28px] font-semibold leading-none tabular-nums">{DONATION_AMOUNT}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Это не подписка. Один платёж — и лицензионный ключ откроет весь платный контент в
          приложении навсегда!
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Для приобретения лицензии необходимо сделать перевод по следующим реквизитам:{" "}
          <button
            type="button"
            onClick={copyCard}
            className="inline font-sans font-semibold tracking-wide text-fg underline decoration-gold/60 underline-offset-4 tabular-nums"
          >
            {DONATION_CARD}
          </button>{" "}
          ({DONATION_BANK}) и обязательно указать комментарий «{DONATION_COMMENT}». После этого
          напишите автору канала и получите свой лицензионный ключ!
        </p>
        {copied ? <p className="mt-2 text-center text-[12px] text-gold">Номер карты скопирован</p> : null}
        <a
          href={DONATION_TG}
          target="_blank"
          rel="noreferrer"
          className="mt-3 grid h-12 w-full place-items-center rounded-xl bg-tg text-sm font-medium text-tg-fg"
        >
          Написать автору в Telegram
        </a>
      </div>

      <p className="mt-5 font-serif text-[15px] leading-relaxed text-subtle">
        Текстовые рассказы в Telegram, видеоролики и песни на YouTube — всё это по-прежнему бесплатно
        и без рекламы. Оплата открывает доступ к эксклюзивному контенту, даёт возможность смотреть все
        материалы оффлайн, а также существенно ускоряет развитие канала!
      </p>

      {showKey ? (
        <form
          className="mt-8 rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          onSubmit={(e) => {
            e.preventDefault();
            if (applyLicenseKey(value)) {
              return;
            }
            setErr(true);
          }}
        >
          <p className="text-center font-sans text-[15px] font-semibold">Уже куплено? Введите ключ:</p>
          <input
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              if (applyLicenseKey(next)) {
                try {
                  e.currentTarget.blur();
                } catch {
                  /* ignore */
                }
                return;
              }
              setValue(next);
              setErr(false);
            }}
            className="mt-3 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
            placeholder="лицензионный ключ"
            autoComplete="off"
            enterKeyHint="done"
          />
          {err ? (
            <p className="mt-2 text-center text-[12px] text-danger">Неверный ключ.</p>
          ) : (
            <p className="mt-2 text-center text-[12px] text-subtle">
              После ввода ключа это окно больше не появится.
            </p>
          )}
        </form>
      ) : null}
    </main>
  );
}
