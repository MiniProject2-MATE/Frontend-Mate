import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});

// Request Interceptor: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 응답 데이터 가공 및 401 처리
axiosInstance.interceptors.response.use(
  (response) => {
    // 성공 시 res.data.data 반환
    return response.data.data;
  },
  async (error) => {
    const { config, response } = error;
    const status = response?.status;
    const errorCode = response?.data?.error?.code;

    // 401 에러(AUTH_001 등) 시 authStore의 refreshToken을 이용해 /api/auth/refresh를 호출하고,
    // 성공 시 원래 요청을 재시도해. 재발급 실패 시에만 logout() 및 /login 리다이렉트를 수행해.
    if ((status === 401 || errorCode === 'AUTH_001') && !config._retry) {
      config._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // axiosInstance가 아닌 기본 axios를 사용하여 재발급 요청 (인터셉터 순환 방지)
          const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            
            // 설계서 4.1.3에 따르면 accessToken만 반환될 수 있음. 
            // 새로운 refreshToken이 없으면 기존 것을 유지.
            const nextRefreshToken = newRefreshToken || refreshToken;

            // Store 업데이트
            useAuthStore.getState().updateTokens(accessToken, nextRefreshToken);
            
            // 기존 헤더 업데이트 후 재시도
            config.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(config);
          }
        } catch (refreshError) {
          // 재발급 실패 시 로그아웃 및 로그인 페이지로 이동
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // 리프레시 토큰이 없을 경우
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
