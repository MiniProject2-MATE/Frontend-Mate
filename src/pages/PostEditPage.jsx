import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Stack, Divider, 
  FormLabel, IconButton, Chip, Card, CardContent, 
  Container, Paper, Autocomplete, createFilterOptions, Grid, MenuItem
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import { postApi } from '../api/postApi';
import { useUiStore } from '../store/uiStore';

const filter = createFilterOptions();

// 추천 기술 스택 리스트
const TECH_STACK_OPTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Next.js', 'Svelte',
  'Node.js', 'Spring Boot', 'Java', 'Python', 'Django', 'Flask',
  'Go', 'NestJS', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB',
  'Redis', 'Docker', 'Kubernetes', 'AWS', 'Flutter', 'ReactNative',
  'Swift', 'Kotlin', 'Unity', 'Figma'
];

const PostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUiStore();

  // 오늘 날짜 기준 데이터 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 1. 상태 관리
  const [formData, setFormData] = useState({
    category: 'PROJECT',
    title: '',
    recruitCount: '',
    techStacks: [],
    endDate: '', // YYYY-MM-DD
    onOffline: '온라인',
    content: ''
  });

  // 날짜 선택용 로컬 상태
  const [dateParts, setDateParts] = useState({
    year: '',
    month: '',
    day: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postApi.getPostDetail(id);
        const post = response.data || response;
        
        setFormData({
          category: post.category || 'PROJECT',
          title: post.title || '',
          recruitCount: post.recruitCount || '',
          techStacks: post.techStacks || [],
          endDate: post.endDate || '',
          onOffline: post.onOffline || '온라인',
          content: post.content || ''
        });

        // 날짜 파싱 (YYYY-MM-DD)
        if (post.endDate) {
          const [y, m, d] = post.endDate.split('-').map(Number);
          setDateParts({ year: y || '', month: m || '', day: d || '' });
        }
      } catch (error) {
        console.error('불러오기 실패:', error);
        showToast('게시글 정보를 불러오는 데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, showToast]);

  // 2. 입력 핸들러
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleDateChange = (part) => (e) => {
    const newVal = e.target.value;
    const newDateParts = { ...dateParts, [part]: newVal };
    setDateParts(newDateParts);

    if (newDateParts.year && newDateParts.month && newDateParts.day) {
      const formattedDate = `${newDateParts.year}-${String(newDateParts.month).padStart(2, '0')}-${String(newDateParts.day).padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, endDate: formattedDate }));
    }
  };

  const handleTechStacksChange = (event, newValue) => {
    const processedValue = newValue.map((option) => {
      if (typeof option === 'string') return option;
      if (option.inputValue) return option.inputValue;
      return option;
    });
    setFormData({ ...formData, techStacks: processedValue });
  };

  // 4. 저장 버튼 클릭 시
  const handleSubmit = async () => {
    if (!formData.title || !formData.recruitCount || formData.techStacks.length === 0 || !formData.content || !formData.endDate) {
      showToast('모든 필수 항목(*)을 입력해주세요.', 'warning');
      return;
    }

    try {
      await postApi.updatePost(id, {
        ...formData,
        recruitCount: Number(formData.recruitCount)
      });
      showToast('수정이 완료되었습니다! 🚀', 'success');
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error('수정 실패:', error);
      showToast('수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleClosePost = async () => {
    if (window.confirm('정말 이 모집글을 조기 마감하시겠습니까?')) {
      try {
        await postApi.closePost(id);
        showToast('모집이 마감되었습니다.', 'info');
        navigate(`/posts/${id}`);
      } catch (error) {
        showToast('마감 처리 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      try {
        await postApi.deletePost(id);
        showToast('삭제되었습니다.', 'success');
        navigate('/posts');
      } catch (error) {
        showToast('삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  if (isLoading) return null;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/posts' }, { label: '모집글 수정' }]} />
        
        <Box sx={{ mt: 3, mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827' }}>🚀 모집글 수정</Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>기존 모집글의 정보를 수정하거나 관리하세요.</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          
          {/* [좌측 입력 영역] */}
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              
              {/* 기본 정보 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE', borderTop: '4px solid #6C63FF' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                  <DescriptionIcon sx={{ color: '#6C63FF' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>기본 정보</Typography>
                </Stack>
                
                <Box sx={{ mb: 4 }}>
                  <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>모집 유형 *</FormLabel>
                  <Stack direction="row" spacing={2}>
                    {['PROJECT', 'STUDY'].map((type) => (
                      <Box
                        key={type}
                        onClick={() => setFormData({...formData, category: type})}
                        sx={{
                          flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', border: '2px solid',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, transition: '0.2s',
                          borderColor: formData.category === type ? '#6C63FF' : '#F3F4F6',
                          bgcolor: formData.category === type ? '#F5F3FF' : 'white',
                          color: formData.category === type ? '#6C63FF' : '#6B7280',
                          fontWeight: 800,
                          '&:hover': { borderColor: '#6C63FF' }
                        }}
                      >
                        {formData.category === type ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                        <Typography sx={{ fontWeight: 800 }}>{type === 'PROJECT' ? '💻 프로젝트' : '📚 스터디'}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ mb: 0 }}>
                  <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>제목 *</FormLabel>
                  <TextField 
                    fullWidth 
                    value={formData.title} 
                    onChange={handleChange('title')}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        bgcolor: '#F9FAFB', 
                        borderRadius: 3,
                        fontWeight: 600,
                        '& fieldset': { border: '1px solid #E5E7EB' }
                      } 
                    }} 
                  />
                </Box>
              </Paper>

              {/* 모집 조건 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                  <GroupAddIcon sx={{ color: '#6C63FF' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>모집 조건</Typography>
                </Stack>
                
                <Stack spacing={4}>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ flex: 0.7 }}>
                      <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>모집 인원 *</FormLabel>
                      <TextField 
                        fullWidth type="number"
                        value={formData.recruitCount} onChange={handleChange('recruitCount')}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3 } }} 
                      />
                    </Box>
                    <Box sx={{ flex: 1.3 }}>
                      <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>마감 일자 *</FormLabel>
                      <Stack direction="row" spacing={1}>
                        <TextField select fullWidth value={dateParts.year} onChange={handleDateChange('year')} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, fontWeight: 600 } }} SelectProps={{ displayEmpty: true }}>
                          <MenuItem value="" disabled>년</MenuItem>
                          {years.map(y => <MenuItem key={y} value={y}>{y}년</MenuItem>)}
                        </TextField>
                        <TextField select fullWidth value={dateParts.month} onChange={handleDateChange('month')} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, fontWeight: 600 } }} SelectProps={{ displayEmpty: true }}>
                          <MenuItem value="" disabled>월</MenuItem>
                          {months.map(m => <MenuItem key={m} value={m}>{m}월</MenuItem>)}
                        </TextField>
                        <TextField select fullWidth value={dateParts.day} onChange={handleDateChange('day')} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, fontWeight: 600 } }} SelectProps={{ displayEmpty: true }}>
                          <MenuItem value="" disabled>일</MenuItem>
                          {days.map(d => <MenuItem key={d} value={d}>{d}일</MenuItem>)}
                        </TextField>
                      </Stack>
                    </Box>
                  </Stack>

                  <Box>
                    <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>진행 방식 *</FormLabel>
                    <Stack direction="row" sx={{ bgcolor: '#F3F4F6', borderRadius: 3, p: 0.5 }}>
                      {['온라인', '오프라인', '혼합'].map((m) => (
                        <Box 
                          key={m} 
                          onClick={() => setFormData({...formData, onOffline: m})}
                          sx={{ 
                            flex: 1, py: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 2.5,
                            bgcolor: formData.onOffline === m ? 'white' : 'transparent', 
                            color: formData.onOffline === m ? '#6C63FF' : '#6B7280', 
                            fontWeight: 800, transition: '0.2s',
                            boxShadow: formData.onOffline === m ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          {m}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>기술 스택 *</FormLabel>
                    <Autocomplete
                      multiple freeSolo
                      value={formData.techStacks}
                      onChange={handleTechStacksChange}
                      options={TECH_STACK_OPTIONS}
                      filterOptions={(options, params) => {
                        const filtered = filter(options, params);
                        const { inputValue } = params;
                        const isExisting = options.some((option) => inputValue === option);
                        if (inputValue !== '' && !isExisting) {
                          filtered.push({ inputValue, title: `"${inputValue}" 추가하기` });
                        }
                        return filtered;
                      }}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        if (option.inputValue) return option.inputValue;
                        return option.title;
                      }}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3 } }} />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key} 
                              label={typeof option === 'string' ? option : option.inputValue}
                              {...tagProps}
                              sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800 }}
                            />
                          );
                        })
                      }
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* 상세 내용 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                  <CodeIcon sx={{ color: '#6C63FF' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>상세 소개</Typography>
                </Stack>
                <TextField 
                  multiline rows={12} fullWidth value={formData.content} onChange={handleChange('content')}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      bgcolor: '#F9FAFB', 
                      borderRadius: 4,
                      p: 3,
                      lineHeight: 1.6,
                      '& fieldset': { border: '1px solid #E5E7EB' }
                    } 
                  }} 
                />
              </Paper>

              <Stack direction="row" justifyContent="center" spacing={2} sx={{ pt: 2 }}>
                <CustomButton variant="primary" onClick={handleSubmit} sx={{ px: 4, height: 56, fontWeight: 900 }}>💾 수정완료</CustomButton>
                <CustomButton variant="contained" onClick={handleClosePost} sx={{ px: 4, height: 56, bgcolor: '#FF9800', color: 'white', fontWeight: 900 }}>🔒 모집 조기마감</CustomButton>
                <CustomButton variant="secondary" onClick={() => navigate(-1)} sx={{ px: 4, height: 56 }}>취소</CustomButton>
              </Stack>
            </Stack>
          </Box>

          {/* [우측 사이드바] */}
          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              <Card elevation={0} sx={{ borderRadius: 5, bgcolor: '#FFF5F5', border: '1px solid #FFEBEB' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontWeight: 900, mb: 2.5, color: '#E53E3E', display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⚠️ 위험 구역
                  </Typography>
                  <CustomButton 
                    fullWidth variant="contained" onClick={handleDelete} 
                    startIcon={<DeleteOutlineIcon />}
                    sx={{ bgcolor: '#EF4444', color: 'white', fontWeight: 900, height: 50, borderRadius: 3 }}
                  >
                    게시글 삭제
                  </CustomButton>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #EEEEEE' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontWeight: 900, mb: 3 }}>✅ 수정 체크리스트</Typography>
                  {[
                    { label: '제목 및 유형 확인', done: formData.title.trim().length > 0 },
                    { label: '모집 조건 재검토', done: Number(formData.recruitCount) > 0 },
                    { label: '상세 내용 업데이트', done: formData.content.trim().length > 10 }
                  ].map((item, i) => (
                    <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 22, color: item.done ? '#22C55E' : '#E5E7EB' }} />
                      <Typography variant="body2" sx={{ fontWeight: item.done ? 800 : 500, color: item.done ? '#1F2937' : '#9CA3AF' }}>{item.label}</Typography>
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PostEditPage;
