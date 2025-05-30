
// src/app/settings/page.tsx
"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, Save, SlidersHorizontal, User, Palette, ShieldAlert } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { db, auth } from '@/firebase/config'; // Ensure auth is imported
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface ApiKeys {
  googleAi?: string;
  openAi?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth(); // logout might not be needed here, but good to have from context
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ googleAi: '', openAi: '' });
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Set initial display name
    setDisplayName(user.displayName || '');

    // Fetch API Keys
    const fetchApiKeys = async () => {
      if (!user) return;
      setIsLoadingKeys(true);
      try {
        const docRef = doc(db, 'userApiKeys', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApiKeys(docSnap.data() as ApiKeys);
        } else {
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

  const handleApiKeysInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveApiKeys = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSavingKeys(true);
    try {
      const docRef = doc(db, 'userApiKeys', user.uid);
      await setDoc(docRef, apiKeys, { merge: true });
      toast({ title: "API Keys Saved", description: "Your API keys have been updated." });
    } catch (error) {
      console.error("Error saving API keys: ", error);
      toast({ title: "Error", description: "Could not save API keys.", variant: "destructive" });
    } finally {
      setIsSavingKeys(false);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Not Authenticated", variant: "destructive" });
      return;
    }
    if (!displayName.trim()) {
      toast({ title: "Display Name Required", description: "Display name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      // The AuthContext's onAuthStateChanged listener should pick up the displayName change automatically.
      // If not, you might need a way to force-refresh the user object in the context.
      toast({ title: "Profile Updated", description: "Your display name has been updated." });
    } catch (error: any) {
      console.error("Error updating profile: ", error);
      toast({ title: "Profile Update Failed", description: error.message || "Could not update display name.", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) {
      toast({ title: "Error", description: "User email not found. Cannot send password reset.", variant: "destructive" });
      return;
    }
    setIsSendingPasswordReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({ title: "Password Reset Email Sent", description: `An email has been sent to ${user.email} with instructions to reset your password.`});
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({ title: "Error", description: error.message || "Could not send password reset email.", variant: "destructive" });
    } finally {
      setIsSendingPasswordReset(false);
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
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-4 pt-10 sm:pt-16">
      <main className="w-full max-w-2xl space-y-8">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="text-center bg-muted/30 pb-6">
            <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4 border border-primary/20">
              <SlidersHorizontal size={32} />
            </div>
            <CardTitle className="text-3xl font-bold">Application Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your Arcode preferences and configurations.
            </CardDescription>
          </CardHeader>
          
          <div className="p-6 space-y-8">
            {/* User Profile Section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                <User size={20} /> User Profile
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="mt-1 bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your email address cannot be changed here.</p>
                </div>
                <div>
                  <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1"
                    disabled={isUpdatingProfile}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingProfile || displayName === (user.displayName || '')}>
                  {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isUpdatingProfile ? "Updating..." : "Save Display Name"}
                </Button>
              </form>
            </section>

            <Separator />

            {/* Security Section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                <ShieldAlert size={20} /> Security
              </h3>
              <div className="space-y-2">
                 <p className="text-sm text-muted-foreground">Manage your account security settings.</p>
                <Button onClick={handleChangePassword} variant="outline" className="w-full sm:w-auto" disabled={isSendingPasswordReset}>
                  {isSendingPasswordReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  {isSendingPasswordReset ? "Sending..." : "Change Password"}
                </Button>
                 <p className="text-xs text-muted-foreground mt-1">This will send a password reset link to your email.</p>
              </div>
              <div className="mt-4">
                <Button variant="destructive" className="w-full sm:w-auto" disabled>
                  {/* <Trash2 className="mr-2 h-4 w-4" /> */}
                  Delete Account (Coming Soon)
                </Button>
                 <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data.</p>
              </div>
            </section>
            
            <Separator />

            {/* Appearance Section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                <Palette size={20} /> Appearance
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Font Family</Label>
                  <p className="text-xs text-muted-foreground mt-1">Change application font (Coming soon).</p>
                  {/* Placeholder for Font Family Select */}
                   <Input disabled placeholder="System Default" className="mt-1 bg-muted/50"/>
                </div>
                <div>
                  <Label className="text-sm font-medium">Font Size</Label>
                   <p className="text-xs text-muted-foreground mt-1">Adjust application font size (Coming soon).</p>
                  {/* Placeholder for Font Size Select */}
                  <Input disabled placeholder="Medium" className="mt-1 bg-muted/50"/>
                </div>
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                   <p className="text-xs text-muted-foreground mt-1">Switch between light/dark themes (Coming soon).</p>
                   <Input disabled placeholder="Dark (Current)" className="mt-1 bg-muted/50"/>
                </div>
              </div>
            </section>

            <Separator />

            {/* AI Provider API Keys Section */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                <KeyRound size={20} /> AI Provider API Keys
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                These keys are stored securely. For production apps, handle API keys via a dedicated backend.
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
                      onChange={handleApiKeysInputChange}
                      className="mt-1"
                      disabled={isSavingKeys}
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
                      onChange={handleApiKeysInputChange}
                      className="mt-1"
                      disabled={isSavingKeys}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Placeholder for future OpenAI integration.</p>
                  </div>
                </div>
              )}
              <Button onClick={handleSaveApiKeys} className="mt-4 w-full sm:w-auto" disabled={isLoadingKeys || isSavingKeys}>
                {isSavingKeys ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSavingKeys ? "Saving..." : "Save API Keys"}
              </Button>
            </section>
          </div>
          
          <CardFooter className="bg-muted/30 p-6 flex justify-end">
             <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
