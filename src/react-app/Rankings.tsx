import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ZONE_NAMES } from "./GridMap";
import { useMeta } from "./useMeta";

type Metric = { value: number; unit: string; ts: number; resolution: string };
type ZoneSnapshot = { metrics: Record<string, Metric> };
type MapSnapshot = { zones: Record<string, ZoneSnapshot> };

function formatValue(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(2);
}
function formatMW(v: number): string {
  return Math.round(v).toLocaleString();
}

export default function Rankings() {
  useMeta("Rankings — GridHub", "Live leaderboards of electricity price and demand across every grid GridHub tracks.");
  const [snapshot, setSnapshot] = useState<MapSnapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/gridhub/v1/map/snapshot")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(setSnapshot)
      .catch(() => setError(true));
  }, []);

  const priceRanked = snapshot
    ? Object.entries(snapshot.zones)
        .filter(([, z]) => z.metrics.price)
        .sort((a, b) => b[1].metrics.price!.value - a[1].metrics.price!.value)
    : [];

  const demandRanked = snapshot
    ? Object.entries(snapshot.zones)
        .filter(([, z]) => z.metrics.demand)
        .sort((a, b) => b[1].metrics.demand!.value - a[1].metrics.demand!.value)
    : [];

  return (
    <div className="developers">
      <h1>Rankings</h1>
      <p className="developers-sub">
        Live leaderboards across every zone we track, highest to lowest, updated in real time.
      </p>

      {!snapshot && !error && <p className="home-loading">Loading live data&hellip;</p>}
      {error && <p className="home-loading">Live data temporarily unavailable</p>}

      {priceRanked.length > 0 && (
        <section className="dev-section">
          <h2>Wholesale price, highest to lowest</h2>
          <RankingTable entries={priceRanked} formatter={formatValue} />
        </section>
      )}

      {demandRanked.length > 0 && (
        <section className="dev-section">
          <h2>Demand, highest to lowest</h2>
          <RankingTable entries={demandRanked} formatter={formatMW} unitOverride="MW" />
        </section>
      )}
    </div>
  );
}

function RankingTable({
  entries,
  formatter,
  unitOverride,
}: {
  entries: [string, ZoneSnapshot][];
  formatter: (v: number) => string;
  unitOverride?: string;
}) {
  return (
    <table className="endpoint-table">
      <thead>
        <tr><th>#</th><th>Zone</th><th>Value</th></tr>
      </thead>
      <tbody>
        {entries.map(([id, z], i) => {
          const metric = z.metrics.price ?? z.metrics.demand!;
          return (
            <tr key={id}>
              <td className="mono">{i + 1}</td>
              <td>
                <Link to={`/zones/${id}`}>{ZONE_NAMES[id] ?? id}</Link>{" "}
                <span className="zone-card-code mono">{id}</span>
              </td>
              <td className="mono endpoint-price">
                {formatter(metric.value)} {unitOverride ?? metric.unit}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
