import { http, HttpResponse } from 'msw';

// 1. 공통 임시 저장소 (초기 데이터 45개)
let mockPosts = Array.from({ length: 45 }).map((_, i) => ({
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

// 2. 지원서 임시 저장소
let mockApplies = [
  {
    applyId: 999,
    projectId: 10,
    projectTitle: mockPosts[9].title,
    category: mockPosts[9].category,
    position: "프론트엔드",
    status: "ACCEPTED",
    appliedDate: "2026-03-25",
    ownerNickname: mockPosts[9].ownerNickname
  }
];

// [신규] 유저 데이터 관리 변수 (수정 가능)
let currentUserData = {
  id: 1,
  email: 'test@test.com',
  nickname: '테스트메이트',
  position: 'FE',
  intro: '안녕하세요! 함께 성장하고 싶은 개발자입니다.', 
  techStacks: ['React', 'TypeScript', 'Node.js'],
  phoneNumber: '01012345678',
  profileImg: 'https://mate-s3.com/default.png',
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
          user: currentUserData // 전역 변수 참조
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

  // 3. 모집글 목록 조회 API 모킹 (페이징 로직)
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
        page: { size, number: page, totalElements, totalPages }
      }
    });
  }),

  // 5. 마이페이지 내 정보 조회
  http.get('*/api/user/me', () => {
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

  // [신규] 유저 정보 수정 (PUT)
  http.put('*/api/users/me', async ({ request }) => {
    const updateData = await request.json();
    
    // 실제 전역 변수 업데이트
    currentUserData = {
      ...currentUserData,
      ...updateData
    };

    // 닉네임이 바뀌면 mockPosts의 ownerNickname도 동기화 (선택 사항이지만 일관성을 위해)
    if (updateData.nickname) {
      mockPosts = mockPosts.map(p => 
        p.ownerNickname === currentUserData.nickname ? { ...p, ownerNickname: updateData.nickname } : p
      );
    }

    return HttpResponse.json({
      success: true,
      data: currentUserData,
      message: '프로필 정보가 성공적으로 수정되었습니다.'
    });
  }),

  // 14. 프로젝트 상세 정보 조회
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
        members: [{ nickname: post.ownerNickname, role: "OWNER" }]
      }
    });
  }),

  // 15. 새로운 모집글 등록
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
    return HttpResponse.json({ success: true, data: { projectId: newId } });
  }),

  // 17. 모집글 지원서 제출
  http.post('*/api/posts/:id/applies', async ({ params, request }) => {
    const applyData = await request.json();
    const targetProject = mockPosts.find(p => p.projectId === parseInt(params.id));

    const newApply = {
      applyId: Date.now(),
      projectId: parseInt(params.id),
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
