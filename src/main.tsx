import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import InvitationForm from './pages/InvitationForm.tsx';
import './index.css';

const urlParams = new URLSearchParams(window.location.search);
const inviteToken = urlParams.get('invite');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {inviteToken ? <InvitationForm /> : <App />}
  </StrictMode>
);
