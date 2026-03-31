import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Link, InputAdornment, IconButton, useTheme, Divider } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import ToastMessage from '../component/common/ToastMessage';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const theme = useTheme();
  
  const from = location.state?.from || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 토스트 상태 관리
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setToast({
        open: true,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
        severity: 'warning'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = response;
      setAuth(accessToken, refreshToken, user);
      
      setToast({
        open: true,
        message: '성공적으로 로그인되었습니다!',
        severity: 'success'
      });
      
      // 성공 시 토스트 보여줄 시간을 고려해 조금 더 길게 대기 후 이동
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Login error full:', err);
      
      // axios 에러 구조에 맞춰 안전하게 메시지 추출
      let errorMessage = '로그인 정보를 다시 확인해주세요.';
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default',
      py: 8,
      px: 2
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
          p: { xs: 4, sm: 8 }, 
          borderRadius: 8, 
          boxShadow: '0 32px 64px rgba(0,0,0,0.05)',
          textAlign: 'center',
          bgcolor: '#ffffff'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 900, 
            color: 'primary.main', 
            mb: 1, 
            letterSpacing: '-0.05em' 
          }}>
            mate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            로그인
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6, fontWeight: 500 }}>
            팀 프로젝트의 시작, 메이트와 함께하세요.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>이메일</Typography>
              <TextField
                fullWidth
                placeholder="test@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 4, 
                    height: 56,
                    bgcolor: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'primary.light' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>비밀번호</Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 4, 
                    height: 56,
                    bgcolor: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'primary.light' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{ 
                height: 56, 
                fontSize: '1.1rem', 
                fontWeight: 800, 
                borderRadius: 4,
                boxShadow: '0 12px 24px rgba(108,99,255,0.25)',
                mb: 4
              }}
            >
              {isLoading ? '연결 중...' : '로그인'}
            </Button>

            <Divider sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 600 }}>OR</Typography>
            </Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                처음이신가요?
              </Typography>
              <Link component={RouterLink} to="/register" sx={{ 
                fontWeight: 800, 
                textDecoration: 'none', 
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}>
                회원가입 하기
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* 토스트 메시지 */}
      <ToastMessage 
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
};

export default LoginPage;
