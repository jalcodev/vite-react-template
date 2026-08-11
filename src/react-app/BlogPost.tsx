import { useParams, Link } from "react-router-dom";
import { useMeta } from "./useMeta";
import { POSTS } from "./Blog";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = POSTS.find((p) => p.slug === slug);

  useMeta(
    post ? post.title + " — GridHub" : "Post not found — GridHub",
    post ? post.excerpt : "This post could not be found."
  );

  if (!post) {
    return (
      <div className="coming-soon">
        <h1>Post not found</h1>
        <Link to="/blog" className="cta-secondary-light">← Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="developers">
      <p className="zone-detail-breadcrumb"><Link to="/blog">Blog</Link> / <span>{post.title}</span></p>
      <h1>{post.title}</h1>
      <p className="developers-sub mono">{post.date}</p>

      <section className="dev-section blog-body">
        <p>
          Most people only ever see one number for electricity: the price on their bill. But
          that number is downstream of a much faster, much more dynamic market — one where
          prices can shift by the hour, sometimes by the minute, driven by mechanics most
          people never see.
        </p>

        <h2>The auction that runs every day</h2>
        <p>
          In most modern electricity markets, generators submit bids the day before: how much
          power they can produce, and at what price they're willing to sell it. A grid operator
          or market operator stacks these bids from cheapest to most expensive — this is called
          the "merit order." Demand for that hour is then matched against the stack, starting
          from the cheapest source, moving up until enough supply is committed to meet it.
        </p>

        <h2>Why the price isn't an average</h2>
        <p>
          Here's the part that surprises most people: in most markets, every generator that
          clears the auction gets paid the price of the <em>most expensive</em> unit needed to
          meet demand — not their own bid. This is called marginal pricing. A wind farm bidding
          near zero and a gas plant bidding much higher can both get paid the same, higher,
          "clearing price," because the gas plant was the last unit needed to keep the lights on.
        </p>
        <p>
          This is deliberate, not a quirk: it gives every generator, including the cheapest ones,
          an incentive to build more capacity, and it means the price always reflects the true
          marginal cost of meeting demand at that moment.
        </p>

        <h2>Why prices swing so much within a single day</h2>
        <p>
          Electricity can't be stored cheaply at scale, so supply and demand have to balance in
          real time. A few things push the clearing price around constantly:
        </p>
        <ul>
          <li>
            <strong>Demand shape.</strong> Everyone waking up, cooking dinner, or running air
            conditioning at the same time pulls demand — and price — up sharply during peak hours.
          </li>
          <li>
            <strong>Weather-dependent generation.</strong> When wind or solar output is high, a
            lot of near-zero-cost supply enters the stack, often pushing the clearing price down.
            When it drops, more expensive generation has to fill the gap.
          </li>
          <li>
            <strong>Interconnector flows.</strong> Neighboring grids trade power across borders
            when it's cheaper to import than to run local generation — this is part of why prices
            in connected markets tend to move together, not independently.
          </li>
        </ul>

        <h2>Why the same hour costs different amounts in different countries</h2>
        <p>
          Every grid has a different generation mix, different demand patterns, and different
          interconnection to its neighbors, so the same hour of the day can clear at very
          different prices in, say, Norway versus Texas. A grid with abundant hydro or wind
          tends to see lower and steadier prices; one leaning more on gas, or facing a demand
          spike with limited imports, can see sharp price jumps.
        </p>

        <h2>Seeing it for yourself</h2>
        <p>
          This is exactly the kind of thing that's easier to understand by watching it happen
          than by reading about it. GridHub tracks the live wholesale price, demand, and
          generation mix across 25 grids in the US, UK, Australia, and Europe — you can watch
          the clearing price move in real time, compare how differently two grids respond to the
          same hour of the day, and see which fuel sources are actually on the margin right now.
        </p>
        <div className="hero-actions">
          <Link to="/" className="cta-button">Browse live zones</Link>
          <Link to="/developers" className="cta-secondary-light">Read the API docs</Link>
        </div>
      </section>
    </div>
  );
}
