import { cn } from "@/lib/utils";

/**
 * Dependency-free SVG charts for the analytics dashboard. Pure components,
 * brand-styled, responsive (scale with the container), with <title> hover
 * tooltips — no chart library needed (docs/01_BRAND_GUIDE.MD colors).
 */

/* ------------------------------------------------------------------ */
/* Line chart — traffic over time                                      */
/* ------------------------------------------------------------------ */

export function LineChart({
  data,
  height = 200,
  className,
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  className?: string;
}) {
  const W = 600;
  const H = 200;
  const padX = 8;
  const padTop = 12;
  const padBottom = 22;
  const innerH = H - padTop - padBottom;
  const innerW = W - padX * 2;

  const max = Math.max(1, ...data.map((point) => point.value));
  const niceMax = Math.max(1, Math.ceil(max / 4) * 4);
  const points = data.map((point, index) => {
    const x = data.length === 1 ? W / 2 : padX + (index / (data.length - 1)) * innerW;
    const y = padTop + innerH - (point.value / niceMax) * innerH;
    return { x, y, ...point };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${(points.at(-1)?.x ?? W).toFixed(1)},${padTop + innerH} L${(points[0]?.x ?? 0).toFixed(1)},${padTop + innerH} Z`;

  const gridLines = [0.25, 0.5, 0.75].map((fraction) => ({
    y: padTop + innerH - fraction * innerH,
    value: Math.round(niceMax * fraction),
  }));

  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ height }}
        className="w-full"
        role="img"
        aria-label="Traffic over time"
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((line) => (
          <g key={line.y}>
            <line
              x1={padX}
              x2={W - padX}
              y1={line.y}
              y2={line.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text x={W - padX} y={line.y - 4} textAnchor="end" fontSize={9} fill="#9aa3b2">
              {line.value}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#chart-area)" />
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r={3} fill="#05060a" stroke="#3b82f6" strokeWidth={2} />
            {index % labelStep === 0 && (
              <text x={point.x} y={H - 6} textAnchor="middle" fontSize={9} fill="#9aa3b2">
                {point.label}
              </text>
            )}
            <title>{`${point.label}: ${point.value} views`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bar list — rankings (top pages / projects / services)    */
/* ------------------------------------------------------------------ */

export function BarList({
  items,
  format = (value) => String(value),
  className,
}: {
  items: Array<{ label: string; value: number; sublabel?: string }>;
  format?: (value: number) => string;
  className?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return <p className={cn("text-sm text-muted", className)}>No data yet.</p>;
  }

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm text-foreground/85">
              {item.label}
              {item.sublabel && (
                <span className="ml-2 text-xs text-muted">{item.sublabel}</span>
              )}
            </span>
            <span className="shrink-0 text-sm font-medium text-foreground">
              {format(item.value)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Donut chart — share of a total (e.g. traffic sources)               */
/* ------------------------------------------------------------------ */

const DONUT_COLORS = ["#3b82f6", "#8b5cf6", "#22d3ee", "#f472b6", "#f59e0b", "#34d399", "#9aa3b2"];

export function DonutChart({
  segments,
  className,
}: {
  segments: Array<{ label: string; value: number }>;
  className?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) {
    return <p className={cn("text-sm text-muted", className)}>No data yet.</p>;
  }

  const R = 15.915; // circumference ≈ 100

  // Cumulative dash offset for each segment (no render-time mutation).
  const offsets = segments.map((segment) => (segment.value / total) * 100);

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row", className)}>
      <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0 -rotate-90">
        <circle cx="21" cy="21" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {segments.map((segment, index) => {
          const fraction = segment.value / total;
          const dash = fraction * 100;
          const offset = offsets.slice(0, index).reduce((sum, value) => sum + value, 0);
          return (
            <circle
              key={segment.label}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
              strokeWidth="6"
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <ul className="flex flex-col gap-1.5">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-muted">{segment.label}</span>
            <span className="font-medium text-foreground">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
