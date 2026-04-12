import { apiClient } from './client';
import type { Task, TaskPayload } from '../types/task';

export async function listTasks(courseId?: string) {
  const { data } = await apiClient.get<Task[]>('/api/tasks', {
    params: {
      course_id: courseId,
    },
  });

  return data;
}

export async function createTask(payload: TaskPayload) {
  const { data } = await apiClient.post<Task>('/api/tasks', payload);
  return data;
}

export async function updateTask(taskId: string, payload: Partial<TaskPayload> & { completed?: boolean }) {
  const { data } = await apiClient.patch<Task>(`/api/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId: string) {
  const { data } = await apiClient.delete<{ deleted: string }>(`/api/tasks/${taskId}`);
  return data;
}
