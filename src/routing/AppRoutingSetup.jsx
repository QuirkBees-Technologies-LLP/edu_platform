import { Navigate, Route, Routes } from "react-router";
import { DefaultPage, Demo1DarkSidebarPage } from "@/pages/dashboards";
import {
  ProfileActivityPage,
  ProfileBloggerPage,
  CampaignsCardPage,
  CampaignsListPage,
  ProjectColumn2Page,
  ProjectColumn3Page,
  ProfileCompanyPage,
  ProfileCreatorPage,
  ProfileCRMPage,
  ProfileDefaultPage,
  ProfileEmptyPage,
  ProfileFeedsPage,
  ProfileGamerPage,
  ProfileModalPage,
  ProfileNetworkPage,
  ProfileNFTPage,
  ProfilePlainPage,
  ProfileTeamsPage,
  ProfileWorksPage,
} from "@/pages/public-profile";
import {
  AccountActivityPage,
  AccountAllowedIPAddressesPage,
  AccountApiKeysPage,
  AccountAppearancePage,
  AccountBackupAndRecoveryPage,
  AccountBasicPage,
  AccountCompanyProfilePage,
  AccountCurrentSessionsPage,
  AccountDeviceManagementPage,
  AccountEnterprisePage,
  AccountGetStartedPage,
  AccountHistoryPage,
  AccountImportMembersPage,
  AccountIntegrationsPage,
  AccountInviteAFriendPage,
  AccountMembersStarterPage,
  AccountNotificationsPage,
  AccountOverviewPage,
  AccountPermissionsCheckPage,
  AccountPermissionsTogglePage,
  AccountPlansPage,
  AccountPrivacySettingsPage,
  AccountRolesPage,
  AccountSecurityGetStartedPage,
  AccountSecurityLogPage,
  AccountSettingsEnterprisePage,
  AccountSettingsModalPage,
  AccountSettingsPlainPage,
  AccountSettingsSidebarPage,
  AccountTeamInfoPage,
  AccountTeamMembersPage,
  AccountTeamsPage,
  AccountTeamsStarterPage,
  AccountUserProfilePage,
} from "@/pages/account";
import {
  NetworkAppRosterPage,
  NetworkMarketAuthorsPage,
  NetworkAuthorPage,
  NetworkGetStartedPage,
  NetworkMiniCardsPage,
  NetworkNFTPage,
  NetworkSocialPage,
  NetworkUserCardsTeamCrewPage,
  NetworkSaasUsersPage,
  NetworkStoreClientsPage,
  NetworkUserTableTeamCrewPage,
  NetworkVisitorsPage,
} from "@/pages/network";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import {
  AuthenticationWelcomeMessagePage,
  AuthenticationAccountDeactivatedPage,
  AuthenticationGetStartedPage,
} from "@/pages/authentication";
import { useAuthContext } from "../auth/useAuthContext";
import AdminTradeIdeas from "../pages/admin/admin-trade-ideas/AdminTradeIdeas";
import LiveSession from "../pages/admin/live-session/LiveSession";
import ViewLiveSession from "../pages/admin/live-session/AdminLiveSessionView";
import AdminLiveSessionView from "../pages/admin/live-session/AdminLiveSessionView";
import Courses from "../pages/admin/courses/Courses";
import { EducatorDetailPage } from "../pages/educatorDetail";
import ClientLiveSession from "../pages/student/client-live-session/ClientLiveSession";
import ClientViewLiveSession from "../pages/student/client-live-session/ClientViewLiveSession";
import ClientTradeIdeas from "../pages/student/client-trade-ideas/ClientTradeIdeas";
import VideoLibrary from "../pages/student/video-library/VideoLibrary";
import EducatorTradeIdeas from "../pages/educator/educator-trade-ideas/EducatorTradeIdeas";
import Educators from "../pages/admin/educators/Educators";
import EducatorProfile from "../pages/educator/educator-profile/EducatorProfile";
import ClientProfile from "../pages/client/client-profile/ClientProfile";
import AdminProfile from "../pages/admin/admin-profile/AdminProfile";
import AdminAcademyCategory from "../pages/admin/academy-category/AdminAcademyCategory";
import EducatorStreamSchedule from "../pages/educator/educator-stream-schedule/EducatorStreamSchedule";
import StudentLiveSessionCategory from "../pages/student/live-session-category/StudentLiveSessionCategory";
import StudentLiveSessionCategoryDetails from "../pages/student/live-session-category/StudentLiveSessionCategoryDetails";
import ClientCourses from "../pages/student/client-courses/ClientCourses";
import ClientSpecificCourses from "../pages/student/client-courses/ClientSpecificCourses";
import AdminStreamSchedule from "../pages/admin/admin-stream-schedule/AdminStreamSchedule";
import EducatorLiveSession from "../pages/educator/live-session/EducatorLiveSession";
import EducatorRecording from "../pages/educator/recording/EducatorRecording";
import { Create } from "@mui/icons-material";
import CreateEducatorRecording from "../pages/educator/recording/CreateEducatorRecording";
import EducatorLiveSessionView from "../pages/educator/live-session/EducatorLiveSessionView";
import AdminRecording from "../pages/admin/recording/AdminRecording";
import Recording from "../pages/admin/live-session/Recording";
import RecordingControls from "../pages/educator/live-session/RecordingControls";
import TrandingPlatform from "../pages/trading-platform/TradingPlatform";
import RecordingSession from "../pages/student/live-session-category/RecordingSession";
import RecordingEducatorList from "../pages/student/live-session-category/RecordingEducatorList";
import AdminRecordingSession from "../pages/admin/recording/AdminRecordingSession";
import EducatorRecordingSession from "../pages/educator/recording/EducatorRecordingSession";
import UserRecordingSession from "../pages/student/recording/UserRecordingSession";
import EducatorTradeAnalysis from "../pages/educator/educator-trade-analysis/EducatorTradeAnalysis";
import ViewAdminTradeAnalysis from "../pages/admin/admin-trade-analysis/ViewAdminTradeAnalysis";
import AdminTradeAnalysis from "../pages/admin/admin-trade-analysis/AdminTradeAnalysis";
import ClientDashboard from "../pages/student/client-dashboard/ClientDashboard";
import FastStartTraining from "../pages/student/fast-start-training/FastStartTraining";
import IqStrategies from "../pages/student/iq-strategies/IqStrategies";
import CommunityFeed from "../pages/student/iq-social/CommunityFeed";

