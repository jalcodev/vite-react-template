import { lazy, Suspense, useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Zones from "./Zones";
import Rankings from "./Rankings";
import Developers from "./Developers";
import ComingSoon from "./ComingSoon";
import Privacy from "./Privacy";
import Terms from "./Terms";
import About from "./About";
import Contact from "./Contact";
import Status from "./Status";
import Sources from "./Sources";

const GridMap = lazy(() => import("./GridMap"));
const ZoneDetail = lazy(() => import("./ZoneDetail"));
const Pricing = lazy(() => import("./Pricing"));

function PageLoading() {
  return (
    <p className="home-loading" style={{ padding: 24 }}>
      Loading&hellip;
    </p>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Link to="/" className="wordmark">GridHub</Link>
          <button className="sidebar-close" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
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
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<GridMap />} />
              <Route path="/zones/:id" element={<ZoneDetail />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/status" element={<Status />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/blog" element={<ComingSoon title="Blog" />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<ComingSoon title="Not found" />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
