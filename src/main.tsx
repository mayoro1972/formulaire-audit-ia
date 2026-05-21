import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';
import AuditFormPreviewPage from './pages/AuditFormPreviewPage.tsx';
import InvitationForm from './pages/InvitationForm.tsx';
import './index.css';

const urlParams = new URLSearchParams(window.location.search);
const preview = urlParams.get('preview');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      {preview === 'audit-form' ? <AuditFormPreviewPage /> : <InvitationForm />}
    </AdminAuthProvider>
  </StrictMode>
);
