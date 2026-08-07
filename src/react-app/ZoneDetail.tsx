import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ZONE_NAMES } from "./GridMap";

type Metric = { value: number; unit: string; ts: number; resolution: string };
type ZoneLatest = {
  zone: string;
  metrics: Record<string, Metric>;
  attribution: string;
  license: string;
  updated: number;
};
type HistoryPoint = { ts: number; value: number; unit: string; fuel?: string };
type HistoryResponse = { count: number; data: HistoryPoint[] };

type Range = "24h" | "7d" | "30d";
const RANGE_SECONDS: Record<Range, number> = { "24h": 86_400, "7d": 7 * 86_400, "30d": 30 * 86_400 };

function formatValue(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(2);
}
function formatMW(v: number): string {
  return Math.round(v).toLocaleString();
}
function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Group generation:* or capacity:* keys into a sorted (desc) fuel breakdown. */
function fuelBreakdown(metrics: Record<string, Metric>, prefix: string): { fuel: string; metric: Metric }[] {
  return Object.entries(metrics)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, m]) => ({ fuel: titleCase(k.replace(prefix, "")), metric: m }))
    .sort((a, b) => b.metric.value - a.metric.value);
}

export default function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const [snapshot, setSnapshot] = useState<ZoneLatest | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [range, setRange] = useState<Range>("24h");
  const [priceHistory, setPriceHistory] = useState<HistoryPoint[]>([]);
  const [demandHistory, setDemandHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    if (!id) return;
    setSnapshot(null);
    setNotFound(false);
    fetch(`/api/gridhub/v1/latest/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(setSnapshot)
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const now = Math.floor(Date.now() / 1000);
    const start = now - RANGE_SECONDS[range];
    Promise.all([
      fetch(`/api/gridhub/v1/price/${id}?start=${start}&end=${now}&limit=3000`)
        .then((r) => (r.ok ? r.json() : null)) as Promise<HistoryResponse | null>,
      fetch(`/api/gridhub/v1/demand/${id}?start=${start}&end=${now}&limit=3000`)
        .then((r) => (r.ok ? r.json() : null)) as Promise<HistoryResponse | null>,
    ]).then(([p, d]) => {
      setPriceHistory(p?.data ?? []);
      setDemandHistory(d?.data ?? []);
    });
  }, [id, range]);

  if (notFound) {
    return (
      <div className="coming-soon">
        <h1>Zone not found</h1>
        <p>We don't have data for "{id}".</p>
        <Link to="/" className="cta-secondary-light">← Back to all zones</Link>
      </div>
    );
  }

  const name = id ? (ZONE_NAMES[id] ?? id) : "";
  const metrics = snapshot?.metrics ?? {};
  const price = metrics.price;
  const demand = metrics.demand;
  const carbonIntensity = metrics.carbon_intensity;
  const generation = fuelBreakdown(metrics, "generation:");
  const capacity = fuelBreakdown(metrics, "capacity:");
  const interconnectors = Object.entries(metrics).filter(([k]) => k.startsWith("interchange"));

  return (
    <div className="zone-detail">
      <p className="zone-detail-breadcrumb">
        <Link to="/">Zones</Link> / <span>{name}</span>
      </p>
      <h1>{name}</h1>
      <p className="zone-detail-code mono">{id}</p>

      <div className="zone-detail-stats">
        {price && <StatBlock label="Price" metric={price} />}
        {demand && <StatBlock label="Demand" metric={demand} formatter={formatMW} />}
        {carbonIntensity && <StatBlock label="Carbon intensity" metric={carbonIntensity} />}
      </div>

      {(priceHistory.length > 0 || demandHistory.length > 0) && (
        <div className="range-toggle">
          {(["24h", "7d", "30d"] as Range[]).map((r) => (
            <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      )}

      {priceHistory.length > 0 && (
        <section className="chart-section">
          <h2>Price history</h2>
          <HistoryChart data={priceHistory} unit={price?.unit ?? ""} color="#c97a3d" />
        </section>
      )}

      {demandHistory.length > 0 && (
        <section className="chart-section">
          <h2>Demand history</h2>
          <HistoryChart data={demandHistory} unit="MW" color="#4c8b6b" />
        </section>
      )}

      {generation.length > 0 && (
        <section className="breakdown-section">
          <h2>Generation mix</h2>
          <BarBreakdown items={generation} />
        </section>
      )}

      {capacity.length > 0 && (
        <section className="breakdown-section">
          <h2>Installed capacity</h2>
          <BarBreakdown items={capacity} />
        </section>
      )}

      {interconnectors.length > 0 && (
        <section className="breakdown-section">
          <h2>Interconnector flows</h2>
          <div className="interconnector-list">
            {interconnectors.map(([key, m]) => {
              const label = key.includes(":to:") ? `To ${key.split(":to:")[1]}` : "Net interchange";
              return (
                <div className="interconnector-row" key={key}>
                  <span>{label}</span>
                  <span className="mono">
                    {m.value >= 0 ? "+" : ""}
                    {formatMW(m.value)} MW
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {snapshot && (
        <p className="zone-detail-attribution">
          {snapshot.attribution} · {snapshot.license}
        </p>
      )}

      <div className="zone-detail-cta">
        <h2>Want this programmatically?</h2>
        <p>Pull this same data by API — pay per call, or as a partner, no signup required.</p>
        <div className="hero-actions">
          <Link to="/developers" className="cta-button">View API docs</Link>
          <Link to="/pricing" className="cta-secondary-light">See pricing</Link>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  metric,
  formatter = formatValue,
}: {
  label: string;
  metric: Metric;
  formatter?: (v: number) => string;
}) {
  return (
    <div className="highlight-card">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <p className="highlight-label">{label}</p>
      <p className="highlight-value mono">
        {formatter(metric.value)} <span className="zone-card-unit">{metric.unit}</span>
      </p>
    </div>
  );
}

function HistoryChart({ data, unit, color }: { data: HistoryPoint[]; unit: string; color: string }) {
  const chartData = data.map((d) => ({ time: d.ts * 1000, value: d.value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t) => new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" })}
          stroke="#8b96a8"
          fontSize={11}
          tick={{ fill: "#8b96a8" }}
        />
        <YAxis
          stroke="#8b96a8"
          fontSize={11}
          tick={{ fill: "#8b96a8" }}
          width={50}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip
          contentStyle={{ background: "#121a2b", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }}
          labelFormatter={(label) => (label != null ? new Date(Number(label)).toLocaleString() : "")}
          formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, ""]}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarBreakdown({ items }: { items: { fuel: string; metric: Metric }[] }) {
  const max = Math.max(...items.map((i) => i.metric.value), 1);
  return (
    <div className="bar-breakdown">
      {items.map(({ fuel, metric }) => (
        <div className="bar-row" key={fuel}>
          <span className="bar-label">{fuel}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(metric.value / max) * 100}%` }} />
          </div>
          <span className="bar-value mono">
            {metric.unit === "MW" ? formatMW(metric.value) : formatValue(metric.value)} {metric.unit}
          </span>
        </div>
      ))}
    </div>
  );
}
