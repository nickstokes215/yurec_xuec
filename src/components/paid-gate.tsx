import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePaid } from "@/lib/use-paid";
import { applyLicenseKey } from "@/lib/license-key";
import { cn } from "@/lib/utils";

export function PaidGate({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const { paid } = usePaid();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);

  if (paid) return <>{children}</>;

  function submit() {
    if (!applyLicenseKey(value)) {
      setErr(true);
      return;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setErr(false);
        }}
        className={cn(
          "inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full px-2 text-xs font-medium text-yt-fg bg-yt",
          className,
        )}
      >
        {label}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paid-title"
        >
          <form
            className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <p id="paid-title" className="text-center font-sans text-[15px] font-semibold leading-snug">
              Платный контент: введите лицензионный ключ
            </p>
            <input
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setErr(false);
              }}
              className="mt-4 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
              placeholder="ключ"
              autoComplete="off"
            />
            {err ? (
              <p className="mt-2 text-center text-[12px] text-danger">Неверный ключ.</p>
            ) : (
              <p className="mt-2 text-center text-[12px] text-subtle">
                Один раз — и контент открыт навсегда. Это окно больше не появится.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 flex-1 rounded-xl bg-elevated text-sm font-medium"
              >
                Отмена
              </button>
              <button type="submit" className="h-11 flex-1 rounded-xl bg-yt text-sm font-medium text-yt-fg">
                Открыть
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void navigate({ to: "/donate" });
              }}
              className="mt-2 h-11 w-full rounded-xl bg-gold text-sm font-medium text-gold-fg"
            >
              Купить
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
