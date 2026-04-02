import { http, HttpResponse } from 'msw';

// [수정] 새로고침 시에도 데이터가 유지되도록 로컬스토리지 확인 로직 추가
const getStoredPosts = () => {
  const saved = localStorage.getItem('mock-posts');
  if (saved) return JSON.parse(saved);
  
  // 초기 데이터 45개 생성 (사용자 제공 로직 그대로 유지)
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

// 실제 변수 할당
let mockPosts = getStoredPosts();
let currentUserData = getStoredUser();
let mockApplies = getStoredApplies();

// [추가] 변경 사항을 로컬스토리지에 동기화하는 함수
const syncStorage = () => {
  localStorage.setItem('mock-posts', JSON.stringify(mockPosts));
  localStorage.setItem('user-info', JSON.stringify(currentUserData));
  localStorage.setItem('mock-applies', JSON.stringify(mockApplies));
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
        error: {
          code: 'AUTH_001',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        }
      }),
      { status: 401 }
    );
  }),

  // [추가] 2. 닉네임 중복 확인 API
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

  // 3. 회원가입 API 모킹
  http.post('*/api/auth/signup', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      message: '회원가입이 완료되었습니다.'
    });
  }),

  // 4. 모집글 목록 조회 API 모킹 (페이징 + [추가] 키워드 검색 로직)
  http.get('*/api/projects', ({ request }) => {
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
        page: {
          size: size,
          number: page,
          totalElements: totalElements,
          totalPages: totalPages
        }
      }
    });
  }),

  // 5. 토큰 갱신 API 모킹
  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token'
      }
    });
  }),

  // 6. 마이페이지 내 정보 조회 (활동 내역 유지 로직 적용)
  http.get('*/api/users/me', () => {
    // 현재 닉네임 기준으로 글 필터링
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

  // [수정] 7. 유저 정보 수정 API (닉네임 동기화 및 저장 로직 포함)
  http.put('*/api/users/me', async ({ request }) => {
    const updateData = await request.json();
    const oldNickname = currentUserData.nickname;
    
    // 닉네임 변경 시 게시글 작성자 명도 업데이트 (필터링 유지 위함)
    if (updateData.nickname && updateData.nickname !== oldNickname) {
      mockPosts = mockPosts.map(p => 
        p.ownerNickname === oldNickname ? { ...p, ownerNickname: updateData.nickname } : p
      );
    }

    // 실제 데이터 반영
    currentUserData = {
      ...currentUserData,
      ...updateData
    };

    // 로컬스토리지 저장
    syncStorage();

    // 수정 후 전체 정보를 목록과 함께 반환 (프론트 데이터 소실 방지)
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

  // 8. 아이디 찾기 모킹
  http.post('*/api/auth/find-email', async ({ request }) => {
    const { phoneNumber } = await request.json();
    if (phoneNumber === '01012345678') {
      return HttpResponse.json({ success: true, data: { email: 'ji****@gmail.com' } });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_002', message: '정보를 찾을 수 없습니다.' } }), { status: 404 });
  }),

  // 9. 비밀번호 찾기 모킹
  http.post('*/api/auth/find-password', async ({ request }) => {
    const { email, phoneNumber } = await request.json();
    if (email === 'test@test.com' && phoneNumber === '01012345678') {
      return HttpResponse.json({ success: true, message: '임시 비밀번호가 발급되었습니다.', data: { temporaryPassword: 'mate7788!@#$' } });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_003', message: '정보가 일치하지 않습니다.' } }), { status: 400 });
  }),

  // 10. 게시판 목록 조회
  http.get('*/api/posts/:projectId/board', ({ request, params }) => {
    const { projectId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');

    const allBoardPosts = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      type: i === 0 ? "NOTICE" : (i % 5 === 0 ? "QUESTION" : "GENERAL"),
      title: i === 0 ? `[공지] 프로젝트(${projectId}) 시작 안내` : `게시글 제목 #${20 - i}`,
      author: i % 2 === 0 ? "팀장" : "메이트1",
      date: "2026.04.01",
      views: Math.floor(Math.random() * 100),
    }));

    return HttpResponse.json({
      success: true,
      data: {
        content: allBoardPosts.slice(page * size, (page + 1) * size),
        page: { size, number: page, totalElements: 20, totalPages: 2 }
      }
    });
  }),

  // 11. 게시판 상세 조회
  http.get('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const { boardPostId } = params;
    return HttpResponse.json({
      success: true,
      data: {
        id: parseInt(boardPostId),
        title: boardPostId === '1' ? "[공지] 정기 회의 안내" : "API 명세서 공유",
        content: "안녕하세요. 정기 회의는 토요일 저녁 9시입니다.",
        author: "팀장",
        date: "2026.03.31",
        views: 125,
        type: boardPostId === '1' ? "NOTICE" : "GENERAL"
      }
    });
  }),

  // 12. 게시판 작성
  http.post('*/api/posts/:projectId/board', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, data: { id: 99, ...data, author: currentUserData.nickname, date: "2026.04.01", views: 0 } });
  }),

  // 13. 댓글 조회
  http.get('*/api/posts/:projectId/board/:boardPostId/comments', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 101, author: "백엔드1", content: "확인했습니다!", date: "2026.03.31 15:30" },
      ]
    });
  }),

  // 14. 댓글 작성
  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ request }) => {
    const { content } = await request.json();
    return HttpResponse.json({ success: true, data: { id: Date.now(), author: currentUserData.nickname, content, date: "2026.04.01 18:00" } });
  }),

  // 15. 프로젝트 상세 정보 조회
  http.get('*/api/projects/:id', ({ params }) => {
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
        ]
      }
    });
  }),

  // 16. 새로운 모집글 등록 API
  http.post('*/api/projects', async ({ request }) => {
    const newPostData = await request.json();
    const newId = mockPosts.length > 0 ? Math.max(...mockPosts.map(p => p.projectId)) + 1 : 100;

    const newPost = {
      projectId: newId,
      ...newPostData,
      status: 'RECRUITING',
      currentCount: 0,
      ownerNickname: currentUserData.nickname, 
    };

    mockPosts.push(newPost);
    syncStorage(); // 저장

    return HttpResponse.json({
      success: true,
      data: { projectId: newId }
    });
  }),

  // 17. 모집글 수정/삭제 API
  http.put('*/api/projects/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json();
    const index = mockPosts.findIndex(p => p.projectId === parseInt(id));
    if (index !== -1) {
      mockPosts[index] = { ...mockPosts[index], ...updateData };
    }
    syncStorage(); // 저장
    return HttpResponse.json({ success: true });
  }),

  http.delete('*/api/projects/:id', ({ params }) => {
    const { id } = params;
    mockPosts = mockPosts.filter(p => p.projectId !== parseInt(id));
    syncStorage(); // 저장
    return HttpResponse.json({ success: true });
  }),

  // 18. 모집글 지원서 제출
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
    syncStorage(); // 저장

    return HttpResponse.json({ success: true, data: newApply });
  }),
];