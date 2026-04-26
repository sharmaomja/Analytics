import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DashboardShell } from "../components/DashboardShell";
import { QueryBuilder } from "../components/QueryBuilder";
import { Chart } from "../components/Chart";
import { useAuth } from "../hooks/useAuth";
import type { Dashboard, Dataset, DatasetField, QueryConfig, QueryResultRow } from "../types/data";
import { createWidget, fetchDashboard, fetchDashboards, fetchDatasetFields, fetchDatasets, runQuery, saveQuery } from "../utils/api";

const initialQuery: QueryConfig = {
  dataset_id: "",
  metrics: [],
  dimensions: [],
  filters: [],
};

export function QueryPage() {
  const { token } = useAuth();
  const location = useLocation();
  const locationState = (location.state as { datasetId?: string; uploadMessage?: string } | null) ?? null;
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [fields, setFields] = useState<DatasetField[]>([]);
  const [queryConfig, setQueryConfig] = useState<QueryConfig>(initialQuery);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [queryName, setQueryName] = useState("");
  const [selectedDashboardId, setSelectedDashboardId] = useState("");
  const [results, setResults] = useState<QueryResultRow[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSavingToDashboard, setIsSavingToDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(locationState?.uploadMessage ?? null);

  useEffect(() => {
    const loadDatasets = async () => {
      if (!token) {
        setIsLoadingDatasets(false);
        return;
      }

      try {
        const response = await fetchDatasets(token);
        setDatasets(response.datasets);
      } catch {
        setError("Unable to load datasets.");
      } finally {
        setIsLoadingDatasets(false);
      }
    };

    void loadDatasets();
  }, [token]);

  useEffect(() => {
    const loadDashboards = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetchDashboards(token);
        setDashboards(response.dashboards);
        setSelectedDashboardId(current => current || response.dashboards[0]?.id || "");
      } catch {
        setDashboards([]);
      }
    };

    void loadDashboards();
  }, [token]);

  useEffect(() => {
    const datasetId = locationState?.datasetId;

    if (!datasetId) {
      return;
    }

    setQueryConfig(current => {
      if (current.dataset_id === datasetId) {
        return current;
      }

      return {
        dataset_id: datasetId,
        metrics: [],
        dimensions: [],
        filters: [],
      };
    });
  }, [locationState?.datasetId]);

  useEffect(() => {
    const loadFields = async () => {
      if (!token || !queryConfig.dataset_id) {
        setFields([]);
        return;
      }

      try {
        setError(null);
        setIsLoadingFields(true);
        const response = await fetchDatasetFields(token, queryConfig.dataset_id);
        setFields(response.fields);
      } catch (requestError) {
        setFields([]);
        setError(requestError instanceof Error ? requestError.message : "Unable to load fields.");
      } finally {
        setIsLoadingFields(false);
      }
    };

    void loadFields();
  }, [token, queryConfig.dataset_id]);

  const validateQuery = (): boolean => {
    if (!queryConfig.dataset_id) {
      setError("Select a dataset.");
      return false;
    }

    if (!queryConfig.metrics[0]) {
      setError("Select a metric.");
      return false;
    }

    if (!queryConfig.dimensions[0]) {
      setError("Select a dimension.");
      return false;
    }

    const filter = queryConfig.filters[0];
    if (filter && filter.field && !filter.value) {
      setError("Enter a filter value or remove the filter.");
      return false;
    }

    setError(null);
    return true;
  };

  const normalizedQuery: QueryConfig = {
    ...queryConfig,
    filters: queryConfig.filters.filter(filter => filter.field && filter.value),
  };

  const handleRun = async () => {
    if (!token || !validateQuery()) {
      return;
    }

    try {
      setIsRunning(true);
      setMessage(null);
      const response = await runQuery(token, normalizedQuery);
      setResults(response.rows);
    } catch (requestError) {
      setResults([]);
      setError(requestError instanceof Error ? requestError.message : "Unable to run query.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = async () => {
    if (!token || !validateQuery()) {
      return;
    }

    const queryName = window.prompt("Query name");

    if (!queryName?.trim()) {
      return;
    }

    try {
      setError(null);
      const response = await saveQuery(token, queryName.trim(), normalizedQuery);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save query.");
    }
  };

  const handleSaveToDashboard = async () => {
    if (!token || !validateQuery()) {
      return;
    }

    if (!queryName.trim()) {
      setError("Enter a name for the saved query.");
      return;
    }

    if (!selectedDashboardId) {
      setError("Select a dashboard.");
      return;
    }

    try {
      setError(null);
      setMessage(null);
      setIsSavingToDashboard(true);

      const savedQueryResponse = await saveQuery(token, queryName.trim(), normalizedQuery);
      const dashboardResponse = await fetchDashboard(token, selectedDashboardId);
      const nextY = dashboardResponse.widgets.reduce((maxY, widget) => {
        const widgetBottom = widget.position.y + widget.position.h;
        return Math.max(maxY, widgetBottom);
      }, 0);

      await createWidget(token, {
        dashboard_id: selectedDashboardId,
        query_id: savedQueryResponse.query.id,
        chart_type: chartType,
        position: { x: 0, y: nextY, w: 6, h: 4 },
      });

      const dashboard = dashboards.find(item => item.id === selectedDashboardId);
      setMessage(`Saved to ${dashboard?.name ?? "dashboard"} successfully.`);
      setQueryName("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save widget.");
    } finally {
      setIsSavingToDashboard(false);
    }
  };

  const activeMetric = normalizedQuery.metrics[0] ?? "value";

  return (
    <DashboardShell
      title="Query"
      eyebrow="Analysis"
      description="Build a query and visualize aggregated results."
    >
      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <QueryBuilder
          dashboards={dashboards}
          datasets={datasets}
          fields={fields}
          value={queryConfig}
          queryName={queryName}
          selectedDashboardId={selectedDashboardId}
          isLoadingFields={isLoadingFields}
          isRunning={isRunning}
          isSavingToDashboard={isSavingToDashboard}
          onChange={setQueryConfig}
          onDashboardChange={setSelectedDashboardId}
          onQueryNameChange={setQueryName}
          onRun={handleRun}
          onSave={handleSave}
          onSaveToDashboard={handleSaveToDashboard}
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-700">Chart</p>
              <p className="mt-1 text-sm text-slate-500">
                {isLoadingDatasets ? "Loading datasets..." : `${datasets.length} datasets available`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChartType("line")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${chartType === "line" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Line
              </button>
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${chartType === "bar" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Bar
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {!error && queryConfig.dataset_id && !isLoadingFields && fields.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No fields were found for the selected dataset. Re-upload the CSV or choose a different dataset.
            </div>
          ) : null}

          {isRunning ? (
            <div className="flex h-[360px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
              Running query...
            </div>
          ) : (
            <Chart data={results} metric={activeMetric} chartType={chartType} />
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
