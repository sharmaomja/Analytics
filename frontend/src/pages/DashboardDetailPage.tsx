import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardShell } from "../components/DashboardShell";
import { DashboardGrid } from "../components/DashboardGrid";
import { useAuth } from "../hooks/useAuth";
import type { Dashboard, DashboardWidget } from "../types/data";
import { deleteWidget, fetchDashboard } from "../utils/api";

export function DashboardDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingWidgetId, setDeletingWidgetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token || !id) {
        return;
      }

      try {
        setError(null);
        setIsLoading(true);
        const response = await fetchDashboard(token, id);
        setDashboard(response.dashboard);
        setWidgets(response.widgets);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [id, token]);

  const handleDeleteWidget = async (widgetId: string) => {
    if (!token) {
      return;
    }

    try {
      setDeletingWidgetId(widgetId);
      setError(null);
      await deleteWidget(token, widgetId);
      setWidgets(current => current.filter(widget => widget.id !== widgetId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to remove widget.");
    } finally {
      setDeletingWidgetId(null);
    }
  };

  return (
    <DashboardShell
      title={dashboard?.name ?? "Dashboard"}
      eyebrow="Dashboards"
      description="View and manage the saved query widgets in this dashboard."
    >
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-700">Dashboard widgets</p>
            <p className="mt-1 text-sm text-slate-500">{widgets.length} widget{widgets.length === 1 ? "" : "s"} saved</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/query")}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Widget
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[280px] animate-pulse rounded-[2rem] border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : (
          <DashboardGrid
            widgets={widgets}
            deletingWidgetId={deletingWidgetId}
            onDeleteWidget={handleDeleteWidget}
          />
        )}
      </section>
    </DashboardShell>
  );
}
