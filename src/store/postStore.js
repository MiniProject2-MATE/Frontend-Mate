// src/store/postStore.js

import { create } from 'zustand'
import postApi from '../api/postApi'

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

  // 모집글 목록 가져오기
  fetchPosts: async (params) => {
    set({ isLoading: true, error: null })
    try {
      // 기본값 설정 (페이지당 15개)
      const currentParams = {
        keyword: get().keyword,
        category: get().category === '전체' ? '' : get().category,
        sort: get().sort,
        page: get().page,
        size: 15, // 기본 15개로 변경
        ...params
      }
      
      const response = await postApi.getPosts(currentParams);
      
      set({ 
        posts: response.content || [], 
        totalPages: response.page?.totalPages || 0,
        totalElements: response.page?.totalElements || 0,
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // 필터 변경
  setKeyword: (keyword) => set({ keyword, page: 0 }),
  setCategory: (category) => set({ category, page: 0 }),
  setSort: (sort) => set({ sort, page: 0 }),
  setPage: (page) => set({ page }),

  // 로딩/에러
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // 모집글 상세 가져오기
  fetchPostDetail: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postApi.getPostDetail(projectId)
      set({ currentPost: response, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // 초기화
  clearPosts: () => set({ posts: [], totalPages: 0, totalElements: 0 }),
  clearCurrentPost: () => set({ currentPost: null }),
}))
