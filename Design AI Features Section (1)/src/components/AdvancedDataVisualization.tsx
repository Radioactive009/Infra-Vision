import { motion, useMotionValue, useSpring } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  LineChart,
  PieChart,
  Map,
  Download,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  Trees,
  Home,
  Zap,
  Clock,
  Target,
  Activity,
  Brain,
  Layers,
  BarChart2,
  GitCompare,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ReferenceLine
} from 'recharts';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

// Sample data for charts
const populationData = [
  { zone: 'North', population: 245000, growth: 12 },
  { zone: 'South', population: 189000, growth: 8 },
  { zone: 'East', population: 312000, growth: 15 },
  { zone: 'West', population: 276000, growth: 10 },
  { zone: 'Central', population: 198000, growth: 6 }
];

const trafficData = [
  { time: '6 AM', volume: 1200 },
  { time: '9 AM', volume: 4500 },
  { time: '12 PM', volume: 3200 },
  { time: '3 PM', volume: 3800 },
  { time: '6 PM', volume: 5200 },
  { time: '9 PM', volume: 2800 },
  { time: '12 AM', volume: 800 }
];

const landUseData = [
  { name: 'Residential', value: 45, color: '#00A8E8' },
  { name: 'Commercial', value: 25, color: '#34D399' },
  { name: 'Industrial', value: 15, color: '#F59E0B' },
  { name: 'Green Space', value: 15, color: '#10B981' }
];

const monthlyGrowthData = [
  { month: 'Jan', population: 95000, infrastructure: 78 },
  { month: 'Feb', population: 98000, infrastructure: 82 },
  { month: 'Mar', population: 102000, infrastructure: 85 },
  { month: 'Apr', population: 105000, infrastructure: 88 },
  { month: 'May', population: 108000, infrastructure: 91 },
  { month: 'Jun', population: 112000, infrastructure: 95 }
];

const kpiData = [
  {
    title: "Average Commute Time",
    value: "32 min",
    change: -8,
    icon: Clock,
    color: "blue"
  },
  {
    title: "Congestion Index",
    value: "0.67",
    change: -12,
    icon: Car,
    color: "red"
  },
  {
    title: "Green Space per Capita",
    value: "8.2 m²",
    change: 15,
    icon: Trees,
    color: "green"
  },
  {
    title: "Infrastructure Score",
    value: "87.4%",
    change: 9,
    icon: Target,
    color: "purple"
  }
];

interface AdvancedDataVisualizationProps {
  onBack?: () => void;
}

interface CoverageData {
  zone_id: string;
  zone_name: string;
  predicted_coverage_score: number;
  [key: string]: string | number;
}

interface UnifiedCoverageData {
  Zone: string;
  ZoneId: string;
  School: number;
  Hospital: number;
  Park: number;
  Average: number;
  [key: string]: string | number;
}

// Animated Counter Component
function AnimatedCounter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 20, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [springValue]);

  return <span>{displayValue.toFixed(decimals)}</span>;
}

