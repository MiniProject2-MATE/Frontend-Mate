import React, { useState } from 'react';
import {
  Box, Typography, TextField, Stack, Divider, 
  FormLabel, IconButton, Chip, Card, CardContent, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// 공통 컴포넌트 경로 확인 (상대 경로)
import Breadcrumb from '../component/common/Breadcrumb';
import Button from '../component/common/Button';

const PostWritePage = () => {
  const navigate = useNavigate();

  // 1. 상태 관리 (techStacks를 빈 배열로 초기화)
  const [formData, setFormData] = useState({
    category: 'PROJECT',
    title: '',
    recruitCount: '',
    techStacks: [], // 요청하신 대로 비워두었습니다.
    endDate: '',
    onOffline: '온라인',
    content: ''
  });

  // 2. 입력 핸들러
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // 3. 기술 스택 추가 (Prompt 활용)
  const handleAddStack = () => {
    const newStack = prompt('추가할 기술 스택을 입력하세요 (예: React, Spring)');
    if (newStack && !formData.techStacks.includes(newStack)) {
      setFormData({
        ...formData,
        techStacks: [...formData.techStacks, newStack]
      });
    }
  };

  // 4. 기술 스택 삭제
  const handleDeleteStack = (stackToDelete) => {
    setFormData({
      ...formData,
      techStacks: formData.techStacks.filter(s => s !== stackToDelete)
    });
  };

  // 5. 등록 버튼 클릭 시 (Mock)
  const handleSubmit = () => {
    if (!formData.title || !formData.recruitCount || formData.techStacks.length === 0) {
      alert('필수 항목(제목, 인원, 기술 스택)을 모두 입력해주세요.');
      return;
    }
    console.log('최종 데이터:', formData);
    alert('모집글이 성공적으로 등록되었습니다!');
    navigate('/posts');
  };

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', pt: '80px', pb: 8 }}>
      <Box sx={{ px: { xs: 3, md: 6, lg: 10 }, width: '100%' }}>
        
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: 'Explore', path: '/posts' }, { label: '모집글 작성' }]} />
        
        <Box sx={{ mt: 3, mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>▌ 모집글 작성</Typography>
          <Typography variant="body1" color="text.secondary">함께할 팀원을 찾는 모집글을 작성해 보세요.</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          
          {/* [좌측 영역] */}
          <Box sx={{ flex: 7 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>▌ 기본 정보</Typography>
            
            <Box sx={{ mb: 5 }}>
              <FormLabel sx={{ fontWeight: 700, mb: 2, display: 'block', color: '#333' }}>모집 유형 *</FormLabel>
              <Stack direction="row" spacing={2.5}>
                {['PROJECT', 'STUDY'].map((type) => (
                  <Box
                    key={type}
                    onClick={() => setFormData({...formData, category: type})}
                    sx={{
                      flex: 1, p: 2.5, borderRadius: 4, cursor: 'pointer', border: '2.5px solid',
                      display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s',
                      borderColor: formData.category === type ? '#6366F1' : '#F3F4F6',
                      bgcolor: formData.category === type ? 'white' : '#F9FAFB',
                      fontWeight: 800
                    }}
                  >
                    {formData.category === type ? <RadioButtonCheckedIcon color="primary" /> : <RadioButtonUncheckedIcon sx={{ color: '#DDD' }} />}
                    <span style={{ fontSize: '1.2rem' }}>{type === 'PROJECT' ? '💻 프로젝트' : '📚 스터디'}</span>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ mb: 5 }}>
              <FormLabel sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>제목 *</FormLabel>
              <TextField 
                fullWidth 
                value={formData.title} 
                onChange={handleChange('title')}
                placeholder="제목을 입력하세요"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, '& fieldset': { border: 'none' } } }} 
              />
            </Box>

            <Divider sx={{ my: 6, borderColor: '#F3F4F6' }} />

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>▌ 모집 조건</Typography>
            
            <Box sx={{ mb: 5 }}>
              <FormLabel sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>모집 인원 * <Typography component="span" variant="caption" color="text.secondary">(※ 방장을 제외한 인원수)</Typography></FormLabel>
              <TextField 
                fullWidth type="number"
                value={formData.recruitCount} onChange={handleChange('recruitCount')}
                variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, '& fieldset': { border: 'none' } } }} 
              />
            </Box>

            <Box sx={{ mb: 5 }}>
              <FormLabel sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>기술 스택 *</FormLabel>
              <Box sx={{ p: 2, borderRadius: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5, bgcolor: '#F9FAFB', minHeight: '60px', alignItems: 'center' }}>
                {formData.techStacks.length > 0 ? (
                  formData.techStacks.map(s => (
                    <Chip 
                      key={s} label={s} 
                      onDelete={() => handleDeleteStack(s)}
                      sx={{ fontWeight: 700, bgcolor: 'white', border: '1px solid #EEE' }} 
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ ml: 1 }}>기술 스택을 추가해 주세요.</Typography>
                )}
                <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }} size="small" onClick={handleAddStack}>
                  <AddIcon color="primary" />
                </IconButton>
              </Box>
            </Box>

            <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
              <Box sx={{ flex: 1 }}>
                <FormLabel sx={{ fontWeight: 700, mb: 1 }}>모집 마감일 *</FormLabel>
                <TextField 
                  fullWidth type="date" value={formData.endDate} onChange={handleChange('endDate')}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, '& fieldset': { border: 'none' } } }} 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormLabel sx={{ fontWeight: 700, mb: 1 }}>진행 방식 *</FormLabel>
                <Stack direction="row" sx={{ bgcolor: '#F9FAFB', borderRadius: 3, overflow: 'hidden' }}>
                  {['온라인', '오프라인', '혼합'].map((m) => (
                    <Box 
                      key={m} 
                      onClick={() => setFormData({...formData, onOffline: m})}
                      sx={{ 
                        flex: 1, py: 2, textAlign: 'center', cursor: 'pointer', 
                        bgcolor: formData.onOffline === m ? '#6366F1' : 'transparent', 
                        color: formData.onOffline === m ? 'white' : '#666', 
                        fontWeight: 800, transition: '0.2s'
                      }}
                    >
                      {m}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>

            <Divider sx={{ my: 6, borderColor: '#F3F4F6' }} />

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>▌ 상세 내용</Typography>
            <Box sx={{ border: '1px solid #F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 2, fontWeight: 900 }}>
                B I U H1 H2
              </Box>
              <TextField 
                multiline rows={12} fullWidth value={formData.content} onChange={handleChange('content')}
                placeholder="내용을 입력하세요" sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } } }} 
              />
            </Box>

            <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 8 }}>
              <Button variant="outlined" onClick={() => navigate(-1)} style={{ width: '160px', height: '52px', fontWeight: 800 }}>취소</Button>
              <Button variant="contained" onClick={handleSubmit} style={{ width: '160px', height: '52px', background: '#6366F1', fontWeight: 800 }}>🚀 등록</Button>
            </Stack>
          </Box>

          {/* [우측 영역] - 체크리스트 로직 포함 */}
          <Box sx={{ flex: 3, position: 'sticky', top: '100px' }}>
            <Stack spacing={3}>
              <Card elevation={0} sx={{ borderRadius: 5, bgcolor: '#F5F6FF', border: '1px solid #E0E4FF', p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 900, mb: 2, color: '#5856D6' }}>💡 작성 가이드</Typography>
                  <Stack spacing={1.5} sx={{ color: '#4F46E5', fontWeight: 600 }}>
                    <Typography variant="body2">• 제목에 기술 스택과 주제가 드러나면 좋습니다.</Typography>
                    <Typography variant="body2">• 프로젝트 목표와 결과를 명확히 기술해 주세요.</Typography>
                    <Typography variant="body2">• 지원 자격은 본문에 명시해 주세요.</Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #F3F4F6', p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 900, mb: 2 }}>✅ 등록 전 체크</Typography>
                  {[
                    { label: '모집 유형 선택', done: !!formData.category },
                    { label: '제목 작성 완료', done: formData.title.trim().length > 0 },
                    { label: '모집 인원 설정', done: Number(formData.recruitCount) > 0 },
                    { label: '기술 스택 추가', done: formData.techStacks.length > 0 },
                    { label: '마감일 설정', done: !!formData.endDate },
                    { label: '프로젝트 소개', done: formData.content.trim().length > 0 }
                  ].map((item, i) => (
                    <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 22, color: item.done ? '#4CAF50' : '#EEE' }} />
                      <Typography variant="body2" sx={{ fontWeight: item.done ? 800 : 500, color: item.done ? '#333' : '#AAA' }}>{item.label}</Typography>
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PostWritePage;