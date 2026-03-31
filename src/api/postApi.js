import axiosInstance from './axiosInstance';

export const postApi = {
  // 모집글 목록 조회
  getPosts: async (params) => {
    // params: { keyword, category, tag, sort, page, size }
    return await axiosInstance.get('/projects', { params });
  },

  // 모집글 상세 조회
  getPostDetail: async (projectId) => {
    return await axiosInstance.get(`/projects/${projectId}`);
  },

  // 모집글 등록
  createPost: async (postData) => {
    return await axiosInstance.post('/projects', postData);
  },

  // 모집글 수정
  updatePost: async (projectId, postData) => {
    return await axiosInstance.put(`/projects/${projectId}`, postData);
  },

  // 모집글 삭제
  deletePost: async (projectId) => {
    return await axiosInstance.delete(`/projects/${projectId}`);
  },

  // 모집 조기 마감
  closePost: async (projectId) => {
    return await axiosInstance.patch(`/projects/${projectId}/close`);
  },

  // 프로젝트 참여 지원
  applyToPost: async (projectId, applicationData) => {
    // applicationData: { message }
    return await axiosInstance.post(`/projects/${projectId}/applications`, applicationData);
  },

  // 지원 취소
  cancelApplication: async (applicationId) => {
    return await axiosInstance.delete(`/applications/${applicationId}`);
  },

  // 지원서 승인/거절
  updateApplicationStatus: async (applicationId, status) => {
    // status: 'ACCEPTED' or 'REJECTED'
    return await axiosInstance.patch(`/applications/${applicationId}/status`, { status });
  }
};

export default postApi;
