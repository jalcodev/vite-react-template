import { useMeta } from "./useMeta";

export default function Contact() {
  useMeta("Contact — GridHub", "Get in touch about GridHub API access, partnerships, or support.");
  return (
    <div className="developers">
      <h1>Contact</h1>
      <section className="dev-section">
        <p>
          For partner-key requests, enterprise inquiries, or anything else, reach out via the
          channels linked from our directory listing below, or through the API's own discovery
          manifest.
        </p>
        <p>
          <a href="https://nohumans.directory" target="_blank" rel="noreferrer">Directory listing</a>
        </p>
        <p>
          <a href="https://api.grid-hub.app/.well-known/x402.json" target="_blank" rel="noreferrer" className="mono">/.well-known/x402.json</a>
        </p>
      </section>
    </div>
  );
}
