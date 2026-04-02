import axiosInstance from './axiosInstance';

export const postApi = {
  // 모집글 목록 조회
  getPosts: async (params) => {
    // params: { keyword, category, tag, sort, page, size }
    return await axiosInstance.get('/projects', { params });
  },

  // 모집글 상세 조회
  getPostDetail: async (projectId) => {
    // 상세 조회는 /projects 경로를 사용하도록 handlers.js와 일치시킴
    return await axiosInstance.get(`/projects/${projectId}`);
  },

  // 모집글 등록
  createPost: async (postData) => {
    // 생성, 수정, 삭제는 /posts 경로를 사용하는 MSW 규격에 맞춤
    return await axiosInstance.post('/posts', postData);
  },

  // 모집글 수정
  updatePost: async (projectId, postData) => {
    // [수정] /projects -> /posts 로 변경 (네트워크 에러 해결 포인트)
    return await axiosInstance.put(`/posts/${projectId}`, postData);
  },

  // 모집글 삭제
  deletePost: async (projectId) => {
    // [수정] /projects -> /posts 로 변경
    return await axiosInstance.delete(`/posts/${projectId}`);
  },

  // 모집 조기 마감
  closePost: async (projectId) => {
    // [수정] /projects -> /posts 로 변경
    return await axiosInstance.patch(`/posts/${projectId}/close`);
  },

  // 프로젝트 참여 지원 (경로 수정: /posts/:id/applies -> /application)
  applyToPost: async (projectId, applicationData) => {
    // 백엔드 요청에 따라 독립 경로로 변경하며, body에 projectId를 포함하여 전송
    return await axiosInstance.post('/application', {
      projectId,
      ...applicationData
    });
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