// services/projectService.ts

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  value: number;
  assignees: string[]; // ✅ FIX: must exist
};

type TasksListener = (tasks: Task[]) => void;
type ProjectNameListener = (name: string) => void;

class ProjectService {
  private tasks: Task[] = [];
  private projectName = "Q4 Engineering Sprint";

  private taskListeners: TasksListener[] = [];
  private projectNameListeners: ProjectNameListener[] = [];

  constructor() {
    // ✅ Load from localStorage
    const storedTasks = localStorage.getItem("tasks");
    const storedProjectName = localStorage.getItem("projectName");

    this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    this.projectName = storedProjectName || this.projectName;
  }

  /* -------------------- Helpers -------------------- */

  private notifyTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
    this.taskListeners.forEach((cb) => cb(this.tasks));
  }

  private notifyProjectName() {
    localStorage.setItem("projectName", this.projectName);
    this.projectNameListeners.forEach((cb) => cb(this.projectName));
  }

  /* -------------------- Subscriptions -------------------- */

  subscribeTasks(callback: TasksListener) {
    this.taskListeners.push(callback);
    callback(this.tasks);

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

  /* -------------------- Project -------------------- */

  async updateProjectName(name: string) {
    this.projectName = name;
    this.notifyProjectName();
  }

  /* -------------------- Tasks CRUD -------------------- */

  async addTask(task: Omit<Task, "id">) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: task.title,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      value: task.value ?? 0,
      assignees: Array.isArray(task.assignees) ? task.assignees : [], // ✅ FIX
    };

    this.tasks.push(newTask);
    this.notifyTasks();
  }

  async updateTask(id: string, updates: Partial<Task>) {
    this.tasks = this.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            ...updates,
            assignees: Array.isArray(updates.assignees)
              ? updates.assignees
              : task.assignees, // ✅ FIX: preserve assignees
          }
        : task
    );

    this.notifyTasks();
  }

  async deleteTask(id: string) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.notifyTasks();
  }
}

export const projectService = new ProjectService();
