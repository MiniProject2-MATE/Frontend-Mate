import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';
import ToastMessage from '../common/ToastMessage';
import { useUiStore } from '@/store/uiStore';

const MainLayout = () => {
  const { toast, hideToast } = useUiStore();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      
      {/* 전역 토스트 메시지 그릇 */}
      <ToastMessage 
        open={Boolean(toast)}
        message={toast?.message || ''}
        severity={toast?.type || 'success'}
        onClose={hideToast}
      />
    </Box>
  );
};

export default MainLayout;