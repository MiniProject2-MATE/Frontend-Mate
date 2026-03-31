import React, { useState } from 'react';
// import { useEffect } from 'react'; // TODO: 백엔드 API 연동 시 활성화
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Paper, Stack, Divider, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Grid from '@mui/material/Grid2'; 
import Breadcrumb from '@/components/common/Breadcrumb'; 
import Button from '@/components/common/Button'; 
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const PostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log("현재 수정 중인 게시글 ID:", id);

  const [formData, setFormData] = useState({
    category: 'STUDY', title: 'AI 기반 주식 스터디', recruitCount: 3, endDate: '2026.04.10', onOffline: 'ONLINE', content: 'Python 주식 분석 스터디입니다.'
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '80px', pb: 8 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: 'Explore', path: '/posts' }, { label: '모집글 수정' }]} />
        <Typography variant="h5" sx={{ fontWeight: 900, mt: 3 }}>▌ 모집글 수정</Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 6, border: '1px solid #EEEEEE' }}>
              <TextField fullWidth label="제목 *" value={formData.title} onChange={handleChange('title')} sx={{ mb: 4 }} />
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ flex: 1 }}>취소</Button>
                <Button variant="contained" color="warning" sx={{ flex: 1 }}>🔒 조기마감</Button>
                <Button variant="contained" sx={{ flex: 1 }}>💾 수정완료</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #FFCDD2', bgcolor: '#FFF9F9' }}>
              <Button fullWidth color="error" startIcon={<DeleteOutlineIcon />}>게시글 삭제</Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
export default PostEditPage;