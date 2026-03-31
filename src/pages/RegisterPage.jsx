import React, { useState } from 'react';
import { Container, Grid, Box, Typography, TextField, Button, Paper, Link, Alert, MenuItem, Autocomplete, Chip, Divider } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    position: '',
    techStacks: [],
    phoneNumber: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const positions = [
    { value: 'FE', label: '프론트엔드 (FE)' },
    { value: 'BE', label: '백엔드 (BE)' },
    { value: 'DE', label: '디자이너 (DE)' },
    { value: 'PM', label: '기획자 (PM)' },
    { value: 'ETC', label: '기타 (ETC)' },
  ];

  const commonTechStacks = [
    'React', 'Vue', 'TypeScript', 'JavaScript', 'Next.js',
    'Spring Boot', 'Java', 'Node.js', 'Python', 'Go',
    'Figma', 'Adobe XD', 'Sketch',
    'AWS', 'Docker', 'Kubernetes', 'MySQL', 'MongoDB'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTechStacksChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, techStacks: newValue }));
  };

  const validate = () => {
    const { email, password, confirmPassword, nickname, position, techStacks, phoneNumber } = formData;
    if (!email || !password || !nickname || !position || techStacks.length === 0 || !phoneNumber) {
      setError('모든 필수 항목을 입력해주세요.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      const requestData = {
        ...formData,
        phoneNumber: formData.phoneNumber.replace(/-/g, ''),
      };
      delete requestData.confirmPassword;
      await authApi.signup(requestData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': { 
      borderRadius: 4, 
      bgcolor: '#F9FAFB',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'primary.light' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: 10 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
          p: { xs: 4, sm: 8 }, 
          borderRadius: 8, 
          boxShadow: '0 32px 64px rgba(0,0,0,0.05)',
          bgcolor: '#ffffff'
        }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: '-0.05em' }}>
              mate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              회원가입
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              새로운 메이트가 되어 프로젝트를 시작하세요.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 4 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>이메일 *</Typography>
              <TextField fullWidth name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} sx={inputStyle} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>비밀번호 *</Typography>
              <TextField fullWidth type="password" name="password" placeholder="8~20자 영문/숫자/특수문자" value={formData.password} onChange={handleChange} sx={inputStyle} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>비밀번호 확인 *</Typography>
              <TextField fullWidth type="password" name="confirmPassword" placeholder="비밀번호 재입력" value={formData.confirmPassword} onChange={handleChange} sx={inputStyle} />
            </Box>

            <Divider sx={{ my: 6 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>닉네임 *</Typography>
              <TextField fullWidth name="nickname" placeholder="사용할 닉네임" value={formData.nickname} onChange={handleChange} sx={inputStyle} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>휴대폰 번호 *</Typography>
              <TextField fullWidth name="phoneNumber" placeholder="01012345678" value={formData.phoneNumber} onChange={handleChange} sx={inputStyle} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>희망 직군 *</Typography>
              <TextField select fullWidth name="position" value={formData.position} onChange={handleChange} sx={inputStyle}>
                {positions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>기술 스택 *</Typography>
              <Autocomplete
                multiple
                options={commonTechStacks}
                value={formData.techStacks}
                onChange={handleTechStacksChange}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="filled" color="primary" label={option} {...getTagProps({ index })} sx={{ borderRadius: 2, fontWeight: 700 }} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" placeholder="스택 선택 또는 입력" sx={inputStyle} />
                )}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
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
              {isLoading ? '가입 중...' : '메이트 시작하기'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                이미 계정이 있으신가요?{' '}
                <Link component={RouterLink} to="/login" sx={{ fontWeight: 800, textDecoration: 'none', color: 'primary.main' }}>
                  로그인
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
