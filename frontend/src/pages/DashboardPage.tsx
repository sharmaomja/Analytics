import { Link, useLocation } from "react-router-dom";
import { DashboardShell } from "../components/DashboardShell";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const uploadMessage = (location.state as { uploadMessage?: string } | null)?.uploadMessage;

  return (
    <DashboardShell
      title="Dashboard"
      eyebrow="Overview"
      description="Manage your account and uploaded datasets."
    >
      <section className="grid gap-6 md:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Uploads</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Start a new import</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Upload a CSV file to create a dataset and store parsed records.
          </p>
          {uploadMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {uploadMessage}
            </div>
          ) : null}
          <Link
            to="/upload"
            className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Upload CSV
          </Link>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Profile</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">User ID</dt>
              <dd className="mt-1 break-all font-medium">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-1 font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Created At</dt>
              <dd className="mt-1 font-medium">{user ? new Date(user.created_at).toLocaleString() : "-"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </DashboardShell>
  );
}
