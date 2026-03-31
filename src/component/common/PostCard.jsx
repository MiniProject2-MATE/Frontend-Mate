import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import Tag from './Tag';
import Avatar from './Avatar';

export default function PostCard({ post, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={60} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
          <Skeleton variant="text" width="80%" height={32} />
          <Skeleton variant="text" width="100%" height={60} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={50} height={24} />
            <Skeleton variant="rectangular" width={50} height={24} />
          </Box>
        </Box>
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Skeleton variant="text" width="40%" />
        </Box>
      </Card>
    );
  }

  if (!post) return null;

  const {
    projectId,
    title,
    content,
    category,
    status,
    recruitCount,
    currentCount,
    endDate,
    ownerNickname,
    techStacks = [],
  } = post;

  // D-Day 계산
  const calculateDDay = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `D-${diff}` : '만료';
  };

  const dDay = calculateDDay(endDate);
  const progress = (currentCount / recruitCount) * 100;

  return (
    <Card 
      onClick={() => navigate(`/posts/${projectId}`)}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
          '&::after': {
            opacity: 1,
          }
        },
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6C63FF, #FF6B9D)',
          opacity: 0,
          transition: 'opacity 0.2s',
        }
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 500 }}>
              {currentCount}/{recruitCount} Joiners
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 500 }}>
              {dDay}
            </Typography>
          </Box>
          <Badge status={status} />
        </Box>

        <Typography variant="h6" component="div" sx={{ 
          fontSize: '1rem', 
          fontWeight: 700, 
          lineHeight: 1.4, 
          mb: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          letterSpacing: '-0.3px'
        }}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.6
        }}>
          {content}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          {techStacks.map((stack, idx) => (
            <Tag key={idx} label={stack} />
          ))}
        </Box>
      </CardContent>

      <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar name={ownerNickname} size="sm" />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {ownerNickname}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 500 }}>
          ~ {endDate}
        </Typography>
      </Box>
    </Card>
  );
}
