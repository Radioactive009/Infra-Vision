'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
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
  AlertCircle,
  Building2
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
  Legend
} from 'recharts';
import { Button } from '@/components/ai-features/components/ui/button';
import { Input } from '@/components/ai-features/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ai-features/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ai-features/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ai-features/components/ui/card';
import { Switch } from '@/components/ai-features/components/ui/switch';
import { Badge } from '@/components/ai-features/components/ui/badge';
import { ImageWithFallback } from '@/components/ai-features/components/figma/ImageWithFallback';
import { RoadNetworkDashboard } from '@/components/ai-features/components/RoadNetworkDashboard';
import { HousingDensityAnalysis } from '@/components/ai-features/components/HousingDensityAnalysis';
import { TrafficCongestionHeatmap } from '@/components/ai-features/components/TrafficCongestionHeatmap';
import { InfrastructureDistribution } from '@/components/ai-features/components/InfrastructureDistribution';
import { ZoneForecastCard } from '@/components/ai-features/components/ZoneForecastCard';
import { delhiZones } from '@/components/ai-features/data/delhiZonesData';

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

export function AdvancedDataVisualization({ onBack }: AdvancedDataVisualizationProps) {
  const [activeTab, setActiveTab] = useState("heatmaps");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState("delhi");
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleExport = (type: string) => {
    // Simulate export functionality
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
              <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 ${isDarkMode ? 'bg-gray-800' : 'bg-white/90'} backdrop-blur-sm mb-8`}>
                <TabsTrigger value="heatmaps" className="text-xs md:text-sm font-medium">Heatmaps</TabsTrigger>
                <TabsTrigger value="charts" className="text-xs md:text-sm font-medium">Charts</TabsTrigger>
                <TabsTrigger value="forecasts" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Zone Forecasts</span>
                  <span className="sm:hidden">Forecasts</span>
                </TabsTrigger>
                <TabsTrigger value="roads" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <Map className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Road Network</span>
                  <span className="sm:hidden">Roads</span>
                </TabsTrigger>
                <TabsTrigger value="housing" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <Home className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Housing Density</span>
                  <span className="sm:hidden">Housing</span>
                </TabsTrigger>
                <TabsTrigger value="traffic" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden lg:inline">Traffic & Congestion</span>
                  <span className="hidden sm:inline lg:hidden">Traffic</span>
                  <span className="sm:hidden">Traffic</span>
                </TabsTrigger>
                <TabsTrigger value="infrastructure" className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <Building2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden lg:inline">Infrastructure</span>
                  <span className="lg:hidden">Infra</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="text-xs md:text-sm font-medium">Growth Trends</TabsTrigger>
                <TabsTrigger value="distribution" className="text-xs md:text-sm font-medium">
                  <span className="hidden lg:inline">Resource Distribution</span>
                  <span className="lg:hidden">Distribution</span>
                </TabsTrigger>
              </TabsList>

              {/* Heatmaps Tab */}
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
                            {[...Array(20)].map((_, i) => {
                              // Deterministic positions based on index to prevent hydration mismatch
                              const seed = i * 13; // Prime number for distribution
                              const left = 10 + ((seed * 7) % 80);
                              const top = 10 + ((seed * 11) % 80);
                              return (
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
                                    left: `${left}%`,
                                    top: `${top}%`
                                  }}
                                />
                              );
                            })}
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

              {/* Charts Tab */}
              <TabsContent value="charts" className="space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {kpiData.map((kpi, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                              kpi.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                              kpi.color === 'red' ? 'from-red-500 to-pink-500' :
                              kpi.color === 'green' ? 'from-green-500 to-emerald-500' :
                              'from-purple-500 to-violet-500'
                            } flex items-center justify-center shadow-lg`}>
                              <kpi.icon className="w-6 h-6 text-white" />
                            </div>
                            <Badge variant={kpi.change > 0 ? "default" : "secondary"} className="text-xs">
                              {kpi.change > 0 ? '+' : ''}{kpi.change}%
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{kpi.title}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bar Chart */}
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart3 className="w-5 h-5" />
                        Population by Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={populationData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="population" fill="#06b6d4" radius={8} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Line Chart */}
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <LineChart className="w-5 h-5" />
                        Traffic Volume Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={trafficData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="volume" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Pie Chart */}
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <PieChart className="w-5 h-5" />
                        Land Use Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <RechartsPieChart data={landUseData} cx="50%" cy="50%" innerRadius={60} outerRadius={120}>
                            {landUseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </RechartsPieChart>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {landUseData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.name} ({item.value}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Area Chart */}
                  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Activity className="w-5 h-5" />
                        Infrastructure Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="infrastructure" 
                            stackId="1" 
                            stroke="#8b5cf6" 
                            fill="#8b5cf6"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Zone Forecasts Tab - New Feature */}
              <TabsContent value="forecasts" className="space-y-6">
                {/* Key Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className={`p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <div className="space-y-1">
                      <p className="text-green-700 dark:text-green-300">Avg Growth Rate</p>
                      <p className="text-green-900 dark:text-green-100 text-3xl">
                        {(delhiZones.reduce((sum, z) => sum + z.GrowthRate, 0) / delhiZones.length).toFixed(1)}%
                      </p>
                      <p className="text-green-600 dark:text-green-400">per year across zones</p>
                    </div>
                  </Card>
                  <Card className={`p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <div className="space-y-1">
                      <p className="text-blue-700 dark:text-blue-300">High Growth Zones</p>
                      <p className="text-blue-900 dark:text-blue-100 text-3xl">
                        {delhiZones.filter((z) => z.GrowthRate >= 4.0).length}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">zones with ≥4% growth</p>
                    </div>
                  </Card>
                  <Card className={`p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-200 dark:border-red-800 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <div className="space-y-1">
                      <p className="text-red-700 dark:text-red-300">Critical Congestion</p>
                      <p className="text-red-900 dark:text-red-100 text-3xl">
                        {delhiZones.filter((z) => z.CongestionLevel > 70).length}
                      </p>
                      <p className="text-red-600 dark:text-red-400">zones &gt;70% congested</p>
                    </div>
                  </Card>
                  <Card className={`p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <div className="space-y-1">
                      <p className="text-orange-700 dark:text-orange-300">Low Infrastructure</p>
                      <p className="text-orange-900 dark:text-orange-100 text-3xl">
                        {delhiZones.filter((z) => z.InfrastructureIndex < 65).length}
                      </p>
                      <p className="text-orange-600 dark:text-orange-400">zones needing improvement</p>
                    </div>
                  </Card>
                </div>

                {/* Zone Forecast Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {delhiZones.map((zone) => (
                    <ZoneForecastCard key={zone.Zone} zone={zone} />
                  ))}
                </div>

                {/* Growth Index Forecast Chart */}
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                  <CardHeader>
                    <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Growth Index Forecast (2024 → 2034)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={delhiZones.map((zone) => ({
                        zone: zone.Zone,
                        base2024: zone.BaseIndex2024,
                        forecast2034: zone.ForecastIndex2034,
                        infrastructure: zone.InfrastructureIndex,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="zone" stroke={isDarkMode ? '#6b7280' : '#374151'} />
                        <YAxis domain={[40, 100]} stroke={isDarkMode ? '#6b7280' : '#374151'} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            color: isDarkMode ? '#fff' : '#000'
                          }}
                        />
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Road Network Tab - New Feature */}
              <TabsContent value="roads">
                <RoadNetworkDashboard />
              </TabsContent>

              {/* Housing Density Tab - New Feature */}
              <TabsContent value="housing">
                <HousingDensityAnalysis />
              </TabsContent>

              {/* Traffic & Congestion Tab - New Feature */}
              <TabsContent value="traffic">
                <TrafficCongestionHeatmap />
              </TabsContent>

              {/* Infrastructure Distribution Tab - New Feature */}
              <TabsContent value="infrastructure">
                <InfrastructureDistribution />
              </TabsContent>

              {/* Existing tabs content */}
              <TabsContent value="trends">
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                  <CardContent className="p-16 text-center">
                    <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth Trends Analysis</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced trend analysis coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="distribution">
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90'} backdrop-blur-sm shadow-xl rounded-2xl`}>
                  <CardContent className="p-16 text-center">
                    <Home className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resource Distribution</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Resource mapping dashboard coming soon</p>
                  </CardContent>
                </Card>
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