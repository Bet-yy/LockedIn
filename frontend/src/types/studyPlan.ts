export interface ParseSyllabusResponse {
  course_id: string;
  syllabus_parsed: unknown;
}

export interface StudyPlanWeek {
  week: number;
  topic: string;
  daily_tasks: string[];
  estimated_hours: number;
}

export interface StudyPlanResponse {
  course_id: string;
  plan_content: StudyPlanWeek[];
  generated_at?: string | null;
}

export interface ResourceItem {
  resource_type: 'video' | 'article' | 'practice';
  title: string;
  url: string | null;
  description: string | null;
}
