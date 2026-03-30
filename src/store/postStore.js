// src/store/postStore.js

import { create } from 'zustand'

export const usePostStore = create((set, get) => ({
  // 상태
  posts: [],
  totalPages: 0,
  totalElements: 0,
  currentPost: null,
  isLoading: false,
  error: null,

  // 필터/검색 상태
  keyword: '',
  category: '전체',
  sort: 'latest',
  page: 0,

  // 모집글 목록 저장
  setPosts: (posts, totalPages, totalElements) =>
    set({ posts, totalPages, totalElements }),

  // 모집글 상세 저장
  setCurrentPost: (post) => set({ currentPost: post }),

  // 필터 변경
  setKeyword: (keyword) => set({ keyword, page: 0 }),
  setCategory: (category) => set({ category, page: 0 }),
  setSort: (sort) => set({ sort, page: 0 }),
  setPage: (page) => set({ page }),

  // 로딩/에러
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // 모집글 삭제 시 목록에서 제거
  removePost: (postId) => {
    const posts = get().posts.filter((p) => p.id !== postId)
    set({ posts })
  },

  // 모집글 수정 시 목록 업데이트
  updatePost: (updatedPost) => {
    const posts = get().posts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p
    )
    set({ posts, currentPost: updatedPost })
  },

  // 초기화
  clearPosts: () => set({ posts: [], totalPages: 0, totalElements: 0 }),
  clearCurrentPost: () => set({ currentPost: null }),
}))