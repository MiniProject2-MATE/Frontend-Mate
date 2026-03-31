import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Paper, Stack, Divider, InputAdornment, RadioGroup, FormControlLabel, Radio, FormLabel, List, ListItem, ListItemText, ListItemIcon, IconButton, LinearProgress, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2'; 
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/common/Breadcrumb'; 
import Button from '@/components/common/Button'; 
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DevicesIcon from '@mui/icons-material/Devices';
import LaptopIcon from '@mui/icons-material/Laptop';

const commonInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 4, height: 56, bgcolor: '#F9FAFB',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: 'primary.light' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const PostWritePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'PROJECT', title: '', recruitCount: 4, techStacks: ['React', 'Spring Boot'], endDate: '', onOffline: 'ONLINE', content: ''
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '80px', pb: 8 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: 'Explore', path: '/posts' }, { label: '모집글 작성' }]} />
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, mt: 3 }}>▌모집글 작성</Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8.2 }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 8, border: '1px solid #EEEEEE' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>▌기본 정보</Typography>
              <Box sx={{ mb: 4 }}>
                <FormLabel sx={{ fontWeight: 700, mb: 1.5, display: 'block', color: 'text.primary' }}>모집 유형 *</FormLabel>
                <RadioGroup row value={formData.category} onChange={handleChange('category')} sx={{ gap: 2 }}>
                  <FormControlLabel value="PROJECT" control={<Radio />} label="프로젝트" />
                  <FormControlLabel value="STUDY" control={<Radio />} label="스터디" />
                </RadioGroup>
              </Box>
              <TextField fullWidth label="제목 *" value={formData.title} onChange={handleChange('title')} sx={commonInputStyles} />
              <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>취소</Button>
                <Button variant="contained">🚀 등록</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
export default PostWritePage;