import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // 상태
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // 로그인 성공 시 토큰과 유저 정보 저장
      setAuth: (accessToken, refreshToken, user) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },

      // 토큰만 갱신
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
        });
      },

      // 모든 상태 초기화 (로그아웃)
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        // 명시적으로 로컬 스토리지 비우기 (필요시)
        localStorage.removeItem('mate-auth');
      },
    }),
    {
      name: 'mate-auth', // 로컬 스토리지에 저장될 키 이름
    }
  )
);
