'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ai-features/components/ui/card';
import { Home, Users, TrendingUp } from 'lucide-react';

interface HousingData {
  District: string;
  Avg_Density: number;
  Total_Housing_Units: number;
  Avg_Household_Size: number;
  Green_Area_Percent: number;
  Total_Road_Length_KM: number;
  Highway_Ratio: number;
  Arterial_Ratio: number;
  Congestion_Level: number;
  Housing_Growth_Rate: number;
  Road_Network_Efficiency: number;
  Infrastructure_Score: number;
  Housing_Saturation: number;
  Projected_10yr_Growth: number;
}

export function HousingDensityAnalysis() {
  const [housingData, setHousingData] = useState<HousingData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/housing-road-analysis")
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setHousingData(data.data);
          setSummary(data.summary);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading housing data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10 font-medium">
        Loading Housing Density Analysis data...
      </div>
    );
  }

  if (!housingData || housingData.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 font-medium">
        No housing data available
      </div>
    );
  }

  // Prepare data for housing density bar chart (sorted by density)
  const densityChartData = housingData
    .map((district) => ({
      district: district.District,
      density: Math.round(district.Avg_Density),
      housingUnits: district.Total_Housing_Units,
    }))
    .sort((a, b) => b.density - a.density);

  // Prepare data for growth vs infrastructure
  const growthInfraData = housingData.map((district) => ({
    district: district.District,
    growthRate: district.Housing_Growth_Rate,
    infrastructureScore: district.Infrastructure_Score,
    density: Math.round(district.Avg_Density),
  }));

  // Bubble chart data: Density vs Infrastructure vs Green Area
  const bubbleData = housingData.map((district) => ({
    district: district.District,
    density: Math.round(district.Avg_Density),
    infrastructureScore: district.Infrastructure_Score,
    greenArea: district.Green_Area_Percent,
    roadLength: district.Total_Road_Length_KM,
  }));

  // Calculate housing saturation
  const saturationData = housingData.map((district) => ({
    district: district.District,
    saturation: district.Housing_Saturation,
    density: Math.round(district.Avg_Density),
    infrastructureScore: district.Infrastructure_Score,
  }));

  const getSaturationColor = (saturation: number) => {
    if (saturation > 80) return "#ef4444";
    if (saturation > 65) return "#f59e0b";
    return "#10b981";
  };

  const highestDensityDistrict = densityChartData[0];
  const lowestDensityDistrict = densityChartData[densityChartData.length - 1];
  const avgHousing = summary?.avgDensity || Math.round(
    housingData.reduce((sum, d) => sum + d.Avg_Density, 0) / housingData.length
  );
  const fastestGrowth = [...housingData].sort((a, b) => b.Housing_Growth_Rate - a.Housing_Growth_Rate)[0];

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-blue-700 dark:text-blue-300">Average Density</p>
          <p className="text-blue-900 dark:text-blue-100 text-2xl">{avgHousing.toLocaleString()}</p>
          <p className="text-blue-600 dark:text-blue-400">people/km²</p>
        </Card>
        <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <p className="text-purple-700 dark:text-purple-300">Highest Density</p>
          <p className="text-purple-900 dark:text-purple-100 text-2xl">{highestDensityDistrict?.district || "N/A"}</p>
          <p className="text-purple-600 dark:text-purple-400">{highestDensityDistrict?.density.toLocaleString() || 0} people/km²</p>
        </Card>
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-300">Fastest Growth</p>
          <p className="text-green-900 dark:text-green-100 text-2xl">
            {fastestGrowth?.District || "N/A"}
          </p>
          <p className="text-green-600 dark:text-green-400">
            {fastestGrowth?.Housing_Growth_Rate?.toFixed(2) || 0}%/year
          </p>
        </Card>
        <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <p className="text-orange-700 dark:text-orange-300">Saturated Zones</p>
          <p className="text-orange-900 dark:text-orange-100 text-2xl">
            {saturationData.filter((z) => z.saturation > 80).length}
          </p>
          <p className="text-orange-600 dark:text-orange-400">need intervention</p>
        </Card>
      </div>

      {/* Analysis Insight */}
      <Card className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <div className="space-y-2">
          <h3 className="text-slate-900 dark:text-white">📊 Housing Saturation Analysis</h3>
          <p className="text-slate-700 dark:text-gray-300">
            Districts with high housing density but low infrastructure scores show saturation indices &gt;80. 
            These areas risk overcrowding without proportional service expansion. Analysis based on real data shows 
            districts with green area &gt;15% and better road network efficiency sustain higher densities more effectively. 
            Priority: increase green spaces, improve road networks, and expand infrastructure in high-saturation districts.
          </p>
          {summary && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Housing Units: </span>
                <span className="font-semibold">{summary.totalHousingUnits?.toLocaleString() || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Road Length: </span>
                <span className="font-semibold">{summary.totalRoadLength?.toFixed(1) || "N/A"} km</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Infrastructure: </span>
                <span className="font-semibold">{summary.avgInfrastructureScore || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Congestion: </span>
                <span className="font-semibold">{summary.avgCongestionLevel || "N/A"}%</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Housing Density by District */}
      <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <h3 className="text-slate-900 dark:text-white">Housing Density by District</h3>
          <p className="text-slate-500 dark:text-gray-400">Sorted by population density (highest to lowest)</p>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={densityChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis type="number" stroke="#6b7280" label={{ value: 'Avg Density (people/km²)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="district" type="category" width={120} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const districtData = housingData.find(d => d.District === data.district);
                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                        <p className="text-white font-semibold">{data.district}</p>
                        <p className="text-blue-400">
                          Density: {data.density.toLocaleString()} people/km²
                        </p>
                        {districtData && (
                          <>
                            <p className="text-gray-300">
                              Housing Units: {districtData.Total_Housing_Units.toLocaleString()}
                            </p>
                            <p className="text-gray-300">
                              Road Length: {districtData.Total_Road_Length_KM.toFixed(1)} km
                            </p>
                            <p className="text-gray-300">
                              Infrastructure Score: {districtData.Infrastructure_Score.toFixed(1)}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="density"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Growth Rate vs Infrastructure Index */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <h3 className="text-slate-900 dark:text-white">Growth Rate vs Infrastructure Score</h3>
            <p className="text-slate-500 dark:text-gray-400">Dual-axis comparison showing relationship between housing growth and infrastructure quality</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthInfraData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="district" angle={-45} textAnchor="end" height={100} stroke="#6b7280" />
                <YAxis yAxisId="left" label={{ value: "Growth Rate %", angle: -90, position: "insideLeft" }} stroke="#6b7280" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Infrastructure Score", angle: 90, position: "insideRight" }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="growthRate" fill="#10b981" name="Growth Rate %" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="infrastructureScore"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Infrastructure Score"
                  dot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Housing Saturation Heatmap */}
        <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <h3 className="text-slate-900 dark:text-white">Housing Saturation Index</h3>
            <p className="text-slate-500 dark:text-gray-400">Housing density relative to infrastructure capacity (higher = more saturated)</p>
          </div>
          <div className="space-y-3 h-[320px] overflow-y-auto">
            {saturationData
              .sort((a, b) => b.saturation - a.saturation)
              .map((item) => (
                <div
                  key={item.district}
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: getSaturationColor(item.saturation) + "10",
                    borderLeftColor: getSaturationColor(item.saturation),
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-900 dark:text-white">{item.district}</p>
                      <p className="text-slate-600 dark:text-gray-400">
                        {item.density.toLocaleString()} people/km² | Infra Score: {item.infrastructureScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl"
                        style={{ color: getSaturationColor(item.saturation) }}
                      >
                        {item.saturation.toFixed(0)}
                      </p>
                      <p className="text-slate-500 dark:text-gray-500">saturation</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Bubble Chart: Density vs Infrastructure vs Green Area */}
      <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <h3 className="text-slate-900 dark:text-white">
            Housing Density vs Infrastructure Score (sized by Green Area)
          </h3>
          <p className="text-slate-500 dark:text-gray-400">
            Bubble size represents percentage of green area in each district
          </p>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                type="number"
                dataKey="density"
                name="Housing Density"
                unit=" people/km²"
                domain={['dataMin - 1000', 'dataMax + 1000']}
                stroke="#6b7280"
              />
              <YAxis
                type="number"
                dataKey="infrastructureScore"
                name="Infrastructure Score"
                unit=""
                domain={[0, 100]}
                stroke="#6b7280"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                        <p className="text-white font-semibold">{data.district}</p>
                        <p className="text-gray-300">
                          Density: {data.density.toLocaleString()} people/km²
                        </p>
                        <p className="text-gray-300">
                          Infrastructure Score: {data.infrastructureScore.toFixed(1)}
                        </p>
                        <p className="text-green-400">
                          Green Area: {data.greenArea.toFixed(1)}%
                        </p>
                        <p className="text-blue-400">
                          Road Length: {data.roadLength.toFixed(1)} km
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={bubbleData} fill="#3b82f6">
                {bubbleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.greenArea > 15 ? "#10b981" : entry.greenArea > 10 ? "#f59e0b" : "#ef4444"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-slate-600 dark:text-gray-400">High Green Area (&gt;15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-slate-600 dark:text-gray-400">Medium Green Area (10-15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-slate-600 dark:text-gray-400">Low Green Area (&lt;10%)</span>
          </div>
        </div>
      </Card>
      
      {/* Model Performance Metrics */}
      {summary && summary.modelMetrics && (
        <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <h3 className="text-slate-900 dark:text-white">Model Performance Metrics</h3>
            <p className="text-slate-500 dark:text-gray-400">Housing density prediction model accuracy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300 text-sm">R² Score</p>
              <p className="text-blue-900 dark:text-blue-100 text-2xl font-bold">{summary.modelMetrics.r2Score}%</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs">Model accuracy</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-purple-700 dark:text-purple-300 text-sm">Mean Squared Error</p>
              <p className="text-purple-900 dark:text-purple-100 text-2xl font-bold">{summary.modelMetrics.mse.toLocaleString()}</p>
              <p className="text-purple-600 dark:text-purple-400 text-xs">Lower is better</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">Mean Absolute Error</p>
              <p className="text-green-900 dark:text-green-100 text-2xl font-bold">{summary.modelMetrics.mae}</p>
              <p className="text-green-600 dark:text-green-400 text-xs">people/km²</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