import IqAcademy from "../pages/student/iq-academy/IqAcademy";
import IqEducators from "../pages/student/iq-educators/IqEducators";
import IqAcademyEducators from "../pages/student/iq-academy-educators/IqAcademyEducators";
import ForexAcademy from "../pages/student/client-dashboard/forex-academy/ForexAcademy";
import GeneralSetting from "../pages/admin/general-setting/GeneralSetting";
import PersonalIqInsight from "../pages/student/personal-iq-insight/PersonalIqInsight";
import IqVault from "../pages/student/iq-vault/IqVault";
import IqInsight from "../pages/student/iq-insight/IqInsight";
import EducatorCommunityFeed from "../pages/educator/educator-community-feed/EducatorCommunityFeed";
import AdminCommunityFeed from "../pages/admin/admin-community-feed/AdminCommunityFeed";
import KpisDashboard from "../pages/admin/KPIs Page/Kpis";
import PrivacyPolicy from "../auth/pages/PrivacyPolicy";
import TermsOfService from "../auth/pages/TermsOfService";
import Support from "../auth/pages/Support";
import EducatorEndSession from "../pages/educator/educator-end-session/EducatorEndSession";
import EducatorEndSchedule from "../pages/educator/educator-endStream-schedule/EducatorEndSchedule";
import AdminEndSession from "../pages/admin/admin-end-session/AdminEndSession";
import EducatorKpi from "../pages/admin/KPIs Page/EducatorKpi";
import AdminEndSchedule from "../pages/admin/admin-end-schedule/AdminEndSchedule";
import Package from "../pages/admin/admin-package/Package";
import AdminLogs from "../pages/admin/admin-Logs/AdminLogs";
import Admin from "../pages/superAdmin/admin/Admin";
import Task from "../pages/admin/task-management/Task";
import AdminRating from "../pages/admin/admin-educator-rating/AdminRating";
import EducatorRating from "../pages/educator/educator-rating/EducatoRating";
import AdminEducatorRatings from "../pages/admin/admin-educator-rating/AdminEducatorRatings";
import EducatorIqCrypto from "../pages/educator/educator-iq-crypto/EducatorIqCrypto";
import IqCrypto from "../pages/student/iq-crypto/IqCrypto";
import AdminIqCrypto from "../pages/admin/admin-iq-crypto/AdminIqCrypto";
import EducatorLiveTradeIdeas from "../pages/educator/educator-live-trade-ideas/EducatorTradeIdeas";
import AdminLiveTradeIdeas from "../pages/admin/admin-live-trade-ideas/AdminTradeIdeas";
import ClientLiveIdeas from "../pages/student/client-live-ideas/ClientLiveIdeas";
import TradingStrategies from "../pages/student/trading-strategies/TradingStrategies";

