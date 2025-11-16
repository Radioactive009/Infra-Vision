'use client';

import { HousingDensityModel } from '../../../components/ai-features/models/HousingDensityModel';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ai-features/components/ui/button';

export default function HousingDensityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-green-900">
      <div className="sticky top-16 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/ai-features">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Housing Density Distribution
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <HousingDensityModel />
      </div>
    </div>
  );
}

