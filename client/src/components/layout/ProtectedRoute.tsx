import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import type { ReactNode } from "react";
import AuthContext from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: ("ADMIN" | "ATHLETE")[];
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth) return null;

  const { isAuthenticated, user } = auth;

  // 1. Basic Auth Check
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Strict Role Check (Fixes the ESLint 'any' error)
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role as "ADMIN" | "ATHLETE")
  ) {
    return <Navigate to="/login" replace />;
  }

  // 3. 🚀 THE STATE MACHINE LOCKOUT (Athletes Only)
  if (user.role === "ATHLETE") {
    const isNeedsAssessment = user.platformState?.status === "NEEDS_ASSESSMENT";
    const isTryingToAccessAssessmentPage = location.pathname === "/assessment";

    // Scenario A: Needs assessment but trying to access the dashboard
    if (isNeedsAssessment && !isTryingToAccessAssessmentPage) {
      return <Navigate to="/assessment" replace />;
    }

    // Scenario B: Is active in training but trying to go back to the assessment page
    if (!isNeedsAssessment && isTryingToAccessAssessmentPage) {
      return <Navigate to="/athlete" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
