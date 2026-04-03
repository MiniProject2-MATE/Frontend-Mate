import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Avatar, Stack, 
  Button, Divider, TextField, Chip, IconButton, Tabs, Tab, LinearProgress, InputAdornment, MenuItem, Menu
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

import axiosInstance from '../api/axiosInstance'; 
import Breadcrumb from '../component/common/Breadcrumb';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUiStore();
  const { user: authUser, updateUser } = useAuthStore();

  const [tabValue, setTabValue] = useState(0); 
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);

  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    position: '',
    phoneNumber: '',
    intro: ''
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

  const POSITION_OPTIONS = [
    { value: 'FE', label: '프론트엔드 (FE)' },
    { value: 'BE', label: '백엔드 (BE)' },
    { value: 'DE', label: '디자이너 (DE)' },
    { value: 'PM', label: '기획자 (PM)' },
    { value: 'ETC', label: '기타 (ETC)' }
  ];

  const profileRef = useRef(null);
  const activityRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await axiosInstance.get('/users/me');
        setUserInfo(data);
        setFormData({
          nickname: data.nickname || '',
          position: data.position || '',
          phoneNumber: data.phoneNumber || '',
          intro: data.intro || ''
        });
        updateUser(data);

        // [추가] 지원 완료 후 넘어온 정보가 있으면 탭 변경 및 스크롤
        if (location.state?.activeTab !== undefined) {
          setTabValue(location.state.activeTab); // 예: 1번 탭(신청 현황)
          
          setTimeout(() => {
            const targetRef = location.state.scrollTo === 'profile' ? profileRef : activityRef;
            if (targetRef.current) {
              const offset = targetRef.current.offsetTop - 100;
              window.scrollTo({ top: offset, behavior: 'smooth' });
            }
          }, 100);
          
          // 사용한 state 초기화 (새로고침 시 유지 안되도록)
          window.history.replaceState({}, document.title);
        }
      } catch (error) {
        console.error("회원 정보를 불러오지 못했습니다.", error);
        if (authUser) {
          setUserInfo(authUser);
          setFormData({
            nickname: authUser.nickname || '',
            position: authUser.position || '',
            phoneNumber: authUser.phoneNumber || '',
            intro: authUser.intro || ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]); 

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

  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) {
      showToast('닉네임을 입력해주세요.', 'warning');
      return;
    }
    if (formData.nickname === userInfo.nickname) {
      showToast('현재 사용 중인 본인의 닉네임입니다.', 'info');
      setIsNicknameChecked(true);
      setLastCheckedNickname(formData.nickname);
      return;
    }
    try {
      const response = await axiosInstance.get(`/auth/check-nickname?nickname=${formData.nickname}`);
      if (response.isAvailable) {
        showToast('사용 가능한 닉네임입니다!', 'success');
        setIsNicknameChecked(true);
        setLastCheckedNickname(formData.nickname);
      } else {
        showToast('이미 사용 중인 닉네임입니다.', 'error');
        setIsNicknameChecked(false);
      }
    } catch {
      showToast('중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCheckPhone = async () => {
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      showToast('유효한 전화번호를 입력해주세요.', 'warning');
      return;
    }
    if (formData.phoneNumber === userInfo.phoneNumber) {
      showToast('현재 등록된 본인의 번호입니다.', 'info');
      setIsPhoneChecked(true);
      setLastCheckedPhone(formData.phoneNumber);
      return;
    }
    try {
      const response = await axiosInstance.get(`/users/check-phone?phoneNumber=${formData.phoneNumber}`);
      if (response.isAvailable) {
        showToast('사용 가능한 전화번호입니다.', 'success');
        setIsPhoneChecked(true);
        setLastCheckedPhone(formData.phoneNumber);
      } else {
        showToast('이미 등록된 전화번호입니다.', 'error');
        setIsPhoneChecked(false);
      }
    } catch {
      showToast('중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleSaveProfile = async () => {
    const isProfileUnchanged = 
      formData.nickname === userInfo.nickname &&
      formData.position === userInfo.position &&
      formData.phoneNumber === userInfo.phoneNumber &&
      formData.intro === userInfo.intro;
    
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
        ...(password && { password })
      };
      const response = await axiosInstance.put('/users/me', updatePayload);
      
      // 인터셉터가 response.data.data를 반환하므로 바로 사용
      const updatedUser = {
        ...response,
        userId: response.userId || response.id // userId 우선순위
      };
      
      setUserInfo(updatedUser); 
      updateUser(updatedUser); 
      showToast('프로필 정보가 성공적으로 저장되었습니다!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch {
      showToast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 4.5.5 프로필 이미지 수정 핸들러
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 검증: 확장자 및 크기(5MB)
    const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedExtensions.includes(file.type)) {
      showToast('JPG, JPEG, PNG 파일만 업로드 가능합니다.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('파일 크기는 최대 5MB까지 허용됩니다.', 'error');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('profileImage', file);

    try {
      // 1. 서버에 업로드 요청
      const response = await axiosInstance.patch('/users/profile-image', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. [목업 대응 수정] 서버가 가짜 URL을 줄 경우 화면에는 사용자가 선택한 실제 이미지의 임시 URL을 보여줌
      const previewUrl = URL.createObjectURL(file);

      setUserInfo(prev => ({ ...prev, profileImageUrl: previewUrl }));
      updateUser({ ...userInfo, profileImageUrl: previewUrl });
      
      showToast(response.message || '프로필 이미지가 변경되었습니다.', 'success');
    } catch {
      showToast('이미지 업데이트 중 오류가 발생했습니다.', 'error');
    } finally {
      handleMenuClose();
    }
  };

  // 4.5.6 프로필 이미지 삭제 핸들러
  const handleDeleteImage = async () => {
    try {
      const response = await axiosInstance.delete('/users/profile-image');      
      
      // MSW 응답 데이터 구조: response.data 안에 profileImageUrl이 들어있음
      const defaultUrl = response.profileImageUrl; // axiosInstance 설정에 따라 response 자체가 data일 수 있음

      // 1. 로컬 state 업데이트
      setUserInfo(prev => ({ ...prev, profileImageUrl: defaultUrl }));

      // 2. Auth 스토어 업데이트 (객체 형태로 전달하여 안전하게 갱신)
      updateUser({ 
        ...userInfo, 
        profileImageUrl: defaultUrl 
      });

      showToast(response.message || '기본 이미지로 변경되었습니다.', 'success');
    } catch (error) {
      console.error("삭제 중 상세 에러:", error); // 에러 원인 파악을 위해 콘솔 출력 추가
      showToast('이미지 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      handleMenuClose();
    }
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
          
          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0, position: { md: 'sticky' }, top: '100px' }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Box sx={{ height: 100, background: 'linear-gradient(135deg, #A78BFA 0%, #6366F1 100%)' }} />
                <Box sx={{ px: 3, pb: 4, textAlign: 'center', mt: -6 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar 
                      src={userInfo.profileImageUrl}
                      onClick={handleAvatarClick}
                      sx={{ 
                        width: 110, height: 110, mx: 'auto', border: '5px solid white', bgcolor: '#6366F1', 
                        fontSize: '2.5rem', fontWeight: 900, cursor: 'pointer',
                        '&:hover': { opacity: 0.8, transition: '0.3s' }
                      }}
                    >
                      {userInfo.nickname ? userInfo.nickname[0] : 'U'}
                    </Avatar>
                    <IconButton 
                      onClick={handleAvatarClick}
                      sx={{ 
                        position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', border: '1px solid #E5E7EB',
                        '&:hover': { bgcolor: '#F3F4F6' }, width: 32, height: 32
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                    </IconButton>
                  </Box>

                  {/* 프로필 이미지 관리 메뉴 */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{ sx: { borderRadius: 3, mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                  >
                    <MenuItem onClick={() => fileInputRef.current.click()} sx={{ fontWeight: 700, py: 1.2, px: 2 }}>
                      <EditIcon sx={{ fontSize: 18, mr: 1.5, color: '#6366F1' }} /> 이미지 변경
                    </MenuItem>
                    <MenuItem onClick={handleDeleteImage} sx={{ fontWeight: 700, py: 1.2, px: 2, color: '#EF4444' }}>
                      <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} /> 이미지 삭제
                    </MenuItem>
                  </Menu>
                  <input type="file" hidden ref={fileInputRef} accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} />

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

          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={4}>
              <Paper ref={profileRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 5, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />프로필 정보
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                  <Box>
                    <FormLabel text="닉네임" />
                    <Stack direction="row" spacing={1}>
                      <TextField fullWidth value={formData.nickname} onChange={handleInputChange('nickname')} sx={inputStyle} />
                      <Button 
                        variant="outlined" onClick={handleCheckNickname}
                        disabled={isNicknameChecked && formData.nickname === (lastCheckedNickname || userInfo?.nickname)}
                        sx={{ whiteSpace: 'nowrap', px: 3, borderRadius: 3, fontWeight: 800, borderColor: isNicknameChecked ? '#10B981' : '#6366F1', color: isNicknameChecked ? '#10B981' : '#6366F1' }}
                      >
                        {isNicknameChecked ? '확인됨' : '중복 확인'}
                      </Button>
                    </Stack>
                  </Box>
                  <Box>
                    <FormLabel text="이메일" />
                    <TextField fullWidth value={userInfo.email || ''} InputProps={{ readOnly: true }} sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }} />
                  </Box>
                  
                  <Box>
                    <FormLabel text="비밀번호 변경" />
                    <TextField 
                      fullWidth type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="새 비밀번호 입력"
                      InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}}
                      sx={inputStyle} 
                    />
                  </Box>
                  <Box>
                    <FormLabel text="비밀번호 확인" />
                    <TextField 
                      fullWidth type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인 입력"
                      error={password !== confirmPassword && confirmPassword !== ''}
                      helperText={password !== confirmPassword && confirmPassword !== '' ? '비밀번호가 일치하지 않습니다.' : ''}
                      InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}}
                      sx={inputStyle} 
                    />
                  </Box>

                  <Box>
                    <FormLabel text="포지션" />
                    <TextField select fullWidth value={formData.position} onChange={handleInputChange('position')} sx={inputStyle}>
                      {POSITION_OPTIONS.map((option) => ( <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem> ))}
                    </TextField>
                  </Box>
                  <Box>
                    <FormLabel text="전화번호" />
                    <Stack direction="row" spacing={1}>
                      <TextField fullWidth value={formData.phoneNumber} onChange={handleInputChange('phoneNumber')} placeholder="숫자만 입력" sx={inputStyle} />
                      <Button 
                        variant="outlined" onClick={handleCheckPhone}
                        disabled={isPhoneChecked && formData.phoneNumber === (lastCheckedPhone || userInfo?.phoneNumber)}
                        sx={{ whiteSpace: 'nowrap', px: 3, borderRadius: 3, fontWeight: 800, borderColor: isPhoneChecked ? '#10B981' : '#6366F1', color: isPhoneChecked ? '#10B981' : '#6366F1' }}
                      >
                        {isPhoneChecked ? '확인됨' : '중복 확인'}
                      </Button>
                    </Stack>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <FormLabel text="한 줄 소개" />
                    <TextField fullWidth multiline rows={2} value={formData.intro} onChange={handleInputChange('intro')} sx={inputStyle} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
                  <Button variant="contained" onClick={handleSaveProfile} startIcon={<SaveIcon />} sx={{ px: 6, py: 1.8, borderRadius: 4, fontWeight: 900, bgcolor: '#6366F1' }}>저장하기</Button>
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
                      sx={{ fontWeight: 800, px: 1, bgcolor: categoryFilter === cat ? '#6366F1' : '#F3F4F6', color: categoryFilter === cat ? 'white' : '#6B7280' }} 
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
                          const targetId = item.projectId || item.id;
                          if (tabValue === 1) {
                            navigate(`/posts/${targetId}`);
                          } else {
                            navigate(`/posts/${targetId}/board`);
                          }
                        }}
                        onManageClick={() => {
                          const id = item.projectId || item.id;
                          navigate(`/posts/${id}/edit`);
                        }}
                      />
                    ))
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#F9FAFB', borderRadius: 4 }}>
                      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>{categoryFilter} 내역이 없습니다.</Typography>
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
            onClick={onManageClick}
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