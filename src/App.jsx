import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from '@/component/layout/MainLayout';

// Auth Guards
import ProtectedRoute from '@/component/common/ProtectedRoute';
import GuestRoute from '@/component/common/GuestRoute';

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

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {/* 1. 공개 페이지 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/find-email" element={<FindEmailPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />

          {/* 2. 로그인 및 회원가입 (이미 로그인된 유저는 접근 불가) */}
          <Route path="/login" element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          } />

          {/* 3. 로그인 필요 페이지 (USER/ADMIN 공통) */}
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

          {/* 4. ADMIN 전용 페이지 */}
          <Route path="/admin" element={
            <ProtectedRoute requireRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/posts" element={
            <ProtectedRoute requireRole="ADMIN">
              <AdminPostsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireRole="ADMIN">
              <AdminUsersPage />
            </ProtectedRoute>
          } />

          {/* 5. 에러 안내 페이지 (Catch-all) */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
