"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { 
  MapPin, 
  Route, 
  BarChart3, 
  TrendingUp, 
  Leaf,
  Play,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { FeatureCard } from '@/components/ai-features/components/FeatureCard';
import { PremiumUrbanGrowthCard } from '@/components/ai-features/components/PremiumUrbanGrowthCard';
import { Button } from '@/components/ai-features/components/ui/button';
import { useState, useEffect } from 'react';

const features = [
  {
    number: "1.",
    title: "Identify Infrastructure Gaps in Cities",
    description: "Leverage AI algorithms to analyze urban infrastructure patterns, identifying critical gaps in transportation, utilities, and public services. Our advanced mapping technology provides actionable insights for strategic city development.",
    Icon: MapPin
  },
  {
    number: "2.",
    title: "Smart Road & Housing Planning",
    description: "Optimize urban layouts with intelligent road network design and housing distribution analysis. AI-driven planning ensures efficient traffic flow, reduced congestion, and sustainable residential development.",
    Icon: Route
  },
  {
    number: "3.",
    title: "Advanced Data Visualization",
    description: "Transform complex urban datasets into intuitive heat maps, charts, and interactive dashboards. Real-time visualization helps city planners make data-driven decisions with confidence and clarity.",
    Icon: BarChart3
  },
  {
    number: "4.",
    title: "Predict Urban Growth Patterns",
    description: "Harness predictive analytics to forecast population growth, economic development, and infrastructure demands. Stay ahead of urban expansion with AI-powered trend analysis and scenario modeling.",
    Icon: TrendingUp
  },
  {
    number: "5.",
    title: "Sustainability & Green Planning",
    description: "Integrate environmental considerations into every planning decision. AI evaluates carbon footprint, green space optimization, and sustainable resource management for eco-friendly city development.",
    Icon: Leaf
  }
];

interface SmartCityFeaturesProps {
  onInfrastructureAnalyze?: () => void;
  onRoadHousingPlanning?: () => void;
  onDataVisualization?: () => void;
  onUrbanGrowthPatterns?: () => void;
  onSustainabilityGreenPlanning?: () => void;
}

