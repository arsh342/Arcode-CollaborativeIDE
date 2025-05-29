// src/app/ide/[projectId]/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArcodeLayout from '@/components/arcode/ArcodeLayout';
import { useArcodeContext } from '@/hooks/useArcodeContext'; // Assuming you might want to use this later

export default function ProjectIdePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  // const { setActiveProject } = useArcodeContext(); // Example: if context had a way to set project

  useEffect(() => {
    if (!projectId) {
      // Handle case where projectId is not available, maybe redirect or show error
      // For now, let's assume it's always there due to route structure
      // router.push('/dashboard'); // Or some error page
      return;
    }
    // Here you would typically load project-specific data or files into your ArcodeContext
    // For example: setActiveProject(projectId) or loadFilesForProject(projectId)
    // Since ArcodeContext currently uses static initialFiles, ArcodeLayout will show those.
    // This console.log indicates where project-specific logic would go.
    console.log(`IDE page for project: ${projectId}. ArcodeLayout will display default files.`);

  }, [projectId, router]);


  if (!projectId) {
    // This is a fallback, ideally handled by routing or a loading state from data fetching
    return (
        <div className="flex items-center justify-center h-screen text-xl">
            Project ID not found. Redirecting...
        </div>
    );
  }

  // ArcodeLayout will be rendered using the global ArcodeProvider from RootLayout.
  // The files displayed will be from the static initialFiles in ArcodeContext.
  // Future work: Make ArcodeContext dynamic to load files based on projectId.
  return <ArcodeLayout />;
}

    