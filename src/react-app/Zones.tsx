import { useState } from "react";
import ZoneGrid from "./ZoneGrid";

export default function Zones() {
  const [query, setQuery] = useState("");

  return (
    <div className="home">
      <h1>All zones</h1>
      <p className="developers-sub">
        25 grids across the US, UK, Australia, and Europe — live demand, price, and generation.
      </p>
      <input
        type="text"
        placeholder="Search by zone name or code…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="zones-search"
      />
      <ZoneGrid filter={query} />
    </div>
  );
}
