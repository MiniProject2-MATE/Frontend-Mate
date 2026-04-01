import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';
import ToastMessage from '../common/ToastMessage';
import ConfirmModal from '../common/ConfirmModal';
import { useUiStore } from '@/store/uiStore';

const MainLayout = () => {
  const { toast, hideToast, modal, closeModal } = useUiStore();
  
  // 토스트 및 모달의 애니메이션을 위한 로컬 상태 유지
  const [lastToast, setLastToast] = useState({ message: '', type: 'success' });
  const [lastModal, setLastModal] = useState({ title: '확인', message: '', confirmText: '확인', cancelText: '취소', color: 'primary', onConfirm: () => {} });

  useEffect(() => {
    if (toast) {
      setLastToast({
        message: toast.message,
        type: toast.type
      });
    }
  }, [toast]);

  useEffect(() => {
    if (modal?.data) {
      setLastModal({
        title: modal.data.title || '확인',
        message: modal.data.message || '',
        confirmText: modal.data.confirmText || '확인',
        cancelText: modal.data.cancelText || '취소',
        color: modal.data.color || 'primary',
        onConfirm: modal.data.onConfirm || (() => {})
      });
    }
  }, [modal]);

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
        message={lastToast.message}
        severity={lastToast.type}
        onClose={hideToast}
      />

      {/* 전역 컨펌 모달 - lastModal을 사용하여 닫히는 순간 데이터 유지 */}
      <ConfirmModal 
        open={Boolean(modal)}
        title={lastModal.title}
        message={lastModal.message}
        confirmText={lastModal.confirmText}
        cancelText={lastModal.cancelText}
        color={lastModal.color}
        onConfirm={lastModal.onConfirm}
        onClose={closeModal}
      />
    </Box>
  );
};

export default MainLayout;