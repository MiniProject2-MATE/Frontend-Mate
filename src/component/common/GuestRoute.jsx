import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * GuestRoute: 이미 로그인한 유저가 접근하면 메인(/)으로 리다이렉트
 * - 로그인 상태(accessToken 보유)라면 홈으로 이동
 */
const GuestRoute = ({ children }) => {
  const { accessToken } = useAuthStore();

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
