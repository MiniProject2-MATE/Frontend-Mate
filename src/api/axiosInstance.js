import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// 설계서 규격인 /api가 중복되지 않도록 처리
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

// Request Interceptor: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 공통 응답 포맷 처리
axiosInstance.interceptors.response.use(
  (response) => {
    // 1. 설계서 v1.1 규격: { success, data, message, timestamp }
    // 응답 데이터가 객체이고 success 필드가 명시된 경우
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success === true) {
        // 성공 시 실제 데이터(data)만 반환 (data가 없으면 전체 반환)
        return response.data.data !== undefined ? response.data.data : response.data;
      }
      // success가 false인 경우 에러로 처리하여 catch 블록으로 보냄
      return Promise.reject(response.data);
    }

    // 2. 설계서 v1.1 [예외 사항]: 평문 텍스트(text/plain) 응답 처리
    // 아이디 찾기나 비밀번호 재설정 등에서 문자열만 올 경우 그대로 반환
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    // 401 Unauthorized: 토큰 만료 처리
    if (response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const refreshRes = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
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

    // 설계서 공통 에러 포맷에 맞춰 에러 객체 반환
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
