import { useState } from "react";
import { api } from "../api";
import { ResultView } from "../components/ResultView";

export function CheckPage() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); // { title, transcript, result }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setData(null);
    setBusy(true);
    try {
      const res = await api.runCheck(url.trim());
      setData(res);
    } catch (err) {
      setError(err.message || "The check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Check a video</h1>
        <p className="mt-1 text-sm text-slate-400">
          Paste a link to a TikTok, Instagram, YouTube, or X video. We transcribe
          the audio, then fact-check the claims against live web sources.
        </p>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/..."
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Check"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}
      </section>

      {busy && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            Downloading audio, transcribing, and fact-checking… this can take a
            minute.
          </div>
        </div>
      )}

      {data && (
        <>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Transcript
            </h2>
            {data.title && (
              <p className="mt-1 text-sm text-slate-500">{data.title}</p>
            )}
            <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
              {data.transcript}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Fact check
            </h2>
            <ResultView result={data.result} />
          </section>
        </>
      )}
    </div>
  );
}
