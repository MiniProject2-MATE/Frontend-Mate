// src/store/postStore.js

import { create } from 'zustand'
import postApi from '../api/postApi'

/**
 * 프로젝트 모집글 상태 관리 스토어 (REST API 설계서 v1.1 반영)
 */
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
      
      // 카테고리 값 서버 규격(v1.1)으로 변환
      let targetCategory = '';
      if (state.category === '프로젝트') targetCategory = 'PROJECT';
      else if (state.category === '스터디') targetCategory = 'STUDY';

      const currentParams = {
        keyword: state.keyword,
        category: targetCategory,
        sort: state.sort,
        page: state.page,
        size: 15,
        ...params
      }
      
      const response = await postApi.getPosts(currentParams);
      
      /**
       * 설계서 v1.1 규격 매핑:
       * response = { content: [], page: { totalPages, totalElements, ... } }
       * 기존 컴포넌트 호환성을 위해 id와 projectId를 동일하게 매핑
       */
      const mappedPosts = (response?.content || []).map(post => ({
        ...post,
        id: post.id || post.projectId,
        projectId: post.projectId || post.id
      }));

      set({ 
        posts: mappedPosts, 
        totalPages: response?.page?.totalPages || 0,
        totalElements: response?.page?.totalElements || 0,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error.message || '목록을 불러오는 중 오류가 발생했습니다.', 
        isLoading: false 
      })
    }
  },

  // 필터 변경 액션
  setKeyword: (keyword) => set({ keyword, page: 0 }),
  setCategory: (category) => set({ category, page: 0 }),
  setSort: (sort) => set({ sort, page: 0 }),
  setPage: (page) => set({ page }),

  // 모집글 상세 가져오기
  fetchPostDetail: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postApi.getPostDetail(projectId)
      
      // 상세 데이터에서도 id와 projectId 호환성 유지 및 날짜 가공
      const mappedDetail = response ? {
        ...response,
        id: response.id || response.projectId,
        projectId: response.projectId || response.id,
        endDate: response.endDate ? response.endDate.split('T')[0] : response.endDate 
      } : null;

      set({ currentPost: mappedDetail, isLoading: false })
    } catch (error) {
      set({ 
        error: error.message || '상세 정보를 불러오는 데 실패했습니다.', 
        isLoading: false 
      })
    }
  },

  // 로딩/에러 설정
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // 초기화
  clearPosts: () => set({ posts: [], totalPages: 0, totalElements: 0 }),
  clearCurrentPost: () => set({ currentPost: null }),
}))
