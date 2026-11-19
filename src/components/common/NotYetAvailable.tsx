import React from "react";

/**
 * The honest empty state for a surface whose backend does not exist yet (GA-030 T0.4 containment).
 * It never shows a number, a name or a status. Tests look for `data-testid="not-yet-available"`.
 */
export function NotYetAvailable({
  feature,
  detail = "No live data source is connected, so nothing is shown.",
  className = "",
}: {
  feature: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div
      data-testid="not-yet-available"
      className={`rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-400 ${className}`}
    >
      <p className="text-sm font-semibold text-slate-100">{feature}: not yet available</p>
      <p className="mt-1 text-xs">{detail}</p>
    </div>
  );
}
