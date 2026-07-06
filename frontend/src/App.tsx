import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { fetchMe } from '@/services/authService';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
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
import Flashcards from '@/pages/admin/Flashcards';
import FlashcardImport from '@/pages/admin/FlashcardImport';
import CustomSetList from '@/pages/admin/CustomSetList';
import CustomSetEditor from '@/pages/admin/CustomSetEditor';
import CustomSetImport from '@/pages/admin/CustomSetImport';
import CustomSetResults from '@/pages/admin/CustomSetResults';
import CustomSetResultDetail from '@/pages/admin/CustomSetResultDetail';
import AdminResults from '@/pages/admin/AdminResults';
import AdminResultDetail from '@/pages/admin/AdminResultDetail';

import StudyHome from '@/pages/study/StudyHome';
import FlashcardSession from '@/pages/study/FlashcardSession';
import BookmarkedFlashcards from '@/pages/study/BookmarkedFlashcards';

import ExamSelect from '@/pages/client/ExamSelect';
import ExamSession from '@/pages/client/ExamSession';
import StudySession from '@/pages/client/StudySession';
import Results from '@/pages/client/Results';
import Review from '@/pages/client/Review';
import History from '@/pages/client/History';
import Profile from '@/pages/client/Profile';
import WeakAreas from '@/pages/client/WeakAreas';
import QuestionStats from '@/pages/client/QuestionStats';
import ReadingSession from '@/pages/client/ReadingSession';
import CustomExamLanding from '@/pages/client/CustomExamLanding';
import CustomExamSession from '@/pages/client/CustomExamSession';
import CustomExamResult from '@/pages/client/CustomExamResult';

const SITE = 'Mock Exam System';
const TITLE_MAP: Array<[RegExp, string]> = [
  [/^\/login$/,                       'pageTitle.login'],
  [/^\/register$/,                    'pageTitle.register'],
  [/^\/admin\/dashboard$/,            'pageTitle.adminDashboard'],
  [/^\/admin\/questions\/import$/,    'pageTitle.adminQuestionsImport'],
  [/^\/admin\/questions\/new$/,       'pageTitle.adminQuestionsNew'],
  [/^\/admin\/questions\/\d+\/edit$/, 'pageTitle.adminQuestionsEdit'],
  [/^\/admin\/questions$/,            'pageTitle.adminQuestions'],
  [/^\/admin\/exams$/,                'pageTitle.adminExams'],
  [/^\/admin\/users\/new$/,           'pageTitle.adminUsersNew'],
  [/^\/admin\/users\/\d+\/edit$/,     'pageTitle.adminUsersEdit'],
  [/^\/admin\/users$/,                'pageTitle.adminUsers'],
  [/^\/admin\/reports$/,              'pageTitle.adminReports'],
  [/^\/admin\/passages$/,             'pageTitle.adminPassages'],
  [/^\/admin\/categories$/,           'pageTitle.adminCategories'],
  [/^\/admin\/flashcards\/import$/,   'pageTitle.adminFlashcardsImport'],
  [/^\/admin\/flashcards$/,           'pageTitle.adminFlashcards'],
  [/^\/admin\/custom-sets\/import$/,  'pageTitle.adminCustomSetsImport'],
  [/^\/admin\/custom-sets\/create$/,  'pageTitle.adminCustomSetsCreate'],
  [/^\/admin\/custom-sets\/\d+\/edit$/, 'pageTitle.adminCustomSetsEdit'],
  [/^\/admin\/custom-sets\/\d+\/results$/, 'pageTitle.adminCustomSetsResults'],
  [/^\/admin\/custom-sets$/,          'pageTitle.adminCustomSets'],
  [/^\/admin\/results\/\d+$/,         'pageTitle.adminResultDetail'],
  [/^\/admin\/results$/,              'pageTitle.adminResults'],
  [/^\/exam\/custom\/results\/\d+$/,  'pageTitle.customExamResult'],
  [/^\/exam\/custom\/session$/,       'pageTitle.customExamSession'],
  [/^\/exam\/custom\//,               'pageTitle.customExamLanding'],
  [/^\/exam\/results\/\d+\/review$/,  'pageTitle.examReview'],
  [/^\/exam\/results\//,              'pageTitle.examResults'],
  [/^\/exam\/session\//,              'pageTitle.examSession'],
  [/^\/exam\/select$/,                'pageTitle.examSelect'],
  [/^\/study\/session\//,             'pageTitle.studySession'],
  [/^\/reading\/session\//,           'pageTitle.readingSession'],
  [/^\/study\/bookmarks$/,            'pageTitle.bookmarkedFlashcards'],
  [/^\/study\/[^/]+$/,                'pageTitle.flashcardSession'],
  [/^\/study$/,                       'pageTitle.study'],
  [/^\/profile\/history$/,            'pageTitle.profileHistory'],
  [/^\/profile\/weak-areas$/,         'pageTitle.profileWeakAreas'],
  [/^\/profile\/question-stats$/,     'pageTitle.questionStats'],
  [/^\/profile$/,                     'pageTitle.profile'],
];

function TitleManager() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  useEffect(() => {
    const match = TITLE_MAP.find(([re]) => re.test(pathname));
    document.title = match ? `${t(match[1])} | ${SITE}` : SITE;
  }, [pathname, t, i18n.language]);
  return null;
}

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
    <BrowserRouter basename="/miyazaki-shiken-lab" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <TitleManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public study routes — no auth required */}
        <Route path="/study" element={<StudyHome />} />
        <Route path="/study/:type" element={<FlashcardSession />} />

        {/* Admin routes — require admin role */}
        <Route element={<PrivateRoute requiredRole={1} />}>
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
          <Route path="/admin/flashcards" element={<Flashcards />} />
          <Route path="/admin/flashcards/import" element={<FlashcardImport />} />
          <Route path="/admin/custom-sets" element={<CustomSetList />} />
          <Route path="/admin/custom-sets/import" element={<CustomSetImport />} />
          <Route path="/admin/custom-sets/create" element={<CustomSetEditor />} />
          <Route path="/admin/custom-sets/:id/edit" element={<CustomSetEditor />} />
          <Route path="/admin/custom-sets/:id/results" element={<CustomSetResults />} />
          <Route path="/admin/custom-sets/:id/results/:resultId" element={<CustomSetResultDetail />} />
          <Route path="/admin/results" element={<AdminResults />} />
          <Route path="/admin/results/:id" element={<AdminResultDetail />} />
        </Route>

        {/* Client routes — require employee role */}
        <Route element={<PrivateRoute requiredRole={2} />}>
          <Route path="/exam/select" element={<ExamSelect />} />
          <Route path="/exam/session/:category" element={<ExamSession />} />
          <Route path="/study/session/:category" element={<StudySession />} />
          <Route path="/study/bookmarks" element={<BookmarkedFlashcards />} />
          <Route path="/exam/results/:id" element={<Results />} />
          <Route path="/exam/results/:id/review" element={<Review />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/history" element={<History />} />
          <Route path="/profile/weak-areas" element={<WeakAreas />} />
          <Route path="/profile/question-stats" element={<QuestionStats />} />
          <Route path="/reading/session/:category" element={<ReadingSession />} />
          <Route path="/exam/custom/:slug" element={<CustomExamLanding />} />
          <Route path="/exam/custom/session" element={<CustomExamSession />} />
          <Route path="/exam/custom/results/:id" element={<CustomExamResult />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
