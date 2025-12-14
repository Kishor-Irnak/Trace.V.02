import { ref, push, update, remove, onValue, off } from "firebase/database";
import { db } from "./firebase";
import { authService } from "./authService";

/* ================= HELPERS ================= */

const getBasePath = () => {
  const uid = authService.getUID();
  if (!uid) throw new Error("AUTH_NOT_READY");
  return `users/${uid}/leads`;
};

const getSettingsPath = () => {
  const uid = authService.getUID();
  if (!uid) throw new Error("AUTH_NOT_READY");
  return `users/${uid}/settings`;
};

const mapSnapshot = (snap: any) => {
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, value]) => ({
    id,
    ...(value as any),
  }));
};

/* ================= SERVICE ================= */

export const crmService = {
  /* -------- CRUD LEADS -------- */

  addLead(lead: any) {
    return push(ref(db, getBasePath()), lead);
  },

  updateLead(id: string, data: any) {
    return update(ref(db, `${getBasePath()}/${id}`), data);
  },

  deleteLead(id: string) {
    return remove(ref(db, `${getBasePath()}/${id}`));
  },

  /* -------- SETTINGS (ROLES) -------- */

  async saveUserRole(role: string) {
    const settingsRef = ref(db, getSettingsPath());
    await update(settingsRef, { role });
  },

  subscribeSettings(callback: (settings: any) => void) {
    // Wait for auth to be ready if needed, usually handled in component
    try {
      const settingsRef = ref(db, getSettingsPath());
      const handler = (snap: any) => {
        callback(snap.val() || {});
      };
      onValue(settingsRef, handler);
      return () => off(settingsRef, "value", handler);
    } catch (e) {
      return () => {};
    }
  },

  /* -------- REALTIME LEADS -------- */

  subscribeLeads(callback: (leads: any[]) => void) {
    const leadsRef = ref(db, getBasePath());

    const handler = (snap: any) => {
      callback(mapSnapshot(snap));
    };

    onValue(leadsRef, handler);
    return () => off(leadsRef, "value", handler);
  },

  subscribe(callback: (leads: any[]) => void) {
    return crmService.subscribeLeads(callback);
  },
};
