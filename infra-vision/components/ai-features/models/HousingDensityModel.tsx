'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Home, Brain, TrendingUp, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { formatZoneDisplay, getZoneRegion } from './zoneMapping';

interface HousingData {
  zone: string;
  year: number;
  populationDensity: number;
  housingUnits: number;
  areaSize: number; // Calculated
  growthRate: number;
}

// Linear regression for housing units prediction
function trainHousingModel(data: HousingData[]) {
  const zones = Array.from(new Set(data.map(d => d.zone)));
  const zoneMap = new Map(zones.map((z, i) => [z, i]));
  
  const X: number[][] = [];
  const y: number[] = [];
  
  data.forEach(row => {
    const zoneEncoded = zoneMap.get(row.zone) || 0;
    
    X.push([
      row.populationDensity,
      zoneEncoded,
      row.areaSize,
      row.growthRate,
      row.year
    ]);
    y.push(row.housingUnits);
  });
  
  // Simple linear regression
  const n = X.length;
  const features = 5;
  
  const means = Array(features).fill(0).map((_, i) => 
    X.reduce((sum, row) => sum + row[i], 0) / n
  );
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  const XCentered = X.map(row => row.map((val, i) => val - means[i]));
  const yCentered = y.map(val => val - yMean);
  
  const coefficients: number[] = [];
  for (let i = 0; i < features; i++) {
    let numerator = 0;
    let denominator = 0;
    
    for (let j = 0; j < n; j++) {
      numerator += XCentered[j][i] * yCentered[j];
      denominator += XCentered[j][i] * XCentered[j][i];
    }
    
    coefficients.push(denominator > 0 ? numerator / denominator : 0);
  }
  
  const intercept = yMean - coefficients.reduce((sum, coef, i) => sum + coef * means[i], 0);
  
  // Calculate R²
  const predictions = X.map(row => 
    intercept + coefficients.reduce((sum, coef, i) => sum + coef * row[i], 0)
  );
  const ssRes = y.reduce((sum, actual, i) => sum + Math.pow(actual - predictions[i], 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);
  
  return {
    coefficients,
    intercept,
    means,
    zoneMap,
    r2,
    predict: (populationDensity: number, zone: string, areaSize: number, growthRate: number, year: number) => {
      const zoneEncoded = zoneMap.get(zone) || 0;
      const features = [populationDensity, zoneEncoded, areaSize, growthRate, year];
      const basePrediction = intercept + coefficients.reduce((sum, coef, i) => sum + coef * features[i], 0);
      
      // Apply 5-year growth projection
      const growthFactor = Math.pow(1 + growthRate / 100, 5);
      return Math.max(0, basePrediction * growthFactor);
    }
  };
}

export function HousingDensityModel() {
  const [rawData, setRawData] = useState<HousingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ReturnType<typeof trainHousingModel> | null>(null);
  
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [populationDensity, setPopulationDensity] = useState<string>('15000');
  const [areaSize, setAreaSize] = useState<string>('10');
  const [growthRate, setGrowthRate] = useState<string>('4');
  const [year, setYear] = useState<string>('2024');
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<Array<{zone: string; current: number; predicted: number}>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/delhi_housing_density_and_road_network_extended.csv');
        if (!response.ok) throw new Error('Failed to load data');
        
        const text = await response.text();
        const parsed = Papa.parse<any>(text, { header: true, skipEmptyLines: true });
        
        const data: HousingData[] = parsed.data.map((row: any) => {
          const popDensity = parseFloat(row['Population Density (per sq km)']) || 0;
          const housingUnits = parseFloat(row['Housing Units']) || 0;
          const growthRate = parseFloat(row['Housing Growth Rate (%)']) || 0;
          
          // Calculate area size from population density and housing units
          // Area = Population / Density, but we'll use a proxy
          const areaSize = housingUnits > 0 && popDensity > 0 
            ? (housingUnits * 4.5) / popDensity // Average household size proxy
            : 10; // Default
          
          return {
            zone: row.Zone || '',
            year: parseInt(row.Year) || 0,
            populationDensity: popDensity,
            housingUnits,
            areaSize,
            growthRate
          };
        }).filter(d => d.zone && d.housingUnits > 0);
        
        setRawData(data);
        
        const trainedModel = trainHousingModel(data);
        setModel(trainedModel);
        
        if (data.length > 0) {
          const zones = Array.from(new Set(data.map(d => d.zone)));
          setSelectedZone(zones[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const zones = useMemo(() => Array.from(new Set(rawData.map(d => d.zone))).sort(), [rawData]);

  useEffect(() => {
    if (model && selectedZone) {
      const predicted = model.predict(
        parseFloat(populationDensity),
        selectedZone,
        parseFloat(areaSize),
        parseFloat(growthRate),
        parseInt(year)
      );
      setPrediction(predicted);
      
      // Generate comparison data for all zones
      const latestYear = Math.max(...rawData.map(d => d.year));
      const latestData = rawData.filter(d => d.year === latestYear);
      const comparison = zones.slice(0, 10).map(zone => {
        const zoneData = latestData.find(d => d.zone === zone);
        if (!zoneData) return null;
        
        const predicted = model.predict(
          zoneData.populationDensity,
          zone,
          zoneData.areaSize,
          zoneData.growthRate,
          latestYear + 5
        );
        
        return {
          zone: formatZoneDisplay(zone),
          current: zoneData.housingUnits,
          predicted
        };
      }).filter(Boolean) as Array<{zone: string; current: number; predicted: number}>;
      
      setComparisonData(comparison);
    }
  }, [model, selectedZone, populationDensity, areaSize, growthRate, year, rawData, zones]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-green-400" />
            Housing Density Distribution - 5 Year Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {model && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">Model Performance</span>
              </div>
              <p className="text-gray-300 text-sm">R² Score: <span className="text-green-400 font-bold">{(model.r2 * 100).toFixed(2)}%</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone" className="text-gray-300">Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone} value={zone}>
                      {formatZoneDisplay(zone)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="populationDensity" className="text-gray-300">Population Density (per sq km)</Label>
              <Input
                id="populationDensity"
                type="number"
                value={populationDensity}
                onChange={(e) => setPopulationDensity(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaSize" className="text-gray-300">Area Size (sq km)</Label>
              <Input
                id="areaSize"
                type="number"
                step="0.1"
                value={areaSize}
                onChange={(e) => setAreaSize(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="growthRate" className="text-gray-300">Growth Rate (%)</Label>
              <Input
                id="growthRate"
                type="number"
                step="0.1"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-gray-300">Base Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {prediction !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-xl p-6 border border-green-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Expected Housing Units (5 Years)</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {selectedZone} - {getZoneRegion(selectedZone)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">Projected Housing Units in {parseInt(year) + 5}</p>
                  <p className="text-4xl font-bold text-green-400">{Math.round(prediction).toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-2">units</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Growth Projection</span>
                    <span className="text-green-400 font-semibold">+{parseFloat(growthRate).toFixed(1)}% annually</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Comparison Chart */}
          {comparisonData.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4">Zone Comparison: Current vs 5-Year Projection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="zone" 
                    stroke="#9ca3af" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickFormatter={(value) => value.split(' - ')[0]}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" name="Current Housing Units" fill="#10b981" radius={4} />
                  <Bar dataKey="predicted" name="Predicted (5 Years)" fill="#34d399" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

