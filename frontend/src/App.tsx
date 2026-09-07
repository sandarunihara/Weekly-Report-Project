import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import TeamDashboardPage from './pages/dashboard/TeamDashboardPage';
import ManagerReviewPage from './pages/dashboard/ManagerReviewPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import CreateReportPage from './pages/reports/CreateReportPage';
import EditReportPage from './pages/reports/EditReportPage';
import ReportHistoryPage from './pages/reports/ReportHistoryPage';
import ReportDetailPage from './pages/reports/ReportDetailPage';
import ProjectManagementPage from './pages/projects/ProjectManagementPage';
import UserManagementPage from './pages/users/UserManagementPage';
import MemberProfilePage from './pages/users/MemberProfilePage';
import AiAssistantPage from './pages/ai/AiAssistantPage';
import AccountSettingsPage from './pages/settings/AccountSettingsPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<TeamDashboardPage />} />
        <Route path="/reports/new" element={<CreateReportPage />} />
        <Route path="/reports/history" element={<ReportHistoryPage />} />
        <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        <Route path="/reports/:reportId/edit" element={<EditReportPage />} />
        <Route path="/projects" element={<ProjectManagementPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />

        <Route path="/team/review" element={
          <ProtectedRoute managerOnly><ManagerReviewPage /></ProtectedRoute>
        } />
        <Route path="/team/analytics" element={
          <ProtectedRoute managerOnly><AnalyticsPage /></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute managerOnly><UserManagementPage /></ProtectedRoute>
        } />
        <Route path="/users/:userId" element={
          <ProtectedRoute managerOnly><MemberProfilePage /></ProtectedRoute>
        } />
        <Route path="/ai-assistant" element={
          <ProtectedRoute managerOnly><AiAssistantPage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
