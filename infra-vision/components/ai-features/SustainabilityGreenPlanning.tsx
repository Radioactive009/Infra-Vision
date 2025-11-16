'use client';

import { useState } from 'react';
import { ArrowLeft, Recycle, Activity } from 'lucide-react';
import { Button } from './components/ui/button';
import { SustainableResourceForecast } from './SustainableResourceForecast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { FeatureCard } from './FeatureCard';

interface SustainabilityGreenPlanningProps {
  onBack?: () => void;
}

export function SustainabilityGreenPlanning({ onBack }: SustainabilityGreenPlanningProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <h1 className="text-3xl font-bold text-white">
                Sustainability & Green Planning
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-8">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-white data-[state=active]:bg-gray-700">
              🧠 AI Resource Forecast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Sustainability Features</h2>
              <p className="text-gray-300 mb-6">
                Explore AI-powered sustainability analytics and green planning tools for smart city management.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-400 transition-colors">
                  <h3 className="text-xl font-semibold text-white mb-2">Carbon Footprint</h3>
                  <p className="text-gray-400 mb-4">Track and reduce city emissions</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-400 transition-colors">
                  <h3 className="text-xl font-semibold text-white mb-2">Green Space</h3>
                  <p className="text-gray-400 mb-4">Optimize parks and urban greenery</p>
                </div>
                <div className="relative" style={{ minHeight: '280px' }}>
                  <FeatureCard
                    href="/sustainability/resource-management"
                    title="Sustainable Resource Management"
                    description="AI-powered optimization of water, energy, and waste systems. Reduce consumption, minimize waste, and create circular economy solutions for sustainable urban living."
                    icon={Recycle}
                    iconBgColor="bg-cyan-500"
                    titleColor="text-teal-300"
                    linkText="View Analytics"
                    gradientFrom="from-cyan-900"
                    gradientTo="to-gray-900"
                    borderColor="border-cyan-800/50 hover:border-cyan-500"
                  />
                </div>
                <div className="relative" style={{ minHeight: '280px' }}>
                  <FeatureCard
                    href="/sustainability/eco-impact"
                    title="Eco Impact Forecasting"
                    description="Predictive analytics for long-term environmental impact of city policies. Model climate scenarios and assess sustainability outcomes before implementation."
                    icon={Activity}
                    iconBgColor="bg-blue-500"
                    titleColor="text-cyan-300"
                    linkText="View Forecast"
                    gradientFrom="from-teal-900"
                    gradientTo="to-gray-900"
                    borderColor="border-teal-800/50 hover:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forecast">
            <SustainableResourceForecast />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}





