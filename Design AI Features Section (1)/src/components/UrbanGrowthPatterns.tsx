import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Building2,
  MapPin,
  BarChart3,
  Calendar,
  Target,
  Brain,
  Zap,
  ChevronRight,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface UrbanGrowthPatternsProps {
  onBack: () => void;
}

// Mock data for demonstrations
const populationGrowthData = [
  { year: '2020', population: 2.5, economic: 3.2, infrastructure: 2.8 },
  { year: '2021', population: 2.8, economic: 3.8, infrastructure: 3.1 },
  { year: '2022', population: 3.1, economic: 4.2, infrastructure: 3.5 },
  { year: '2023', population: 3.4, economic: 4.1, infrastructure: 3.8 },
  { year: '2024', population: 3.7, economic: 4.5, infrastructure: 4.1 },
  { year: '2025', population: 4.2, economic: 5.1, infrastructure: 4.6 },
  { year: '2026', population: 4.8, economic: 5.8, infrastructure: 5.2 },
  { year: '2027', population: 5.3, economic: 6.2, infrastructure: 5.7 },
  { year: '2028', population: 5.9, economic: 6.8, infrastructure: 6.3 },
  { year: '2029', population: 6.4, economic: 7.2, infrastructure: 6.8 },
  { year: '2030', population: 7.1, economic: 7.9, infrastructure: 7.4 }
];

const scenarioData = [
  { name: 'Conservative', value: 25, color: '#00A8E8' },
  { name: 'Moderate', value: 45, color: '#34D399' },
  { name: 'Aggressive', value: 30, color: '#F59E0B' }
];

const growthFactors = [
  { 
    name: 'Population Growth',
    current: 85,
    projected: 92,
    icon: Users,
    trend: '+7%'
  },
  { 
    name: 'Economic Development',
    current: 78,
    projected: 87,
    icon: TrendingUp,
    trend: '+9%'
  },
  { 
    name: 'Infrastructure Demand',
    current: 82,
    projected: 94,
    icon: Building2,
    trend: '+12%'
  },
  { 
    name: 'Urban Density',
    current: 71,
    projected: 83,
    icon: MapPin,
    trend: '+12%'
  }
];

const aiInsights = [
  {
    type: 'Population Surge',
    confidence: 94,
    impact: 'High',
    timeline: '2025-2027',
    description: 'AI models predict a 24% population increase in downtown districts, requiring immediate housing initiatives.'
  },
  {
    type: 'Economic Hub Formation',
    confidence: 87,
    impact: 'Medium',
    timeline: '2026-2029',
    description: 'Tech sector expansion expected to create 15,000 new jobs, driving commercial real estate demand.'
  },
  {
    type: 'Transport Bottlenecks',
    confidence: 91,
    impact: 'High',
    timeline: '2024-2026',
    description: 'Current infrastructure will reach capacity limits; smart transportation solutions recommended.'
  },
  {
    type: 'Green Space Deficit',
    confidence: 82,
    impact: 'Medium',
    timeline: '2025-2030',
    description: 'Urban expansion may reduce green space by 18%; sustainable development policies needed.'
  }
];

