import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

function navClass({ isActive }) {
  return `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive
      ? "bg-white/10 text-white"
      : "text-slate-400 hover:text-white hover:bg-white/5"
  }`;
}

export function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1020]/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold">
              ✓
            </span>
            <span className="font-semibold tracking-tight">MisInfo Detector</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Check
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="ml-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
              title={email || ""}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
