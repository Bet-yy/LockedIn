import { create } from 'zustand';
import type { Task } from '../types/task';

interface TaskStoreState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  upsertTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks.filter((item) => item.id !== task.id)],
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((item) => item.id !== taskId),
    })),
}));
