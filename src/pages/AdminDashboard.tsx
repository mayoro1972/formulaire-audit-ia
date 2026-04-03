import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Download, RefreshCw, Eye, Trash2, Search, ArrowLeft, Mail, Settings } from 'lucide-react';

type FormResponse = Database['public']['Tables']['form_responses']['Row'];
type FilterCompleted = 'all' | 'completed' | 'incomplete';

interface AdminDashboardProps {
  onBack?: () => void;
}

function getSafeText(value: string | null | undefined, fallback = '—') {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';
  return trimmedValue || fallback;
}

function escapeCsvCell(value: string | null | undefined) {
  return `"${getSafeText(value).replace(/"/g, '""')}"`;
}

function slugifyFilePart(value: string | null | undefined, fallback: string) {
  return getSafeText(value, fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || fallback;
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
    setLoading(true);
    try {
      let query = supabase
        .from('form_responses')
        .select('*')
        .order('submitted_at', { ascending: false });

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
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

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
    setSavingSettings(true);
    try {
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

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
        const { error } = await supabase
          .from('admin_settings')
          .insert({
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) return;

    try {
      const { error } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadResponses();
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date soumission', 'Date envoi', 'Nom', 'Email', 'Poste', 'Entité', 'Complétion', 'Statut'];
    const rows = filteredResponses.map(r => [
      new Date(r.submitted_at).toLocaleString('fr-FR'),
      r.email_sent_at ? new Date(r.email_sent_at).toLocaleString('fr-FR') : 'Non envoyé',
      getSafeText(r.user_name),
      getSafeText(r.user_email),
      getSafeText(r.user_position),
      getSafeText(r.user_entity),
      `${r.completion_percentage}%`,
      r.is_completed ? 'Complété' : 'En cours',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => escapeCsvCell(String(cell))).join(','))
    ].join('\n');

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

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F1FB] to-white">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#042C53]">Paramètres Admin</h1>
                <p className="text-[#888780] mt-2">Configurez les notifications par email</p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2A] mb-2">
                  Email administrateur
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@entreprise.com"
                  className="w-full border border-[#D3D1C7] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
                />
                <p className="text-xs text-[#888780] mt-2">
                  Cet email recevra une notification à chaque fois qu'un formulaire est soumis
                </p>
              </div>

              <div className="bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-4">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-[#185FA5] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#042C53] mb-2">Notifications automatiques</h3>
                    <p className="text-sm text-[#185FA5]">
                      Chaque fois qu'un utilisateur soumet un formulaire, vous recevrez automatiquement un email avec les informations du répondant et un lien vers le tableau de bord.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveAdminSettings}
                disabled={savingSettings || !adminEmail}
                className="w-full bg-[#185FA5] text-white py-3 rounded-lg font-semibold hover:bg-[#042C53] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1FB] to-white">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#042C53]">Tableau de bord Admin</h1>
              <p className="text-[#888780] mt-2">Gestion des réponses du formulaire d'audit IA</p>
              {adminEmail && (
                <p className="text-xs text-[#185FA5] mt-1">
                  Notifications envoyées à : {adminEmail}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
              <button
                onClick={loadResponses}
                className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-lg hover:bg-[#042C53] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888780]" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#D9D6CF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              />
            </div>
            <select
              value={filterCompleted}
              onChange={(e) => handleFilterCompletedChange(e.target.value)}
              className="px-4 py-2 border border-[#D9D6CF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétés uniquement</option>
              <option value="incomplete">En cours uniquement</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-[#042C53]">{responses.length}</div>
              <div className="text-sm text-[#888780] mt-1">Total réponses</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-700">
                {responses.filter(r => r.is_completed).length}
              </div>
              <div className="text-sm text-[#888780] mt-1">Formulaires complétés</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-orange-700">
                {responses.filter(r => !r.is_completed).length}
              </div>
              <div className="text-sm text-[#888780] mt-1">En cours</div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#185FA5]"></div>
              <p className="text-[#888780] mt-4">Chargement des réponses...</p>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#888780] text-lg">Aucune réponse trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#D9D6CF]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Date soumission</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Date envoi</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Poste</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Complétion</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#042C53]">Statut</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#042C53]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response) => (
                    <tr key={response.id} className="border-b border-[#D9D6CF] hover:bg-[#E6F1FB] transition-colors">
                      <td className="py-3 px-4 text-sm text-[#042C53]">
                        {new Date(response.submitted_at).toLocaleDateString('fr-FR')}
                        <div className="text-xs text-[#888780]">
                          {new Date(response.submitted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#042C53]">
                        {response.email_sent_at ? (
                          <>
                            {new Date(response.email_sent_at).toLocaleDateString('fr-FR')}
                            <div className="text-xs text-[#888780]">
                              {new Date(response.email_sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-[#888780]">Non envoyé</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#042C53]">{response.user_name}</td>
                      <td className="py-3 px-4 text-sm text-[#888780]">{response.user_email}</td>
                      <td className="py-3 px-4 text-sm text-[#888780]">{response.user_position}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-[#185FA5] h-2 rounded-full"
                              style={{ width: `${response.completion_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-[#888780] w-10">{response.completion_percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          response.is_completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {response.is_completed ? 'Complété' : 'En cours'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => exportResponseJSON(response)}
                            className="p-2 text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg transition-all"
                            title="Télécharger JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              alert(`ID de session: ${response.session_id}\n\nVous pouvez voir les détails complets dans le JSON exporté.`);
                            }}
                            className="p-2 text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteResponse(response.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
