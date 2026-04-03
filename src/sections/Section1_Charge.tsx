import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { getInputValue } from '../lib/formValue';

export default function Section1_Charge() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  const calculateTotals = () => {
    const hours = [
      parseFloat(formData.ch1_h) || 0,
      parseFloat(formData.ch2_h) || 0,
      parseFloat(formData.ch3_h) || 0,
      parseFloat(formData.ch4_h) || 0,
      parseFloat(formData.ch5_h) || 0,
      parseFloat(formData.ch6_h) || 0,
      parseFloat(formData.ch7_h) || 0,
      parseFloat(formData.ch8_h) || 0,
    ];
    const total = hours.reduce((a, b) => a + b, 0);
    return { hours, total };
  };

  const { hours, total } = calculateTotals();

  const activities = profile.workloadCategories.map((label, index) => ({
    label,
    hId: `ch${index + 1}_h`,
    rId: `ch${index + 1}_r`,
  }));

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">A — Votre charge de travail actuelle</h2>
        <p className="text-sm text-[#185FA5] mt-1">Vue d&apos;ensemble de votre temps et de vos activités hebdomadaires pour le domaine {profile.label.toLowerCase()}</p>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          A.1 — Répartition hebdomadaire de votre temps
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#042C53] text-white">
                <th className="text-left p-3 font-medium text-xs">Domaine d'activité</th>
                <th className="text-left p-3 font-medium text-xs">Heures/sem.</th>
                <th className="text-left p-3 font-medium text-xs">% du temps</th>
                <th className="text-left p-3 font-medium text-xs">Dont répétitif (%)</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => {
                const h = hours[idx];
                const pct = total > 0 ? Math.round((h / total) * 100) : 0;

                return (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAFAF8]' : ''}>
                    <td className="p-2 text-[#2C2C2A] border-b border-[#F1EFE8]">{activity.label}</td>
                    <td className="p-2 border-b border-[#F1EFE8]">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={getInputValue(formData[activity.hId])}
                        onChange={(e) => updateField(activity.hId, e.target.value)}
                        placeholder="ex: 8"
                        className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="p-2 border-b border-[#F1EFE8] text-[#185FA5] font-semibold">
                      {pct > 0 ? `${pct}%` : '—'}
                    </td>
                    <td className="p-2 border-b border-[#F1EFE8]">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={getInputValue(formData[activity.rId])}
                        onChange={(e) => updateField(activity.rId, e.target.value)}
                        placeholder="ex: 70"
                        className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#E6F1FB]">
                <td className="p-2 font-semibold">TOTAL</td>
                <td className="p-2 font-semibold text-[#185FA5]">{Math.round(total * 10) / 10} h</td>
                <td className="p-2 font-semibold">{total > 0 ? '100%' : '—'}</td>
                <td className="p-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          A.2 — Chiffres clés de votre semaine type
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.emails}</label>
            <input
              type="number"
              value={formData.a_emails}
              onChange={(e) => updateField('a_emails', e.target.value)}
              placeholder="ex: 40"
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.meetings}</label>
            <input
              type="number"
              value={formData.a_reunions}
              onChange={(e) => updateField('a_reunions', e.target.value)}
              placeholder="ex: 10"
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.reports}</label>
            <input
              type="number"
              value={formData.a_rapports}
              onChange={(e) => updateField('a_rapports', e.target.value)}
              placeholder="ex: 8"
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.sources}</label>
            <input
              type="number"
              value={formData.a_sources}
              onChange={(e) => updateField('a_sources', e.target.value)}
              placeholder="ex: 6"
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.dossiers}</label>
            <input
              type="number"
              value={formData.a_dossiers}
              onChange={(e) => updateField('a_dossiers', e.target.value)}
              placeholder="ex: 15"
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.missions}</label>
            <input
              type="number"
              value={formData.a_missions}
              onChange={(e) => updateField('a_missions', e.target.value)}
              placeholder="ex: 3"
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">{profile.metricLabels.lowValueHours}</label>
          <input
            type="number"
            value={formData.a_perdues}
            onChange={(e) => updateField('a_perdues', e.target.value)}
            placeholder="ex: 6"
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
          />
          <div className="text-xs text-[#888780] mt-1 italic">Tâches manuelles, ressaisies, reformatages, attentes...</div>
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(0)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentSection(2)}
          className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]"
        >
          Section suivante →
        </button>
      </div>
    </div>
  );
}
