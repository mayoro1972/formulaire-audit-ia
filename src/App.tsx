import { useState } from 'react';
import { FormProvider } from './context/FormContext';
import { useForm } from './context/formContextCore';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Section0_Accueil from './sections/Section0_Accueil';
import Section1_Charge from './sections/Section1_Charge';
import Section2_Taches from './sections/Section2_Taches';
import Section3_Ajustements from './sections/Section3_Ajustements';
import Section4_Profil from './sections/Section4_Profil';
import Section5_TachesLibres from './sections/Section5_TachesLibres';
import Section6_Journal from './sections/Section6_Journal';
import Section7_Douleurs from './sections/Section7_Douleurs';
import Section8_Vision from './sections/Section8_Vision';
import Section9_Contraintes from './sections/Section9_Contraintes';
import Section10_Envoi from './sections/Section10_Envoi';
import AdminDashboard from './pages/AdminDashboard';
import SendInvitations from './pages/SendInvitations';

interface AppContentProps {
  invitationToken?: string | null;
}

function AppContent({ invitationToken }: AppContentProps) {
  const { currentSection } = useForm();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  if (showInvitations) {
    return <SendInvitations onBack={() => setShowInvitations(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="flex min-h-[calc(100vh-59px)]">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl">
          {currentSection === 0 && <Section0_Accueil />}
          {currentSection === 1 && <Section1_Charge />}
          {currentSection === 2 && <Section2_Taches />}
          {currentSection === 3 && <Section3_Ajustements />}
          {currentSection === 4 && <Section4_Profil />}
          {currentSection === 5 && <Section5_TachesLibres />}
          {currentSection === 6 && <Section6_Journal />}
          {currentSection === 7 && <Section7_Douleurs />}
          {currentSection === 8 && <Section8_Vision />}
          {currentSection === 9 && <Section9_Contraintes />}
          {currentSection === 10 && <Section10_Envoi />}
        </main>
      </div>
      {!invitationToken && (
        <>
          <button
            onClick={() => setShowAdmin(true)}
            className="fixed bottom-4 left-4 px-4 py-2 bg-[#042C53] text-white rounded-lg shadow-lg hover:bg-[#185FA5] transition-all text-sm"
          >
            Mode Admin
          </button>
          <button
            onClick={() => setShowInvitations(true)}
            className="fixed bottom-16 left-4 px-4 py-2 bg-[#0F6E56] text-white rounded-lg shadow-lg hover:bg-[#3B6D11] transition-all text-sm"
          >
            Envoyer invitations
          </button>
        </>
      )}
    </div>
  );
}

interface AppProps {
  invitationToken?: string | null;
}

export default function App({ invitationToken }: AppProps = {}) {
  return (
    <FormProvider>
      <AppContent invitationToken={invitationToken} />
    </FormProvider>
  );
}
