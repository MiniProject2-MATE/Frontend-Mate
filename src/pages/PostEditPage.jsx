import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, Stack, 
  TextField, Radio, Grid, RadioGroup, FormControlLabel 
} from '@mui/material'; // 여기서 FormLabel을 제거했습니다.

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import Button from '../component/common/Button'; 

// 1. 커스텀 라벨 컴포넌트 (파일 내에서 한 번만 선언)
const CustomFormLabel = ({ text }) => (
  <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, ml: 0.5, color: '#374151' }}>
    {text}
  </Typography>
);

const PostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: 'STUDY',
    title: 'AI 기반 주식 추천 알고리즘 스터디 모집',
    recruitCount: 3,
    endDate: '2026.04.10',
    onOffline: 'ONLINE',
    content: '안녕하세요! Python과 머신러닝을 활용해 주식 데이터를 분석하는 스터디입니다. 함께 성장할 열정적인 분들을 찾고 있습니다.'
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = () => {
    alert('수정이 완료되었습니다!');
    navigate(`/posts/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      alert('삭제되었습니다.');
      navigate('/posts');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 5 } }}>
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: 'Explore', path: '/posts' }, { label: '모집글 수정' }]} />

        <Box sx={{ mt: 3, mb: 10, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, color: '#111827' }}>
            ▌ 모집글 수정
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            기존에 작성한 모집 정보를 수정하거나 관리할 수 있습니다.
          </Typography>
        </Box>

        <Grid container spacing={5} justifyContent="center">
          {/* [좌측] 메인 폼 */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 8, border: '1px solid #F0F0F0', bgcolor: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
              
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 5 }}>▌ 기본 정보</Typography>
              
              <Box sx={{ mb: 5 }}>
                <CustomFormLabel text="모집 유형 *" />
                <Stack direction="row" spacing={3}>
                  {['PROJECT', 'STUDY'].map((type) => (
                    <Box
                      key={type}
                      onClick={() => setFormData({...formData, category: type})}
                      sx={{
                        flex: 1, p: 3, borderRadius: 5, cursor: 'pointer', border: '2.5px solid',
                        display: 'flex', alignItems: 'center', gap: 2.5, transition: '0.2s',
                        borderColor: formData.category === type ? '#6C63FF' : '#F3F4F6',
                        bgcolor: formData.category === type ? '#F5F6FF' : 'white',
                        fontWeight: 800
                      }}
                    >
                      <Radio checked={formData.category === type} size="small" sx={{ p: 0, color: '#D1D5DB' }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: formData.category === type ? '#111827' : '#9CA3AF' }}>
                        {type === 'PROJECT' ? '💻 프로젝트' : '📚 스터디'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ mb: 6 }}>
                <CustomFormLabel text="제목 *" />
                <TextField 
                  fullWidth value={formData.title} onChange={handleChange('title')}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, '& fieldset': { border: 'none' }, fontWeight: 600 } }} 
                />
              </Box>

              <Divider sx={{ my: 7 }} />

              <Typography variant="h6" sx={{ fontWeight: 900, mb: 5 }}>▌ 모집 조건</Typography>

              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12}>
                  <CustomFormLabel text="모집 인원 *" />
                  <TextField fullWidth type="number" value={formData.recruitCount} onChange={handleChange('recruitCount')}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, '& fieldset': { border: 'none' } } }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel text="모집 마감일 *" />
                  <Stack direction="row" spacing={1}>
                    <TextField fullWidth value={formData.endDate} onChange={handleChange('endDate')}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, '& fieldset': { border: 'none' } } }} />
                    <Box sx={{ bgcolor: '#F9FAFB', p: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', border: '1px solid #F3F4F6' }}>
                      <CalendarMonthIcon sx={{ color: '#9CA3AF' }} />
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomFormLabel text="진행 방식 *" />
                  <RadioGroup row value={formData.onOffline} onChange={handleChange('onOffline')} sx={{ height: '56px', px: 2, bgcolor: '#F9FAFB', borderRadius: 3, width: '100%', border: '1px solid #F3F4F6' }}>
                    <FormControlLabel value="ONLINE" control={<Radio sx={{color: '#D1D5DB'}}/>} label={<Typography sx={{fontWeight: 700}}>온라인</Typography>} />
                    <FormControlLabel value="OFFLINE" control={<Radio sx={{color: '#D1D5DB'}}/>} label={<Typography sx={{fontWeight: 700}}>오프라인</Typography>} />
                    <FormControlLabel value="BOTH" control={<Radio sx={{color: '#D1D5DB'}}/>} label={<Typography sx={{fontWeight: 700}}>혼합</Typography>} />
                  </RadioGroup>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ fontWeight: 900, mb: 5 }}>▌ 상세 내용</Typography>

              <Box sx={{ mb: 10, border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: '#F3F4F6', display: 'flex', gap: 3, color: '#9CA3AF', fontWeight: 900, fontSize: '0.9rem', borderBottom: '1px solid #E5E7EB' }}>
                  <span>B</span> <i>I</i> <span style={{textDecoration: 'underline'}}>U</span>
                  <Divider orientation="vertical" flexItem sx={{mx: 1}} />
                  <span>H1</span> <span>H2</span>
                </Box>
                <TextField multiline rows={10} fullWidth value={formData.content} onChange={handleChange('content')}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' }, p: 3, color: '#374151' } }} />
              </Box>

              <Stack direction="row" justifyContent="center" spacing={2.5}>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ flex: 1, height: 60, borderRadius: 4, fontWeight: 800 }}>취소</Button>
                <Button variant="contained" sx={{ flex: 1.5, height: 60, borderRadius: 4, bgcolor: '#FF9800', fontWeight: 900 }}>🔒 모집 조기마감</Button>
                <Button variant="contained" onClick={handleSave} sx={{ flex: 1.5, height: 60, borderRadius: 4, bgcolor: '#6C63FF', fontWeight: 900 }}>💾 수정완료</Button>
              </Stack>
            </Paper>
          </Grid>

          {/* [우측] 관리 팁 및 삭제 */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4} sx={{ position: 'sticky', top: '100px' }}>
              <Box sx={{ p: 4, bgcolor: 'rgba(108,99,255,0.04)', borderRadius: 5, border: '1px solid rgba(108,99,255,0.08)' }}>
                <Typography sx={{ fontWeight: 900, color: '#6C63FF', mb: 2 }}>💡 관리 팁</Typography>
                <Typography variant="body2" sx={{ color: '#4F46E5', fontWeight: 600, lineHeight: 1.7, opacity: 0.85 }}>
                  모집 인원이 모두 차면 자동으로 모집 완료 처리됩니다. 마감일을 수정하여 모집 기간을 연장할 수 있습니다.
                </Typography>
              </Box>

              <Paper elevation={0} sx={{ p: 3, borderRadius: 5, borderTop: '4px solid #EF4444', border: '1px solid #F0F0F0' }}>
                <Button 
                  fullWidth variant="contained" onClick={handleDelete} 
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ bgcolor: '#EF4444', color: 'white', fontWeight: 900, height: 56, borderRadius: 3 }}
                >
                  게시글 삭제
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PostEditPage;