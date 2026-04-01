import { useForm } from '../context/FormContext';
import { getInputValue } from '../lib/formValue';

export default function Section6_Journal() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">F — Journal de bord par rythme</h2>
        <p className="text-sm text-[#185FA5] mt-1">Retrouvez les tâches oubliées en pensant à vos routines</p>
      </div>

      <div className="border-l-4 border-[#0F6E56] bg-[#E1F5EE] rounded-r-lg p-4 mb-5 text-sm text-[#2C2C2A]">
        Décrivez ce que vous faites à chaque moment. Cette approche permet de retrouver des tâches qu'on a tendance à oublier car elles sont devenues automatiques.
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">F.1 — Votre routine quotidienne</div>
        <div className="space-y-3">
          {[
            { id: 'f_matin', label: 'En arrivant le matin (premières 30 minutes) :', placeholder: 'ex: Je lis mes emails, je consulte le site de la BCEAO, je fais le point avec mon assistante...' },
            { id: 'f_matinee', label: 'Pendant la matinée :', placeholder: 'ex: Revue des alertes LCB-FT, réunions d\'équipe, lecture des circulaires...' },
            { id: 'f_apm', label: 'Après-midi :', placeholder: 'ex: Validation de rapports, appels avec les filiales, suivi des recommandations...' },
            { id: 'f_soir', label: 'En fin de journée :', placeholder: 'ex: Synthèse de la journée, préparation du lendemain, envoi d\'emails...' },
          ].map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{field.label}</label>
              <textarea
                value={getInputValue(formData[field.id])}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">F.2 — Routine hebdomadaire</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Début de semaine (lundi) :</label>
            <textarea
              value={formData.f_lundi}
              onChange={(e) => updateField('f_lundi', e.target.value)}
              placeholder="ex: Revue du programme de la semaine, point équipe..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Fin de semaine (vendredi) :</label>
            <textarea
              value={formData.f_vendredi}
              onChange={(e) => updateField('f_vendredi', e.target.value)}
              placeholder="ex: Bilan de semaine, rapport au DG, transmission aux filiales..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">F.3 — Routine mensuelle et trimestrielle</div>
        <div className="space-y-3">
          {[
            { id: 'f_mois', label: 'Début du mois (clôtures, reporting, consolidations) :', placeholder: 'ex: Consolidation des rapports AWA, rapport mensuel au groupe...' },
            { id: 'f_trim', label: 'Tâches trimestrielles (rapports CENTIF, comités, revues AWA) :', placeholder: 'ex: Rapport CENTIF, comité d\'audit, revue du programme d\'audit...' },
            { id: 'f_annuel', label: 'Tâches annuelles (programme audit, budget, évaluations) :', placeholder: 'ex: Élaboration du plan annuel d\'audit, évaluations équipe, budget...' },
            { id: 'f_deplac', label: 'Tâches liées aux déplacements inter-filiales AWA :', placeholder: 'ex: Préparation des missions, rapports de déplacement, suivi post-visite...' },
          ].map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{field.label}</label>
              <textarea
                value={getInputValue(formData[field.id])}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button onClick={() => setCurrentSection(5)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]">← Retour</button>
        <button onClick={() => setCurrentSection(7)} className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]">Section suivante →</button>
      </div>
    </div>
  );
}
