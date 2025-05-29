import type { Metadata } from 'next';
// Removed Geist font imports
import './globals.css';
import { ArcodeProvider } from '@/contexts/ArcodeContext';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { Toaster } from "@/components/ui/toaster";

// Removed geistSans and geistMono font initializations

export const metadata: Metadata = {
  title: 'Arcode - Collaborative IDE',
  description: 'Arcode: A Next-Gen Collaborative IDE powered by AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Removed font variables from body className */}
      <body className="antialiased text-sm" suppressHydrationWarning>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <ArcodeProvider>
            {children}
            <Toaster />
          </ArcodeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
