'use client';

import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, BarChart3, Globe, Activity, Eye } from 'lucide-react';
import { Button } from '@/components/ai-features/components/ui/button';

interface UrbanGrowthExplorerProps {
  onBack: () => void;
}

const featureCards = [
  {
    title: "AI-Powered Forecasting",
    description: "Advanced machine learning algorithms predict population growth, economic trends, and demographic shifts with 95% accuracy.",
    Icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    title: "Interactive Data Visualization", 
    description: "Dynamic charts, maps, and dashboards transform complex urban data into intuitive visual insights for better decision-making.",
    Icon: BarChart3,
    gradient: "from-emerald-500 to-teal-400"
  },
  {
    title: "Scenario Modeling",
    description: "Powerful simulation tools help test different urban planning strategies and assess their long-term impact on city development.",
    Icon: Globe,
    gradient: "from-violet-500 to-purple-400"
  },
  {
    title: "Real-Time Analytics",
    description: "Live data monitoring provides immediate insights into urban patterns, infrastructure usage, and population dynamics.",
    Icon: Activity,
    gradient: "from-orange-500 to-red-400"
  }
];

export function UrbanGrowthExplorer({ onBack }: UrbanGrowthExplorerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" 
           style={{
             backgroundImage: `
               linear-gradient(90deg, rgba(0,168,232,0.1) 1px, transparent 1px),
               linear-gradient(rgba(0,168,232,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Header Section with Gradient Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Gradient Banner Background */}
        <div className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] relative overflow-hidden">
          {/* Subtle glowing effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-8">
            {/* Back Navigation */}
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:bg-white/20 transition-colors mb-6 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Features
            </Button>

            {/* Header Content */}
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Urban Growth Dashboard
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/90 max-w-3xl mx-auto"
              >
                AI-Powered Predictive Analytics for Smart Cities
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Intro Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            This dashboard provides predictive insights into population growth, economic development, and infrastructure demands using advanced AI models. 
            Harness the power of machine learning to make informed decisions for sustainable urban planning.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {featureCards.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden"
            >
              {/* Hover glow border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00A8E8]/20 to-[#34D399]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[#00A8E8]/30 transition-all duration-500"></div>
              
              <div className="relative">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.Icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[#00A8E8] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center text-sm text-[#00A8E8] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>Explore feature</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Engagement Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          {/* Coming Soon Callout */}
          <div className="bg-gradient-to-r from-[#00A8E8]/10 to-[#34D399]/10 rounded-3xl p-12 border border-[#00A8E8]/20 backdrop-blur-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(0,168,232,0.2) 1px, transparent 1px),
                  radial-gradient(circle at 80% 80%, rgba(52,211,153,0.2) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Coming Soon: Advanced Predictive Dashboard
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                with Real-Time Charts & Scenario Planning
              </p>
              
              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0090C7] hover:to-[#2BC380] text-white px-12 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Notify Me
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#34D399] to-[#00A8E8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}