import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { RoadNetworkDashboard } from "./RoadNetworkDashboard";
import { HousingDensityAnalysis } from "./HousingDensityAnalysis";
import { TrafficCongestionHeatmap } from "./TrafficCongestionHeatmap";
import { InfrastructureDistribution } from "./InfrastructureDistribution";
import { delhiZones } from "../data/delhiZonesData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Area,
  Cell,
} from "recharts@2.15.2";
import {
  Map,
  Home,
  AlertCircle,
  Building2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export function AdvancedDataVisualization() {
  const [activeTab, setActiveTab] = useState("forecasts");

  // Prepare data for overview charts
  const zoneOverviewData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    base2024: zone.BaseIndex2024,
    forecast2034: zone.ForecastIndex2034,
    growthRate: zone.GrowthRate,
    congestion: zone.CongestionLevel,
    infrastructure: zone.InfrastructureIndex,
  }));

  // Calculate key statistics
  const avgGrowthRate =
    delhiZones.reduce((sum, z) => sum + z.GrowthRate, 0) / delhiZones.length;
  const highGrowthZones = delhiZones.filter((z) => z.GrowthRate >= 4.0);
  const criticalCongestionZones = delhiZones.filter((z) => z.CongestionLevel > 70);
  const lowInfraZones = delhiZones.filter((z) => z.InfrastructureIndex < 65);

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              <div>
                <h1 className="text-white">Delhi Urban Growth Analysis (2024–2034)</h1>
                <p className="text-blue-100">
                  Zone-wise forecasting & infrastructure insights
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {delhiZones.length} Zones
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                10-Year Forecast
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="forecasts" className="flex items-center gap-2 py-3">
              <TrendingUp className="w-4 h-4" />
              Zone Forecasts
            </TabsTrigger>
            <TabsTrigger value="roads" className="flex items-center gap-2 py-3">
              <Map className="w-4 h-4" />
              Road Network
            </TabsTrigger>
            <TabsTrigger value="housing" className="flex items-center gap-2 py-3">
              <Home className="w-4 h-4" />
              Housing Density
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-2 py-3">
              <AlertCircle className="w-4 h-4" />
              Traffic & Congestion
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="flex items-center gap-2 py-3">
              <Building2 className="w-4 h-4" />
              Infrastructure
            </TabsTrigger>
          </TabsList>

          {/* Zone Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-6">
            {/* Key Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="space-y-1">
                  <p className="text-green-700">Avg Growth Rate</p>
                  <p className="text-green-900 text-3xl">{avgGrowthRate.toFixed(1)}%</p>
                  <p className="text-green-600">per year across zones</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="space-y-1">
                  <p className="text-blue-700">High Growth Zones</p>
                  <p className="text-blue-900 text-3xl">{highGrowthZones.length}</p>
                  <p className="text-blue-600">zones with ≥4% growth</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="space-y-1">
                  <p className="text-red-700">Critical Congestion</p>
                  <p className="text-red-900 text-3xl">{criticalCongestionZones.length}</p>
                  <p className="text-red-600">zones &gt;70% congested</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="space-y-1">
                  <p className="text-orange-700">Low Infrastructure</p>
                  <p className="text-orange-900 text-3xl">{lowInfraZones.length}</p>
                  <p className="text-orange-600">zones needing improvement</p>
                </div>
              </Card>
            </div>

            {/* Main Forecast Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Growth Index: 2024 vs 2034 */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-900">Growth Index Forecast (2024 → 2034)</h3>
                    <p className="text-slate-600">Comparing current and predicted development indices</p>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={zoneOverviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="zone" />
                        <YAxis domain={[40, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="base2024" fill="#60a5fa" name="Base Index 2024" />
                        <Bar dataKey="forecast2034" fill="#34d399" name="Forecast 2034" />
                        <Line
                          type="monotone"
                          dataKey="infrastructure"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Current Infrastructure"
                          dot={{ r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Growth Rate Analysis */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-900">Annual Growth Rate by Zone</h3>
                    <p className="text-slate-600">Percentage growth per year with trend analysis</p>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={zoneOverviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="zone" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="growthRate" name="Growth Rate %" radius={[4, 4, 0, 0]}>
                          {zoneOverviewData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.growthRate >= 4
                                  ? "#10b981"
                                  : entry.growthRate >= 3
                                  ? "#f59e0b"
                                  : "#ef4444"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>

            {/* Infrastructure vs Growth Correlation */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-900">Infrastructure Quality vs Growth Rate Correlation</h3>
                  <p className="text-slate-600">
                    Shows relationship between infrastructure index and projected growth
                  </p>
                </div>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={zoneOverviewData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis yAxisId="left" domain={[0, 5]} />
                      <YAxis yAxisId="right" orientation="right" domain={[40, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="infrastructure"
                        fill="#93c5fd"
                        stroke="#3b82f6"
                        name="Infrastructure Index"
                        fillOpacity={0.3}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="growthRate"
                        fill="#10b981"
                        name="Growth Rate %"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="growthRate"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        name="Growth Trend"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Key Analytical Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="space-y-3">
                  <h3 className="text-green-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    High Performing Zones - Sustainable Growth
                  </h3>
                  <div className="space-y-2">
                    {highGrowthZones.map((zone) => (
                      <div key={zone.Zone} className="p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-green-900">{zone.Zone} - {zone.Region}</p>
                            <p className="text-green-700">
                              Growth: {zone.GrowthRate}%/yr | Infrastructure: {zone.InfrastructureIndex}/100
                            </p>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            +{((zone.ForecastIndex2034 - zone.BaseIndex2024) / zone.BaseIndex2024 * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-green-600 text-sm mt-2">
                          ✓ {zone.InfrastructureIndex > 80 ? "Excellent infrastructure supports rapid growth" : "Good growth momentum with adequate infrastructure"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-orange-50 border-orange-200">
                <div className="space-y-3">
                  <h3 className="text-orange-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Priority Zones - Need Intervention
                  </h3>
                  <div className="space-y-2">
                    {[...criticalCongestionZones, ...lowInfraZones]
                      .filter((zone, index, self) => self.findIndex(z => z.Zone === zone.Zone) === index)
                      .slice(0, 4)
                      .map((zone) => (
                        <div key={zone.Zone} className="p-3 bg-white rounded-lg border border-orange-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-orange-900">{zone.Zone} - {zone.Region}</p>
                              <p className="text-orange-700">
                                Congestion: {zone.CongestionLevel}% | Infrastructure: {zone.InfrastructureIndex}/100
                              </p>
                            </div>
                            <Badge variant="destructive">
                              Alert
                            </Badge>
                          </div>
                          <p className="text-orange-600 text-sm mt-2">
                            ⚠ {zone.CongestionLevel > 70 ? "High congestion - expand road network" : "Low infrastructure - add essential services"}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Road Network Tab */}
          <TabsContent value="roads">
            <RoadNetworkDashboard />
          </TabsContent>

          {/* Housing Tab */}
          <TabsContent value="housing">
            <HousingDensityAnalysis />
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic">
            <TrafficCongestionHeatmap />
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure">
            <InfrastructureDistribution />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}