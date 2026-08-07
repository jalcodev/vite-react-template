import { useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import GridMap from "./GridMap";
import ZoneDetail from "./ZoneDetail";
import ComingSoon from "./ComingSoon";
import Developers from "./Developers";
import Pricing from "./Pricing";
import Zones from "./Zones";
import Rankings from "./Rankings";
import Privacy from "./Privacy";
import Terms from "./Terms";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <Link to="/" className="wordmark">GridHub</Link>
        <nav className="sidebar-nav">
          <NavLink to="/map" className={navClass}>Map</NavLink>
          <NavLink to="/zones" className={navClass}>Zones</NavLink>
          <NavLink to="/rankings" className={navClass}>Rankings</NavLink>
          <NavLink to="/pricing" className={navClass}>Pricing</NavLink>
          <NavLink to="/developers" className={navClass}>Developers</NavLink>
        </nav>
        <div className="sidebar-spacer" />
        <Link to="/developers" className="sidebar-cta">Get API access</Link>
        <div className="ad-slot" aria-label="Advertisement">
          <span className="ad-label">Advertisement</span>
        </div>
      </aside>

      <div className="app-main">
        <div className="top-bar">
          <div className="top-bar-left">
            <button
              className="sidebar-toggle"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
            <p className="top-bar-tagline">
              Live electricity prices, demand, and generation across 25 grids
            </p>
          </div>
          <Link to="/pricing" className="top-bar-cta">API access from $0.001/call</Link>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<GridMap />} />
            <Route path="/zones/:id" element={<ZoneDetail />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<ComingSoon title="Not found" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
