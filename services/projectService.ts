// services/projectService.ts
import { auth } from "./firebase";

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  value: number;
  assignees: string[];
  userId: string; // 🔐 owner
};

type TasksListener = (tasks: Task[]) => void;
type ProjectNameListener = (name: string) => void;

class ProjectService {
  private tasks: Task[] = [];
  private projectName = "My Tasks";

  private taskListeners: TasksListener[] = [];
  private projectNameListeners: ProjectNameListener[] = [];

  constructor() {
    const storedTasks = localStorage.getItem("tasks");
    const storedProjectName = localStorage.getItem("projectName");

    this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    this.projectName = storedProjectName || this.projectName;
  }

  /* -------------------- helpers -------------------- */

  private emitTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));

    const user = auth.currentUser;
    const userTasks = user
      ? this.tasks.filter((t) => t.userId === user.uid)
      : [];

    this.taskListeners.forEach((cb) => cb(userTasks));
  }

  private emitProjectName() {
    localStorage.setItem("projectName", this.projectName);
    this.projectNameListeners.forEach((cb) => cb(this.projectName));
  }

  /* -------------------- subscriptions -------------------- */

  subscribeTasks(callback: TasksListener) {
    this.taskListeners.push(callback);

    const user = auth.currentUser;
    const userTasks = user
      ? this.tasks.filter((t) => t.userId === user.uid)
      : [];

    callback(userTasks);

    return () => {
      this.taskListeners = this.taskListeners.filter((cb) => cb !== callback);
    };
  }

  subscribeProjectName(callback: ProjectNameListener) {
    this.projectNameListeners.push(callback);
    callback(this.projectName);

    return () => {
      this.projectNameListeners = this.projectNameListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  /* -------------------- project -------------------- */

  async updateProjectName(name: string) {
    this.projectName = name;
    this.emitProjectName();
  }

  /* -------------------- CRUD -------------------- */

  async addTask(task: Omit<Task, "id" | "userId">) {
    const user = auth.currentUser;
    if (!user) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: task.title,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      value: task.value ?? 0,
      assignees: task.assignees ?? [],
      userId: user.uid, // ✅ KEY FIX
    };

    this.tasks.push(newTask);
    this.emitTasks();
  }

  async updateTask(id: string, updates: Partial<Task>) {
    const user = auth.currentUser;
    if (!user) return;

    this.tasks = this.tasks.map((task) =>
      task.id === id && task.userId === user.uid
        ? { ...task, ...updates }
        : task
    );

    this.emitTasks();
  }

  async deleteTask(id: string) {
    const user = auth.currentUser;
    if (!user) return;

    this.tasks = this.tasks.filter(
      (task) => !(task.id === id && task.userId === user.uid)
    );

    this.emitTasks();
  }

  /* -------------------- logout cleanup -------------------- */

  clearUserTasks() {
    this.emitTasks(); // re-filter tasks for new user
  }
}

export const projectService = new ProjectService();
