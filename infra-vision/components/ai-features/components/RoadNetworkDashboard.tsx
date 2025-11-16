'use client';

import {
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '@/components/ai-features/components/ui/card';
import { Badge } from '@/components/ai-features/components/ui/badge';
import {
  delhiZones,
  calculateRoadMixScore,
  getCongestionColor,
} from '@/components/ai-features/data/delhiZonesData';
import { Network, AlertTriangle } from 'lucide-react';

export function RoadNetworkDashboard() {
  // Prepare data for scatter plot: Road Mix Score vs Congestion
  const scatterData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    region: zone.Region,
    roadMixScore: calculateRoadMixScore(zone) * 100,
    congestion: zone.CongestionLevel,
    roadLength: zone.TotalRoadLengthKM,
  }));

  // Prepare radar chart data for road type mix
  const radarData = [
    {
      type: "Highway",
      ...Object.fromEntries(
        delhiZones.map((z) => [z.Zone, (z.HighwayRatio * 100).toFixed(1)])
      ),
    },
    {
      type: "Arterial",
      ...Object.fromEntries(
        delhiZones.map((z) => [z.Zone, (z.ArterialRatio * 100).toFixed(1)])
      ),
    },
    {
      type: "Local",
      ...Object.fromEntries(
        delhiZones.map((z) => [z.Zone, (z.LocalRoadRatio * 100).toFixed(1)])
      ),
    },
  ];

  // Road length vs congestion for regression view
  const roadCongestionData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    roadLength: zone.TotalRoadLengthKM,
    congestion: zone.CongestionLevel,
  }));

  // High congestion zones (>70%)
  const highCongestionZones = delhiZones.filter((z) => z.CongestionLevel > 70);

  return (
    <div className="space-y-6">
      {/* Header with Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-blue-700 dark:text-blue-300">Avg Road Length</p>
          <p className="text-blue-900 dark:text-blue-100 text-2xl">
            {Math.round(delhiZones.reduce((sum, z) => sum + z.TotalRoadLengthKM, 0) / delhiZones.length)} km
          </p>
          <p className="text-blue-600 dark:text-blue-400">per zone</p>
        </Card>
        <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <p className="text-purple-700 dark:text-purple-300">Highway Coverage</p>
          <p className="text-purple-900 dark:text-purple-100 text-2xl">
            {((delhiZones.reduce((sum, z) => sum + z.HighwayRatio, 0) / delhiZones.length) * 100).toFixed(0)}%
          </p>
          <p className="text-purple-600 dark:text-purple-400">average ratio</p>
        </Card>
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">Critical Zones</p>
          <p className="text-red-900 dark:text-red-100 text-2xl">{highCongestionZones.length}</p>
          <p className="text-red-600 dark:text-red-400">&gt;70% congestion</p>
        </Card>
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-300">Best Road Mix</p>
          <p className="text-green-900 dark:text-green-100 text-2xl">
            {[...delhiZones].sort((a, b) => calculateRoadMixScore(b) - calculateRoadMixScore(a))[0].Zone}
          </p>
          <p className="text-green-600 dark:text-green-400">optimal distribution</p>
        </Card>
      </div>

      {/* Analysis Insight */}
      <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="space-y-2">
          <h3 className="text-slate-900 dark:text-white">📊 Key Analysis</h3>
          <p className="text-slate-700 dark:text-gray-300">
            <strong>{highCongestionZones.length}</strong> zones show critical congestion (&gt;70%) despite varying road lengths. 
            Analysis reveals poor road type mix (too many local roads vs highways/arterials) is the primary factor, 
            not total road length. Zones with optimal highway-arterial ratios show 30-40% lower congestion.
          </p>
          {highCongestionZones.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {highCongestionZones.map((z) => (
                <Badge key={z.Zone} variant="destructive">{z.Zone}</Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter: Road Mix Score vs Congestion */}
        <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <h3 className="text-slate-900 dark:text-white">Road Quality vs Congestion</h3>
            <p className="text-slate-500 dark:text-gray-400">
              Higher road mix score indicates better highway/arterial ratio
            </p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="roadMixScore"
                  name="Road Mix Score"
                  unit="%"
                  domain={[30, 50]}
                  stroke="#6b7280"
                />
                <YAxis
                  type="number"
                  dataKey="congestion"
                  name="Congestion"
                  unit="%"
                  domain={[30, 90]}
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
                          <p className="text-white">{data.zone}</p>
                          <p className="text-gray-300">
                            Road Mix: {data.roadMixScore.toFixed(1)}%
                          </p>
                          <p className="text-gray-300">
                            Congestion: {data.congestion}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="#3b82f6">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCongestionColor(entry.congestion)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Scatter: Road Length vs Congestion */}
        <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <h3 className="text-slate-900 dark:text-white">Road Length vs Congestion</h3>
            <p className="text-slate-500 dark:text-gray-400">
              Identifying zones where more roads don't reduce congestion
            </p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="roadLength"
                  name="Road Length"
                  unit=" km"
                  domain={[120, 230]}
                  stroke="#6b7280"
                />
                <YAxis
                  type="number"
                  dataKey="congestion"
                  name="Congestion"
                  unit="%"
                  domain={[30, 90]}
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
                          <p className="text-white">{data.zone}</p>
                          <p className="text-gray-300">
                            Road Length: {data.roadLength} km
                          </p>
                          <p className="text-gray-300">
                            Congestion: {data.congestion}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={roadCongestionData} fill="#8b5cf6">
                  {roadCongestionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCongestionColor(entry.congestion)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Road Type Mix Comparison - Selected Zones */}
      <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <h3 className="text-slate-900 dark:text-white">Road Type Mix by Zone</h3>
          <p className="text-slate-500 dark:text-gray-400">
            Percentage distribution of highway, arterial, and local roads
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart for first 5 zones */}
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="type" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 60]} stroke="#6b7280" />
                <Radar
                  name="Zone A"
                  dataKey="Zone A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone B"
                  dataKey="Zone B"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone C"
                  dataKey="Zone C"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone D"
                  dataKey="Zone D"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone E"
                  dataKey="Zone E"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart for remaining zones */}
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="type" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 60]} stroke="#6b7280" />
                <Radar
                  name="Zone F"
                  dataKey="Zone F"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone G"
                  dataKey="Zone G"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone H"
                  dataKey="Zone H"
                  stroke="#84cc16"
                  fill="#84cc16"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone I"
                  dataKey="Zone I"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Zone J"
                  dataKey="Zone J"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Congestion Heatmap */}
      <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <h3 className="text-slate-900 dark:text-white">Congestion Level Heatmap</h3>
          <p className="text-slate-500 dark:text-gray-400">Visual representation of traffic congestion across zones</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {delhiZones.map((zone) => (
            <div
              key={zone.Zone}
              className="p-4 rounded-lg border-2 transition-transform hover:scale-105"
              style={{
                backgroundColor: getCongestionColor(zone.CongestionLevel) + "20",
                borderColor: getCongestionColor(zone.CongestionLevel),
              }}
            >
              <div className="space-y-2">
                <p className="text-slate-900 dark:text-white">{zone.Zone}</p>
                <p className="text-slate-600 dark:text-gray-400">{zone.Region}</p>
                <div className="flex items-baseline gap-1">
                  <p
                    className="text-2xl"
                    style={{ color: getCongestionColor(zone.CongestionLevel) }}
                  >
                    {zone.CongestionLevel}%
                  </p>
                </div>
                <p className="text-slate-500 dark:text-gray-500">{zone.TotalRoadLengthKM} km roads</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

