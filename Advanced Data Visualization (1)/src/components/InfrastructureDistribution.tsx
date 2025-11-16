import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts@2.15.2";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  delhiZones,
  calculateResidentsPerSchool,
  calculateResidentsPerHospital,
} from "../data/delhiZonesData";
import { School, Hospital, Trees, AlertTriangle, Building2 } from "lucide-react";

export function InfrastructureDistribution() {
  // Prepare data for stacked bar chart - absolute counts
  const absoluteCountsData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    parks: zone.ParkCount,
    schools: zone.SchoolCount,
    hospitals: zone.HospitalCount,
  }));

  // Normalize per 10,000 residents (assuming 50 sq km per zone)
  const normalizedData = delhiZones.map((zone) => {
    const estimatedPopulation = (zone.PopulationDensity * 50) / 10000;
    return {
      zone: zone.Zone,
      parksPerCapita: (zone.ParkCount / estimatedPopulation).toFixed(2),
      schoolsPerCapita: (zone.SchoolCount / estimatedPopulation).toFixed(2),
      hospitalsPerCapita: (zone.HospitalCount / estimatedPopulation).toFixed(2),
      greenAreaPercent: zone.GreenAreaPercent,
    };
  });

  // Infrastructure ratios
  const ratiosData = delhiZones.map((zone) => ({
    zone: zone.Zone,
    parksPerSqKm: (zone.ParkCount / 50).toFixed(2),
    residentsPerSchool: calculateResidentsPerSchool(zone),
    residentsPerHospital: calculateResidentsPerHospital(zone),
    region: zone.Region,
  }));

  // Identify critical deficits
  const schoolDeficitZones = ratiosData.filter((z) => z.residentsPerSchool > 30);
  const hospitalDeficitZones = ratiosData.filter((z) => z.residentsPerHospital > 150);
  const greenDeficitZones = delhiZones.filter((z) => z.GreenAreaPercent < 8);

  // Radar chart data for comprehensive comparison (top 5 zones)
  const topZones = [...delhiZones]
    .sort((a, b) => b.InfrastructureIndex - a.InfrastructureIndex)
    .slice(0, 5);

  const radarData = [
    {
      metric: "Parks",
      ...Object.fromEntries(topZones.map((z) => [z.Zone, z.ParkCount])),
    },
    {
      metric: "Schools",
      ...Object.fromEntries(topZones.map((z) => [z.Zone, z.SchoolCount])),
    },
    {
      metric: "Hospitals",
      ...Object.fromEntries(topZones.map((z) => [z.Zone, z.HospitalCount * 5])), // Scale for visibility
    },
    {
      metric: "Green Area",
      ...Object.fromEntries(topZones.map((z) => [z.Zone, z.GreenAreaPercent * 2])),
    },
  ];

  // Calculate totals
  const totalParks = delhiZones.reduce((sum, z) => sum + z.ParkCount, 0);
  const totalSchools = delhiZones.reduce((sum, z) => sum + z.SchoolCount, 0);
  const totalHospitals = delhiZones.reduce((sum, z) => sum + z.HospitalCount, 0);
  const criticalZones = new Set([
    ...schoolDeficitZones.map((z) => z.zone),
    ...hospitalDeficitZones.map((z) => z.zone),
    ...greenDeficitZones.map((z) => z.Zone),
  ]).size;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700">Total Parks</p>
          <p className="text-green-900 text-2xl">{totalParks}</p>
          <p className="text-green-600">across {delhiZones.length} zones</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-700">Total Schools</p>
          <p className="text-blue-900 text-2xl">{totalSchools}</p>
          <p className="text-blue-600">educational facilities</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-purple-700">Total Hospitals</p>
          <p className="text-purple-900 text-2xl">{totalHospitals}</p>
          <p className="text-purple-600">healthcare centers</p>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <p className="text-orange-700">Critical Zones</p>
          <p className="text-orange-900 text-2xl">{criticalZones}</p>
          <p className="text-orange-600">need intervention</p>
        </Card>
      </div>

      {/* Analysis Insight */}
      <Card className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="space-y-2">
          <h3 className="text-slate-900">📊 Infrastructure Equity Analysis</h3>
          <p className="text-slate-700">
            Per-capita analysis reveals <strong>{criticalZones}</strong> zones with critical deficits. 
            School shortage affects {schoolDeficitZones.length} zones (&gt;30K residents/school). 
            Hospital access worst in {hospitalDeficitZones.length} zones (&gt;150K residents/hospital). 
            Green space deficit (&lt;8%) impacts {greenDeficitZones.length} high-density areas. 
            Priority: equitable distribution before expanding high-infra zones.
          </p>
        </div>
      </Card>

      {/* Deficit Alerts */}
      {(schoolDeficitZones.length > 0 ||
        hospitalDeficitZones.length > 0 ||
        greenDeficitZones.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schoolDeficitZones.length > 0 && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <School className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-orange-900">School Shortage</p>
                  <p className="text-orange-700">
                    {schoolDeficitZones.length} zones with &gt;30K residents/school
                  </p>
                  <p className="text-orange-600 text-sm">
                    {schoolDeficitZones.map((z) => z.zone).join(", ")}
                  </p>
                </div>
              </div>
            </Card>
          )}
          {hospitalDeficitZones.length > 0 && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <Hospital className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-900">Hospital Shortage</p>
                  <p className="text-red-700">
                    {hospitalDeficitZones.length} zones with &gt;150K residents/hospital
                  </p>
                  <p className="text-red-600 text-sm">
                    {hospitalDeficitZones.map((z) => z.zone).join(", ")}
                  </p>
                </div>
              </div>
            </Card>
          )}
          {greenDeficitZones.length > 0 && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <Trees className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-900">Green Space Deficit</p>
                  <p className="text-yellow-700">
                    {greenDeficitZones.length} zones with &lt;8% green area
                  </p>
                  <p className="text-yellow-600 text-sm">
                    {greenDeficitZones.map((z) => z.Zone).join(", ")}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Absolute Counts - Stacked Bar Chart */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-slate-900">Infrastructure Count by Zone</h3>
          <p className="text-slate-500">Total number of parks, schools, and hospitals</p>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={absoluteCountsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Legend />
              <Bar dataKey="parks" stackId="a" fill="#10b981" name="Parks" />
              <Bar dataKey="schools" stackId="a" fill="#3b82f6" name="Schools" />
              <Bar dataKey="hospitals" stackId="a" fill="#8b5cf6" name="Hospitals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Normalized Per Capita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-slate-900">Per Capita Infrastructure</h3>
            <p className="text-slate-500">Normalized per 10,000 residents</p>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {normalizedData.map((item) => (
              <div key={item.zone} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-900">{item.zone}</p>
                  <Badge variant="outline">{item.greenAreaPercent}% green</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-green-600 text-lg">{item.parksPerCapita}</p>
                    <p className="text-slate-500">Parks/10K</p>
                  </div>
                  <div>
                    <p className="text-blue-600 text-lg">{item.schoolsPerCapita}</p>
                    <p className="text-slate-500">Schools/10K</p>
                  </div>
                  <div>
                    <p className="text-purple-600 text-lg">{item.hospitalsPerCapita}</p>
                    <p className="text-slate-500">Hospitals/10K</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ratios and Accessibility Metrics */}
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-slate-900">Accessibility Ratios</h3>
            <p className="text-slate-500">Residents per facility (lower is better)</p>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {ratiosData
              .sort((a, b) => b.residentsPerSchool - a.residentsPerSchool)
              .map((item) => (
                <div
                  key={item.zone}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-slate-900">{item.zone}</p>
                      <p className="text-slate-500">{item.region}</p>
                    </div>
                    <Badge
                      variant={
                        item.residentsPerSchool > 30 || item.residentsPerHospital > 150
                          ? "destructive"
                          : "default"
                      }
                    >
                      {item.residentsPerSchool > 30 || item.residentsPerHospital > 150
                        ? "Attention"
                        : "Adequate"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-2">
                        <School className="w-4 h-4" />
                        Residents/School
                      </span>
                      <span
                        className={
                          Number(item.residentsPerSchool) > 30
                            ? "text-red-600"
                            : "text-slate-900"
                        }
                      >
                        {item.residentsPerSchool.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-2">
                        <Hospital className="w-4 h-4" />
                        Residents/Hospital
                      </span>
                      <span
                        className={
                          Number(item.residentsPerHospital) > 150
                            ? "text-red-600"
                            : "text-slate-900"
                        }
                      >
                        {item.residentsPerHospital.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-2">
                        <Trees className="w-4 h-4" />
                        Parks/sq km
                      </span>
                      <span className="text-slate-900">{item.parksPerSqKm}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Comprehensive Radar Comparison */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-slate-900">Top 5 Zones - Infrastructure Comparison</h3>
          <p className="text-slate-500">Multi-dimensional view of best-performing zones</p>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              {topZones.map((zone, index) => (
                <Radar
                  key={zone.Zone}
                  name={zone.Zone}
                  dataKey={zone.Zone}
                  stroke={
                    ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][index]
                  }
                  fill={
                    ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][index]
                  }
                  fillOpacity={0.5}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Green Area Density Choropleth */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-slate-900">Green Area Coverage by Zone</h3>
          <p className="text-slate-500">Percentage of land covered by parks and green spaces</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...delhiZones]
            .sort((a, b) => b.GreenAreaPercent - a.GreenAreaPercent)
            .map((zone) => {
              const getGreenColor = (percent: number) => {
                if (percent >= 15) return "#10b981";
                if (percent >= 10) return "#84cc16";
                if (percent >= 8) return "#fbbf24";
                return "#ef4444";
              };

              return (
                <div
                  key={zone.Zone}
                  className="p-5 rounded-xl border-2"
                  style={{
                    backgroundColor: getGreenColor(zone.GreenAreaPercent) + "20",
                    borderColor: getGreenColor(zone.GreenAreaPercent),
                  }}
                >
                  <div className="space-y-2">
                    <p className="text-slate-900">{zone.Zone}</p>
                    <div className="flex items-baseline gap-1">
                      <p
                        className="text-3xl"
                        style={{ color: getGreenColor(zone.GreenAreaPercent) }}
                      >
                        {zone.GreenAreaPercent}%
                      </p>
                    </div>
                    <p className="text-slate-600">{zone.ParkCount} parks</p>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>


    </div>
  );
}
