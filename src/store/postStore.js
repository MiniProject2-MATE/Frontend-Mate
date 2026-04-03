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
      const state = get();
      
      // 카테고리 값 서버 규격으로 변환
      let targetCategory = '';
      if (state.category === '프로젝트') targetCategory = 'PROJECT';
      else if (state.category === '스터디') targetCategory = 'STUDY';

      // 기본값 및 현재 상태 결합
      const currentParams = {
        keyword: state.keyword,
        category: targetCategory,
        sort: state.sort,
        page: state.page,
        size: 15,
        ...params
      }
      
      const response = await postApi.getPosts(currentParams);
      
      // 설계서 규격(projectId)과 현재 UI(id) 간의 호환성을 위해 매핑
      const mappedPosts = (response?.content || []).map(post => ({
        ...post,
        id: post.projectId || post.id // UI에서 id를 주로 사용하므로 보정
      }));

      // axiosInstance가 res.data.data를 반환하므로 response는 { content, page } 구조임
      set({ 
        posts: mappedPosts, 
        totalPages: response?.page?.totalPages || 0,
        totalElements: response?.page?.totalElements || 0,
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // 필터 변경 액션
  setKeyword: (keyword) => set({ keyword, page: 0 }),
  setCategory: (category) => set({ category, page: 0 }),
  setSort: (sort) => set({ sort, page: 0 }),
  setPage: (page) => set({ page }),

  // 로딩/에러 설정
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // 모집글 상세 가져오기
  fetchPostDetail: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postApi.getPostDetail(projectId)
      
      // 상세 데이터에서도 id와 projectId 호환성 유지 및 날짜 정규화
      const mappedDetail = response ? {
        ...response,
        id: response.projectId || response.id,
        // ISO 8601 날짜를 UI에서 사용하는 포맷으로 필요시 변환 (추후 컴포넌트에서도 처리 가능)
        endDate: response.endDate ? response.endDate.split('T')[0] : response.endDate 
      } : null;

      set({ currentPost: mappedDetail, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // 초기화
  clearPosts: () => set({ posts: [], totalPages: 0, totalElements: 0 }),
  clearCurrentPost: () => set({ currentPost: null }),
}))
