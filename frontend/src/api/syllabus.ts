import { apiClient } from './client';
import type { ParseSyllabusResponse } from '../types/studyPlan';

export async function parseSyllabus(courseId: string, rawText?: string) {
  const { data } = await apiClient.post<ParseSyllabusResponse>('/api/syllabus/parse', {
    course_id: courseId,
    raw_text: rawText,
  });

  return data;
}

export async function getSyllabus(courseId: string) {
  const { data } = await apiClient.get<ParseSyllabusResponse>(`/api/syllabus/${courseId}`);
  return data;
}
