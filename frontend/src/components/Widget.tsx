import { Chart } from "./Chart";
import type { DashboardWidget } from "../types/data";

type WidgetProps = {
  widget: DashboardWidget;
  isDeleting: boolean;
  onDelete: (widgetId: string) => void;
};

export function Widget({ widget, isDeleting, onDelete }: WidgetProps) {
  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{widget.chart_type} chart</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{widget.query_name ?? "Saved query"}</h3>
          <p className="mt-1 text-sm text-slate-500">Metric: {widget.metric ?? "Unavailable"}</p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(widget.id)}
          disabled={isDeleting}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {isDeleting ? "Removing..." : "Remove"}
        </button>
      </div>

      <div className="mt-4 flex-1">
        {widget.metric ? (
          <Chart data={widget.rows} metric={widget.metric} chartType={widget.chart_type} />
        ) : (
          <div className="flex h-[360px] items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            This widget could not load its saved query.
          </div>
        )}
      </div>
    </article>
  );
}
