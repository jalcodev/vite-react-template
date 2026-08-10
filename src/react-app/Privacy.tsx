import { useMeta } from "./useMeta";

export default function Privacy() {
  useMeta("Privacy policy — GridHub", "How GridHub handles data, cookies, and payments.");
  return (
    <div className="developers">
      <h1>Privacy policy</h1>
      <p className="developers-sub">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="dev-section">
        <h2>What we collect</h2>
        <p>
          GridHub does not require an account. We do not collect names, emails, or personal
          profiles. Standard request metadata — IP address, timestamps, request paths — is
          logged automatically by our infrastructure (Cloudflare) for operational and security
          purposes, as is standard for any web service.
        </p>
      </section>

      <section className="dev-section">
        <h2>Payments</h2>
        <p>
          Paid API access is settled on-chain via the x402 protocol on Base. We never receive
          or store your wallet's private keys. Transactions are public on the blockchain by the
          nature of how it works — this is not something GridHub controls or can make private.
        </p>
      </section>

      <section className="dev-section">
        <h2>Cookies and tracking</h2>
        <p>
          This site does not currently set tracking cookies. If affiliate or advertising content
          is added in the future, this policy will be updated in advance, and a cookie-consent
          notice will be added where required by law.
        </p>
      </section>

      <section className="dev-section">
        <h2>Third parties</h2>
        <p>
          We use Cloudflare for hosting and infrastructure, and public blockchain infrastructure
          (Base, and x402 payment facilitators) to process payments. We do not sell data to
          third parties.
        </p>
      </section>

      <section className="dev-section">
        <h2>Contact</h2>
        <p>See the Contact page for how to reach us with questions about this policy.</p>
      </section>
    </div>
  );
}
