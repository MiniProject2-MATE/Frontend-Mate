import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, 
  LinearProgress, Stack, Chip, Avatar, Grid
} from '@mui/material';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button'; 
import axiosInstance from '../api/axiosInstance'; 
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const { showToast } = useUiStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      setIsLoading(true);
      try {
        // [수정] postApi 규격에 맞춰 /api/projects/:id 호출
        const response = await axiosInstance.get(`/projects/${id}`);
        // MSW/API 응답 구조 { success: true, data: { ... } } 에 대응
        const postData = response.data || response;
        setPost(postData);
      } catch (error) {
        console.error("데이터를 불러오지 못했습니다.", error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'warning');
      navigate('/login', { state: { from: `/posts/${id}/apply` } });
      return;
    }
    
    // 작성자 본인 확인 (post.ownerNickname 또는 post.owner.nickname)
    const ownerName = post?.owner?.nickname || post?.ownerNickname;
    if (user?.nickname === ownerName) {
      showToast('본인이 작성한 공고에는 지원할 수 없습니다.', 'error');
      return;
    }

    navigate(`/posts/${id}/apply`);
  };

  if (isLoading) return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;
  if (!post) return <Typography sx={{ mt: 20, textAlign: 'center', fontWeight: 700 }}>데이터를 찾을 수 없습니다.</Typography>;

  // 모집 현황 계산 로직
  const recruitCount = post.recruitCount || 1;
  const currentCount = post.currentCount || 0;
  const progress = (currentCount / recruitCount) * 100;
  const remainingCount = recruitCount - currentCount;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[
          { label: '홈', path: '/' }, 
          { label: '프로젝트 탐색', path: '/posts' }, 
          { label: '상세 보기' }
        ]} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mt: 2 }}>
          
          {/* [좌측 본문 영역] */}
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 6, borderTop: '6px solid #6C63FF', border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip 
                      label={post.category === 'PROJECT' ? '프로젝트' : '스터디'} 
                      sx={{ bgcolor: '#F3F4F6', color: '#4B5563', fontWeight: 900, borderRadius: 1.5, height: 28 }} 
                    />
                    <Typography variant="body2" sx={{ color: post.status === 'RECRUITING' ? '#22C55E' : '#EF4444', fontWeight: 900 }}>
                      ● {post.status === 'RECRUITING' ? '모집중' : '모집종료'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                    <VisibilityIcon sx={{ fontSize: 16 }} /> 조회 {post.viewCount || 0}
                  </Typography>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  {post.title}
                </Typography>

                <Stack direction="row" spacing={1.2} sx={{ mb: 5, flexWrap: 'wrap' }}>
                  {post.techStacks?.map(stack => (
                    <Chip key={stack} label={stack} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, px: 0.5 }} />
                  ))}
                </Stack>

                <Divider sx={{ mb: 5 }} />

                <Grid container spacing={2}>
                  {[
                    { icon: <GroupsIcon />, label: '모집 인원', value: `${recruitCount}명` },
                    { icon: <LocationOnIcon />, label: '진행 방식', value: post.onOffline || '온라인' },
                    { icon: <CalendarMonthIcon />, label: '모집 마감', value: post.endDate },
                  ].map((info, index) => (
                    <Grid item xs={4} key={index}>
                      <Box sx={{ bgcolor: '#F9FAFB', p: 3, borderRadius: 4, textAlign: 'center', height: '100%' }}>
                        <Box sx={{ color: '#6C63FF', mb: 1 }}>{info.icon}</Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{info.label}</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 900, color: '#1F2937' }}>{info.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 24, bgcolor: '#6C63FF', borderRadius: 1 }} />
                  프로젝트 소개
                </Typography>
                <Typography sx={{ color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05rem', fontWeight: 500 }}>
                  {post.content}
                </Typography>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 사이드바 영역] */}
          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              
              {/* 모집 현황 카드 */}
              <Paper elevation={0} sx={{ 
                p: 4, borderRadius: 6, 
                background: 'linear-gradient(135deg, #6C63FF 0%, #4834D4 100%)', color: 'white',
                boxShadow: '0 20px 40px rgba(108, 99, 255, 0.25)'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}>CURRENT STATUS</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  {currentCount} <span style={{ fontSize: '1.4rem', opacity: 0.8, fontWeight: 700 }}>/ {recruitCount} Joiners</span>
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.15)', py: 1, px: 2, borderRadius: 2, display: 'inline-block' }}>
                  {remainingCount > 0 ? `🚀 ${remainingCount}명 더 모집 중!` : '🎉 모집이 완료되었습니다'}
                </Typography>

                {/* 프로그레스 바 */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 10, borderRadius: 10, mb: 4, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'white', height: '100%', width: `${progress}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </Box>

                <CustomButton 
                  fullWidth 
                  onClick={handleApplyClick}
                  disabled={post.status !== 'RECRUITING' || remainingCount <= 0}
                  sx={{ 
                    bgcolor: 'white', color: '#6C63FF', height: 60, borderRadius: 4, fontWeight: 900, fontSize: '1.15rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#F3F4F6', transform: 'translateY(-2px)' },
                    '&:disabled': { bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }
                  }}
                >
                  {post.status !== 'RECRUITING' ? '모집 종료' : '지금 지원하기'}
                </CustomButton>
              </Paper>

              {/* 방장 정보 카드 */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 900, mb: 3, letterSpacing: '0.05em' }}>PROJECT OWNER</Typography>
                <Stack direction="row" spacing={2.5} alignItems="center">
                  <Avatar sx={{ width: 64, height: 64, bgcolor: '#6C63FF', fontSize: '1.5rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(108,99,255,0.2)' }}>
                    {(post.owner?.nickname || post.ownerNickname)?.[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.5 }}>
                      {post.owner?.nickname || post.ownerNickname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 700, mb: 1.5 }}>
                      {post.owner?.job || '시니어 개발자'}
                    </Typography>
                    <Chip 
                      label={post.owner?.position || 'FE'} 
                      size="small" 
                      sx={{ bgcolor: '#F5F3FF', color: '#6C63FF', fontWeight: 900, borderRadius: 1.5, px: 0.5 }} 
                    />
                  </Box>
                </Stack>
              </Paper>

            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PostDetailPage;