import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ZoneData, getGrowthCategory, getGrowthColor } from "../data/delhiZonesData";

interface ZoneForecastCardProps {
  zone: ZoneData;
}

export function ZoneForecastCard({ zone }: ZoneForecastCardProps) {
  const growthPercent = ((zone.ForecastIndex2034 - zone.BaseIndex2024) / zone.BaseIndex2024) * 100;
  const growthCategory = getGrowthCategory(zone.GrowthRate);
  const growthColor = getGrowthColor(zone.GrowthRate);

  const getTrendIcon = () => {
    if (growthPercent > 8) return <TrendingUp className="w-4 h-4" />;
    if (growthPercent < 3) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getGrowthBadgeVariant = (category: string) => {
    if (category === "High") return "default";
    if (category === "Medium") return "secondary";
    return "outline";
  };

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: growthColor }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-slate-900">{zone.Zone}</h3>
            <p className="text-slate-500">{zone.Region}</p>
          </div>
          <Badge variant={getGrowthBadgeVariant(growthCategory)} className="ml-2">
            {growthCategory} Growth
          </Badge>
        </div>

        {/* Index Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-slate-500">Base Index 2024</p>
            <p className="text-slate-900">{zone.BaseIndex2024}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500">Forecast 2034</p>
            <p className="text-slate-900">{zone.ForecastIndex2034}</p>
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1" style={{ color: growthColor }}>
            {getTrendIcon()}
            <span>{growthPercent.toFixed(1)}%</span>
          </div>
          <span className="text-slate-600">growth over 10 years</span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-slate-500">Infra Score</p>
            <p className="text-slate-900">{zone.InfrastructureIndex}/100</p>
          </div>
          <div>
            <p className="text-slate-500">Growth Rate</p>
            <p className="text-slate-900">{zone.GrowthRate}%/year</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 flex-wrap">
          <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
            {zone.ParkCount} Parks
          </div>
          <div className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
            {zone.SchoolCount} Schools
          </div>
          <div className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
            {zone.HospitalCount} Hospitals
          </div>
        </div>
      </div>
    </Card>
  );
}
