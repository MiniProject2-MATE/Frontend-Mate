import { createTheme } from '@mui/material/styles';

/**
 * Mate 프로젝트 MUI 테마 설정
 * 참조 문서: 컴포넌트 라이브러리.md, UI 화면 설계서.md
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF', // Primary (보라)
      light: '#8B85FF',
      soft: '#EDE9FF', // Primary-soft (연보라)
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B9D', // Accent (핑크)
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#EEF2F8', // Background (페이지 배경)
      paper: '#FFFFFF',   // Surface (흰색 - 카드, 입력창)
    },
    text: {
      primary: '#1A1A2E',   // Text-primary
      secondary: '#6B7280', // Text-secondary
      disabled: '#9CA3AF',  // Text-muted
    },
    divider: '#E5E7EB', // Border
    
    // 상태별 커스텀 색상 (Badge/Status)
    status: {
      recruiting: {
        bg: '#DCFCE7',
        text: '#166534',
      },
      closingSoon: {
        bg: '#FEF3C7',
        text: '#92400E',
      },
      closed: {
        bg: '#F3F4F6',
        text: '#6B7280',
      },
      leader: {
        bg: '#EDE9FF',
        text: '#6C63FF',
      },
      notice: {
        bg: '#EDE9FF',
        text: '#6C63FF',
      },
    },
    
    // 아바타 커스텀 색상
    avatar: {
      av1: '#6C63FF',
      av2: '#FF6B9D',
      av3: '#34D399',
      av4: '#F59E0B',
    }
  },
  
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: {
      textTransform: 'none', // 버튼 텍스트 대문자 변환 방지
      fontWeight: 600,
    },
  },
  
  shape: {
    borderRadius: 10, // 기본 radius (버튼/입력창 기준)
  },
  
  components: {
    // 전역 스타일 오버라이드
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#EEF2F8',
          fontFamily: 'Pretendard, -apple-system, sans-serif',
        },
      },
    },
    
    // 카드 곡률 (16px)
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    
    // 버튼 곡률 (10px) 및 스타일
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#6C63FF',
          '&:hover': {
            backgroundColor: '#5A52E5',
          },
        },
      },
    },
    
    // 입력창 곡률 (10px)
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E5E7EB',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6C63FF',
          },
        },
      },
    },
    
    // 뱃지/태그 곡률 (99px)
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 99,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    
    // 페이퍼(컨테이너) 곡률
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
