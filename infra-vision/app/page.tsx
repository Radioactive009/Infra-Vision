"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [animationStage, setAnimationStage] = useState<'intro' | 'transition' | 'final'>('intro');

  useEffect(() => {
    // Stage 1: Intro Text (3 seconds) -> Transition (Fade Out)
    const timer1 = setTimeout(() => {
      setAnimationStage('transition');
    }, 3000);

    // Stage 2: Transition (1 second) -> Final (Show Button)
    const timer2 = setTimeout(() => {
      setAnimationStage('final');
    }, 4000); // 3000 + 1000ms transition

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden -mt-16">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/infravision_intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Optional overlay for visual contrast */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content Container */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pb-60">

        {/* Intro Text */}
        <div
          className={`transition-opacity duration-1000 ease-in-out absolute
            ${animationStage === 'intro' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent text-center drop-shadow-lg tracking-tight">
            Are you ready to transform your city?
          </h1>
        </div>

        {/* Action Button */}
        <div
          className={`transition-all duration-1000 ease-in-out transform
            ${animationStage === 'final' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        >
          <Link
            href="/ai-features"
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full 
                       hover:bg-white/20 transition-all duration-300 overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A8E8]/20 to-[#34D399]/20 opacity-0 
                           group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative text-2xl font-bold text-white tracking-wide">
              Click here to explore features
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}





