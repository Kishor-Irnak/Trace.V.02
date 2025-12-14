import { ref, push, update, remove, onValue, off } from "firebase/database";
import { db } from "./firebase";
import { authService } from "./authService";

/* ================= HELPERS ================= */

const getBasePath = () => {
  const uid = authService.getUID();
  if (!uid) throw new Error("AUTH_NOT_READY");
  return `users/${uid}/leads`;
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
  /* -------- CRUD -------- */

  addLead(lead: any) {
    return push(ref(db, getBasePath()), lead);
  },

  updateLead(id: string, data: any) {
    return update(ref(db, `${getBasePath()}/${id}`), data);
  },

  deleteLead(id: string) {
    return remove(ref(db, `${getBasePath()}/${id}`));
  },

  /* -------- REALTIME -------- */

  subscribeLeads(callback: (leads: any[]) => void) {
    const leadsRef = ref(db, getBasePath());

    const handler = (snap: any) => {
      callback(mapSnapshot(snap));
    };

    onValue(leadsRef, handler);
    return () => off(leadsRef, "value", handler);
  },

  /* 🔥 BACKWARD COMPATIBILITY (THIS FIXES YOUR ERROR) */
  subscribe(callback: (leads: any[]) => void) {
    return crmService.subscribeLeads(callback);
  },
};
