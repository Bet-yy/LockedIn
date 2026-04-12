import { create } from 'zustand';
import type { CourseSearchResult, SavedCourse } from '../types/course';

interface CourseStoreState {
  searchResults: CourseSearchResult[];
  selectedCourse: CourseSearchResult | SavedCourse | null;
  savedCourses: SavedCourse[];
  setSearchResults: (results: CourseSearchResult[]) => void;
  setSelectedCourse: (course: CourseSearchResult | SavedCourse | null) => void;
  setSavedCourses: (courses: SavedCourse[]) => void;
  upsertSavedCourse: (course: SavedCourse) => void;
}

export const useCourseStore = create<CourseStoreState>((set) => ({
  searchResults: [],
  selectedCourse: null,
  savedCourses: [],
  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSavedCourses: (courses) => set({ savedCourses: courses }),
  upsertSavedCourse: (course) =>
    set((state) => ({
      savedCourses: [course, ...state.savedCourses.filter((item) => item.id !== course.id)],
      selectedCourse: course,
    })),
}));
