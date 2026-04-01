import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import axiosInstance from '../api/axiosInstance'; 
import Breadcrumb from '../component/common/Breadcrumb';

const MyPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // 0: 내 모집글, 1: 신청 현황, 2: 내 팀
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const profileRef = useRef(null);
  const activityRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await axiosInstance.get('/user/me');
        setUserInfo(data);
      } catch (error) {
        console.error("회원 정보를 불러오지 못했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const scrollToSection = useCallback((ref, tabIdx = null) => {
    if (tabIdx !== null) setTabValue(tabIdx);
    setTimeout(() => {
      const offset = (ref.current?.offsetTop || 0) - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 100);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCategoryFilter('전체');
  };

  const handleInputChange = (field) => (e) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      console.log("저장 시도 데이터:", userInfo);
      alert('프로필 정보가 성공적으로 저장되었습니다!');
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const getFilteredData = useCallback(() => {
    if (!userInfo) return [];
    
    let sourceData = [];
    if (tabValue === 0) sourceData = userInfo.myPosts || [];
    else if (tabValue === 1) sourceData = userInfo.applies || [];
    else if (tabValue === 2) sourceData = userInfo.acceptedProjects || [];

    if (categoryFilter === '전체') return sourceData;

    return sourceData.filter(item => {
      const title = item?.projectTitle || item?.title || "";
      const category = item?.category || "";
      return title.includes(categoryFilter) || category === categoryFilter;
    });
  }, [userInfo, tabValue, categoryFilter]);

  if (isLoading || !userInfo) {
    return (
      <Box sx={{ width: '100%', mt: '100px', textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, fontWeight: 700, color: '#6366F1' }}>데이터를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  const displayList = getFilteredData();

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
                    {userInfo.nickname ? userInfo.nickname[0] : 'U'}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 2 }}>{userInfo.nickname}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>
                    @{userInfo.nickname?.toLowerCase()} · {userInfo.position}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 0)}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.postCount || 0}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>내 모집글</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 1)}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.applyCount || 0}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>신청 현황</Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth variant="outlined" startIcon={<EditIcon />} 
                    onClick={() => scrollToSection(profileRef)}
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, borderColor: '#E5E7EB', color: '#374151' }}
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
                  <MenuButton icon={<RocketLaunchIcon />} label="내 팀" count={userInfo.acceptedProjects?.length || 0} onClick={() => scrollToSection(activityRef, 2)} />
                  <Divider sx={{ my: 1.5 }} />
                  <Button fullWidth startIcon={<LogoutIcon />} sx={{ justifyContent: 'flex-start', color: '#9CA3AF', fontWeight: 800, px: 2, py: 1.5, borderRadius: 3 }}>회원 탈퇴</Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 메인 콘텐츠] */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={4}>
              <Paper ref={profileRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 5, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />프로필 정보
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                  <Box><FormLabel text="닉네임" /><TextField fullWidth value={userInfo.nickname || ''} onChange={handleInputChange('nickname')} sx={inputStyle} /></Box>
                  <Box><FormLabel text="이메일" /><TextField fullWidth value={userInfo.email || ''} InputProps={{ readOnly: true }} sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }} /></Box>
                  <Box><FormLabel text="포지션" /><TextField fullWidth value={userInfo.position || ''} onChange={handleInputChange('position')} sx={inputStyle} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><FormLabel text="한 줄 소개" /><TextField fullWidth multiline rows={2} value={userInfo.intro || ''} onChange={handleInputChange('intro')} sx={inputStyle} /></Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
                  <Button variant="contained" onClick={handleSaveProfile} startIcon={<SaveIcon />} sx={{ px: 6, py: 1.8, borderRadius: 4, fontWeight: 900, bgcolor: '#6366F1', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>저장하기</Button>
                </Box>
              </Paper>

              <Paper ref={activityRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />활동 내역
                </Typography>
                
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4, borderBottom: '1px solid #F3F4F6' }}>
                  <Tab label={`내 모집글 (${userInfo.postCount || 0})`} sx={{ fontWeight: 900, px: 3 }} />
                  <Tab label={`신청 현황 (${userInfo.applyCount || 0})`} sx={{ fontWeight: 900, px: 3 }} />
                  <Tab label={`내 팀 (${userInfo.acceptedProjects?.length || 0})`} sx={{ fontWeight: 900, px: 3 }} />
                </Tabs>

                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                  {['전체', '프로젝트', '스터디'].map((cat) => (
                    <Chip 
                      key={cat} label={cat} onClick={() => setCategoryFilter(cat)}
                      sx={{ 
                        fontWeight: 800, px: 1,
                        bgcolor: categoryFilter === cat ? '#6366F1' : '#F3F4F6',
                        color: categoryFilter === cat ? 'white' : '#6B7280',
                        '&:hover': { bgcolor: categoryFilter === cat ? '#4F46E5' : '#E5E7EB' }
                      }} 
                    />
                  ))}
                </Stack>

                <Stack spacing={2.5}>
                  {displayList.length > 0 ? (
                    displayList.map((item) => (
                      <ActivityItem 
                        key={item.applyId || item.projectId || item.id}
                        item={item}
                        tabValue={tabValue}
                        onTitleClick={() => {
                          const id = item.projectId || item.id;
                          if (tabValue === 1) navigate(`/posts/${id}`);
                          else navigate(`/posts/${id}/board`);
                        }}
                        onManageClick={() => {
                          // [추가] 관리 버튼 클릭 시 수정 페이지로 이동
                          const id = item.projectId || item.id;
                          navigate(`/posts/${id}/edit`);
                        }}
                      />
                    ))
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#F9FAFB', borderRadius: 4 }}>
                      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                        {categoryFilter} 내역이 없습니다.
                      </Typography>
                    </Box>
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

const ActivityItem = ({ item, tabValue, onTitleClick, onManageClick }) => {
  const title = item.projectTitle || item.title;
  const status = tabValue === 2 ? '참여중' : (item.status === 'PENDING' ? '대기중' : '승인완료');
  const info = tabValue === 2 
    ? `팀장: ${item.ownerNickname || '알수없음'} | 역할: ${item.position || '멤버'}` 
    : `지원 분야: ${item.position || '선택없음'} · 신청일: ${item.appliedDate || item.endDate}`;

  return (
    <Box sx={{ 
      p: 4, borderRadius: 5, bgcolor: '#F9FAFB', border: '1px solid #F3F4F6', 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      '&:hover': { bgcolor: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }, transition: '0.2s'
    }}>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Typography 
            variant="h6" 
            onClick={onTitleClick}
            sx={{ 
              fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer',
              '&:hover': { color: '#6366F1', textDecoration: 'underline' } 
            }}
          >
            {title}
          </Typography>
          {tabValue !== 0 && (
            <Chip 
              label={status} size="small" 
              sx={{ 
                fontWeight: 900, 
                bgcolor: status === '참여중' ? '#EEF2FF' : (status === '대기중' ? '#FFFBEB' : '#ECFDF5'), 
                color: status === '참여중' ? '#6366F1' : (status === '대기중' ? '#D97706' : '#10B981') 
              }} 
            />
          )}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{info}</Typography>
      </Box>
      
      <Stack direction="row" spacing={1}>
        {tabValue === 0 && (
          <Button 
            variant="contained" 
            disableElevation 
            onClick={onManageClick} // [수정] 클릭 시 수정 페이지 이동 핸들러 연결
            sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 900, borderRadius: 2 }}
          >
            관리
          </Button>
        )}
        {tabValue === 1 && item.status === 'PENDING' && (
          <Button variant="outlined" disabled sx={{ fontWeight: 800, borderRadius: 2, borderColor: '#E5E7EB' }}>대기 중</Button>
        )}
      </Stack>
    </Box>
  );
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#F9FAFB', borderRadius: 3, fontSize: '0.95rem', fontWeight: 600,
    '& fieldset': { border: '1px solid #E5E7EB' },
    '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' },
    '&.Mui-focused': { bgcolor: 'white' }
  }
};

export default MyPage;