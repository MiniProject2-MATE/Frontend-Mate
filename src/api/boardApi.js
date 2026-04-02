import axiosInstance from './axiosInstance';

const boardApi = {
  // [수정] 프로젝트 상세 정보 조회 (handlers.js의 규격인 /projects로 변경)
  getProjectDetail: async (projectId) => {
    const response = await axiosInstance.get(`/projects/${projectId}`);
    return response;
  },

  // 게시글 목록 조회
  getBoardPosts: async (projectId, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/posts/${projectId}/board`, {
      params: { page, size }
    });
    return response;
  },

  // 게시글 상세 조회
  getBoardPostDetail: async (projectId, boardPostId) => {
    const response = await axiosInstance.get(`/posts/${projectId}/board/${boardPostId}`);
    return response;
  },

  // 게시글 작성
  createBoardPost: async (projectId, postData) => {
    const response = await axiosInstance.post(`/posts/${projectId}/board`, postData);
    return response;
  },

  // [추가] 게시글 수정
  updateBoardPost: async (projectId, boardPostId, postData) => {
    const response = await axiosInstance.put(`/posts/${projectId}/board/${boardPostId}`, postData);
    return response;
  },

  // [추가] 게시글 삭제
  deleteBoardPost: async (projectId, boardPostId) => {
    const response = await axiosInstance.delete(`/posts/${projectId}/board/${boardPostId}`);
    return response;
  },

  // 댓글 조회
  getComments: async (projectId, boardPostId) => {
    const response = await axiosInstance.get(`/posts/${projectId}/board/${boardPostId}/comments`);
    return response;
  },

  // 댓글 작성
  createComment: async (projectId, boardPostId, content) => {
    const response = await axiosInstance.post(`/posts/${projectId}/board/${boardPostId}/comments`, { content });
    return response;
  },

  // [추가] 댓글 수정
  updateComment: async (projectId, boardPostId, commentId, content) => {
    const response = await axiosInstance.put(`/posts/${projectId}/board/${boardPostId}/comments/${commentId}`, { content });
    return response;
  },

  // [추가] 댓글 삭제
  deleteComment: async (projectId, boardPostId, commentId) => {
    const response = await axiosInstance.delete(`/posts/${projectId}/board/${boardPostId}/comments/${commentId}`);
    return response;
  },
  };

export default boardApi;