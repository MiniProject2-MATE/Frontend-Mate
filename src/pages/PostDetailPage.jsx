import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Divider, LinearProgress, Stack, Grid2 as Grid } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Breadcrumb from '@/component/common/Breadcrumb';
import CustomButton from '@/component/common/Button'; 
import Tag from '@/component/common/Tag'; 
import CustomAvatar from '@/component/common/Avatar';
import { usePostStore } from '@/store/postStore';

const PostDetailPage = () => {
  const { id } = useParams();
  const { currentPost, setCurrentPost, clearCurrentPost, setLoading, isLoading } = usePostStore();

  useEffect(() => {
    setLoading(true);
    const mockData = {
      title: "사이드 프로젝트 백엔드 구함", category: "PROJECT", status: "모집중", viewCount: 150,
      owner: { nickname: "user", position: "BE" }, techStacks: ["Java", "Spring Boot"],
      onOffline: "온라인", endDate: "2026.04.30", content: "함께 성장할 팀원을 찾습니다!",
      currentCount: 1, recruitCount: 3, members: [{ nickname: "user", position: "백엔드", role: "OWNER" }]
    };
    setCurrentPost(mockData);
    setLoading(false);
    return () => clearCurrentPost();
  }, [id, clearCurrentPost, setCurrentPost, setLoading]);

  if (isLoading || !currentPost) return <LinearProgress />;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: '탐색', path: '/posts' }, { label: '상세 보기' }]} />
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, borderTop: '4px solid #7275FC' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{currentPost.title}</Typography>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body1">{currentPost.content}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #6C63FF 0%, #4834D4 100%)', color: 'white' }}>
              <Typography variant="h4">{currentPost.currentCount} / {currentPost.recruitCount}</Typography>
              <CustomButton fullWidth sx={{ bgcolor: 'white', mt: 2 }}>지원하기</CustomButton>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
export default PostDetailPage;