// Maps verdict strings to colors/labels and renders a badge.

const CLAIM_STYLES = {
  true: { label: "True", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  false: { label: "False", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  misleading: {
    label: "Misleading",
    cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  },
  unverifiable: {
    label: "Unverifiable",
    cls: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  },
};

const OVERALL_STYLES = {
  accurate: { label: "Accurate", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  mostly_accurate: {
    label: "Mostly accurate",
    cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  },
  mixed: { label: "Mixed", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  misleading: { label: "Misleading", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  false: { label: "False", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  no_factual_claims: {
    label: "No factual claims",
    cls: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  },
  unverifiable: {
    label: "Unverifiable",
    cls: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  },
};

export function VerdictBadge({ verdict, overall = false }) {
  const map = overall ? OVERALL_STYLES : CLAIM_STYLES;
  const style = map[verdict] || {
    label: verdict || "Unknown",
    cls: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.cls}`}
    >
      {style.label}
    </span>
  );
}
