import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, 
  LinearProgress, Stack, Chip, Avatar 
} from '@mui/material';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonIcon from '@mui/icons-material/Person';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button'; 
import axiosInstance from '../api/axiosInstance'; 
import { useAuthStore } from '../store/authStore';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      setIsLoading(true);
      try {
        const data = await axiosInstance.get(`/posts/${id}`);
        setPost(data);
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
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login', { state: { from: `/posts/${id}/apply` } });
      return;
    }
    
    if (user?.nickname === post?.ownerNickname) {
      alert("본인이 작성한 공고에는 지원할 수 없습니다.");
      return;
    }

    navigate(`/posts/${id}/apply`);
  };

  if (isLoading) return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;
  if (!post) return <Typography sx={{ mt: 20, textAlign: 'center' }}>데이터를 찾을 수 없습니다.</Typography>;

  // 계산 로직
  const progress = (post.currentCount / post.recruitCount) * 100;
  const remainingCount = post.recruitCount - post.currentCount;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/posts' }, { label: '상세 보기' }]} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mt: 2 }}>
          
          {/* [좌측 본문 영역] */}
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 4, borderTop: '4px solid #7275FC', border: '1px solid #EEEEEE' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip label={post.category} sx={{ bgcolor: '#F3F4F6', color: '#4B5563', fontWeight: 800, borderRadius: 1.5, height: 26 }} />
                    <Typography variant="body2" sx={{ color: '#22C55E', fontWeight: 800 }}>● 모집중</Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon sx={{ fontSize: 14 }} /> 조회 {post.viewCount || 0}
                  </Typography>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, color: '#111827' }}>{post.title}</Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap' }}>
                  {post.techStacks?.map(stack => (
                    <Chip key={stack} label={stack} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800 }} />
                  ))}
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { label: '방식', value: post.onOffline },
                    { label: '마감일', value: post.endDate },
                    { label: '인원', value: `${post.recruitCount}명` },
                  ].map((info) => (
                    <Box key={info.label} sx={{ flex: 1, bgcolor: '#F9FAFB', p: 2, borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{info.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>프로젝트 소개</Typography>
                <Typography sx={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{post.content}</Typography>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 사이드바 영역] - 사진 1번 스타일로 수정 */}
          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              
              {/* 모집 현황 카드 */}
              <Paper elevation={0} sx={{ 
                p: 4, borderRadius: 5, 
                background: 'linear-gradient(135deg, #6C63FF 0%, #4834D4 100%)', color: 'white',
                boxShadow: '0 10px 30px rgba(108, 99, 255, 0.2)'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 700, mb: 1 }}>현재 모집 현황</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                  {post.currentCount} <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>/ {post.recruitCount} Joiners</span>
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, fontWeight: 600 }}>
                  {remainingCount > 0 ? `${remainingCount}명 더 모집 중입니다` : '모집이 마감되었습니다'}
                </Typography>

                {/* 프로그레스 바 */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 10, mb: 4, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'white', height: '100%', width: `${progress}%`, transition: 'width 0.5s ease-in-out' }} />
                </Box>

                <CustomButton 
                  fullWidth variant="contained" 
                  onClick={handleApplyClick}
                  sx={{ 
                    bgcolor: 'white', color: '#6C63FF', height: 56, borderRadius: 3, fontWeight: 900, fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                >
                  🚀 지원하기
                </CustomButton>
              </Paper>

              {/* 방장 정보 카드 */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #EEEEEE' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 800, mb: 3 }}>방장 정보</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: '#6C63FF', fontSize: '1.2rem', fontWeight: 900 }}>
                    {post.owner?.nickname?.[0].toUpperCase() || post.ownerNickname?.[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                      {post.owner?.nickname || post.ownerNickname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      {post.owner?.job || '개발자'}
                    </Typography>
                    <Chip 
                      label={post.owner?.position || 'BE'} 
                      size="small" 
                      sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, borderRadius: 1 }} 
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