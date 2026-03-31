import React, { useEffect } from 'react';
import { Container, Grid, Box, Typography, TextField, Button, InputAdornment, Skeleton, Pagination as MuiPagination, useMediaQuery, useTheme, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { usePostStore } from '../store/postStore';
import PostCard from '../component/common/PostCard';

const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { 
    posts, 
    isLoading, 
    fetchPosts, 
    keyword, 
    setKeyword, 
    category, 
    setCategory, 
    page, 
    setPage, 
    totalPages 
  } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, [category, page]);

  const handleSearch = () => {
    fetchPosts({ page: 0 });
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['전체', '스터디', '프로젝트'];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#ffffff' }}>
      {/* Hero Section - Extremely Wide & Minimalist */}
      <Box sx={{ 
        bgcolor: 'background.default', 
        pt: { xs: 12, md: 20 }, 
        pb: { xs: 10, md: 18 }, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* Background Gradients - Soft & Premium */}
        <Box sx={{
          position: 'absolute',
          top: -300,
          left: '30%',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -200,
          right: '20%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,157,0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 8, lg: 12 } }}>
          <Box sx={{ 
            bgcolor: 'primary.soft', 
            color: 'primary.main', 
            px: 3, 
            py: 1, 
            borderRadius: 99, 
            fontSize: '0.9rem', 
            fontWeight: 800, 
            mb: 5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <span>✨</span> Discover Your Perfect Project Partner
          </Box>

          <Typography variant="h1" sx={{ 
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' }, 
            lineHeight: 1.1, 
            mb: 4,
            fontWeight: 900,
            color: 'text.primary',
            letterSpacing: '-0.04em'
          }}>
            함께 성장할<br />
            <Box component="span" sx={{ 
              background: 'linear-gradient(90deg, #6C63FF, #FF6B9D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>크리에이티브 메이트</Box>를 찾으세요
          </Typography>

          <Typography sx={{ 
            color: 'text.secondary', 
            mb: 8, 
            maxWidth: 800, 
            mx: 'auto',
            fontSize: { xs: '1rem', md: '1.35rem' },
            lineHeight: 1.7,
            fontWeight: 500,
            letterSpacing: '-0.01em'
          }}>
            당신의 아이디어를 현실로 만들어줄 최고의 팀원들이 기다리고 있습니다.<br />
            지금 바로 필터링을 통해 원하는 메이트를 찾아보세요.
          </Typography>

          {/* Search Bar - Sophisticated & Clean */}
          <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mb: 8 }}>
            <Paper elevation={0} sx={{ 
              p: 1.5, 
              borderRadius: 99, 
              display: 'flex', 
              alignItems: 'center',
              boxShadow: '0 20px 80px rgba(0,0,0,0.08)',
              border: '1px solid rgba(108,99,255,0.1)',
              bgcolor: '#ffffff'
            }}>
              <TextField
                placeholder="관심 있는 기술 스택이나 프로젝트 주제를 입력하세요"
                variant="standard"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 3 }}>
                      <SearchIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    px: 2,
                    fontSize: '1.2rem',
                    fontWeight: 500
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                sx={{ 
                  px: 6, 
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 99,
                  fontWeight: 800,
                  boxShadow: '0 12px 32px rgba(108,99,255,0.3)',
                  textTransform: 'none'
                }}
              >
                Search
              </Button>
            </Paper>
          </Box>

          {/* Filter Pills */}
          <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center' }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'contained' : 'text'}
                onClick={() => handleCategoryChange(cat)}
                sx={{ 
                  minWidth: 120,
                  height: 52,
                  borderRadius: 4,
                  bgcolor: category === cat ? 'primary.main' : 'transparent',
                  color: category === cat ? '#fff' : 'text.secondary',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: category === cat ? 'primary.main' : 'primary.soft',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                {cat}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ py: { xs: 12, md: 18 }, px: { xs: 3, md: 8, lg: 12 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          mb: 8,
          borderBottom: '2px solid #F3F4F6',
          pb: 4
        }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              fontSize: { xs: '2rem', md: '2.75rem' },
              letterSpacing: '-0.03em',
              mb: 1
            }}>
              🚀 New Opportunities
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
              실시간으로 업데이트되는 모집 공고를 확인하세요.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={5}>
          {isLoading ? (
            [...Array(8)].map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <PostCard isLoading={true} />
              </Grid>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={post.projectId}>
                <PostCard post={post} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ py: 20, textAlign: 'center' }}>
                <Typography variant="h4" color="text.muted" sx={{ fontWeight: 800 }}>No results found.</Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 15 }}>
            <MuiPagination 
              count={totalPages} 
              page={page + 1} 
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 4,
                  fontWeight: 900,
                  height: 64,
                  minWidth: 64,
                  fontSize: '1.2rem'
                }
              }}
            />
          </Box>
        )}
      </Box>

      {/* Experience Banner */}
      <Box sx={{ pb: 20, px: { xs: 3, md: 8, lg: 12 } }}>
        <Paper elevation={0} sx={{ 
          bgcolor: 'primary.main', 
          borderRadius: 10, 
          p: { xs: 8, md: 12 }, 
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(108,99,255,0.3)'
        }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.03em' }}>
            Ready to Build Your Dream Team?
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 8, fontWeight: 500 }}>
            지금 바로 프로젝트를 등록하고 전 세계의 메이트들을 만나보세요.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: '#ffffff', 
              color: 'primary.main',
              px: 8,
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 900,
              borderRadius: 99,
              '&:hover': { bgcolor: '#f8f8f8' }
            }}
          >
            Start Your Project
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default MainPage;
