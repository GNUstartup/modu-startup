import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ExpenseRequestForm from './components/ExpenseRequestForm';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import BudgetDashboard from './components/BudgetDashboard';
import Login from './components/Login';
import ProgramGuide from './pages/student/ProgramGuide';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navigation() {
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.replace('/');
  };

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {user.role === 'admin' ? (
        // Admin Navigation
        <>
          <Link
            to="/admin"
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${path === '/admin' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
          >
            관리자 홈
          </Link>
          <Link
            to="/admin/requests"
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${path === '/admin/requests' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
          >
            신청 내역
          </Link>
        </>
      ) : (
        // Student Navigation
        <>
          <Link
            to="/"
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${path === '/' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
          >
            새 신청서 작성
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${path === '/dashboard' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
          >
            내 신청 내역
          </Link>
          <Link
            to="/guide"
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${path === '/guide' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
          >
            프로그램 안내
          </Link>
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

  // Admins are redirected to their own dashboard if they try to access student areas
  if (user.role === 'admin') {
    window.location.replace('/admin');
    return null;
  }

  return <>{children}</>;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Login />;

  // Students are blocked and kicked back to root
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
          <Route path="/" element={<ProtectedStudentRoute><ExpenseRequestForm /></ProtectedStudentRoute>} />
          <Route path="/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
          <Route path="/guide" element={<ProtectedStudentRoute><ProgramGuide /></ProtectedStudentRoute>} />

          <Route path="/admin" element={<ProtectedAdminRoute><BudgetDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/requests" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
