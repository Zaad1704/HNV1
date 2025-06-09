import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";

<Route path="/org/dashboard" element={<ProtectedRoute><OrganizationDashboardPage /></ProtectedRoute>} />
<Route path="/invite/:token" element={<AcceptInvitePage />} />