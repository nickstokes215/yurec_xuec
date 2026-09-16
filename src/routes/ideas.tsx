import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/ideas")({ component: IdeasPage });

const IDEAS = [
  "Публикация приложения в Google Play Market или RuStore (для Android);",
  "Порт приложения на iOS (для iPhone);",
  "Новые уровни «Юрцовского квеста» и «Кроссворды»;",
  "Третий визит к Юрцу (ещё больше треш-контента).",
];

function IdeasPage() {
  return (
    <main className="px-4 pt-4 pb-10">
      <Link to="/about" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted">
        <ArrowLeft className="size-4" />
        Назад в Инфо
      </Link>
      <p className="mt-4 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
        О приложении
      </p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Нереализованные идеи</h2>
      <p className="mt-3 font-serif text-[16px] leading-relaxed text-subtle italic">
        Здесь лежит то, до чего руки пока не доходят. Это не обещание и не дорожная карта — просто
        мысли, чтобы не стёрлись. Если когда-нибудь появятся время, бензин и вдохновение, часть
        этого может ожить. Пока — черновик Шотмана.
      </p>
      <ul className="mt-5 space-y-3">
        {IDEAS.map((idea) => (
          <li key={idea} className="font-serif text-[17px] leading-relaxed text-muted">
            · {idea}
          </li>
        ))}
      </ul>
    </main>
  );
}
