// src/app/hero/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Bot, Users, Zap, ShieldCheck, Cloud } from 'lucide-react';
import HeroNavbar from '@/components/layout/HeroNavbar'; 
import ParticlesBackground from '@/components/effects/ParticlesBackground';

const features = [
  {
    icon: Code,
    title: 'Intelligent Code Editor',
    description: 'Monaco-powered editor with syntax highlighting, autocompletion, and an intuitive interface.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Assistance',
    description: 'Integrated AI to help you debug, refactor, and understand code faster.',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Code together seamlessly with integrated chat and (soon) shared editing.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Performance',
    description: 'Built with Next.js for optimal speed and responsiveness.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description: 'Your code is safe with robust Firebase authentication and database rules.',
  },
  {
    icon: Cloud,
    title: 'Cloud-Based Workflow',
    description: 'Access your projects from anywhere, on any device.',
  },
];

const arcodeVariations = ["Arcode", "Arcøde", "Arcodé", "Λrcode", "Ar코드", "Ar{code}", "Ärcode", "Ārcōde", "Arコーデ", "อาโค้ด", "代码弧", "Аркод", "Arkodez", "Արկոդ", "Αρκόντ", "ארקוד"];


export default function HeroPage() {
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
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Choose Arcode?
            </h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
              Discover the power of a truly modern development environment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4 mx-auto">
                    <feature.icon size={28} />
                  </div>
                  <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
