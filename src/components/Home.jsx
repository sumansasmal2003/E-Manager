import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    // Show a full-page loader while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // If logged in, redirect to the main app page (/today).
  // If not, show the new LandingPage.
  return isLoggedIn ? <Navigate to="/today" replace /> : <LandingPage />;
};

export default Home;