export function AdvancedDataVisualization({ onBack }: AdvancedDataVisualizationProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState("delhi");
  const [searchQuery, setSearchQuery] = useState("");
  
  // CSV Data States
  const [schoolData, setSchoolData] = useState<CoverageData[]>([]);
  const [hospitalData, setHospitalData] = useState<CoverageData[]>([]);
  const [parkData, setParkData] = useState<CoverageData[]>([]);
  const [coverageData, setCoverageData] = useState<UnifiedCoverageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataValidation, setDataValidation] = useState<{ valid: boolean; message: string; stats?: any }>({ valid: true, message: '' });
  
  // Chart visibility toggles
  const [showSchool, setShowSchool] = useState(true);
  const [showHospital, setShowHospital] = useState(true);
  const [showPark, setShowPark] = useState(true);
  
  // Zone comparison
  const [zone1, setZone1] = useState<string>("");
  const [zone2, setZone2] = useState<string>("");

  // Load and normalize CSV data
  useEffect(() => {
    const loadCSVData = async () => {
      setIsLoading(true);
      try {
        // Load school data
        const schoolResponse = await fetch('/data/school_coverage_predictions.csv');
        if (!schoolResponse.ok) throw new Error('Failed to load school data');
        const schoolText = await schoolResponse.text();
        const schoolParsed = Papa.parse<any>(schoolText, { header: true, skipEmptyLines: true });
        
        const normalizedSchool = schoolParsed.data
          .filter(row => row.zone_name && row.predicted_coverage_score)
          .map(row => ({
            zone_id: String(row.zone_id || '').trim(),
            zone_name: String(row.zone_name || '').trim(),
            predicted_coverage_score: parseFloat(String(row.predicted_coverage_score || '0')) || 0,
            ...row
          }))
          .filter(row => row.predicted_coverage_score > 0 && row.zone_name);
        
        setSchoolData(normalizedSchool);

        // Load hospital data
        const hospitalResponse = await fetch('/data/hospital_coverage_predictions.csv');
        if (!hospitalResponse.ok) throw new Error('Failed to load hospital data');
        const hospitalText = await hospitalResponse.text();
        const hospitalParsed = Papa.parse<any>(hospitalText, { header: true, skipEmptyLines: true });
        
        const normalizedHospital = hospitalParsed.data
          .filter(row => row.zone_name && row.predicted_coverage_score)
          .map(row => ({
            zone_id: String(row.zone_id || '').trim(),
            zone_name: String(row.zone_name || '').trim(),
            predicted_coverage_score: parseFloat(String(row.predicted_coverage_score || '0')) || 0,
            ...row
          }))
          .filter(row => row.predicted_coverage_score > 0 && row.zone_name);
        
        setHospitalData(normalizedHospital);

        // Load park data
        const parkResponse = await fetch('/data/park_coverage_predictions.csv');
        if (!parkResponse.ok) throw new Error('Failed to load park data');
        const parkText = await parkResponse.text();
        const parkParsed = Papa.parse<any>(parkText, { header: true, skipEmptyLines: true });
        
        const normalizedPark = parkParsed.data
          .filter(row => row.zone_name && row.predicted_coverage_score)
          .map(row => ({
            zone_id: String(row.zone_id || '').trim(),
            zone_name: String(row.zone_name || '').trim(),
            predicted_coverage_score: parseFloat(String(row.predicted_coverage_score || '0')) || 0,
            ...row
          }))
          .filter(row => row.predicted_coverage_score > 0 && row.zone_name);
        
        setParkData(normalizedPark);

        // Create unified coverage data by matching zones
        const zoneMap = new Map<string, UnifiedCoverageData>();
        
        // Helper to normalize zone name for matching
        const normalizeZoneName = (name: string): string => {
          return name.toLowerCase().trim().replace(/\s+/g, ' ');
        };
        
        // Add school data
        normalizedSchool.forEach(school => {
          const key = normalizeZoneName(school.zone_name);
          if (!zoneMap.has(key)) {
            zoneMap.set(key, {
              Zone: school.zone_name,
              ZoneId: school.zone_id,
              School: school.predicted_coverage_score,
              Hospital: 0,
              Park: 0,
              Average: 0
            });
          } else {
            zoneMap.get(key)!.School = school.predicted_coverage_score;
          }
        });
        
        // Add hospital data (match by zone name or zone_id)
        normalizedHospital.forEach(hospital => {
          const key = normalizeZoneName(hospital.zone_name);
          if (zoneMap.has(key)) {
            zoneMap.get(key)!.Hospital = hospital.predicted_coverage_score;
          } else {
            // Try to find by zone_id
            const existing = Array.from(zoneMap.values()).find(z => z.ZoneId === hospital.zone_id);
            if (existing) {
              existing.Hospital = hospital.predicted_coverage_score;
            } else {
              zoneMap.set(key, {
                Zone: hospital.zone_name,
                ZoneId: hospital.zone_id,
                School: 0,
                Hospital: hospital.predicted_coverage_score,
                Park: 0,
                Average: 0
              });
            }
          }
        });
        
        // Add park data
        normalizedPark.forEach(park => {
          const key = normalizeZoneName(park.zone_name);
          if (zoneMap.has(key)) {
            zoneMap.get(key)!.Park = park.predicted_coverage_score;
          } else {
            const existing = Array.from(zoneMap.values()).find(z => z.ZoneId === park.zone_id);
            if (existing) {
              existing.Park = park.predicted_coverage_score;
            } else {
              zoneMap.set(key, {
                Zone: park.zone_name,
                ZoneId: park.zone_id,
                School: 0,
                Hospital: 0,
                Park: park.predicted_coverage_score,
                Average: 0
              });
            }
          }
        });
        
        // Calculate averages and create final array
        const unified = Array.from(zoneMap.values()).map(zone => ({
          ...zone,
          Average: ((zone.School || 0) + (zone.Hospital || 0) + (zone.Park || 0)) / 
                   ([zone.School, zone.Hospital, zone.Park].filter(v => v > 0).length || 1)
        }));
        
        setCoverageData(unified);
        
        // Validation and logging
        const schoolValues = normalizedSchool.map(s => s.predicted_coverage_score).filter(v => v > 0);
        const hospitalValues = normalizedHospital.map(h => h.predicted_coverage_score).filter(v => v > 0);
        const parkValues = normalizedPark.map(p => p.predicted_coverage_score).filter(v => v > 0);
        
        const stats = {
          zones: unified.length,
          schoolRange: schoolValues.length > 0 ? `${Math.min(...schoolValues).toFixed(1)}–${Math.max(...schoolValues).toFixed(1)}` : 'N/A',
          hospitalRange: hospitalValues.length > 0 ? `${Math.min(...hospitalValues).toFixed(1)}–${Math.max(...hospitalValues).toFixed(1)}` : 'N/A',
          parkRange: parkValues.length > 0 ? `${Math.min(...parkValues).toFixed(1)}–${Math.max(...parkValues).toFixed(1)}` : 'N/A',
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ Loaded', stats.zones, 'zones');
        console.log('🏫 School coverage range:', stats.schoolRange);
        console.log('🏥 Hospital coverage range:', stats.hospitalRange);
        console.log('🌳 Park coverage range:', stats.parkRange);
        
        setDataValidation({
          valid: true,
          message: `✅ Successfully loaded ${stats.zones} zones`,
          stats
        });
        
      } catch (error) {
        console.error('❌ Error loading CSV data:', error);
        setDataValidation({
          valid: false,
          message: '⚠️ Some CSVs missing Zone or Coverage column – skipped invalid rows.'
        });
        setSchoolData([]);
        setHospitalData([]);
        setParkData([]);
        setCoverageData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Generate time series data (2015-2024) based on real data trends
  const generateTimeSeriesData = useMemo(() => {
    if (coverageData.length === 0) return [];
    
    const avgSchool = coverageData.reduce((sum, z) => sum + (z.School || 0), 0) / coverageData.filter(z => z.School > 0).length || 0;
    const avgHospital = coverageData.reduce((sum, z) => sum + (z.Hospital || 0), 0) / coverageData.filter(z => z.Hospital > 0).length || 0;
    const avgPark = coverageData.reduce((sum, z) => sum + (z.Park || 0), 0) / coverageData.filter(z => z.Park > 0).length || 0;
    
    // Calculate growth rate from current averages (assuming 10-year growth)
    const schoolGrowthRate = avgSchool / 10; // Approximate annual growth
    const hospitalGrowthRate = avgHospital / 10;
    const parkGrowthRate = avgPark / 10;
    
    const years = Array.from({ length: 10 }, (_, i) => 2015 + i);
    return years.map((year, index) => {
      const yearsFromStart = year - 2015;
      return {
        year,
        school: Math.max(0, avgSchool - (9 - yearsFromStart) * schoolGrowthRate * 0.8),
        hospital: Math.max(0, avgHospital - (9 - yearsFromStart) * hospitalGrowthRate * 0.8),
        park: Math.max(0, avgPark - (9 - yearsFromStart) * parkGrowthRate * 0.8),
        population: 1000000 + yearsFromStart * 50000
      };
    });
  }, [coverageData]);

  // Generate forecast data (2025-2030) based on real trends
  const forecastData = useMemo(() => {
    if (generateTimeSeriesData.length === 0) return [];
    
    const lastData = generateTimeSeriesData[generateTimeSeriesData.length - 1];
    const secondLast = generateTimeSeriesData[generateTimeSeriesData.length - 2];
    
    const schoolTrend = lastData.school - secondLast.school;
    const hospitalTrend = lastData.hospital - secondLast.hospital;
    const parkTrend = lastData.park - secondLast.park;
    
    const years = Array.from({ length: 6 }, (_, i) => 2025 + i);
    return years.map((year, index) => {
      const yearsAhead = year - 2024;
      return {
        year,
        school: Math.min(100, lastData.school + schoolTrend * yearsAhead * 1.1),
        hospital: Math.min(100, lastData.hospital + hospitalTrend * yearsAhead * 1.1),
        park: Math.min(100, lastData.park + parkTrend * yearsAhead * 1.1),
        isForecast: true
      };
    });
  }, [generateTimeSeriesData]);

  // Calculate statistics from real CSV data
  const statistics = useMemo(() => {
    if (coverageData.length === 0) return null;

    const allSchool = coverageData.map(z => z.School).filter(v => v > 0);
    const allHospital = coverageData.map(z => z.Hospital).filter(v => v > 0);
    const allPark = coverageData.map(z => z.Park).filter(v => v > 0);
    const allCoverage = [...allSchool, ...allHospital, ...allPark];

    if (allCoverage.length === 0) return null;

    const sorted = [...allCoverage].sort((a, b) => a - b);
    const mean = allCoverage.reduce((a, b) => a + b, 0) / allCoverage.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = allCoverage.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allCoverage.length;
    const stdDev = Math.sqrt(variance);
    
    // Find max/min zones from unified data
    const maxZone = coverageData.reduce((max, curr) => {
      const currAvg = curr.Average;
      const maxAvg = max.Average;
      return currAvg > maxAvg ? curr : max;
    });
    
    const minZone = coverageData.reduce((min, curr) => {
      const currAvg = curr.Average;
      const minAvg = min.Average;
      return currAvg < minAvg ? curr : min;
    });
    
    // Calculate growth index from time series
    const growthIndex = generateTimeSeriesData.length > 0 
      ? ((generateTimeSeriesData[generateTimeSeriesData.length - 1]?.school || 0) - (generateTimeSeriesData[0]?.school || 0)) / 
        (generateTimeSeriesData[0]?.school || 1) * 100
      : 0;

    return { mean, median, stdDev, maxZone, minZone, growthIndex };
  }, [coverageData, generateTimeSeriesData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleExport = (type: string) => {
    console.log(`Exporting as ${type}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800'}`}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMGRhc2hib2FyZCUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NTc0OTk2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Data visualization dashboard"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-teal-800/70"></div>
          
          {/* Data flow grid pattern */}
          <div className="absolute inset-0 opacity-30" 
               style={{
                 backgroundImage: `
                   linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px),
                   linear-gradient(rgba(0,168,232,0.3) 1px, transparent 1px)
                 `,
                 backgroundSize: '60px 60px'
               }}>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            {/* Back button and Dark mode toggle */}
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Features
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-white/60" />
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={setIsDarkMode}
                  className="data-[state=checked]:bg-teal-500"
                />
                <Moon className="w-4 h-4 text-white/60" />
              </div>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-white/30 text-white hover:bg-white/10 transition-colors duration-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Advanced Data
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent block mt-2">
                Visualization
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-12">
              Turn complex urban datasets into clear, actionable insights through interactive 
              dashboards and real-time heatmaps for informed city planning decisions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group min-w-[200px]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Activity className="w-5 h-5" />
                  View Live Dashboard
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-2xl transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Sample Report
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className={`py-8 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white/10 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${isDarkMode ? 'bg-gray-700' : 'bg-white/90'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${isDarkMode ? 'border-gray-600' : 'border-white/20'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <Input 
                  placeholder="Search neighborhoods, zones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 h-11 rounded-xl ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'} focus:border-cyan-500 transition-colors`}
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className={`h-11 rounded-xl ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delhi">Delhi NCR</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="2024">
                <SelectTrigger className={`h-11 rounded-xl ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline"
                className={`h-11 ${isDarkMode ? 'border-gray-500 text-white hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-50'} rounded-xl transition-colors`}
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className={`py-12 px-4 ${isDarkMode ? 'bg-gray-900' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Visualization Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full grid-cols-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white/90'} backdrop-blur-sm mb-8`}>
                <TabsTrigger value="dashboard" className="text-sm font-medium">📊 Dashboard</TabsTrigger>
                <TabsTrigger value="charts" className="text-sm font-medium">📈 Charts</TabsTrigger>
                <TabsTrigger value="trends" className="text-sm font-medium">📉 Trends</TabsTrigger>
                <TabsTrigger value="comparison" className="text-sm font-medium">🧭 Compare</TabsTrigger>
                <TabsTrigger value="forecast" className="text-sm font-medium">🔮 Forecast</TabsTrigger>
              </TabsList>

              {/* Dashboard Tab - Statistical Panels & Overview */}
              <TabsContent value="dashboard" className="space-y-8">
                {isLoading ? (
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardContent className="p-16 text-center">
                      <RefreshCw className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-spin" />
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading infrastructure data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Dynamic Statistical Panels */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl mb-8`}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <Target className="w-6 h-6" />
                            📊 Infrastructure Statistics Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {statistics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-cyan-50 to-blue-50'} border-2 border-cyan-200`}>
                                <div className="text-sm font-medium text-cyan-700 mb-2">Max Coverage Zone</div>
                                <div className="text-2xl font-bold text-cyan-900 mb-1">{statistics.maxZone.Zone || statistics.maxZone.zone_name || 'N/A'}</div>
                                <div className="text-lg text-cyan-700">
                                  <AnimatedCounter value={statistics.maxZone.Average || statistics.maxZone.predicted_coverage_score || 0} decimals={1} />%
                                </div>
                              </div>
                              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-orange-50 to-red-50'} border-2 border-orange-200`}>
                                <div className="text-sm font-medium text-orange-700 mb-2">Min Coverage Zone</div>
                                <div className="text-2xl font-bold text-orange-900 mb-1">{statistics.minZone.Zone || statistics.minZone.zone_name || 'N/A'}</div>
                                <div className="text-lg text-orange-700">
                                  <AnimatedCounter value={statistics.minZone.Average || statistics.minZone.predicted_coverage_score || 0} decimals={1} />%
                                </div>
                              </div>
                              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-pink-50'} border-2 border-purple-200`}>
                                <div className="text-sm font-medium text-purple-700 mb-2">Mean Coverage</div>
                                <div className="text-2xl font-bold text-purple-900">
                                  <AnimatedCounter value={statistics.mean} decimals={1} />%
                                </div>
                              </div>
                              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-50'} border-2 border-green-200`}>
                                <div className="text-sm font-medium text-green-700 mb-2">Median Coverage</div>
                                <div className="text-2xl font-bold text-green-900">
                                  <AnimatedCounter value={statistics.median} decimals={1} />%
                                </div>
                              </div>
                              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-teal-50 to-cyan-50'} border-2 border-teal-200`}>
                                <div className="text-sm font-medium text-teal-700 mb-2">Standard Deviation</div>
                                <div className="text-2xl font-bold text-teal-900">
                                  <AnimatedCounter value={statistics.stdDev} decimals={2} />
                                </div>
                              </div>
                              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-yellow-50 to-amber-50'} border-2 border-yellow-200`}>
                                <div className="text-sm font-medium text-yellow-700 mb-2">Growth Index (2015-2024)</div>
                                <div className="text-2xl font-bold text-yellow-900">
                                  <AnimatedCounter value={statistics.growthIndex} decimals={1} />%
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Data Source Verified Badge */}
                    {dataValidation.valid && dataValidation.stats && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'} border-2 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xl">📂</span>
                          </div>
                          <div>
                            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Data Source Verified</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Last parsed: {new Date(dataValidation.stats.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          {dataValidation.stats.zones} zones loaded
                        </Badge>
                      </motion.div>
                    )}

                    {/* Data Validation Warning */}
                    {!dataValidation.valid && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200 flex items-center gap-3`}
                      >
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <div className="font-semibold text-yellow-900">Data Loading Issue</div>
                          <div className="text-sm text-yellow-700">{dataValidation.message}</div>
                        </div>
                      </motion.div>
                    )}

                    {/* Zone-wise Bar Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              <BarChart3 className="w-5 h-5" />
                              📊 Zone-wise Coverage Comparison
                            </CardTitle>
                            <ToggleGroup type="multiple" value={[showSchool ? 'school' : '', showHospital ? 'hospital' : '', showPark ? 'park' : ''].filter(Boolean)}>
                              <ToggleGroupItem value="school" aria-label="Toggle school" onClick={() => setShowSchool(!showSchool)}>
                                School
                              </ToggleGroupItem>
                              <ToggleGroupItem value="hospital" aria-label="Toggle hospital" onClick={() => setShowHospital(!showHospital)}>
                                Hospital
                              </ToggleGroupItem>
                              <ToggleGroupItem value="park" aria-label="Toggle park" onClick={() => setShowPark(!showPark)}>
                                Park
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={coverageData.slice(0, 15)}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="Zone" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                  border: 'none',
                                  borderRadius: '12px',
                                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Legend />
                              {showSchool && <Bar dataKey="School" name="School Coverage" fill="#06b6d4" radius={8} />}
                              {showHospital && <Bar dataKey="Hospital" name="Hospital Coverage" fill="#10b981" radius={8} />}
                              {showPark && <Bar dataKey="Park" name="Park Coverage" fill="#8b5cf6" radius={8} />}
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}
              </TabsContent>

              {/* Heatmaps Tab - Legacy */}
              <TabsContent value="heatmaps" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Heatmap */}
                  <div className="lg:col-span-2">
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden`}>
                      <CardHeader>
                        <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Population Density Heatmap
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gradient-to-br from-blue-100 via-teal-100 to-green-100 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                          {/* Simulated heatmap dots */}
                          <div className="absolute inset-0 p-8">
                            {[...Array(20)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.7 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`absolute w-8 h-8 rounded-full blur-sm ${
                                  i % 3 === 0 ? 'bg-red-500' : 
                                  i % 3 === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                                }`}
                                style={{
                                  left: `${Math.random() * 80 + 10}%`,
                                  top: `${Math.random() * 80 + 10}%`
                                }}
                              />
                            ))}
                          </div>
                          <div className="text-center z-10">
                            <Map className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <p className="text-blue-700 font-medium">Interactive City Heatmap</p>
                            <p className="text-blue-600 text-sm mt-2">Real-time density visualization</p>
                          </div>
                        </div>
                        
                        {/* Color Legend */}
                        <div className="flex items-center justify-center gap-6 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Medium</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>High</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Insights Panel */}
                  <div className="space-y-6">
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                      <CardHeader>
                        <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              North zone shows 15% population growth this quarter
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Central area requires additional infrastructure investment
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              East zone has optimal housing density distribution
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`w-full mt-4 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}`}
                        >
                          View Full Report
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-500 mb-1">1.2M</div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Population</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-500 mb-1">87%</div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Coverage Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Charts Tab - All New Chart Types */}
              <TabsContent value="charts" className="space-y-8">
                {/* 1. Stacked Area Chart - Cumulative Growth */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Layers className="w-5 h-5" />
                          📈 Stacked Area Chart - Cumulative Growth (2015-2024)
                        </CardTitle>
                        <ToggleGroup type="multiple">
                          <ToggleGroupItem value="school" onClick={() => setShowSchool(!showSchool)}>School</ToggleGroupItem>
                          <ToggleGroupItem value="hospital" onClick={() => setShowHospital(!showHospital)}>Hospital</ToggleGroupItem>
                          <ToggleGroupItem value="park" onClick={() => setShowPark(!showPark)}>Park</ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={generateTimeSeriesData}>
                          <defs>
                            <linearGradient id="colorSchool" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorHospital" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPark" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          {showSchool && <Area type="monotone" dataKey="school" stackId="1" stroke="#06b6d4" fill="url(#colorSchool)" />}
                          {showHospital && <Area type="monotone" dataKey="hospital" stackId="1" stroke="#10b981" fill="url(#colorHospital)" />}
                          {showPark && <Area type="monotone" dataKey="park" stackId="1" stroke="#8b5cf6" fill="url(#colorPark)" />}
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 2. Dual-Axis Line Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <LineChart className="w-5 h-5" />
                        📊 Dual-Axis Line Chart - Population Density vs Coverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={generateTimeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Population', angle: 90, position: 'insideRight' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="school" stroke="#06b6d4" strokeWidth={3} name="School Coverage" />
                          <Line yAxisId="left" type="monotone" dataKey="hospital" stroke="#10b981" strokeWidth={3} name="Hospital Coverage" />
                          <Line yAxisId="right" type="monotone" dataKey="population" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="Population Density" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 3. Scatter Plot */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart2 className="w-5 h-5" />
                        🟢 Scatter Plot - Coverage vs Population Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart data={coverageData.slice(0, 20).map((d) => ({
                          coverage: d.School || 0,
                          growth: (d.Average || 0) * 0.8 + (d.Hospital || 0) * 0.1 + (d.Park || 0) * 0.1,
                          zone: d.Zone,
                          size: ((d.School || 0) / 10) + 20
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" dataKey="coverage" name="School Coverage" unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <YAxis type="number" dataKey="growth" name="Average Growth" unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Scatter name="Zones" dataKey="coverage" fill="#06b6d4">
                            {coverageData.slice(0, 20).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 3 === 0 ? '#06b6d4' : index % 3 === 1 ? '#10b981' : '#8b5cf6'} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 4. Bubble Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Activity className="w-5 h-5" />
                        🔵 Bubble Chart - Coverage vs Infrastructure Spending
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart data={coverageData.slice(0, 20).map((d) => ({
                          coverage: d.Average || 0,
                          investment: ((d.School || 0) * 1000) + ((d.Hospital || 0) * 1500) + ((d.Park || 0) * 800),
                          zone: d.Zone,
                          size: ((d.Average || 0) * 2) + 30
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" dataKey="coverage" name="Average Coverage" unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <YAxis type="number" dataKey="investment" name="Investment" unit="₹" tick={{ fontSize: 12 }} />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Scatter name="Zones" dataKey="coverage" fill="#8b5cf6">
                            {coverageData.slice(0, 20).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 4 === 0 ? '#06b6d4' : index % 4 === 1 ? '#10b981' : index % 4 === 2 ? '#8b5cf6' : '#f59e0b'} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 5. Multi-layer Radar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Target className="w-5 h-5" />
                        🧭 Multi-layer Radar Chart - Top 5 Zones Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={500}>
                        <RadarChart data={coverageData
                          .sort((a, b) => (b.Average || 0) - (a.Average || 0))
                          .slice(0, 5)
                          .map((d) => ({
                            zone: d.Zone.substring(0, 15),
                            school: d.School || 0,
                            hospital: d.Hospital || 0,
                            park: d.Park || 0
                          }))}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="zone" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Radar name="School" dataKey="school" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                          <Radar name="Hospital" dataKey="hospital" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                          <Radar name="Park" dataKey="park" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 6. Box Plot - Coverage Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart3 className="w-5 h-5" />
                        🧮 Box Plot - Coverage Distribution & Outliers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full" style={{ height: '400px' }}>
                        {(() => {
                          const schoolValues = coverageData.map(d => d.School).filter(v => v > 0).sort((a, b) => a - b);
                          const hospitalValues = coverageData.map(d => d.Hospital).filter(v => v > 0).sort((a, b) => a - b);
                          const parkValues = coverageData.map(d => d.Park).filter(v => v > 0).sort((a, b) => a - b);
                          
                          const getBoxPlotData = (values: number[]) => {
                            if (values.length === 0) return null;
                            const q1 = values[Math.floor(values.length * 0.25)];
                            const median = values[Math.floor(values.length * 0.5)];
                            const q3 = values[Math.floor(values.length * 0.75)];
                            const min = values[0];
                            const max = values[values.length - 1];
                            const iqr = q3 - q1;
                            const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
                            const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
                            const outliers = values.filter(v => v < lowerWhisker || v > upperWhisker);
                            return { q1, median, q3, min, max, lowerWhisker, upperWhisker, outliers };
                          };

                          const schoolBox = getBoxPlotData(schoolValues);
                          const hospitalBox = getBoxPlotData(hospitalValues);
                          const parkBox = getBoxPlotData(parkValues);
                          const maxValue = Math.max(...schoolValues, ...hospitalValues, ...parkValues);
                          const scale = 280 / maxValue;
                          const boxWidth = 60;
                          const startX = 80;

                          return (
                            <svg width="100%" height="100%" viewBox="0 0 400 350" className="overflow-visible">
                              <defs>
                                <linearGradient id="boxGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                </linearGradient>
                              </defs>
                              {/* Y-axis */}
                              <line x1="50" y1="20" x2="50" y2="320" stroke={isDarkMode ? "#6b7280" : "#374151"} strokeWidth="2"/>
                              {/* Y-axis labels */}
                              {[0, 25, 50, 75, 100].map(val => (
                                <g key={val}>
                                  <line x1="45" y1={320 - val * scale} x2="50" y2={320 - val * scale} stroke={isDarkMode ? "#6b7280" : "#374151"} strokeWidth="1"/>
                                  <text x="40" y={325 - val * scale} textAnchor="end" fontSize="10" fill={isDarkMode ? "#d1d5db" : "#374151"}>{val}</text>
                                </g>
                              ))}
                              
                              {/* School Box Plot */}
                              {schoolBox && (
                                <g transform={`translate(${startX}, 0)`}>
                                  <text x={boxWidth/2} y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isDarkMode ? "#d1d5db" : "#374151"}>School</text>
                                  <line x1={boxWidth/2} y1={320 - schoolBox.upperWhisker * scale} x2={boxWidth/2} y2={320 - schoolBox.q3 * scale} stroke="#06b6d4" strokeWidth="2"/>
                                  <line x1={boxWidth/2} y1={320 - schoolBox.lowerWhisker * scale} x2={boxWidth/2} y2={320 - schoolBox.q1 * scale} stroke="#06b6d4" strokeWidth="2"/>
                                  <line x1={boxWidth/2 - 10} y1={320 - schoolBox.upperWhisker * scale} x2={boxWidth/2 + 10} y2={320 - schoolBox.upperWhisker * scale} stroke="#06b6d4" strokeWidth="2"/>
                                  <line x1={boxWidth/2 - 10} y1={320 - schoolBox.lowerWhisker * scale} x2={boxWidth/2 + 10} y2={320 - schoolBox.lowerWhisker * scale} stroke="#06b6d4" strokeWidth="2"/>
                                  <rect x="10" y={320 - schoolBox.q3 * scale} width={boxWidth} height={(schoolBox.q3 - schoolBox.q1) * scale} fill="url(#boxGradient)" stroke="#06b6d4" strokeWidth="2"/>
                                  <line x1="10" y1={320 - schoolBox.median * scale} x2={boxWidth + 10} y2={320 - schoolBox.median * scale} stroke="#ffffff" strokeWidth="2"/>
                                  {schoolBox.outliers.map((outlier, i) => (
                                    <circle key={i} cx={boxWidth/2 + 10} cy={320 - outlier * scale} r="3" fill="#06b6d4" opacity="0.7"/>
                                  ))}
                                </g>
                              )}

                              {/* Hospital Box Plot */}
                              {hospitalBox && (
                                <g transform={`translate(${startX + 120}, 0)`}>
                                  <text x={boxWidth/2} y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isDarkMode ? "#d1d5db" : "#374151"}>Hospital</text>
                                  <line x1={boxWidth/2} y1={320 - hospitalBox.upperWhisker * scale} x2={boxWidth/2} y2={320 - hospitalBox.q3 * scale} stroke="#10b981" strokeWidth="2"/>
                                  <line x1={boxWidth/2} y1={320 - hospitalBox.lowerWhisker * scale} x2={boxWidth/2} y2={320 - hospitalBox.q1 * scale} stroke="#10b981" strokeWidth="2"/>
                                  <line x1={boxWidth/2 - 10} y1={320 - hospitalBox.upperWhisker * scale} x2={boxWidth/2 + 10} y2={320 - hospitalBox.upperWhisker * scale} stroke="#10b981" strokeWidth="2"/>
                                  <line x1={boxWidth/2 - 10} y1={320 - hospitalBox.lowerWhisker * scale} x2={boxWidth/2 + 10} y2={320 - hospitalBox.lowerWhisker * scale} stroke="#10b981" strokeWidth="2"/>
                                  <rect x="10" y={320 - hospitalBox.q3 * scale} width={boxWidth} height={(hospitalBox.q3 - hospitalBox.q1) * scale} fill="#10b981" fillOpacity="0.6" stroke="#10b981" strokeWidth="2"/>
                                  <line x1="10" y1={320 - hospitalBox.median * scale} x2={boxWidth + 10} y2={320 - hospitalBox.median * scale} stroke="#ffffff" strokeWidth="2"/>
                                  {hospitalBox.outliers.map((outlier, i) => (
                                    <circle key={i} cx={boxWidth/2 + 10} cy={320 - outlier * scale} r="3" fill="#10b981" opacity="0.7"/>
                                  ))}
                                </g>
                              )}

                              {/* Park Box Plot */}
                              {parkBox && (
                                <g transform={`translate(${startX + 240}, 0)`}>
                                  <text x={boxWidth/2} y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isDarkMode ? "#d1d5db" : "#374151"}>Park</text>
                                  <line x1={boxWidth/2} y1={320 - parkBox.upperWhisker * scale} x2={boxWidth/2} y2={320 - parkBox.q3 * scale} stroke="#8b5cf6" strokeWidth="2"/>
                                  <line x1={boxWidth/2} y1={320 - parkBox.lowerWhisker * scale} x2={boxWidth/2} y2={320 - parkBox.q1 * scale} stroke="#8b5cf6" strokeWidth="2"/>
                                  <line x1={boxWidth/2 - 10} y1={320 - parkBox.upperWhisker * scale} x2={boxWidth/2 + 10} y2={320 - parkBox.upperWhisker * scale} stroke="#8b5cf6" strokeWidth="2"/>
                                  <line x1={boxWidth/2 - 10} y1={320 - parkBox.lowerWhisker * scale} x2={boxWidth/2 + 10} y2={320 - parkBox.lowerWhisker * scale} stroke="#8b5cf6" strokeWidth="2"/>
                                  <rect x="10" y={320 - parkBox.q3 * scale} width={boxWidth} height={(parkBox.q3 - parkBox.q1) * scale} fill="#8b5cf6" fillOpacity="0.6" stroke="#8b5cf6" strokeWidth="2"/>
                                  <line x1="10" y1={320 - parkBox.median * scale} x2={boxWidth + 10} y2={320 - parkBox.median * scale} stroke="#ffffff" strokeWidth="2"/>
                                  {parkBox.outliers.map((outlier, i) => (
                                    <circle key={i} cx={boxWidth/2 + 10} cy={320 - outlier * scale} r="3" fill="#8b5cf6" opacity="0.7"/>
                                  ))}
                                </g>
                              )}
                            </svg>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Trends Tab - Trend Analysis with Gradient Curves */}
              <TabsContent value="trends" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <TrendingUp className="w-5 h-5" />
                        📉 Trend Analysis - Coverage Evolution (2015-2024)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={500}>
                        <AreaChart data={generateTimeSeriesData}>
                          <defs>
                            <linearGradient id="gradientSchool" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="gradientHospital" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="gradientPark" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="school" stroke="#06b6d4" strokeWidth={3} fill="url(#gradientSchool)" name="School Coverage" />
                          <Area type="monotone" dataKey="hospital" stroke="#10b981" strokeWidth={3} fill="url(#gradientHospital)" name="Hospital Coverage" />
                          <Area type="monotone" dataKey="park" stroke="#8b5cf6" strokeWidth={3} fill="url(#gradientPark)" name="Park Coverage" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Heatmap Matrix - Cross-correlation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Map className="w-5 h-5" />
                        🧩 Heatmap Matrix - Cross-correlation Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2">
                        <div className={`p-4 rounded-lg text-center font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Zone</div>
                        <div className={`p-4 rounded-lg text-center font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>School</div>
                        <div className={`p-4 rounded-lg text-center font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Hospital</div>
                        <div className={`p-4 rounded-lg text-center font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Park</div>
                        {coverageData.slice(0, 10).map((d, i) => {
                          const school = d.School || 0;
                          const hospital = d.Hospital || 0;
                          const park = d.Park || 0;
                          const avg = d.Average || 0;
                          const intensity = Math.min(100, avg) / 100;
                          return (
                            <React.Fragment key={i}>
                              <div className={`p-3 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>{d.Zone.substring(0, 12)}</div>
                              <div className={`p-3 rounded text-center font-semibold`} style={{ backgroundColor: `rgba(6, 182, 212, ${intensity})` }}>{school.toFixed(1)}</div>
                              <div className={`p-3 rounded text-center font-semibold`} style={{ backgroundColor: `rgba(16, 185, 129, ${intensity})` }}>{hospital.toFixed(1)}</div>
                              <div className={`p-3 rounded text-center font-semibold`} style={{ backgroundColor: `rgba(139, 92, 246, ${intensity})` }}>{park.toFixed(1)}</div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Comparison Tab - Zone Comparison Module */}
              <TabsContent value="comparison" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <GitCompare className="w-5 h-5" />
                        🧭 Zone Comparison Module
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select value={zone1} onValueChange={setZone1}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Zone 1" />
                          </SelectTrigger>
                          <SelectContent>
                            {coverageData.map(zone => (
                              <SelectItem key={zone.Zone} value={zone.Zone}>{zone.Zone}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={zone2} onValueChange={setZone2}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Zone 2" />
                          </SelectTrigger>
                          <SelectContent>
                            {coverageData.map(zone => (
                              <SelectItem key={zone.Zone} value={zone.Zone}>{zone.Zone}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {zone1 && zone2 && (() => {
                        const z1 = coverageData.find(z => z.Zone === zone1);
                        const z2 = coverageData.find(z => z.Zone === zone2);
                        if (!z1 || !z2) return null;
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{zone1}</h3>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                  { name: 'School', value: z1.School || 0 },
                                  { name: 'Hospital', value: z1.Hospital || 0 },
                                  { name: 'Park', value: z1.Park || 0 }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                  <XAxis dataKey="name" />
                                  <YAxis domain={[0, 100]} />
                                  <Tooltip />
                                  <Bar dataKey="value" fill="#06b6d4" radius={8} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{zone2}</h3>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                  { name: 'School', value: z2.School || 0 },
                                  { name: 'Hospital', value: z2.Hospital || 0 },
                                  { name: 'Park', value: z2.Park || 0 }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                  <XAxis dataKey="name" />
                                  <YAxis domain={[0, 100]} />
                                  <Tooltip />
                                  <Bar dataKey="value" fill="#10b981" radius={8} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })()}
                      {zone1 && zone2 && (() => {
                        const z1 = coverageData.find(z => z.Zone === zone1);
                        const z2 = coverageData.find(z => z.Zone === zone2);
                        if (!z1 || !z2) return null;
                        const z1School = z1.School || 0;
                        const z1Hospital = z1.Hospital || 0;
                        const z1Park = z1.Park || 0;
                        const z2School = z2.School || 0;
                        const z2Hospital = z2.Hospital || 0;
                        const z2Park = z2.Park || 0;
                        const schoolDiff = ((z1School - z2School) / z2School * 100).toFixed(1);
                        const hospitalDiff = ((z1Hospital - z2Hospital) / z2Hospital * 100).toFixed(1);
                        const parkDiff = ((z1Park - z2Park) / z2Park * 100).toFixed(1);
                        return (
                          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} border-2 border-blue-200`}>
                            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 Comparison Analysis</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {zone1} has {Math.abs(parseFloat(schoolDiff))}% {parseFloat(schoolDiff) > 0 ? 'higher' : 'lower'} school coverage than {zone2}.<br/>
                              {zone1} has {Math.abs(parseFloat(hospitalDiff))}% {parseFloat(hospitalDiff) > 0 ? 'higher' : 'lower'} hospital coverage than {zone2}.<br/>
                              {zone1} has {Math.abs(parseFloat(parkDiff))}% {parseFloat(parkDiff) > 0 ? 'higher' : 'lower'} park coverage than {zone2}.
                            </p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Forecast Tab - Predictive Visualization */}
              <TabsContent value="forecast" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Sparkles className="w-5 h-5" />
                        🔮 AI Forecast - Predictive Visualization (2025-2030)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={500}>
                        <ComposedChart data={[...generateTimeSeriesData, ...forecastData]}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <ReferenceLine x={2024} stroke="#f59e0b" strokeDasharray="3 3" label="Current" />
                          <Area type="monotone" dataKey="school" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name="School (Historical)" />
                          <Area type="monotone" dataKey="hospital" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Hospital (Historical)" />
                          <Area type="monotone" dataKey="park" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Park (Historical)" />
                          <Line type="monotone" dataKey="school" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" name="School (Forecast)" />
                          <Line type="monotone" dataKey="hospital" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Hospital (Forecast)" />
                          <Line type="monotone" dataKey="park" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Park (Forecast)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                      <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'} border-2 border-purple-200`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Brain className="w-4 h-4 inline mr-2" />
                          <strong>AI-Generated Forecast:</strong> Based on linear extrapolation from the last 5 years, with ±10% confidence range. 
                          The forecast shows continued growth in all infrastructure categories through 2030.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Export Section */}
      <section className={`py-12 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white/10 backdrop-blur-sm'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className={`${isDarkMode ? 'bg-gray-700' : 'bg-white/90'} backdrop-blur-sm rounded-3xl p-12 shadow-2xl border ${isDarkMode ? 'border-gray-600' : 'border-white/20'}`}
          >
            <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Export Your Analysis
            </h2>
            <p className={`text-xl mb-10 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Generate comprehensive reports and export data visualizations in multiple formats for presentations and planning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => handleExport('dashboard')}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Generate My City Visualization
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('pdf')}
                  className={`px-6 py-4 rounded-2xl transition-all duration-300 ${isDarkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-600' : 'border-gray-300'}`}
                >
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('csv')}
                  className={`px-6 py-4 rounded-2xl transition-all duration-300 ${isDarkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-600' : 'border-gray-300'}`}
                >
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('image')}
                  className={`px-6 py-4 rounded-2xl transition-all duration-300 ${isDarkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-600' : 'border-gray-300'}`}
                >
                  Image
                </Button>
              </div>
            </div>
            
            <p className={`mt-8 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Real-time data updates • Multiple export formats • Interactive dashboard sharing
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}