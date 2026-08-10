import { useEffect, useState } from "react";
import { ZONE_NAMES } from "./GridMap";
import ZoneGrid from "./ZoneGrid";
import { useMeta } from "./useMeta";

type Metric = { value: number; unit: string; ts: number; resolution: string };
type ZoneSnapshot = { metrics: Record<string, Metric> };
type MapSnapshot = { generated: number; zones: Record<string, ZoneSnapshot> };

function formatValue(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(2);
}

export default function Home() {
  useMeta(
    "GridHub — live electricity market data",
    "Live wholesale prices, demand, and generation mix across 25 grids in the US, UK, Australia, and Europe."
  );
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

  const zonesWithPrice = snapshot
    ? Object.entries(snapshot.zones).filter(([, z]) => z.metrics.price)
    : [];
  const mostExpensive = zonesWithPrice.length
    ? zonesWithPrice.reduce((a, b) => (a[1].metrics.price!.value > b[1].metrics.price!.value ? a : b))
    : null;
  const cheapest = zonesWithPrice.length
    ? zonesWithPrice.reduce((a, b) => (a[1].metrics.price!.value < b[1].metrics.price!.value ? a : b))
    : null;
  const zonesWithDemand = snapshot
    ? Object.entries(snapshot.zones).filter(([, z]) => z.metrics.demand)
    : [];
  const highestDemand = zonesWithDemand.length
    ? zonesWithDemand.reduce((a, b) => (a[1].metrics.demand!.value > b[1].metrics.demand!.value ? a : b))
    : null;

  return (
    <div className="home">
      <div className="highlight-row">
        <HighlightCard
          label="Highest price right now"
          zoneId={mostExpensive?.[0]}
          metric={mostExpensive?.[1].metrics.price}
          error={error}
        />
        <HighlightCard
          label="Lowest price right now"
          zoneId={cheapest?.[0]}
          metric={cheapest?.[1].metrics.price}
          error={error}
        />
        <HighlightCard
          label="Highest demand right now"
          zoneId={highestDemand?.[0]}
          metric={highestDemand?.[1].metrics.demand}
          error={error}
        />
      </div>

      <ZoneGrid />
    </div>
  );
}

function HighlightCard({
  label,
  zoneId,
  metric,
  error,
}: {
  label: string;
  zoneId?: string;
  metric?: Metric;
  error: boolean;
}) {
  return (
    <div className="highlight-card">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <p className="highlight-label">{label}</p>
      {error ? (
        <p className="highlight-error">Data temporarily unavailable</p>
      ) : zoneId && metric ? (
        <>
          <p className="highlight-zone">{ZONE_NAMES[zoneId] ?? zoneId}</p>
          <p className="highlight-value mono">
            {formatValue(metric.value)} <span className="zone-card-unit">{metric.unit}</span>
          </p>
        </>
      ) : (
        <p className="highlight-value mono">···</p>
      )}
    </div>
  );
}
