"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { InformaticoDashboard } from "@/components/dashboard/InformaticoDashboard";
import { AdministrativoDashboard } from "@/components/dashboard/AdministrativoDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  // Determinar qué dashboard mostrar según el rol
  const renderDashboard = () => {
    if (!user || !user.rol) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo determinar el rol del usuario. Por favor, cierra sesión e inicia sesión nuevamente.
          </AlertDescription>
        </Alert>
      );
    }

    switch (user.rol) {
      case "ADMIN":
        return <AdminDashboard />;
      case "INFORMATICO":
        return <InformaticoDashboard />;
      case "ADMINISTRATIVO":
        return <AdministrativoDashboard />;
      default:
        // Fallback para roles no reconocidos
        return <InformaticoDashboard />;
    }
  };

  return renderDashboard();
}
