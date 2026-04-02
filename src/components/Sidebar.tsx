import { useForm } from '../context/formContextCore';

const sections = [
  { id: 0, label: 'Accueil' },
  { id: 1, label: 'A · Charge de travail' },
  { id: 2, label: 'B · Tâches identifiées' },
  { id: 3, label: 'C · Ajustements' },
  { id: 4, label: 'D · Profil early adopter' },
  { id: 5, label: 'E · Tâches libres' },
  { id: 6, label: 'F · Journal de bord' },
  { id: 7, label: 'G · Points de douleur' },
  { id: 8, label: 'H · Vision IA' },
  { id: 9, label: 'I · Contraintes' },
  { id: 10, label: 'Envoi & récapitulatif' },
];

export default function Sidebar() {
  const { currentSection, setCurrentSection, formData } = useForm();

  const calculateSectionProgress = (sectionId: number) => {
    const sectionFields: Record<number, { ids: string[]; libre?: boolean }> = {
      0: { ids: ['c_nom', 'c_email'] },
      1: { ids: ['ch1_h', 'ch2_h', 'a_emails'] },
      2: { ids: [] },
      3: { ids: ['c_prio1', 'c_attentes'] },
      4: { ids: ['sc1', 'sc2', 'd_outils'] },
      5: { ids: [], libre: true },
      6: { ids: ['f_matin', 'f_matinee', 'f_mois'] },
      7: { ids: ['irr1_desc'] },
      8: { ids: ['h_une', 'h_vision'] },
      9: { ids: ['i_conf', 'i_sys'] },
    };

    const sec = sectionFields[sectionId];
    if (!sec) return 0;

    if (sec.libre) {
      return formData.libreRowCount > 0 ? Math.min(100, formData.libreRowCount * 20) : 0;
    }

    if (sec.ids.length === 0) return 0;

    const filled = sec.ids.filter(id => {
      const val = formData[id];
      return val && String(val).trim().length > 0;
    }).length;

    return Math.round(filled / sec.ids.length * 100);
  };

  return (
    <div className="w-56 flex-shrink-0 bg-white border-r border-[#D3D1C7] py-5 sticky top-[59px] h-[calc(100vh-59px)] overflow-y-auto">
      {sections.map((section) => {
        const progress = section.id <= 9 ? calculateSectionProgress(section.id) : 0;
        const isActive = currentSection === section.id;
        const isDone = progress >= 60;

        return (
          <div
            key={section.id}
            onClick={() => {
              setCurrentSection(section.id);
              window.scrollTo(0, 0);
            }}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm cursor-pointer border-l-[3px] transition-all ${
              isActive
                ? 'bg-[#E6F1FB] text-[#185FA5] font-medium border-l-[#185FA5]'
                : isDone
                ? 'text-[#3B6D11] border-l-transparent hover:bg-[#F1EFE8]'
                : 'text-[#888780] border-l-transparent hover:bg-[#F1EFE8] hover:text-[#042C53]'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isActive ? 'bg-[#185FA5]' : isDone ? 'bg-[#3B6D11]' : 'bg-[#D3D1C7]'
              }`}
            />
            <span className="flex-1">{section.label}</span>
            {section.id <= 9 && section.id > 0 && (
              <span className="text-xs text-[#888780] ml-auto">{progress}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
