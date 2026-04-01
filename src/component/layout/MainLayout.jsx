import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';
import ToastMessage from '../common/ToastMessage';
import { useUiStore } from '@/store/uiStore';

const MainLayout = () => {
  const { toast, hideToast } = useUiStore();
  
  // 토스트가 닫히는 중에도 데이터를 유지하기 위한 로컬 상태
  const [lastToast, setLastToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (toast) {
      setLastToast({
        message: toast.message,
        type: toast.type
      });
    }
  }, [toast]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      
      {/* 전역 토스트 메시지 그릇 - lastToast를 사용하여 닫히는 순간 데이터 유지 */}
      <ToastMessage 
        open={Boolean(toast)}
        message={lastToast.message}
        severity={lastToast.type}
        onClose={hideToast}
      />
    </Box>
  );
};

export default MainLayout;