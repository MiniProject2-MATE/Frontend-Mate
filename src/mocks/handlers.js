import { http, HttpResponse } from 'msw';

// 1. 공통 임시 저장소 (모집글 45개)
const mockPosts = Array.from({ length: 45 }).map((_, i) => ({
  projectId: i + 1,
  title: `[${i % 2 === 0 ? '프로젝트' : '스터디'}] 함께 성장할 메이트를 찾습니다 ${i + 1}`,
  content: i % 3 === 0 
    ? '프론트엔드와 백엔드 개발자를 찾고 있습니다. 열정적인 분들의 지원을 기다립니다!' 
    : '코딩 테스트 대비 알고리즘 스터디원을 모집합니다. 매주 2회 오프라인 모임 예정입니다.',
  category: i % 2 === 0 ? '프로젝트' : '스터디',
  status: i % 3 === 0 ? 'RECRUITING' : (i % 3 === 1 ? 'DEADLINE_SOON' : 'CLOSED'),
  recruitCount: 4,
  currentCount: Math.floor(Math.random() * 4),
  endDate: '2026-12-31',
  ownerNickname: i < 3 ? '테스트메이트' : `User_${i + 1}`, // 처음 3개는 로그인 유저 소유로 설정
  techStacks: i % 2 === 0 ? ['React', 'TypeScript', 'Node.js'] : ['Spring Boot', 'Java', 'MySQL'],
}));

// 2. 지원서 임시 저장소
let mockApplies = [
  {
    applyId: 999,
    projectId: 10,
    projectTitle: mockPosts[9].title, // mockPosts 데이터와 동기화
    category: mockPosts[9].category,
    position: "프론트엔드",
    status: "ACCEPTED",
    appliedDate: "2026-03-25",
    ownerNickname: mockPosts[9].ownerNickname
  }
];

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
          user: {
            id: 1,
            email: email,
            nickname: '테스트메이트',
            role: 'USER',
            position: 'FE',
          }
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

  // 2. 회원가입 API 모킹
  http.post('*/api/auth/signup', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      message: '회원가입이 완료되었습니다.'
    });
  }),

  // 3. 모집글 목록 조회 API 모킹 (페이징 로직)
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '15');
    
    let filteredPosts = [...mockPosts];
    if (category && category !== '전체') {
      filteredPosts = filteredPosts.filter(p => p.category === category);
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

  // 4. 토큰 갱신 API 모킹
  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token'
      }
    });
  }),

  // 5. 마이페이지 내 정보 조회 (탭 분리 로직 적용)
  http.get('*/api/user/me', () => {
    // 내가 작성한 글 (ownerNickname이 나인 것)
    const myPosts = mockPosts.filter(p => p.ownerNickname === '테스트메이트');
    
    // 내가 신청한 글 (지원 목록 중, 내가 작성자가 아닌 것만 추출하여 섞임 방지)
    const myApplies = mockApplies.filter(a => a.ownerNickname !== '테스트메이트');
    
    // 내 팀 (상태가 ACCEPTED인 것)
    const acceptedProjects = mockApplies.filter(a => a.status === 'ACCEPTED');

    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        email: 'test@test.com',
        nickname: '테스트메이트',
        position: '프론트엔드',
        intro: '안녕하세요! 함께 성장하고 싶은 개발자입니다.', 
        techStacks: ['React', 'TypeScript', 'Node.js'],
        postCount: myPosts.length, 
        applyCount: myApplies.length,
        myPosts: myPosts,
        applies: myApplies,
        acceptedProjects: acceptedProjects
      }
    });
  }),

  // 6. 아이디 찾기 모킹
  http.post('*/api/auth/find-email', async ({ request }) => {
    const { phoneNumber } = await request.json();
    if (phoneNumber === '01012345678') {
      return HttpResponse.json({ success: true, data: { email: 'ji****@gmail.com' } });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_002', message: '정보를 찾을 수 없습니다.' } }), { status: 404 });
  }),

  // 8. 비밀번호 찾기 모킹
  http.post('*/api/auth/find-password', async ({ request }) => {
    const { email, phoneNumber } = await request.json();
    if (email === 'test@test.com' && phoneNumber === '01012345678') {
      return HttpResponse.json({ success: true, message: '임시 비밀번호가 발급되었습니다.', data: { temporaryPassword: 'mate7788!@#$' } });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_003', message: '정보가 일치하지 않습니다.' } }), { status: 400 });
  }),

  // 9. 게시판 목록 조회
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

  // 10. 게시판 상세 조회
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

  // 11. 게시판 작성
  http.post('*/api/posts/:projectId/board', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, data: { id: 99, ...data, author: "테스트메이트", date: "2026.04.01", views: 0 } });
  }),

  // 12. 댓글 조회
  http.get('*/api/posts/:projectId/board/:boardPostId/comments', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 101, author: "백엔드1", content: "확인했습니다!", date: "2026.03.31 15:30" },
      ]
    });
  }),

  // 13. 댓글 작성
  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ request }) => {
    const { content } = await request.json();
    return HttpResponse.json({ success: true, data: { id: Date.now(), author: "테스트메이트", content, date: "2026.04.01 18:00" } });
  }),

  // 14. 프로젝트 상세 정보 (상세페이지/지원페이지용)
  http.get('*/api/posts/:id', ({ params }) => {
    const { id } = params;
    const post = mockPosts.find(p => p.projectId === parseInt(id));

    if (!post) return new HttpResponse(null, { status: 404 });

    return HttpResponse.json({
      success: true,
      data: {
        ...post,
        alreadyApplied: mockApplies.some(a => a.projectId === parseInt(id)),
        onOffline: "온라인",
        viewCount: 125,
        owner: {
          nickname: post.ownerNickname,
          position: post.techStacks[0] === 'React' ? 'FE' : 'BE',
          job: post.techStacks[0] === 'React' ? '프론트엔드 개발자' : '백엔드 개발자',
        },
        members: [
          { nickname: post.ownerNickname, position: post.techStacks[0] === 'React' ? 'FE' : 'BE', role: "OWNER" },
        ]
      }
    });
  }),

  // 15. 모집글 지원서 제출
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

    return HttpResponse.json({ success: true, data: newApply });
  }),
];