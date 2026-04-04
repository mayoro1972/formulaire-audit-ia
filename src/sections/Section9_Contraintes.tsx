import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';

export default function Section9_Contraintes() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section I</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Contraintes et prerequis
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Cette derniere section metier fixe le cadre de securite, d integration et de gouvernance a respecter.
        </p>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">I.1 - Confidentialite et conformite</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Donnees qui ne doivent jamais sortir du cadre autorise</label>
            <textarea
              value={formData.i_conf}
              onChange={(event) => updateField('i_conf', event.target.value)}
              placeholder={profile.constraints.confidentiality}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Regles, normes ou politiques a respecter</label>
            <textarea
              value={formData.i_rgpd}
              onChange={(event) => updateField('i_rgpd', event.target.value)}
              placeholder={profile.constraints.regulations}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">I.2 - Contraintes techniques</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Hebergement ou contraintes d infrastructure</label>
            <input
              type="text"
              value={formData.i_heberg}
              onChange={(event) => updateField('i_heberg', event.target.value)}
              placeholder="ex: cloud prive, serveur interne, region imposee"
            />
          </div>
          <div>
            <label className="mb-2 block">Approbations necessaires</label>
            <input
              type="text"
              value={formData.i_appro}
              onChange={(event) => updateField('i_appro', event.target.value)}
              placeholder="ex: DSI, RSSI, Direction generale"
            />
          </div>
          <div>
            <label className="mb-2 block">Systemes ou outils a connecter</label>
            <textarea
              value={formData.i_sys}
              onChange={(event) => updateField('i_sys', event.target.value)}
              placeholder={profile.constraints.systems}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">I.3 - Contraintes calendaires</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Delais ou fenetres a respecter</label>
            <textarea
              value={formData.i_cal}
              onChange={(event) => updateField('i_cal', event.target.value)}
              placeholder={profile.constraints.calendar}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Politique interne sur l usage de l IA</label>
            <textarea
              value={formData.i_pol}
              onChange={(event) => updateField('i_pol', event.target.value)}
              placeholder={profile.constraints.policy}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card">
        <div className="mb-4 text-sm font-semibold text-slate-900">I.4 - Commentaires libres</div>
        <label className="mb-2 block">Autres points importants a signaler</label>
        <textarea
          value={formData.i_autres}
          onChange={(event) => updateField('i_autres', event.target.value)}
          rows={4}
        />
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(8)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(10)} className="audit-button audit-button-primary sm:ml-auto">
          Recapitulatif et envoi
        </button>
      </div>
    </div>
  );
}
