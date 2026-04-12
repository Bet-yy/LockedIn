export interface CourseSearchResult {
  nebula_course_id: string;
  course_name: string;
  course_number: string;
  professor: string | null;
  semester: string | null;
  syllabus_url: string | null;
}

export interface SavedCourse {
  id: string;
  nebula_course_id: string;
  course_name: string;
  course_number: string;
  professor: string | null;
  semester: string | null;
  syllabus_raw: string | null;
  syllabus_parsed: unknown;
  created_at: string | null;
}

export function isSavedCourse(course: CourseSearchResult | SavedCourse | null): course is SavedCourse {
  return Boolean(course && 'id' in course);
}
