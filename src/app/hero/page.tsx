// src/app/hero/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Users, Code, Bot, ShieldCheck, Cloud } from 'lucide-react';
import HeroNavbar from '@/components/layout/HeroNavbar'; 

const features = [
  {
    icon: <Code size={32} className="text-primary" />,
    title: 'Intuitive Code Editor',
    description: 'Experience a feature-rich Monaco-based editor with syntax highlighting, autocompletion, and VS Code-like experience.',
    aiHint: 'code editor interface'
  },
  {
    icon: <Bot size={32} className="text-primary" />,
    title: 'AI-Powered Assistant',
    description: 'Leverage Genkit AI to explain, debug, and refactor your code, boosting productivity and learning.',
    aiHint: 'artificial intelligence robot'
  },
  {
    icon: <Users size={32} className="text-primary" />,
    title: 'Project Management',
    description: 'Organize your work with a clear project dashboard, create new projects, and manage your files efficiently.',
    aiHint: 'team collaboration'
  },
  {
    icon: <Zap size={32} className="text-primary" />,
    title: 'Firebase Integrated',
    description: 'Seamless Firebase authentication and Firestore database integration for robust and scalable applications.',
    aiHint: 'database server'
  },
  {
    icon: <ShieldCheck size={32} className="text-primary" />,
    title: 'Secure Authentication',
    description: 'Robust sign-in options including email/password, Google, and GitHub, ensuring your projects are safe.',
    aiHint: 'security shield'
  },
  {
    icon: <Cloud size={32} className="text-primary" />,
    title: 'Cloud Based IDE',
    description: 'Access your projects and code from anywhere, on any device, without complex local setups.',
    aiHint: 'cloud computing'
  },
];

export default function HeroPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeroNavbar />

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/20 via-background to-background/90"> {/* Updated gradient */}
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Build, Collaborate, Innovate with <span className="text-primary">Arcode</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The next-generation collaborative IDE, supercharged by AI. Streamline your development workflow, from idea to deployment.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
          <div className="mt-16 relative aspect-video max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden border border-border">
            <Image 
                src="https://placehold.co/1200x675.png" 
                alt="Arcode IDE Screenshot" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="modern IDE screenshot"
                priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Arcode?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to develop modern applications, faster and smarter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="items-center text-center pb-4">
                    <div className="p-3 rounded-full bg-primary/10 mb-3 w-fit">
                        {feature.icon}
                    </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-background">
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
      <footer className="py-8 bg-muted border-t">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Arcode. All rights reserved.</p>
          <p className="text-sm mt-1">Crafted with ❤️ by Firebase Studio</p>
        </div>
      </footer>
    </div>
  );
}
