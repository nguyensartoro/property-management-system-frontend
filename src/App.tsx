import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import AnimationProvider from './providers/AnimationProvider';
import AuthProvider from './providers/AuthProvider';
import { ApolloProvider } from './providers/apollo';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/toast';
import { LanguageProvider } from './utils/languageContext';

const App: React.FC = () => {
  React.useEffect(() => {
    // Restore authentication state from backend session (httpOnly cookie)
    useAuthStore.getState().checkAuthStatus();
  }, []);

  return (
    <LanguageProvider>
      <AnimationProvider>
        <ToastProvider>
          <BrowserRouter>
            <ApolloProvider>
              <AuthProvider>
                <Router />
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                    duration: 5000,
                    padding: '0',
                    style: {
                      borderRadius: '8px',
                      maxWidth: '420px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }
                  }}
                />
              </AuthProvider>
            </ApolloProvider>
          </BrowserRouter>
        </ToastProvider>
      </AnimationProvider>
    </LanguageProvider>
  );
};

export default App;