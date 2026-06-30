import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ExpenseRequestForm from './components/ExpenseRequestForm';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import BudgetDashboard from './components/BudgetDashboard';
import Login from './components/Login';
import ProgramGuide from './pages/student/ProgramGuide';
import NoticeBoard, { checkHasUnread } from './pages/student/NoticeBoard';
import ContentManagement from './pages/admin/ContentManagement';
import AdminNewRequest from './pages/admin/AdminNewRequest';
import CategoryManagement from './pages/admin/CategoryManagement';
import DynamicRequestForm from './components/DynamicRequestForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiGetNotices } from './api';
import type { Notice } from './api';

function Navigation() {
    const location = useLocation();
    const path = location.pathname;
    const { user, logout } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [hasUnread, setHasUnread] = useState(false);

    // 참가자 로그인 시 공지 목록 로드 → 읽음 여부 계산
    useEffect(() => {
        if (!user || user.role === 'admin') return;
        apiGetNotices()
            .then(list => {
                setNotices(list);
                setHasUnread(checkHasUnread(list));
            })
            .catch(() => {});
    }, [user]);

    // 공지를 읽으면 NoticeBoard가 'noticeRead' 이벤트를 발생 → badge 재계산
    useEffect(() => {
        if (!user || user.role === 'admin') return;
        const handler = () => setHasUnread(checkHasUnread(notices));
        window.addEventListener('noticeRead', handler);
        return () => window.removeEventListener('noticeRead', handler);
    }, [user, notices]);

    const handleLogout = () => {
        logout();
        window.location.replace('/');
    };

    if (!user) return null;

    const navLink = (to: string, _label?: string) =>
        `px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${
            path === to
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
        }`;

    return (
        <div className="absolute top-4 right-4 z-10 flex gap-2 flex-wrap justify-end">
            {user.role === 'admin' ? (
                <>
                    <Link to="/admin/content" className={navLink('/admin/content')}>게시물 작성</Link>
                    <Link to="/admin" className={navLink('/admin')}>관리자 홈</Link>
                    <Link to="/admin/requests" className={navLink('/admin/requests')}>신청 내역</Link>
                    <Link to="/admin/new" className={navLink('/admin/new')}>새 신청서 작성</Link>
                    <Link to="/admin/categories" className={navLink('/admin/categories')}>비목 관리</Link>
                </>
            ) : (
                <>
                    <Link to="/notices" className={`relative ${navLink('/notices')}`}>
                        공지사항
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                        )}
                    </Link>
                    <Link to="/" className={navLink('/')}>프로그램 안내</Link>
                    <Link to="/new" className={navLink('/new')}>새 신청서 작성</Link>
                    <Link to="/dashboard" className={navLink('/dashboard')}>내 신청 내역</Link>
                </>
            )}
            <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border bg-white text-red-600 border-red-200 hover:bg-red-50 transition-colors"
            >
                로그아웃
            </button>
        </div>
    );
}

function ProtectedStudentRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Login />;
    if (user.role === 'admin') {
        window.location.replace('/admin');
        return null;
    }
    return <>{children}</>;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Login />;
    if (user.role !== 'admin') {
        alert('접근 권한이 없습니다. (관리자 전용)');
        window.location.replace('/dashboard');
        return null;
    }
    return <>{children}</>;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navigation />
                <Routes>
                    <Route path="/" element={<ProtectedStudentRoute><ProgramGuide /></ProtectedStudentRoute>} />
                    <Route path="/new" element={<ProtectedStudentRoute><ExpenseRequestForm /></ProtectedStudentRoute>} />
                    <Route path="/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
                    <Route path="/notices" element={<ProtectedStudentRoute><NoticeBoard /></ProtectedStudentRoute>} />
                    <Route path="/dynamic-request" element={<ProtectedStudentRoute><DynamicRequestForm /></ProtectedStudentRoute>} />

                    <Route path="/admin" element={<ProtectedAdminRoute><BudgetDashboard /></ProtectedAdminRoute>} />
                    <Route path="/admin/requests" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                    <Route path="/admin/content" element={<ProtectedAdminRoute><ContentManagement /></ProtectedAdminRoute>} />
                    <Route path="/admin/new" element={<ProtectedAdminRoute><AdminNewRequest /></ProtectedAdminRoute>} />
                    <Route path="/admin/categories" element={<ProtectedAdminRoute><CategoryManagement /></ProtectedAdminRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
