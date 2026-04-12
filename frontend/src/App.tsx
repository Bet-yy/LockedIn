import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/shared/AppShell';
import { CoursePage } from './pages/CoursePage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { TimerPage } from './pages/TimerPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
