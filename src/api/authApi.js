import axiosInstance from './axiosInstance';

export const authApi = {
  // 로그인 API
  login: async (credentials) => {
    return await axiosInstance.post('/auth/login', credentials);
  },

  // 회원가입 API (Multipart/form-data 규격 준수)
  signup: async (userData, profileImage = null) => {
    const formData = new FormData();
    
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    const dataBlob = new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    });
    formData.append('data', dataBlob);

    return await axiosInstance.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 로그아웃 API
  logout: async () => {
    return await axiosInstance.post('/auth/logout');
  },

  // 토큰 갱신 API
  refresh: async (refreshToken) => {
    return await axiosInstance.post('/auth/refresh', { refreshToken });
  },

  // 내 정보 및 지원 내역 조회 API
  getUserInfo: async () => {
    return await axiosInstance.get('/users/me');
  }
};

export default authApi;