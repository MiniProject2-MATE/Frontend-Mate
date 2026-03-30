import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
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

// Response Interceptor: 401 에러 대응 및 토큰 자동 갱신
axiosInstance.interceptors.response.use(
  (response) => {
    // 성공 시 res.data.data 반환 (서버 응답 구조에 맞춰 가공)
    return response.data.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    // RESTAPI설계서.md의 3.2 JWT 인증 흐름을 완벽히 구현
    // 응답에서 401 에러가 발생하고, 원래 요청이 재시도된 요청이 아닐 경우 (!originalRequest._retry)
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // authStore에서 refreshToken을 꺼내 POST /api/auth/refresh API를 호출
          // axiosInstance가 아닌 기본 axios를 사용하여 재발급 요청 (인터셉터 순환 방지)
          const refreshRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          if (refreshRes.data.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
            
            // 성공 시: 새로 발급받은 토큰들을 authStore.getState().setTokens()로 저장
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken || refreshToken);
            
            // 원래 요청의 헤더를 새 토큰으로 교체한 뒤 재요청(retry)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // 리프레시 토큰도 만료되었거나 에러 발생 시
          console.error('Token refresh failed:', refreshError);
        }
      }

      // 실패 시 (리프레시 토큰도 만료): logout() 호출 후 /login으로 강제 이동
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
