import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import {
  Box, Container, Typography, Paper, Avatar, Stack, 
  Button, Divider, TextField, Chip, IconButton, Tabs, Tab, LinearProgress
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

import Breadcrumb from '../component/common/Breadcrumb';

const MyPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // 스크롤 이동을 위한 Ref
  const profileRef = useRef(null);
  const activityRef = useRef(null);

  // 1. MSW 핸들러로부터 회원가입/로그인 내역 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // handlers.js에 추가한 '*/api/user/me' 호출
        const response = await axios.get('/api/user/me');
        if (response.data.success) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        console.error("회원 정보를 불러오지 못했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // 2. 사이드바 메뉴 클릭 시 스크롤 & 탭 전환 함수
  const scrollToSection = (ref, tabIdx = null) => {
    if (tabIdx !== null) setTabValue(tabIdx);
    
    const offset = ref.current?.offsetTop - 100;
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleInputChange = (field) => (e) => setUserInfo({ ...userInfo, [field]: e.target.value });

  const handleSaveProfile = () => {
    alert('수정된 프로필 정보가 저장되었습니다!');
    console.log('저장 데이터:', userInfo);
  };

  if (isLoading || !userInfo) {
    return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;
  }

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth={false} sx={{ maxWidth: '1440px', px: { xs: 2, md: 5 } }}>
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: '마이페이지' }]} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5, mt: 4, alignItems: 'flex-start' }}>
          
          {/* [좌측 사이드바] */}
          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0, position: { md: 'sticky' }, top: '100px' }}>
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
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 0)}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.postCount}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>개설 모집글</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 1)}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.applyCount}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>신청 현황</Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth variant="outlined" startIcon={<EditIcon />} 
                    onClick={() => scrollToSection(profileRef)}
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}
                  >
                    프로필 수정
                  </Button>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: 5, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Stack spacing={0.5}>
                  <MenuButton icon={<PersonIcon />} label="프로필 정보" onClick={() => scrollToSection(profileRef)} />
                  <MenuButton icon={<AssignmentIcon />} label="내 모집글" count={userInfo.postCount} onClick={() => scrollToSection(activityRef, 0)} />
                  <MenuButton icon={<EmailIcon />} label="신청 현황" count={userInfo.applyCount} onClick={() => scrollToSection(activityRef, 1)} />
                  <MenuButton icon={<NotificationsIcon />} label="알림 설정" />
                  <Divider sx={{ my: 1.5 }} />
                  <Button fullWidth startIcon={<LogoutIcon />} sx={{ justifyContent: 'flex-start', color: '#9CA3AF', fontWeight: 800, px: 2, py: 1.5, borderRadius: 3 }}>회원 탈퇴</Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 메인 콘텐츠] */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={4}>
              
              {/* 프로필 정보 섹션 */}
              <Paper ref={profileRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 5, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />프로필 정보
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                  <Box><FormLabel text="닉네임" /><TextField fullWidth value={userInfo.nickname} onChange={handleInputChange('nickname')} sx={inputStyle} /></Box>
                  
                  {/* 이메일: 변경 불가 처리 */}
                  <Box>
                    <FormLabel text="이메일 (변경 불가)" />
                    <TextField 
                      fullWidth 
                      value={userInfo.email} 
                      InputProps={{ readOnly: true }} 
                      sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed' } }} 
                    />
                  </Box>
                  
                  <Box><FormLabel text="포지션" /><TextField fullWidth value={userInfo.position} onChange={handleInputChange('position')} sx={inputStyle} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><FormLabel text="한 줄 소개" /><TextField fullWidth multiline rows={2} value={userInfo.intro} onChange={handleInputChange('intro')} sx={inputStyle} /></Box>
                  
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <FormLabel text="기술 스택" />
                    <Box sx={{ p: 2.5, bgcolor: '#F9FAFB', borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', border: '1px solid #F3F4F6' }}>
                      {userInfo.techStacks?.map(stack => (
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
              <Paper ref={activityRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
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
                      <ActivityItem title="개발 프로젝트 관리 툴 (Mate) 프론트엔드 팀원 모집" status="모집중" info="2025.04.21 등록 · 3명 신청" tags={['React', 'TypeScript']} isOwner onEdit={() => navigate('/posts/1/edit')} />
                      <ActivityItem title="AI 기반 주식 추천 알고리즘 스터디원 모집" status="모집중" info="2025.04.10 등록 · 1명 신청" tags={['Python']} isOwner onEdit={() => navigate('/posts/2/edit')} />
                    </>
                  ) : (
                    <ActivityItem title="딥러닝 논문 스터디 모집 (NLP 관심자 환영)" status="승인완료" info="방장: Soobin_H · 4월 22일 신청" tags={['PyTorch']} />
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

const MenuButton = ({ icon, label, count, onClick }) => (
  <Button fullWidth startIcon={icon} onClick={onClick} sx={{ justifyContent: 'flex-start', px: 2.5, py: 1.8, borderRadius: 3, fontWeight: 800, color: '#6B7280', '&:hover': { bgcolor: '#F9FAFB', color: '#6366F1' } }}>
    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>{label}</Box>
    {count !== undefined && <Chip label={count} size="small" sx={{ height: 22, fontWeight: 900, bgcolor: '#F3F4F6' }} />}
  </Button>
);

const FormLabel = ({ text }) => <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, ml: 0.5, color: '#374151' }}>{text}</Typography>;

const ActivityItem = ({ title, status, info, tags, isOwner, onEdit }) => (
  <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#F9FAFB', border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{title}</Typography>
        <Chip label={status} size="small" sx={{ fontWeight: 900, bgcolor: status === '모집중' ? '#ECFDF5' : '#F3F4F6', color: status === '모집중' ? '#10B981' : '#6B7280' }} />
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>{info}</Typography>
      <Stack direction="row" spacing={1}>{tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 22, fontWeight: 700, bgcolor: 'white' }} />)}</Stack>
    </Box>
    <Stack direction="row" spacing={1}>
      {isOwner && (
        <><Button variant="contained" onClick={onEdit} disableElevation sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 900, borderRadius: 2 }}>수정</Button><Button variant="contained" disableElevation sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 900, borderRadius: 2 }}>삭제</Button></>
      )}
    </Stack>
  </Box>
);

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#F9FAFB', borderRadius: 3, fontSize: '0.95rem', fontWeight: 600,
    '& fieldset': { border: '1px solid #E5E7EB' },
    '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' },
    '&.Mui-focused': { bgcolor: 'white' }
  }
};

export default MyPage;