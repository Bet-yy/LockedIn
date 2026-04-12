export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string | null;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  priority: TaskPriority | null;
  created_at: string | null;
}

export interface TaskPayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority | null;
  course_id?: string | null;
}
