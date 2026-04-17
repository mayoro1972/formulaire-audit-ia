import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Mail,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  UserRoundSearch,
} from 'lucide-react';
import { deleteLocalProspect, formatProspectsCsv, getProspectStatusLabel, listLocalProspects, updateLocalProspect } from '../lib/prospectStorage';
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { ProspectRecord, ProspectStatus } from '../types/prospect';

interface AdminDashboardProps {
  onBack?: () => void;
  onPrepareAudit?: (prospect: { name: string; email: string }) => void;
}

function getSafeText(value: string | null | undefined, fallback = '-') {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';
  return trimmedValue || fallback;
}

function isPreviewFallbackError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('prospect_requests') || message.includes('does not exist');
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString('fr-FR') : '—';
}

function statusPillClass(status: ProspectStatus) {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contact_scheduled':
      return 'bg-amber-100 text-amber-800';
    case 'audit_pending':
      return 'bg-violet-100 text-violet-800';
    case 'audit_sent':
      return 'bg-emerald-100 text-emerald-800';
    case 'closed':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

export default function AdminDashboard({ onBack, onPrepareAudit }: AdminDashboardProps) {
  const [prospects, setProspects] = useState<ProspectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ProspectStatus>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('supabase');

  const loadProspects = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setProspects(listLocalProspects());
      setDataSource('local');
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('prospect_requests').select('*').order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProspects((data || []) as ProspectRecord[]);
      setDataSource('supabase');
    } catch (error) {
      console.error('Error loading prospect requests:', error);

      if (isPreviewFallbackError(error)) {
        setProspects(listLocalProspects());
        setDataSource('local');
      } else {
        alert('Erreur lors du chargement des prospects');
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

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
    void loadProspects();
    void loadAdminSettings();
  }, [loadAdminSettings, loadProspects]);

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

  const patchProspect = async (id: string, patch: Partial<ProspectRecord>) => {
    if (dataSource === 'local' || !isSupabaseConfigured) {
      updateLocalProspect(id, patch);
      setProspects(listLocalProspects());
      return;
    }

    const { error } = await supabase.from('prospect_requests').update(patch).eq('id', id);
    if (error) throw error;

    await loadProspects();
  };

  const deleteProspect = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche prospect ?')) return;

    try {
      if (dataSource === 'local' || !isSupabaseConfigured) {
        deleteLocalProspect(id);
        setProspects(listLocalProspects());
        return;
      }

      const { error } = await supabase.from('prospect_requests').delete().eq('id', id);
      if (error) throw error;
      await loadProspects();
    } catch (error) {
      console.error('Error deleting prospect:', error);
      alert('Erreur lors de la suppression du prospect');
    }
  };

  const exportToCSV = () => {
    const csvContent = formatProspectsCsv(filteredProspects);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `prospects_audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredProspects = useMemo(
    () =>
      prospects.filter((prospect) => {
        const matchesSearch = !normalizedSearchTerm
          || [
            prospect.prospect_code,
            prospect.full_name,
            prospect.profession,
            prospect.email,
            prospect.phone,
            prospect.city,
            prospect.country,
            prospect.activity_sector,
          ]
            .map((value) => getSafeText(value, '').toLowerCase())
            .some((value) => value.includes(normalizedSearchTerm));

        const matchesStatus = filterStatus === 'all' || prospect.status === filterStatus;

        return matchesSearch && matchesStatus;
      }),
    [filterStatus, normalizedSearchTerm, prospects]
  );

  const dueSoonCount = useMemo(() => {
    const now = Date.now();
    return prospects.filter((prospect) => {
      if (prospect.status === 'audit_sent' || prospect.status === 'closed') return false;
      return new Date(prospect.follow_up_due_at).getTime() <= now + 48 * 60 * 60 * 1000;
    }).length;
  }, [prospects]);

  const auditSentCount = prospects.filter((prospect) => prospect.status === 'audit_sent').length;
  const newCount = prospects.filter((prospect) => prospect.status === 'new').length;

  if (showSettings) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mx-auto max-w-4xl px-4 pt-6 md:px-6">
          <div className="audit-section-header mb-6">
            <span className="audit-pill bg-blue-100 text-blue-800">Paramètres admin</span>
            <h1 className="display-font mt-4 text-3xl font-semibold text-slate-950 md:text-4xl">
              Notifications de suivi prospects
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Définissez l’adresse qui recevra les nouvelles demandes d’échange expert et les alertes
              de suivi prospect.
            </p>
          </div>

          <div className="audit-card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Notifications admin</div>
                  <div className="text-sm text-slate-500">
                    Utilisées pour les nouvelles demandes prospect et les prochaines relances.
                  </div>
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
                  placeholder="contact@transferai.ci"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Cet email recevra les nouvelles demandes de cadrage et les notifications de suivi.
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
      <div className="mx-auto max-w-[1560px] px-4 pt-6 md:px-6">
        <div className="audit-section-header mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="audit-pill bg-blue-100 text-blue-800">Mode admin</span>
            <span className="audit-pill bg-emerald-100 text-emerald-800">Pipeline prospects</span>
          </div>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="display-font text-3xl font-semibold text-slate-950 md:text-4xl">
                Tableau de suivi des prospects audit
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Gérez les demandes entrantes, suivez les échéances sous 48 heures et préparez
                l’envoi du formulaire d’audit au bon moment.
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
              <button onClick={() => void loadProspects()} className="audit-button audit-button-secondary">
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

        {dataSource === 'local' && (
          <div className="audit-note audit-note-info mb-6">
            <div className="font-semibold text-blue-900">Aperçu local actif</div>
            <p className="mt-1 text-blue-950/80">
              Les fiches prospect affichées ici proviennent du navigateur. C’est pratique pour valider
              le parcours avant déploiement de la nouvelle table Supabase.
            </p>
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="audit-note audit-note-warn mb-6">
            <div className="font-semibold text-amber-900">Backend non configuré</div>
            <p className="mt-1 text-amber-950/80">{supabaseConfigMessage}</p>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Total prospects</div>
            <div className="display-font mt-2 text-4xl font-semibold text-slate-950">{prospects.length}</div>
            <div className="mt-2 text-sm text-slate-500">Toutes demandes confondues.</div>
          </div>
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Nouveaux</div>
            <div className="display-font mt-2 text-4xl font-semibold text-blue-700">{newCount}</div>
            <div className="mt-2 text-sm text-slate-500">Demandes à prendre en compte.</div>
          </div>
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Suivi sous 48 h</div>
            <div className="display-font mt-2 text-4xl font-semibold text-amber-700">{dueSoonCount}</div>
            <div className="mt-2 text-sm text-slate-500">Échéances de relance ou de qualification.</div>
          </div>
          <div className="audit-card">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Audits envoyés</div>
            <div className="display-font mt-2 text-4xl font-semibold text-emerald-700">{auditSentCount}</div>
            <div className="mt-2 text-sm text-slate-500">Formulaires d’audit déjà transmis.</div>
          </div>
        </div>

        <div className="audit-card mb-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par code, nom, email, téléphone ou secteur"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-12"
              />
            </div>
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as 'all' | ProspectStatus)}>
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveaux</option>
              <option value="contact_scheduled">Contact planifié</option>
              <option value="audit_pending">Audit à envoyer</option>
              <option value="audit_sent">Audit envoyé</option>
              <option value="closed">Clôturés</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="audit-card text-center py-14">
            <div className="mx-auto inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
            <p className="mt-4 text-slate-500">Chargement des prospects...</p>
          </div>
        ) : filteredProspects.length === 0 ? (
          <div className="audit-card text-center py-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-medium text-slate-900">Aucun prospect trouvé</p>
            <p className="mt-2 text-sm text-slate-500">
              Les prochaines demandes qualifiées apparaîtront ici dès qu’un visiteur remplira le formulaire.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredProspects.map((prospect) => (
              <div key={prospect.id} className="audit-card">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-900/8 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="audit-pill bg-slate-900 text-white">{prospect.prospect_code}</span>
                      <span className={`audit-pill ${statusPillClass(prospect.status as ProspectStatus)}`}>
                        {getProspectStatusLabel(prospect.status as ProspectStatus)}
                      </span>
                    </div>
                    <div className="mt-3 text-xl font-semibold text-slate-950">{prospect.full_name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {prospect.profession} · {prospect.activity_sector}
                    </div>
                  </div>
                  <button
                    onClick={() => void deleteProspect(prospect.id)}
                    className="audit-button !rounded-2xl !border !border-red-200 !bg-red-50 !px-3 !py-2 !text-red-700"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-slate-900/8 bg-white/70 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Coordonnées</div>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      <div>{prospect.email}</div>
                      <div>{prospect.phone}</div>
                      <div>{prospect.city}, {prospect.country}</div>
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-slate-900/8 bg-white/70 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Échéances</div>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      <div>Créé le {formatDateTime(prospect.created_at)}</div>
                      <div>Relance avant {formatDateTime(prospect.follow_up_due_at)}</div>
                      <div>Audit envoyé : {formatDateTime(prospect.audit_form_sent_at)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] border border-slate-900/8 bg-white/72 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Besoin exprimé</div>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{prospect.need_description}</p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <button
                    onClick={() =>
                      void patchProspect(prospect.id, {
                        status: 'contact_scheduled',
                        last_contacted_at: new Date().toISOString(),
                      })
                    }
                    className="audit-button audit-button-secondary"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Marquer contacté
                  </button>
                  <button
                    onClick={() => {
                      void patchProspect(prospect.id, { status: 'audit_pending' });
                      onPrepareAudit?.({ name: prospect.full_name, email: prospect.email });
                    }}
                    className="audit-button audit-button-primary border-0"
                  >
                    <Send className="h-4 w-4" />
                    Préparer l’audit
                  </button>
                  <button
                    onClick={() =>
                      void patchProspect(prospect.id, {
                        status: 'audit_sent',
                        audit_form_sent_at: new Date().toISOString(),
                      })
                    }
                    className="audit-button audit-button-secondary"
                  >
                    <Mail className="h-4 w-4" />
                    Marquer audit envoyé
                  </button>
                  <button
                    onClick={() => void patchProspect(prospect.id, { status: 'closed' })}
                    className="audit-button audit-button-secondary"
                  >
                    <UserRoundSearch className="h-4 w-4" />
                    Clôturer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
