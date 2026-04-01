import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Container, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { showToast } = useUiStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    if (mobileOpen) setMobileOpen(false);
  };

  // Explore 경로에 해시(#) 추가
  const menuItems = [
    { label: 'Explore', path: '/#new-opportunities' },
    { label: 'Create', path: '/posts/new' },
  ];

  const handleMenuClick = (item) => (e) => {
    if (item.label === 'Create') {
      e.preventDefault();
      if (!isLoggedIn) {
        showToast('로그인이 필요한 서비스입니다.', 'warning');
        navigate('/login', { state: { from: '/posts/new' } });
      } else {
        navigate('/posts/new');
      }
    }
    // Explore 클릭 시에도 모바일 드로어 닫기
    if (mobileOpen) setMobileOpen(false);
  };

  const filteredMenuItems = menuItems;

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 2, color: 'primary.main', fontWeight: 800 }}>
        mate
      </Typography>
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.label} 
            component={Link} 
            to={item.path}
            onClick={handleMenuClick(item)}
            selected={location.pathname + location.hash === item.path}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {isLoggedIn ? (
          <>
            <ListItem button component={Link} to="/mypage" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="마이페이지" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="로그아웃" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="로그인" />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Get Started" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(238,242,248,0.85)', 
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 5, lg: 8 } }}>
          <Toolbar sx={{ height: 60, px: 0 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: 'primary.main',
                textDecoration: 'none',
                mr: 6,
                letterSpacing: '-0.5px'
              }}
            >
              mate
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 4, flexGrow: 1 }}>
                {filteredMenuItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    onClick={handleMenuClick(item)}
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: (location.pathname + location.hash) === item.path ? 'primary.main' : 'text.secondary',
                      '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              {!isMobile ? (
                isLoggedIn ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.muted', fontWeight: 600, fontSize: 15 }}>
                      {user?.nickname}님
                    </Typography>
                    <Button 
                      component={Link} 
                      to="/mypage" 
                      variant="text" 
                      sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 15 }}
                    >
                      마이페이지
                    </Button>
                    <Button 
                      onClick={handleLogout} 
                      variant="outlined" 
                      sx={{ borderRadius: 2, px: 3, fontSize: 15 }}
                    >
                      로그아웃
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      component={Link} 
                      to="/login" 
                      variant="text" 
                      sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 15 }}
                    >
                      로그인
                    </Button>
                    <Button 
                      component={Link} 
                      to="/register" 
                      variant="contained" 
                      sx={{ px: 4, py: 1, fontSize: 15, fontWeight: 700 }}
                    >
                      Get Started
                    </Button>
                  </Box>
                )
              ) : (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: 'text.primary' }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
      <Toolbar />
    </>
  );
};

export default Header;