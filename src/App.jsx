import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import TeamsPage from './pages/TeamsPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout'; // <-- Import Layout

// Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage'; // <-- Import NotesPage
import TeamDetailPage from './pages/TeamDetailPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <div className="min-h-screen bg-light-white text-dark">
      {/* We don't need the conditional Navbar here anymore,
        as the DashboardLayout will handle it.
      */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}> {/* <-- 1. Wrap with layout */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notes" element={<NotesPage />} /> {/* <-- 2. Add route */}
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
