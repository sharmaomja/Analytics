import { Widget } from "./Widget";
import type { DashboardWidget } from "../types/data";

type DashboardGridProps = {
  widgets: DashboardWidget[];
  deletingWidgetId: string | null;
  onDeleteWidget: (widgetId: string) => void;
};

export function DashboardGrid({ widgets, deletingWidgetId, onDeleteWidget }: DashboardGridProps) {
  if (widgets.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
        No widgets yet. Save a query to this dashboard from the Query page.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 md:auto-rows-[120px]">
      {widgets.map(widget => (
        <div
          key={widget.id}
          className="md:col-span-12"
          style={{
            gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
            gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
          }}
        >
          <Widget
            widget={widget}
            isDeleting={deletingWidgetId === widget.id}
            onDelete={onDeleteWidget}
          />
        </div>
      ))}
    </div>
  );
}
