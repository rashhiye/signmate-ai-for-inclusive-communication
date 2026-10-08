import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SocialProvider } from './hooks/useSocial';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Core Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoomPage } from './pages/RoomPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SecurityPage } from './pages/common/SecurityPage';

// User Portal Pages (Matching Report Modules & Screenshots)
import { UserFriendsPage } from './pages/user/UserFriendsPage';
import { UserDirectoryPage } from './pages/user/UserDirectoryPage';
import { UserRequestsPage } from './pages/user/UserRequestsPage';
import { UserComplaintsPage } from './pages/user/UserComplaintsPage';
import { UserFeedbackPage } from './pages/user/UserFeedbackPage';
import { UserProfilePage } from './pages/user/UserProfilePage';
import { UserOfflineDetectionPage } from './pages/user/UserOfflineDetectionPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isRoomView = location.pathname.startsWith('/room/');
  const isPortalView =
    location.pathname.startsWith('/user/') ||
    location.pathname === '/dashboard' ||
    isRoomView;

  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-surface-100">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-brand-500 text-white rounded-lg shadow-lg outline-none"
      >
        Skip to main content
      </a>

      {/* Conditionally render header only when NOT in active video call room */}
      {!isRoomView && <Navbar />}

      <main id="main-content" className="flex-1 flex flex-col">
        <Routes>
          {/* Public & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/User/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/User/register" element={<RegisterPage />} />
          <Route path="/forgotemail" element={<SecurityPage />} />
          <Route path="/forgot-password" element={<SecurityPage />} />
          <Route path="/forgotpassword" element={<SecurityPage />} />

          {/* User Home Dashboard (Screenshot Page 66) */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* User Portal Modules */}
          <Route path="/user/offline-detection" element={<UserOfflineDetectionPage />} />
          <Route path="/user/learning" element={<Navigate to="/dashboard" replace />} />
          <Route path="/user/change-password" element={<SecurityPage />} />
          <Route path="/user/find-users" element={<UserDirectoryPage />} />
          <Route path="/user/requests" element={<UserRequestsPage />} />
          <Route path="/user/complaints" element={<UserComplaintsPage />} />
          <Route path="/user/feedback" element={<UserFeedbackPage />} />
          <Route path="/user/friends" element={<UserFriendsPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />

          {/* Legacy /admin redirects */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

          {/* Real-time Video Call Room (Screenshot Page 65) */}
          <Route path="/room" element={<Navigate to={`/room/SM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`} replace />} />
          <Route path="/room/:roomId" element={<RoomPage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Show footer only on public pages, not on immersive portals/rooms */}
      {!isPortalView && <Footer />}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SocialProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </SocialProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
