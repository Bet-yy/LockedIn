import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/shared/AppShell';
import { CalendarPage } from './pages/CalendarPage';
import { CoursePage } from './pages/CoursePage';
import { CoursesPage } from './pages/CoursesPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { TimerPage } from './pages/TimerPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/to-do-list" element={<TasksPage />} />
        <Route path="/tasks" element={<Navigate to="/to-do-list" replace />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
