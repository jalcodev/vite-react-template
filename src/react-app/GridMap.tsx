import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Metric = { value: number; unit: string; ts: number; resolution: string };
type ZoneSnapshot = { metrics: Record<string, Metric> };
type MapSnapshot = { zones: Record<string, ZoneSnapshot> };

export const ZONE_NAMES: Record<string, string> = {
  "US-CAISO": "California ISO",
  "US-ERCOT": "ERCOT (Texas)",
  "US-PJM": "PJM Interconnection",
  "US-MISO": "Midcontinent ISO",
  "US-NYISO": "New York ISO",
  "US-ISONE": "ISO New England",
  "US-SPP": "Southwest Power Pool",
  GB: "Great Britain",
  "AU-NSW": "New South Wales",
  "AU-QLD": "Queensland",
  "AU-VIC": "Victoria",
  "AU-SA": "South Australia",
  "AU-TAS": "Tasmania",
  "DE-LU": "Germany",
  FR: "France",
  ES: "Spain",
  "IT-NO": "Italy North",
  NL: "Netherlands",
  BE: "Belgium",
  PL: "Poland",
  "SE-3": "Sweden",
  "NO-2": "Norway",
  "DK-1": "Denmark",
  AT: "Austria",
  CH: "Switzerland",
};

type MetricKey = "price" | "demand";

const NO_DATA_COLOR = "#2a3548";
const SCALE_LOW = "#4c8b6b";
const SCALE_MID = "#c97a3d";
const SCALE_HIGH = "#8b3a3a";

function formatValue(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(2);
}

export default function GridMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geoDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const [metric, setMetric] = useState<MetricKey>("price");
  const [bounds, setBounds] = useState<{ min: number; max: number } | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Load geometry + live snapshot once, join them, initialize the map.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": "#0a0f1a" } }],
      },
      center: [20, 25],
      zoom: 1.4,
      minZoom: 1,
      maxZoom: 8,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // MapLibre measures its container once at init; if React hasn't finished
    // settling layout at that exact moment, it can cache a stale zero size.
    // Watch the container and force a re-measure whenever it actually changes.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    map.on("load", async () => {
      try {
        const [worldRes, geoRes, snapRes] = await Promise.all([
          fetch("/world-countries.geojson"),
          fetch("/api/gridhub/v1/geo/zones"),
          fetch("/api/gridhub/v1/map/snapshot"),
        ]);
        if (!worldRes.ok || !geoRes.ok || !snapRes.ok) throw new Error("fetch failed");
        const world = await worldRes.json();
        const geo = await geoRes.json();
        const snap: MapSnapshot = await snapRes.json();

        // World context layer, added first so it renders beneath our zones.
        // Muted fill — this is just for orientation, not data.
        map.addSource("world", { type: "geojson", data: world });
        map.addLayer({
          id: "world-fill",
          type: "fill",
          source: "world",
          paint: { "fill-color": "#1a2332", "fill-opacity": 0.7 },
        });
        map.addLayer({
          id: "world-outline",
          type: "line",
          source: "world",
          paint: { "line-color": "#2a3548", "line-width": 0.5 },
        });

        // Join live metric values onto each polygon's properties so MapLibre's
        // data-driven paint expressions can read them directly.
        for (const feature of geo.features) {
          const zoneId = feature.properties.zone;
          const z = snap.zones[zoneId];
          feature.properties.price = z?.metrics.price?.value ?? null;
          feature.properties.priceUnit = z?.metrics.price?.unit ?? null;
          feature.properties.demand = z?.metrics.demand?.value ?? null;
          feature.properties.name = ZONE_NAMES[zoneId] ?? zoneId;
        }

        map.addSource("zones", { type: "geojson", data: geo });
        geoDataRef.current = geo;
        map.addLayer({
          id: "zones-fill",
          type: "fill",
          source: "zones",
          paint: {
            "fill-color": buildFillExpression("price"),
            "fill-opacity": 0.85,
          },
        });
        map.addLayer({
          id: "zones-outline",
          type: "line",
          source: "zones",
          paint: { "line-color": "#0a0f1a", "line-width": 1 },
        });

        const prices = geo.features
          .map((f: { properties: { price: number | null } }) => f.properties.price)
          .filter((v: number | null): v is number => v != null);
        if (prices.length) setBounds({ min: Math.min(...prices), max: Math.max(...prices) });

        map.on("click", "zones-fill", (e: maplibregl.MapLayerMouseEvent) => {
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties as Record<string, string | number | null>;
          const priceLine =
            p.price != null ? `${formatValue(Number(p.price))} ${p.priceUnit}` : "No price data";
          const demandLine = p.demand != null ? `${formatValue(Number(p.demand))} MW` : "No demand data";
          new maplibregl.Popup({ closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="map-popup">
                 <span class="map-popup-name">${p.name}</span>
                 <span class="map-popup-code">${p.zone}</span>
                 <div class="map-popup-readout">
                   <span class="map-popup-label">Price</span>
                   <span class="map-popup-value">${priceLine}</span>
                 </div>
                 <div class="map-popup-readout">
                   <span class="map-popup-label">Demand</span>
                   <span class="map-popup-value">${demandLine}</span>
                 </div>
                 <a href="/zones/${p.zone}">View zone in detail →</a>
               </div>`
            )
            .addTo(map);
        });
        map.on("mouseenter", "zones-fill", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "zones-fill", () => (map.getCanvas().style.cursor = ""));
      } catch {
        setLoadError(true);
      }
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, []);

  // Re-color when the metric toggle changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("zones-fill")) return;
    map.setPaintProperty("zones-fill", "fill-color", buildFillExpression(metric));
    const data = geoDataRef.current;
    if (data) {
      const values = data.features
        .map((f) => f.properties?.[metric])
        .filter((v): v is number => v != null);
      if (values.length) setBounds({ min: Math.min(...values), max: Math.max(...values) });
    }
  }, [metric]);

  return (
    <div className="map-viewport">
      <div ref={containerRef} className="map-canvas" />

      <div className="map-toggle">
        <button className={metric === "price" ? "active" : ""} onClick={() => setMetric("price")}>
          Price
        </button>
        <button className={metric === "demand" ? "active" : ""} onClick={() => setMetric("demand")}>
          Demand
        </button>
      </div>

      <div className="map-legend">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="map-legend-title">{metric === "price" ? "Wholesale price" : "Demand (MW)"}</p>
        <div className="map-legend-scale" />
        <div className="map-legend-labels">
          <span>{bounds ? formatValue(bounds.min) : "–"}</span>
          <span>{bounds ? formatValue(bounds.max) : "–"}</span>
        </div>
        {metric === "price" && (
          <p className="map-legend-caption">
            Local currency per zone — not FX-normalized across zones
          </p>
        )}
      </div>

      {loadError && <div className="map-error">Live map data unavailable right now</div>}
    </div>
  );
}

function buildFillExpression(metric: MetricKey): maplibregl.ExpressionSpecification {
  const property = metric;
  const [lo, mid, hi] =
    metric === "price" ? [0, 120, 300] : [0, 15000, 60000];
  return [
    "case",
    ["==", ["get", property], null],
    NO_DATA_COLOR,
    ["interpolate", ["linear"], ["get", property], lo, SCALE_LOW, mid, SCALE_MID, hi, SCALE_HIGH],
  ] as maplibregl.ExpressionSpecification;
}
