// src/app/settings/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

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
              Future settings options will appear here, such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-left w-fit mx-auto">
              <li>Theme preferences (Light/Dark)</li>
              <li>Editor configurations</li>
              <li>Account management</li>
              <li>Integration settings</li>
            </ul>
            <Button onClick={() => router.back()} className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    