import { useState, useContext } from "react";
import { MessageCircle, X, Send, Bell, Mail, User, CheckCheck } from "lucide-react";
import { NotificationContext } from "../contexts/NotificationContext";
import { ThemeContext } from "../contexts/ThemeContext";
import "./FloatingWidgets.css";

const WHATSAPP_NUMBER = "237679372241";

// ─── Notification Bell (intégré dans le Header) ───────────
export function NotificationBell({ fournisseur }) {
  const { getForRole, markAllRead, markRead, unreadCount } = useContext(NotificationContext);
  const { t } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  const role = fournisseur ? "fournisseur" : "client";
  const notifs = getForRole(role);
  const count = unreadCount(role);

  const typeIcons = { success: "✅", warning: "⚠️", error: "❌", info: "💬" };
  const typeIcon = (type) => typeIcons[type] || "🔔";

  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `${diff} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="nb-wrap">
      <button className="nb-btn" onClick={() => setOpen((v) => !v)} title={t("notifications")}>
        <Bell size={20} />
        {count > 0 && <span className="nb-badge">{count > 9 ? "9+" : count}</span>}
      </button>

      {open && (
        <>
          <div className="nb-backdrop" onClick={() => setOpen(false)} />
          <div className="nb-dropdown">
            <div className="nb-head">
              <span className="nb-title">{t("notifications")}</span>
              {count > 0 && (
                <button className="nb-read-all" onClick={markAllRead}>
                  <CheckCheck size={13} /> {t("markAllRead")}
                </button>
              )}
            </div>
            <div className="nb-list">
              {notifs.length === 0 ? (
                <div className="nb-empty">
                  <Bell size={30} opacity={0.25} />
                  <p>{t("noNotifications")}</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`nb-item${!n.read ? " nb-item--unread" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className="nb-item-icon">{typeIcon(n.type)}</span>
                    <div className="nb-item-body">
                      <p className="nb-item-title">{n.titre || n.message}</p>
                      {n.titre && (
                        <p className="nb-item-msg">{n.message?.split("\n")[0]}</p>
                      )}
                      <span className="nb-item-time">{formatTime(n.timestamp)}</span>
                    </div>
                    {!n.read && <span className="nb-dot" />}
                  </div>
                ))
              )}
            </div>
            <div className="nb-footer">
              <a href="/notifications" className="nb-see-all" onClick={() => setOpen(false)}>
                Voir toutes les notifications →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── WhatsApp Floating Button ─────────────────────────────
export function WhatsAppButton() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide sur CAMEBUY 🛍️")}`;
  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="wa-btn" title="Aide sur WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="wa-label">Support</span>
    </a>
  );
}

// ─── Contact Widget ───────────────────────────────────────
export function ContactWidget() {
  const { t } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Tous les champs sont requis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 1200)); // remplacer par api.post("/contact/", form)
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Erreur d'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cw-wrap">
      <button
        className="cw-toggle"
        onClick={() => { setOpen((v) => !v); setSent(false); setError(""); }}
        title={t("contactTitle")}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="cw-panel">
          <div className="cw-head">
            <span className="cw-title">{t("contactTitle")}</span>
            <button className="cw-close" onClick={() => setOpen(false)}><X size={15} /></button>
          </div>

          {sent ? (
            <div className="cw-success">
              <span>✅</span>
              <p>{t("contactSuccess")}</p>
              <p className="cw-success-sub">Nous vous répondons sous 24h.</p>
              <button className="cw-new-msg" onClick={() => setSent(false)}>Nouveau message</button>
            </div>
          ) : (
            <div className="cw-body">
              <div className="cw-field">
                <User size={13} /><input name="name" placeholder={t("contactName")} value={form.name} onChange={handleChange} />
              </div>
              <div className="cw-field">
                <Mail size={13} /><input name="email" type="email" placeholder={t("contactEmail")} value={form.email} onChange={handleChange} />
              </div>
              <textarea name="message" className="cw-textarea" placeholder={t("contactMessage")} value={form.message} onChange={handleChange} rows={4} />
              {error && <p className="cw-error">{error}</p>}
              <button className="cw-send-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="cw-loading">Envoi...</span> : <><Send size={14} /> {t("contactSend")}</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
