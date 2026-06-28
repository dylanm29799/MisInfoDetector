import { useEffect, useState } from "react";
import { api } from "../api";
import { VerdictBadge } from "../components/Verdict";
import { ResultView } from "../components/ResultView";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function DashboardPage() {
  const [checks, setChecks] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api
      .listChecks()
      .then(setChecks)
      .catch((e) => setError(e.message));
  }, []);

  async function open(id) {
    setSelected(id);
    setDetail(null);
    setLoadingDetail(true);
    try {
      setDetail(await api.getCheck(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your recent checks</h1>
        <p className="mt-1 text-sm text-slate-400">
          Every video you've checked, newest first. Click one to see the full
          result.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {checks === null && !error && (
        <p className="text-slate-400">Loading…</p>
      )}

      {checks && checks.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-slate-400">
          No checks yet. Head to the Check tab to run your first one.
        </div>
      )}

      {checks && checks.length > 0 && (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          {checks.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => open(c.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-100">
                    {c.title || c.source_url}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {c.source_url} · {formatDate(c.created_at)}
                  </p>
                </div>
                <VerdictBadge verdict={c.overall_verdict} overall />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1020] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">
                {detail?.title || "Check detail"}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loadingDetail && <p className="text-slate-400">Loading…</p>}

            {detail && (
              <div className="space-y-6">
                <a
                  href={detail.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block break-all text-sm text-sky-400 hover:text-sky-300"
                >
                  {detail.source_url}
                </a>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Transcript
                  </h3>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {detail.transcript}
                  </div>
                </div>

                <ResultView result={detail.result} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
