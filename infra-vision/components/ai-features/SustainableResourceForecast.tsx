'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Brain, TrendingUp, TrendingDown, Droplet, Zap, Trash2, Activity, Target } from 'lucide-react';

interface HistoricalData {
  year: number;
  water_consumption: number;
  energy_consumption: number;
  waste_generation: number;
  efficiency_index: number;
  sustainability_score: number;
}

interface ForecastData {
  years: number[];
  water: number[];
  energy: number[];
  waste: number[];
  efficiency: number[];
  score: number[];
}

export function SustainableResourceForecast() {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sustainable-resource-forecast');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setHistoricalData(data.historical);
        setForecastData(data.predictions);
        setInsights(data.insights);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine historical and forecast data for charts
  const combinedData = historicalData.map((h, i) => ({
    year: h.year,
    water: h.water_consumption,
    energy: h.energy_consumption,
    waste: h.waste_generation,
    efficiency: h.efficiency_index * 100, // Convert to percentage for display
    score: h.sustainability_score,
    isForecast: false
  })).concat(
    forecastData ? forecastData.years.map((year, i) => ({
      year,
      water: forecastData.water[i],
      energy: forecastData.energy[i],
      waste: forecastData.waste[i],
      efficiency: forecastData.efficiency[i] * 100,
      score: forecastData.score[i],
      isForecast: true
    })) : []
  );

  // Radar chart data (latest year + forecast average)
  const radarData = historicalData.length > 0 && forecastData ? [
    {
      metric: 'Water',
      historical: historicalData[historicalData.length - 1].water_consumption / 200, // Normalize
      forecast: forecastData.water[forecastData.water.length - 1] / 200
    },
    {
      metric: 'Energy',
      historical: historicalData[historicalData.length - 1].energy_consumption / 20, // Normalize
      forecast: forecastData.energy[forecastData.energy.length - 1] / 20
    },
    {
      metric: 'Waste',
      historical: historicalData[historicalData.length - 1].waste_generation / 1, // Normalize
      forecast: forecastData.waste[forecastData.waste.length - 1] / 1
    },
    {
      metric: 'Efficiency',
      historical: historicalData[historicalData.length - 1].efficiency_index * 100,
      forecast: forecastData.efficiency[forecastData.efficiency.length - 1] * 100
    },
    {
      metric: 'Score',
      historical: historicalData[historicalData.length - 1].sustainability_score,
      forecast: forecastData.score[forecastData.score.length - 1]
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading forecast data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              🧠 AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="p-4 bg-gray-800 rounded-xl border border-gray-700"
                >
                  <p className="text-gray-200">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Line Chart - Water, Energy, Waste (2013-2027) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              📈 Resource Consumption Trends (2013-2027)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Water (L/capita/day) & Waste (kg/capita/day)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Energy (kWh/capita/day)', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <ReferenceLine x={2022} stroke="#f59e0b" strokeDasharray="3 3" label="Current" />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="water" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  name="Water (L/capita/day)"
                  dot={{ fill: '#06b6d4', r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Energy (kWh/capita/day)"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  strokeDasharray={combinedData.map(d => d.isForecast ? "5 5" : "0").join(',')}
                  name="Waste (kg/capita/day)"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Radar Chart - Sustainability Score by Resource */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              🌀 Sustainability Score by Resource
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Radar 
                  name="Historical (2022)" 
                  dataKey="historical" 
                  stroke="#06b6d4" 
                  fill="#06b6d4" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Forecast (2027)" 
                  dataKey="forecast" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Area Chart - Efficiency over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              📉 Efficiency Index Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={combinedData}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <ReferenceLine x={2022} stroke="#f59e0b" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#colorEfficiency)" 
                  name="Efficiency Index (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sustainability Score Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              🎯 Sustainability Score Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Sustainability Score', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <ReferenceLine x={2022} stroke="#f59e0b" strokeDasharray="3 3" label="Current" />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Sustainability Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray={combinedData.map(d => d.isForecast ? "5 5" : "0").join(',')}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

