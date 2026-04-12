import { apiClient } from './client';
import type { CourseSearchResult, SavedCourse } from '../types/course';

export async function searchCourses(query: string, semester?: string) {
  const { data } = await apiClient.get<CourseSearchResult[]>('/api/courses/search', {
    params: {
      q: query,
      semester,
    },
  });

  return data;
}

export async function getCourse(courseId: string) {
  const { data } = await apiClient.get<CourseSearchResult>(`/api/courses/${courseId}`);
  return data;
}

export async function getSavedCourses() {
  const { data } = await apiClient.get<SavedCourse[]>('/api/courses/saved');
  return data;
}

export async function saveCourse(course: CourseSearchResult) {
  const { data } = await apiClient.post<SavedCourse>('/api/courses/save', course);
  return data;
}
