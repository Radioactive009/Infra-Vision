'use client';

import { Card } from '@/components/ai-features/components/ui/card';
import { Badge } from '@/components/ai-features/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ZoneData, getGrowthCategory, getGrowthColor } from '@/components/ai-features/data/delhiZonesData';

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
            <h3 className="text-slate-900 dark:text-white">{zone.Zone}</h3>
            <p className="text-slate-500 dark:text-gray-400">{zone.Region}</p>
          </div>
          <Badge variant={getGrowthBadgeVariant(growthCategory) as any} className="ml-2">
            {growthCategory} Growth
          </Badge>
        </div>

        {/* Index Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-slate-500 dark:text-gray-400">Base Index 2024</p>
            <p className="text-slate-900 dark:text-white">{zone.BaseIndex2024}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 dark:text-gray-400">Forecast 2034</p>
            <p className="text-slate-900 dark:text-white">{zone.ForecastIndex2034}</p>
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-1" style={{ color: growthColor }}>
            {getTrendIcon()}
            <span>{growthPercent.toFixed(1)}%</span>
          </div>
          <span className="text-slate-600 dark:text-gray-300">growth over 10 years</span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-slate-500 dark:text-gray-400">Infra Score</p>
            <p className="text-slate-900 dark:text-white">{zone.InfrastructureIndex}/100</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-gray-400">Growth Rate</p>
            <p className="text-slate-900 dark:text-white">{zone.GrowthRate}%/year</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 flex-wrap">
          <div className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            {zone.ParkCount} Parks
          </div>
          <div className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
            {zone.SchoolCount} Schools
          </div>
          <div className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
            {zone.HospitalCount} Hospitals
          </div>
        </div>
      </div>
    </Card>
  );
}

