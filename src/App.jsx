import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import TeamsPage from './pages/TeamsPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import SetupOrganizationPage from './pages/SetupOrganizationPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import TeamDetailPage from './pages/TeamDetailPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import TodayPage from './pages/TodayPage';
import AttendancePage from './pages/AttendancePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage';
import SystemLogPage from './pages/SystemLogPage';
import ManagersPage from './pages/ManagersPage'; // <-- Import
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import Pricing from './pages/Pricing';
import SecurityPage from './pages/SecurityPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import CookiePolicyPage from './pages/CookiePolicyPage';

import Navbar from './components/Navbar';
import Home from './components/Home';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SupportPage from './pages/SupportPage';
import NotificationPage from './pages/NotificationPage';
import AiUsagePage from './pages/AiUsagePage';

function App() {
  return (
    <div className="min-h-screen bg-light-white text-dark">

      {/* Navbar is global and will show the correct links */}
      <Navbar />

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/setup-organization" element={<SetupOrganizationPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/today" element={<TodayPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/managers" element={<ManagersPage />} /> {/* <-- Add Route */}
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/team/:teamId" element={<TeamDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/details" element={<MemberDetailPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/games" element={<GamePage />} />
              <Route path="/ai-usage" element={<AiUsagePage />} />
              <Route path="/system-logs" element={<SystemLogPage />} />
              <Route path="/billing" element={<PricingPage />} />
            </Route>
          </Route>

        </Routes>
      </main>
    </div>
  );
}

export default App;
