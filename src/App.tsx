import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import AnimationProvider from './providers/AnimationProvider';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AnimationProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AnimationProvider>
  );
}