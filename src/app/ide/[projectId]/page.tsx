// src/app/ide/[projectId]/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArcodeLayout from '@/components/arcode/ArcodeLayout';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Loader2 } from 'lucide-react';

export default function ProjectIdePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { user, loading: authLoading } = useAuth(); // Use useAuth
  
  useEffect(() => {
    if (authLoading) return; // Wait for auth state to load

    if (!user) {
      router.push('/login'); // Redirect if not logged in
      return;
    }
    
    if (!projectId) {
      // This case should ideally not happen if routing is set up correctly
      // and user navigates from dashboard.
      console.warn("Project ID missing, redirecting to dashboard.");
      router.push('/dashboard');
      return;
    }
    
    console.log(`IDE page for project: ${projectId}. User: ${user.email}`);
    // Future: Load project-specific files based on projectId and user.
    // For now, ArcodeLayout will display default files from ArcodeContext.

  }, [projectId, router, user, authLoading]);


  if (authLoading || (!authLoading && !user)) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!projectId && !authLoading && user) {
     // This state might occur briefly if projectId is not yet available from params
     // but auth is resolved.
     // Or if redirection from useEffect above hasn't completed.
    return (
        <div className="flex items-center justify-center h-screen text-xl">
            Loading project details or redirecting...
        </div>
    );
  }

  return <ArcodeLayout />;
}
