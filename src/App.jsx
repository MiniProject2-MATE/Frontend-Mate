import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layout
import MainLayout from '@/component/layout/MainLayout';

// Pages
import MainPage from '@/pages/MainPage.jsx';
import PostDetailPage from '@/pages/PostDetailPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import PostWritePage from '@/pages/PostWritePage.jsx';
import PostEditPage from '@/pages/PostEditPage.jsx';
import BoardPage from '@/pages/BoardPage.jsx';
import MyPage from '@/pages/MyPage.jsx';
import MyPostsPage from '@/pages/MyPostsPage.jsx';
import MyAppliesPage from '@/pages/MyAppliesPage.jsx';
import AdminPage from '@/pages/AdminPage.jsx';
import AdminPostsPage from '@/pages/AdminPostsPage.jsx';
import AdminUsersPage from '@/pages/AdminUsersPage.jsx';
import ErrorPage from '@/pages/ErrorPage.jsx';
import FindEmailPage from '@/pages/FindEmailPage.jsx';
import FindPasswordPage from '@/pages/FindPasswordPage.jsx';

/**
 * ProtectedRoute: 로그인 여부 및 권한(Role)에 따른 접근 제어
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { restore } = useAuthStore();

  useEffect(() => {
    // 앱 초기 실행 시 로컬 스토리지의 토큰을 확인하여 로그인 상태 복구 (예시)
    const token = localStorage.getItem('token');
    if (token) {
      // 실제 프로젝트에서는 여기서 토큰 유효성 검증 API를 호출해야 함
      // restore({ id: 1, role: 'USER' }, token); 
    }
  }, [restore]);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {/* 1. 공개 페이지 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/find-email" element={<FindEmailPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />

          {/* 2. 로그인 필요 페이지 (USER/ADMIN) */}
          <Route path="/posts/new" element={
            <ProtectedRoute>
              <PostWritePage />
            </ProtectedRoute>
          } />
          <Route path="/posts/:id/edit" element={
            <ProtectedRoute>
              <PostEditPage />
            </ProtectedRoute>
          } />
          <Route path="/posts/:id/board" element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          } />
          <Route path="/mypage" element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          } />
          <Route path="/mypage/posts" element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          } />
          <Route path="/mypage/applies" element={
            <ProtectedRoute>
              <MyAppliesPage />
            </ProtectedRoute>
          } />

          {/* 3. ADMIN 전용 페이지 */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/posts" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPostsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminUsersPage />
            </ProtectedRoute>
          } />

          {/* 4. 에러 안내 페이지 (Catch-all) */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