export function SmartCityFeatures({ onInfrastructureAnalyze, onRoadHousingPlanning, onDataVisualization, onUrbanGrowthPatterns, onSustainabilityGreenPlanning }: SmartCityFeaturesProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState<'Population' | 'Economy' | 'Infrastructure'>('Population');
  const [isClient, setIsClient] = useState(false);
  const [particleData, setParticleData] = useState<Array<{
    left: number;
    top: number;
    width: number;
    height: number;
    blur: number;
    xOffset: number;
    delay: number;
  }>>([]);
  const [metricColors, setMetricColors] = useState<string[]>([]);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // Generate random values only on client to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    
    // Generate particle data
    const particles = Array.from({ length: 12 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 2,
      height: Math.random() * 3 + 2,
      blur: Math.random() * 4 + 2,
      xOffset: Math.random() * 30 - 15,
      delay: Math.random() * 10,
    }));
    setParticleData(particles);

    // Generate metric colors
    const colors = Array.from({ length: 64 }, () => {
      const intensity = Math.random() * 0.8 + 0.2;
      const randomValue = Math.random();
      
      if (activeMetricTab === 'Population') {
        return randomValue > 0.7 ? `rgba(239,68,68,${intensity})` : 
               randomValue > 0.4 ? `rgba(59,130,246,${intensity})` : 
               `rgba(34,197,94,${intensity})`;
      } else if (activeMetricTab === 'Economy') {
        return randomValue > 0.6 ? `rgba(245,158,11,${intensity})` : 
               randomValue > 0.3 ? `rgba(0,168,232,${intensity})` : 
               `rgba(52,211,153,${intensity})`;
      } else {
        return randomValue > 0.5 ? `rgba(100,116,139,${intensity})` : 
               randomValue > 0.3 ? `rgba(14,165,233,${intensity})` : 
               `rgba(6,182,212,${intensity})`;
      }
    });
    setMetricColors(colors);
  }, [activeMetricTab]);

  // Mouse tracking for hero visual
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const visualX = useSpring(useTransform(mouseX, [0, windowSize.width], [-2, 2]), { stiffness: 200, damping: 30 });
  const visualY = useSpring(useTransform(mouseY, [0, windowSize.height], [-2, 2]), { stiffness: 200, damping: 30 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Premium Header & Navigation */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200/20 shadow-lg' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="text-2xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Infravision
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Metrics', 'Testimonials'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="relative text-gray-700 hover:text-[#00A8E8] font-medium transition-colors duration-200"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00A8E8] to-[#34D399] origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </nav>

            {/* CTA Button */}
            <motion.div className="hidden md:block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] hover:from-[#0EA5E9] hover:to-[#22C55E] text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                suppressHydrationWarning
              >
                Get a Demo
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/20"
          >
            <div className="px-6 py-4 space-y-4">
              {['Features', 'How It Works', 'Metrics', 'Testimonials'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block text-gray-700 hover:text-[#00A8E8] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Button className="w-full bg-gradient-to-r from-[#00A8E8] to-[#34D399] text-white rounded-full">
                Get a Demo
              </Button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Deep Luxury Gradient Background */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 60%, #0EA5E9 100%)',
            backgroundSize: '300% 300%',
            y: backgroundY
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Radial Spotlight Behind Heading */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 800px 600px at 25% 50%, rgba(14,165,233,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Soft Moving Particle Glow */}
        {isClient && (
          <div className="absolute inset-0">
            {particleData.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.width}px`,
                  height: `${particle.height}px`,
                  background: 'rgba(14,165,233,0.6)',
                  filter: `blur(${particle.blur}px)`,
                  boxShadow: '0 0 20px rgba(14,165,233,0.3)'
                }}
                animate={{
                  y: [0, -60, 0],
                  x: [0, particle.xOffset, 0],
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold mb-6 leading-tight relative"
              style={{ color: '#FFFFFF' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
            >
              <span className="relative">
                AI-Powered
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#0EA5E9] to-[#34D399] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
              </span>
              <span className="block relative">
                Smart City Planning
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#0EA5E9] to-[#34D399] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.4 }}
                />
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 leading-relaxed max-w-xl"
              style={{ color: '#FFFFFF' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16 }}
            >
              Transform urban development with cutting-edge artificial intelligence. 
              Our platform delivers intelligent insights for sustainable, efficient, and future-ready cities.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.24 }}
            >
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-[#0EA5E9] to-[#34D399] text-white px-8 py-4 rounded-full shadow-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/25"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), 0 0 30px rgba(14,165,233,0.5), 0 0 0 1px rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)';
                  }}
                  suppressHydrationWarning
                >
                  Get a Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(16px)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(14,165,233,0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(14,165,233,0.6)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(14,165,233,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  suppressHydrationWarning
                >
                  <Play className="mr-2 w-5 h-5" />
                  Explore Features
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Futuristic Glass Tiles */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              x: visualX,
              y: visualY
            }}
          >
            <div className="w-full h-96 relative">
              <div className="grid grid-cols-3 gap-4 h-full">
                {[
                  { 
                    icon: BarChart3, 
                    delay: 0.5,
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNpdHklMjBkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBzY3JlZW5zfGVufDF8fHx8MTc1NzkxNDU1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: MapPin, 
                    delay: 0.6,
                    image: "https://images.unsplash.com/photo-1558368399-3d5fe0e460f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNpdHklMjByb2FkcyUyMHVyYmFuJTIwaW5mcmFzdHJ1Y3R1cmV8ZW58MXx8fHwxNzU3OTE0NTU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: Leaf, 
                    delay: 0.7,
                    image: "https://images.unsplash.com/photo-1552750691-3174d623f8e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHJlbmV3YWJsZSUyMGVuZXJneSUyMHNtYXJ0JTIwY2l0eXxlbnwxfHx8fDE3NTc5MTQ1NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: TrendingUp, 
                    delay: 0.8,
                    image: "https://images.unsplash.com/photo-1566262258598-53deb7089bf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NTc5MTQ1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: Route, 
                    delay: 0.9,
                    image: "https://images.unsplash.com/photo-1558899367-3cd83fb31ed8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwZmxvdyUyMHNtYXJ0JTIwdHJhbnNwb3J0YXRpb258ZW58MXx8fHwxNzU3OTE0NTY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: BarChart3, 
                    delay: 1.0,
                    image: "https://images.unsplash.com/photo-1725203653092-494c7eec1a30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNpdHklMjB0ZWNobm9sb2d5JTIwZGlnaXRhbHxlbnwxfHx8fDE3NTc5MTQ1Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: MapPin, 
                    delay: 1.1,
                    image: "https://images.unsplash.com/photo-1719460672237-4253bfabb5c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGJ1aWxkaW5ncyUyMG1vZGVybiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTc5MTQ1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: TrendingUp, 
                    delay: 1.2,
                    image: "https://images.unsplash.com/photo-1756701781600-12a63ab571fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwZGV2ZWxvcG1lbnQlMjBncm93dGglMjB1cmJhbiUyMHBsYW5uaW5nfGVufDF8fHx8MTc1NzkxNDU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  },
                  { 
                    icon: Leaf, 
                    delay: 1.3,
                    image: "https://images.unsplash.com/photo-1542800952-e5471ed41326?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNpdHklMjBzdXN0YWluYWJpbGl0eSUyMHBhcmtzJTIwbmF0dXJlfGVufDF8fHx8MTc1NzkxNDU3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  }
                ].map((tile, i) => {
                  const IconComponent = tile.icon;
                  return (
                    <motion.div
                      key={i}
                      className="relative group cursor-pointer overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.05 }}
                      transition={{ duration: 0.6, delay: tile.delay }}
                      whileHover={{ 
                        y: -4,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {/* Premium City Photo Tile */}
                      <div 
                        className="w-full h-full rounded-[20px] relative overflow-hidden"
                        style={{
                          backgroundImage: `url(${tile.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '2px solid transparent',
                          backgroundClip: 'padding-box'
                        }}
                      >
                        {/* Soft Neon Border Glow */}
                        <motion.div
                          className="absolute inset-0 rounded-[20px] pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, #00A8E8, #34D399)',
                            padding: '2px'
                          }}
                          initial={{ opacity: 0.3 }}
                          whileHover={{ 
                            opacity: 0.8,
                            boxShadow: '0 0 30px rgba(0,168,232,0.5), 0 0 60px rgba(52,211,153,0.3)'
                          }}
                        >
                          <div 
                            className="w-full h-full rounded-[18px]"
                            style={{
                              backgroundImage: `url(${tile.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                        </motion.div>

                        {/* Dark Glass Gradient Overlay */}
                        <div 
                          className="absolute inset-0 rounded-[20px]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, transparent 70%)'
                          }}
                        />

                        {/* Photo Zoom Effect on Hover */}
                        <motion.div
                          className="absolute inset-0 rounded-[20px] bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${tile.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.3 }
                          }}
                        />

                        {/* Enhanced Hover Glow Effect */}
                        <motion.div
                          className="absolute inset-0 rounded-[20px] pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          style={{
                            background: 'linear-gradient(135deg, rgba(0,168,232,0.2), rgba(52,211,153,0.2))',
                            boxShadow: '0 0 40px rgba(14,165,233,0.4) inset, 0 0 20px rgba(14,165,233,0.3)'
                          }}
                        />

                        {/* Pulse Animation Border on Hover */}
                        <motion.div
                          className="absolute inset-0 rounded-[20px] pointer-events-none"
                          style={{
                            border: '2px solid rgba(0,168,232,0.6)'
                          }}
                          initial={{ scale: 1, opacity: 0 }}
                          whileHover={{
                            scale: [1, 1.02, 1],
                            opacity: [0, 0.8, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent ml-3">
                Smart Cities
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover how our AI-powered platform transforms urban planning with cutting-edge technology
            </p>
          </motion.div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                number={feature.number}
                title={feature.title}
                description={feature.description}
                Icon={feature.Icon}
                index={index}
                onClick={
                  index === 0 ? onInfrastructureAnalyze :
                  index === 1 ? onRoadHousingPlanning :
                  index === 2 ? onDataVisualization :
                  index === 3 ? onUrbanGrowthPatterns :
                  index === 4 ? onSustainabilityGreenPlanning :
                  undefined
                }
                isClickable={index === 0 || index === 1 || index === 2 || index === 3 || index === 4}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your city planning process
            </p>
          </motion.div>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#00A8E8] to-[#34D399] rounded-full opacity-30"></div>
            
            <div className="space-y-16">
              {[
                {
                  number: "01",
                  title: "Data Integration",
                  description: "Connect your city's data sources - from traffic sensors to demographic information.",
                  icon: BarChart3
                },
                {
                  number: "02", 
                  title: "AI Analysis",
                  description: "Our advanced algorithms analyze patterns and identify optimization opportunities.",
                  icon: TrendingUp
                },
                {
                  number: "03",
                  title: "Smart Recommendations",
                  description: "Receive actionable insights and strategic recommendations for city improvement.",
                  icon: MapPin
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center gap-12 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                      <motion.a
                        href="#"
                        className="inline-flex items-center gap-2 text-[#00A8E8] font-medium mt-4 hover:text-[#34D399] transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        Learn more <ArrowRight className="w-4 h-4" />
                      </motion.a>
                    </div>
                  </div>

                  {/* Step Number Badge */}
                  <div className="relative">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center text-white font-bold text-xl shadow-2xl relative z-10"
                      whileHover={{ scale: 1.1 }}
                    >
                      {step.number}
                    </motion.div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#34D399] blur-lg opacity-50"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Showcase */}
      <section id="metrics" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Live City Metrics</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Real-time insights and analytics powering smarter city decisions
            </p>

            {/* Toggle Chips */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['Population', 'Economy', 'Infrastructure'].map((category) => (
                <motion.button
                  key={category}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeMetricTab === category
                      ? 'bg-gradient-to-r from-[#00A8E8] to-[#34D399] text-white' 
                      : 'bg-[#F5F7FA] text-gray-600 hover:bg-gradient-to-r hover:from-[#00A8E8] hover:to-[#34D399] hover:text-white'
                  }`}
                  style={{
                    boxShadow: activeMetricTab === category
                      ? '0 4px 12px rgba(0,0,0,0.12), 0 0 20px rgba(0,168,232,0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.12)',
                    backdropFilter: 'blur(16px)'
                  }}
                  onClick={() => setActiveMetricTab(category as 'Population' | 'Economy' | 'Infrastructure')}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: activeMetricTab === category
                      ? '0 6px 16px rgba(0,0,0,0.15), 0 0 30px rgba(0,168,232,0.4)' 
                      : '0 6px 16px rgba(0,0,0,0.15), 0 0 20px rgba(0,168,232,0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  suppressHydrationWarning
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Animated Dashboards */}
          <motion.div 
            key={activeMetricTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 xl:gap-12"
          >
            {/* Growth Trends Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg md:shadow-2xl border border-gray-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Growth Trends</h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#00A8E8] to-[#34D399]"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div className="h-48 md:h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Chart Path */}
                  <motion.path
                    d={
                      activeMetricTab === 'Population' ? "M 0,150 Q 80,120 160,100 Q 240,85 320,70 Q 360,60 400,50" :
                      activeMetricTab === 'Economy' ? "M 0,160 Q 100,110 200,90 Q 300,75 400,60" :
                      "M 0,140 Q 120,100 240,85 Q 320,75 400,65"
                    }
                    stroke={
                      activeMetricTab === 'Population' ? "url(#populationGradient)" :
                      activeMetricTab === 'Economy' ? "url(#economyGradient)" :
                      "url(#infrastructureGradient)"
                    }
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  
                  {/* Area Fill */}
                  <motion.path
                    d={
                      activeMetricTab === 'Population' ? "M 0,150 Q 80,120 160,100 Q 240,85 320,70 Q 360,60 400,50 L 400,200 L 0,200 Z" :
                      activeMetricTab === 'Economy' ? "M 0,160 Q 100,110 200,90 Q 300,75 400,60 L 400,200 L 0,200 Z" :
                      "M 0,140 Q 120,100 240,85 Q 320,75 400,65 L 400,200 L 0,200 Z"
                    }
                    fill={
                      activeMetricTab === 'Population' ? "url(#populationAreaGradient)" :
                      activeMetricTab === 'Economy' ? "url(#economyAreaGradient)" :
                      "url(#infrastructureAreaGradient)"
                    }
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
                  />
                  
                  {/* Data Points */}
                  {[
                    { x: 80, y: activeMetricTab === 'Population' ? 120 : activeMetricTab === 'Economy' ? 110 : 100 },
                    { x: 160, y: activeMetricTab === 'Population' ? 100 : activeMetricTab === 'Economy' ? 90 : 85 },
                    { x: 240, y: activeMetricTab === 'Population' ? 85 : activeMetricTab === 'Economy' ? 75 : 75 },
                    { x: 320, y: activeMetricTab === 'Population' ? 70 : activeMetricTab === 'Economy' ? 60 : 65 }
                  ].map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="white"
                      stroke={
                        activeMetricTab === 'Population' ? "#00A8E8" :
                        activeMetricTab === 'Economy' ? "#F59E0B" :
                        "#64748B"
                      }
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.5 + i * 0.1 }}
                      whileHover={{ scale: 1.5, transition: { duration: 0.2 } }}
                    />
                  ))}
                  
                  {/* Gradients */}
                  <defs>
                    {/* Population Gradients */}
                    <linearGradient id="populationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00A8E8" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                    <linearGradient id="populationAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0,168,232,0.2)" />
                      <stop offset="100%" stopColor="rgba(52,211,153,0.05)" />
                    </linearGradient>
                    
                    {/* Economy Gradients */}
                    <linearGradient id="economyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#00A8E8" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                    <linearGradient id="economyAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(245,158,11,0.2)" />
                      <stop offset="50%" stopColor="rgba(0,168,232,0.15)" />
                      <stop offset="100%" stopColor="rgba(52,211,153,0.05)" />
                    </linearGradient>
                    
                    {/* Infrastructure Gradients */}
                    <linearGradient id="infrastructureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#64748B" />
                      <stop offset="50%" stopColor="#0EA5E9" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="infrastructureAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(100,116,139,0.2)" />
                      <stop offset="50%" stopColor="rgba(14,165,233,0.15)" />
                      <stop offset="100%" stopColor="rgba(6,182,212,0.05)" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Metric Labels */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Nov</span>
                </div>
              </div>
            </motion.div>

            {/* City Heatmap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg md:shadow-2xl border border-gray-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">City Heatmap</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="hidden sm:inline">High</span>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="hidden sm:inline">Med</span>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="hidden sm:inline">Low</span>
                </div>
              </div>
              
              <div className="grid grid-cols-8 gap-1 md:gap-2 h-48 md:h-64">
                {isClient && metricColors.length > 0 ? (
                  metricColors.map((backgroundColor, i) => (
                    <motion.div
                      key={`${activeMetricTab}-${i}`}
                      className="rounded-sm hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: i * 0.01,
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                      whileHover={{ 
                        scale: 1.2, 
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: { duration: 0.2 }
                      }}
                    />
                  ))
                ) : (
                  // SSR fallback - empty grid to prevent layout shift
                  Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="rounded-sm bg-gray-200"
                    />
                  ))
                )}
              </div>
              
              {/* Geographic Labels */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-600">
                <div className="text-left">
                  <span className="block font-medium">
                    {activeMetricTab === 'Population' ? 'Downtown Core' : 
                     activeMetricTab === 'Economy' ? 'Business District' : 
                     'Infrastructure Hub'}
                  </span>
                  <span>High Density</span>
                </div>
                <div className="text-right">
                  <span className="block font-medium">
                    {activeMetricTab === 'Population' ? 'Residential Areas' : 
                     activeMetricTab === 'Economy' ? 'Commercial Zones' : 
                     'Utility Networks'}
                  </span>
                  <span>Moderate Density</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Trusted by Cities Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how leading cities are transforming their urban planning processes
            </p>
          </motion.div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "City Planner, Singapore",
                content: "This platform revolutionized how we approach urban development. The AI insights are incredibly accurate.",
                rating: 5
              },
              {
                name: "Marcus Johnson", 
                role: "Urban Development, Toronto",
                content: "We've reduced planning time by 60% while improving decision quality. Absolutely game-changing.",
                rating: 5
              },
              {
                name: "Elena Rodriguez",
                role: "Smart City Director, Barcelona", 
                content: "The sustainability features helped us create more environmentally conscious development plans.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    >
                      ⭐
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Band */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient Background with Rays */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #00A8E8 0%, #0EA5E9 50%, #34D399 100%)',
            backgroundSize: '300% 300%'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Subtle Rays */}
          <div className="absolute inset-0" 
               style={{
                 background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                 backgroundSize: '100px 100px, 150px 150px'
               }}>
          </div>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Ready to Transform Your City?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-12 leading-relaxed"
          >
            Join thousands of cities already using our AI platform to build smarter, more sustainable urban environments.
          </motion.p>

          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            style={{ opacity: 1 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                size="lg"
                className="bg-white text-[#00A8E8] hover:bg-gray-100 px-12 py-4 rounded-full shadow-2xl font-semibold text-lg transition-all duration-300"
                suppressHydrationWarning
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
            
            <motion.a 
              href="#"
              className="text-white/90 hover:text-white font-medium underline-offset-4 hover:underline transition-all duration-200"
              whileHover={{ y: -2 }}
            >
              Schedule a consultation
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-900 text-white relative">
        {/* Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#00A8E8] to-[#34D399]"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent mb-4">
                InfraVision
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transforming urban planning with AI-powered insights for sustainable, efficient cities.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                {['Features', 'Analytics', 'Integrations', 'API'].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                {['Documentation', 'Case Studies', 'Blog', 'Support'].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                {['About', 'Careers', 'Contact', 'Privacy'].map((item) => (
                  <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="border-t border-gray-800 pt-12 mb-8">
            <div className="max-w-md mx-auto text-center">
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <div className="flex gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8E8]"
                  suppressHydrationWarning
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-[#00A8E8] to-[#34D399] rounded-full font-medium hover:shadow-lg transition-all duration-300"
                  suppressHydrationWarning
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 InfraVision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}