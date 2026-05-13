export const DashboardFooter = () => (
  <footer className="rounded-2xl border border-white/10 bg-ink px-6 py-6 text-slate-200 shadow-glow">
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:items-start">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <img
            src="/reaisify-mark.svg"
            alt="Reaisify logo"
            className="h-11 w-11 rounded-xl bg-white/95 p-1 shadow-sm"
          />
          <div>
            <div className="font-display text-xl font-bold text-white">Reaisify</div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
              Dollars to Reais. Real simple.
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          Decision support for USD to BRL transfers, combining live FX context, fee-aware estimates, alerts, and provider health signals.
        </p>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Built For</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div>International moves</div>
          <div>Transfer timing</div>
          <div>Provider cost awareness</div>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Runtime</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div>Backend-proxied FX data</div>
          <div>Disk-backed API cache</div>
          <div>Discord alert delivery</div>
        </div>
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <span>© {new Date().getFullYear()} Reaisify. Built for clarity, not financial advice.</span>
      <span>Provider quotes, fees, and exchange rates can change before transfer execution.</span>
    </div>
  </footer>
);
