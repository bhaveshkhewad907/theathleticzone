import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import RootRedirect from "../components/layout/RootRedirect";
import NotFound from "../components/ui/NotFound";

import AthleteLayout from "../components/layout/AthleteLayout";
import AdminLayout from "../components/layout/AdminPanelLayout";
import { Loadable } from "../components/ui/Loadable";
import AthleteFeedback from "../pages/athlete/AthleteFeedback";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const OAuthSuccess = lazy(() => import("../pages/auth/OAuthSuccess"));

const TermsOfService = lazy(() => import("../pages/public/TermsOfService"));
const PrivacyPolicy = lazy(() => import("../pages/public/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("../pages/public/RefundPolicy"));

const AthleteDashboard = lazy(
  () => import("../pages/athlete/AthleteDashboard"),
);
const AthleteProfile = lazy(() => import("../pages/athlete/AthleteProfile"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminCourses = lazy(() => import("../pages/admin/AdminCourses"));
const AdminAthletes = lazy(() => import("../pages/admin/AdminAthletes"));

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "*", element: <NotFound /> },
  { path: "/login", element: Loadable(LoginPage) },
  { path: "/register", element: Loadable(RegisterPage) },
  { path: "/forgot-password", element: Loadable(ForgotPassword) },
  { path: "/oauth-success", element: Loadable(OAuthSuccess) },
  { path: "/terms", element: Loadable(TermsOfService) },
  { path: "/privacy", element: Loadable(PrivacyPolicy) },
  { path: "/refund-policy", element: Loadable(RefundPolicy) },

  // 🚀 THE BOLD FIX: The standalone /assessment route has been DELETED.

  // ==========================
  // ATHLETE ROUTES
  // ==========================
  {
    element: (
      <ProtectedRoute allowedRoles={["ATHLETE"]}>
        <AthleteLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/athlete", element: Loadable(AthleteDashboard) },
      { path: "/athlete/profile", element: Loadable(AthleteProfile) },
      { path: "/athlete/leave-review", element: Loadable(AthleteFeedback) },
    ],
  },

  // ==========================
  // ADMIN ROUTES
  // ==========================
  {
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/admin", element: Loadable(AdminDashboard) },
      { path: "/admin/courses", element: Loadable(AdminCourses) },
      { path: "/admin/athletes", element: Loadable(AdminAthletes) },
    ],
  },
]);

export default router;
