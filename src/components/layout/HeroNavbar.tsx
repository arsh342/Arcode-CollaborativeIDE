
// src/components/layout/HeroNavbar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HeroNavbar() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Adjusted scroll threshold slightly since navbar starts lower
      if (window.scrollY > 20) { 
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call on mount to set initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-[50px] z-50 w-full transition-colors duration-300 ease-in-out",
        isScrolled 
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center px-6">
        <Link href="/" className="flex items-center mr-6">
          <span className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-yellow-400 to-pink-500 dark:from-sky-300 dark:via-yellow-300 dark:to-pink-400 bg-clip-text text-transparent">
            Arcode
          </span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
          {/* Placeholder for future links */}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {!loading && user ? (
            <Button asChild className="text-base [&_svg]:size-5">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : !loading ? (
            <>
              <Button asChild variant="ghost" className="text-base [&_svg]:size-5">
                <Link href="/login"><LogIn className="mr-2 h-5 w-5"/>Sign In</Link>
              </Button>
              <Button asChild className="text-base [&_svg]:size-5">
                <Link href="/signup"><UserPlus className="mr-2 h-5 w-5"/>Sign Up</Link>
              </Button>
            </>
          ) : (
            // Placeholder for loading state
            <div className="h-10 w-28 bg-muted/30 rounded animate-pulse"></div>
          )}
        </div>
      </div>
    </header>
  );
}
