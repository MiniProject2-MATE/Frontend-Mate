import { http, HttpResponse } from 'msw';

// --- 로컬스토리지 연동 로직 ---

const getStoredPosts = () => {
  const saved = localStorage.getItem('mock-posts');
  if (saved) return JSON.parse(saved);
  
  return Array.from({ length: 45 }).map((_, i) => ({
    projectId: i + 1,
    title: `[${i % 2 === 0 ? '프로젝트' : '스터디'}] 함께 성장할 메이트를 찾습니다 ${i + 1}`,
    content: i % 3 === 0 
      ? '프론트엔드와 백엔드 개발자를 찾고 있습니다. 열정적인 분들의 지원을 기다립니다!' 
      : '코딩 테스트 대비 알고리즘 스터디원을 모집합니다. 매주 2회 오프라인 모임 예정입니다.',
    category: i % 2 === 0 ? 'PROJECT' : 'STUDY',
    status: i % 3 === 0 ? 'RECRUITING' : (i % 3 === 1 ? 'DEADLINE_SOON' : 'CLOSED'),
    recruitCount: 4,
    currentCount: Math.floor(Math.random() * 4),
    endDate: '2026-12-31',
    ownerNickname: i < 3 ? '테스트메이트' : `User_${i + 1}`,
    techStacks: i % 2 === 0 ? ['React', 'TypeScript', 'Node.js'] : ['Spring Boot', 'Java', 'MySQL'],
    onOffline: '온라인'
  }));
};

const getStoredUser = () => {
  const saved = localStorage.getItem('user-info');
  if (saved) return JSON.parse(saved);
  return {
    id: 1,
    email: 'test@test.com',
    nickname: '테스트메이트',
    position: 'FE',
    intro: '안녕하세요! 함께 성장하고 싶은 개발자입니다.', 
    techStacks: ['React', 'TypeScript', 'Node.js'],
    phoneNumber: '01012345678',
    profileImg: 'https://mate-s3.com/default.png',
  };
};

const getStoredApplies = () => {
  const saved = localStorage.getItem('mock-applies');
  if (saved) return JSON.parse(saved);
  return [
    {
      applyId: 999,
      projectId: 10,
      projectTitle: "함께 성장할 메이트를 찾습니다 10",
      category: "STUDY",
      position: "프론트엔드",
      status: "ACCEPTED",
      appliedDate: "2026-03-25",
      ownerNickname: "User_10"
    }
  ];
};

const getStoredBoardPosts = () => {
  const saved = localStorage.getItem('mock-board-posts');
  if (saved) return JSON.parse(saved);
  
  const initialBoardPosts = [];
  for (let pid = 1; pid <= 50; pid++) {
    initialBoardPosts.push({
      id: pid * 1000 + 1,
      projectId: pid,
      type: "NOTICE",
      title: `📢 프로젝트 #${pid} 시작 안내`,
      content: "팀원 여러분 환영합니다! 함께 멋진 프로젝트를 만들어봐요.",
      author: "팀장",
      date: "2026.04.01",
      views: 10,
    });
  }
  return initialBoardPosts;
};

const getStoredComments = () => {
  const saved = localStorage.getItem('mock-comments');
  if (saved) return JSON.parse(saved);
  return [
    { id: 10001, boardPostId: 1001, author: "메이트1", content: "확인했습니다! 규칙 잘 지킬게요.", date: "2026.04.01 14:00" }
  ];
};

// --- 실제 데이터 할당 ---
let mockPosts = getStoredPosts();
let currentUserData = getStoredUser();
let mockApplies = getStoredApplies();
let mockBoardPosts = getStoredBoardPosts();
let mockComments = getStoredComments();

const syncStorage = () => {
  localStorage.setItem('mock-posts', JSON.stringify(mockPosts));
  localStorage.setItem('user-info', JSON.stringify(currentUserData));
  localStorage.setItem('mock-applies', JSON.stringify(mockApplies));
  localStorage.setItem('mock-board-posts', JSON.stringify(mockBoardPosts));
  localStorage.setItem('mock-comments', JSON.stringify(mockComments));
};

