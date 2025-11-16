'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface InfrastructureCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  index: number;
  coverage: number;
  totalFacilities: number;
  status: 'excellent' | 'good' | 'needs-improvement';
}

export function InfrastructureCard({ 
  title, 
  description, 
  Icon, 
  index, 
  coverage, 
  totalFacilities,
  status 
}: InfrastructureCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'from-green-500 to-emerald-500';
      case 'good': return 'from-[#00A8E8] to-[#34D399]';
      case 'needs-improvement': return 'from-amber-500 to-orange-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'excellent': return 'Excellent Coverage';
      case 'good': return 'Good Coverage';
      case 'needs-improvement': return 'Needs Improvement';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getStatusColor()} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1">{coverage}%</div>
            <div className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor()} text-white`}>
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#00A8E8] transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            {description}
          </p>
        </div>

        {/* Mini data visualization */}
        <div className="space-y-4">
          {/* Coverage bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Area Coverage</span>
              <span>{totalFacilities} facilities</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${coverage}%` }}
                transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                className={`h-full bg-gradient-to-r ${getStatusColor()} rounded-full`}
              />
            </div>
          </div>

          {/* Mini heatmap visualization */}
          <div className="grid grid-cols-8 gap-1 opacity-60">
            {Array.from({ length: 32 }, (_, i) => {
              // Deterministic opacity based on index to prevent hydration mismatch
              const seed = (index * 32 + i) % 100;
              const opacity = seed > 30 ? (seed / 100) * 0.8 + 0.2 : 0.1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity }}
                  transition={{ duration: 0.5, delay: index * 0.1 + i * 0.02 }}
                  className={`aspect-square rounded-sm bg-gradient-to-br ${getStatusColor()}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}




