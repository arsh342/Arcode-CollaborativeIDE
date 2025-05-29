import DashboardPage from '@/app/dashboard/page';

export default function HomePage() {
  // This page will be effectively protected by AuthProvider in RootLayout
  // and DashboardPage's own auth check.
  return <DashboardPage />;
}
