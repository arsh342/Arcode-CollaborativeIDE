// src/app/settings/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, Save, SlidersHorizontal } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ApiKeys {
  googleAi?: string;
  openAi?: string; // Placeholder for future
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ googleAi: '', openAi: '' });
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchApiKeys = async () => {
      if (!user) return;
      setIsLoadingKeys(true);
      try {
        const docRef = doc(db, 'userApiKeys', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApiKeys(docSnap.data() as ApiKeys);
        } else {
          // Initialize with empty strings if no doc exists
          setApiKeys({ googleAi: '', openAi: '' });
        }
      } catch (error) {
        console.error("Error fetching API keys: ", error);
        toast({ title: "Error", description: "Could not load API keys.", variant: "destructive" });
      } finally {
        setIsLoadingKeys(false);
      }
    };

    fetchApiKeys();
  }, [user, authLoading, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveApiKeys = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, 'userApiKeys', user.uid);
      await setDoc(docRef, apiKeys, { merge: true }); // merge: true to only update provided fields
      toast({ title: "API Keys Saved", description: "Your API keys have been updated." });
    } catch (error) {
      console.error("Error saving API keys: ", error);
      toast({ title: "Error", description: "Could not save API keys.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
              Manage your Arcode preferences and API configurations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <KeyRound size={20} /> AI Provider API Keys
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                These keys are stored in your user-specific document in Firestore. For production apps, handle API keys via a secure backend.
              </p>
              {isLoadingKeys ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                  <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="googleAiKey" className="text-sm font-medium">Google AI API Key (Gemini)</Label>
                    <Input
                      id="googleAiKey"
                      name="googleAi"
                      type="password"
                      placeholder="Enter your Google AI API Key"
                      value={apiKeys.googleAi || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                      disabled={isSaving}
                    />
                     <p className="text-xs text-muted-foreground mt-1">Used for Genkit AI features.</p>
                  </div>
                  <div>
                    <Label htmlFor="openAiKey" className="text-sm font-medium">OpenAI API Key (Placeholder)</Label>
                    <Input
                      id="openAiKey"
                      name="openAi"
                      type="password"
                      placeholder="Enter your OpenAI API Key (optional)"
                      value={apiKeys.openAi || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Placeholder for future OpenAI integration.</p>
                  </div>
                </div>
              )}
              <Button onClick={handleSaveApiKeys} className="mt-4 w-full sm:w-auto" disabled={isLoadingKeys || isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? "Saving..." : "Save API Keys"}
              </Button>
            </section>

            <hr className="my-6 border-border" />
            
            <section>
              <h3 className="text-xl font-semibold mb-3">More Settings</h3>
              <p className="text-muted-foreground">
                Future settings options will appear here, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm mt-2">
                <li>Theme preferences (Light/Dark toggle)</li>
                <li>Editor configurations (font size, tab spacing)</li>
                <li>Account management (e.g., change password, delete account)</li>
              </ul>
            </section>
          </CardContent>
           <CardFooter className="flex justify-end p-6">
             <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
           </CardFooter>
        </Card>
      </main>
    </div>
  );
}
