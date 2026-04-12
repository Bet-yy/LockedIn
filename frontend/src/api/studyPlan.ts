import { apiClient } from './client';
import type { ResourceItem, StudyPlanResponse } from '../types/studyPlan';

export async function generateStudyPlan(courseId: string, weeksAvailable = 15) {
  const { data } = await apiClient.post<StudyPlanResponse>('/api/study-plan/generate', {
    course_id: courseId,
    weeks_available: weeksAvailable,
  });

  return data;
}

export async function getStudyPlan(courseId: string) {
  const { data } = await apiClient.get<StudyPlanResponse>(`/api/study-plan/${courseId}`);
  return data;
}

export async function generateResources(courseId: string, topic?: string) {
  const { data } = await apiClient.post<ResourceItem[]>('/api/resources/generate', {
    course_id: courseId,
    topic,
  });

  return data;
}

export async function getResources(courseId: string) {
  const { data } = await apiClient.get<ResourceItem[]>(`/api/resources/${courseId}`);
  return data;
}
