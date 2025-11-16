import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

interface UrbanGrowthDashboardProps {
  onBack: () => void;
}

export function UrbanGrowthDashboard({ onBack }: UrbanGrowthDashboardProps) {
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
                  Back to Features
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Urban Growth Dashboard</h1>
                    <p className="text-sm text-gray-600">AI-Powered Predictive Analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center shadow-lg">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Urban Growth Dashboard
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Welcome to the Urban Growth Patterns dashboard. This powerful analytics platform will help you forecast population growth, economic development, and infrastructure demands using advanced AI algorithms.
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                We're building an advanced analytics dashboard with real-time data visualization, predictive modeling, and scenario planning tools.
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00A8E8] to-[#34D399]"></div>
                  <span className="text-sm text-gray-700">AI-Powered Forecasting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00A8E8] to-[#34D399]"></div>
                  <span className="text-sm text-gray-700">Interactive Data Visualization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00A8E8] to-[#34D399]"></div>
                  <span className="text-sm text-gray-700">Scenario Modeling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00A8E8] to-[#34D399]"></div>
                  <span className="text-sm text-gray-700">Real-time Analytics</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}