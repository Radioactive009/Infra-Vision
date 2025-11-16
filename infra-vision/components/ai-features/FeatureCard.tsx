'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  titleColor?: string;
  linkText?: string;
  gradientFrom?: string;
  gradientTo?: string;
  borderColor?: string;
}

export function FeatureCard({
  href,
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-cyan-500',
  titleColor = 'text-teal-300',
  linkText = 'View Details',
  gradientFrom = 'from-cyan-900',
  gradientTo = 'to-gray-900',
  borderColor = 'border-cyan-800/50 hover:border-cyan-500'
}: FeatureCardProps) {
  const cardClassName = `h-full w-full cursor-pointer rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 text-white shadow-xl transition-all border ${borderColor} flex flex-col`;

  return (
    <Link 
      href={href} 
      className="block h-full no-underline focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-2xl"
      style={{ textDecoration: 'none', color: 'inherit' }}
      prefetch={true}
    >
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cardClassName}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`rounded-xl ${iconBgColor} p-3 text-white shadow-lg flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <h2 className={`text-xl font-semibold ${titleColor} flex-1`}>{title}</h2>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4 flex-1">
          {description}
        </p>
        <div className={`flex items-center ${titleColor} font-medium mt-auto pt-4 border-t border-white/10 group`}>
          <span>{linkText}</span>
          <svg
            className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
