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
    // Explicitly define the main landing page (hero page) path.
    const isLandingPage = pathname === '/'; 

    // Define base paths for routes that are strictly protected.
    const protectedRouteBases = ['/dashboard', '/settings'];
    // A route is protected if it's one of the protected bases or an IDE page, AND it's NOT the landing page.
    const isStrictlyProtectedRoute = 
      (protectedRouteBases.some(routeBase => pathname.startsWith(routeBase)) || pathname.startsWith('/ide/'))
      && !isLandingPage;

    if (!user && isStrictlyProtectedRoute) {
      // If user is not logged in and tries to access a strictly protected route, redirect to login.
      router.push('/login');
    } else if (user && isAuthPage) {
      // If user is logged in and tries to access an authentication page (login, signup), redirect to dashboard.
      router.push('/dashboard');
    }
    // No automatic redirection from the landing page based on auth state.
    // Navigation from the landing page is handled by user interaction (e.g., "Go to Dashboard" or "Sign In" buttons).

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
