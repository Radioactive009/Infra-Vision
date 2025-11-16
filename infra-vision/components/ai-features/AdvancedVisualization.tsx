"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Search, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";

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
  "East Zone 1": [77.3, 28.65],
  "East Zone 2": [77.32, 28.67],
  "East Zone 3": [77.28, 28.63],
  "North East Zone 1": [77.25, 28.7],
  "North East Zone 2": [77.27, 28.72],
  "North East Zone 3": [77.23, 28.68],
  "North Zone 1": [77.17, 28.75],
  "North Zone 2": [77.15, 28.77],
  "North West Zone A1": [77.05, 28.7],
  "North West Zone A2": [77.03, 28.72],
};

interface MergedZoneData {
  Zone: string;
  School: number;
  Hospital: number;
  Park: number;
  Total: number;
  coordinates: [number, number];
}

const COLORS = {
  school: "#3B82F6",
  hospital: "#10B981",
  park: "#F59E0B",
};

export default function AdvancedVisualization() {
  const [data, setData] = useState<MergedZoneData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("delhi");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [searchQuery, setSearchQuery] = useState("");
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  // Load and merge data from all three APIs
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/school-coverage").then((res) => res.json()),
      fetch("/api/hospital-coverage").then((res) => res.json()),
      fetch("/api/park-coverage").then((res) => res.json()),
    ])
      .then(([schoolData, hospitalData, parkData]) => {
        // Create a map to merge by zone
        const zoneMap = new Map<string, MergedZoneData>();

        // Process school data
        if (schoolData?.zones) {
          schoolData.zones.forEach((zone: any) => {
            const zoneName = zone.zone_name || zone.Zone || "Unknown";
            const coverage = zone.predicted_coverage_score || zone.coverage || 0;
            zoneMap.set(zoneName, {
              Zone: zoneName,
              School: parseFloat(coverage) || 0,
              Hospital: 0,
              Park: 0,
              Total: parseFloat(coverage) || 0,
              coordinates: zoneCoords[zoneName] || [77.2, 28.6],
            });
          });
        }

        // Process hospital data
        if (hospitalData?.zones) {
          hospitalData.zones.forEach((zone: any) => {
            const zoneName = zone.zone_name || zone.Zone || "Unknown";
            const coverage = zone.predicted_coverage_score || zone.coverage || 0;
            if (zoneMap.has(zoneName)) {
              zoneMap.get(zoneName)!.Hospital = parseFloat(coverage) || 0;
            } else {
              zoneMap.set(zoneName, {
                Zone: zoneName,
                School: 0,
                Hospital: parseFloat(coverage) || 0,
                Park: 0,
                Total: parseFloat(coverage) || 0,
                coordinates: zoneCoords[zoneName] || [77.2, 28.6],
              });
            }
          });
        }

        // Process park data
        if (parkData?.zones) {
          parkData.zones.forEach((zone: any) => {
            const zoneName = zone.zone_name || zone.Zone || "Unknown";
            // Use UGBI if available, otherwise use predicted_coverage_score
            const coverage =
              zone.urban_green_balance_index ||
              zone.predicted_coverage_score ||
              zone.coverage ||
              0;
            if (zoneMap.has(zoneName)) {
              zoneMap.get(zoneName)!.Park = parseFloat(coverage) || 0;
            } else {
              zoneMap.set(zoneName, {
                Zone: zoneName,
                School: 0,
                Hospital: 0,
                Park: parseFloat(coverage) || 0,
                Total: parseFloat(coverage) || 0,
                coordinates: zoneCoords[zoneName] || [77.2, 28.6],
              });
            }
          });
        }

        // Calculate totals and create array
        const merged = Array.from(zoneMap.values()).map((zone) => ({
          ...zone,
          Total: zone.School + zone.Hospital + zone.Park,
        }));

        setData(merged);

        // Generate insights
        if (merged.length > 0) {
          const topZone = merged.reduce((a, b) =>
            a.Total > b.Total ? a : b
          );
          const avgSchool =
            merged.reduce((sum, z) => sum + z.School, 0) / merged.length;
          const avgHospital =
            merged.reduce((sum, z) => sum + z.Hospital, 0) / merged.length;
          const avgPark =
            merged.reduce((sum, z) => sum + z.Park, 0) / merged.length;

          setInsights([
            `🏙️ ${topZone.Zone} shows highest combined coverage of ${topZone.Total.toFixed(1)}%.`,
            `📚 School coverage average: ${avgSchool.toFixed(1)}% across ${merged.length} zones.`,
            `🏥 Healthcare access average: ${avgHospital.toFixed(1)}% with ${hospitalData?.totalFacilities || 0} facilities.`,
            `🌳 Park distribution index: ${avgPark.toFixed(1)}% (UGBI-based assessment).`,
            `📊 Total infrastructure analyzed: ${merged.reduce((sum, z) => sum + (z.School > 0 ? 1 : 0) + (z.Hospital > 0 ? 1 : 0) + (z.Park > 0 ? 1 : 0), 0)} facility types across all zones.`,
          ]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current || !data.length) return;

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
        style: "mapbox://styles/mapbox/dark-v11",
        center: [77.209, 28.6139],
        zoom: 9.5,
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

      // Create GeoJSON from merged data
      const features = data.map((d) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: d.coordinates,
        },
        properties: {
          zone: d.Zone,
          intensity: d.Total / 3, // Average of three metrics
          school: d.School,
          hospital: d.Hospital,
          park: d.Park,
        },
      }));

      const geojson = {
        type: "FeatureCollection" as const,
        features,
      };

      mapInstance.addSource("infra", {
        type: "geojson",
        data: geojson,
      });

      // Add heatmap layer
      mapInstance.addLayer({
        id: "heat",
        type: "heatmap",
        source: "infra",
        paint: {
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
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "intensity"],
            0, 0,
            100, 1,
          ],
        },
      });

      // Add circle layer for zone points
      mapInstance.addLayer({
        id: "points",
        type: "circle",
        source: "infra",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "intensity"],
            0, 10,
            100, 40,
          ],
          "circle-color": "#10B981",
          "circle-opacity": 0.6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Add labels
      mapInstance.addLayer({
        id: "labels",
        type: "symbol",
        source: "infra",
        layout: {
          "text-field": ["get", "zone"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-size": 11,
        },
        paint: {
          "text-color": "#fff",
          "text-halo-color": "#000",
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
  }, [data]);

  // Filter data based on search
  const filteredData = data.filter((zone) =>
    zone.Zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate trend data (simulated 2015-2024)
  const trendData = filteredData.length > 0
    ? Array.from({ length: 10 }, (_, i) => {
        const year = 2015 + i;
        const progress = (i / 9) * 100; // 0% to 100% over 10 years
        return {
          year: year.toString(),
          School: filteredData.reduce(
            (sum, z) => sum + z.School * (progress / 100),
            0
          ) / filteredData.length,
          Hospital: filteredData.reduce(
            (sum, z) => sum + z.Hospital * (progress / 100),
            0
          ) / filteredData.length,
          Park: filteredData.reduce(
            (sum, z) => sum + z.Park * (progress / 100),
            0
          ) / filteredData.length,
        };
      })
    : [];

  // Pie chart data
  const pieData = [
    {
      name: "Schools",
      value: filteredData.reduce((sum, z) => sum + z.School, 0),
    },
    {
      name: "Hospitals",
      value: filteredData.reduce((sum, z) => sum + z.Hospital, 0),
    },
    {
      name: "Parks",
      value: filteredData.reduce((sum, z) => sum + z.Park, 0),
    },
  ];

  const PIE_COLORS = [COLORS.school, COLORS.hospital, COLORS.park];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading visualization data...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 py-12 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Advanced Data Visualization
          </h1>
          <p className="text-gray-300 text-lg">
            Interactive insights powered by trained AI models on infrastructure
            coverage data.
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="delhi" className="bg-gray-800">Delhi NCR</option>
              <option value="mumbai" className="bg-gray-800">Mumbai</option>
              <option value="bangalore" className="bg-gray-800">Bangalore</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024" className="bg-gray-800">2024</option>
              <option value="2023" className="bg-gray-800">2023</option>
              <option value="2022" className="bg-gray-800">2022</option>
            </select>
            <button className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition flex items-center justify-center gap-2">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </motion.div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-2xl"
        >
          <h3 className="text-2xl font-semibold text-white mb-4">
            Coverage Intensity Heatmap
          </h3>
          <div
            ref={mapContainer}
            className="w-full h-[500px] rounded-xl overflow-hidden border border-white/20"
          />
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-300 font-medium">Low</span>
            <div className="w-64 h-4 bg-gradient-to-r from-blue-300 via-orange-300 to-red-500 rounded-full shadow-lg" />
            <span className="text-sm text-gray-300 font-medium">High</span>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stacked Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Zone-wise Infrastructure Coverage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis
                  dataKey="Zone"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: "#aaa", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#aaa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="School"
                  stackId="a"
                  fill={COLORS.school}
                  name="School Coverage"
                />
                <Bar
                  dataKey="Hospital"
                  stackId="a"
                  fill={COLORS.hospital}
                  name="Hospital Coverage"
                />
                <Bar
                  dataKey="Park"
                  stackId="a"
                  fill={COLORS.park}
                  name="Park Coverage"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Coverage Trend (2015–2024)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="year" tick={{ fill: "#aaa" }} />
                <YAxis tick={{ fill: "#aaa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="School"
                  stroke={COLORS.school}
                  strokeWidth={2}
                  name="School"
                />
                <Line
                  type="monotone"
                  dataKey="Hospital"
                  stroke={COLORS.hospital}
                  strokeWidth={2}
                  name="Hospital"
                />
                <Line
                  type="monotone"
                  dataKey="Park"
                  stroke={COLORS.park}
                  strokeWidth={2}
                  name="Park"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Resource Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Balanced Infrastructure Index by Zone
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={filteredData.slice(0, 8)}>
              <PolarGrid stroke="#ffffff30" />
              <PolarAngleAxis
                dataKey="Zone"
                tick={{ fill: "#aaa", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#aaa" }}
              />
              <Radar
                name="School"
                dataKey="School"
                stroke={COLORS.school}
                fill={COLORS.school}
                fillOpacity={0.5}
              />
              <Radar
                name="Hospital"
                dataKey="Hospital"
                stroke={COLORS.hospital}
                fill={COLORS.hospital}
                fillOpacity={0.5}
              />
              <Radar
                name="Park"
                dataKey="Park"
                stroke={COLORS.park}
                fill={COLORS.park}
                fillOpacity={0.5}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            AI-Generated Insights
          </h3>
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="text-gray-200 flex items-start gap-3"
              >
                <span className="text-blue-400 mt-1">•</span>
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}


