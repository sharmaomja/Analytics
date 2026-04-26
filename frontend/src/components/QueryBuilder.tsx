import type { Dashboard, Dataset, DatasetField, QueryConfig, QueryFilter } from "../types/data";

type QueryBuilderProps = {
  dashboards: Dashboard[];
  datasets: Dataset[];
  fields: DatasetField[];
  value: QueryConfig;
  queryName: string;
  selectedDashboardId: string;
  isLoadingFields: boolean;
  isRunning: boolean;
  isSavingToDashboard: boolean;
  onChange: (value: QueryConfig) => void;
  onDashboardChange: (dashboardId: string) => void;
  onQueryNameChange: (queryName: string) => void;
  onRun: () => void;
  onSave: () => void;
  onSaveToDashboard: () => void;
};

const operators: QueryFilter["op"][] = ["=", "!=", ">", ">=", "<", "<=", "contains"];

export function QueryBuilder({
  dashboards,
  datasets,
  fields,
  value,
  queryName,
  selectedDashboardId,
  isLoadingFields,
  isRunning,
  isSavingToDashboard,
  onChange,
  onDashboardChange,
  onQueryNameChange,
  onRun,
  onSave,
  onSaveToDashboard,
}: QueryBuilderProps) {
  const metricFields = fields.filter(field => field.semantic_type === "metric");
  const dimensionFields = fields.filter(field => ["dimension", "timestamp"].includes(field.semantic_type));

  const filter = value.filters[0] ?? { field: "", op: "=" as const, value: "" };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="dataset-select">Dataset</label>
          <select
            id="dataset-select"
            value={value.dataset_id}
            onChange={event => onChange({ ...value, dataset_id: event.target.value, metrics: [], dimensions: [], filters: [] })}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          >
            <option value="">Select dataset</option>
            {datasets.map(dataset => (
              <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="metric-select">Metric</label>
          <select
            id="metric-select"
            value={value.metrics[0] ?? ""}
            onChange={event => onChange({ ...value, metrics: event.target.value ? [event.target.value] : [] })}
            disabled={!value.dataset_id || isLoadingFields}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
          >
            <option value="">Select metric</option>
            {metricFields.map(field => (
              <option key={field.id} value={field.name}>{field.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="dimension-select">Dimension</label>
          <select
            id="dimension-select"
            value={value.dimensions[0] ?? ""}
            onChange={event => onChange({ ...value, dimensions: event.target.value ? [event.target.value] : [] })}
            disabled={!value.dataset_id || isLoadingFields}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
          >
            <option value="">Select dimension</option>
            {dimensionFields.map(field => (
              <option key={field.id} value={field.name}>{field.name}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Filter</p>
          <div className="mt-4 grid gap-3">
            <select
              value={filter.field}
              onChange={event => onChange({ ...value, filters: event.target.value ? [{ ...filter, field: event.target.value }] : [] })}
              disabled={!value.dataset_id || isLoadingFields}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
            >
              <option value="">No filter</option>
              {fields.map(field => (
                <option key={field.id} value={field.name}>{field.name}</option>
              ))}
            </select>

            <select
              value={filter.op}
              onChange={event => onChange({ ...value, filters: [{ ...filter, op: event.target.value as QueryFilter["op"] }] })}
              disabled={!filter.field}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
            >
              {operators.map(operator => (
                <option key={operator} value={operator}>{operator}</option>
              ))}
            </select>

            <input
              value={filter.value}
              onChange={event => onChange({ ...value, filters: [{ ...filter, value: event.target.value }] })}
              disabled={!filter.field}
              placeholder="Filter value"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isRunning ? "Running..." : "Run Query"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isRunning}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Save Query
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Save to Dashboard</p>
          <div className="mt-4 grid gap-3">
            <input
              value={queryName}
              onChange={event => onQueryNameChange(event.target.value)}
              placeholder="Saved query name"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />

            <select
              value={selectedDashboardId}
              onChange={event => onDashboardChange(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">Select dashboard</option>
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>{dashboard.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={onSaveToDashboard}
              disabled={isRunning || isSavingToDashboard || dashboards.length === 0}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSavingToDashboard ? "Saving..." : "Save to Dashboard"}
            </button>

            {dashboards.length === 0 ? (
              <p className="text-sm text-slate-500">Create a dashboard first from the Dashboard page.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
