import { Link } from "react-router-dom";
import { useMeta } from "./useMeta";

export const POSTS = [
  {
    slug: "how-wholesale-electricity-prices-are-set",
    title: "How wholesale electricity prices are actually set",
    date: "2026-08-11",
    excerpt: "The number on your bill is downstream of a much faster, more dynamic market. Here's how wholesale electricity pricing actually works.",
  },
];

export default function Blog() {
  useMeta("Blog — GridHub", "Explainers on how electricity markets work, from the GridHub team.");
  return (
    <div className="developers">
      <h1>Blog</h1>
      <section className="dev-section">
        {POSTS.map((p) => (
          <div key={p.slug} className="blog-list-item">
            <p className="blog-list-date mono">{p.date}</p>
            <h2><Link to={"/blog/" + p.slug}>{p.title}</Link></h2>
            <p>{p.excerpt}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
