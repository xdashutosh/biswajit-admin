import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewsListPage from './pages/news/NewsListPage';
import NewsFormPage from './pages/news/NewsFormPage';
import JobsListPage from './pages/jobs/JobsListPage';
import JobFormPage from './pages/jobs/JobFormPage';
import CurrentsListPage from './pages/currents/CurrentsListPage';
import CurrentFormPage from './pages/currents/CurrentFormPage';
import LettersListPage from './pages/letters/LettersListPage';
import PodcastsListPage from './pages/podcasts/PodcastsListPage';
import PodcastFormPage from './pages/podcasts/PodcastFormPage';
import PollsListPage from './pages/polls/PollsListPage';
import PollFormPage from './pages/polls/PollFormPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectFormPage from './pages/projects/ProjectFormPage';
import UsersListPage from './pages/users/UsersListPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        {/* News */}
                        <Route path="news" element={<NewsListPage />} />
                        <Route path="news/new" element={<NewsFormPage />} />
                        <Route path="news/edit/:id" element={<NewsFormPage />} />
                        {/* Jobs */}
                        <Route path="jobs" element={<JobsListPage />} />
                        <Route path="jobs/new" element={<JobFormPage />} />
                        <Route path="jobs/edit/:id" element={<JobFormPage />} />
                        {/* Currents */}
                        <Route path="currents" element={<CurrentsListPage />} />
                        <Route path="currents/new" element={<CurrentFormPage />} />
                        <Route path="currents/edit/:id" element={<CurrentFormPage />} />
                        {/* Letters */}
                        <Route path="letters" element={<LettersListPage />} />
                        {/* Podcasts */}
                        <Route path="podcasts" element={<PodcastsListPage />} />
                        <Route path="podcasts/new" element={<PodcastFormPage />} />
                        <Route path="podcasts/edit/:id" element={<PodcastFormPage />} />
                        {/* Polls */}
                        <Route path="polls" element={<PollsListPage />} />
                        <Route path="polls/new" element={<PollFormPage />} />
                        {/* Projects */}
                        <Route path="projects" element={<ProjectsListPage />} />
                        <Route path="projects/new" element={<ProjectFormPage />} />
                        <Route path="projects/edit/:id" element={<ProjectFormPage />} />
                        {/* Users */}
                        <Route path="users" element={<UsersListPage />} />
                        {/* Settings */}
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#1e293b',
                        border: '1px solid #fed7aa',
                        borderRadius: '12px',
                        fontSize: '14px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
                }}
            />
        </AuthProvider>
    );
}
