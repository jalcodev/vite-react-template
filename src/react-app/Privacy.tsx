export default function Privacy() {
  return (
    <div className="developers">
      <h1>Privacy policy</h1>
      <p className="developers-sub">Last updated: {new Date().toLocaleDateString()}</p>
      <section className="dev-section">
        <p>
          GridHub does not require an account to use this site or API. We do not collect
          personal information beyond what your browser or wallet sends automatically
          (e.g. IP address, standard request logs).
        </p>
        <p>
          Payments are made directly on-chain via the x402 protocol on Base. We do not store
          your wallet's private keys and never have access to them. Transaction data is public
          on the blockchain by nature of how it works.
        </p>
        <p>
          This page will be expanded with full details shortly. Questions: contact us via the
          channels listed on the Developers page.
        </p>
      </section>
    </div>
  );
}
