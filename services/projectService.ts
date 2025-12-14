import {
  ref,
  push,
  update,
  remove,
  onValue,
  off,
  DataSnapshot,
} from "firebase/database";
import { db } from "./firebase";
import { authService } from "./authService";

/* ================= TYPES ================= */

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  value: number;
  assignees: string[];
}

/* ================= HELPERS ================= */

const getUserBasePath = () => {
  const uid = authService.getUID();
  if (!uid) throw new Error("User not authenticated");
  return `users/${uid}`;
};

const mapSnapshotToArray = <T>(snapshot: DataSnapshot): T[] => {
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, value]) => ({
    id,
    ...(value as any),
  }));
};

/* ================= SERVICE ================= */

export const projectService = {
  /* ---------- TASKS ---------- */

  async addTask(task: Omit<Task, "id">) {
    const basePath = getUserBasePath();
    const taskRef = ref(db, `${basePath}/tasks`);
    await push(taskRef, task);
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const basePath = getUserBasePath();
    await update(ref(db, `${basePath}/tasks/${taskId}`), updates);
  },

  async deleteTask(taskId: string) {
    const basePath = getUserBasePath();
    await remove(ref(db, `${basePath}/tasks/${taskId}`));
  },

  /**
   * 🔴 REALTIME TASK SUBSCRIPTION
   * Used in ProjectManager.tsx
   */
  subscribeTasks(callback: (tasks: Task[]) => void) {
    const basePath = getUserBasePath();
    const tasksRef = ref(db, `${basePath}/tasks`);

    const handler = (snapshot: DataSnapshot) => {
      const tasks = mapSnapshotToArray<Task>(snapshot);
      callback(tasks);
    };

    onValue(tasksRef, handler);

    return () => off(tasksRef, "value", handler);
  },

  /* ---------- PROJECT NAME ---------- */

  async updateProjectName(name: string) {
    const basePath = getUserBasePath();
    await update(ref(db, `${basePath}/meta`), {
      projectName: name,
    });
  },

  /**
   * 🔴 REALTIME PROJECT NAME SUBSCRIPTION
   */
  subscribeProjectName(callback: (name: string) => void) {
    const basePath = getUserBasePath();
    const metaRef = ref(db, `${basePath}/meta`);

    const handler = (snapshot: DataSnapshot) => {
      const val = snapshot.val();
      callback(val?.projectName || "My Project");
    };

    onValue(metaRef, handler);

    return () => off(metaRef, "value", handler);
  },
};
