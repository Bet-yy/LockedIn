import { create } from 'zustand';
import type { Task } from '../types/task';

export type TaskFilter = 'all' | 'completed' | 'due_today' | 'course';

interface TaskStoreState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  activeFilter: TaskFilter;
  selectedCourseId: string;
  setTasks: (tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setActiveFilter: (value: TaskFilter) => void;
  setSelectedCourseId: (value: string) => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  activeFilter: 'all',
  selectedCourseId: '',
  setTasks: (tasks) => set({ tasks }),
  upsertTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks.filter((item) => item.id !== task.id)],
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((item) => item.id !== taskId),
    })),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (value) => set({ error: value }),
  setActiveFilter: (value) => set({ activeFilter: value }),
  setSelectedCourseId: (value) => set({ selectedCourseId: value }),
}));
