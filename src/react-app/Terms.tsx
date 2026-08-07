export default function Terms() {
  return (
    <div className="developers">
      <h1>Terms of service</h1>
      <p className="developers-sub">Last updated: {new Date().toLocaleDateString()}</p>
      <section className="dev-section">
        <p>
          GridHub provides electricity market data on an "as is" basis, sourced from public
          grid operators and market data providers (EIA, ENTSO-E, NESO, Elexon, AEMO). Data may
          be delayed, incomplete, or inaccurate; do not rely on it for safety-critical or
          time-critical decisions without independent verification.
        </p>
        <p>
          Paid API access is billed per call in USDC on Base via the x402 protocol. Payments are
          final once settled on-chain and are non-refundable.
        </p>
        <p>
          This page will be expanded with full terms shortly. Continued use of the API or site
          constitutes acceptance of these terms as they are updated.
        </p>
      </section>
    </div>
  );
}
