import { AdminTools } from "../components/AdminTools";
import { CacheStatusCard } from "../components/CacheStatusCard";
import { DashboardFooter } from "../components/DashboardFooter";
import { ProviderUsageCard } from "../components/ProviderUsageCard";
import { RuntimeLogCard } from "../components/RuntimeLogCard";
import { SystemStatusStrip } from "../components/SystemStatusStrip";
import { Icon } from "../components/Icon";

const pairSymbol = "usd-brl";

export const AdminDashboard = () => (
  <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 md:px-6 md:py-8 xl:px-8">
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white p-6 text-ink shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">Admin Console</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">Reaisify operations</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor provider credits, cache behavior, Discord delivery, and manual refresh controls without cluttering the main transfer dashboard.
            </p>
          </div>
          <a
            href="#/"
            className="rounded-xl border border-slate-200 bg-sand px-4 py-3 text-sm font-semibold text-ink transition hover:border-mint/40 hover:text-mint"
          >
            Back to dashboard
          </a>
        </div>
      </section>

      <SystemStatusStrip />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ProviderUsageCard showRefreshAction />
        <AdminTools pairSymbol={pairSymbol} />
      </div>

      <CacheStatusCard />

      <RuntimeLogCard />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-glow">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surf p-2 text-mint">
            <Icon name="shield" className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slatebrand">Provider Strategy</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-sand p-4">
            <div className="font-semibold text-ink">Latest rates</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Twelve Data first while credits are above reserve, then Frankfurter, then mock fallback.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-sand p-4">
            <div className="font-semibold text-ink">Historical charts</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Frankfurter first to preserve Twelve Data credits.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-sand p-4">
            <div className="font-semibold text-ink">Manual controls</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Refresh buttons warn before using endpoints that may spend credits.</p>
          </div>
        </div>
      </section>

      <DashboardFooter />
    </div>
  </main>
);
