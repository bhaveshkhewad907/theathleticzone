import { Navigate } from "react-router-dom";
import { useContext } from "react";
import type { ReactNode } from "react";
import AuthContext from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: ("ADMIN" | "ATHLETE")[];
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { isAuthenticated, user } = auth;

  // 1. Basic Auth Check
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Strict Role Check
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role as "ADMIN" | "ATHLETE")
  ) {
    return <Navigate to="/login" replace />;
  }

  // 🚀 THE FIX: We completely removed the State Machine Lockout from here!
  // The router should JUST check permissions. The layout handles the popups.

  return <>{children}</>;
};

export default ProtectedRoute;
