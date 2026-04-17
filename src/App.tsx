import { Settings2, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import AdminAccessGate from './components/AdminAccessGate';
import { FormProvider } from './context/FormContext';
import AdminDashboard from './pages/AdminDashboard';
import ProspectRequestPage from './pages/ProspectRequestPage';
import SendInvitations from './pages/SendInvitations';

interface AppContentProps {
  invitationToken?: string | null;
}

interface AuditInviteePrefill {
  name: string;
  email: string;
}

function AppContent({ invitationToken }: AppContentProps) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [auditInviteePrefill, setAuditInviteePrefill] = useState<AuditInviteePrefill | null>(null);

  const openInvitations = (prefill?: AuditInviteePrefill | null) => {
    setAuditInviteePrefill(prefill || null);
    setShowInvitations(true);
  };

  if (showAdmin) {
    return (
      <AdminAccessGate
        title="Accès au tableau de bord prospects"
        description="Connexion requise pour suivre les prospects, planifier les relances et préparer les envois d’audit."
        onBack={() => setShowAdmin(false)}
      >
        <AdminDashboard
          onBack={() => setShowAdmin(false)}
          onPrepareAudit={(prospect) => {
            setShowAdmin(false);
            openInvitations(prospect);
          }}
        />
      </AdminAccessGate>
    );
  }

  if (showInvitations) {
    return (
      <AdminAccessGate
        title="Préparer l’envoi du formulaire d’audit"
        description="Connexion admin requise pour transmettre le lien d’audit au bon prospect."
        onBack={() => setShowInvitations(false)}
      >
        <SendInvitations
          onBack={() => setShowInvitations(false)}
          prefillInvitee={auditInviteePrefill}
        />
      </AdminAccessGate>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[7rem] h-80 w-80 rounded-full bg-cyan-200/18 blur-3xl" />
        <div className="absolute right-[-5rem] top-[12rem] h-96 w-96 rounded-full bg-amber-200/24 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[22%] h-72 w-72 rounded-full bg-blue-200/14 blur-3xl" />
      </div>

      <ProspectRequestPage />

      {!invitationToken && (
        <div className="fixed bottom-3 left-3 right-3 z-40 flex flex-col gap-3 sm:left-auto sm:right-4 sm:w-auto">
          <button
            onClick={() => openInvitations(null)}
            className="audit-button audit-button-primary w-full border-0 shadow-[0_20px_34px_rgba(15,118,110,0.28)] sm:w-auto"
          >
            <SendHorizontal className="h-4 w-4" />
            Préparer un envoi d’audit
          </button>
          <button
            onClick={() => setShowAdmin(true)}
            className="audit-button audit-button-secondary w-full shadow-[0_16px_28px_rgba(15,37,66,0.08)] sm:w-auto"
          >
            <Settings2 className="h-4 w-4" />
            Ouvrir le suivi prospects
          </button>
        </div>
      )}
    </div>
  );
}

interface AppProps {
  invitationToken?: string | null;
  withProvider?: boolean;
}

export default function App({ invitationToken, withProvider = true }: AppProps = {}) {
  if (!withProvider) {
    return <AppContent invitationToken={invitationToken} />;
  }

  return (
    <FormProvider>
      <AppContent invitationToken={invitationToken} />
    </FormProvider>
  );
}
