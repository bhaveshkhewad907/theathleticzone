import { Navigate } from "react-router-dom";
import { useContext } from "react";
import type { ReactNode } from "react";
import AuthContext from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: ("ADMIN" | "COACH" | "ATHLETE")[];
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
    !allowedRoles.includes(user.role as "ADMIN" | "COACH" | "ATHLETE")
  ) {
    return <Navigate to="/login" replace />;
  }

  // 🚀 THE FIX: The State Machine Lockout has been completely removed.
  // The system will now let the athlete proceed to whatever route they requested!
  return <>{children}</>;
};

export default ProtectedRoute;
