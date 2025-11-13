import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- Import
import { ConfirmProvider } from './context/ConfirmContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- Wrap here */}
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </AuthProvider> {/* <-- And here */}
    </BrowserRouter>
  </React.StrictMode>
);
