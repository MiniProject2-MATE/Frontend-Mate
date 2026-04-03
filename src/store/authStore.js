import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // 상태 초기값 (null로 명시적 설정)
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false, // 명시적 로그인 상태 추가

      // 로그인 성공 시 토큰과 유저 정보 저장
      setAuth: (accessToken, refreshToken, user) => {
        // 백엔드 응답의 id를 userId로 매핑하여 저장 (일관성 유지)
        const userWithId = user ? { ...user, userId: user.userId || user.id } : null;
        set({
          accessToken,
          refreshToken,
          user: userWithId,
          isLoggedIn: !!accessToken,
        });
      },

      // 토큰만 갱신
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isLoggedIn: !!accessToken,
        });
      },

      // 유저 정보만 부분 업데이트
      updateUser: (userData) => {
        set((state) => ({
          user: state.user 
            ? { ...state.user, ...userData, userId: userData.userId || userData.id || state.user.userId } 
            : userData
        }));
      },

      // 모든 상태 초기화 (로그아웃)
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoggedIn: false,
        });
        // 명시적으로 로컬 스토리지 비우기
        localStorage.removeItem('mate-auth');
      },
    }),
    {
      name: 'mate-auth', // 로컬 스토리지에 저장될 키 이름
    }
  )
);