export function UrbanGrowthPatterns({ onBack }: UrbanGrowthPatternsProps) {
  const [selectedScenario, setSelectedScenario] = useState('moderate');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30" 
           style={{
             backgroundImage: `
               linear-gradient(90deg, rgba(0,168,232,0.1) 1px, transparent 1px),
               linear-gradient(rgba(0,168,232,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }}>
      </div>

      <div className="relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center gap-2 hover:bg-gray-100/50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Urban Growth Patterns</h1>
                    <p className="text-sm text-gray-600">AI-Powered Growth Prediction & Analytics</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] text-white border-0">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm rounded-xl p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="forecasting" className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Forecasting
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {growthFactors.map((factor, index) => (
                  <Card key={factor.name} className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center">
                          <factor.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{factor.name}</h3>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 mt-1">
                            {factor.trend}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Current</span>
                          <span className="font-medium">{factor.current}%</span>
                        </div>
                        <Progress value={factor.current} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Projected 2030</span>
                          <span className="font-medium text-green-600">{factor.projected}%</span>
                        </div>
                        <Progress value={factor.projected} className="h-2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>

              {/* Growth Trends Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Growth Trends Analysis</h3>
                      <p className="text-sm text-gray-600">Historical data and future projections</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] text-white border-0">
                      Real-time Data
                    </Badge>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={populationGrowthData}>
                        <defs>
                          <linearGradient id="populationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00A8E8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00A8E8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="economicGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="infrastructureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="population"
                          stroke="#00A8E8"
                          fillOpacity={1}
                          fill="url(#populationGradient)"
                          name="Population Growth (%)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="economic"
                          stroke="#34D399"
                          fillOpacity={1}
                          fill="url(#economicGradient)"
                          name="Economic Development (%)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="infrastructure"
                          stroke="#F59E0B"
                          fillOpacity={1}
                          fill="url(#infrastructureGradient)"
                          name="Infrastructure Demand (%)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="forecasting" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Forecasting Controls */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecasting Parameters</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Time Horizon</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent">
                        <option>5 Years (2024-2029)</option>
                        <option>10 Years (2024-2034)</option>
                        <option>15 Years (2024-2039)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Growth Model</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent">
                        <option>AI Enhanced Model</option>
                        <option>Linear Regression</option>
                        <option>Exponential Growth</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Confidence Level</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent">
                        <option>95% Confidence</option>
                        <option>90% Confidence</option>
                        <option>85% Confidence</option>
                      </select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0090C7] hover:to-[#2BC380] text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Forecast
                    </Button>
                  </div>
                </Card>

                {/* Detailed Forecast Chart */}
                <Card className="lg:col-span-2 p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Detailed Growth Forecast</h3>
                      <p className="text-sm text-gray-600">AI-powered predictions with confidence intervals</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] text-white border-0">
                      <Brain className="w-3 h-3 mr-1" />
                      95% Accuracy
                    </Badge>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={populationGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="population"
                          stroke="#00A8E8"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#00A8E8' }}
                          name="Population Growth (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="economic"
                          stroke="#34D399"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#34D399' }}
                          name="Economic Development (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="infrastructure"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#F59E0B' }}
                          name="Infrastructure Demand (%)"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Scenario Selection */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Scenarios</h3>
                  <div className="space-y-4">
                    {['conservative', 'moderate', 'aggressive'].map((scenario) => (
                      <div
                        key={scenario}
                        onClick={() => setSelectedScenario(scenario)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                          selectedScenario === scenario
                            ? 'border-[#00A8E8] bg-[#00A8E8]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">{scenario} Growth</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {scenario === 'conservative' && 'Steady, controlled development with minimal risk'}
                              {scenario === 'moderate' && 'Balanced growth with sustainable expansion'}
                              {scenario === 'aggressive' && 'Rapid development with accelerated investment'}
                            </p>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedScenario === scenario ? 'rotate-90 text-[#00A8E8]' : ''
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Scenario Distribution */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Scenario Analysis</h3>
                      <p className="text-sm text-gray-600">Probability distribution of growth patterns</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={scenarioData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {scenarioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {aiInsights.map((insight, index) => (
                  <Card key={index} className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{insight.type}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={`text-xs ${
                              insight.impact === 'High' ? 'bg-red-100 text-red-700' :
                              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {insight.impact} Impact
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {insight.confidence}% Confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Timeline</p>
                        <p className="text-sm font-medium text-gray-900">{insight.timeline}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="text-[#00A8E8] border-[#00A8E8] hover:bg-[#00A8E8] hover:text-white">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Action Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="p-6 bg-gradient-to-r from-[#00A8E8]/10 to-[#34D399]/10 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to Take Action?</h3>
                  <p className="text-sm text-gray-600 mt-1">Export your analysis or schedule a planning session with our AI experts</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8] hover:text-white">
                    Export Report
                  </Button>
                  <Button className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0090C7] hover:to-[#2BC380] text-white">
                    Schedule Consultation
                    <Calendar className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}