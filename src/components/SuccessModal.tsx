import { X, CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    c_nom?: string;
    c_email?: string;
    c_poste?: string;
    c_entite?: string;
    email_dest?: string;
    libreRowCount?: number;
  };
  completionPercentage: number;
  emailSent: boolean;
  onResetForm?: () => void;
}

export default function SuccessModal({ isOpen, onClose, formData, completionPercentage, emailSent, onResetForm }: SuccessModalProps) {
  if (!isOpen) return null;

  const handleStartNewForm = () => {
    if (onResetForm) {
      onResetForm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0F6E56] text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Formulaire soumis avec succès !</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[#EAF3DE] border-2 border-[#0F6E56] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#0F6E56] rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#042C53]">Vos réponses ont été enregistrées</h3>
                <p className="text-sm text-[#2C2C2A]">Taux de complétion : <strong>{completionPercentage}%</strong></p>
              </div>
            </div>
            {emailSent && (
              <div className="bg-white rounded-lg p-3 mt-3 border border-[#0F6E56]">
                <p className="text-sm text-[#2C2C2A]">
                  📧 Un email a été envoyé à <strong>{formData.email_dest}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="border border-[#D3D1C7] rounded-lg p-5 space-y-4">
            <h3 className="text-lg font-semibold text-[#042C53] pb-2 border-b border-[#D3D1C7]">
              Récapitulatif de votre soumission
            </h3>

            <div className="grid gap-3">
              <div className="bg-[#F5F5F0] rounded-lg p-3">
                <p className="text-xs font-medium text-[#185FA5] uppercase mb-1">Nom complet</p>
                <p className="text-sm font-semibold text-[#042C53]">{formData.c_nom || '—'}</p>
              </div>

              <div className="bg-[#F5F5F0] rounded-lg p-3">
                <p className="text-xs font-medium text-[#185FA5] uppercase mb-1">Email</p>
                <p className="text-sm font-semibold text-[#042C53]">{formData.c_email || '—'}</p>
              </div>

              <div className="bg-[#F5F5F0] rounded-lg p-3">
                <p className="text-xs font-medium text-[#185FA5] uppercase mb-1">Poste</p>
                <p className="text-sm font-semibold text-[#042C53]">{formData.c_poste || '—'}</p>
              </div>

              <div className="bg-[#F5F5F0] rounded-lg p-3">
                <p className="text-xs font-medium text-[#185FA5] uppercase mb-1">Entité</p>
                <p className="text-sm font-semibold text-[#042C53]">{formData.c_entite || '—'}</p>
              </div>

              <div className="bg-[#F5F5F0] rounded-lg p-3">
                <p className="text-xs font-medium text-[#185FA5] uppercase mb-1">Tâches libres ajoutées</p>
                <p className="text-sm font-semibold text-[#042C53]">{formData.libreRowCount || 0} tâches</p>
              </div>
            </div>
          </div>

          <div className="bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-5">
            <h4 className="font-semibold text-[#042C53] mb-2">Que se passe-t-il maintenant ?</h4>
            <ul className="space-y-2 text-sm text-[#2C2C2A]">
              <li className="flex gap-2">
                <span className="text-[#185FA5] font-bold">1.</span>
                <span>Vos données ont été sauvegardées de manière sécurisée dans la base de données</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#185FA5] font-bold">2.</span>
                <span>Les administrateurs peuvent maintenant consulter votre audit IA via le tableau de bord</span>
              </li>
              {emailSent && (
                <li className="flex gap-2">
                  <span className="text-[#185FA5] font-bold">3.</span>
                  <span>Un email récapitulatif a été envoyé à l'adresse indiquée</span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="text-[#185FA5] font-bold">{emailSent ? '4' : '3'}.</span>
                <span>Vous pouvez continuer à modifier vos réponses et les soumettre à nouveau si nécessaire</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Fermer
            </button>
            <button
              onClick={handleStartNewForm}
              className="flex-1 bg-[#185FA5] text-white py-3 rounded-lg font-semibold hover:bg-[#042C53] transition-all"
            >
              Nouveau formulaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
