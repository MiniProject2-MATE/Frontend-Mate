import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Avatar, Stack, 
  Button, Divider, TextField, Chip, IconButton, Tabs, Tab, LinearProgress, InputAdornment, MenuItem, Menu, Autocomplete,
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Link
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import axiosInstance from '../api/axiosInstance'; 
import Breadcrumb from '../component/common/Breadcrumb';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { TECH_STACK_OPTIONS, POSITION_OPTIONS } from '../constants/techStacks';
import postApi from '../api/postApi';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, openModal } = useUiStore();
  const { logout } = useAuthStore(); 

  const [tabValue, setTabValue] = useState(0); 
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);

  // 지원서 관리 관련 상태
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isAppDetailOpen, setIsAppDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    position: '',
    phoneNumber: '',
    intro: '',
    techStacks: []
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState(true); 
  const [lastCheckedNickname, setLastCheckedNickname] = useState('');
  const [isPhoneChecked, setIsPhoneChecked] = useState(true);
  const [lastCheckedPhone, setLastCheckedPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 프로필 이미지 관련 상태 및 Ref
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);

  const profileRef = useRef(null);
  const activityRef = useRef(null);

  // 유저 데이터 로드 함수
  const fetchUserData = useCallback(async () => {
    try {
      const data = await axiosInstance.get('/users/me');
      setUserInfo(data);
      setFormData({
        nickname: data.nickname || '',
        position: data.position || '',
        phoneNumber: data.phoneNumber || '',
        intro: data.intro || '',
        techStacks: data.techStacks || []
      });
      setLastCheckedNickname(data.nickname || '');
      setLastCheckedPhone(data.phoneNumber || '');
      setIsNicknameChecked(true);
      setIsPhoneChecked(true);
      
      // Zustand 스토어 업데이트 (안정적인 접근)
      useAuthStore.getState().updateUser(data);
    } catch (error) {
      console.error("회원 정보를 불러오지 못했습니다.", error);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUserInfo(currentUser);
        setFormData({
          nickname: currentUser.nickname || '',
          position: currentUser.position || '',
          phoneNumber: currentUser.phoneNumber || '',
          intro: currentUser.intro || '',
          techStacks: currentUser.techStacks || []
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 마운트 시 1회 실행
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 외부 페이지 이동 처리
  useEffect(() => {
    if (location.state?.activeTab !== undefined && !isLoading) {
      setTabValue(location.state.activeTab); 
      setTimeout(() => {
        const targetRef = location.state.scrollTo === 'profile' ? profileRef : activityRef;
        if (targetRef.current) {
          const offset = targetRef.current.offsetTop - 100;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoading]);

  const fetchApplications = async (projectId) => {
    try {
      const response = await postApi.getProjectApplications(projectId);
      setApplications(response.data || response);
    } catch (error) {
      console.error("지원서 로드 실패:", error);
      showToast('지원자 목록을 불러오지 못했습니다.', 'error');
    }
  };

  const handleOpenAppModal = (projectId) => {
    setSelectedProjectId(projectId);
    fetchApplications(projectId);
    setIsAppModalOpen(true);
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await postApi.updateApplicationStatus(applicationId, status);
      showToast(status === 'ACCEPTED' ? '승인되었습니다.' : '거절되었습니다.', 'success');
      if (selectedProjectId) fetchApplications(selectedProjectId);
      setIsAppDetailOpen(false);
      const data = await axiosInstance.get('/users/me');
      setUserInfo(data);
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      showToast('처리 중 오류가 발생했습니다.', 'error');
    }
  };

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
    const value = e.target.value;
    if (field === 'phoneNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 11) return;
      setFormData(prev => ({ ...prev, [field]: onlyNums }));
      if (userInfo && onlyNums !== userInfo.phoneNumber) setIsPhoneChecked(false);
      else setIsPhoneChecked(true);
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'nickname') {
      if (userInfo && value !== userInfo.nickname) setIsNicknameChecked(false);
      else setIsNicknameChecked(true);
    }
  };

  const handleTechStacksChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, techStacks: newValue }));
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) {
      showToast('닉네임을 입력해주세요.', 'warning');
      return;
    }
    try {
      const response = await axiosInstance.get(`/users/check-nickname?nickname=${formData.nickname}`);
      const isAvailable = response.data?.isAvailable ?? response.isAvailable;
      if (isAvailable) {
        showToast('사용 가능한 닉네임입니다!', 'success');
        setIsNicknameChecked(true);
        setLastCheckedNickname(formData.nickname);
      } else {
        showToast('이미 사용 중인 닉네임입니다.', 'error');
        setIsNicknameChecked(false);
      }
    } catch (error) {
      console.error("닉네임 체크 에러:", error);
      showToast('중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCheckPhone = async () => {
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      showToast('유효한 전화번호를 입력해주세요.', 'warning');
      return;
    }
    try {
      const response = await axiosInstance.get(`/users/check-phone?phoneNumber=${formData.phoneNumber}`);
      const isAvailable = response.data?.isAvailable ?? response.isAvailable;
      if (isAvailable) {
        showToast('사용 가능한 전화번호입니다.', 'success');
        setIsPhoneChecked(true);
        setLastCheckedPhone(formData.phoneNumber);
      } else {
        showToast('이미 등록된 전화번호입니다.', 'error');
        setIsPhoneChecked(false);
      }
    } catch (error) {
      console.error("전화번호 체크 에러:", error);
      showToast('중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!userInfo) return;
    const isProfileUnchanged = 
      formData.nickname === userInfo.nickname &&
      formData.position === userInfo.position &&
      formData.phoneNumber === userInfo.phoneNumber &&
      formData.intro === userInfo.intro &&
      JSON.stringify(formData.techStacks) === JSON.stringify(userInfo.techStacks);
    
    const isPasswordEmpty = !password && !confirmPassword;
    if (isProfileUnchanged && isPasswordEmpty) {
      showToast('변경된 정보가 없습니다!', 'info');
      return;
    }
    if (formData.nickname !== userInfo.nickname && (!isNicknameChecked || formData.nickname !== lastCheckedNickname)) {
      showToast('닉네임 중복 확인이 필요합니다.', 'warning');
      return;
    }
    if (formData.phoneNumber !== userInfo.phoneNumber && (!isPhoneChecked || formData.phoneNumber !== lastCheckedPhone)) {
      showToast('전화번호 중복 확인이 필요합니다.', 'warning');
      return;
    }
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        showToast('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      if (password.length < 8) {
        showToast('비밀번호는 8자 이상이어야 합니다.', 'warning');
        return;
      }
    }
    try {
      const updatePayload = {
        nickname: formData.nickname,
        position: formData.position,
        phoneNumber: formData.phoneNumber,
        intro: formData.intro,
        techStacks: formData.techStacks,
        ...(password && { password })
      };
      const response = await axiosInstance.put('/users/me', updatePayload);
      const updatedUser = { ...response, userId: response.userId || response.id };
      setUserInfo(updatedUser); 
      setFormData(prev => ({ ...prev, ...updatedUser }));
      useAuthStore.getState().updateUser(updatedUser); 
      showToast('프로필 정보가 성공적으로 저장되었습니다!', 'success');
      setPassword(''); setConfirmPassword('');
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      showToast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append('profileImage', file);
    try {
      const response = await axiosInstance.patch('/users/profile-image', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const previewUrl = URL.createObjectURL(file);
      setUserInfo(prev => ({ ...prev, profileImageUrl: previewUrl }));
      useAuthStore.getState().updateUser({ ...userInfo, profileImageUrl: previewUrl });
      showToast(response.message || '프로필 이미지가 변경되었습니다.', 'success');
    } catch (error) {
      console.error("이미지 업데이트 실패:", error);
      showToast('이미지 업데이트 중 오류가 발생했습니다.', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await axiosInstance.delete('/users/profile-image');      
      const defaultUrl = response.profileImageUrl; 
      setUserInfo(prev => ({ ...prev, profileImageUrl: defaultUrl }));
      useAuthStore.getState().updateUser({ ...userInfo, profileImageUrl: defaultUrl });
      showToast(response.message || '기본 이미지로 변경되었습니다.', 'success');
    } catch (error) {
      console.error("이미지 삭제 실패:", error);
      showToast('이미지 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleCancelApplication = async (applyId) => {
    openModal('confirm', {
      title: '지원 취소',
      message: '정말로 이 프로젝트 지원을 취소하시겠습니까?',
      confirmText: '지원 취소',
      color: 'error',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/applications/${applyId}`);
          showToast('지원이 취소되었습니다.', 'success');
          fetchUserData();
        } catch (error) {
          console.error("지원 취소 에러:", error);
          showToast('지원 취소 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleWithdrawal = () => {
    openModal('confirm', {
      title: '회원 탈퇴',
      message: '정말로 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.',
      confirmText: '탈퇴하기',
      color: 'error',
      onConfirm: async () => {
        try {
          await axiosInstance.delete('/users/me');
          showToast('회원 탈퇴가 완료되었습니다.', 'success');
          logout(); navigate('/');
        } catch (error) {
          console.error("탈퇴 에러:", error);
          showToast('탈퇴 처리 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const getFilteredData = useCallback(() => {
    if (!userInfo) return [];
    let sourceData = [];
    if (tabValue === 0) sourceData = userInfo.myPosts || [];
    else if (tabValue === 1) sourceData = userInfo.applies || [];
    else if (tabValue === 2) sourceData = userInfo.acceptedProjects || [];

    if (categoryFilter === '전체') return sourceData;
    return sourceData.filter(item => {
      const category = item?.category || "";
      const categoryMap = { '프로젝트': 'PROJECT', '스터디': 'STUDY' };
      return category === categoryMap[categoryFilter];
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
          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0, position: { md: 'sticky' }, top: '100px' }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Box sx={{ height: 100, background: 'linear-gradient(135deg, #A78BFA 0%, #6366F1 100%)' }} />
                <Box sx={{ px: 3, pb: 4, textAlign: 'center', mt: -6 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar src={userInfo.profileImageUrl} onClick={handleAvatarClick} sx={{ width: 110, height: 110, mx: 'auto', border: '5px solid white', bgcolor: '#6366F1', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>{userInfo.nickname ? userInfo.nickname[0] : 'U'}</Avatar>
                    <IconButton onClick={handleAvatarClick} sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', border: '1px solid #E5E7EB', width: 32, height: 32 }}><PhotoCameraIcon sx={{ fontSize: 18, color: '#6B7280' }} /></IconButton>
                  </Box>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { minWidth: 180, border: '1px solid #E5E7EB' } }} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MenuItem onClick={() => { fileInputRef.current.click(); handleMenuClose(); }} sx={{ fontWeight: 800, py: 1.5 }}><EditIcon sx={{ mr: 1.5, color: '#6366F1' }} /> 이미지 변경</MenuItem>
                    <Divider sx={{ my: 0 }} />
                    <MenuItem onClick={handleDeleteImage} sx={{ fontWeight: 800, py: 1.5 }}><DeleteIcon sx={{ mr: 1.5, color: '#F43F5E' }} /> 이미지 삭제</MenuItem>
                  </Menu>
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 2 }}>{userInfo.nickname}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>@{userInfo.nickname?.toLowerCase()} · {userInfo.position}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 0)}><Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.postCount || 0}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>내 모집글</Typography></Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 1)}><Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.applyCount || 0}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>신청 현황</Typography></Box>
                  </Box>
                  <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={() => scrollToSection(profileRef)} sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, borderColor: '#E5E7EB', color: '#374151' }}>프로필 수정</Button>
                </Box>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 5, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Stack spacing={0.5}>
                  <MenuButton icon={<PersonIcon />} label="프로필 정보" onClick={() => scrollToSection(profileRef)} />
                  <MenuButton icon={<AssignmentIcon />} label="내 모집글" count={userInfo.postCount} onClick={() => scrollToSection(activityRef, 0)} />
                  <MenuButton icon={<EmailIcon />} label="신청 현황" count={userInfo.applyCount} onClick={() => scrollToSection(activityRef, 1)} />
                  <MenuButton icon={<RocketLaunchIcon />} label="내 팀" count={userInfo.acceptedProjects?.length || 0} onClick={() => scrollToSection(activityRef, 2)} />
                  <Divider sx={{ my: 1.5 }} />
                  <Button fullWidth startIcon={<LogoutIcon />} onClick={handleWithdrawal} sx={{ justifyContent: 'flex-start', color: '#9CA3AF', fontWeight: 800, px: 2, py: 1.5 }}>회원 탈퇴</Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={4}>
              <Paper ref={profileRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 5, display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />프로필 정보</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                  <Box><FormLabel text="닉네임" /><Stack direction="row" spacing={1}><TextField fullWidth value={formData.nickname} onChange={handleInputChange('nickname')} sx={inputStyle} /><Button variant="outlined" onClick={handleCheckNickname} sx={{ whiteSpace: 'nowrap', px: 3, borderRadius: 3, fontWeight: 800 }}>중복 확인</Button></Stack></Box>
                  <Box><FormLabel text="전화번호" /><Stack direction="row" spacing={1}><TextField fullWidth value={formData.phoneNumber} onChange={handleInputChange('phoneNumber')} placeholder="숫자만 입력" sx={inputStyle} /><Button variant="outlined" onClick={handleCheckPhone} sx={{ whiteSpace: 'nowrap', px: 3, borderRadius: 3, fontWeight: 800 }}>중복 확인</Button></Stack></Box>
                  <Box><FormLabel text="비밀번호 변경" /><TextField fullWidth type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="새 비밀번호 입력" InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}} sx={inputStyle} /></Box>
                  <Box><FormLabel text="비밀번호 확인" /><TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인 입력" InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}} sx={inputStyle} /></Box>
                  <Box><FormLabel text="포지션" /><TextField select fullWidth value={formData.position} onChange={handleInputChange('position')} sx={inputStyle}>{POSITION_OPTIONS.map((o) => ( <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem> ))}</TextField></Box>
                  <Box><FormLabel text="이메일" /><TextField fullWidth value={userInfo.email || ''} InputProps={{ readOnly: true }} sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><FormLabel text="기술 스택" /><Autocomplete multiple options={TECH_STACK_OPTIONS} value={formData.techStacks} onChange={handleTechStacksChange} freeSolo renderTags={(val, getTagProps) => val.map((opt, i) => { const { key, ...p } = getTagProps({ index: i }); return ( <Chip key={key} label={opt} {...p} variant="filled" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }} /> ); })} renderInput={(p) => ( <TextField {...p} variant="outlined" placeholder="스택 선택 또는 입력" sx={inputStyle} /> )} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><FormLabel text="한 줄 소개" /><TextField fullWidth multiline rows={2} value={formData.intro} onChange={handleInputChange('intro')} sx={inputStyle} /></Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}><Button variant="contained" onClick={handleSaveProfile} startIcon={<SaveIcon />} sx={{ px: 6, py: 1.8, borderRadius: 4, fontWeight: 900, bgcolor: '#6366F1' }}>저장하기</Button></Box>
              </Paper>

              <Paper ref={activityRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />활동 내역</Typography>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4, borderBottom: '1px solid #F3F4F6' }}><Tab label={`내 모집글 (${userInfo.postCount || 0})`} sx={{ fontWeight: 900, px: 3 }} /><Tab label={`신청 현황 (${userInfo.applyCount || 0})`} sx={{ fontWeight: 900, px: 3 }} /><Tab label={`내 팀 (${userInfo.acceptedProjects?.length || 0})`} sx={{ fontWeight: 900, px: 3 }} /></Tabs>
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>{['전체', '프로젝트', '스터디'].map((cat) => ( <Chip key={cat} label={cat} onClick={() => setCategoryFilter(cat)} sx={{ fontWeight: 800, px: 1, bgcolor: categoryFilter === cat ? '#6366F1' : '#F3F4F6', color: categoryFilter === cat ? 'white' : '#6B7280' }} /> ))}</Stack>
                <Stack spacing={2.5}>{displayList.length > 0 ? ( displayList.map((item) => ( <ActivityItem key={item.applyId || item.projectId || item.id} item={item} tabValue={tabValue} onTitleClick={() => { const targetId = item.projectId || item.id; if (tabValue === 1) navigate(`/posts/${targetId}`); else navigate(`/posts/${targetId}/board`); }} onManageClick={() => navigate(`/posts/${item.projectId || item.id}/edit`)} onViewAppsClick={() => handleOpenAppModal(item.projectId || item.id)} onCancelClick={() => handleCancelApplication(item.applyId || item.id)} /> )) ) : ( <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#F9FAFB', borderRadius: 4 }}><Typography color="text.secondary" sx={{ fontWeight: 600 }}>{categoryFilter} 내역이 없습니다.</Typography></Box> )}</Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* 지원자 목록 모달 */}
      <Dialog open={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#111827', borderBottom: '1px solid #F3F4F6', py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          지원자 목록
          <IconButton onClick={() => setIsAppModalOpen(false)} size="small" sx={{ color: '#9CA3AF' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {applications.length > 0 ? (
            <List sx={{ py: 0 }}>
              {applications.map((app) => (
                <ListItem key={app.applyId} button onClick={() => { setSelectedApp(app); setIsAppDetailOpen(true); }} sx={{ py: 2.5, px: 4, borderBottom: '1px solid #F9FAFB', transition: '0.2s', '&:hover': { bgcolor: '#F8F9FF' } }}>
                  <ListItemAvatar><Avatar src={app.profileImageUrl} sx={{ width: 48, height: 48, border: '2px solid #EEF2FF' }} /></ListItemAvatar>
                  <ListItemText primary={<Typography sx={{ fontWeight: 900, color: '#111827', fontSize: '1.05rem' }}>{app.nickname}</Typography>} secondary={<Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>{POSITION_OPTIONS.find(p => p.value === app.position)?.label || app.position} · {app.appliedDate}</Typography>} />
                  <Chip label={app.status === 'PENDING' ? '대기중' : (app.status === 'ACCEPTED' ? '승인됨' : '거절됨')} size="small" sx={{ fontWeight: 900, px: 1, bgcolor: app.status === 'PENDING' ? '#FFFBEB' : (app.status === 'ACCEPTED' ? '#ECFDF5' : '#FEF2F2'), color: app.status === 'PENDING' ? '#D97706' : (app.status === 'ACCEPTED' ? '#10B981' : '#EF4444'), borderRadius: 1.5 }} />
                  <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 2, color: '#D1D5DB' }} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 12, textAlign: 'center' }}><AssignmentIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} /><Typography color="text.secondary" sx={{ fontWeight: 700 }}>아직 지원자가 없습니다.</Typography></Box>
          )}
        </DialogContent>
      </Dialog>

      {/* 지원서 상세 모달 */}
      <Dialog open={isAppDetailOpen} onClose={() => setIsAppDetailOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedApp && (
          <>
            <DialogTitle sx={{ fontWeight: 900, color: '#111827', bgcolor: '#F8F9FF', py: 3, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedApp.nickname}님의 지원서
              <IconButton onClick={() => setIsAppDetailOpen(false)} size="small" sx={{ color: '#9CA3AF' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={3.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>지원 정보</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={POSITION_OPTIONS.find(p => p.value === selectedApp.position)?.label || selectedApp.position} sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 900, borderRadius: 1.5 }} />
                    <Chip label={selectedApp.appliedDate} variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5, borderColor: '#E5E7EB' }} />
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>지원 메시지</Typography>
                  <Typography sx={{ bgcolor: '#F9FAFB', p: 2.5, borderRadius: 2, border: '1px solid #F3F4F6', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500, color: '#374151', whiteSpace: 'pre-line' }}>{selectedApp.message}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>소통 채널</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#111827', pl: 1 }}>{selectedApp.contact}</Typography>
                </Box>
                {selectedApp.link && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>참고 링크</Typography>
                    <Link href={selectedApp.link.startsWith('http') ? selectedApp.link : `https://${selectedApp.link}`} target="_blank" sx={{ fontWeight: 800, color: '#6366F1', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, pl: 1, wordBreak: 'break-all' }}>{selectedApp.link}</Link>
                  </Box>
                )}
                {selectedApp.status === 'PENDING' && (
                  <Stack direction="row" spacing={2} sx={{ pt: 3 }}>
                    <Button fullWidth variant="contained" onClick={() => handleStatusUpdate(selectedApp.applyId, 'ACCEPTED')} startIcon={<CheckIcon />} sx={{ bgcolor: '#6366F1', fontWeight: 900, py: 1.8, borderRadius: 2.5, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' }}>승인하기</Button>
                    <Button fullWidth variant="outlined" onClick={() => handleStatusUpdate(selectedApp.applyId, 'REJECTED')} startIcon={<CloseIcon />} sx={{ color: '#EF4444', borderColor: '#EF4444', fontWeight: 900, py: 1.8, borderRadius: 2.5, '&:hover': { bgcolor: '#FFF1F2', borderColor: '#EF4444' } }}>거절하기</Button>
                  </Stack>
                )}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

const MenuButton = ({ icon, label, count, onClick }) => ( <Button fullWidth startIcon={icon} onClick={onClick} sx={{ justifyContent: 'flex-start', px: 2.5, py: 1.8, borderRadius: 3, fontWeight: 800, color: '#6B7280', '&:hover': { bgcolor: '#F9FAFB', color: '#6366F1' } }}><Box sx={{ flexGrow: 1, textAlign: 'left' }}>{label}</Box>{count !== undefined && <Chip label={count} size="small" sx={{ height: 22, fontWeight: 900, bgcolor: '#F3F4F6' }} />}</Button> );
const FormLabel = ({ text }) => <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, ml: 0.5, color: '#374151' }}>{text}</Typography>;
const ActivityItem = ({ item, tabValue, onTitleClick, onManageClick, onViewAppsClick, onCancelClick }) => {
  const categoryLabel = item.category === 'PROJECT' ? '[프로젝트]' : item.category === 'STUDY' ? '[스터디]' : '';
  const title = item.projectTitle || item.title;
  const status = tabValue === 2 ? '참여중' : (item.status === 'PENDING' ? '대기중' : '승인완료');
  const info = tabValue === 2 ? `팀장: ${item.ownerNickname || '알수없음'} | 역할: ${item.position || '멤버'}` : `지원 분야: ${item.position || '선택없음'} · 신청일: ${item.appliedDate || item.endDate}`;
  return ( <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#F9FAFB', border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { bgcolor: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }, transition: '0.2s' }}><Box sx={{ flex: 1 }}><Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}><Typography variant="h6" onClick={onTitleClick} sx={{ fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', '&:hover': { color: '#6366F1', textDecoration: 'underline' } }}><Box component="span" sx={{ color: item.category === 'PROJECT' ? 'primary.main' : 'warning.main', mr: 1 }}>{categoryLabel}</Box>{title}</Typography>{tabValue !== 0 && ( <Chip label={status} size="small" sx={{ fontWeight: 900, bgcolor: status === '참여중' ? '#EEF2FF' : (status === '대기중' ? '#FFFBEB' : '#ECFDF5'), color: status === '참여중' ? '#6366F1' : (status === '대기중' ? '#D97706' : '#10B981') }} /> )}</Stack><Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{info}</Typography></Box><Stack direction="row" spacing={1}>{tabValue === 0 && ( <> <Button variant="contained" disableElevation onClick={onViewAppsClick} sx={{ bgcolor: '#6366F1', color: 'white', fontWeight: 900, borderRadius: 2 }}>지원서 보기</Button> <Button variant="contained" disableElevation onClick={onManageClick} sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 900, borderRadius: 2 }}>관리</Button> </> )}{tabValue === 1 && item.status === 'PENDING' && <Button variant="outlined" color="error" onClick={onCancelClick} sx={{ fontWeight: 800, borderRadius: 2 }}>취소하기</Button>}</Stack></Box> );
};
const inputStyle = { '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, fontSize: '0.95rem', fontWeight: 600, '& fieldset': { border: '1px solid #E5E7EB' }, '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' }, '&.Mui-focused': { bgcolor: 'white' } } };

export default MyPage;
