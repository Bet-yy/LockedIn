export interface ParseSyllabusResponse {
  course_id: string;
  syllabus_parsed: unknown;
}

export interface SyllabusTopicWeek {
  week: number | string;
  topic: string;
}

export interface SyllabusExamDate {
  name: string;
  date: string;
}

export interface ParsedSyllabusData {
  topics_by_week?: SyllabusTopicWeek[];
  exam_dates?: SyllabusExamDate[];
  assignments?: string[] | Record<string, string>;
  grading_breakdown?: Record<string, string>;
  course_description?: string;
  [key: string]: unknown;
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
  id?: string;
  resource_type: 'video' | 'article' | 'practice';
  title: string;
  url: string | null;
  description: string | null;
}
