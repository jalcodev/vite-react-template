import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ZONE_NAMES } from "./GridMap";

type Metric = { value: number; unit: string; ts: number; resolution: string };
type ZoneSnapshot = { metrics: Record<string, Metric> };
type MapSnapshot = { generated: number; zones: Record<string, ZoneSnapshot> };

function formatValue(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(2);
}
function formatMW(v: number): string {
  return Math.round(v).toLocaleString();
}
function regionOf(id: string): string {
  if (id.startsWith("US-")) return "United States";
  if (id.startsWith("AU-")) return "Australia";
  if (id === "GB") return "Great Britain";
  return "Europe";
}
function minutesAgo(ts: number): string {
  const mins = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} min ago`;
}
function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function topGenerationFuel(metrics: Record<string, Metric>): { fuel: string; metric: Metric } | null {
  let best: { fuel: string; metric: Metric } | null = null;
  for (const [key, m] of Object.entries(metrics)) {
    if (!key.startsWith("generation:") || m.unit !== "MW") continue;
    if (!best || m.value > best.metric.value) best = { fuel: key.replace("generation:", ""), metric: m };
  }
  return best;
}
function detectBadges(metrics: Record<string, Metric>): string[] {
  const keys = Object.keys(metrics);
  const badges: string[] = [];
  if (keys.some((k) => k.startsWith("interchange"))) badges.push("Interconnectors");
  if (keys.some((k) => k.startsWith("capacity:"))) badges.push("Capacity");
  if (keys.some((k) => k.startsWith("generation:"))) badges.push("Generation mix");
  if (metrics.carbon_intensity) badges.push("Carbon intensity");
  return badges;
}

const REGION_ORDER = ["United States", "Great Britain", "Europe", "Australia"];

export default function ZoneGrid({ filter = "" }: { filter?: string }) {
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

  const grouped: Record<string, [string, ZoneSnapshot][]> = {};
  if (snapshot) {
    const q = filter.trim().toLowerCase();
    for (const entry of Object.entries(snapshot.zones)) {
      const [id] = entry;
      const name = ZONE_NAMES[id] ?? id;
      if (q && !id.toLowerCase().includes(q) && !name.toLowerCase().includes(q)) continue;
      const region = regionOf(id);
      (grouped[region] ??= []).push(entry);
    }
    for (const region in grouped) {
      grouped[region].sort((a, b) => a[0].localeCompare(b[0]));
    }
  }

  const anyResults = Object.values(grouped).some((v) => v.length > 0);

  return (
    <div>
      {!snapshot && !error && <p className="home-loading">Loading live data&hellip;</p>}
      {error && <p className="home-loading">Live data temporarily unavailable</p>}
      {snapshot && !anyResults && <p className="home-loading">No zones match "{filter}"</p>}

      {REGION_ORDER.filter((r) => grouped[r]?.length).map((region) => (
        <div className="zone-region" key={region}>
          <h2 className="zone-region-title">{region}</h2>
          <div className="zone-grid">
            {grouped[region].map(([id, z]) => {
              const price = z.metrics.price;
              const demand = z.metrics.demand;
              const topFuel = !price ? topGenerationFuel(z.metrics) : null;
              const badges = detectBadges(z.metrics);

              const primary = price ?? demand;
              const primaryLabel = price ? "Price" : "Demand";
              const secondary = price ? demand : topFuel?.metric;
              const secondaryLabel = price ? "Demand" : topFuel ? titleCase(topFuel.fuel) : null;

              return (
                <Link to={`/zones/${id}`} className="zone-card" key={id}>
                  <span className="corner tl" />
                  <span className="corner tr" />
                  <span className="corner bl" />
                  <span className="corner br" />
                  <p className="zone-card-name">{ZONE_NAMES[id] ?? id}</p>
                  <p className="zone-card-code mono">{id}</p>

                  {primary ? (
                    <div className="zone-card-stat">
                      <span className="zone-card-stat-label">{primaryLabel}</span>
                      <span className="zone-card-stat-value mono">
                        {primary.unit === "MW" ? formatMW(primary.value) : formatValue(primary.value)}{" "}
                        <span className="zone-card-unit">{primary.unit}</span>
                      </span>
                    </div>
                  ) : (
                    <p className="zone-card-value zone-card-pending mono">No data yet</p>
                  )}

                  {secondary && secondaryLabel && (
                    <div className="zone-card-stat">
                      <span className="zone-card-stat-label">{secondaryLabel}</span>
                      <span className="zone-card-stat-value mono">
                        {secondary.unit === "MW" ? formatMW(secondary.value) : formatValue(secondary.value)}{" "}
                        <span className="zone-card-unit">{secondary.unit}</span>
                      </span>
                    </div>
                  )}

                  {badges.length > 0 && (
                    <div className="zone-card-badges">
                      {badges.map((b) => (
                        <span className="badge" key={b}>{b}</span>
                      ))}
                    </div>
                  )}

                  {primary && <p className="zone-card-fresh">Updated {minutesAgo(primary.ts)}</p>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
