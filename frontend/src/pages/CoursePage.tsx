import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSavedCourses } from '../api/courses';
import { generateResources, generateStudyPlan, getResources, getStudyPlan } from '../api/studyPlan';
import { getSyllabus, parseSyllabus } from '../api/syllabus';
import { ResourcesPanel } from '../components/Resources/ResourcesPanel';
import { StudyPlanPanel } from '../components/StudyPlan/StudyPlanPanel';
import { SyllabusPanel } from '../components/Syllabus/SyllabusPanel';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { PageIntro } from '../components/shared/PageIntro';
import { useCourseStore } from '../store/courseStore';
import type { SavedCourse } from '../types/course';

const tabs = [
  { id: 'syllabus', label: 'Syllabus' },
  { id: 'studyPlan', label: 'Study Plan' },
  { id: 'resources', label: 'Resources' },
] as const;

type CourseTab = (typeof tabs)[number]['id'];

export function CoursePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<CourseTab>('syllabus');
  const [pageError, setPageError] = useState<string | null>(null);
  const {
    savedCourses,
    setSavedCourses,
    setSelectedCourse,
    syllabusByCourseId,
    studyPlanByCourseId,
    resourcesByCourseId,
    syllabusLoadingByCourseId,
    studyPlanLoadingByCourseId,
    resourcesLoadingByCourseId,
    syllabusErrorByCourseId,
    studyPlanErrorByCourseId,
    resourcesErrorByCourseId,
    setSyllabus,
    setStudyPlan,
    setResources,
    setSyllabusLoading,
    setStudyPlanLoading,
    setResourcesLoading,
    setSyllabusError,
    setStudyPlanError,
    setResourcesError,
  } = useCourseStore();

  const course = useMemo(() => savedCourses.find((item) => item.id === id) ?? null, [id, savedCourses]);

  useEffect(() => {
    let isMounted = true;

    if (course) {
      setSelectedCourse(course);
      return undefined;
    }

    void (async () => {
      try {
        const courses = await getSavedCourses();
        if (!isMounted) {
          return;
        }
        setSavedCourses(courses);
        const resolvedCourse = courses.find((item) => item.id === id) ?? null;
        if (resolvedCourse) {
          setSelectedCourse(resolvedCourse);
          setPageError(null);
        } else {
          setPageError('This saved course could not be found. Try returning to search and saving it again.');
        }
      } catch {
        if (isMounted) {
          setPageError('The course workspace could not load because saved courses were unavailable.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [course, id, setSavedCourses, setSelectedCourse]);

  useEffect(() => {
    if (!course) {
      return;
    }

    if (activeTab === 'syllabus' && syllabusByCourseId[course.id] === undefined && !syllabusLoadingByCourseId[course.id]) {
      void handleLoadSyllabus(course);
    }
    if (activeTab === 'studyPlan' && studyPlanByCourseId[course.id] === undefined && !studyPlanLoadingByCourseId[course.id]) {
      void handleLoadStudyPlan(course.id);
    }
    if (activeTab === 'resources' && resourcesByCourseId[course.id] === undefined && !resourcesLoadingByCourseId[course.id]) {
      void handleLoadResources(course.id);
    }
  }, [
    activeTab,
    course,
    resourcesByCourseId,
    resourcesLoadingByCourseId,
    studyPlanByCourseId,
    studyPlanLoadingByCourseId,
    syllabusByCourseId,
    syllabusLoadingByCourseId,
  ]);

  async function handleLoadSyllabus(savedCourse: SavedCourse) {
    setSyllabusLoading(savedCourse.id, true);
    setSyllabusError(savedCourse.id, null);
    try {
      const response = await getSyllabus(savedCourse.id);
      setSyllabus(savedCourse.id, response);
    } catch {
      setSyllabus(savedCourse.id, null);
      setSyllabusError(savedCourse.id, 'Stored syllabus data could not be loaded.');
    } finally {
      setSyllabusLoading(savedCourse.id, false);
    }
  }

  async function handleParseSyllabus(rawText?: string) {
    if (!course) {
      return;
    }

    setSyllabusLoading(course.id, true);
    setSyllabusError(course.id, null);
    try {
      const response = await parseSyllabus(course.id, rawText);
      setSyllabus(course.id, response);
      const refreshedCourses = await getSavedCourses();
      setSavedCourses(refreshedCourses);
    } catch {
      setSyllabusError(course.id, 'Syllabus parsing failed. If the PDF is missing, try the manual text fallback.');
    } finally {
      setSyllabusLoading(course.id, false);
    }
  }

  async function handleLoadStudyPlan(courseId: string) {
    setStudyPlanLoading(courseId, true);
    setStudyPlanError(courseId, null);
    try {
      const response = await getStudyPlan(courseId);
      setStudyPlan(courseId, response.plan_content.length ? response : null);
    } catch {
      setStudyPlan(courseId, null);
      setStudyPlanError(courseId, 'Stored study plan data could not be loaded.');
    } finally {
      setStudyPlanLoading(courseId, false);
    }
  }

  async function handleGenerateStudyPlan(weeksAvailable: number) {
    if (!course) {
      return;
    }

    setStudyPlanLoading(course.id, true);
    setStudyPlanError(course.id, null);
    try {
      const response = await generateStudyPlan(course.id, weeksAvailable);
      setStudyPlan(course.id, response);
    } catch {
      setStudyPlanError(course.id, 'Study plan generation failed. Parse the syllabus first, then try again.');
    } finally {
      setStudyPlanLoading(course.id, false);
    }
  }

  async function handleLoadResources(courseId: string) {
    setResourcesLoading(courseId, true);
    setResourcesError(courseId, null);
    try {
      const response = await getResources(courseId);
      setResources(courseId, response);
    } catch {
      setResources(courseId, []);
      setResourcesError(courseId, 'Stored resource recommendations could not be loaded.');
    } finally {
      setResourcesLoading(courseId, false);
    }
  }

  async function handleGenerateResources(topic?: string) {
    if (!course) {
      return;
    }

    setResourcesLoading(course.id, true);
    setResourcesError(course.id, null);
    try {
      const response = await generateResources(course.id, topic);
      setResources(course.id, response);
    } catch {
      setResourcesError(course.id, 'Resource generation failed. Try again with a simpler topic.');
    } finally {
      setResourcesLoading(course.id, false);
    }
  }

  const syllabus = course ? syllabusByCourseId[course.id] ?? null : null;
  const studyPlan = course ? studyPlanByCourseId[course.id] ?? null : null;
  const resources = course ? resourcesByCourseId[course.id] ?? [] : [];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Course Workspace"
        title={course ? `${course.course_number} - ${course.course_name}` : `Course workspace for ${id ?? 'selected course'}`}
        description={
          course
            ? `Use this workspace to parse the syllabus, generate a weekly plan, and pull study resources for ${course.professor ?? 'the selected instructor'} without losing context.`
            : 'Loading the saved course so the syllabus, plan, and resources can be rehydrated.'
        }
      />

      <section className="glass-panel p-4">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                activeTab === tab.id ? 'bg-cyan-400 text-ink-950' : 'bg-white/5 text-sand-100/72 hover:bg-white/10',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {pageError ? <ErrorBanner message={pageError} /> : null}

      {!course && !pageError ? (
        <div className="glass-panel p-6">
          <LoadingSpinner label="Loading saved course workspace..." />
        </div>
      ) : null}

      {!course && pageError ? (
        <EmptyState
          title="Course workspace unavailable"
          description="Return to search, save the course again, and reopen the workspace."
        />
      ) : null}

      {course && activeTab === 'syllabus' ? (
        <SyllabusPanel
          course={course}
          syllabus={syllabus}
          isLoading={Boolean(syllabusLoadingByCourseId[course.id])}
          error={syllabusErrorByCourseId[course.id] ?? null}
          onParse={handleParseSyllabus}
        />
      ) : null}

      {course && activeTab === 'studyPlan' ? (
        <StudyPlanPanel
          plan={studyPlan}
          isLoading={Boolean(studyPlanLoadingByCourseId[course.id])}
          error={studyPlanErrorByCourseId[course.id] ?? null}
          onGenerate={handleGenerateStudyPlan}
        />
      ) : null}

      {course && activeTab === 'resources' ? (
        <ResourcesPanel
          resources={resources}
          isLoading={Boolean(resourcesLoadingByCourseId[course.id])}
          error={resourcesErrorByCourseId[course.id] ?? null}
          onGenerate={handleGenerateResources}
        />
      ) : null}
    </div>
  );
}
