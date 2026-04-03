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

  // 게시글 수정 (설계서 규격: PUT /api/board-posts/{boardPostId})
  updateBoardPost: async (boardPostId, postData) => {
    const response = await axiosInstance.put(`/board-posts/${boardPostId}`, postData);
    return response;
  },

  // 게시글 삭제 (설계서 규격: DELETE /api/board-posts/{boardPostId})
  deleteBoardPost: async (boardPostId) => {
    const response = await axiosInstance.delete(`/board-posts/${boardPostId}`);
    return response;
  },

  // 댓글 조회 (설계서 규격 유지: GET /api/posts/{projectId}/board/{boardPostId}/comments)
  getComments: async (projectId, boardPostId) => {
    const response = await axiosInstance.get(`/posts/${projectId}/board/${boardPostId}/comments`);
    return response;
  },

  // 댓글 작성 (설계서 규격 유지)
  createComment: async (projectId, boardPostId, content) => {
    const response = await axiosInstance.post(`/posts/${projectId}/board/${boardPostId}/comments`, { content });
    return response;
  },

  // 댓글 수정 (설계서 규격: PATCH /api/comments/{commentId})
  updateComment: async (commentId, content) => {
    const response = await axiosInstance.patch(`/comments/${commentId}`, { content });
    return response;
  },

  // 댓글 삭제 (설계서 규격: DELETE /api/comments/{commentId})
  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    return response;
  },
  };

export default boardApi;