import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Divider, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FormInput from '@/component/common/FormInput';
import Button from '@/component/common/Button';

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value) => /^[0-9]{10,11}$/.test(value.replace(/-/g, ''));

  const handleSubmit = async () => {
    setError(''); setEmailError(''); setPhoneError(''); setResult(false);
    let isValid = true;
    if (!email) { setEmailError('이메일을 입력해주세요.'); isValid = false; }
    else if (!validateEmail(email)) { setEmailError('올바른 이메일 형식이 아닙니다.'); isValid = false; }
    if (!phoneNumber) { setPhoneError('전화번호를 입력해주세요.'); isValid = false; }
    else if (!validatePhone(phoneNumber)) { setPhoneError('올바른 전화번호 형식이 아닙니다.'); isValid = false; }
    if (!isValid) return;
    setIsLoading(true);
    try {
      // TODO: 백엔드 연동 시 주석 해제
      // const response = await authApi.findPassword({ email, phoneNumber: phoneNumber.replace(/-/g, '') });
      // setResult(response.data.message);
      setResult(true);
    } catch (err) {
      setError(err.response?.status === 400
        ? '입력하신 정보가 일치하지 않습니다.'
        : '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 성공 화면 ──────────────────────────────────────
  if (result) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#EEF2F8', py: 8, px: 2 }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 6, boxShadow: '0 8px 40px rgba(108,99,255,0.1)', textAlign: 'center' }}>

            <Typography sx={{ fontSize: 48, mb: 2 }}>🔑</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', mb: 1 }}>
              임시 비밀번호 발급 완료
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              회원님의 임시 비밀번호는
            </Typography>

            {/* 임시 비밀번호 박스 */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#EDE9FF', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 2 }}>
                mate7788!@#$
              </Typography>
            </Paper>

            {/* 경고 박스 */}
            <Box sx={{ background: '#FEF3C7', borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400E', mb: 0.5 }}>
                ⚠️ 보안을 위해 메모해 두시고,
              </Typography>
              <Typography variant="caption" sx={{ color: '#92400E', lineHeight: 1.6 }}>
                로그인 후 즉시 마이페이지에서 비밀번호를 변경해 주세요.
              </Typography>
            </Box>

            {/* 로그인하러 가기 버튼 */}
            <Button
              fullWidth variant="contained"
              component={RouterLink} to="/login"
              style={{ width: '100%', height: 52, fontSize: '1rem', fontWeight: 800 }}
            >
              로그인하러 가기
            </Button>

          </Paper>
        </Container>
      </Box>
    );
  }

  // ── 기본 입력 화면 ──────────────────────────────────
  return (
    <Box sx={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#EEF2F8', py: 8, px: 2 }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 6, boxShadow: '0 8px 40px rgba(108,99,255,0.1)', textAlign: 'center' }}>

          {/* 로고 + 타이틀 */}
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.05em', mb: 1 }}>mate</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>비밀번호 찾기</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>비밀번호를 잊으셨나요?</Typography>

          {/* 이메일 입력 */}
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <FormInput
              label="이메일(아이디)"
              placeholder="user@mate.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              status={emailError ? 'error' : undefined}
              message={emailError}
              required
            />
          </Box>

          {/* 전화번호 입력 */}
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <FormInput
              label="휴대폰 번호"
              placeholder="01012345678"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(''); }}
              status={phoneError ? 'error' : undefined}
              message={phoneError || '하이픈(-) 없이 숫자만 입력해 주세요.'}
              required
            />
          </Box>

          {/* 버튼 */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Button
              fullWidth variant="contained"
              onClick={handleSubmit} disabled={isLoading}
              style={{ width: '100%', height: 52, fontSize: '1rem', fontWeight: 800 }}
            >
              {isLoading ? '처리 중...' : '임시 비밀번호 발급받기'}
            </Button>
          </Box>

          {/* 에러 */}
          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', fontWeight: 600, mb: 2 }}>
              ✗ {error}
            </Typography>
          )}

          {/* 하단 링크 */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link component={RouterLink} to="/login" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              ← 로그인으로 돌아가기
            </Link>
            <Link component={RouterLink} to="/find-email" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              아이디 찾기 →
            </Link>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
};

export default FindPasswordPage;