"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Activity, Home, TrendingUp, Car, Users, Clock } from "lucide-react";

// Set Mapbox access token - only if valid
if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (token && token !== 'your-mapbox-token') {
    mapboxgl.accessToken = token;
  } else {
    // Use a public demo token as fallback (may have rate limits)
    mapboxgl.accessToken = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";
  }
}

interface ZoneData {
  zone: string;
  traffic: number;
  density: number;
  growth: number;
  commute: number;
}

// Approximate Delhi zone coordinates
const zoneCoords: Record<string, [number, number]> = {
  "New Delhi": [77.209, 28.6139],
  "South Delhi": [77.225, 28.5],
  "East Delhi": [77.3, 28.65],
  "North Delhi": [77.17, 28.75],
  "West Delhi": [77.05, 28.65],
  "Central Delhi": [77.22, 28.64],
  "Dwarka": [77.03, 28.58],
  "Rohini": [77.11, 28.75],
};

export default function CityAnalysisDashboard() {
  const [view, setView] = useState<"traffic" | "housing" | "growth">("traffic");
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [chartData, setChartData] = useState<ZoneData[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  // Load data and create GeoJSON
  useEffect(() => {
    fetch("/api/ai-planning-impact")
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          // Create chart data
          const zones = data.data.map((z: any) => ({
            zone: z.Zone || "Unknown",
            traffic: Math.round((z.Traffic_Efficiency_After || 0) * 1000),
            density: Math.round((z.Housing_Access_After || 0) * 100),
            growth: parseFloat(((z.Infra_Util_After || 0) / 10).toFixed(1)),
            commute: Math.round(z.Commute_After || 0),
          }));
          setChartData(zones);

          // Create GeoJSON for map
          const geojson = {
            type: "FeatureCollection",
            features: data.data.map((z: any) => ({
              type: "Feature",
              properties: {
                zone: z.Zone || "Unknown",
                traffic: parseFloat(z.Traffic_Efficiency_After || 0),
                housing: parseFloat(z.Housing_Access_After || 0),
                growth: parseFloat(z.Infra_Util_After || 0),
                commute: parseFloat(z.Commute_After || 0),
              },
              geometry: {
                type: "Point",
                coordinates: zoneCoords[z.Zone] || [77.2, 28.6],
              },
            })),
          };
          setGeoData(geojson);
        } else {
          // Fallback static data
          const fallbackZones = [
            { zone: "New Delhi", traffic: 127432, density: 8340, growth: 2.1, commute: 32 },
            { zone: "South Delhi", traffic: 113200, density: 7200, growth: 1.8, commute: 35 },
            { zone: "West Delhi", traffic: 119500, density: 8100, growth: 1.9, commute: 33 },
            { zone: "East Delhi", traffic: 132000, density: 8800, growth: 2.3, commute: 30 },
            { zone: "North Delhi", traffic: 108000, density: 6800, growth: 1.7, commute: 38 },
            { zone: "Central Delhi", traffic: 145000, density: 9200, growth: 2.5, commute: 28 },
            { zone: "Dwarka", traffic: 95000, density: 5600, growth: 1.5, commute: 40 },
            { zone: "Rohini", traffic: 112000, density: 7500, growth: 1.9, commute: 36 },
          ];
          setChartData(fallbackZones);

          const fallbackGeoJSON = {
            type: "FeatureCollection",
            features: fallbackZones.map((z) => ({
              type: "Feature",
              properties: {
                zone: z.zone,
                traffic: z.traffic / 1000,
                housing: z.density / 100,
                growth: z.growth * 10,
                commute: z.commute,
              },
              geometry: {
                type: "Point",
                coordinates: zoneCoords[z.zone] || [77.2, 28.6],
              },
            })),
          };
          setGeoData(fallbackGeoJSON);
        }
      })
      .catch(() => {
        // Fallback on error
        const fallbackZones = [
          { zone: "New Delhi", traffic: 127432, density: 8340, growth: 2.1, commute: 32 },
          { zone: "South Delhi", traffic: 113200, density: 7200, growth: 1.8, commute: 35 },
        ];
        setChartData(fallbackZones);
      });
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current || !geoData) return;

    // Check if token is valid
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === 'your-mapbox-token') {
      console.warn('Mapbox token not configured. Map will not be displayed.');
      return;
    }

    let mapInstance: mapboxgl.Map | null = null;

    try {
      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [77.209, 28.6139], // Delhi coordinates
        zoom: 9.8,
      });

      mapInstance.on("error", (e: any) => {
        console.error("Mapbox error:", e);
        if (mapInstance) {
          mapInstance.remove();
          mapInstance = null;
        }
      });

      mapInstance.on("load", () => {
      if (!mapInstance) return;
      // Add GeoJSON source
      mapInstance.addSource("zones", {
        type: "geojson",
        data: geoData,
      });

      // Add heatmap layer
      mapInstance.addLayer({
        id: "heat",
        type: "heatmap",
        source: "zones",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", view === "traffic" ? "traffic" : view === "growth" ? "growth" : "housing"],
            0, 0,
            100, 1,
          ],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)",
          ],
          "heatmap-radius": 50,
          "heatmap-opacity": 0.8,
        },
      });

      // Add circle layer for zone points
      mapInstance.addLayer({
        id: "points",
        type: "circle",
        source: "zones",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", view === "traffic" ? "traffic" : view === "growth" ? "growth" : "housing"],
            0, 8,
            100, 30,
          ],
          "circle-color": view === "traffic"
            ? "#3B82F6"
            : view === "housing"
            ? "#10B981"
            : "#8B5CF6",
          "circle-opacity": 0.7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Add labels for zones
      mapInstance.addLayer({
        id: "labels",
        type: "symbol",
        source: "zones",
        layout: {
          "text-field": ["get", "zone"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-size": 12,
        },
        paint: {
          "text-color": "#333",
          "text-halo-color": "#fff",
          "text-halo-width": 2,
        },
      });

      setMap(mapInstance);
      mapInitialized.current = true;
    });
    } catch (error) {
      console.error("Failed to initialize Mapbox map:", error);
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [geoData]);

  // Update map layers when view changes
  useEffect(() => {
    if (!map || !geoData) return;

    const property = view === "traffic" ? "traffic" : view === "growth" ? "growth" : "housing";
    const color = view === "traffic" ? "#3B82F6" : view === "housing" ? "#10B981" : "#8B5CF6";

    // Update heatmap weight
    if (map.getLayer("heat")) {
      map.setPaintProperty("heat", "heatmap-weight", [
        "interpolate",
        ["linear"],
        ["get", property],
        0, 0,
        100, 1,
      ]);
    }

    // Update circle color and size
    if (map.getLayer("points")) {
      map.setPaintProperty("points", "circle-color", color);
      map.setPaintProperty("points", "circle-radius", [
        "interpolate",
        ["linear"],
        ["get", property],
        0, 8,
        100, 30,
      ]);
    }
  }, [view, map, geoData]);

  // Calculate current metrics based on view
  const currentMetrics = chartData.length > 0
    ? {
        traffic: Math.round(chartData.reduce((sum, z) => sum + z.traffic, 0) / chartData.length),
        density: Math.round(chartData.reduce((sum, z) => sum + z.density, 0) / chartData.length),
        commute: Math.round(chartData.reduce((sum, z) => sum + z.commute, 0) / chartData.length),
      }
    : { traffic: 127432, density: 8340, commute: 32 };

  const getChartDataKey = () => {
    if (view === "traffic") return "traffic";
    if (view === "housing") return "density";
    return "growth";
  };

  const getViewIcon = () => {
    if (view === "traffic") return <Activity className="w-6 h-6" />;
    if (view === "housing") return <Home className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  const getViewColor = () => {
    if (view === "traffic") return "blue";
    if (view === "housing") return "green";
    return "purple";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto py-8 px-4"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Live City Analysis Dashboard
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {(["traffic", "housing", "growth"] as const).map((type) => (
          <motion.button
            key={type}
            onClick={() => setView(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              view === type
                ? `bg-gradient-to-r ${
                    type === "traffic"
                      ? "from-blue-500 to-blue-600"
                      : type === "housing"
                      ? "from-green-500 to-green-600"
                      : "from-purple-500 to-purple-600"
                  } text-white shadow-lg`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type === "traffic"
              ? "Traffic Flow"
              : type === "housing"
              ? "Housing Density"
              : "Growth Prediction"}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  view === "traffic"
                    ? "bg-blue-100 text-blue-600"
                    : view === "housing"
                    ? "bg-green-100 text-green-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {getViewIcon()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {view === "traffic"
                  ? "Traffic Flow Heatmap"
                  : view === "housing"
                  ? "Housing Density Map"
                  : "Growth Prediction Zones"}
              </h3>
            </div>
            <div
              ref={mapContainer}
              className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200"
            />
            
            {/* Interactive Legend */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600 font-medium">Low</span>
              <div className="w-48 h-3 bg-gradient-to-r from-blue-300 via-orange-300 to-red-500 rounded-full shadow-sm" />
              <span className="text-sm text-gray-600 font-medium">High</span>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Metrics</h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Traffic Volume</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {currentMetrics.traffic.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((currentMetrics.traffic / 150000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Population Density</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {currentMetrics.density.toLocaleString()}/km²
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((currentMetrics.density / 10000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Avg. Commute</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {currentMetrics.commute} min
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentMetrics.commute / 60) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6 capitalize flex items-center gap-2">
          {getViewIcon()}
          {view === "traffic"
            ? "Traffic Flow"
            : view === "housing"
            ? "Housing Density"
            : "Growth Prediction"}{" "}
          Trend by Zone
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="zone"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={getChartDataKey()}
              stroke={
                view === "traffic"
                  ? "#3B82F6"
                  : view === "housing"
                  ? "#10B981"
                  : "#8B5CF6"
              }
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
              name={
                view === "traffic"
                  ? "Traffic Volume"
                  : view === "housing"
                  ? "Density (per km²)"
                  : "Growth Rate (%)"
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
