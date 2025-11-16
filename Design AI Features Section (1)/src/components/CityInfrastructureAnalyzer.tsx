import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Cross, 
  Trees, 
  FileText,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { InfrastructureCard } from './InfrastructureCard';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

const infrastructureData = [
  {
    title: "Analyze School Distribution in the City",
    description: "Comprehensive analysis of educational infrastructure across Delhi NCR. Identify underserved areas and optimize school placement for maximum accessibility.",
    Icon: GraduationCap,
    coverage: 78,
    totalFacilities: 1247,
    status: 'good' as const
  },
  {
    title: "Hospital & Healthcare Access",
    description: "Map healthcare facility distribution and accessibility. Analyze coverage gaps and emergency response times across different city zones.",
    Icon: Cross,
    coverage: 85,
    totalFacilities: 432,
    status: 'excellent' as const
  },
  {
    title: "Park & Green Space Availability",
    description: "Evaluate green space distribution and environmental health indicators. Identify areas requiring more parks and recreational facilities.",
    Icon: Trees,
    coverage: 62,
    totalFacilities: 189,
    status: 'needs-improvement' as const
  }
];

interface CityInfrastructureAnalyzerProps {
  onBack?: () => void;
}

export function CityInfrastructureAnalyzer({ onBack }: CityInfrastructureAnalyzerProps) {
  return (
    <section className="relative py-20 px-4 min-h-screen">
      {/* Background with Delhi city theme */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1677933001473-538ea5ffa19a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEZWxoaSUyMGNpdHklMjBza3lsaW5lJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc1NzU3NzcyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Delhi city skyline"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90"></div>
        
        {/* Tech grid pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `
                 linear-gradient(90deg, rgba(0,168,232,0.15) 1px, transparent 1px),
                 linear-gradient(rgba(52,211,153,0.15) 1px, transparent 1px)
               `,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          {/* Back button */}
          {onBack && (
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-[#00A8E8] transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Features
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <MapPin className="w-8 h-8 text-[#00A8E8]" />
              <span className="text-[#34D399] font-semibold tracking-wide uppercase text-sm">Delhi NCR • Gurugram</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              City Infrastructure
              <span className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent block mt-2">
                Intelligence Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Advanced AI-powered analysis of critical urban infrastructure. Real-time insights into school coverage, 
              healthcare accessibility, and green space distribution across Delhi NCR metropolitan area.
            </p>
            
            {/* Status indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Live Data Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-3 h-3 rounded-full bg-[#00A8E8]"></div>
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Infrastructure Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {infrastructureData.map((infrastructure, index) => (
            <InfrastructureCard
              key={index}
              title={infrastructure.title}
              description={infrastructure.description}
              Icon={infrastructure.Icon}
              coverage={infrastructure.coverage}
              totalFacilities={infrastructure.totalFacilities}
              status={infrastructure.status}
              index={index}
            />
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
                1,868
              </div>
              <div className="text-gray-600">Total Facilities Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
                75%
              </div>
              <div className="text-gray-600">Average Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
                2.4M
              </div>
              <div className="text-gray-600">Population Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-2">
                98%
              </div>
              <div className="text-gray-600">Data Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0090C7] hover:to-[#2BC380] text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-3">
              <FileText className="w-5 h-5" />
              Explore Full City Report
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#34D399] to-[#00A8E8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
          
          <p className="text-gray-500 mt-6 text-sm">
            Comprehensive analysis covering 15+ infrastructure categories • Updated every 24 hours
          </p>
        </motion.div>
      </div>
    </section>
  );
}