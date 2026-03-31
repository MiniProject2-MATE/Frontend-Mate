import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: { xs: 2, md: 5, lg: 8 },
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid #F3F4F6',
      }}
    >
      <Container maxWidth={false} sx={{ px: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 3
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>mate</Typography>
            <Typography variant="body2" color="text.muted">
              ⓒ 2026 MATE. Connecting Creative Mates.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 4, sm: 6 } }}>
            <Link href="#" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>About</Link>
            <Link href="#" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Terms</Link>
            <Link href="#" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Privacy</Link>
            <Link href="#" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Contact</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
