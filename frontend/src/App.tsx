import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { fetchMe } from '@/services/authService';

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
import Categories from '@/pages/admin/Categories';

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
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // On every mount, refresh the user from the DB so that role or profile
  // changes made outside the current session (e.g. admin promoting a user)
  // take effect on the next page load without requiring a re-login.
  useEffect(() => {
    if (!token) return;
    fetchMe()
      .then(setUser)
      .catch(() => logout()); // token invalid / expired → force re-login
  }, [token, setUser, logout]);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
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
          <Route path="/admin/categories" element={<Categories />} />
        </Route>

        {/* Client routes — require employee role */}
        <Route element={<PrivateRoute requiredRole="employee" />}>
          <Route path="/exam/select" element={<ExamSelect />} />
          <Route path="/exam/session/:category" element={<ExamSession />} />
          <Route path="/study/session/:category" element={<StudySession />} />
          <Route path="/exam/results/:id" element={<Results />} />
          <Route path="/exam/results/:id/review" element={<Review />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/history" element={<History />} />
          <Route path="/profile/weak-areas" element={<WeakAreas />} />
          <Route path="/reading/session/:category" element={<ReadingSession />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
