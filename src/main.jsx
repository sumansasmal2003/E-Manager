import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ThemeProvider } from './context/ThemeContext'; // <-- Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider> {/* <-- Wrap AuthProvider inside ThemeProvider (or vice versa, order matters less here but keep logical) */}
          <ModalProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ModalProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);