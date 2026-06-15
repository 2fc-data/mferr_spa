import React from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DashboardGuardProps {
  children: React.ReactNode;
}

/**
 * Componente Wrapper para proteger as rotas de Dashboard, garantindo que apenas administradores as acessem.
 */
export const DashboardGuard: React.FC<DashboardGuardProps> = ({ children }) => {
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.profiles?.some((p: any) => p.id === 1);

  if (!isAdmin) {
    return <Navigate to="/Dashboard/users" replace />;
  }

  return <>{children}</>;
};
