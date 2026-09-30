import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BusinessProfileProvider } from './context/BusinessProfileContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BusinessProfileProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BusinessProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
