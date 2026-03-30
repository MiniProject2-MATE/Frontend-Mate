import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePostStore } from '@/store/postStore';

const PostDetailPage = () => {
  const { id } = useParams();
  const { currentPost, setCurrentPost, clearCurrentPost, setLoading, setError } = usePostStore();

  useEffect(() => {
    // 상세 페이지 진입 시 데이터 패칭 로직 (예시 API 호출 구조)
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        // 실제 API 연동 시: const response = await axios.get(`/api/posts/${id}`);
        // 여기서는 store의 setCurrentPost를 사용하는 구조만 반영
        console.log(`Fetching post detail for id: ${id}`);
        // setCurrentPost(response.data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();

    // 이탈 시 상태 초기화 (Cleanup)
    return () => {
      console.log('Clearing current post data');
      clearCurrentPost();
    };
  }, [id, setCurrentPost, clearCurrentPost, setLoading, setError]);

  return (
    <div className="post-detail-container">
      <h1>모집글 상세 페이지 (ID: {id})</h1>
      {/* 상세 내용 렌더링 영역 */}
      {currentPost && (
        <div>
          <h2>{currentPost.title}</h2>
          <p>{currentPost.content}</p>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
