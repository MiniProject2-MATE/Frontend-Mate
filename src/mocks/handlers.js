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

// [추가] 팀 게시판 데이터 로컬스토리지 연동 (버그 수정: i -> pid)
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
    initialBoardPosts.push({
      id: pid * 1000 + 2,
      projectId: pid,
      type: "GENERAL",
      title: "오늘 첫 회의 장소 공지",
      content: "저녁 8시에 줌으로 뵙겠습니다!",
      author: "메이트1",
      date: "2026.04.02",
      views: 5,
    });
  }
  return initialBoardPosts;
};

// [추가] 댓글 데이터 로컬스토리지 연동
const getStoredComments = () => {
  const saved = localStorage.getItem('mock-comments');
  if (saved) return JSON.parse(saved);
  return [
    { id: 10001, boardPostId: 1001, author: "메이트1", content: "반갑습니다! 열심히 할게요.", date: "2026.04.01 14:00" }
  ];
};

// --- 실제 변수 할당 ---
let mockPosts = getStoredPosts();
let currentUserData = getStoredUser();
let mockApplies = getStoredApplies();
let mockBoardPosts = getStoredBoardPosts();
let mockComments = getStoredComments();

// [추가] 변경 사항을 로컬스토리지에 동기화하는 함수
const syncStorage = () => {
  localStorage.setItem('mock-posts', JSON.stringify(mockPosts));
  localStorage.setItem('user-info', JSON.stringify(currentUserData));
  localStorage.setItem('mock-applies', JSON.stringify(mockApplies));
  localStorage.setItem('mock-board-posts', JSON.stringify(mockBoardPosts));
  localStorage.setItem('mock-comments', JSON.stringify(mockComments));
};

