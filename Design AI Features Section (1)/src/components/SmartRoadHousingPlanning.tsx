import { motion } from 'motion/react';
import { useState } from 'react';
import { 
  Route, 
  Home, 
  Activity, 
  TrendingUp,
  ArrowLeft,
  Download,
  Search,
  MapPin,
  Clock,
  Users,
  Car,
  BarChart3,
  Zap,
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

const featureCards = [
  {
    title: "Intelligent Road Network Design",
    description: "AI-optimized road layouts that reduce congestion and improve traffic flow efficiency.",
    Icon: Route,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Traffic & Congestion Heatmaps",
    description: "Real-time traffic analysis with predictive congestion modeling and optimization.",
    Icon: Activity,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Housing Density Distribution",
    description: "Strategic residential planning with optimal density distribution across zones.",
    Icon: Home,
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Future Growth Simulation",
    description: "Predictive modeling for 10-year urban expansion and infrastructure needs.",
    Icon: TrendingUp,
    color: "from-orange-500 to-red-500"
  }
];

const comparisonData = [
  {
    metric: "Traffic Flow Efficiency",
    before: 62,
    after: 87,
    improvement: 25
  },
  {
    metric: "Average Commute Time",
    before: 45,
    after: 32,
    improvement: -28,
    unit: "min"
  },
  {
    metric: "Housing Accessibility",
    before: 71,
    after: 94,
    improvement: 23
  },
  {
    metric: "Infrastructure Utilization",
    before: 58,
    after: 89,
    improvement: 31
  }
];

interface SmartRoadHousingPlanningProps {
  onBack?: () => void;
}

export function SmartRoadHousingPlanning({ onBack }: SmartRoadHousingPlanningProps) {
  const [selectedCity, setSelectedCity] = useState("delhi");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("traffic");

  const handleGenerateReport = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1713021661063-291cd66dceef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY2l0eSUyMHJvYWQlMjBuZXR3b3JrJTIwYWVyaWFsfGVufDF8fHx8MTc1NzU4NDc5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Futuristic city road network"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/80 to-teal-100/70"></div>
          
          {/* Tech grid pattern */}
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `
                   linear-gradient(90deg, rgba(0,168,232,0.1) 1px, transparent 1px),
                   linear-gradient(rgba(52,211,153,0.1) 1px, transparent 1px)
                 `,
                 backgroundSize: '80px 80px'
               }}>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Back button */}
          {onBack && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-[#00A8E8] transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Features
              </Button>
            </motion.div>
          )}

          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Smart Road & Housing
              <span className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent block mt-2">
                Planning Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Optimize city layouts with AI-driven road networks, housing distribution analysis, 
              and congestion management for sustainable urban development.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg"
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0090C7] hover:to-[#2BC380] text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group min-w-[200px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-3">
                      <BarChart3 className="w-5 h-5" />
                      Generate City Report
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#34D399] to-[#00A8E8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-[#00A8E8]/30 text-[#00A8E8] hover:bg-[#00A8E8] hover:text-white px-8 py-4 rounded-2xl transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Compare Cities
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="relative py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Enter city name..."
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#00A8E8] transition-colors"
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200">
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
                <SelectTrigger className="h-12 rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="h-12 rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-900 mb-12"
          >
            AI-Powered Planning Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <feature.Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-[#00A8E8] transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Data Visualization */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Map Widget */}
              <div className="lg:w-2/3">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Live City Analysis Dashboard</h3>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="traffic">Traffic Flow</TabsTrigger>
                    <TabsTrigger value="housing">Housing Density</TabsTrigger>
                    <TabsTrigger value="growth">Growth Prediction</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="traffic" className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 h-64 flex items-center justify-center border-2 border-dashed border-blue-200">
                      <div className="text-center">
                        <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <p className="text-blue-600 font-medium">Interactive Traffic Heatmap</p>
                        <p className="text-blue-500 text-sm mt-2">Real-time congestion analysis</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="housing" className="space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 h-64 flex items-center justify-center border-2 border-dashed border-green-200">
                      <div className="text-center">
                        <Home className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-green-600 font-medium">Housing Distribution Map</p>
                        <p className="text-green-500 text-sm mt-2">Density optimization zones</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="growth" className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 h-64 flex items-center justify-center border-2 border-dashed border-purple-200">
                      <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                        <p className="text-purple-600 font-medium">Growth Simulation Model</p>
                        <p className="text-purple-500 text-sm mt-2">10-year expansion forecast</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Stats Panel */}
              <div className="lg:w-1/3 space-y-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Real-time Metrics</h4>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-700">Traffic Volume</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">127,432</div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-700">Population Density</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">8,340/km²</div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-700">Avg. Commute</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-2">32 min</div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Before vs After Comparison */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-900 mb-12"
          >
            AI Planning Impact Analysis
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Before Planning */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-700 text-center">Before AI Planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {comparisonData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.metric}</span>
                        <span className="text-red-600 font-bold">
                          {item.before}{item.unit === 'min' ? ' min' : '%'}
                        </span>
                      </div>
                      <Progress value={item.before} className="h-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* After Planning */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-700 text-center">After AI Planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {comparisonData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">
                            {item.after}{item.unit === 'min' ? ' min' : '%'}
                          </span>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            item.improvement > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.improvement > 0 ? '+' : ''}{Math.abs(item.improvement)}%
                          </div>
                        </div>
                      </div>
                      <Progress value={item.after} className="h-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Key Improvements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
          >
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Key Improvements Achieved</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">28%</div>
                <p className="text-gray-600">Traffic Reduction</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">15%</div>
                <p className="text-gray-600">Commute Time Reduction</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">31%</div>
                <p className="text-gray-600">Infrastructure Efficiency</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your City?
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Get comprehensive planning insights and export detailed reports for your urban development projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0090C7] hover:to-[#2BC380] text-white px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  Get Full Planning Report
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#34D399] to-[#00A8E8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8] hover:text-white px-10 py-4 rounded-2xl transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Insights
              </Button>
            </div>
            
            <p className="text-gray-500 mt-8 text-sm">
              Trusted by 500+ cities worldwide • Real-time data analysis • Export in PDF, Excel formats
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}