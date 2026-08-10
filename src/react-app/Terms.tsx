import { useMeta } from "./useMeta";

export default function Terms() {
  useMeta("Terms of service — GridHub", "Terms governing use of the GridHub website and API.");
  return (
    <div className="developers">
      <h1>Terms of service</h1>
      <p className="developers-sub">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="dev-section">
        <h2>Data accuracy</h2>
        <p>
          GridHub provides electricity market data on an "as is" basis, sourced from public grid
          operators and market data providers (EIA, ENTSO-E, NESO, Elexon, AEMO). Data may be
          delayed, incomplete, or inaccurate due to upstream source issues. Do not rely on it for
          safety-critical or time-critical decisions without independent verification.
        </p>
      </section>

      <section className="dev-section">
        <h2>Payments</h2>
        <p>
          Paid API access is billed per call in USDC on Base via the x402 protocol. Payments are
          final once settled on-chain and are non-refundable. Prices are listed on the Pricing
          page and may change; the price shown at the time of a request is the price charged.
        </p>
      </section>

      <section className="dev-section">
        <h2>Attribution</h2>
        <p>
          Each upstream data source carries its own license (see the Sources page). If you
          redistribute data obtained through GridHub, you are responsible for complying with
          the relevant source's attribution requirements.
        </p>
      </section>

      <section className="dev-section">
        <h2>Acceptable use</h2>
        <p>
          Don't attempt to circumvent rate limits or payment requirements, and don't use the
          service for unlawful purposes. We reserve the right to block access that abuses the
          free or partner tiers.
        </p>
      </section>

      <section className="dev-section">
        <h2>Changes</h2>
        <p>
          These terms may be updated as the product evolves. Continued use of the API or site
          after changes constitutes acceptance of the updated terms.
        </p>
      </section>
    </div>
  );
}
