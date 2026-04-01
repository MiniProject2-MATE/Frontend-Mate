import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, 
  LinearProgress, Stack, Chip, Avatar 
} from '@mui/material';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';

// 공통 컴포넌트 (상대 경로 확인 필요)
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button'; 

const PostDetailPage = () => {
  const { id } = useParams();

  // 1. 상태 관리: ESLint 에러 방지를 위해 isLoading 초기값은 true
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2. Mock Data: API 연동 전까지 사용할 데이터
    const mockData = {
      title: "사이드 프로젝트 백엔드 구함", 
      category: "PROJECT", 
      status: "모집중", 
      viewCount: 150,
      owner: { 
        nickname: "user", 
        position: "BE", 
        job: "백엔드 개발자",
        avatar: "" 
      }, 
      techStacks: ["Java", "Spring Boot", "MySQL"],
      onOffline: "온라인", 
      endDate: "2026.04.30", 
      content: "JPA 실력이 출중하신 분을 모십니다.\n\n함께 성장할 수 있는 팀원을 찾고 있습니다. 관심 있으신 분은 지원해 주세요!\n\n현재 프로젝트는 초기 기획 단계이며, 데이터베이스 설계부터 함께하실 분을 찾고 있습니다.",
      currentCount: 1, 
      recruitCount: 3, 
      members: [
        { nickname: "user", position: "BE", job: "백엔드 개발자", role: "OWNER" }
      ]
    };

    // 3. 데이터 로딩 시뮬레이션 (300ms 후 로딩 완료)
    const timer = setTimeout(() => {
      setPost(mockData);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  // 로딩 화면 (MUI LinearProgress)
  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: '100px' }}>
        <LinearProgress color="primary" />
        <Typography sx={{ textAlign: 'center', mt: 2, fontWeight: 700, color: 'text.secondary' }}>
          상세 정보를 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  // 데이터가 없을 경우 예외 처리
  if (!post) return <Typography sx={{ mt: 20, textAlign: 'center' }}>데이터를 찾을 수 없습니다.</Typography>;

  const progress = (post.currentCount / post.recruitCount) * 100;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        {/* 브레드크럼 */}
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/posts' }, { label: '상세 보기' }]} />

        {/* 메인 레이아웃 (좌측 본문 8 : 우측 사이드바 4) */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mt: 2 }}>
          
          {/* [좌측 영역] */}
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              
              {/* 상단 메타 정보 카드 */}
              <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 4, borderTop: '4px solid #7275FC', border: '1px solid #EEEEEE' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip label={post.category} sx={{ bgcolor: '#F3F4F6', color: '#4B5563', fontWeight: 800, borderRadius: 1.5, height: 26, fontSize: '0.75rem' }} />
                    <Typography variant="body2" sx={{ color: '#22C55E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      ● {post.status}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon sx={{ fontSize: 14 }} /> 조회 {post.viewCount}
                  </Typography>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.03em', color: '#111827', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                  {post.title}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#EEF2FF', color: '#6366F1', fontSize: '0.875rem', fontWeight: 800 }}>
                    {post.owner.nickname.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 800, color: '#1F2937' }}>{post.owner.nickname}</Typography>
                  <Chip label={post.owner.position} variant="outlined" size="small" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 800, color: '#9CA3AF', borderColor: '#E5E7EB' }} />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                  {post.techStacks.map(stack => (
                    <Chip key={stack} label={stack} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, borderRadius: 2 }} />
                  ))}
                </Stack>

                <Divider sx={{ my: 4, borderColor: '#F9FAFB' }} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { label: '카테고리', value: post.category },
                    { label: '진행 방식', value: post.onOffline },
                    { label: '모집 마감일', value: post.endDate },
                  ].map((info) => (
                    <Box key={info.label} sx={{ flex: 1, bgcolor: '#F9FAFB', p: 2, borderRadius: 3, textAlign: 'center', border: '1px solid #F3F4F6' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5, fontWeight: 600 }}>{info.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#374151' }}>{info.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* 상세 내용 카드 */}
              <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', color: '#111827' }}>
                  <Box component="span" sx={{ width: 4, height: 20, bgcolor: '#6C63FF', mr: 2, borderRadius: 1 }} />
                  프로젝트 소개
                </Typography>
                <Typography sx={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: 500, fontSize: '1.05rem' }}>
                  {post.content}
                </Typography>
              </Paper>

              {/* 참여 멤버 카드 */}
              <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', color: '#111827' }}>
                  <Box component="span" sx={{ width: 4, height: 20, bgcolor: '#6C63FF', mr: 2, borderRadius: 1 }} />
                  현재 멤버 ({post.currentCount} / {post.recruitCount}명)
                </Typography>
                <Stack spacing={2.5}>
                  {post.members.map((member) => (
                    <Box key={member.nickname} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 44, height: 44, bgcolor: '#6C63FF', color: 'white', fontWeight: 900 }}>
                          {member.nickname.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#111827' }}>{member.nickname}</Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>{member.job} · {member.position}</Typography>
                        </Box>
                      </Stack>
                      <Chip label="👑 OWNER" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 900, fontSize: '0.65rem', height: 24, borderRadius: 1.5 }} />
                    </Box>
                  ))}
                  {[...Array(post.recruitCount - post.currentCount)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 1, opacity: 0.5 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PersonIcon sx={{ color: '#D1D5DB' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#9CA3AF', fontWeight: 500 }}>모집 중인 메이트를 기다리고 있어요</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 사이드바 영역] */}
          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              
              {/* 모집 현황 & 지원 버튼 (Gradient 카드) */}
              <Paper elevation={0} sx={{ 
                p: 5, borderRadius: 5, 
                background: 'linear-gradient(135deg, #6C63FF 0%, #4834D4 100%)', 
                color: 'white',
                boxShadow: '0 20px 40px rgba(108,99,255,0.25)'
              }}>
                <Typography variant="caption" sx={{ opacity: 0.8, mb: 1.5, display: 'block', fontWeight: 700, letterSpacing: '0.05em' }}>CURRENT STATUS</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                  {post.currentCount} <Typography component="span" variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>/ {post.recruitCount} Joiners</Typography>
                </Typography>
                <Typography variant="body2" sx={{ display: 'block', mb: 4, opacity: 0.9, fontWeight: 600 }}>
                  {post.recruitCount - post.currentCount}명의 메이트가 더 필요합니다
                </Typography>

                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 10, borderRadius: 10, mb: 6, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'white', height: '100%', width: `${progress}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </Box>

                <CustomButton 
                  fullWidth 
                  variant="contained" 
                  startIcon={<RocketLaunchIcon />}
                  sx={{ 
                    bgcolor: 'white', color: '#6C63FF', height: 60, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    mb: 2,
                    '&:hover': { bgcolor: '#F3F4F6', transform: 'translateY(-2px)' },
                    transition: 'all 0.2s'
                  }}
                >
                  프로젝트 지원하기
                </CustomButton>

                {/* 팀 전용 게시판 이동 버튼 추가 */}
                <CustomButton 
                  fullWidth 
                  variant="outlined" 
                  component={Link}
                  to={`/posts/${id}/board`}
                  startIcon={<ForumIcon />}
                  sx={{ 
                    color: 'white', borderColor: 'rgba(255,255,255,0.5)', height: 50, borderRadius: 4, fontWeight: 800,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  팀 전용 게시판 이동
                </CustomButton>
              </Paper>

              {/* 작성자 간략 정보 카드 */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#D1D5DB', display: 'block', mb: 3, letterSpacing: '0.05em' }}>PROJECT OWNER</Typography>
                <Stack direction="row" spacing={2.5} alignItems="center">
                  <Avatar sx={{ width: 60, height: 60, bgcolor: '#6C63FF', color: 'white', fontSize: '1.5rem', fontWeight: 900 }}>
                    {post.owner.nickname.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#111827' }}>{post.owner.nickname}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1, fontWeight: 600 }}>{post.owner.job}</Typography>
                    <Chip label={post.owner.position} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '0.65rem', height: 22 }} />
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