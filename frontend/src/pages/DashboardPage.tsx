import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DashboardShell } from "../components/DashboardShell";
import { useAuth } from "../hooks/useAuth";
import type { Dashboard } from "../types/data";
import { createDashboard, fetchDashboards } from "../utils/api";

export function DashboardPage() {
  const { user, token } = useAuth();
  const location = useLocation();
  const locationState = (location.state as { uploadMessage?: string; datasetId?: string } | null) ?? null;
  const uploadMessage = locationState?.uploadMessage;
  const uploadedDatasetId = locationState?.datasetId;
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dashboardName, setDashboardName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboards = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await fetchDashboards(token);
        setDashboards(response.dashboards);
      } catch {
        setError("Unable to load dashboards.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboards();
  }, [token]);

  const handleCreateDashboard = async () => {
    if (!token) {
      return;
    }

    if (!dashboardName.trim()) {
      setError("Dashboard name is required.");
      return;
    }

    try {
      setError(null);
      setIsCreating(true);
      const response = await createDashboard(token, dashboardName.trim());
      setDashboards(current => [response.dashboard, ...current]);
      setDashboardName("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create dashboard.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardShell
      title="Dashboard"
      eyebrow="Overview"
      description="Manage your account and uploaded datasets."
    >
      <section className="grid gap-6 md:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboards</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Create and manage dashboards</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Save query widgets into reusable dashboards and monitor multiple charts in one place.
          </p>
          {uploadMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {uploadMessage}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={dashboardName}
              onChange={event => setDashboardName(event.target.value)}
              placeholder="Dashboard name"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
            <button
              type="button"
              onClick={handleCreateDashboard}
              disabled={isCreating}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isCreating ? "Creating..." : "Create Dashboard"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading dashboards...</p>
            ) : dashboards.length === 0 ? (
              <p className="text-sm text-slate-600">No dashboards yet. Create one to start saving widgets.</p>
            ) : (
              dashboards.map(dashboard => (
                <Link
                  key={dashboard.id}
                  to={`/dashboards/${dashboard.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="font-semibold text-slate-900">{dashboard.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Created {new Date(dashboard.created_at).toLocaleString()}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Workspace</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Dashboards</dt>
              <dd className="mt-1 font-medium">{dashboards.length}</dd>
            </div>
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
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/query"
              state={uploadedDatasetId ? { datasetId: uploadedDatasetId, uploadMessage } : undefined}
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Open Query Builder
            </Link>
            <Link
              to="/upload"
              className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
