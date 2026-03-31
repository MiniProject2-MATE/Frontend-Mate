import axiosInstance from './axiosInstance';

export const authApi = {
  // 로그인 API
  login: async (credentials) => {
    // credentials: { email, password }
    return await axiosInstance.post('/auth/login', credentials);
  },

  // 회원가입 API
  signup: async (userData) => {
    // [필수] 설계서 명세에 따른 파라미터 구성:
    // email, password, nickname, position, techStacks, phoneNumber
    return await axiosInstance.post('/auth/signup', userData);
  },

  // 토큰 갱신 API (Axios Interceptor에서 주로 활용)
  refresh: async (refreshToken) => {
    return await axiosInstance.post('/auth/refresh', { refreshToken });
  }
};

export default authApi;
