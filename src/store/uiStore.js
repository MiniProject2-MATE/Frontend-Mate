// src/store/uiStore.js

import { create } from 'zustand'

export const useUiStore = create((set) => ({
  // 토스트 상태
  toast: null,

  // 모달 상태
  modal: null,          // ← 삭제 확인 모달 등

  // 전역 로딩 (페이지 전환 시)
  globalLoading: false,

  // 토스트 표시 (3초 후 자동 닫힘)
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },

  // 토스트 닫기
  hideToast: () => set({ toast: null }),

  // 모달 열기
  openModal: (modalType, data = null) =>
    set({ modal: { type: modalType, data } }),

  // 모달 닫기
  closeModal: () => set({ modal: null }),

  // 전역 로딩
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}))