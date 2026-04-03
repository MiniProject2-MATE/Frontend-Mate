import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// baseURL 끝에 /api가 붙어있는지 확인하거나, 수동으로 붙여줍니다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL, // 이제 모든 요청 앞에 자동으로 /api가 붙습니다.
  timeout: 5000,
  withCredentials: true, // [추가] 쿠키 및 인증 정보 포함
});

// Request Interceptor: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      // 설계서 규격에 따라 Bearer 접두사 확인 (이미 되어 있음)
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 공통 응답 포맷 처리 및 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => {
    // 설계서 규격: { success, data, message, timestamp }
    // 성공 시 data 필드만 반환하여 컴포넌트에서 res.data.data 대신 res로 바로 접근 가능하게 함
    return response.data.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    // 401 Unauthorized 에러 처리 (토큰 만료 등)
    if (response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // 설계서 규격: POST /api/auth/refresh { refreshToken }
          const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          if (refreshRes.data.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
            
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken || refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // 에러 발생 시에도 response.data에 에러 정보가 있다면 이를 reject 함
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;