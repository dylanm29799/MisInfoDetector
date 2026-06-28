import { VerdictBadge } from "./Verdict";

// Renders a full fact-check result: overall verdict, summary, and each claim
// with its evidence and sources.
export function ResultView({ result }) {
  if (!result) return null;
  const claims = result.claims || [];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Overall verdict
          </h3>
          <VerdictBadge verdict={result.overall_verdict} overall />
        </div>
        {result.summary && (
          <p className="mt-3 text-slate-200 leading-relaxed">{result.summary}</p>
        )}
      </div>

      {claims.length === 0 ? (
        <p className="text-slate-400">No specific factual claims were identified.</p>
      ) : (
        <ol className="space-y-4">
          {claims.map((c, i) => (
            <li
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-100">{c.claim}</p>
                <VerdictBadge verdict={c.verdict} />
              </div>

              {c.explanation && (
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {c.explanation}
                </p>
              )}

              {c.correction && (
                <div className="mt-3 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-100">
                  <span className="font-semibold">Correction: </span>
                  {c.correction}
                </div>
              )}

              {c.sources && c.sources.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sources
                  </p>
                  <ul className="mt-2 space-y-1">
                    {c.sources.map((s, j) => (
                      <li key={j}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm text-sky-400 underline decoration-sky-400/30 underline-offset-2 hover:text-sky-300 break-all"
                        >
                          {s.title || s.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