export const handlers = [
  // 1. 로그인
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (email === 'test@test.com' && password === '1234') {
      return HttpResponse.json({
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: currentUserData 
        }
      });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_001', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }), { status: 401 });
  }),

  // 2. 닉네임 중복 확인
  http.get('*/api/auth/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');
    if (nickname === currentUserData.nickname) return HttpResponse.json({ success: true, data: { isAvailable: true }, message: '현재 사용 중인 닉네임입니다.' });
    if (mockPosts.some(p => p.ownerNickname === nickname)) return HttpResponse.json({ success: true, data: { isAvailable: false }, message: '이미 사용 중인 닉네임입니다.' });
    return HttpResponse.json({ success: true, data: { isAvailable: true }, message: '사용 가능한 닉네임입니다.' });
  }),

  // 3. 회원가입
  http.post('*/api/auth/signup', () => HttpResponse.json({ success: true, data: null, message: '회원가입이 완료되었습니다.' })),

  // 4. 모집글 목록 조회 (메인 페이지용 - /projects 경로 복구)
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const keyword = url.searchParams.get('keyword')?.toLowerCase(); 
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '15');
    
    let filteredPosts = [...mockPosts];
    if (category && category !== '전체' && category !== '') {
      const categoryMap = { '프로젝트': 'PROJECT', '스터디': 'STUDY' };
      filteredPosts = filteredPosts.filter(p => p.category === (categoryMap[category] || category));
    }
    if (keyword) {
      filteredPosts = filteredPosts.filter(p => p.title.toLowerCase().includes(keyword) || p.content.toLowerCase().includes(keyword));
    }
    const totalElements = filteredPosts.length;
    return HttpResponse.json({
      success: true,
      data: {
        content: filteredPosts.slice(page * size, (page + 1) * size),
        page: { size, number: page, totalElements, totalPages: Math.ceil(totalElements / size) }
      }
    });
  }),

  // 5. 토큰 갱신
  http.post('*/api/auth/refresh', () => HttpResponse.json({ success: true, data: { accessToken: 'new-token', refreshToken: 'new-refresh' } })),

  // 6. 마이페이지 정보 조회
  http.get('*/api/users/me', () => {
    const myPosts = mockPosts.filter(p => p.ownerNickname === currentUserData.nickname);
    const myApplies = mockApplies.filter(a => a.ownerNickname !== currentUserData.nickname);
    return HttpResponse.json({
      success: true,
      data: { 
        ...currentUserData, 
        postCount: myPosts.length, 
        applyCount: myApplies.length, 
        myPosts, 
        applies: myApplies, 
        acceptedProjects: mockApplies.filter(a => a.status === 'ACCEPTED') 
      }
    });
  }),

  // 7. 유저 정보 수정 (데이터 소실 방지를 위해 전체 활동 내역 포함 반환)
  http.put('*/api/users/me', async ({ request }) => {
    const updateData = await request.json();
    const oldNickname = currentUserData.nickname;

    // 닉네임 변경 시 기존에 썼던 글들의 작성자 명도 함께 변경 (필터링 유지)
    if (updateData.nickname && updateData.nickname !== oldNickname) {
      mockPosts = mockPosts.map(p => 
        p.ownerNickname === oldNickname ? { ...p, ownerNickname: updateData.nickname } : p
      );
    }

    // 기본 정보 업데이트
    currentUserData = { ...currentUserData, ...updateData };
    syncStorage();

    // 마이페이지 UI 유지를 위해 활동 내역 다시 계산
    const myPosts = mockPosts.filter(p => p.ownerNickname === currentUserData.nickname);
    const myApplies = mockApplies.filter(a => a.ownerNickname !== currentUserData.nickname);
    const acceptedProjects = mockApplies.filter(a => a.status === 'ACCEPTED');

    return HttpResponse.json({ 
      success: true, 
      data: {
        ...currentUserData,
        postCount: myPosts.length,
        applyCount: myApplies.length,
        myPosts,
        applies: myApplies,
        acceptedProjects
      },
      message: '프로필이 성공적으로 수정되었습니다.'
    });
  }),

  // 8. 아이디 찾기
  http.post('*/api/auth/find-email', async ({ request }) => {
    const { phoneNumber } = await request.json();
    if (phoneNumber === '01012345678') return HttpResponse.json({ success: true, data: { email: 'te**@test.com' } });
    return new HttpResponse(JSON.stringify({ success: false, error: { message: '정보를 찾을 수 없습니다.' } }), { status: 404 });
  }),

  // 9. 비밀번호 찾기
  http.post('*/api/auth/find-password', async ({ request }) => {
    const { email, phoneNumber } = await request.json();
    if (email === 'test@test.com' && phoneNumber === '01012345678') return HttpResponse.json({ success: true, message: '임시 비밀번호가 발급되었습니다.' });
    return new HttpResponse(JSON.stringify({ success: false, error: { message: '정보가 일치하지 않습니다.' } }), { status: 400 });
  }),

  // 10. 팀 게시판 목록 조회
  http.get('*/api/posts/:projectId/board', ({ params, request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const projectBoardPosts = mockBoardPosts.filter(p => p.projectId === parseInt(params.projectId));
    return HttpResponse.json({ 
      success: true, 
      data: { 
        content: projectBoardPosts.slice(page * size, (page + 1) * size), 
        page: { number: page, size, totalElements: projectBoardPosts.length, totalPages: Math.ceil(projectBoardPosts.length / size) } 
      } 
    });
  }),

  // 11. 팀 게시글 상세 조회
  http.get('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const post = mockBoardPosts.find(p => p.id === parseInt(params.boardPostId));
    return post ? HttpResponse.json({ success: true, data: post }) : new HttpResponse(null, { status: 404 });
  }),

  // 12. 팀 게시글 작성
  http.post('*/api/posts/:projectId/board', async ({ params, request }) => {
    const postData = await request.json();
    const newBoardPost = { 
      id: Date.now(), 
      projectId: parseInt(params.projectId), 
      ...postData, 
      author: currentUserData.nickname, 
      date: new Date().toLocaleDateString(), 
      views: 0 
    };
    mockBoardPosts.push(newBoardPost);
    syncStorage();
    return HttpResponse.json({ success: true, data: newBoardPost });
  }),

  // 13. 댓글 목록 조회
  http.get('*/api/posts/:projectId/board/:boardPostId/comments', ({ params }) => {
    const comments = mockComments.filter(c => c.boardPostId === parseInt(params.boardPostId));
    return HttpResponse.json({ success: true, data: comments });
  }),

  // 14. 댓글 작성
  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ params, request }) => {
    const { content } = await request.json();
    const newComment = { 
      id: Date.now(), 
      boardPostId: parseInt(params.boardPostId), 
      author: currentUserData.nickname, 
      content, 
      date: new Date().toLocaleString() 
    };
    mockComments.push(newComment);
    syncStorage();
    return HttpResponse.json({ success: true, data: newComment });
  }),

  // 15. 모집글 상세 정보 (메인 카드 클릭 시)
  http.get('*/api/projects/:id', ({ params }) => {
    const post = mockPosts.find(p => p.projectId === parseInt(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ 
      success: true, 
      data: { 
        ...post, 
        owner: { nickname: post.ownerNickname, position: "FE" }, 
        members: [
          { nickname: post.ownerNickname, position: "FE", role: "OWNER" },
          { nickname: "메이트1", position: "BE", role: "MEMBER" }
        ] 
      } 
    });
  }),

  // 16. 새로운 모집글 등록
  http.post('*/api/projects', async ({ request }) => {
    const newPostData = await request.json();
    const newId = Date.now();
    const newPost = { projectId: newId, ...newPostData, status: 'RECRUITING', currentCount: 0, ownerNickname: currentUserData.nickname };
    mockPosts.push(newPost);
    syncStorage();
    return HttpResponse.json({ success: true, data: { projectId: newId } });
  }),

  // 17. 모집글 지원하기
  http.post('*/api/posts/:id/applies', async ({ params, request }) => {
    const applyData = await request.json();
    const newApply = { applyId: Date.now(), projectId: parseInt(params.id), ...applyData, status: "PENDING", appliedDate: "2026-04-02", ownerNickname: "Owner" };
    mockApplies.push(newApply);
    syncStorage();
    return HttpResponse.json({ success: true, data: newApply });
  }),

  // 18. 모집글 삭제
  http.delete('*/api/projects/:id', ({ params }) => {
    mockPosts = mockPosts.filter(p => p.projectId !== parseInt(params.id));
    syncStorage();
    return HttpResponse.json({ success: true });
  }),
];
