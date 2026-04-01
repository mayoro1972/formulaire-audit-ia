import { useForm } from '../context/FormContext';

export default function Navbar() {
  const { saveStatus, saveAll, formData } = useForm();

  const calculateProgress = () => {
    const sections = [
      { ids: ['c_nom', 'c_email'], weight: 10 },
      { ids: ['ch1_h', 'ch2_h', 'a_emails'], weight: 10 },
      { ids: [], weight: 10 },
      { ids: ['c_prio1', 'c_attentes'], weight: 10 },
      { ids: ['sc1', 'sc2', 'd_outils'], weight: 10 },
      { ids: [], libre: true, weight: 15 },
      { ids: ['f_matin', 'f_matinee', 'f_mois'], weight: 10 },
      { ids: ['irr1_desc'], weight: 10 },
      { ids: ['h_une', 'h_vision'], weight: 10 },
      { ids: ['i_conf', 'i_sys'], weight: 5 },
    ];

    let totalPct = 0;
    sections.forEach((sec) => {
      let pct = 0;
      if (sec.libre) {
        pct = formData.libreRowCount > 0 ? Math.min(100, formData.libreRowCount * 20) : 0;
      } else {
        const filled = sec.ids.filter(id => {
          const val = formData[id];
          return val && String(val).trim().length > 0;
        }).length;
        pct = sec.ids.length > 0 ? Math.round(filled / sec.ids.length * 100) : 0;
      }
      totalPct += pct * sec.weight / 100;
    });

    return Math.round(totalPct);
  };

  const progress = calculateProgress();

  return (
    <div className="sticky top-0 z-50">
      <div className="bg-[#042C53] text-white flex items-center gap-3 px-6 h-14 shadow-lg">
        <div className="flex-1">
          <div className="text-sm font-semibold">Audit IA · Claude Yapi Gérard</div>
          <div className="text-xs opacity-70">Directeur Audit Interne · Attijari West Africa</div>
        </div>
        <div className="text-xs text-[#9FE1CB] min-w-[140px] text-right">{saveStatus}</div>
        <button
          onClick={saveAll}
          className="bg-[#0F6E56] text-white border-none rounded-lg px-5 py-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-85"
        >
          Sauvegarder
        </button>
      </div>
      <div className="h-1 bg-white/20 relative">
        <div
          className="h-full bg-[#BA7517] transition-all duration-400 rounded-r"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
