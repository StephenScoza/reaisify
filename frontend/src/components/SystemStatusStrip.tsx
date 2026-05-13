import { useEffect, useState } from "react";
import { getSystemStatus } from "../services/fxService";
import type { SystemStatus } from "../types/currency";

export const SystemStatusStrip = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadStatus = async () => {
      try {
        const data = await getSystemStatus();
        if (isActive) {
          setStatus(data);
        }
      } catch {
        if (isActive) {
          setStatus(null);
        }
      }
    };

    void loadStatus();
    const handle = window.setInterval(() => void loadStatus(), 60_000);

    return () => {
      isActive = false;
      window.clearInterval(handle);
    };
  }, []);

  const items = [
    { label: "Live FX", active: status?.liveFxConfigured },
    { label: "Discord", active: status?.discordConfigured },
    { label: "Scheduler", value: status ? `${Math.round(status.alertPollIntervalMs / 1000)}s` : "--" },
    { label: "Storage", value: "persisted" },
  ];

  return (
    <section className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-ink shadow-glow md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-xl border border-slate-200 bg-sand px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slatebrand">{item.label}</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
            {"active" in item ? (
              <>
                <span className={`h-2.5 w-2.5 rounded-full ${item.active ? "bg-mint" : "bg-danger"}`} />
                {item.active ? "Connected" : "Needs setup"}
              </>
            ) : (
              item.value
            )}
          </div>
        </div>
      ))}
    </section>
  );
};
