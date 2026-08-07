import { Link } from "react-router-dom";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="coming-soon">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
      <Link to="/" className="cta-secondary-light">
        ← Back to home
      </Link>
    </div>
  );
}
