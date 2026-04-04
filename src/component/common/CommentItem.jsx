// components/common/CommentItem.jsx
import Avatar from './Avatar'
import { Box, Typography, Stack, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CommentItem({ comment, currentUserId, projectOwnerId, onEdit, onDelete }) {
  // ID 비교 시 Number()를 사용하여 타입 불일치 방지 (문자열 vs 숫자)
  const isAuthor = currentUserId && comment.authorId && Number(comment.authorId) === Number(currentUserId);
  const isProjectOwner = currentUserId && projectOwnerId && Number(currentUserId) === Number(projectOwnerId);
  
  // 수정 권한: 본인만
  const canEdit = isAuthor;
  // 삭제 권한: 본인 또는 프로젝트 방장
  const canDelete = isAuthor || isProjectOwner;

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      py: 3, 
      borderBottom: '1px solid #F3F4F6',
      '&:last-child': { borderBottom: 'none' }
    }}>
      <Avatar name={comment.author} size="lg" src={comment.authorImage} />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
              {comment.author}
            </Typography>
            {projectOwnerId && Number(comment.authorId) === Number(projectOwnerId) && (
              <Box component="span" sx={{ 
                fontSize: '0.75rem', fontWeight: 900, px: 1, py: 0.2, 
                bgcolor: '#EEF2FF', color: '#6366F1', borderRadius: 1 
              }}>방장</Box>
            )}
            <Typography sx={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 500 }}>
              {comment.date}
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={0.5}>
            {canEdit && (
              <IconButton size="small" onClick={() => onEdit(comment)} sx={{ color: '#9CA3AF', '&:hover': { color: '#6366F1', bgcolor: '#EEF2FF' } }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size="small" onClick={() => onDelete(comment.id)} sx={{ color: '#9CA3AF', '&:hover': { color: '#F43F5E', bgcolor: '#FEF2F2' } }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Stack>
        </Stack>
        
        <Typography sx={{ 
          fontSize: '1.05rem', 
          color: '#374151', 
          lineHeight: 1.7, 
          fontWeight: 500,
          whiteSpace: 'pre-line' 
        }}>
          {comment.content}
        </Typography>
      </Box>
    </Box>
  )
}
