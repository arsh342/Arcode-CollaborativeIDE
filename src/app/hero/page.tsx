// src/app/hero/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Bot, Users, Zap, ShieldCheck, Cloud } from 'lucide-react';
import HeroNavbar from '@/components/layout/HeroNavbar'; 
import ParticlesBackground from '@/components/effects/ParticlesBackground';

// features array removed as the section is removed

const arcodeVariations = ["Arcode", "Arcøde", "Arcodé", "Λrcode", "Ar코드", "Ar{code}", "Ärcode", "Ārcōde", "Arコーデ", "อาโค้ด", "代码弧", "Аркод", "Arkodez", "Արկոդ", "Αρκόντ", "ארקוד"];


export default function HeroPage() {
  // isScrolled and featuresSectionRef related logic removed
  const [currentArcodeWordIndex, setCurrentArcodeWordIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentArcodeWordIndex((prevIndex) => (prevIndex + 1) % arcodeVariations.length);
    }, 1500); 

    return () => clearInterval(intervalId);
  }, []);

  const currentArcodeDisplayWord = arcodeVariations[currentArcodeWordIndex];

  return (
    <div 
      className="flex flex-col min-h-screen bg-background relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(270, 8%, 20%) 0%, hsl(var(--background)) 70%)`,
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed', 
      }}
    >
      <HeroNavbar />
      <ParticlesBackground />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 
                         bg-gradient-to-r from-sky-400 via-yellow-400 to-pink-500 
                         dark:from-sky-300 dark:via-yellow-300 dark:to-pink-400
                         bg-clip-text text-transparent">
            Build, Collaborate, Innovate with <span 
              key={currentArcodeDisplayWord} 
              className="arcode-animated-text bg-gradient-to-r from-sky-400 via-yellow-400 to-pink-500 dark:from-sky-300 dark:via-yellow-300 dark:to-pink-400 bg-clip-text text-transparent block mt-1 md:mt-2 text-5xl md:text-7xl"
            >
              {currentArcodeDisplayWord}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The next-generation collaborative IDE, supercharged by AI. Streamline your development workflow, from idea to deployment.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            {/* Learn More button removed */}
          </div>
        </div>
      </section>
      
      {/* Features Section Removed */}
      

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Elevate Your Coding?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of developers building amazing things with Arcode.
          </p>
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/signup">Start Your Free Trial Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border/30 relative z-10">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Arcode. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
