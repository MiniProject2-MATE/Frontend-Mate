import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Avatar, Stack, 
  Button, Divider, TextField, Chip, IconButton, Tabs, Tab
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';

// 공통 컴포넌트 경로 확인
import Breadcrumb from '../component/common/Breadcrumb';

const MyPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // 목업 데이터
  const [userInfo] = useState({
    nickname: 'Jina_P',
    position: '프론트엔드',
    techStacks: ['React', 'TypeScript', 'Figma', 'Redux'],
    intro: 'React와 TypeScript를 좋아하는 프론트엔드 개발자입니다. 🙌'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- 핸들러 함수들 ---
  
  const handleEditPost = (postId) => {
    // 요청하신 경로 규칙 /posts/:id/edit 적용
    navigate(`/posts/${postId}/edit`);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      alert(`${postId}번 게시글이 삭제되었습니다.`);
    }
  };

  const handleCancelApply = (title) => {
    if (window.confirm(`'${title}' 지원을 취소하시겠습니까?`)) {
      alert('지원이 취소되었습니다.');
    }
  };

  const handleSaveProfile = () => {
    alert('프로필 정보가 안전하게 저장되었습니다!');
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      {/* 화면을 넓게 쓰기 위해 maxWidth를 크게 잡고 Flex 레이아웃 적용 */}
      <Container maxWidth={false} sx={{ maxWidth: '1440px', px: { xs: 2, md: 5 } }}>
        
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: '마이페이지' }]} />

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 5, 
          mt: 4, 
          alignItems: 'flex-start' 
        }}>
          
          {/* [좌측 사이드바] */}
          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Box sx={{ height: 100, background: 'linear-gradient(135deg, #A78BFA 0%, #6366F1 100%)' }} />
                <Box sx={{ px: 3, pb: 4, textAlign: 'center', mt: -6 }}>
                  <Avatar sx={{ width: 110, height: 110, mx: 'auto', border: '5px solid white', bgcolor: '#6366F1', fontSize: '2.5rem', fontWeight: 900 }}>
                    {userInfo.nickname[0]}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 2 }}>{userInfo.nickname}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>
                    @{userInfo.nickname.toLowerCase()} · {userInfo.position}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                    <Box><Typography variant="h6" sx={{ fontWeight: 900 }}>3</Typography><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>개설 모집글</Typography></Box>
                    <Divider orientation="vertical" flexItem />
                    <Box><Typography variant="h6" sx={{ fontWeight: 900 }}>5</Typography><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>신청 현황</Typography></Box>
                  </Box>
                  <Button fullWidth variant="outlined" startIcon={<EditIcon />} sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}>프로필 수정</Button>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: 5, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Stack spacing={0.5}>
                  <MenuButton icon={<PersonIcon />} label="프로필 정보" active />
                  <MenuButton icon={<AssignmentIcon />} label="내 모집글" count={3} />
                  <MenuButton icon={<EmailIcon />} label="신청 현황" count={5} />
                  <MenuButton icon={<NotificationsIcon />} label="알림 설정" />
                  <Divider sx={{ my: 1.5 }} />
                  <Button fullWidth startIcon={<LogoutIcon />} sx={{ justifyContent: 'flex-start', color: '#9CA3AF', fontWeight: 800, px: 2, py: 1.5, borderRadius: 3, '&:hover': { bgcolor: '#FFF1F2', color: '#EF4444' } }}>회원 탈퇴</Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 메인 콘텐츠] */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={4}>
              
              {/* 프로필 정보 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 5, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />프로필 정보
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                  <Box><FormLabel text="이름" /><TextField fullWidth defaultValue="박진아" sx={inputStyle} /></Box>
                  <Box><FormLabel text="닉네임" /><TextField fullWidth defaultValue={userInfo.nickname} sx={inputStyle} /></Box>
                  <Box><FormLabel text="이메일" /><TextField fullWidth defaultValue="jina@mate.dev" sx={inputStyle} /></Box>
                  <Box><FormLabel text="포지션" /><TextField fullWidth defaultValue={userInfo.position} sx={inputStyle} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><FormLabel text="한 줄 소개" /><TextField fullWidth multiline rows={2} defaultValue={userInfo.intro} sx={inputStyle} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <FormLabel text="기술 스택" />
                    <Box sx={{ p: 2.5, bgcolor: '#F9FAFB', borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', border: '1px solid #F3F4F6' }}>
                      {userInfo.techStacks.map(stack => (
                        <Chip key={stack} label={stack} sx={{ bgcolor: 'white', fontWeight: 800, border: '1px solid #E5E7EB', height: 32 }} />
                      ))}
                      <IconButton size="small" sx={{ bgcolor: 'white', border: '1px solid #E5E7EB' }}><AddIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
                  <Button variant="contained" onClick={handleSaveProfile} startIcon={<SaveIcon />} sx={{ px: 6, py: 1.8, borderRadius: 4, fontWeight: 900, bgcolor: '#6366F1' }}>저장하기</Button>
                </Box>
              </Paper>

              {/* 활동 내역 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />활동 내역
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4, borderBottom: '1px solid #F3F4F6' }}>
                  <Tab label="내 모집글" sx={{ fontWeight: 900, fontSize: '1rem', px: 4 }} />
                  <Tab label="신청 현황" sx={{ fontWeight: 900, fontSize: '1rem', px: 4 }} />
                </Tabs>

                <Stack spacing={2.5}>
                  {tabValue === 0 ? (
                    <>
                      <ActivityItem 
                        title="개발 프로젝트 관리 툴 (Mate) 프론트엔드 팀원 모집" 
                        status="모집중" 
                        info="2025.04.21 등록 · 3명 신청" 
                        tags={['React', 'TypeScript']} 
                        isOwner 
                        onEdit={() => handleEditPost(1)} // ID 1 전달
                        onDelete={() => handleDeletePost(1)}
                      />
                      <ActivityItem 
                        title="AI 기반 주식 추천 알고리즘 스터디원 모집" 
                        status="모집중" 
                        info="2025.04.10 등록 · 1명 신청" 
                        tags={['Python']} 
                        isOwner 
                        onEdit={() => handleEditPost(2)} // ID 2 전달
                        onDelete={() => handleDeletePost(2)}
                      />
                    </>
                  ) : (
                    <ActivityItem 
                      title="딥러닝 논문 스터디 모집 (NLP 관심자 환영)" 
                      status="승인완료" 
                      info="방장: Soobin_H · 4월 22일 신청" 
                      tags={['PyTorch']} 
                      onCancel={() => handleCancelApply("딥러닝 논문 스터디 모집")}
                    />
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// --- 내부 컴포넌트 ---

const MenuButton = ({ icon, label, count, active }) => (
  <Button fullWidth startIcon={icon} sx={{ justifyContent: 'flex-start', px: 2.5, py: 1.8, borderRadius: 3, fontWeight: 800, color: active ? 'white' : '#6B7280', bgcolor: active ? '#6366F1' : 'transparent', '&:hover': { bgcolor: active ? '#4F46E5' : '#F9FAFB' } }}>
    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>{label}</Box>
    {count && <Chip label={count} size="small" sx={{ height: 22, fontWeight: 900, bgcolor: active ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: active ? 'white' : '#6B7280' }} />}
  </Button>
);

const FormLabel = ({ text }) => <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, ml: 0.5, color: '#374151' }}>{text}</Typography>;

const ActivityItem = ({ title, status, info, tags, isOwner, onEdit, onDelete, onCancel }) => (
  <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#F9FAFB', border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{title}</Typography>
        <Chip label={status} size="small" sx={{ fontWeight: 900, bgcolor: status === '모집중' ? '#ECFDF5' : '#F3F4F6', color: status === '모집중' ? '#10B981' : '#6B7280' }} />
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>{info}</Typography>
      <Stack direction="row" spacing={1}>{tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 22, fontWeight: 700, bgcolor: 'white' }} />)}</Stack>
    </Box>
    <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
      {isOwner ? (
        <>
          <Button onClick={onEdit} variant="contained" disableElevation sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 900, borderRadius: 2 }}>수정</Button>
          <Button onClick={onDelete} variant="contained" disableElevation sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 900, borderRadius: 2 }}>삭제</Button>
        </>
      ) : (
        <Button onClick={onCancel} variant="outlined" color="inherit" sx={{ fontWeight: 900, borderRadius: 2, color: '#9CA3AF' }}>지원취소</Button>
      )}
    </Stack>
  </Box>
);

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#F9FAFB', borderRadius: 3, fontSize: '0.95rem', fontWeight: 600,
    '& fieldset': { border: '1px solid #E5E7EB' },
    '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' },
  }
};

export default MyPage;