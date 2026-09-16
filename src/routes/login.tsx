import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Жизнь Юрца</p>
      <h1 className="mt-2 font-sans text-2xl font-semibold">Вход в сборник</h1>
      <p className="mt-2 text-sm text-muted">
        Закладки привяжутся к аккаунту. Рассказы можно читать и без входа.
      </p>

      <div className="mt-8 space-y-3">
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/saved" })}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-medium text-accent-fg transition-transform duration-150 active:scale-[0.96]"
            >
              Продолжить через {p.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-muted">Вход сейчас выключен.</p>
        )}
      </div>

      <Link to="/" className="mt-8 text-center text-sm text-muted hover:text-fg">
        Читать без аккаунта
      </Link>
    </main>
  );
}
