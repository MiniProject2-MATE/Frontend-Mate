import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, TextField, Button,
  Radio, RadioGroup, FormControlLabel, FormControl,
  Stack, IconButton, Divider, LinearProgress, FormLabel,
  Alert, AlertTitle
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// API 연동 전까지 주석 처리
// import axiosInstance from '../api/axiosInstance'; 
import { useAuthStore } from '../store/authStore';
import Breadcrumb from '../component/common/Breadcrumb';

const PostApplyPage = () => {
  const { id } = useParams(); // URL의 :id 값을 가져옴
  const navigate = useNavigate();
  const { user } = useAuthStore(); // 로그인 유저 정보 (본인 확인용)

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 서버에서 받아올 공고 상태 데이터
  const [postInfo, setPostInfo] = useState({
    title: '',
    isOwner: false,
    isApplied: false,
    status: '모집중'
  });

  // 지원서 폼 데이터
  const [formData, setFormData] = useState({
    position: '',
    content: '',
    link: '',
    contact: ''
  });

  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      try {
        /**
         * [MOCK DATABASE] 
         * 상세 페이지(PostDetailPage)에서 사용하는 데이터와 ID를 맞춰 관리합니다.
         */
        const mockPostsDB = [
          {
            id: "1",
            title: "사이드 프로젝트 백엔드 구함",
            ownerNickname: "other_user1",
            alreadyApplied: false,
            status: "모집중"
          },
          {
            id: "2",
            title: "대학생 팀플 메이커 플랫폼 토이 프로젝트",
            ownerNickname: "user", // 내 닉네임과 동일하게 설정하여 '본인 글' 테스트 가능
            alreadyApplied: false,
            status: "모집중"
          },
          {
            id: "3",
            title: "React 디자인 시스템 구축 전문가 모집",
            ownerNickname: "design_king",
            alreadyApplied: true, // 이미 지원함 테스트 가능
            status: "모집중"
          }
        ];

        // 현재 URL의 id와 일치하는 데이터 찾기
        const currentPost = mockPostsDB.find(post => post.id === id);

        setTimeout(() => {
          if (currentPost) {
            setPostInfo({
              title: currentPost.title,
              // 내 닉네임과 작성자 닉네임 비교
              isOwner: user?.nickname === currentPost.ownerNickname,
              isApplied: currentPost.alreadyApplied,
              status: currentPost.status
            });
          } else {
            // 해당 ID의 글이 없을 경우 예외 처리
            setPostInfo({
              title: "존재하지 않거나 삭제된 공고입니다.",
              isOwner: false,
              isApplied: false,
              status: "종료"
            });
          }
          setIsLoading(false);
        }, 500);

      } catch {
        console.error("데이터 로드 중 에러 발생");
        navigate('/error');
      }
    };

    fetchPostData();
  }, [id, user, navigate]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || postInfo.isApplied || postInfo.isOwner) return;

    setIsSubmitting(true);
    try {
      // 실제 API 호출 대신 콘솔 로그와 타이머로 시뮬레이션
      console.log("지원서 제출 데이터:", formData);
      
      setTimeout(() => {
        alert("지원이 완료되었습니다!");
        navigate('/mypage/applies');
      }, 1000);
    } catch {
      alert("제출 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Box sx={{ mt: 20 }}><LinearProgress /></Box>;

  // [본인 글 지원 차단]
  if (postInfo.isOwner) {
    return (
      <Container maxWidth="sm" sx={{ mt: 15 }}>
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
          <AlertTitle sx={{ fontWeight: 900, fontSize: '1.2rem' }}>접근 제한</AlertTitle>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            본인이 작성한 공고에는 지원할 수 없습니다. <br />
            모집 현황은 <strong>내 모집글 관리</strong>에서 확인해 주세요.
          </Typography>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => navigate(-1)} 
            sx={{ borderRadius: 2, fontWeight: 800 }}
          >
            이전 페이지로 돌아가기
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="md">
        {/* 상단 네비게이션 및 브레드크럼 */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F3F4F6' } }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '상세보기', path: `/posts/${id}` }, { label: '지원하기' }]} />
        </Stack>

        {/* 중복 지원 상태 알림 */}
        {postInfo.isApplied && (
          <Alert severity="warning" icon={<CheckCircleIcon />} sx={{ mb: 4, borderRadius: 4, fontWeight: 700 }}>
            이미 지원한 프로젝트입니다. 마이페이지에서 지원 현황을 확인하실 수 있습니다.
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
          {/* 공고 요약 바 (PostSummaryBar) */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 2, display: 'block', mb: 1 }}>
              APPLY FOR PROJECT
            </Typography>
            <Box sx={{ p: 3, bgcolor: '#F8F9FF', borderRadius: 4, border: '1px solid #E0E7FF' }}>
              <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 800, mb: 0.5 }}>🚀 지원 중인 공고</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>{postInfo.title}</Typography>
            </Box>
          </Box>

          <Stack component="form" spacing={5} onSubmit={handleSubmit}>
            {/* 1. 지원 분야 선택 */}
            <FormControl required disabled={postInfo.isApplied}>
              <FormLabel sx={{ fontWeight: 800, color: '#111827', mb: 2 }}>1. 지원 분야 선택 (필수)</FormLabel>
              <RadioGroup row value={formData.position} onChange={handleChange('position')}>
                {['프론트엔드', '백엔드', '디자이너', '기획자', '기타'].map((pos) => (
                  <FormControlLabel 
                    key={pos} 
                    value={pos} 
                    control={<Radio />} 
                    label={<Typography sx={{ fontWeight: 600 }}>{pos}</Typography>} 
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* 2. 자기소개 및 지원 동기 */}
            <Box>
              <FormLabel sx={{ fontWeight: 800, color: '#111827', mb: 2, display: 'block' }}>2. 자기소개 및 지원 동기 (필수)</FormLabel>
              <TextField
                fullWidth multiline rows={6}
                disabled={postInfo.isApplied}
                placeholder="함께하고 싶은 이유와 본인의 강점을 적어주세요. (최소 20자)"
                value={formData.content}
                onChange={handleChange('content')}
                helperText={`${formData.content.length} / 500 (최소 20자 작성)`}
                FormHelperTextProps={{ sx: { textAlign: 'right', fontWeight: 600, color: formData.content.length < 20 ? 'error.main' : 'text.secondary' } }}
                sx={inputStyle}
              />
            </Box>

            {/* 3. 포트폴리오 링크 */}
            <Box>
              <FormLabel sx={{ fontWeight: 800, color: '#111827', mb: 2, display: 'block' }}>3. 포트폴리오 또는 참고 링크 (선택)</FormLabel>
              <TextField
                fullWidth
                disabled={postInfo.isApplied}
                placeholder="https://github.com/my-repo/portfolio"
                value={formData.link}
                onChange={handleChange('link')}
                sx={inputStyle}
              />
            </Box>

            {/* 4. 연락처 */}
            <Box>
              <FormLabel sx={{ fontWeight: 800, color: '#111827', mb: 2, display: 'block' }}>4. 오픈채팅 또는 연락처 (필수)</FormLabel>
              <TextField
                fullWidth
                disabled={postInfo.isApplied}
                placeholder="https://open.kakao.com/o/sXXXXXX"
                value={formData.contact}
                onChange={handleChange('contact')}
                sx={inputStyle}
              />
            </Box>

            {/* 제출 및 취소 버튼 */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 4 }}>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => navigate(-1)}
                sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 800, color: '#6B7280', borderColor: '#E5E7EB' }}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={isSubmitting || postInfo.isApplied || formData.content.length < 20 || !formData.position || !formData.contact}
                startIcon={postInfo.isApplied ? <CheckCircleIcon /> : <SendIcon />}
                sx={{ 
                  px: 5, py: 1.5, borderRadius: 3, fontWeight: 900, 
                  bgcolor: postInfo.isApplied ? '#10B981' : '#6366F1',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)',
                  '&:hover': { bgcolor: postInfo.isApplied ? '#059669' : '#4F46E5' }
                }}
              >
                {postInfo.isApplied ? '이미 지원 완료' : (isSubmitting ? '제출 중...' : '지원서 제출하기')}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#F9FAFB',
    borderRadius: 3,
    fontSize: '0.95rem',
    fontWeight: 600,
    '& fieldset': { borderColor: '#E5E7EB' },
    '&.Mui-disabled': { bgcolor: '#F3F4F6', color: '#9CA3AF' },
    '&:hover fieldset': { borderColor: '#6366F1' },
    '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' },
    '&.Mui-focused': { bgcolor: 'white' }
  }
};

export default PostApplyPage;