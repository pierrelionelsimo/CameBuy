import {
  createContext, useState, useContext,
  useCallback, useEffect, useRef
} from "react";
import api from "../services/api";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // ── Notifications API (fournisseur connecté) ──────────
  const [apiNotifs, setApiNotifs]   = useState([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // ── Notifications in-memory (events frontend : paiement, etc.) ──
  const [localNotifs, setLocalNotifs] = useState([]);

  // Ref pour éviter les appels multiples simultanés
  const fetchingRef = useRef(false);

  // ── Charger les notifications depuis l'API ────────────
  const fetchApiNotifs = useCallback(async () => {
    const token      = localStorage.getItem("access");
    const isAdmin    = localStorage.getItem("is_admin") === "true";
    const fournisseur = localStorage.getItem("fournisseur");

    // Ne charger que si : token présent + pas admin + profil fournisseur
    if (!token || isAdmin || !fournisseur) return;
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoadingApi(true);
    try {
      const res = await api.get("/notifications/");
      // Normaliser le format API → format interne
      const normalized = res.data.map((n) => ({
        id:        n.id,
        titre:     n.titre,
        message:   n.message,
        type:      mapTypeNotif(n.type_notif),
        type_notif: n.type_notif,
        role:      "fournisseur",
        read:      n.lu,
        timestamp: new Date(n.cree_le),
        from:      n.expediteur_nom,
        source:    "api",  // distinguer des notifs locales
      }));
      setApiNotifs(normalized);
    } catch (e) {
      // 404 = pas de profil fournisseur, silencieux
      if (e.response?.status !== 404) {
        console.warn("[NotificationContext] Fetch error:", e.message);
      }
    } finally {
      setLoadingApi(false);
      fetchingRef.current = false;
    }
  }, []);

  // Mapping type Django → type interne
  const mapTypeNotif = (type_notif) => {
    const map = {
      message:    "info",
      validation: "success",
      commande:   "warning",
      stock:      "error",
      info:       "info",
    };
    return map[type_notif] || "info";
  };

  // ── Polling : recharger toutes les 30s ────────────────
  useEffect(() => {
    fetchApiNotifs();
    const interval = setInterval(fetchApiNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchApiNotifs]);

  // ── Recharger quand l'utilisateur change (login/logout) ──
  useEffect(() => {
    const handleStorage = () => {
      const fournisseur = localStorage.getItem("fournisseur");
      if (!fournisseur) {
        setApiNotifs([]); // Vider si déconnexion
      } else {
        fetchApiNotifs();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchApiNotifs]);

  // ── Ajouter une notif locale (paiement, event frontend) ──
  const addNotification = useCallback((notif) => {
    const newNotif = {
      id:        `local-${Date.now()}-${Math.random()}`,
      type:      "info",
      role:      "all",
      read:      false,
      timestamp: new Date(),
      source:    "local",
      ...notif,
    };
    setLocalNotifs((prev) => [newNotif, ...prev].slice(0, 20));
  }, []);

  // ── Marquer une notif comme lue ───────────────────────
  const markRead = useCallback(async (id) => {
    // Notif API
    if (typeof id === "number" || !String(id).startsWith("local-")) {
      try {
        await api.patch(`/notifications/${id}/lu/`);
        setApiNotifs((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      } catch (e) {
        console.warn("[NotificationContext] markRead error:", e.message);
      }
    } else {
      // Notif locale
      setLocalNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  }, []);

  // ── Marquer toutes comme lues ─────────────────────────
  const markAllRead = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (token && localStorage.getItem("fournisseur")) {
      try {
        await api.patch("/notifications/lire-tout/");
        setApiNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (e) {
        console.warn("[NotificationContext] markAllRead error:", e.message);
      }
    }
    setLocalNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setLocalNotifs([]);
  }, []);

  // ── Combiner API + local ──────────────────────────────
  const allNotifs = [
    ...apiNotifs,
    ...localNotifs,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // ── Filtrer par rôle ──────────────────────────────────
  const getForRole = useCallback(
    (role) => allNotifs.filter(
      (n) => n.role === "all" || n.role === role
    ),
    [allNotifs]
  );

  const unreadCount = useCallback(
    (role) => getForRole(role).filter((n) => !n.read).length,
    [getForRole]
  );

  // ── Forcer un rechargement (appelable depuis l'extérieur) ──
  const refresh = useCallback(() => {
    fetchApiNotifs();
  }, [fetchApiNotifs]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: allNotifs,
        apiNotifs,
        localNotifs,
        loadingApi,
        addNotification,
        markAllRead,
        markRead,
        clearAll,
        getForRole,
        unreadCount,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
