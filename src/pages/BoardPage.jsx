import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, 
  Stack, Chip, Avatar, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, LinearProgress, IconButton
} from '@mui/material';

// Icons
import CreateIcon from '@mui/icons-material/Create';
import ForumIcon from '@mui/icons-material/Forum';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import Pagination from '../component/common/Pagination';
import CommentItem from '../component/common/CommentItem';

// API
import boardApi from '../api/boardApi';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 페이지 이동을 위해 추가
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [projectInfo, setProjectInfo] = useState({ title: "프로젝트 게시판", members: [] });
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  
  // 상세 보기 및 글쓰기 모달 상태
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  
  // 글쓰기 폼 상태
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'GENERAL' });
  
  // 댓글 상태
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 데이터 불러오기 (게시글 목록)
  const fetchPosts = async (page) => {
    try {
      const response = await boardApi.getBoardPosts(id, page, 10);
      if (response && response.content) {
        setPosts(response.content);
        setPageInfo({
          totalPages: response.page.totalPages,
          totalElements: response.page.totalElements
        });
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  // 초기 로드: 프로젝트 정보 & 첫 페이지 목록
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, projectRes] = await Promise.all([
          boardApi.getBoardPosts(id, 0, 10),
          boardApi.getProjectDetail(id)
        ]);

        if (postsRes && postsRes.content) {
          setPosts(postsRes.content);
          setPageInfo({
            totalPages: postsRes.page.totalPages,
            totalElements: postsRes.page.totalElements
          });
        }
        if (projectRes) {
          setProjectInfo(projectRes);
        }
      } catch (error) {
        console.error("Failed to initialize board data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchPosts(newPage);
    // 페이지 변경 시 상단으로 스크롤 (선택 사항)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = async (post) => {
    try {
      const response = await boardApi.getBoardPostDetail(id, post.id);
      const commentRes = await boardApi.getComments(id, post.id);
      if (response) {
        setSelectedPost(response);
        setComments(commentRes || []);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch post detail:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    try {
      const response = await boardApi.createBoardPost(id, newPost);
      if (response) {
        setIsWriteOpen(false);
        setNewPost({ title: '', content: '', type: 'GENERAL' });
        setCurrentPage(0); // 첫 페이지로 이동
        fetchPosts(0);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment) return;
    try {
      const response = await boardApi.createComment(id, selectedPost.id, newComment);
      if (response) {
        setNewComment('');
        const commentRes = await boardApi.getComments(id, selectedPost.id);
        setComments(commentRes || []);
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb 
          items={[
            { label: '홈', path: '/' }, 
            { label: '프로젝트 탐색', path: `/posts` }, 
            { label: projectInfo.title, path: `/posts/${id}` },
            { label: '전용 게시판' }
          ]} 
        />

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, mt: 2, mb: 4, borderRadius: 5, border: '1px solid #EEEEEE',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FF 100%)',
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '0.1em' }}>
                PROJECT DASHBOARD
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              {projectInfo.title}
            </Typography>
          </Box>
          <CustomButton 
            variant="outlined" 
            onClick={() => navigate(`/posts/${id}`)} // navigate로 명시적 변경
            endIcon={<ChevronRightIcon />}
            sx={{ borderRadius: 3, px: 4, height: 48, fontWeight: 800, bgcolor: 'white' }}
          >
            원본 모집글 상세 보기
          </CustomButton>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 8.5 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, border: '1px solid #EEEEEE', minHeight: '600px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#111827', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ForumIcon color="primary" /> 팀 커뮤니케이션
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                    팀원들과 아이디어를 공유하고 프로젝트 현황을 기록하세요.
                  </Typography>
                </Box>
                <CustomButton 
                  variant="contained" startIcon={<CreateIcon />} onClick={() => setIsWriteOpen(true)}
                  sx={{ borderRadius: 4, px: 4, height: 48, boxShadow: '0 8px 16px rgba(108,99,255,0.2)' }}
                >
                  새 글 작성하기
                </CustomButton>
              </Box>

              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#6B7280', py: 2 }}>구분</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#6B7280' }}>제목</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#6B7280' }}>작성자</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#6B7280' }}>작성일</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#6B7280', textAlign: 'center' }}>조회</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <TableRow 
                          key={post.id} hover onClick={() => handlePostClick(post)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F0F2FF !important' } }}
                        >
                          <TableCell sx={{ py: 2.5 }}>
                            <Chip 
                              label={post.type === 'NOTICE' ? '공지' : post.type === 'QUESTION' ? '질문' : '일반'} 
                              size="small"
                              sx={{ 
                                bgcolor: post.type === 'NOTICE' ? '#FFF1F2' : (post.type === 'QUESTION' ? '#EFF6FF' : '#F3F4F6'),
                                color: post.type === 'NOTICE' ? '#E11D48' : (post.type === 'QUESTION' ? '#2563EB' : '#4B5563'),
                                fontWeight: 900, borderRadius: 1.5
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }}>{post.title}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, bgcolor: '#6C63FF', fontSize: '0.7rem' }}>{post.author.charAt(0)}</Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{post.author}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{post.date}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>{post.views}</Typography></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center', color: '#9CA3AF' }}>등록된 게시글이 없습니다.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination 
                  page={currentPage} 
                  totalPages={pageInfo.totalPages} 
                  onPageChange={handlePageChange} 
                />
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: 3.5 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #EEEEEE' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#D1D5DB', display: 'block', mb: 3, letterSpacing: '0.1em' }}>
                  TEAM MEMBERS ({projectInfo.members.length})
                </Typography>
                <Stack spacing={2.5}>
                  {projectInfo.members.map((member) => (
                    <Box key={member.nickname} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40, bgcolor: member.role === 'OWNER' ? '#6C63FF' : '#F3F4F6', color: member.role === 'OWNER' ? 'white' : '#6B7280', fontWeight: 800 }}>
                          {member.nickname.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>{member.nickname}</Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>{member.position}</Typography>
                        </Box>
                      </Stack>
                      {member.role === 'OWNER' && <Chip label="OWNER" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 900, fontSize: '0.65rem', borderRadius: 1 }} />}
                    </Box>
                  ))}
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #EEEEEE', bgcolor: '#F8F9FF' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} /> 게시판 가이드
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1.8, display: 'block' }}>
                  • 팀원 전용 공간입니다.<br /> • 프로젝트 관련 공지를 확인하세요.<br /> • 건전한 소통 부탁드립니다.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* 게시글 작성 모달 */}
      <Dialog open={isWriteOpen} onClose={() => setIsWriteOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5 } }}>
        <DialogTitle sx={{ fontWeight: 900, pt: 4, px: 4 }}>새 게시글 작성</DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              fullWidth label="제목" value={newPost.title} 
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField 
              fullWidth multiline rows={8} label="내용" value={newPost.content} 
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <CustomButton onClick={() => setIsWriteOpen(false)} sx={{ color: '#9CA3AF' }}>취소</CustomButton>
          <CustomButton onClick={handleCreatePost} variant="contained">등록하기</CustomButton>
        </DialogActions>
      </Dialog>

      {/* 게시글 상세 모달 */}
      <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 5 } }}>
        {selectedPost && (
          <>
            <DialogTitle sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Stack spacing={1.5}>
                  <Chip label={selectedPost.type} size="small" color="primary" sx={{ fontWeight: 900, borderRadius: 1.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>{selectedPost.title}</Typography>
                </Stack>
                <IconButton onClick={() => setIsDetailOpen(false)} sx={{ bgcolor: '#F3F4F6' }}><CloseIcon /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ px: 4, pb: 4 }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#6C63FF' }}>{selectedPost.author.charAt(0)}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{selectedPost.author}</Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{selectedPost.date}</Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VisibilityIcon sx={{ fontSize: 16 }} /> {selectedPost.views}
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ bgcolor: '#F9FAFB', p: 4, borderRadius: 4, mb: 6 }}>
                <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{selectedPost.content}</Typography>
              </Paper>
              <Divider sx={{ my: 6 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>댓글 {comments.length}</Typography>
              <Stack spacing={3} sx={{ mb: 6 }}>
                {comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)}
              </Stack>
              <Box sx={{ bgcolor: '#F3F4F6', p: 3, borderRadius: 4 }}>
                <TextField 
                  fullWidth multiline rows={3} placeholder="댓글을 남겨주세요." variant="standard"
                  InputProps={{ disableUnderline: true }} value={newComment}
                  onChange={(e) => setNewComment(e.target.value)} sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CustomButton variant="contained" onClick={handleCreateComment}>댓글 등록</CustomButton>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BoardPage;