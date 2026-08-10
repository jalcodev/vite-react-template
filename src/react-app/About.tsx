import { Link } from "react-router-dom";
import { useMeta } from "./useMeta";

export default function About() {
  useMeta(
    "About — GridHub",
    "GridHub is a live electricity market data API and discovery layer, built for people and autonomous agents alike."
  );
  return (
    <div className="developers">
      <h1>About GridHub</h1>
      <section className="dev-section">
        <p>
          GridHub tracks real-time and historical electricity data — demand, generation mix,
          wholesale prices, carbon intensity, and cross-border interconnector flows — across 25
          grids spanning the US, UK, Australia, and continental Europe.
        </p>
        <p>
          The underlying API is built on x402, an HTTP-native micropayment protocol, so both
          people and autonomous agents can access data without signing up for an account.
          No subscriptions, no API key issuance step — pay per call, or use a free partner key
          for known integrations.
        </p>
        <p>
          This site is the discovery layer for that API: browse the data live, then buy
          programmatic access to whatever you need.
        </p>
      </section>
      <div className="zone-detail-cta">
        <h2>Explore the data</h2>
        <div className="hero-actions">
          <Link to="/" className="cta-button">Browse live zones</Link>
          <Link to="/developers" className="cta-secondary-light">Read the docs</Link>
        </div>
      </div>
    </div>
  );
}
