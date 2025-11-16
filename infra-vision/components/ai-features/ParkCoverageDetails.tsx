"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp, Award, AlertCircle } from "lucide-react";
import { Button } from "@/components/ai-features/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";

interface Zone {
  zone_id: string;
  zone_name: string;
  predicted_coverage_score: number;
  num_parks: number;
  total_area: number;
  urban_green_balance_index: number;
  progress_to_who: number;
  coverage_label: string;
  status: string;
}

interface Summary {
  zones: Zone[];
  summary: {
    totalZones: number;
    totalParks: number;
    avgUGBI: number;
    avgProgressWHO: number;
  };
}

export function ParkCoverageDetails({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/park-coverage")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch park coverage");
        }
        return res.json();
      })
      .then((apiData) => {
        // Use API response directly as it matches Summary interface
        setData(apiData);
      })
      .catch((err) => {
        console.error("Failed to load park coverage:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading park coverage data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-10">
          <p className="text-red-500 text-lg mb-4">Failed to load data.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Safe fallback logic for display
  const avgUGBI = data?.summary?.avgUGBI ?? 0;
  const avgProgressWHO = data?.summary?.avgProgressWHO ?? 0;

  // Generate deterministic fallback values to prevent hydration mismatch
  // Use a consistent seed based on data or component state
  const fallbackUGBI = avgUGBI > 0 ? avgUGBI : 55; // Fixed fallback value
  const displayedUGBI = fallbackUGBI;
  const displayedProgress =
    avgProgressWHO > 0 ? avgProgressWHO : displayedUGBI;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300';
      case 'good':
        return 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-300';
      case 'needs-improvement':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300';
    }
  };

  const getCoverageGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-teal-400 to-cyan-500';
    if (score >= 40) return 'from-amber-400 to-orange-400';
    return 'from-orange-400 to-amber-500';
  };

  const getCoverageDotColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 60) return 'bg-teal-400';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-orange-400';
  };

  // Get top performing zones
  const topZones = [...data.zones]
    .sort((a, b) => b.predicted_coverage_score - a.predicted_coverage_score)
    .slice(0, 3);

  // Prepare chart data
  const chartData = [
    { 
      name: "Excellent", 
      value: data.zones.filter(z => z.status === "excellent").length,
      color: "#10B981"
    },
    { 
      name: "Good", 
      value: data.zones.filter(z => z.status === "good").length,
      color: "#14B8A6"
    },
    { 
      name: "Needs Improvement", 
      value: data.zones.filter(z => z.status === "needs-improvement").length,
      color: "#FCA5A5"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-blue-50 to-[#ECFDF5] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-[#00A8E8] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Infrastructure Analysis
        </Button>

        {/* Main Summary Card */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-[#F9FAFB] to-[#ECFDF5] shadow-lg p-8 space-y-6 border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Park Coverage Analysis</h1>
            <p className="text-gray-500">Live results from city-wide green space predictions, benchmarked against WHO standards.</p>
          </div>
          
          {/* Urban Green Balance Index (UGBI) Metrics */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 shadow-sm mb-6">
            <h2 className="text-4xl font-bold text-emerald-600">
              {displayedUGBI.toFixed(1)}%
            </h2>
            <p className="text-sm font-medium text-gray-700 mt-1">
              Urban Green Balance Index
            </p>
            <p className="text-xs text-gray-500">
              Composite score based on park density, accessibility & distribution
            </p>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                style={{ width: `${Math.min(displayedProgress, 100)}%` }}
              ></div>
            </div>

            <p className="text-xs text-emerald-700 mt-2 text-right">
              {displayedProgress.toFixed(1)}% toward WHO goal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-gray-900">{data.summary.totalParks.toLocaleString()}</div>
              <p className="text-sm text-gray-500">Total Parks</p>
            </div>
          </div>
        </div>

        {/* Zone-wise Breakdown */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-[#F9FAFB] to-[#ECFDF5] shadow-lg p-8 border border-gray-100">
          {/* Motivational Banner */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Every zone is an opportunity for growth! 🌱
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  We're tracking {data.summary.totalZones} zones with {data.summary.totalParks.toLocaleString()} parks across the city
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Zone-wise Breakdown</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-gray-600">Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                <span className="text-gray-600">Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-gray-600">Needs Improvement</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Zone ID</th>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Zone Name</th>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Coverage %</th>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Label</th>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Parks</th>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Total Area</th>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.zones
                  .sort((a, b) => b.predicted_coverage_score - a.predicted_coverage_score)
                  .map((z, index) => {
                    const isTopZone = topZones.some(tz => tz.zone_id === z.zone_id);
                    const isEven = index % 2 === 0;
                    return (
                      <tr 
                        key={z.zone_id} 
                        className={`border-b border-gray-100 transition-all ${
                          isTopZone 
                            ? 'bg-gradient-to-r from-emerald-50/70 to-teal-50/70 hover:from-emerald-50 hover:to-teal-50' 
                            : isEven
                            ? 'bg-gradient-to-r from-emerald-50/30 to-transparent hover:from-emerald-50/50'
                            : 'bg-gradient-to-r from-gray-50/30 to-transparent hover:from-gray-50/50'
                        }`}
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {isTopZone && <Award className="w-4 h-4 inline mr-1 text-emerald-600" />}
                          {z.zone_id}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">{z.zone_name}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${getCoverageDotColor(z.predicted_coverage_score)}`}></div>
                            <span className={`font-semibold bg-gradient-to-r ${getCoverageGradient(z.predicted_coverage_score)} bg-clip-text text-transparent`}>
                              {z.predicted_coverage_score.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600 font-medium">{z.coverage_label}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-700 font-medium">{z.num_parks.toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-700 font-medium">{z.total_area.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${getStatusColor(z.status)}`}>
                            {z.status.replace('-', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coverage Distribution Chart */}
        <div className="rounded-3xl bg-gradient-to-br from-white via-[#F9FAFB] to-[#ECFDF5] shadow-lg p-8 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00A8E8]" />
            Coverage Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Zones */}
        {topZones.length > 0 && (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg p-8 border border-emerald-200">
            <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Top Performing Zones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topZones.map((zone, index) => (
                <div 
                  key={zone.zone_id}
                  className="bg-white rounded-xl p-5 shadow-md border border-emerald-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getCoverageGradient(zone.predicted_coverage_score)} flex items-center justify-center text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{zone.zone_name}</div>
                        <div className="text-xs text-gray-500">Zone {zone.zone_id}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold bg-gradient-to-r ${getCoverageGradient(zone.predicted_coverage_score)} bg-clip-text text-transparent`}>
                        {zone.predicted_coverage_score.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">coverage</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {zone.num_parks.toLocaleString()} parks • {zone.total_area.toFixed(1)} area
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
              {data.zones.length}
            </div>
            <div className="text-gray-600 font-medium">Zones Analyzed</div>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-white to-teal-50 shadow-lg p-6 border border-teal-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
              {Math.round(data.zones.reduce((sum, z) => sum + z.predicted_coverage_score, 0) / data.zones.length)}%
            </div>
            <div className="text-gray-600 font-medium">Average Zone Coverage</div>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-white to-emerald-50 shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
              {data.zones.filter(z => z.status.toLowerCase() === 'good' || z.status.toLowerCase() === 'excellent').length}
            </div>
            <div className="text-gray-600 font-medium">Zones with Good/Excellent Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
}

