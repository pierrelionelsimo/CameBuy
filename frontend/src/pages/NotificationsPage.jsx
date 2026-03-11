import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Bell, BellOff, CheckCheck, MessageSquare,
  ShieldCheck, ShoppingBag, AlertTriangle,
  RefreshCw, ArrowLeft, Clock, Inbox
} from "lucide-react";
import "./NotificationsPage.css";

// ── Icône + couleur par type ──────────────────────────────
const TYPE_META = {
  message:    { icon: <MessageSquare size={16} />, color: "#4db8e8",  label: "Message admin" },
  validation: { icon: <ShieldCheck size={16} />,   color: "#10b981",  label: "Validation" },
  commande:   { icon: <ShoppingBag size={16} />,   color: "#f59e0b",  label: "Commande" },
  stock:      { icon: <AlertTriangle size={16} />, color: "#ef4444",  label: "Stock" },
  info:       { icon: <Bell size={16} />,           color: "#8b5cf6",  label: "Info" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d} jour${d > 1 ? "s" : ""}`;
}

function NotifCard({ notif, onMarkRead }) {
  const meta = TYPE_META[notif.type_notif] || TYPE_META.info;
  const lines = notif.message.split('\n');

  return (
    <div
      className={`np-card${notif.lu ? " np-card--read" : ""}`}
      style={{ "--nc": meta.color }}
      onClick={() => !notif.lu && onMarkRead(notif.id)}
    >
      {/* Barre colorée gauche */}
      <div className="np-card-bar" />

      {/* Icône */}
      <div className="np-card-icon">{meta.icon}</div>

      {/* Contenu */}
      <div className="np-card-body">
        <div className="np-card-header">
          <span className="np-card-type">{meta.label}</span>
          <div className="np-card-time">
            <Clock size={11} />
            <span>{timeAgo(notif.cree_le)}</span>
          </div>
        </div>
        <h3 className="np-card-title">{notif.titre}</h3>
        <div className="np-card-msg">
          {lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {notif.expediteur_nom && (
          <span className="np-card-from">De : {notif.expediteur_nom}</span>
        )}
      </div>

      {/* Dot non-lu */}
      {!notif.lu && <span className="np-unread-dot" title="Non lu" />}
    </div>
  );
}

function NotificationsPage({ fournisseur }) {
  const navigate  = useNavigate();
  const [notifs, setNotifs]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [marking, setMarking]   = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifs(res.data);
    } catch (e) {
      if (e.response?.status === 404) {
        // Fournisseur non trouvé côté Django
        setNotifs([]);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Polling toutes les 30 secondes
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/lu/`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.patch('/notifications/lire-tout/');
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (e) { console.error(e); }
    finally { setMarking(false); }
  };

  const filtered = filter === "all"
    ? notifs
    : filter === "unread"
    ? notifs.filter(n => !n.lu)
    : notifs.filter(n => n.type_notif === filter);

  const unreadCount = notifs.filter(n => !n.lu).length;

  const FILTERS = [
    { id: "all",     label: "Toutes" },
    { id: "unread",  label: `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { id: "message",    label: "Messages" },
    { id: "validation", label: "Validation" },
    { id: "commande",   label: "Commandes" },
    { id: "stock",      label: "Stock" },
  ];

  return (
    <div className="np-page">
      {/* ── Header ── */}
      <div className="np-header">
        <button className="np-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>

        <div className="np-header-title">
          <Bell size={20} />
          <div>
            <h1>Mes notifications</h1>
            {unreadCount > 0 && (
              <span className="np-header-badge">{unreadCount} non lu{unreadCount > 1 ? "es" : "e"}</span>
            )}
          </div>
        </div>

        <div className="np-header-actions">
          <button className="np-icon-btn" onClick={load} title="Actualiser">
            <RefreshCw size={15} className={loading ? "np-spin" : ""} />
          </button>
          {unreadCount > 0 && (
            <button className="np-read-all" onClick={markAllRead} disabled={marking}>
              <CheckCheck size={14} />
              {marking ? "..." : "Tout marquer lu"}
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="np-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`np-filter${filter === f.id ? " np-filter--active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Contenu ── */}
      <div className="np-content">
        {loading ? (
          <div className="np-loading">
            <RefreshCw size={28} className="np-spin" />
            <p>Chargement…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="np-empty">
            {unreadCount === 0 ? (
              <>
                <BellOff size={48} />
                <h3>Aucune notification</h3>
                <p>Vous n'avez pas encore de notifications. Elles apparaîtront ici dès qu'il se passe quelque chose.</p>
              </>
            ) : (
              <>
                <Inbox size={48} />
                <h3>Aucune notification dans ce filtre</h3>
                <button className="np-filter np-filter--active" onClick={() => setFilter("all")}>
                  Voir toutes
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="np-list">
            {/* Grouper par date */}
            {filtered.map((notif) => (
              <NotifCard key={notif.id} notif={notif} onMarkRead={markRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
