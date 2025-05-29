// src/components/layout/HeroNavbar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, LogIn, UserPlus } from 'lucide-react';

export default function HeroNavbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-6">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Arcode</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
          <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          {/* Placeholder for future links */}
          {/* <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link> */}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {!loading && user ? (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : !loading ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4"/>Sign Up</Link>
              </Button>
            </>
          ) : (
            <div className="h-9 w-24 bg-muted rounded animate-pulse"></div> // Placeholder while loading
          )}
        </div>
      </div>
    </header>
  );
}
