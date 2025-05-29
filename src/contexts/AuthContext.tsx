// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth'; // Import type for User
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
    // The root path '/' now serves the hero page and should be publicly accessible.
    // '/hero' is an alias or direct route to the same content.
    const isPublicEntryPoint = pathname === '/' || pathname === '/hero';


    // Define protected routes clearly
    const protectedRoutes = ['/dashboard', '/settings']; // Base paths for protected routes
    // Check if current pathname starts with any of the protected base paths or /ide/
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/ide/');

    if (!user && isProtectedRoute) {
      router.push('/login');
    } else if (user && isAuthPage) {
      // If user is logged in and tries to access login/signup, redirect to dashboard
      router.push('/dashboard');
    }
    // No automatic redirection from public entry points like '/' or '/hero' based on auth state.
    // Navigation from these pages is handled by user interaction (e.g., "Go to Dashboard" button).

  }, [user, loading, router, pathname]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); // Explicitly set user to null
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error, maybe show a toast
    }
  };
  
  // Show loader only during initial auth state check
  // or if trying to access a page before auth state is resolved for redirection.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
