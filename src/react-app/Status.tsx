import { useEffect, useState } from "react";
import { useMeta } from "./useMeta";

type StatusRow = { source: string; zone: string; last_ok: number; last_error: string };

function minutesAgo(ts: number): string {
  if (!ts) return "never";
  const mins = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function Status() {
  useMeta(
    "System status — GridHub",
    "Live ingestion freshness for every data source and zone GridHub tracks."
  );
  const [rows, setRows] = useState<StatusRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/gridhub/v1/status")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(d.sources))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="developers">
      <h1>System status</h1>
      <p className="developers-sub">
        Live ingestion freshness for every source and zone we track, pulled directly from the API.
      </p>

      {!rows && !error && <p className="home-loading">Loading&hellip;</p>}
      {error && <p className="home-loading">Status temporarily unavailable</p>}

      {rows && (
        <table className="endpoint-table">
          <thead>
            <tr><th>Source</th><th>Zone</th><th>Last update</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.source}-${r.zone}`}>
                <td className="mono">{r.source}</td>
                <td className="mono">{r.zone}</td>
                <td>{minutesAgo(r.last_ok)}</td>
                <td>
                  {r.last_error ? (
                    <span className="status-bad">Error</span>
                  ) : (
                    <span className="status-ok">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
