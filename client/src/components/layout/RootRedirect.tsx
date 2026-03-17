import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import LandingPage from "./LandingPage";

export default function RootRedirect() {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  // ⚡ THE FIX: Look at isAuthenticated
  const { isAuthenticated, user } = auth;

  // Not logged in → show landing page
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // Redirect by role safely
  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "COACH") {
    return <Navigate to="/coach/dashboard" replace />;
  }

  if (user.role === "ATHLETE") {
    return <Navigate to="/athlete" replace />;
  }

  return <LandingPage />;
}
