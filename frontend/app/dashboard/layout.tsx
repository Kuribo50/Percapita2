'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SelectedNuevoUsuarioProvider } from '@/contexts/SelectedNuevoUsuarioContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, isReady, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isReady, isAuthenticated, router]);

  const sidebarWidth = isSidebarOpen ? '18rem' : '4rem';

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SelectedNuevoUsuarioProvider>
      <div className="relative min-h-screen bg-muted/40 dark:bg-background">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          user={user}
          onLogout={logout}
        />

        <Sidebar isOpen={isSidebarOpen} />

        <main
          className="flex-1 transition-[margin-left] duration-300 ease-out"
          style={{ marginLeft: sidebarWidth, paddingTop: '4rem' }}
        >
          <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </SelectedNuevoUsuarioProvider>
  );
}
