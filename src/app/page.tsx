import HeroPage from '@/app/hero/page';

export default function HomePage() {
  // This page will now render the HeroPage.
  // AuthProvider in RootLayout and HeroPage's own logic will handle UI based on auth state.
  return <HeroPage />;
}
