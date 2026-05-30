import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';
import AuditFormPreviewPage from './pages/AuditFormPreviewPage.tsx';
import InvitationForm from './pages/InvitationForm.tsx';
import ProspectSimpleAuditFormPreviewPage from './pages/ProspectSimpleAuditFormPreviewPage.tsx';
import './index.css';

const urlParams = new URLSearchParams(window.location.search);
const preview = urlParams.get('preview');
const form = urlParams.get('form');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      {preview === 'audit-form' ? (
        <AuditFormPreviewPage />
      ) : preview === 'prospect-simple-audit' || form === 'prospect-simple-audit' ? (
        <ProspectSimpleAuditFormPreviewPage />
      ) : (
        <InvitationForm />
      )}
    </AdminAuthProvider>
  </StrictMode>
);
