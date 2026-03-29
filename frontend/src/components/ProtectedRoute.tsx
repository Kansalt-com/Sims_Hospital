import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { GlobalLoader } from "./ui/GlobalLoader";

export const ProtectedRoute = ({
  roles,
}: {
  roles?: Role[];
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GlobalLoader variant="fullPage" text="Loading workspace..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.forcePasswordChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (!user.forcePasswordChange && location.pathname === "/change-password") {
    return <Navigate to="/dashboard" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
