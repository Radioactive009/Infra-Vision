'use client';

import { useState } from 'react';
import { Card } from '@/components/ai-features/components/ui/card';
import { Badge } from '@/components/ai-features/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ai-features/components/ui/tabs';
import { Switch } from '@/components/ai-features/components/ui/switch';
import { Label } from '@/components/ai-features/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import {
  delhiZones,
  getCongestionColor,
  calculatePredictedCongestion2034,
} from '@/components/ai-features/data/delhiZonesData';
import { AlertCircle, TrendingUp, Filter } from 'lucide-react';

export function TrafficCongestionHeatmap() {
  const [showHighCongestionOnly, setShowHighCongestionOnly] = useState(false);
  const [timeView, setTimeView] = useState<'current' | 'predicted'>('current');

  // Filter zones based on congestion threshold
  const displayZones = showHighCongestionOnly
    ? delhiZones.filter((z) => z.CongestionLevel > 70)
    : delhiZones;

  // Prepare data for bar chart
  const congestionChartData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    current: zone.CongestionLevel,
    predicted: calculatePredictedCongestion2034(zone),
    change: calculatePredictedCongestion2034(zone) - zone.CongestionLevel,
  }));

  // Calculate statistics
  const avgCongestion =
    delhiZones.reduce((sum, z) => sum + z.CongestionLevel, 0) / delhiZones.length;
  const maxCongestionZone = [...delhiZones].sort(
    (a, b) => b.CongestionLevel - a.CongestionLevel
  )[0];
  const minCongestionZone = [...delhiZones].sort(
    (a, b) => a.CongestionLevel - b.CongestionLevel
  )[0];

  // Calculate prediction impact
  const avgPredictedIncrease =
    congestionChartData.reduce((sum, z) => sum + z.change, 0) / congestionChartData.length;
  const worstImpactZone = [...congestionChartData].sort((a, b) => b.change - a.change)[0];

  return (
    <div className="space-y-6">
      {/* Analysis Insight */}
      <Card className="p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
        <div className="space-y-2">
          <h3 className="text-slate-900 dark:text-white">📊 Congestion Forecast Impact (2024→2034)</h3>
          <p className="text-slate-700 dark:text-gray-300">
            Predictive model shows average <strong>{avgPredictedIncrease.toFixed(1)}%</strong> congestion 
            increase across zones. <strong>{worstImpactZone.zone}</strong> faces highest risk 
            (+{worstImpactZone.change.toFixed(1)}%). Key drivers: population growth without proportional 
            road expansion. High-growth zones need immediate infrastructure investment.
          </p>
        </div>
      </Card>

      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-500 dark:text-gray-400" />
          <div className="flex items-center gap-2">
            <Switch
              id="high-congestion-filter"
              checked={showHighCongestionOnly}
              onCheckedChange={setShowHighCongestionOnly}
            />
            <Label htmlFor="high-congestion-filter" className="text-slate-700 dark:text-gray-300">
              Show only &gt;70% congestion
            </Label>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-orange-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-gray-400">Average Congestion</p>
            <p className="text-slate-900 dark:text-white text-2xl">{avgCongestion.toFixed(1)}%</p>
            <p className="text-slate-600 dark:text-gray-400">Across all zones</p>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-red-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-gray-400">Most Congested</p>
            <p className="text-slate-900 dark:text-white text-2xl">
              {maxCongestionZone.Zone} - {maxCongestionZone.CongestionLevel}%
            </p>
            <p className="text-slate-600 dark:text-gray-400">{maxCongestionZone.Region}</p>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-green-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-gray-400">Least Congested</p>
            <p className="text-slate-900 dark:text-white text-2xl">
              {minCongestionZone.Zone} - {minCongestionZone.CongestionLevel}%
            </p>
            <p className="text-slate-600 dark:text-gray-400">{minCongestionZone.Region}</p>
          </div>
        </Card>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800">
          <TabsTrigger value="heatmap">Congestion Heatmap</TabsTrigger>
          <TabsTrigger value="comparison">Current vs Predicted</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Analysis</TabsTrigger>
        </TabsList>

        {/* Heatmap View */}
        <TabsContent value="heatmap" className="space-y-4">
          <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-slate-900 dark:text-white">Zone-wise Congestion Gradient</h3>
                <p className="text-slate-500 dark:text-gray-400">
                  {showHighCongestionOnly
                    ? `Showing ${displayZones.length} critical zones`
                    : 'All zones displayed'}
                </p>
              </div>
            </div>

            {/* Grid Heatmap */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {displayZones.map((zone) => {
                const congestionValue =
                  timeView === 'current'
                    ? zone.CongestionLevel
                    : calculatePredictedCongestion2034(zone);
                return (
                  <div
                    key={zone.Zone}
                    className="relative group cursor-pointer transition-all hover:scale-105"
                  >
                    <div
                      className="p-5 rounded-xl border-2"
                      style={{
                        backgroundColor: getCongestionColor(congestionValue) + '20',
                        borderColor: getCongestionColor(congestionValue),
                      }}
                    >
                      <div className="space-y-2">
                        <p className="text-slate-900 dark:text-white">{zone.Zone}</p>
                        <p
                          className="text-3xl"
                          style={{ color: getCongestionColor(congestionValue) }}
                        >
                          {congestionValue}%
                        </p>
                        <p className="text-slate-600 dark:text-gray-400">{zone.Region}</p>
                        {timeView === 'predicted' && (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs">
                              +{(congestionValue - zone.CongestionLevel).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toggle between views */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setTimeView('current')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeView === 'current'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                }`}
              >
                Current 2024
              </button>
              <button
                onClick={() => setTimeView('predicted')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeView === 'predicted'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                }`}
              >
                Predicted 2034
              </button>
            </div>
          </Card>
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="comparison" className="space-y-4">
          <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              <h3 className="text-slate-900 dark:text-white">Current vs Predicted Congestion (2034)</h3>
              <p className="text-slate-500 dark:text-gray-400">
                Forecast based on growth rate and infrastructure index
              </p>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={congestionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="zone" stroke="#6b7280" />
                  <YAxis domain={[0, 100]} label={{ value: 'Congestion %', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="current" name="Current 2024" radius={[4, 4, 0, 0]}>
                    {congestionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCongestionColor(entry.current)} />
                    ))}
                  </Bar>
                  <Bar dataKey="predicted" name="Predicted 2034" radius={[4, 4, 0, 0]}>
                    {congestionChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCongestionColor(entry.predicted)}
                        opacity={0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Change Analysis */}
          <Card className="p-6 space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              <h3 className="text-slate-900 dark:text-white">Projected Congestion Increase</h3>
              <p className="text-slate-500 dark:text-gray-400">Percentage point change by 2034</p>
            </div>
            <div className="space-y-2">
              {congestionChartData
                .sort((a, b) => b.change - a.change)
                .map((item) => (
                  <div key={item.zone} className="flex items-center gap-3">
                    <div className="w-24">
                      <p className="text-slate-900 dark:text-white">{item.zone}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{
                              width: `${(item.change / 20) * 100}%`,
                              backgroundColor:
                                item.change > 10 ? '#ef4444' : item.change > 5 ? '#f59e0b' : '#10b981',
                            }}
                          />
                        </div>
                        <span
                          className="text-sm min-w-[60px] text-right"
                          style={{
                            color: item.change > 10 ? '#ef4444' : item.change > 5 ? '#f59e0b' : '#10b981',
                          }}
                        >
                          +{item.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>

        {/* Temporal Analysis */}
        <TabsContent value="temporal" className="space-y-4">
          <Card className="p-5 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-red-900 dark:text-red-100">High Priority Zones for Intervention</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {delhiZones
                  .filter((z) => z.CongestionLevel > 70)
                  .map((zone) => (
                    <div
                      key={zone.Zone}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-900 dark:text-white">{zone.Zone}</p>
                          <p className="text-slate-600 dark:text-gray-400">{zone.Region}</p>
                        </div>
                        <p className="text-red-600 dark:text-red-400 text-xl">{zone.CongestionLevel}%</p>
                      </div>
                      <p className="text-slate-500 dark:text-gray-500 mt-2">
                        Predicted 2034: {calculatePredictedCongestion2034(zone)}%
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-slate-600 dark:text-gray-400">Low (&lt;45%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-slate-600 dark:text-gray-400">Moderate (45-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-slate-600 dark:text-gray-400">High (60-75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-slate-600 dark:text-gray-400">Critical (&gt;75%)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

