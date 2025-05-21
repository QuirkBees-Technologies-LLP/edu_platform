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
import { EducatorDetailPage } from '../pages/educatorDetail';
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

const routes = {
  student: [
    { path: "/", element: <DefaultPage /> },
    { path: "/live-session", element: <ClientLiveSession /> },
    { path: "/live-session/:callId", element: <ClientViewLiveSession /> },
    { path: "/ideas", element: <ClientTradeIdeas /> },
    { path: "/video-library", element: <VideoLibrary /> },
    { path: "/profile", element: <ClientProfile /> },
    { path: "/academy", element: <StudentLiveSessionCategory /> },
    { path: "/academy/:id", element: <StudentLiveSessionCategoryDetails /> },
    { path: "/academy/course/:id", element: <ClientCourses /> },
    { path: "/academy/course/detail/:id", element: <ClientSpecificCourses /> },
  ],
  educator: [
    { path: "/", element: <DefaultPage /> },
    { path: "/educator/ideas", element: <EducatorTradeIdeas /> },
    { path: "/educator/courses", element: <Courses /> },
    { path: "/educator/live-session", element: <EducatorLiveSession /> },
    { path: "/educator/recordings", element: <EducatorRecording /> },
    { path: "/educator/recordings/:callId", element: <CreateEducatorRecording /> },
    { path: "/educator/live-session/:callId", element: <EducatorLiveSessionView /> },
    { path: "/educator/dark-sidebar", element: <Demo1DarkSidebarPage /> },
    { path: "/educator/educator-details", element: <EducatorDetailPage /> },
    { path: "/educator/profile", element: <EducatorProfile /> },
    { path: "/educator/stream-schedule", element: <EducatorStreamSchedule /> },
    { path: "/educator/stream-recording", element: <EducatorRecording /> },
  ],
  admin: [
    { path: "/", element: <DefaultPage /> },
    { path: "/admin/ideas", element: <AdminTradeIdeas /> },
    { path: "/admin/courses", element: <Courses /> },
    { path: "/admin/live-session", element: <LiveSession /> },
    { path: "/admin/live-session/:callId", element: <AdminLiveSessionView /> },
    { path: "/admin/recordings", element: <AdminRecording /> },
    { path: "/admin/educators", element: <Educators /> },
    { path: "/admin/profile", element: <AdminProfile /> },
    { path: "/admin/academy-category", element: <AdminAcademyCategory /> },
    { path: "/admin/stream-schedule", element: <AdminStreamSchedule /> },
    { path: "admin/stream-recording", element: <AdminRecording /> },
  ],
};

