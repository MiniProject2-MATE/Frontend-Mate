import axiosInstance from './axiosInstance';

export const postApi = {
  // 모집글 목록 조회
  getPosts: async (params) => {
    // 설계서 규격: GET /api/projects
    return await axiosInstance.get('/projects', { params });
  },

  // 모집글 상세 조회
  getPostDetail: async (projectId) => {
    return await axiosInstance.get(`/projects/${projectId}`);
  },

  // 모집글 등록
  createPost: async (postData) => {
    // 설계서 규격: POST /api/projects
    return await axiosInstance.post('/projects', postData);
  },

  // 모집글 수정
  updatePost: async (projectId, postData) => {
    // 설계서 규격: PUT /api/projects/{id}
    return await axiosInstance.put(`/projects/${projectId}`, postData);
  },

  // 모집글 삭제
  deletePost: async (projectId) => {
    // 설계서 규격: DELETE /api/projects/{id}
    return await axiosInstance.delete(`/projects/${projectId}`);
  },

  // 모집 조기 마감
  closePost: async (projectId) => {
    // 설계서 규격: PATCH /api/projects/{id}/close
    return await axiosInstance.patch(`/projects/${projectId}/close`);
  },

  // 프로젝트 참여 지원 (설계서 규격: POST /api/applications)
  applyToPost: async (projectId, applicationData) => {
    return await axiosInstance.post('/applications', {
      postId: projectId,
      message: applicationData.content  // message 필드만
    });
  },

  // 지원 취소 (설계서 규격: DELETE /api/applications/{id})
  cancelApplication: async (applicationId) => {
    return await axiosInstance.delete(`/applications/${applicationId}`);
  },

  // 지원서 승인/거절 (설계서 규격: PATCH /api/applications/{id}/status)
  updateApplicationStatus: async (applicationId, status) => {
    // status: 'ACCEPTED' or 'REJECTED'
    return await axiosInstance.patch(`/applications/${applicationId}/status`, { status });
  }
};

export default postApi;