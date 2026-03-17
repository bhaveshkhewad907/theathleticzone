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

  // ⚡ THE FIX: Look at isAuthenticated, NOT accessToken!
  const { isAuthenticated, user } = auth;

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
