import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MisInfo Detector</h1>
          <p className="mt-1 text-sm text-slate-400">
            Fact-check social media videos against real sources.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1 text-sm">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-md py-1.5 font-medium capitalize transition ${
                  mode === m ? "bg-white/10 text-white" : "text-slate-400"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">
                Password{" "}
                {mode === "signup" && (
                  <span className="text-slate-500">(min 8 characters)</span>
                )}
              </label>
              <input
                type="password"
                required
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
