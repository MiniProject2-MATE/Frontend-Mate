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
    userId: 1, // id -> userId
    email: 'test@test.com',
    nickname: '테스트메이트',
    position: 'FE',
    intro: '안녕하세요! 함께 성장하고 싶은 개발자입니다.', 
    techStacks: ['React', 'TypeScript', 'Node.js'],
    phoneNumber: '01012345678',
    profileImageUrl: 'https://mate-s3.com/default-profile.png',
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
    },
    {
      applyId: 1000,
      projectId: 5,
      projectTitle: "함께 성장할 메이트를 찾습니다 5",
      category: "PROJECT",
      position: "백엔드",
      status: "PENDING",
      appliedDate: "2026-04-01",
      ownerNickname: "User_5"
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

  // 2-2. 전화번호 중복 확인
  http.get('*/api/users/check-phone', ({ request }) => {
    const url = new URL(request.url);
    const phoneNumber = url.searchParams.get('phoneNumber');
    if (phoneNumber === currentUserData.phoneNumber) return HttpResponse.json({ success: true, data: { isAvailable: true } });
    if (phoneNumber === '01011112222') return HttpResponse.json({ success: true, data: { isAvailable: false }, message: '이미 등록된 전화번호입니다.' });
    return HttpResponse.json({ success: true, data: { isAvailable: true } });
  }),

  // 3. 회원가입
  http.post('*/api/auth/signup', () => HttpResponse.json({ success: true, data: null, message: '회원가입이 완료되었습니다.' })),

  // 4. 모집글 목록 조회
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
      filteredPosts = filteredPosts.filter(p => 
        p.title.toLowerCase().includes(keyword) || 
        p.content.toLowerCase().includes(keyword) ||
        (p.techStacks && p.techStacks.some(stack => stack.toLowerCase().includes(keyword)))
      );
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

  // 5-2. 로그아웃
  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({ 
      success: true, 
      message: '성공적으로 로그아웃되었습니다.' 
    });
  }),

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

  // 7. 유저 정보 수정
  http.put('*/api/users/me', async ({ request }) => {
    const updateData = await request.json();
    const oldNickname = currentUserData.nickname;
    
    // 닉네임 변경 시 관련 데이터 동기화
    if (updateData.nickname && updateData.nickname !== oldNickname) {
      mockPosts = mockPosts.map(p => p.ownerNickname === oldNickname ? { ...p, ownerNickname: updateData.nickname } : p);
    }
    
    currentUserData = { ...currentUserData, ...updateData };
    syncStorage();

    // [핵심 수정] 수정 후 응답 시에도 활동 내역 정보를 포함하여 반환 (UI 데이터 유지 목적)
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
      }, 
      message: '프로필이 수정되었습니다.' 
    });
  }),

  // [수정] 4.5.5 프로필 이미지 수정 (PATCH)
http.patch('*/api/users/profile-image', async ({ request }) => {
  const formData = await request.formData();
  const profileImageFile = formData.get('profileImage'); // 설계서 필드명: profileImage

  if (!profileImageFile) {
    return new HttpResponse(JSON.stringify({ success: false, message: "파일이 첨부되지 않았습니다." }), { status: 400 });
  }

  // [중요] 새로고침 유지 로직: 
  // 실제 서버라면 S3 URL을 주겠지만, 여기선 클라이언트(MyPage)가 보낸 
  // Base64 데이터를 이미 currentUserData가 들고 있다고 가정하거나, 
  // 단순히 성공 응답만 보내고 데이터 동기화는 MyPage의 state 업데이트에 맡깁니다.
  
  syncStorage(); 
  
  return HttpResponse.json({
    success: true,
    data: {
      profileImageUrl: currentUserData.profileImageUrl // 설계서 필드명 일치
    },
    message: "프로필 이미지가 성공적으로 변경되었습니다."
  });
}),

