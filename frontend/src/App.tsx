import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { PrivateRoute } from '@/components/layout/PrivateRoute';

import Dashboard from '@/pages/admin/Dashboard';
import Questions from '@/pages/admin/Questions';
import QuestionForm from '@/pages/admin/QuestionForm';
import QuestionImport from '@/pages/admin/QuestionImport';
import ExamSettings from '@/pages/admin/ExamSettings';
import UserManagement from '@/pages/admin/UserManagement';
import UserForm from '@/pages/admin/UserForm';
import Reports from '@/pages/admin/Reports';
import Passages from '@/pages/admin/Passages';

import ExamSelect from '@/pages/client/ExamSelect';
import ExamSession from '@/pages/client/ExamSession';
import StudySession from '@/pages/client/StudySession';
import Results from '@/pages/client/Results';
import Review from '@/pages/client/Review';
import History from '@/pages/client/History';
import Profile from '@/pages/client/Profile';
import WeakAreas from '@/pages/client/WeakAreas';
import ReadingSession from '@/pages/client/ReadingSession';

const App = () => {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes — require admin role */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/questions" element={<Questions />} />
          <Route path="/admin/questions/new" element={<QuestionForm />} />
          <Route path="/admin/questions/:id/edit" element={<QuestionForm />} />
          <Route path="/admin/questions/import" element={<QuestionImport />} />
          <Route path="/admin/exams" element={<ExamSettings />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/new" element={<UserForm />} />
          <Route path="/admin/users/:id/edit" element={<UserForm />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/passages" element={<Passages />} />
        </Route>

        {/* Client routes — require employee role */}
        <Route element={<PrivateRoute requiredRole="employee" />}>
          <Route path="/exam/select" element={<ExamSelect />} />
          <Route path="/exam/session" element={<ExamSession />} />
          <Route path="/study/session" element={<StudySession />} />
          <Route path="/exam/results/:id" element={<Results />} />
          <Route path="/exam/results/:id/review" element={<Review />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/history" element={<History />} />
          <Route path="/profile/weak-areas" element={<WeakAreas />} />
          <Route path="/reading/session" element={<ReadingSession />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
