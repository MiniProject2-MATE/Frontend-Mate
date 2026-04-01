import axiosInstance from './axiosInstance';

const boardApi = {
  // 프로젝트 상세 정보 조회 (제목, 멤버 등)
  getProjectDetail: async (projectId) => {
    const response = await axiosInstance.get(`/posts/${projectId}`);
    return response;
  },

  // 게시글 목록 조회
  getBoardPosts: async (projectId) => {
    // axiosInstance 인터셉터가 이미 response.data.data를 반환하므로 바로 response를 리턴
    const response = await axiosInstance.get(`/posts/${projectId}/board`);
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

  // 댓글 목록 조회
  getComments: async (projectId, boardPostId) => {
    const response = await axiosInstance.get(`/posts/${projectId}/board/${boardPostId}/comments`);
    return response;
  },

  // 댓글 작성
  createComment: async (projectId, boardPostId, content) => {
    const response = await axiosInstance.post(`/posts/${projectId}/board/${boardPostId}/comments`, { content });
    return response;
  },
};

export default boardApi;
