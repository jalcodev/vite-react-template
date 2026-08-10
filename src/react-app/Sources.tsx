import { useMeta } from "./useMeta";

const SOURCES = [
  { name: "EIA", full: "U.S. Energy Information Administration", coverage: "7 US grid operators (demand, generation)", license: "Public domain" },
  { name: "ENTSO-E", full: "European Network of Transmission System Operators", coverage: "12 European bidding zones (demand, price, interchange, capacity)", license: "CC-BY-4.0" },
  { name: "NESO", full: "National Energy System Operator", coverage: "Great Britain (carbon intensity, generation mix)", license: "NESO Open Licence" },
  { name: "Elexon", full: "Elexon Insights", coverage: "Great Britain (price, demand)", license: "Open, attribution required" },
  { name: "AEMO", full: "Australian Energy Market Operator", coverage: "5 Australian regions (price, demand, interchange)", license: "AEMO attribution required" },
];

export default function Sources() {
  useMeta(
    "Data sources & methodology — GridHub",
    "Where GridHub's electricity data comes from: EIA, ENTSO-E, NESO, Elexon, and AEMO, with licensing details."
  );
  return (
    <div className="developers">
      <h1>Data sources & methodology</h1>
      <p className="developers-sub">
        Every number on this site is sourced directly from the grid operators and market data
        providers below — nothing modeled or estimated unless explicitly noted.
      </p>
      <section className="dev-section">
        <table className="endpoint-table">
          <thead>
            <tr><th>Source</th><th>Coverage</th><th>License</th></tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.name}>
                <td><strong>{s.name}</strong><br /><span className="zone-card-code">{s.full}</span></td>
                <td>{s.coverage}</td>
                <td className="mono">{s.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="dev-section">
        <h2>Update frequency</h2>
        <p>
          Australian and GB data update every 5 minutes, European data every 15 minutes, and US
          data every 30 minutes — matching each source's own publishing cadence. Installed
          capacity figures are annual and refresh once per year as operators publish updates.
        </p>
      </section>
    </div>
  );
}
