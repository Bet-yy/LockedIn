import { create } from 'zustand';
import type { CourseSearchResult, SavedCourse } from '../types/course';
import type { ParseSyllabusResponse, ResourceItem, StudyPlanResponse } from '../types/studyPlan';

interface CourseStoreState {
  searchResults: CourseSearchResult[];
  selectedCourse: CourseSearchResult | SavedCourse | null;
  savedCourses: SavedCourse[];
  isSearching: boolean;
  searchError: string | null;
  lastQuery: string;
  syllabusByCourseId: Record<string, ParseSyllabusResponse | null>;
  studyPlanByCourseId: Record<string, StudyPlanResponse | null>;
  resourcesByCourseId: Record<string, ResourceItem[]>;
  syllabusLoadingByCourseId: Record<string, boolean>;
  studyPlanLoadingByCourseId: Record<string, boolean>;
  resourcesLoadingByCourseId: Record<string, boolean>;
  syllabusErrorByCourseId: Record<string, string | null>;
  studyPlanErrorByCourseId: Record<string, string | null>;
  resourcesErrorByCourseId: Record<string, string | null>;
  setSearchResults: (results: CourseSearchResult[]) => void;
  setSelectedCourse: (course: CourseSearchResult | SavedCourse | null) => void;
  setSavedCourses: (courses: SavedCourse[]) => void;
  upsertSavedCourse: (course: SavedCourse) => void;
  removeSavedCourse: (courseId: string) => void;
  setIsSearching: (value: boolean) => void;
  setSearchError: (value: string | null) => void;
  setLastQuery: (value: string) => void;
  setSyllabus: (courseId: string, syllabus: ParseSyllabusResponse | null) => void;
  setStudyPlan: (courseId: string, plan: StudyPlanResponse | null) => void;
  setResources: (courseId: string, resources: ResourceItem[]) => void;
  setSyllabusLoading: (courseId: string, value: boolean) => void;
  setStudyPlanLoading: (courseId: string, value: boolean) => void;
  setResourcesLoading: (courseId: string, value: boolean) => void;
  setSyllabusError: (courseId: string, value: string | null) => void;
  setStudyPlanError: (courseId: string, value: string | null) => void;
  setResourcesError: (courseId: string, value: string | null) => void;
}

export const useCourseStore = create<CourseStoreState>((set) => ({
  searchResults: [],
  selectedCourse: null,
  savedCourses: [],
  isSearching: false,
  searchError: null,
  lastQuery: '',
  syllabusByCourseId: {},
  studyPlanByCourseId: {},
  resourcesByCourseId: {},
  syllabusLoadingByCourseId: {},
  studyPlanLoadingByCourseId: {},
  resourcesLoadingByCourseId: {},
  syllabusErrorByCourseId: {},
  studyPlanErrorByCourseId: {},
  resourcesErrorByCourseId: {},
  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSavedCourses: (courses) => set({ savedCourses: courses }),
  upsertSavedCourse: (course) =>
    set((state) => ({
      savedCourses: [course, ...state.savedCourses.filter((item) => item.id !== course.id)],
      selectedCourse: course,
    })),
  removeSavedCourse: (courseId) =>
    set((state) => ({
      savedCourses: state.savedCourses.filter((item) => item.id !== courseId),
      selectedCourse: state.selectedCourse && 'id' in state.selectedCourse && (state.selectedCourse as SavedCourse).id === courseId ? null : state.selectedCourse,
    })),
  setIsSearching: (value) => set({ isSearching: value }),
  setSearchError: (value) => set({ searchError: value }),
  setLastQuery: (value) => set({ lastQuery: value }),
  setSyllabus: (courseId, syllabus) =>
    set((state) => ({
      syllabusByCourseId: {
        ...state.syllabusByCourseId,
        [courseId]: syllabus,
      },
    })),
  setStudyPlan: (courseId, plan) =>
    set((state) => ({
      studyPlanByCourseId: {
        ...state.studyPlanByCourseId,
        [courseId]: plan,
      },
    })),
  setResources: (courseId, resources) =>
    set((state) => ({
      resourcesByCourseId: {
        ...state.resourcesByCourseId,
        [courseId]: resources,
      },
    })),
  setSyllabusLoading: (courseId, value) =>
    set((state) => ({
      syllabusLoadingByCourseId: {
        ...state.syllabusLoadingByCourseId,
        [courseId]: value,
      },
    })),
  setStudyPlanLoading: (courseId, value) =>
    set((state) => ({
      studyPlanLoadingByCourseId: {
        ...state.studyPlanLoadingByCourseId,
        [courseId]: value,
      },
    })),
  setResourcesLoading: (courseId, value) =>
    set((state) => ({
      resourcesLoadingByCourseId: {
        ...state.resourcesLoadingByCourseId,
        [courseId]: value,
      },
    })),
  setSyllabusError: (courseId, value) =>
    set((state) => ({
      syllabusErrorByCourseId: {
        ...state.syllabusErrorByCourseId,
        [courseId]: value,
      },
    })),
  setStudyPlanError: (courseId, value) =>
    set((state) => ({
      studyPlanErrorByCourseId: {
        ...state.studyPlanErrorByCourseId,
        [courseId]: value,
      },
    })),
  setResourcesError: (courseId, value) =>
    set((state) => ({
      resourcesErrorByCourseId: {
        ...state.resourcesErrorByCourseId,
        [courseId]: value,
      },
    })),
}));
