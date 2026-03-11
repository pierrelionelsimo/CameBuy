import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Users, Package, ShoppingCart, Bell, CheckCircle,
  XCircle, Clock, AlertTriangle, Send, ChevronDown,
  BarChart2, MessageSquare, Shield, RefreshCw, X,
  Eye, Ban, RotateCcw, Filter, LogOut
} from "lucide-react";
import "./AdminPanel.css";

// ── Helpers ───────────────────────────────────────────────
const STATUT_META = {
  en_attente: { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <Clock size={13} /> },
  valide:     { label: "Validé",     color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: <CheckCircle size={13} /> },
  refuse:     { label: "Refusé",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: <XCircle size={13} /> },
  suspendu:   { label: "Suspendu",   color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: <Ban size={13} /> },
};

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="ap-stat" style={{ "--sc": color }}>
      <div className="ap-stat-icon">{icon}</div>
      <div className="ap-stat-body">
        <span className="ap-stat-val">{value}</span>
        <span className="ap-stat-lbl">{label}</span>
        {sub && <span className="ap-stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

function StatutBadge({ statut }) {
  const m = STATUT_META[statut] || STATUT_META.en_attente;
  return (
    <span className="ap-statut-badge" style={{ color: m.color, background: m.bg }}>
      {m.icon} {m.label}
    </span>
  );
}

// ── Modal action sur fournisseur ──────────────────────────
function ActionModal({ fournisseur, onClose, onDone }) {
  const [action, setAction]   = useState("valider");
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const actionsMeta = {
    valider:   { label: "Valider",   color: "#10b981", icon: <CheckCircle size={14} /> },
    refuser:   { label: "Refuser",   color: "#ef4444", icon: <XCircle size={14} /> },
    suspendre: { label: "Suspendre", color: "#8b5cf6", icon: <Ban size={14} /> },
    reactiver: { label: "Réactiver", color: "#4db8e8", icon: <RotateCcw size={14} /> },
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await api.post(`/admin/fournisseurs/${fournisseur.id}/action/`, { action, note });
      onDone();
    } catch (e) {
      setError(e.response?.data?.error || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-header">
          <div>
            <h3 className="ap-modal-title">Action sur le fournisseur</h3>
            <p className="ap-modal-sub">{fournisseur.nom} · {fournisseur.email}</p>
          </div>
          <button className="ap-modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Actions */}
        <div className="ap-modal-actions">
          {Object.entries(actionsMeta).map(([key, meta]) => (
            <button
              key={key}
              className={`ap-action-btn${action === key ? " ap-action-btn--active" : ""}`}
              style={{ "--ac": meta.color }}
              onClick={() => setAction(key)}
            >
              {meta.icon} {meta.label}
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="ap-modal-field">
          <label className="ap-modal-label">Message pour le fournisseur (optionnel)</label>
          <textarea
            className="ap-modal-textarea"
            placeholder="Expliquez votre décision..."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p className="ap-modal-error"><AlertTriangle size={13} /> {error}</p>}

        <div className="ap-modal-footer">
          <button className="ap-modal-cancel" onClick={onClose}>Annuler</button>
          <button
            className="ap-modal-confirm"
            style={{ background: actionsMeta[action].color }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <RefreshCw size={14} className="ap-spin" /> : actionsMeta[action].icon}
            {loading ? "Traitement..." : `${actionsMeta[action].label} le compte`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal envoi de message ────────────────────────────────
function MessageModal({ fournisseurs, onClose, onDone }) {
  const [destinataires, setDestinataires] = useState("tous");
  const [selected, setSelected]           = useState([]);
  const [titre, setTitre]                 = useState("");
  const [message, setMessage]             = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleSend = async () => {
    if (!titre.trim() || !message.trim()) { setError("Titre et message requis."); return; }
    setLoading(true); setError("");
    try {
      await api.post('/admin/messages/', {
        destinataires: destinataires === "tous" ? "tous" : selected,
        titre, message,
      });
      onDone();
    } catch (e) {
      setError(e.response?.data?.error || "Erreur envoi");
    } finally { setLoading(false); }
  };

  const valides = fournisseurs.filter(f => f.statut === 'valide');

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal ap-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-header">
          <div>
            <h3 className="ap-modal-title"><MessageSquare size={16} /> Envoyer un message</h3>
            <p className="ap-modal-sub">Message direct aux fournisseurs</p>
          </div>
          <button className="ap-modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Destinataires */}
        <div className="ap-modal-field">
          <label className="ap-modal-label">Destinataires</label>
          <div className="ap-dest-tabs">
            <button className={`ap-dest-tab${destinataires === "tous" ? " active" : ""}`}
              onClick={() => setDestinataires("tous")}>
              Tous les fournisseurs validés ({valides.length})
            </button>
            <button className={`ap-dest-tab${destinataires === "custom" ? " active" : ""}`}
              onClick={() => setDestinataires("custom")}>
              Choisir manuellement
            </button>
          </div>
          {destinataires === "custom" && (
            <div className="ap-dest-list">
              {valides.map(f => (
                <label key={f.id} className="ap-dest-item">
                  <input type="checkbox" checked={selected.includes(f.id)}
                    onChange={() => toggle(f.id)} />
                  <span>{f.nom}</span>
                  <span className="ap-dest-email">{f.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="ap-modal-field">
          <label className="ap-modal-label">Objet</label>
          <input className="ap-modal-input" placeholder="Titre du message"
            value={titre} onChange={e => setTitre(e.target.value)} />
        </div>

        <div className="ap-modal-field">
          <label className="ap-modal-label">Message</label>
          <textarea className="ap-modal-textarea" rows={5}
            placeholder="Votre message..."
            value={message} onChange={e => setMessage(e.target.value)} />
        </div>

        {error && <p className="ap-modal-error"><AlertTriangle size={13} /> {error}</p>}

        <div className="ap-modal-footer">
          <button className="ap-modal-cancel" onClick={onClose}>Annuler</button>
          <button className="ap-modal-confirm ap-modal-confirm--send"
            onClick={handleSend} disabled={loading}>
            {loading ? <RefreshCw size={14} className="ap-spin" /> : <Send size={14} />}
            {loading ? "Envoi..." : "Envoyer le message"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Motifs de suppression ─────────────────────────────
const MOTIFS = [
  { key: "prix",        label: "Prix non conforme" },
  { key: "categorie",   label: "Mauvaise catégorie" },
  { key: "images",      label: "Images non conformes" },
  { key: "description", label: "Description trompeuse" },
  { key: "contrefacon", label: "Suspicion de contrefaçon" },
  { key: "doublon",     label: "Produit en doublon" },
  { key: "autre",       label: "Autre motif" },
];

function DeleteProduitModal({ produit, onClose, onDone }) {
  const [motif, setMotif]   = useState("prix");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      await api.delete(`/admin/produits/${produit.id}/supprimer/`, { data: { motif, detail } });
      onDone();
    } catch (e) {
      setError(e.response?.data?.error || "Erreur serveur");
    } finally { setLoading(false); }
  };

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>
        <div className="ap-modal-header">
          <div>
            <h3 className="ap-modal-title" style={{color:"#ef4444"}}><AlertTriangle size={15}/> Supprimer le produit</h3>
            <p className="ap-modal-sub">"{produit.nom}"</p>
          </div>
          <button className="ap-modal-close" onClick={onClose}><X size={15}/></button>
        </div>

        <div className="ap-modal-field">
          <label className="ap-modal-label">Motif de suppression</label>
          <div className="ap-motifs-grid">
            {MOTIFS.map(m => (
              <button key={m.key}
                className={`ap-motif-btn${motif === m.key ? " ap-motif-btn--active" : ""}`}
                onClick={() => setMotif(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ap-modal-field">
          <label className="ap-modal-label">Détail (optionnel)</label>
          <textarea className="ap-modal-textarea" rows={2}
            placeholder="Précisez si nécessaire..."
            value={detail} onChange={e => setDetail(e.target.value)} />
        </div>

        {error && <p className="ap-modal-error"><AlertTriangle size={13}/> {error}</p>}

        <div className="ap-modal-footer">
          <button className="ap-modal-cancel" onClick={onClose}>Annuler</button>
          <button className="ap-modal-confirm" style={{background:"#ef4444"}}
            onClick={handleDelete} disabled={loading}>
            {loading ? <RefreshCw size={14} className="ap-spin"/> : <X size={14}/>}
            {loading ? "Suppression..." : "Confirmer la suppression"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProduitsTab({ toast }) {
  const [produits, setProduits]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/produits/${search ? `?search=${search}` : ""}`);
      setProduits(res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteDone = () => {
    setDeleteTarget(null);
    toast("Produit supprimé. Fournisseur notifié.");
    load();
  };

  return (
    <>
      <div className="ap-page-header">
        <h1 className="ap-page-title">Gestion des produits</h1>
        <div className="ap-search-wrap">
          <input className="ap-search" placeholder="Rechercher un produit..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <button className="ap-refresh-btn" onClick={load}><RefreshCw size={14}/></button>
        </div>
      </div>

      {loading ? (
        <div className="ap-loading" style={{minHeight:"200px"}}>
          <RefreshCw size={24} className="ap-spin"/>
        </div>
      ) : produits.length === 0 ? (
        <div className="ap-empty"><Package size={40} opacity={0.2}/><p>Aucun produit trouvé.</p></div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr>
              <th>Produit</th><th>Fournisseur</th><th>Catégorie</th>
              <th>Prix</th><th>Stock</th><th>Action</th>
            </tr></thead>
            <tbody>
              {produits.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="ap-cell-user">
                      {p.image && <img src={`http://127.0.0.1:8000${p.image}`} alt={p.nom}
                        style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>}
                      <span className="ap-cell-name">{p.nom}</span>
                    </div>
                  </td>
                  <td><span className="ap-cell-text">{p.fournisseur?.nom || "—"}</span></td>
                  <td><span className="ap-cell-sub">{p.categorie || "—"}</span></td>
                  <td><span className="ap-cell-text" style={{color:"#4db8e8"}}>{Number(p.prix).toLocaleString()} FCFA</span></td>
                  <td>
                    <span style={{color: p.stock === 0 ? "#ef4444" : p.stock <= 5 ? "#f59e0b" : "#10b981", fontWeight:600, fontSize:"0.85rem"}}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <button className="ap-delete-btn" onClick={() => setDeleteTarget(p)}>
                      <X size={13}/> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <DeleteProduitModal produit={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDone={handleDeleteDone}/>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════
function AdminPanel({ fournisseur: currentUser }) {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("dashboard");
  const [stats, setStats]       = useState(null);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [filterStatut, setFilterStatut] = useState("");
  const [loading, setLoading]   = useState(true);
  const [actionTarget, setActionTarget] = useState(null);
  const [showMessage, setShowMessage]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, fourRes] = await Promise.all([
        api.get('/admin/stats/'),
        api.get('/admin/fournisseurs/' + (filterStatut ? `?statut=${filterStatut}` : '')),
      ]);
      setStats(statsRes.data);
      setFournisseurs(fourRes.data);
    } catch (e) {
      if (e.response?.status === 403) navigate('/');
    } finally { setLoading(false); }
  }, [filterStatut]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleActionDone = () => {
    setActionTarget(null);
    showToast("Action effectuée avec succès");
    loadData();
  };

  const handleMessageDone = () => {
    setShowMessage(false);
    showToast("Message envoyé !");
  };

  if (loading && !stats) {
    return (
      <div className="ap-loading">
        <RefreshCw size={32} className="ap-spin" />
        <p>Chargement du panneau admin…</p>
      </div>
    );
  }

  return (
    <div className="ap-page">
      {/* ── Sidebar ── */}
      <aside className="ap-sidebar">
        <div className="ap-sidebar-logo">
          <Shield size={18} />
          <span>Admin <strong>CAMEBUY</strong></span>
        </div>

        <nav className="ap-sidebar-nav">
          {[
            { id: "dashboard", icon: <BarChart2 size={16} />, label: "Tableau de bord" },
            { id: "fournisseurs", icon: <Users size={16} />, label: "Fournisseurs",
              badge: stats?.fournisseurs?.en_attente || 0 },
            { id: "messages", icon: <MessageSquare size={16} />, label: "Messages" },
            { id: "produits", icon: <Package size={16} />, label: "Produits" },
          ].map(item => (
            <button key={item.id}
              className={`ap-nav-item${tab === item.id ? " ap-nav-item--active" : ""}`}
              onClick={() => setTab(item.id)}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="ap-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button className="ap-sidebar-back" onClick={() => navigate('/')}>
          <LogOut size={15} /> Retour au site
        </button>
      </aside>

      {/* ── Contenu ── */}
      <main className="ap-main">

        {/* Toast */}
        {toast && (
          <div className={`ap-toast ap-toast--${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* ══ TAB DASHBOARD ══ */}
        {tab === "dashboard" && stats && (
          <div className="ap-content">
            <div className="ap-page-header">
              <h1 className="ap-page-title">Tableau de bord</h1>
              <button className="ap-refresh-btn" onClick={loadData}>
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>

            {/* Stats fournisseurs */}
            <h2 className="ap-section-title">Fournisseurs</h2>
            <div className="ap-stats-grid">
              <StatCard icon={<Clock size={20} />}    label="En attente"  value={stats.fournisseurs.en_attente} color="#f59e0b" sub="À valider" />
              <StatCard icon={<CheckCircle size={20} />} label="Validés"  value={stats.fournisseurs.valides}    color="#10b981" />
              <StatCard icon={<XCircle size={20} />}  label="Refusés"    value={stats.fournisseurs.refuses}    color="#ef4444" />
              <StatCard icon={<Ban size={20} />}      label="Suspendus"  value={stats.fournisseurs.suspendus}  color="#8b5cf6" />
            </div>

            {/* Stats commandes */}
            <h2 className="ap-section-title">Commandes & Produits</h2>
            <div className="ap-stats-grid ap-stats-grid--3">
              <StatCard icon={<ShoppingCart size={20} />} label="Commandes totales"   value={stats.commandes.total}          color="#4db8e8" />
              <StatCard icon={<Package size={20} />}      label="Produits publiés"    value={stats.produits.total}           color="#0b2239" />
              <StatCard icon={<AlertTriangle size={20} />} label="Stocks à surveiller" value={stats.produits.stock_faible + stats.produits.rupture} color="#f59e0b" sub={`${stats.produits.rupture} en rupture`} />
            </div>

            {/* Fournisseurs en attente */}
            {stats.fournisseurs.en_attente > 0 && (
              <div className="ap-alert">
                <Clock size={16} />
                <span>
                  <strong>{stats.fournisseurs.en_attente} fournisseur(s)</strong> attendent votre validation.
                </span>
                <button className="ap-alert-btn" onClick={() => { setTab("fournisseurs"); setFilterStatut("en_attente"); }}>
                  Voir maintenant →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB FOURNISSEURS ══ */}
        {tab === "fournisseurs" && (
          <div className="ap-content">
            <div className="ap-page-header">
              <h1 className="ap-page-title">Gestion des fournisseurs</h1>
              <button className="ap-refresh-btn" onClick={loadData}>
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>

            {/* Filtres */}
            <div className="ap-filters">
              <Filter size={14} />
              {["", "en_attente", "valide", "refuse", "suspendu"].map(s => (
                <button key={s}
                  className={`ap-filter-btn${filterStatut === s ? " active" : ""}`}
                  onClick={() => setFilterStatut(s)}>
                  {s === "" ? "Tous" : STATUT_META[s]?.label}
                </button>
              ))}
            </div>

            {/* Liste */}
            {fournisseurs.length === 0 ? (
              <div className="ap-empty">
                <Users size={40} opacity={0.2} />
                <p>Aucun fournisseur dans cette catégorie.</p>
              </div>
            ) : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Fournisseur</th>
                      <th>Contact</th>
                      <th>Inscription</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fournisseurs.map(f => (
                      <tr key={f.id} className={f.statut === 'en_attente' ? 'ap-row--highlight' : ''}>
                        <td>
                          <div className="ap-cell-user">
                            <div className="ap-cell-avatar">
                              {f.photo
                                ? <img src={f.photo} alt={f.nom} />
                                : <span>{f.nom?.[0]?.toUpperCase()}</span>
                              }
                            </div>
                            <div>
                              <p className="ap-cell-name">{f.nom}</p>
                              <p className="ap-cell-sub">@{f.username}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="ap-cell-text">{f.email}</p>
                          {f.telephone && <p className="ap-cell-sub">{f.telephone}</p>}
                        </td>
                        <td>
                          <p className="ap-cell-text">
                            {new Date(f.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="ap-cell-sub">{f.produits_count} produit(s)</p>
                        </td>
                        <td><StatutBadge statut={f.statut} /></td>
                        <td>
                          <button className="ap-action-trigger"
                            onClick={() => setActionTarget(f)}>
                            <Eye size={13} /> Gérer <ChevronDown size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB MESSAGES ══ */}
        {tab === "messages" && (
          <div className="ap-content">
            <div className="ap-page-header">
              <h1 className="ap-page-title">Envoyer des messages</h1>
              <button className="ap-compose-btn" onClick={() => setShowMessage(true)}>
                <Send size={14} /> Nouveau message
              </button>
            </div>
            <div className="ap-messages-info">
              <div className="ap-info-card">
                <MessageSquare size={22} style={{color:"#4db8e8"}} />
                <div>
                  <h3>Messages directs aux fournisseurs</h3>
                  <p>Envoyez des notifications importantes, annonces ou informations à tous vos fournisseurs validés ou à une sélection.</p>
                </div>
              </div>
              <div className="ap-info-card">
                <Bell size={22} style={{color:"#f59e0b"}} />
                <div>
                  <h3>Réception dans les notifications</h3>
                  <p>Les fournisseurs reçoivent vos messages directement dans leur page <strong>/notifications</strong> sur le site.</p>
                </div>
              </div>
            </div>
            <div style={{textAlign:"center", padding:"20px 0"}}>
              <button className="ap-compose-btn" onClick={() => setShowMessage(true)}>
                <Send size={14} /> Écrire un message
              </button>
            </div>
          </div>
        )}

        {/* ══ TAB PRODUITS ══ */}
        {tab === "produits" && (
          <ProduitsTab toast={showToast} />
        )}
      </main>

      {/* ── Modals ── */}
      {actionTarget && (
        <ActionModal
          fournisseur={actionTarget}
          onClose={() => setActionTarget(null)}
          onDone={handleActionDone}
        />
      )}

      {showMessage && (
        <MessageModal
          fournisseurs={fournisseurs}
          onClose={() => setShowMessage(false)}
          onDone={handleMessageDone}
        />
      )}
    </div>
  );
}

export default AdminPanel;
