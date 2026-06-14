import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import RootRedirect from "../components/layout/RootRedirect";
import NotFound from "../components/ui/NotFound";

// 1. Keep Layouts & Critical Routing Static
import AthleteLayout from "../components/layout/AthleteLayout";
import AdminLayout from "../components/layout/AdminPanelLayout";
import { Loadable } from "../components/ui/Loadable";
import AssessmentWizard from "../components/ui/AssessmentWizard";

// 2. Lazy Load All Pages
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
const AthleteFeedback = lazy(() => import("../pages/athlete/AthleteFeedback"));
const CoursesMarketplace = lazy(
  () => import("../pages/athlete/CoursesMarketplace"),
);
const MyCourses = lazy(() => import("../pages/athlete/MyCourses"));
const AthleteProfile = lazy(() => import("../pages/athlete/AthleteProfile"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminInvitations = lazy(() => import("../pages/admin/AdminInvitations"));
const AdminCourses = lazy(() => import("../pages/admin/AdminCourses"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/login",
    element: Loadable(LoginPage),
  },
  {
    path: "/register",
    element: Loadable(RegisterPage),
  },
  {
    path: "/forgot-password",
    element: Loadable(ForgotPassword),
  },
  {
    path: "/oauth-success",
    element: Loadable(OAuthSuccess),
  },
  {
    path: "/terms",
    element: Loadable(TermsOfService),
  },
  {
    path: "/privacy",
    element: Loadable(PrivacyPolicy),
  },
  {
    path: "/refund-policy",
    element: Loadable(RefundPolicy),
  },

  // 🚀 NEW: ATHLETE ONBOARDING WIZARD
  {
    path: "/assessment",
    element: (
      <ProtectedRoute allowedRoles={["ATHLETE"]}>
        <AssessmentWizard />
      </ProtectedRoute>
    ),
  },

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
      { path: "/athlete/feedback", element: Loadable(AthleteFeedback) },
      { path: "/athlete/courses", element: Loadable(CoursesMarketplace) },
      { path: "/athlete/profile", element: Loadable(AthleteProfile) },
      { path: "/athlete/my-courses", element: Loadable(MyCourses) },
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
      { path: "/admin/invitations", element: Loadable(AdminInvitations) },
    ],
  },
]);

export default router;
