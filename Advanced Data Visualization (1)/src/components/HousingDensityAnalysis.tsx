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
} from "recharts@2.15.2";
import { Card } from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./ui/chart";
import { delhiZones } from "../data/delhiZonesData";
import { Home, Users, TrendingUp } from "lucide-react";

const chartConfig = {
  housingDensity: {
    label: "Housing Density",
    color: "#3b82f6",
  },
  populationDensity: {
    label: "Population Density",
    color: "#8b5cf6",
  },
  growthRate: {
    label: "Growth Rate",
    color: "#10b981",
  },
  infrastructureIndex: {
    label: "Infrastructure Index",
    color: "#f59e0b",
  },
};

export function HousingDensityAnalysis() {
  // Prepare data for housing density bar chart
  const housingData = delhiZones
    .map((zone) => ({
      zone: zone.Zone,
      housingDensity: zone.HousingDensity,
      populationDensity: zone.PopulationDensity,
      region: zone.Region,
    }))
    .sort((a, b) => b.housingDensity - a.housingDensity);

  // Prepare data for growth vs infrastructure
  const growthInfraData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    growthRate: zone.GrowthRate,
    infrastructureIndex: zone.InfrastructureIndex,
    housingDensity: zone.HousingDensity,
  }));

  // Bubble chart data: Population vs Housing vs Parks
  const bubbleData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    populationDensity: zone.PopulationDensity,
    housingDensity: zone.HousingDensity,
    parkCount: zone.ParkCount,
    greenArea: zone.GreenAreaPercent,
  }));

  // Calculate housing saturation (housing density vs infrastructure)
  const saturationData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    saturation: (zone.HousingDensity / zone.InfrastructureIndex) * 10,
    housingDensity: zone.HousingDensity,
    infrastructureIndex: zone.InfrastructureIndex,
  }));

  const getSaturationColor = (saturation: number) => {
    if (saturation > 80) return "#ef4444";
    if (saturation > 65) return "#f59e0b";
    return "#10b981";
  };

  const highestDensityZone = housingData[0];
  const lowestDensityZone = housingData[housingData.length - 1];
  const avgHousing = Math.round(
    delhiZones.reduce((sum, z) => sum + z.HousingDensity, 0) / delhiZones.length
  );

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-700">Average Density</p>
          <p className="text-blue-900 text-2xl">{avgHousing.toLocaleString()}</p>
          <p className="text-blue-600">units/km²</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-purple-700">Highest Density</p>
          <p className="text-purple-900 text-2xl">{highestDensityZone.zone}</p>
          <p className="text-purple-600">{highestDensityZone.housingDensity.toLocaleString()} units/km²</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700">Fastest Growth</p>
          <p className="text-green-900 text-2xl">
            {[...delhiZones].sort((a, b) => b.GrowthRate - a.GrowthRate)[0].Zone}
          </p>
          <p className="text-green-600">
            {[...delhiZones].sort((a, b) => b.GrowthRate - a.GrowthRate)[0].GrowthRate}%/year
          </p>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <p className="text-orange-700">Saturated Zones</p>
          <p className="text-orange-900 text-2xl">
            {saturationData.filter((z) => z.saturation > 80).length}
          </p>
          <p className="text-orange-600">need intervention</p>
        </Card>
      </div>

      {/* Analysis Insight */}
      <Card className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="space-y-2">
          <h3 className="text-slate-900">📊 Housing Saturation Analysis</h3>
          <p className="text-slate-700">
            Zones with high housing density but low infrastructure scores show saturation indices &gt;80. 
            These areas risk overcrowding without proportional service expansion. Correlation analysis reveals 
            zones with green area &gt;15% sustain higher densities more effectively. Priority: increase green 
            spaces and schools in high-saturation zones.
          </p>
        </div>
      </Card>

      {/* Housing Density by Zone */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-slate-900">Housing Units per km² by Zone</h3>
          <p className="text-slate-500">Sorted by housing density (highest to lowest)</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <BarChart data={housingData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="zone" type="category" width={80} />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
                      <p className="text-slate-900">{data.zone}</p>
                      <p className="text-slate-600">{data.region}</p>
                      <p className="text-blue-600">
                        Housing: {data.housingDensity.toLocaleString()} units/km²
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="housingDensity"
              fill="var(--color-housingDensity)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Growth Rate vs Infrastructure Index */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-slate-900">Growth Rate vs Infrastructure</h3>
            <p className="text-slate-500">Dual-axis comparison showing relationship</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthInfraData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis yAxisId="left" label={{ value: "Growth Rate %", angle: -90, position: "insideLeft" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Infrastructure Index", angle: 90, position: "insideRight" }}
                />
                <ChartTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="growthRate" fill="#10b981" name="Growth Rate %" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="infrastructureIndex"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Infrastructure Index"
                  dot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Housing Saturation Heatmap */}
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-slate-900">Housing Saturation Index</h3>
            <p className="text-slate-500">Housing density relative to infrastructure capacity</p>
          </div>
          <div className="space-y-3 h-[320px] overflow-y-auto">
            {saturationData
              .sort((a, b) => b.saturation - a.saturation)
              .map((item) => (
                <div
                  key={item.zone}
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: getSaturationColor(item.saturation) + "10",
                    borderLeftColor: getSaturationColor(item.saturation),
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-900">{item.zone}</p>
                      <p className="text-slate-600">
                        {item.housingDensity} units/km² | Infra: {item.infrastructureIndex}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl"
                        style={{ color: getSaturationColor(item.saturation) }}
                      >
                        {item.saturation.toFixed(0)}
                      </p>
                      <p className="text-slate-500">saturation</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Bubble Chart: Population vs Housing vs Parks */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-slate-900">
            Population Density vs Housing Density (sized by Green Area)
          </h3>
          <p className="text-slate-500">
            Bubble size represents percentage of green area in each zone
          </p>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="populationDensity"
                name="Population Density"
                unit=" /km²"
                domain={[14000, 33000]}
              />
              <YAxis
                type="number"
                dataKey="housingDensity"
                name="Housing Density"
                unit=" units/km²"
                domain={[3000, 7500]}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
                        <p className="text-slate-900">{data.zone}</p>
                        <p className="text-slate-600">
                          Population: {data.populationDensity.toLocaleString()}/km²
                        </p>
                        <p className="text-slate-600">
                          Housing: {data.housingDensity.toLocaleString()} units/km²
                        </p>
                        <p className="text-green-600">
                          {data.parkCount} parks ({data.greenArea}% green area)
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
            <span className="text-slate-600">High Green Area (&gt;15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-slate-600">Medium Green Area (10-15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-slate-600">Low Green Area (&lt;10%)</span>
          </div>
        </div>
      </Card>


    </div>
  );
}
