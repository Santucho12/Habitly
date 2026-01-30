import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { FechaProvider } from './context/FechaContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FechaProvider>
        <App />

        
      </FechaProvider>
    </BrowserRouter>
  </StrictMode>
);
