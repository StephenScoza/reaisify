import { Icon } from "./Icon";

interface InfoPopoverProps {
  label: string;
  title: string;
  children: string;
}

export const InfoPopover = ({ label, title, children }: InfoPopoverProps) => (
  <span className="group relative inline-flex">
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slatebrand transition hover:border-mint/40 hover:text-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
    >
      <Icon name="info" className="h-4 w-4" />
    </button>
    <span className="pointer-events-none absolute right-0 top-9 z-[80] hidden w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-glow group-hover:block group-focus-within:block">
      <span className="block text-sm font-semibold text-ink">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-600">{children}</span>
    </span>
  </span>
);
