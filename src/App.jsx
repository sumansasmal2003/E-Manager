import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import TeamsPage from './pages/TeamsPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import TeamDetailPage from './pages/TeamDetailPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';

// --- IMPORT NAVBAR HERE ---
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-light-white text-dark">

      {/* --- RENDER NAVBAR HERE --- */}
      <Navbar />
      {/* It will now be on every page */}

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/team/:teamId" element={<TeamDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Route>
          </Route>

        </Routes>
      </main>
    </div>
  );
}

export default App;
