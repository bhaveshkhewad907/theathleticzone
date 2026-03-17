import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import RootRedirect from "../components/layout/RootRedirect";
import LoginPage from "../pages/auth/LoginPage";
import OAuthSuccess from "../pages/auth/OAuthSuccess";
import AthleteLayout from "../components/layout/AthleteLayout";
import AthleteDashboard from "../pages/athlete/AthleteDashboard";
import AthleteSubscriptions from "../pages/athlete/AthleteSubscriptions";
import LivePlans from "../pages/athlete/LivePlans";
import AdminLayout from "../components/layout/AdminPanelLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminGroupSuggestions from "../pages/admin/AdminGroupSuggestions";
import AdminSessions from "../pages/admin/AdminSessions";
import AcceptCoachInvite from "../pages/auth/AcceptCoachInvite";
import AdminInviteCoach from "../pages/admin/AdminInviteCoach";
import AdminInvitations from "../pages/admin/AdminInvitations";
import CoachDashboard from "../pages/coach/CoachDashboard";
import CoachLayout from "../components/layout/CoachLayout";
import AttendanceHistory from "../pages/athlete/AttendanceHistory";
import CoursesMarketplace from "../pages/athlete/CoursesMarketplace";
import MyCourses from "../pages/athlete/MyCourses";
import AdminCourses from "../pages/admin/AdminCourses";
import CoachHistory from "../pages/coach/CoachHistory";
import RegisterPage from "../pages/auth/RegisterPage";
import AthleteProfile from "../pages/athlete/AthleteProfile";
import CoachSessionNotes from "../pages/coach/CoachSessionNotes";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ManageSports from "../pages/admin/ManageSports";
import NotFound from "../components/ui/NotFound";
import TermsOfService from "../pages/public/TermsOfService";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import RefundPolicy from "../pages/public/RefundPolicy";
import CoachProfile from "../pages/coach/CoachProfile";
import AthleteFeedback from "../pages/athlete/AthleteFeedback";

// Later we’ll add AdminLayout & CoachLayout

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
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/oauth-success",
    element: <OAuthSuccess />,
  },
  {
    path: "/accept-coach-invite",
    element: <AcceptCoachInvite />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/refund-policy",
    element: <RefundPolicy />,
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
      {
        path: "/athlete",
        element: <AthleteDashboard />,
      },
      {
        path: "/athlete/subscriptions",
        element: <AthleteSubscriptions />,
      },
      {
        path: "/athlete/live-plans",
        element: <LivePlans />,
      },
      {
        path: "/athlete/feedback",
        element: <AthleteFeedback />,
      },
      {
        path: "/athlete/courses",
        element: <CoursesMarketplace />,
      },
      {
        path: "/athlete/profile",
        element: <AthleteProfile />,
      },
      {
        path: "/athlete/my-courses",
        element: <MyCourses />,
      },
      {
        path: "/athlete/attendance-history",
        element: <AttendanceHistory />,
      },
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
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/groups",
        element: <AdminGroupSuggestions />,
      },
      {
        path: "/admin/sessions",
        element: <AdminSessions />,
      },
      {
        path: "/admin/invite-coach",
        element: <AdminInviteCoach />,
      },
      {
        path: "/admin/courses",
        element: <AdminCourses />,
      },
      {
        path: "/admin/manage-sports",
        element: <ManageSports />,
      },
      {
        path: "/admin/invitations",
        element: <AdminInvitations />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute allowedRoles={["COACH"]}>
        <CoachLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/coach/dashboard",
        element: <CoachDashboard />,
      },
      {
        path: "/coach/history",
        element: <CoachHistory />,
      },
      {
        path: "/coach/notes/:sessionId",
        element: <CoachSessionNotes />,
      },
      {
        path: "/coach/profile",
        element: <CoachProfile />,
      },
    ],
  },
]);

export default router;
