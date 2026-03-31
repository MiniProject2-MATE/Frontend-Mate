import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Divider, Grid, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FormInput from '@/component/common/FormInput';
import Button from '@/component/common/Button';

const FindEmailPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [validError, setValidError] = useState('');

  const validatePhone = (value) => {
    const cleaned = value.replace(/-/g, '');
    return /^[0-9]{10,11}$/.test(cleaned);
  };

  const handleSubmit = async () => {
    setError(''); setValidError(''); setResult(null);
    if (!phoneNumber) { setValidError('전화번호를 입력해주세요.'); return; }
    if (!validatePhone(phoneNumber)) { setValidError('올바른 전화번호 형식이 아닙니다.'); return; }
    setIsLoading(true);
    try {
      // const cleaned = phoneNumber.replace(/-/g, '');
      // const response = await authApi.findEmail({ phoneNumber: cleaned });
      // setResult(response.data.email);
      setResult('ji****@gmail.com');
    } catch (err) {
      setError(err.response?.status === 404
        ? '해당 번호로 가입된 정보를 찾을 수 없습니다.'
        : '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F0EFFE', py: 8, px: 2 }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 6, boxShadow: '0 8px 40px rgba(108,99,255,0.1)', textAlign: 'center' }}>

          {/* 로고 + 타이틀 */}
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.05em', mb: 1 }}>mate</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>아이디 찾기</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>아이디(이메일)를 잊으셨나요?</Typography>

          {/* 전화번호 입력 */}
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <FormInput
              label="휴대폰 번호"
              placeholder="01012345678"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setValidError(''); }}
              status={validError ? 'error' : undefined}
              message={validError || '하이픈(-) 없이 숫자만 입력해 주세요.'}
              required
            />
          </Box>

          {/* 버튼 */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ width: '100%', height: 52, fontSize: '1rem', fontWeight: 800 }}
            >
              {isLoading ? '조회 중...' : '이메일 찾기'}
            </Button>
          </Box>

          {/* 에러 */}
          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', fontWeight: 600, mb: 2 }}>
              ✗ {error}
            </Typography>
          )}

          {/* 성공 결과 */}
          {result && (
            <Box sx={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 3, p: 3, mb: 2 }}>
              <Typography sx={{ fontSize: 28, mb: 1 }}>✅</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#040404', mb: 2 }}>
                가입된 이메일을 찾았습니다
              </Typography>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff', mb: 2, border: '1px solid #BBF7D0' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: 1 }}>
                  {result}
                </Typography>
              </Paper>
              <Box sx={{ width: '100%', mb: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  style={{ width: '100%', height: 48, fontWeight: 800 }}
                >
                  로그인하러 가기
                </Button>
              </Box>
                <Divider sx={{ my: 2 }} />
                <Link component={RouterLink} to="/login" sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  아이디는 찾았지만 비밀번호가 기억나지 않나요?<br />
                </Link>
                <Link component={RouterLink} to="/find-password" sx={{ 
                fontSize: '0.7rem', color: 'primary.main', fontWeight: 600, 
                textDecoration: 'none', display: 'block', textAlign: 'center'}}>
                비밀번호 찾기 바로가기<br /><br />
              </Link>
            </Box>
          )}

          {/* 하단 링크 */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link component={RouterLink} to="/login" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              ← 로그인으로 돌아가기
            </Link>
            <Link component={RouterLink} to="/find-password" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              비밀번호 찾기 →
            </Link>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
};

export default FindEmailPage;