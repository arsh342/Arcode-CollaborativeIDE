// src/app/settings/page.tsx
"use client";

import React, { useEffect } from 'react'; // Added useEffect
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, SlidersHorizontal, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Use useAuth

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (!authLoading && !user)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <main className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
              <SlidersHorizontal size={32} />
            </div>
            <CardTitle className="text-3xl font-bold">Application Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure your Arcode experience. <br/> (This page is currently under construction)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6 p-6">
            <p className="text-muted-foreground">
              Welcome, {user?.email || 'User'}!
            </p>
            <p className="text-muted-foreground">
              Future settings options will appear here, such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-left w-fit mx-auto">
              <li>Theme preferences (Light/Dark)</li>
              <li>Editor configurations</li>
              <li>Account management (e.g., change password, delete account)</li>
              <li>Integration settings</li>
            </ul>
            <Button onClick={() => router.back()} className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
