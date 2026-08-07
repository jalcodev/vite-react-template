import { Link } from "react-router-dom";
import PayWidget from "./PayWidget";

const PAID_ENDPOINTS = [
  { path: "/v1/latest/{zone}", price: "$0.001", desc: "Most recent snapshot for one zone" },
  { path: "/v1/map/snapshot", price: "$0.002", desc: "Full current-state snapshot, every zone" },
  { path: "/v1/demand/{zone}", price: "$0.01", desc: "Historical demand time series" },
  { path: "/v1/generation/{zone}", price: "$0.01", desc: "Historical generation by fuel type" },
  { path: "/v1/price/{zone}", price: "$0.01", desc: "Historical wholesale price time series" },
  { path: "/v1/carbon-intensity/{zone}", price: "$0.01", desc: "Historical carbon intensity" },
  { path: "/v1/interchange/{zone}", price: "$0.01", desc: "Historical interconnector flows" },
  { path: "/v1/capacity/{zone}", price: "$0.01", desc: "Installed capacity by fuel type" },
];

const FAQ = [
  {
    q: "Do I need to sign up?",
    a: "No. Paying per call over x402 requires no account, no email, no API key issuance. The payment itself is the authentication.",
  },
  {
    q: "What do I need to pay?",
    a: "A wallet holding USDC on Base. Each call costs a fraction of a cent to one cent — there's no minimum spend.",
  },
  {
    q: "Is there a subscription?",
    a: "No. Every price on this page is per call, not per month. Use it once or a million times — same price each time.",
  },
  {
    q: "I don't have a crypto wallet — can I still use this?",
    a: "A simple pay-with-wallet flow for one-off purchases is coming soon to this page. In the meantime, if you're a known integration partner, contact us about a free-tier key.",
  },
  {
    q: "Can agents pay automatically?",
    a: "Yes — this is exactly what x402 is built for. An agent that gets a 402 response can sign and retry the request programmatically with no human involved. See the Developers page for the technical flow.",
  },
];

export default function Pricing() {
  return (
    <div className="developers">
      <h1>Pricing</h1>
      <p className="developers-sub">
        No signup, no subscription, no minimum spend. Pay per call in USDC on Base — for
        agents automatically, or for people directly.
      </p>

      <section className="dev-section">
        <h2>Per-call pricing</h2>
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
        <p className="pricing-note">
          Five metadata and geo endpoints are always free — see the{" "}
          <Link to="/developers">Developers page</Link> for the full list.
        </p>
      </section>

      <section className="dev-section">
        <div className="quickstart-card pricing-try-card">
          <span className="corner tl" /><span className="corner tr" />
          <span className="corner bl" /><span className="corner br" />
          <p className="quickstart-label">Try it live</p>
          <p>
            Connect a wallet holding USDC on Base and buy a single call's worth of data right
            here — no signup, no separate tooling.
          </p>
          <PayWidget />
        </div>
      </section>

      <section className="dev-section">
        <h2>Frequently asked</h2>
        <div className="faq-list">
          {FAQ.map((item) => (
            <div className="faq-item" key={item.q}>
              <p className="faq-q">{item.q}</p>
              <p className="faq-a">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="zone-detail-cta">
        <h2>Ready to build?</h2>
        <p>Full API reference, code samples, and the x402 payment flow explained.</p>
        <div className="hero-actions">
          <Link to="/developers" className="cta-button">View API docs</Link>
          <Link to="/" className="cta-secondary-light">Browse live zones</Link>
        </div>
      </div>
    </div>
  );
}
