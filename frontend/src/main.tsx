import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/forms.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/auth.css';
import './styles/topup.css';
import './styles/account.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
