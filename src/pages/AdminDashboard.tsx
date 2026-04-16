import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Download,
  Eye,
  Mail,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type FormResponse = Database['public']['Tables']['form_responses']['Row'];
type FilterCompleted = 'all' | 'completed' | 'incomplete';

interface AdminDashboardProps {
  onBack?: () => void;
}

function getSafeText(value: string | null | undefined, fallback = '-') {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';
  return trimmedValue || fallback;
}

function escapeCsvCell(value: string | null | undefined) {
  return `"${getSafeText(value).replace(/"/g, '""')}"`;
}

function slugifyFilePart(value: string | null | undefined, fallback: string) {
  return (
    getSafeText(value, fallback)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60) || fallback
  );
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<FilterCompleted>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadResponses = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setResponses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('form_responses').select('*').order('submitted_at', { ascending: false });

      if (filterCompleted === 'completed') {
        query = query.eq('is_completed', true);
      } else if (filterCompleted === 'incomplete') {
        query = query.eq('is_completed', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResponses((data || []) as FormResponse[]);
    } catch (error) {
      console.error('Error loading responses:', error);
      alert('Erreur lors du chargement des réponses');
    } finally {
      setLoading(false);
    }
  }, [filterCompleted]);

  const loadAdminSettings = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from('admin_settings').select('*').limit(1).maybeSingle();

      if (error) throw error;
      const adminSettings = data as Database['public']['Tables']['admin_settings']['Row'] | null;
      if (adminSettings) {
        setAdminEmail(adminSettings.admin_email);
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
    }
  }, []);

  useEffect(() => {
    loadResponses();
    loadAdminSettings();
  }, [loadAdminSettings, loadResponses]);

  const saveAdminSettings = async () => {
    if (!isSupabaseConfigured) {
      alert(supabaseConfigMessage);
      return;
    }

    setSavingSettings(true);
    try {
      const { data: existing } = await supabase.from('admin_settings').select('id').limit(1).maybeSingle();
      const existingSettings = existing as Pick<Database['public']['Tables']['admin_settings']['Row'], 'id'> | null;

      if (existingSettings) {
        const { error } = await supabase
          .from('admin_settings')
          .update({
            admin_email: adminEmail,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('admin_settings').insert({
          admin_email: adminEmail,
          notification_enabled: true,
        });

        if (error) throw error;
      }

      alert('Paramètres sauvegardés avec succès');
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving admin settings:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteResponse = async (id: string) => {
    if (!isSupabaseConfigured) {
      alert(supabaseConfigMessage);
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) return;

    try {
      const { error } = await supabase.from('form_responses').delete().eq('id', id);

      if (error) throw error;
      loadResponses();
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date soumission', 'Date envoi', 'Nom', 'Email', 'Poste', 'Entite', 'Completion', 'Statut'];
    const rows = filteredResponses.map((response) => [
      new Date(response.submitted_at).toLocaleString('fr-FR'),
      response.email_sent_at ? new Date(response.email_sent_at).toLocaleString('fr-FR') : 'Non envoyé',
      getSafeText(response.user_name),
      getSafeText(response.user_email),
      getSafeText(response.user_position),
      getSafeText(response.user_entity),
      `${response.completion_percentage}%`,
      response.is_completed ? 'Complète' : 'En cours',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `audit_ia_responses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const exportResponseJSON = (response: FormResponse) => {
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `response_${slugifyFilePart(response.user_name, 'reponse')}_${response.id.substring(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleFilterCompletedChange = (value: string) => {
    if (value === 'all' || value === 'completed' || value === 'incomplete') {
      setFilterCompleted(value);
    }
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredResponses = responses.filter((response) => {
    if (!normalizedSearchTerm) return true;

    return [response.user_name, response.user_email, response.user_position, response.user_entity]
      .map((value) => getSafeText(value, '').toLowerCase())
      .some((value) => value.includes(normalizedSearchTerm));
  });

  const completedCount = responses.filter((response) => response.is_completed).length;
  const inProgressCount = responses.filter((response) => !response.is_completed).length;

  if (showSettings) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mx-auto max-w-4xl px-4 pt-6 md:px-6">
          <div className="audit-section-header mb-6">
            <span className="audit-pill bg-blue-100 text-blue-800">Paramètres admin</span>
            <h1 className="display-font mt-4 text-3xl font-semibold text-slate-950 md:text-4xl">
              Paramètres de notification
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Configurez l’adresse qui recevra les alertes après chaque soumission.
            </p>
          </div>

          <div className="audit-card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Notifications automatiques</div>
                  <div className="text-sm text-slate-500">Chaque soumission peut déclencher un email admin.</div>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="audit-button audit-button-secondary">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block">Email administrateur</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="admin@entreprise.com"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Cet email recevra une notification à chaque fois qu’un formulaire est soumis.
                </p>
              </div>

              <div className="audit-note audit-note-info">
                <div className="font-semibold text-blue-900">Bon à savoir</div>
                <p className="mt-1 text-blue-950/80">
                  L’email admin affiché dans l’interface doit rester cohérent avec le fallback backend pour éviter toute confusion.
                </p>
              </div>

              <button
                onClick={saveAdminSettings}
                disabled={savingSettings || !adminEmail}
                className="audit-button audit-button-primary border-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingSettings ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-[1500px] px-4 pt-6 md:px-6">
        <div className="audit-section-header mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="audit-pill bg-blue-100 text-blue-800">Mode admin</span>
            <span className="audit-pill bg-emerald-100 text-emerald-800">Pilotage des soumissions</span>
          </div>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="display-font text-3xl font-semibold text-slate-950 md:text-4xl">
                Tableau de bord des réponses
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Visualisez les soumissions, exportez les données et suivez les envois email dans une seule vue.
              </p>
              {adminEmail && (
                <p className="mt-2 text-sm text-slate-500">
                  Notifications actives vers <strong>{adminEmail}</strong>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {onBack && (
                <button onClick={onBack} className="audit-button audit-button-secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
              )}
              <button onClick={() => setShowSettings(true)} className="audit-button audit-button-secondary">
                <Settings className="h-4 w-4" />
                Paramètres
              </button>
              <button onClick={loadResponses} className="audit-button audit-button-secondary">
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </button>
              <button onClick={exportToCSV} className="audit-button audit-button-primary border-0">
                <Download className="h-4 w-4" />
                Exporter CSV
              </button>
            </div>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="audit-note audit-note-warn mb-6">
            <div className="font-semibold text-amber-900">Backend non configuré</div>
            <p className="mt-1 text-amber-950/80">{supabaseConfigMessage}</p>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Total réponses</div>
            <div className="display-font mt-2 text-4xl font-semibold text-slate-950">{responses.length}</div>
            <div className="mt-2 text-sm text-slate-500">Toutes soumissions confondues.</div>
          </div>
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Complètes</div>
            <div className="display-font mt-2 text-4xl font-semibold text-emerald-700">{completedCount}</div>
            <div className="mt-2 text-sm text-slate-500">Réponses jugées finalisées.</div>
          </div>
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">En cours</div>
            <div className="display-font mt-2 text-4xl font-semibold text-amber-700">{inProgressCount}</div>
            <div className="mt-2 text-sm text-slate-500">Dossiers partiels ou brouillons.</div>
          </div>
        </div>

        <div className="audit-card mb-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, poste ou entité"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-12"
              />
            </div>
            <select value={filterCompleted} onChange={(event) => handleFilterCompletedChange(event.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="completed">Complètes uniquement</option>
              <option value="incomplete">En cours uniquement</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="audit-card text-center py-14">
            <div className="mx-auto inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
            <p className="mt-4 text-slate-500">Chargement des réponses...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="audit-card text-center py-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-medium text-slate-900">Aucune réponse trouvée</p>
            <p className="mt-2 text-sm text-slate-500">Ajustez vos filtres ou attendez les prochaines soumissions.</p>
          </div>
        ) : (
          <div className="audit-card overflow-hidden">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold">Soumission</th>
                    <th className="p-3 text-left text-xs font-semibold">Envoi</th>
                    <th className="p-3 text-left text-xs font-semibold">Répondant</th>
                    <th className="p-3 text-left text-xs font-semibold">Poste</th>
                    <th className="p-3 text-left text-xs font-semibold">Completion</th>
                    <th className="p-3 text-left text-xs font-semibold">Statut</th>
                    <th className="p-3 text-right text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response) => (
                    <tr key={response.id}>
                      <td className="p-3 text-sm text-slate-700">
                        {new Date(response.submitted_at).toLocaleDateString('fr-FR')}
                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(response.submitted_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-700">
                        {response.email_sent_at ? (
                          <>
                            {new Date(response.email_sent_at).toLocaleDateString('fr-FR')}
                            <div className="mt-1 text-xs text-slate-500">
                              {new Date(response.email_sent_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">Non envoyé</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{getSafeText(response.user_name)}</div>
                        <div className="mt-1 text-xs text-slate-500">{getSafeText(response.user_email)}</div>
                        <div className="mt-1 text-xs text-slate-500">{getSafeText(response.user_entity)}</div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{getSafeText(response.user_position)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full max-w-[110px] rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500"
                              style={{ width: `${response.completion_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{response.completion_percentage}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            response.is_completed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {response.is_completed ? 'Complète' : 'En cours'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => exportResponseJSON(response)}
                            className="audit-button audit-button-secondary !rounded-2xl !px-3 !py-2"
                            title="Télécharger JSON"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              alert(`ID de session : ${response.session_id}\n\nVous pouvez voir les détails complets dans le JSON exporté.`);
                            }}
                            className="audit-button audit-button-secondary !rounded-2xl !px-3 !py-2"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteResponse(response.id)}
                            className="audit-button !rounded-2xl !border !border-red-200 !bg-red-50 !px-3 !py-2 !text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
