import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Link, Alert, InputAdornment, IconButton, useMediaQuery, useTheme, Divider } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = response;
      setAuth(accessToken, refreshToken, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || '로그인 정보를 다시 확인해주세요.');
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
      bgcolor: 'background.default', // 연한 회색/푸른색 배경
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

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 4, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>이메일</Typography>
              <TextField
                fullWidth
                placeholder="email@example.com"
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
                placeholder="비밀번호를 입력하세요"
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
    </Box>
  );
};

export default LoginPage;