export const handlers = [
  // 1. 로그인 API 모킹
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

    return new HttpResponse(
      JSON.stringify({
        success: false,
        error: { code: 'AUTH_001', message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      }),
      { status: 401 }
    );
  }),

  // 2. 닉네임 중복 확인
  http.get('*/api/auth/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');

    if (nickname === currentUserData.nickname) {
      return HttpResponse.json({ success: true, data: { isAvailable: true }, message: '현재 사용 중인 닉네임입니다.' });
    }

    const isTaken = mockPosts.some(p => p.ownerNickname === nickname);
    if (isTaken) {
      return HttpResponse.json({ success: true, data: { isAvailable: false }, message: '이미 사용 중인 닉네임입니다.' });
    }

    return HttpResponse.json({ success: true, data: { isAvailable: true }, message: '사용 가능한 닉네임입니다.' });
  }),

  // 3. 회원가입
  http.post('*/api/auth/signup', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      message: '회원가입이 완료되었습니다.'
    });
  }),

  // 4. 모집글 목록 조회
  http.get('*/api/posts', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const keyword = url.searchParams.get('keyword')?.toLowerCase(); 
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '15');
    
    let filteredPosts = [...mockPosts];

    if (category && category !== '전체' && category !== '') {
      const categoryMap = { '프로젝트': 'PROJECT', '스터디': 'STUDY' };
      const targetCategory = categoryMap[category] || category;
      filteredPosts = filteredPosts.filter(p => p.category === targetCategory);
    }

    if (keyword && keyword.trim() !== '') {
      const searchKey = keyword.trim().toLowerCase();
      filteredPosts = filteredPosts.filter(p => 
        p.title.toLowerCase().includes(searchKey) || 
        p.content.toLowerCase().includes(searchKey) ||
        p.techStacks.some(stack => stack.toLowerCase().includes(searchKey))
      );
    }

    const totalElements = filteredPosts.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;
    const paginatedPosts = filteredPosts.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        content: paginatedPosts,
        page: { size, number: page, totalElements, totalPages }
      }
    });
  }),

  // 5. 토큰 갱신
  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: { accessToken: 'new-mock-access-token', refreshToken: 'new-mock-refresh-token' }
    });
  }),

  // 6. 마이페이지 내 정보 조회
  http.get('*/api/users/me', () => {
    const myPosts = mockPosts.filter(p => p.ownerNickname === currentUserData.nickname);
    const myApplies = mockApplies.filter(a => a.ownerNickname !== currentUserData.nickname);
    const acceptedProjects = mockApplies.filter(a => a.status === 'ACCEPTED');

    return HttpResponse.json({
      success: true,
      data: {
        ...currentUserData,
        postCount: myPosts.length, 
        applyCount: myApplies.length,
        myPosts: myPosts,
        applies: myApplies,
        acceptedProjects: acceptedProjects
      }
    });
  }),

  // 7. 유저 정보 수정
  http.put('*/api/users/me', async ({ request }) => {
    const updateData = await request.json();
    const oldNickname = currentUserData.nickname;
    
    if (updateData.nickname && updateData.nickname !== oldNickname) {
      mockPosts = mockPosts.map(p => 
        p.ownerNickname === oldNickname ? { ...p, ownerNickname: updateData.nickname } : p
      );
    }

    currentUserData = { ...currentUserData, ...updateData };
    syncStorage();

    const myPosts = mockPosts.filter(p => p.ownerNickname === currentUserData.nickname);

    return HttpResponse.json({
      success: true,
      data: {
        ...currentUserData,
        myPosts: myPosts,
        postCount: myPosts.length,
        applies: mockApplies.filter(a => a.ownerNickname !== currentUserData.nickname),
        acceptedProjects: mockApplies.filter(a => a.status === 'ACCEPTED')
      },
      message: '프로필 정보가 성공적으로 수정되었습니다.'
    });
  }),

  // --- 팀 게시판 (Board) API ---

  // 10. 게시판 목록 조회
  http.get('*/api/posts/:projectId/board', ({ request, params }) => {
    const { projectId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');

    const projectBoardPosts = mockBoardPosts.filter(p => p.projectId === parseInt(projectId))
      .sort((a, b) => b.id - a.id);

    const totalElements = projectBoardPosts.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;

    return HttpResponse.json({
      success: true,
      data: {
        content: projectBoardPosts.slice(start, end),
        page: { size, number: page, totalElements, totalPages }
      }
    });
  }),

  // 11. 게시판 상세 조회
  http.get('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const { boardPostId } = params;
    const post = mockBoardPosts.find(p => p.id === parseInt(boardPostId));
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ success: true, data: post });
  }),

  // 12. 게시판 작성
  http.post('*/api/posts/:projectId/board', async ({ params, request }) => {
    const { projectId } = params;
    const data = await request.json();
    const newId = Date.now();
    
    const newBoardPost = {
      id: newId,
      projectId: parseInt(projectId),
      type: data.type || "GENERAL",
      title: data.title,
      content: data.content,
      author: currentUserData.nickname,
      date: new Date().toLocaleDateString(),
      views: 0
    };

    mockBoardPosts.push(newBoardPost);
    syncStorage();

    return HttpResponse.json({ success: true, data: newBoardPost });
  }),

  // 13. 댓글 조회
  http.get('*/api/posts/:projectId/board/:boardPostId/comments', ({ params }) => {
    const { boardPostId } = params;
    const comments = mockComments.filter(c => c.boardPostId === parseInt(boardPostId));
    return HttpResponse.json({ success: true, data: comments });
  }),

  // 14. 댓글 작성
  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ params, request }) => {
    const { boardPostId } = params;
    const { content } = await request.json();
    
    const newComment = {
      id: Date.now(),
      boardPostId: parseInt(boardPostId),
      author: currentUserData.nickname,
      content,
      date: new Date().toLocaleString()
    };

    mockComments.push(newComment);
    syncStorage();

    return HttpResponse.json({ success: true, data: newComment });
  }),

  // --- 모집글 상세 ---
  http.get('*/api/posts/:id', ({ params }) => {
    const { id } = params;
    const post = mockPosts.find(p => p.projectId === parseInt(id));

    if (!post) return new HttpResponse(null, { status: 404 });

    return HttpResponse.json({
      success: true,
      data: {
        ...post,
        alreadyApplied: mockApplies.some(a => a.projectId === parseInt(id)),
        owner: {
          nickname: post.ownerNickname,
          position: post.techStacks[0] === 'React' ? 'FE' : 'BE',
        },
        members: [
          { nickname: post.ownerNickname, position: post.techStacks[0] === 'React' ? 'FE' : 'BE', role: "OWNER" },
          { nickname: "메이트1", position: "BE", role: "MEMBER" }
        ]
      }
    });
  }),

  http.post('*/api/posts/:id/applies', async ({ params, request }) => {
    const { id } = params;
    const applyData = await request.json();
    const targetProject = mockPosts.find(p => p.projectId === parseInt(id));

    const newApply = {
      applyId: Date.now(),
      projectId: parseInt(id),
      projectTitle: targetProject?.title || "알 수 없는 프로젝트",
      category: targetProject?.category || "프로젝트",
      position: applyData.position,
      status: "PENDING",
      appliedDate: new Date().toISOString().split('T')[0],
      ownerNickname: targetProject?.ownerNickname || "알 수 없음"
    };

    mockApplies.push(newApply);
    syncStorage();

    return HttpResponse.json({ success: true, data: newApply });
  }),
];
