import { useForm } from '../context/formContextCore';

export default function Section9_Contraintes() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">I — Contraintes et prérequis techniques</h2>
        <p className="text-sm text-[#185FA5] mt-1">Ce que l'IA devra respecter impérativement</p>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">I.1 — Contraintes de confidentialité</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Données qui ne peuvent jamais être transmises à un système IA externe :</label>
            <textarea
              value={formData.i_conf}
              onChange={(e) => updateField('i_conf', e.target.value)}
              placeholder="ex: Données clients, dossiers KYC, décisions de soupçon..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Réglementations à respecter (RGPD, directives groupe BCEAO...) :</label>
            <textarea
              value={formData.i_rgpd}
              onChange={(e) => updateField('i_rgpd', e.target.value)}
              placeholder="ex: Politique groupe Attijariwafa sur les données, directives BCEAO..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">I.2 — Contraintes techniques</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Hébergement — cloud autorisé ou serveur interne uniquement ?</label>
            <input
              type="text"
              value={formData.i_heberg}
              onChange={(e) => updateField('i_heberg', e.target.value)}
              placeholder="ex: Serveur interne uniquement, ou cloud certifié ISO 27001..."
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Approbations nécessaires pour déployer un outil IA :</label>
            <input
              type="text"
              value={formData.i_appro}
              onChange={(e) => updateField('i_appro', e.target.value)}
              placeholder="ex: DSI, RSSI, Directeur Général, Comité de sécurité..."
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Systèmes existants à connecter (T24, Oracle, ERP...) :</label>
            <textarea
              value={formData.i_sys}
              onChange={(e) => updateField('i_sys', e.target.value)}
              placeholder="ex: T24 (core banking), Outlook, SharePoint, portail groupe Attijariwafa..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">I.3 — Contraintes calendaires</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Délais ou contraintes calendaires à respecter absolument :</label>
            <textarea
              value={formData.i_cal}
              onChange={(e) => updateField('i_cal', e.target.value)}
              placeholder="ex: Pas de déploiement en période de clôture (décembre/janvier), validation DSI requise sous 3 mois..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Politique du groupe Attijariwafa sur l'usage des outils IA :</label>
            <textarea
              value={formData.i_pol}
              onChange={(e) => updateField('i_pol', e.target.value)}
              placeholder="ex: Charte IA groupe en cours de rédaction, usage de ChatGPT non autorisé sur données sensibles..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">I.4 — Commentaires libres</div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Tout autre point important non mentionné ci-dessus :</label>
          <textarea
            value={formData.i_autres}
            onChange={(e) => updateField('i_autres', e.target.value)}
            placeholder="Vos observations, suggestions, contraintes supplémentaires..."
            rows={4}
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button onClick={() => setCurrentSection(8)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]">← Retour</button>
        <button onClick={() => setCurrentSection(10)} className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]">Récapitulatif &amp; envoi →</button>
      </div>
    </div>
  );
}