const AppRoutingSetup = () => {
  const { auth } = useAuthContext();
  const userRole = auth?.user?.role ?? 'student';

  const roleRoutes = routes[userRole] || [];

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        {/* {!isAdmin ? (
          <Route element={<Demo1Layout />}>
            <Route path="/" element={<DefaultPage />} />
            <Route path="/live-session" element={<ClientLiveSession />} />
            <Route
              path="/live-session/:callId"
              element={<ClientViewLiveSession />}
            />
            <Route path="/ideas" element={<ClientTradeIdeas />} />
            <Route path="/video-library" element={<VideoLibrary />} />
            <Route path="/courses" element={<Courses />} />
          </Route>
        ) : (
          <Route element={<Demo1Layout />}>
            <Route path="/" element={<DefaultPage />} />
            <Route path="/ideas" element={<AdminTradeIdeas />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/live-session" element={<LiveSession />} />
            <Route
              path="/live-session/:callId"
              element={<AdminLiveSessionView />}
            />
            <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />
            <Route
              path="/public-profile/profiles/default"
              element={<ProfileDefaultPage />}
            />
            <Route
              path="/public-profile/profiles/creator"
              element={<ProfileCreatorPage />}
            />
            <Route
              path="/public-profile/profiles/company"
              element={<ProfileCompanyPage />}
            />
            <Route
              path="/public-profile/profiles/nft"
              element={<ProfileNFTPage />}
            />
            <Route
              path="/public-profile/profiles/blogger"
              element={<ProfileBloggerPage />}
            />
            <Route
              path="/public-profile/profiles/crm"
              element={<ProfileCRMPage />}
            />
            <Route
              path="/public-profile/profiles/gamer"
              element={<ProfileGamerPage />}
            />
            <Route
              path="/public-profile/profiles/feeds"
              element={<ProfileFeedsPage />}
            />
            <Route
              path="/public-profile/profiles/plain"
              element={<ProfilePlainPage />}
            />
            <Route
              path="/public-profile/profiles/modal"
              element={<ProfileModalPage />}
            />
            <Route
              path="/public-profile/projects/3-columns"
              element={<ProjectColumn3Page />}
            />
            <Route
              path="/public-profile/projects/2-columns"
              element={<ProjectColumn2Page />}
            />
            <Route
              path="/public-profile/works"
              element={<ProfileWorksPage />}
            />
            <Route
              path="/public-profile/teams"
              element={<ProfileTeamsPage />}
            />
            <Route
              path="/public-profile/network"
              element={<ProfileNetworkPage />}
            />
            <Route
              path="/public-profile/activity"
              element={<ProfileActivityPage />}
            />
            <Route
              path="/public-profile/campaigns/card"
              element={<CampaignsCardPage />}
            />
            <Route
              path="/public-profile/campaigns/list"
              element={<CampaignsListPage />}
            />
            <Route
              path="/public-profile/empty"
              element={<ProfileEmptyPage />}
            />
            <Route
              path="/account/home/get-started"
              element={<AccountGetStartedPage />}
            />
            <Route
              path="/account/home/user-profile"
              element={<AccountUserProfilePage />}
            />
            <Route
              path="/account/home/company-profile"
              element={<AccountCompanyProfilePage />}
            />
            <Route
              path="/account/home/settings-sidebar"
              element={<AccountSettingsSidebarPage />}
            />
            <Route
              path="/account/home/settings-enterprise"
              element={<AccountSettingsEnterprisePage />}
            />
            <Route
              path="/account/home/settings-plain"
              element={<AccountSettingsPlainPage />}
            />
            <Route
              path="/account/home/settings-modal"
              element={<AccountSettingsModalPage />}
            />
            <Route
              path="/account/billing/basic"
              element={<AccountBasicPage />}
            />
            <Route
              path="/account/billing/enterprise"
              element={<AccountEnterprisePage />}
            />
            <Route
              path="/account/billing/plans"
              element={<AccountPlansPage />}
            />
            <Route
              path="/account/billing/history"
              element={<AccountHistoryPage />}
            />
            <Route
              path="/account/security/get-started"
              element={<AccountSecurityGetStartedPage />}
            />
            <Route
              path="/account/security/overview"
              element={<AccountOverviewPage />}
            />
            <Route
              path="/account/security/allowed-ip-addresses"
              element={<AccountAllowedIPAddressesPage />}
            />
            <Route
              path="/account/security/privacy-settings"
              element={<AccountPrivacySettingsPage />}
            />
            <Route
              path="/account/security/device-management"
              element={<AccountDeviceManagementPage />}
            />
            <Route
              path="/account/security/backup-and-recovery"
              element={<AccountBackupAndRecoveryPage />}
            />
            <Route
              path="/account/security/current-sessions"
              element={<AccountCurrentSessionsPage />}
            />
            <Route
              path="/account/security/security-log"
              element={<AccountSecurityLogPage />}
            />
            <Route
              path="/account/members/team-starter"
              element={<AccountTeamsStarterPage />}
            />
            <Route
              path="/account/members/teams"
              element={<AccountTeamsPage />}
            />
            <Route
              path="/account/members/team-info"
              element={<AccountTeamInfoPage />}
            />
            <Route
              path="/account/members/members-starter"
              element={<AccountMembersStarterPage />}
            />
            <Route
              path="/account/members/team-members"
              element={<AccountTeamMembersPage />}
            />
            <Route
              path="/account/members/import-members"
              element={<AccountImportMembersPage />}
            />
            <Route
              path="/account/members/roles"
              element={<AccountRolesPage />}
            />
            <Route
              path="/account/members/permissions-toggle"
              element={<AccountPermissionsTogglePage />}
            />
            <Route
              path="/account/members/permissions-check"
              element={<AccountPermissionsCheckPage />}
            />
            <Route
              path="/account/integrations"
              element={<AccountIntegrationsPage />}
            />
            <Route
              path="/account/notifications"
              element={<AccountNotificationsPage />}
            />
            <Route path="/account/api-keys" element={<AccountApiKeysPage />} />
            <Route
              path="/account/appearance"
              element={<AccountAppearancePage />}
            />
            <Route
              path="/account/invite-a-friend"
              element={<AccountInviteAFriendPage />}
            />
            <Route path="/account/activity" element={<AccountActivityPage />} />
            <Route
              path="/network/get-started"
              element={<NetworkGetStartedPage />}
            />
            <Route
              path="/network/user-cards/mini-cards"
              element={<NetworkMiniCardsPage />}
            />
            <Route
              path="/network/user-cards/team-crew"
              element={<NetworkUserCardsTeamCrewPage />}
            />
            <Route
              path="/network/user-cards/author"
              element={<NetworkAuthorPage />}
            />
            <Route
              path="/network/user-cards/nft"
              element={<NetworkNFTPage />}
            />
            <Route
              path="/network/user-cards/social"
              element={<NetworkSocialPage />}
            />
            <Route
              path="/network/user-table/team-crew"
              element={<NetworkUserTableTeamCrewPage />}
            />
            <Route
              path="/network/user-table/app-roster"
              element={<NetworkAppRosterPage />}
            />
            <Route
              path="/network/user-table/market-authors"
              element={<NetworkMarketAuthorsPage />}
            />
            <Route
              path="/network/user-table/saas-users"
              element={<NetworkSaasUsersPage />}
            />
            <Route
              path="/network/user-table/store-clients"
              element={<NetworkStoreClientsPage />}
            />
            <Route
              path="/network/user-table/visitors"
              element={<NetworkVisitorsPage />}
            />
            <Route
              path="/auth/welcome-message"
              element={<AuthenticationWelcomeMessagePage />}
            />
            <Route
              path="/auth/account-deactivated"
              element={<AuthenticationAccountDeactivatedPage />}
            />
            <Route
              path="/authentication/get-started"
              element={<AuthenticationGetStartedPage />}
            />
          </Route>
        )} */}
      </Route>

      {roleRoutes.map((route, index) => (
        <Route key={index} element={<RequireAuth />}>
          <Route element={<Demo1Layout />}>
            <Route path={route.path} element={route.element} />
          </Route>
        </Route>
      ))}

      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      {/* <Route path="*" element={<Navigate to="/error/404" />} /> */}
      <Route path="*" element={<Navigate to={auth?.token ? "/error/404" : "/auth/login"} />} />
    </Routes>
  );
};
export { AppRoutingSetup };