const routes = {
  student: [
    { path: "/", element: <DefaultPage /> },
    { path: "/live-session", element: <ClientLiveSession /> },
    { path: "/live-session/:callId", element: <ClientViewLiveSession /> },
    { path: "/ideas", element: <ClientTradeIdeas /> },
    { path: "/live-ideas", element: <ClientLiveIdeas /> },
    { path: "/video-library", element: <VideoLibrary /> },
    { path: "/profile", element: <ClientProfile /> },
    { path: "/academy", element: <StudentLiveSessionCategory /> },
    { path: "/academy/:id", element: <StudentLiveSessionCategoryDetails /> },
    { path: "/academy/course/:id", element: <ClientCourses /> },
    { path: "/academy/course/detail/:id", element: <ClientSpecificCourses /> },
    { path: "/tranding-platform", element: <TrandingPlatform /> },
    { path: "/dashboard", element: <ClientDashboard /> },
    { path: "/recording-session", element: <RecordingSession /> },
    {
      path: "/educator-recording-session/:id",
      element: <UserRecordingSession />,
    },
    { path: "/fast-start-training", element: <FastStartTraining /> },
    { path: "/iq-vault", element: <IqVault /> },
    { path: "/iq-strategies", element: <IqStrategies /> },
    { path: "/iq-academy", element: <IqAcademy /> },
    { path: "/iq-educators/:id", element: <IqEducators /> },
    { path: "/iq-academy-educators", element: <IqAcademyEducators /> },
    { path: "/forex-academy", element: <ForexAcademy /> },
    { path: "/personal-iq-insight", element: <PersonalIqInsight /> },
    { path: "/iq-insight", element: <IqInsight /> },
    { path: "/iq-crypto", element: <IqCrypto /> },
    { path: "/iq-social", element: <CommunityFeed /> },
    { path: "/trading-strategies", element: <TradingStrategies /> },
  ],
  educator: [
    { path: "/", element: <DefaultPage /> },
    { path: "/educator/ideas", element: <EducatorTradeIdeas /> },
    { path: "/educator/live-ideas", element: <EducatorLiveTradeIdeas /> },
    { path: "/educator/trade-analysis", element: <EducatorTradeAnalysis /> },
    { path: "/educator/iq-crypto", element: <EducatorIqCrypto /> },
    { path: "/educator/courses", element: <Courses /> },
    { path: "/educator/live-session", element: <EducatorLiveSession /> },
    { path: "/educator/recordings", element: <EducatorRecording /> },
    {
      path: "/educator/recordings/:callId",
      element: <CreateEducatorRecording />,
    },
    {
      path: "/educator/live-session/:callId",
      element: <EducatorLiveSessionView />,
    },
    { path: "/educator/dark-sidebar", element: <Demo1DarkSidebarPage /> },
    { path: "/educator/educator-details", element: <EducatorDetailPage /> },
    { path: "/educator/profile", element: <EducatorProfile /> },
    { path: "/educator/stream-schedule", element: <EducatorStreamSchedule /> },
    { path: "/educator/ended-live-sessions", element: <EducatorEndSession /> },
    {
      path: "/educator/ended-stream-schedule",
      element: <EducatorEndSchedule />,
    },
    { path: "/educator/stream-recording", element: <EducatorRecording /> },
    {
      path: "/educator/stream-recording/list",
      element: <EducatorRecordingSession />,
    },
    {
      path: "/educator/iq-social",
      element: <EducatorCommunityFeed />,
    },
    { path: "/educator/rating", element: <EducatorRating /> },
  ],
  admin: [
    { path: "/", element: <DefaultPage /> },
    { path: "/admin/ideas", element: <AdminTradeIdeas /> },
    { path: "/admin/live-ideas", element: <AdminLiveTradeIdeas /> },
    { path: "/admin/trade-analysis", element: <AdminTradeAnalysis /> },
    { path: "/admin/courses", element: <Courses /> },
    { path: "/admin/live-session", element: <LiveSession /> },
    { path: "/admin/live-session/:callId", element: <AdminLiveSessionView /> },
    { path: "/admin/recordings", element: <AdminRecording /> },
    { path: "/admin/educators", element: <Educators /> },
    { path: "/admin/profile", element: <AdminProfile /> },
    { path: "/admin/academy-category", element: <AdminAcademyCategory /> },
    { path: "/admin/stream-schedule", element: <AdminStreamSchedule /> },
    { path: "/admin/stream-recording", element: <AdminRecording /> },
    { path: "/admin/stream-recording/:id", element: <AdminRecordingSession /> },
    { path: "admin/general-setting", element: <GeneralSetting /> },
    { path: "/admin/iq-social", element: <AdminCommunityFeed /> },
    { path: "/admin/kpis", element: <EducatorKpi /> },
    { path: "/admin/kpis/:callId", element: <KpisDashboard /> },
    { path: "/admin/ended-live-sessions", element: <AdminEndSession /> },
    { path: "/admin/educator-ended-schedule", element: <AdminEndSchedule /> },
    { path: "/admin/package", element: <Package /> },
    { path: "/admin/ticket", element: <Task /> },
    // { path: "/admin/logs", element: <AdminLogs /> },
    { path: "/admin/educator-rating", element: <AdminRating /> },
    {
      path: "/admin/educator-rating/:educatorId",
      element: <AdminEducatorRatings />,
    },
    { path: "/admin/iq-crypto", element: <AdminIqCrypto /> },
  ],
  super_admin: [
    { path: "/", element: <DefaultPage /> },
    { path: "/admin/ideas", element: <AdminTradeIdeas /> },
    { path: "/admin/trade-analysis", element: <AdminTradeAnalysis /> },
    { path: "/admin/courses", element: <Courses /> },
    { path: "/admin/live-session", element: <LiveSession /> },
    { path: "/admin/live-session/:callId", element: <AdminLiveSessionView /> },
    { path: "/admin/recordings", element: <AdminRecording /> },
    { path: "/admin/educators", element: <Educators /> },
    { path: "/admin/profile", element: <AdminProfile /> },
    { path: "/admin/academy-category", element: <AdminAcademyCategory /> },
    { path: "/admin/stream-schedule", element: <AdminStreamSchedule /> },
    { path: "/admin/stream-recording", element: <AdminRecording /> },
    { path: "/admin/stream-recording/:id", element: <AdminRecordingSession /> },
    { path: "admin/general-setting", element: <GeneralSetting /> },
    { path: "/admin/iq-social", element: <AdminCommunityFeed /> },
    { path: "/admin/kpis", element: <EducatorKpi /> },
    { path: "/admin/kpis/:callId", element: <KpisDashboard /> },
    { path: "/admin/ended-live-sessions", element: <AdminEndSession /> },
    { path: "/admin/educator-ended-schedule", element: <AdminEndSchedule /> },
    { path: "/admin/package", element: <Package /> },
    { path: "/admin/logs", element: <AdminLogs /> },
    { path: "/member", element: <Admin /> },
    { path: "/admin/ticket", element: <Task /> },
    { path: "/admin/educator-rating", element: <AdminRating /> },
    {
      path: "/admin/educator-rating/:educatorId",
      element: <AdminEducatorRatings />,
    },
    { path: "/admin/iq-crypto", element: <AdminIqCrypto /> },
  ],
  marketer: [
    { path: "/", element: <DefaultPage /> },
    { path: "/admin/ideas", element: <AdminTradeIdeas /> },
    { path: "/admin/trade-analysis", element: <AdminTradeAnalysis /> },
    { path: "/admin/courses", element: <Courses /> },
    { path: "/admin/live-session", element: <LiveSession /> },
    { path: "/admin/live-session/:callId", element: <AdminLiveSessionView /> },
    { path: "/admin/recordings", element: <AdminRecording /> },
    { path: "/admin/educators", element: <Educators /> },
    { path: "/admin/profile", element: <AdminProfile /> },
    { path: "/admin/academy-category", element: <AdminAcademyCategory /> },
    { path: "/admin/stream-schedule", element: <AdminStreamSchedule /> },
    { path: "/admin/stream-recording", element: <AdminRecording /> },
    { path: "/admin/stream-recording/:id", element: <AdminRecordingSession /> },
    { path: "admin/general-setting", element: <GeneralSetting /> },
    { path: "/admin/iq-social", element: <AdminCommunityFeed /> },
    { path: "/admin/kpis", element: <EducatorKpi /> },
    { path: "/admin/kpis/:callId", element: <KpisDashboard /> },
    { path: "/admin/ended-live-sessions", element: <AdminEndSession /> },
    { path: "/admin/educator-ended-schedule", element: <AdminEndSchedule /> },
    { path: "/admin/package", element: <Package /> },
    { path: "/admin/logs", element: <AdminLogs /> },
  ],
};

