import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 1. useNavigate 추가
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
import { useAuthStore } from '../store/authStore'; // 2. 로그인 상태 확인을 위해 추가

// ... 상단 import 및 아이콘 생략

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. 목업 데이터베이스 (배열 형태로 여러 개 준비)
    const mockDB = [
      {
        id: "1",
        title: "사이드 프로젝트 백엔드 구함",
        category: "PROJECT",
        status: "모집중",
        viewCount: 150,
        owner: { nickname: "user1", position: "BE", job: "백엔드 개발자" },
        techStacks: ["Java", "Spring Boot", "MySQL"],
        onOffline: "온라인",
        endDate: "2026.04.30",
        content: "1번 프로젝트 상세 내용입니다. JPA 실력이 출중하신 분을 모십니다.",
        currentCount: 1,
        recruitCount: 3,
        members: [{ nickname: "user1", position: "BE", job: "백엔드 개발자", role: "OWNER" }]
      },
      {
        id: "2",
        title: "대학생 팀플 메이커 플랫폼 토이 프로젝트",
        category: "PROJECT",
        status: "모집중",
        viewCount: 210,
        owner: { nickname: "design_star", position: "DE", job: "UI/UX 디자이너" },
        techStacks: ["Figma", "React"],
        onOffline: "오프라인",
        endDate: "2026.05.15",
        content: "2번 프로젝트 상세 내용입니다. 대학생 전용 플랫폼을 함께 만들 팀원을 구합니다.",
        currentCount: 2,
        recruitCount: 4,
        members: [
          { nickname: "design_star", position: "DE", job: "UI/UX 디자이너", role: "OWNER" },
          { nickname: "fe_dev", position: "FE", job: "프론트엔드", role: "MEMBER" }
        ]
      },
      {
        id: "3",
        title: "React 디자인 시스템 구축 전문가 모집",
        category: "STUDY",
        status: "모집중",
        viewCount: 89,
        owner: { nickname: "king_of_fe", position: "FE", job: "프론트엔드 리드" },
        techStacks: ["React", "TypeScript", "Storybook"],
        onOffline: "온라인",
        endDate: "2026.06.01",
        content: "3번 프로젝트 상세 내용입니다. 회사에서 바로 쓸 수 있는 디자인 시스템을 연구합니다.",
        currentCount: 1,
        recruitCount: 5,
        members: [{ nickname: "king_of_fe", position: "FE", job: "프론트엔드 리드", role: "OWNER" }]
      }
    ];

    // 2. URL 파라미터로 넘어온 id와 일치하는 데이터 찾기
    const foundPost = mockDB.find((item) => item.id === String(id));

    const timer = setTimeout(() => {
      if (foundPost) {
        setPost(foundPost);
      } else {
        setPost(null); // 못 찾았을 때
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  // ... (이후 handleApplyClick 및 렌더링 로직은 기존과 동일)

  // 지원하기 버튼 핸들러
  const handleApplyClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login', { state: { from: `/posts/${id}/apply` } });
    } else {
      // 4. 지원 페이지로 이동
      navigate(`/posts/${id}/apply`);
    }
  };

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

  if (!post) return <Typography sx={{ mt: 20, textAlign: 'center' }}>데이터를 찾을 수 없습니다.</Typography>;

  const progress = (post.currentCount / post.recruitCount) * 100;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/posts' }, { label: '상세 보기' }]} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mt: 2 }}>
          
          {/* [좌측 영역] */}
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
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

              <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', color: '#111827' }}>
                  <Box component="span" sx={{ width: 4, height: 20, bgcolor: '#6C63FF', mr: 2, borderRadius: 1 }} />
                  프로젝트 소개
                </Typography>
                <Typography sx={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: 500, fontSize: '1.05rem' }}>
                  {post.content}
                </Typography>
              </Paper>

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

                {/* 5. 버튼 클릭 시 핸들러 연결 */}
                <CustomButton 
                  fullWidth 
                  variant="contained" 
                  startIcon={<RocketLaunchIcon />}
                  onClick={handleApplyClick}
                  sx={{ 
                    bgcolor: 'white', color: '#6C63FF', height: 60, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    '&:hover': { bgcolor: '#F3F4F6', transform: 'translateY(-2px)' },
                    transition: 'all 0.2s'
                  }}
                >
                  프로젝트 지원하기
                </CustomButton>
              </Paper>

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