const W = 640;
const H = 360;
const LEFT = 56;
const RIGHT = 24;
const TOP = 24;
const BOTTOM = 56;

export default function TrendChart({
  points,
  low,
  high,
}) {
  const values = points.map((p) => p.value);

  const min = Math.min(...values, low);
  const max = Math.max(...values, high);
  const pad = (max - min || 1) * 0.15;

  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;

  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;

  const x = (i) =>
    LEFT +
    (i * plotW) /
      Math.max(1, points.length - 1);

  const y = (v) =>
    TOP +
    ((yMax - v) / (yMax - yMin)) * plotH;

  const ticks = [0, 1, 2, 3].map(
    (i) => yMin + ((yMax - yMin) * i) / 3
  );

  const line = points
    .map((p, i) => x(i) + "," + y(p.value))
    .join(" ");

  return (
    <svg
      className="hs-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Trend chart"
    >
      {/* General reference range */}
      <rect
        className="hs-band"
        x={LEFT}
        y={y(high)}
        width={plotW}
        height={y(low) - y(high)}
      />

      {ticks.map((t) => (
        <g key={t}>
          <line
            className="hs-grid"
            x1={LEFT}
            x2={W - RIGHT}
            y1={y(t)}
            y2={y(t)}
          />

          <text
            className="hs-tick"
            x={LEFT - 8}
            y={y(t) + 4}
            textAnchor="end"
          >
            {Number(t.toFixed(1))}
          </text>
        </g>
      ))}

      <line
        className="hs-axis"
        x1={LEFT}
        x2={LEFT}
        y1={TOP}
        y2={H - BOTTOM}
      />

      <line
        className="hs-axis"
        x1={LEFT}
        x2={W - RIGHT}
        y1={H - BOTTOM}
        y2={H - BOTTOM}
      />

      <polyline
        className="hs-line"
        points={line}
      />

      {points.map((p, i) => {
        const ok =
          p.value >= low && p.value <= high;

        return (
          <g key={p.id ?? i}>
            <circle
              className={
                ok
                  ? "hs-dot hs-dot-ok"
                  : "hs-dot hs-dot-bad"
              }
              cx={x(i)}
              cy={y(p.value)}
              r="7"
            >
              <title>
                {p.label}: {p.value}
              </title>
            </circle>

            <text
              className="hs-tick"
              x={x(i)}
              y={H - BOTTOM + 24}
              textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
