import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type DashboardShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

function navClassName({ isActive }: { isActive: boolean }): string {
  return [
    "rounded-2xl px-4 py-2 text-sm font-semibold transition",
    isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
  ].join(" ");
}

export function DashboardShell({ title, eyebrow, description, children }: DashboardShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NavLink to="/dashboard" className={navClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/upload" className={navClassName}>
              Upload
            </NavLink>
            <NavLink to="/query" className={navClassName}>
              Query
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="mt-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