// [수정] 4.5.6 프로필 이미지 삭제 (DELETE)
http.delete('*/api/users/profile-image', () => {
  const defaultUrl = 'https://mate-s3.com/default-profile.png'; // 설계서의 기본 이미지명
  
  currentUserData = { ...currentUserData, profileImageUrl: defaultUrl };
  syncStorage();

  return HttpResponse.json({
    success: true,
    data: {
      profileImageUrl: defaultUrl
    },
    message: "기본 프로필 이미지로 변경되었습니다."
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

  // 10~14. 팀 게시판 관련 핸들러
  http.get('*/api/posts/:projectId/board', ({ params, request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const projectBoardPosts = mockBoardPosts.filter(p => p.projectId === parseInt(params.projectId));
    return HttpResponse.json({ success: true, data: { content: projectBoardPosts.slice(page * size, (page + 1) * size), page: { number: page, size, totalElements: projectBoardPosts.length, totalPages: Math.ceil(projectBoardPosts.length / size) } } });
  }),

  http.get('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const post = mockBoardPosts.find(p => p.id === parseInt(params.boardPostId));
    return post ? HttpResponse.json({ success: true, data: post }) : new HttpResponse(null, { status: 404 });
  }),

  http.post('*/api/posts/:projectId/board', async ({ params, request }) => {
    const postData = await request.json();
    const newBoardPost = { id: Date.now(), projectId: parseInt(params.projectId), ...postData, author: currentUserData.nickname, date: new Date().toLocaleDateString(), views: 0 };
    mockBoardPosts.push(newBoardPost);
    syncStorage();
    return HttpResponse.json({ success: true, data: newBoardPost });
  }),

  http.get('*/api/posts/:projectId/board/:boardPostId/comments', ({ params }) => {
    const comments = mockComments.filter(c => c.boardPostId === parseInt(params.boardPostId));
    return HttpResponse.json({ success: true, data: comments });
  }),

  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ params, request }) => {
    const { content } = await request.json();
    const newComment = { id: Date.now(), boardPostId: parseInt(params.boardPostId), author: currentUserData.nickname, content, date: new Date().toLocaleString() };
    mockComments.push(newComment);
    syncStorage();
    return HttpResponse.json({ success: true, data: newComment });
  }),

  // 15. 모집글 상세 정보
  http.get('*/api/projects/:id', ({ params }) => {
    const post = mockPosts.find(p => p.projectId === parseInt(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ 
      success: true, 
      data: { ...post, owner: { nickname: post.ownerNickname, position: "FE" }, members: [{ nickname: post.ownerNickname, position: "FE", role: "OWNER" }] } 
    });
  }),

  // 16. 새로운 모집글 등록
  http.post('*/api/posts', async ({ request }) => {
    const newPostData = await request.json();
    const newId = Date.now();
    const newPost = { projectId: newId, ...newPostData, status: 'RECRUITING', currentCount: 0, ownerNickname: currentUserData.nickname };
    mockPosts.push(newPost);
    syncStorage();
    return HttpResponse.json({ success: true, data: { projectId: newId } });
  }),

  // 17. 모집글 지원하기 (경로: /api/applications)
  http.post('*/api/applications', async ({ request }) => {
    try {
      const applyData = await request.json(); 
      const postId = applyData.postId; 
      
      // 해당 프로젝트 찾기
      const targetProject = mockPosts.find(p => String(p.projectId) === String(postId));

      const newApply = { 
        applyId: Date.now(), 
        projectId: parseInt(postId), 
        projectTitle: targetProject?.title || "지원 프로젝트",
        ...applyData, 
        status: "PENDING", 
        appliedDate: new Date().toISOString().split('T')[0], 
        ownerNickname: targetProject?.ownerNickname || "Owner" 
      };
      
      mockApplies.push(newApply);
      syncStorage();
      
      return HttpResponse.json({ 
        success: true, 
        data: newApply,
        message: '지원이 완료되었습니다.'
      });
    } catch {
      return new HttpResponse(JSON.stringify({ success: false, message: '지원 처리 중 오류가 발생했습니다.' }), { status: 500 });
    }
  }),

  // 19. 팀 게시글 수정/삭제 핸들러
  http.put('*/api/posts/:projectId/board/:boardPostId', async ({ params, request }) => {
    const { boardPostId } = params;
    const updateData = await request.json();
    const index = mockBoardPosts.findIndex(p => p.id === parseInt(boardPostId));
    if (index !== -1) {
      mockBoardPosts[index] = { ...mockBoardPosts[index], ...updateData };
      syncStorage();
      return HttpResponse.json({ success: true, data: mockBoardPosts[index] });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const { boardPostId } = params;
    mockBoardPosts = mockBoardPosts.filter(p => p.id !== parseInt(boardPostId));
    syncStorage();
    return HttpResponse.json({ success: true });
  }),

  // 20. 댓글 수정/삭제 핸들러 (경로 변경)
  http.patch('*/api/comments/:commentId', async ({ params, request }) => {
    const { commentId } = params;
    const { content } = await request.json();
    const index = mockComments.findIndex(c => c.id === parseInt(commentId));
    if (index !== -1) {
      mockComments[index] = { ...mockComments[index], content, date: new Date().toLocaleString() + " (수정됨)" };
      syncStorage();
      return HttpResponse.json({ success: true, data: mockComments[index] });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('*/api/comments/:commentId', ({ params }) => {
    const { commentId } = params;
    mockComments = mockComments.filter(c => c.id !== parseInt(commentId));
    syncStorage();
    return HttpResponse.json({ success: true });
  }),

  // 18. 모집글 삭제 (경로 변경: /posts -> /projects)
  http.delete('*/api/projects/:id', ({ params }) => {
    const { id } = params;
    // [수정] 일치하지 않는 것들만 남겨야 함 (삭제 로직)
    mockPosts = mockPosts.filter(p => String(p.projectId) !== String(id));
    syncStorage();
    return HttpResponse.json({ success: true });
  }),

  // 19. 모집글 수정 핸들러 (경로 변경: /posts -> /projects)
  http.put('*/api/projects/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    // [보정] findIndex 시에도 타입 안전하게 비교
    const postIndex = mockPosts.findIndex(p => String(p.projectId) === String(id));
    if (postIndex !== -1) {
      mockPosts[postIndex] = {
        ...mockPosts[postIndex],
        ...updatedData,
        projectId: parseInt(id)
      };
      syncStorage();
      return HttpResponse.json({
        success: true,
        data: mockPosts[postIndex],
        message: '성공적으로 수정되었습니다.'
      });
    }
    return new HttpResponse(JSON.stringify({ success: false, message: '게시글을 찾을 수 없습니다.' }), { status: 404 });
  }),
    ];