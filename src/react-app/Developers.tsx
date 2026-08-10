import { Link } from "react-router-dom";
import { useMeta } from "./useMeta";

const FREE_ENDPOINTS = [
  { path: "/v1/zones", desc: "Coverage list, licences, attribution" },
  { path: "/v1/status", desc: "Ingestion freshness per source/zone" },
  { path: "/v1/geo/zones", desc: "Zone boundary polygons (GeoJSON)" },
  { path: "/v1/geo/interconnectors", desc: "Interconnector lines with from/to zone ids" },
  { path: "/v1/geo/plants", desc: "Power plants ≥250 MW (GeoJSON)" },
];

const PAID_ENDPOINTS = [
  { path: "/v1/map/snapshot", price: "$0.002", desc: "Full current-state snapshot across every zone" },
  { path: "/v1/latest/{zone}", price: "$0.001", desc: "Most recent snapshot for one zone" },
  { path: "/v1/demand/{zone}", price: "$0.01", desc: "Historical demand (MW) time series" },
  { path: "/v1/generation/{zone}", price: "$0.01", desc: "Historical generation by fuel type" },
  { path: "/v1/price/{zone}", price: "$0.01", desc: "Historical wholesale price time series" },
  { path: "/v1/carbon-intensity/{zone}", price: "$0.01", desc: "Historical carbon intensity" },
  { path: "/v1/interchange/{zone}", price: "$0.01", desc: "Historical interconnector flows" },
  { path: "/v1/capacity/{zone}", price: "$0.01", desc: "Installed capacity by fuel type (EU zones)" },
];

const BASE = "https://api.grid-hub.app";

const BADGES = [
  { id: "4aa7a33d-f37", label: "Map snapshot" },
  { id: "4248243d-e42", label: "Latest state" },
  { id: "16c9f416-a24", label: "Demand history" },
  { id: "7ba3dc37-ebc", label: "Generation history" },
  { id: "e49d1275-d11", label: "Price history" },
  { id: "0381874f-113", label: "Carbon intensity" },
  { id: "1b0875a3-956", label: "Interconnector flows" },
  { id: "58fabd0a-0d5", label: "Capacity" },
];

export default function Developers() {
  useMeta("API documentation — GridHub", "Quickstart, endpoint reference, and x402 payment flow for the GridHub electricity data API.");
  return (
    <div className="developers">
      <h1>API documentation</h1>
      <p className="developers-sub">
        Real-time and historical electricity data across 25 zones in the US, UK, Australia, and
        Europe. No account required — pay per call as an agent via x402, or use a free partner
        key for known integrations.
      </p>

      <section className="dev-section">
        <h2>Quickstart</h2>
        <div className="quickstart-grid">
          <div className="quickstart-card">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
            <p className="quickstart-label">For agents — pay per call</p>
            <p>
              Requests without payment return <code className="mono">402</code> with the price
              and payment details. Sign and retry with an{" "}
              <code className="mono">X-PAYMENT</code> header.
            </p>
            <CodeBlock>{`curl ${BASE}/v1/latest/GB
# → 402, payment requirements in the response body`}</CodeBlock>
          </div>
          <div className="quickstart-card">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
            <p className="quickstart-label">For partners — free tier</p>
            <p>
              Known partner integrations use a bearer key instead of payment, with a daily quota.
            </p>
            <CodeBlock>{`curl -H "Authorization: Bearer YOUR_KEY" \\
  ${BASE}/v1/latest/GB`}</CodeBlock>
          </div>
        </div>
      </section>

      <section className="dev-section">
        <h2>x402 payment flow</h2>
        <p>
          Every paid endpoint speaks the{" "}
          <a href="https://www.x402.org" target="_blank" rel="noreferrer">x402 protocol</a>{" "}
          — HTTP-native, on-chain micropayments over USDC on Base. No signup, no API key
          issuance step; the payment itself is the authentication.
        </p>
        <ol className="dev-steps">
          <li>Request any paid endpoint with no credentials.</li>
          <li>Receive <code className="mono">402</code> with price, asset, and payment address.</li>
          <li>Sign an EIP-3009 transfer authorization with your wallet.</li>
          <li>Retry the same request with an <code className="mono">X-PAYMENT</code> header.</li>
          <li>Get your data back, plus a settlement receipt.</li>
        </ol>
        <p>
          Machine-readable discovery manifest, listing every paid resource with its schema:{" "}
          <a href={`${BASE}/.well-known/x402.json`} target="_blank" rel="noreferrer" className="mono">
            /.well-known/x402.json
          </a>
        </p>
      </section>

      <section className="dev-section">
        <h2>Verified listings</h2>
        <p>Independently probed and verified by nohumans.directory:</p>
        <div className="badge-row">
          {BADGES.map((b) => (
            <a key={b.id} href={"https://nohumans.directory/l/" + b.id} target="_blank" rel="noreferrer" className="badge-link"><img src={"https://nohumans.directory/badge/" + b.id + ".svg"} alt={b.label + " - verified"} /></a>
          ))}
        </div>
      </section>

      <section className="dev-section">
        <h2>Free endpoints</h2>
        <table className="endpoint-table">
          <thead>
            <tr><th>Endpoint</th><th>Description</th></tr>
          </thead>
          <tbody>
            {FREE_ENDPOINTS.map((e) => (
              <tr key={e.path}>
                <td className="mono">{e.path}</td>
                <td>{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="dev-section">
        <h2>Paid endpoints</h2>
        <table className="endpoint-table">
          <thead>
            <tr><th>Endpoint</th><th>Price</th><th>Description</th></tr>
          </thead>
          <tbody>
            {PAID_ENDPOINTS.map((e) => (
              <tr key={e.path}>
                <td className="mono">{e.path}</td>
                <td className="mono endpoint-price">{e.price}</td>
                <td>{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="dev-section">
        <h2>Example response</h2>
        <p>GET <code className="mono">{BASE}/v1/latest/GB</code></p>
        <CodeBlock>{`{
  "zone": "GB",
  "metrics": {
    "price": { "value": 112.85, "unit": "GBP/MWh", "ts": 1786018200, "resolution": "30m" },
    "demand": { "value": 22672, "unit": "MW", "ts": 1786018200, "resolution": "30m" },
    "carbon_intensity": { "value": 100, "unit": "gCO2/kWh", "ts": 1786018200, "resolution": "30m" }
  },
  "attribution": "Supported by National Energy SO Open Data",
  "license": "NESO-Open-Licence"
}`}</CodeBlock>
      </section>

      <div className="zone-detail-cta">
        <h2>Ready to get started?</h2>
        <p>See full pricing, or explore the data first through the live zone pages.</p>
        <div className="hero-actions">
          <Link to="/pricing" className="cta-button">View pricing</Link>
          <Link to="/" className="cta-secondary-light">Browse live zones</Link>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="code-block mono">
      <code>{children}</code>
    </pre>
  );
}
