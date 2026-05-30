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
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const defaultEntry = import.meta.env.VITE_DEFAULT_ENTRY?.trim();
const shouldOpenProspectSimpleAuditByDefault = defaultEntry === 'prospect-simple-audit';
const isProspectSimpleAuditPath = pathname === '/prospect-simple-audit';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      {preview === 'audit-form' ? (
        <AuditFormPreviewPage />
      ) : preview === 'prospect-simple-audit' ||
        form === 'prospect-simple-audit' ||
        shouldOpenProspectSimpleAuditByDefault ||
        isProspectSimpleAuditPath ? (
        <ProspectSimpleAuditFormPreviewPage />
      ) : (
        <InvitationForm />
      )}
    </AdminAuthProvider>
  </StrictMode>
);