const getStudentRoutesByPlan = (plan) => {
  const allowedPaths = plan?.allowedSideBar || [];
  return routes.student.filter((route) => allowedPaths.includes(route.path));
};

const AppRoutingSetup = () => {
  const { auth } = useAuthContext();
  const userRole = auth?.user?.role ?? "student";
  const plan = auth?.user?.plan;

  const roleRoutes =
    userRole === "student"
      ? getStudentRoutesByPlan(plan)
      : routes[userRole] || [];

  console.log("roleRoutes", roleRoutes);
  console.log("auth", auth);

  // const roleRoutes = routes[userRole] || [];

  return (
    <Routes>
      <Route element={<RequireAuth />}></Route>

      {userRole === "student" && (
        <Route index element={<Navigate to="/dashboard" replace />} />
      )}

      {roleRoutes.map((route, index) => (
        <Route key={index} element={<Demo1Layout />}>
          <Route path={route.path} element={route.element} />
        </Route>
      ))}

      {/* {roleRoutes.map((route, index) => (
        <Route key={index} element={<RequireAuth />}>
          <Route element={<Demo1Layout />}>
            <Route path={route.path} element={route.element} />
          </Route>
        </Route>
      ))} */}

      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      {/* <Route path="*" element={<Navigate to="/error/404" />} /> */}

      <Route
        path="*"
        element={<Navigate to={auth?.token ? "/error/404" : "/auth/login"} />}
      />
    </Routes>
  );
};
export { AppRoutingSetup };
