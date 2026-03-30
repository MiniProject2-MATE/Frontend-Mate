// src/store/authStore.js

import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  // 상태
  isAuthenticated: false,
  isLoggedIn: false, // alias for isAuthenticated
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,      // ← 로그인 요청 중 로딩 상태
  error: null,           // ← 로그인 실패 에러 메시지

  // 로그인
  login: (userData, token, refreshToken) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refreshToken)
    set({
      isAuthenticated: true,
      isLoggedIn: true,
      user: userData,
      token,
      refreshToken,
      error: null,
    })
  },

  // 토큰 갱신
  updateTokens: (token, refreshToken) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refreshToken)
    set({ token, refreshToken })
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({
      isAuthenticated: false,
      isLoggedIn: false,
      user: null,
      token: null,
      refreshToken: null,
      error: null,
    })
  },

  // 새로고침 시 토큰으로 로그인 상태 복구
  restore: (userData, token, refreshToken) => {
    set({ 
      isAuthenticated: true, 
      isLoggedIn: true, 
      user: userData, 
      token, 
      refreshToken 
    })
  },

  // 로딩 상태 변경
  setLoading: (isLoading) => set({ isLoading }),

  // 에러 상태 변경
  setError: (error) => set({ error }),

  // 프로필 이미지 업데이트
  updateProfileImage: (imageUrl) => {
    const user = get().user
    set({ user: { ...user, profileImage: imageUrl } })
  },

  // 닉네임 업데이트
  updateNickname: (nickname) => {
    const user = get().user
    set({ user: { ...user, nickname } })
  },
}))