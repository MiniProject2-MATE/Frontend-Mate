import { http, HttpResponse } from 'msw';

// --- Data Generation Utilities ---
const POSITIONS = ['프론트엔드', '백엔드', '디자이너', '기획자'];
const TECH_STACKS = {
  '프론트엔드': ['React', 'Vue', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Zustand'],
  '백엔드': ['Spring Boot', 'Node.js', 'Go', 'Python', 'Java', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker'],
  '디자이너': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
  '기획자': ['Jira', 'Confluence', 'Notion', 'Slack']
};

const ADJECTIVES = ['열정적인', '꼼꼼한', '창의적인', '도전적인', '성실한', '유쾌한', '차분한', '예리한', '친절한', '냉철한'];
const NOUNS = ['개발자', '메이트', '코더', '프로그래머', '엔지니어', '디자이너', '플래너', '마스터', '지니어스', '가디언'];

const generateUsers = () => {
  const users = [];
  for (let i = 1; i <= 30; i++) {
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const noun = NOUNS[i % NOUNS.length];
    const position = POSITIONS[i % POSITIONS.length];
    const stacks = TECH_STACKS[position].slice(0, 3);
    
    users.push({
      userId: i,
      email: i === 1 ? 'test@test.com' : `user${i}@mate.com`,
      password: '1234',
      nickname: i === 1 ? '테스트메이트' : `${adj}${noun}${i}`,
      position: position === '프론트엔드' ? 'FE' : (position === '백엔드' ? 'BE' : (position === '디자이너' ? 'DE' : 'PM')),
      intro: `안녕하세요! ${adj} ${position} ${noun} ${i === 1 ? '테스트메이트' : i}입니다. 함께 성장하고 싶습니다!`,
      techStacks: stacks,
      phoneNumber: `010${String(i).padStart(8, '0')}`,
      profileImageUrl: `https://i.pravatar.cc/150?u=user${i}`,
    });
  }
  return users;
};

const PROJECT_TITLES = [
  '실시간 채팅 서비스 플랫폼 개발', '반려동물 산책 메이트 매칭 앱', 'MZ세대를 위한 가계부 서비스',
  '전통시장 활성화 O2O 플랫폼', '익명 고민 상담 커뮤니티', '코드 리뷰 스터디 (상급)',
  'React + NestJS 풀스택 프로젝트', '디자인 시스템 구축 스터디', 'AI 기반 식단 추천 서비스',
  '취업 준비 포트폴리오 완성반'
];

const generatePosts = (users) => {
  const posts = [];
  for (let i = 1; i <= 60; i++) {
    const owner = users[(i - 1) % users.length];
    const category = i % 2 === 0 ? 'PROJECT' : 'STUDY';
    const status = i % 10 === 0 ? 'CLOSED' : (i % 5 === 0 ? 'DEADLINE_SOON' : 'RECRUITING');
    const title = `[${category === 'PROJECT' ? '프로젝트' : '스터디'}] ${PROJECT_TITLES[i % PROJECT_TITLES.length]} #${i}`;
    
    posts.push({
      projectId: i,
      title,
      content: `${title}에 함께하실 분들을 모집합니다. 자세한 내용은 오픈채팅이나 댓글로 문의주세요!`,
      category,
      status,
      recruitCount: 2 + (i % 4),
      currentCount: 0, // Will be updated by applications
      endDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-28`,
      ownerNickname: owner.nickname,
      techStacks: owner.techStacks,
      onOffline: i % 3 === 0 ? '온라인' : (i % 3 === 1 ? '오프라인' : '온/오프라인')
    });
  }
  return posts;
};

const generateApplies = (users, posts) => {
  const applies = [];
  // Generate some random applications
  for (let i = 1; i <= 80; i++) {
    const user = users[i % users.length];
    const post = posts[i % posts.length];
    
    if (user.nickname === post.ownerNickname) continue;

    const status = i % 4 === 0 ? 'ACCEPTED' : (i % 7 === 0 ? 'REJECTED' : 'PENDING');
    
    applies.push({
      applyId: i,
      projectId: post.projectId,
      userId: user.userId,
      projectTitle: post.title,
      category: post.category,
      position: user.position === 'FE' ? '프론트엔드' : (user.position === 'BE' ? '백엔드' : '디자이너'),
      status,
      appliedDate: `2026-03-${String((i % 31) + 1).padStart(2, '0')}`,
      ownerNickname: post.ownerNickname,
      message: "열심히 하겠습니다! 꼭 뽑아주세요."
    });

    if (status === 'ACCEPTED') {
      post.currentCount += 1;
    }
  }
  return applies;
};

const generateBoardPosts = (posts) => {
  const boardPosts = [];
  posts.slice(0, 10).forEach(post => {
    boardPosts.push({
      id: post.projectId * 100,
      projectId: post.projectId,
      type: "NOTICE",
      title: "📢 프로젝트 시작 및 규칙 안내",
      content: "모두 반갑습니다! 우리 프로젝트의 핵심 규칙입니다.\n1. 매주 월요일 오후 8시 회의\n2. PR은 이틀 내 리뷰\n3. 상호 존중",
      author: post.ownerNickname,
      date: "2026.03.30",
      views: 15,
    });
  });
  return boardPosts;
};

// --- Storage Management ---
const initializeDB = () => {
  const users = generateUsers();
  const posts = generatePosts(users);
  const applies = generateApplies(users, posts);
  const boardPosts = generateBoardPosts(posts);
  const comments = [
    { id: 1, boardPostId: 100, author: users[1].nickname, content: "확인했습니다! 화이팅!", date: "2026.04.01 10:00" }
  ];

  localStorage.setItem('mock-users', JSON.stringify(users));
  localStorage.setItem('mock-posts', JSON.stringify(posts));
  localStorage.setItem('mock-applies', JSON.stringify(applies));
  localStorage.setItem('mock-board-posts', JSON.stringify(boardPosts));
  localStorage.setItem('mock-comments', JSON.stringify(comments));
  localStorage.setItem('user-info', JSON.stringify(users[0])); // Initial test account
  
  return { users, posts, applies, boardPosts, comments, currentUser: users[0] };
};

const getDB = () => {
  const users = JSON.parse(localStorage.getItem('mock-users'));
  if (!users) return initializeDB();

  return {
    users,
    posts: JSON.parse(localStorage.getItem('mock-posts')),
    applies: JSON.parse(localStorage.getItem('mock-applies')),
    boardPosts: JSON.parse(localStorage.getItem('mock-board-posts')),
    comments: JSON.parse(localStorage.getItem('mock-comments')),
    currentUser: JSON.parse(localStorage.getItem('user-info'))
  };
};

const saveDB = (db) => {
  localStorage.setItem('mock-users', JSON.stringify(db.users));
  localStorage.setItem('mock-posts', JSON.stringify(db.posts));
  localStorage.setItem('mock-applies', JSON.stringify(db.applies));
  localStorage.setItem('mock-board-posts', JSON.stringify(db.boardPosts));
  localStorage.setItem('mock-comments', JSON.stringify(db.comments));
  localStorage.setItem('user-info', JSON.stringify(db.currentUser));
};

let db = getDB();

export const handlers = [
  // 1. 로그인 핸들러
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
      db.currentUser = user;
      saveDB(db);
      return HttpResponse.json({
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: user 
        }
      });
    }

    return new HttpResponse(JSON.stringify({ 
      success: false, 
      error: { code: 'AUTH_001', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } 
    }), { status: 401 });
  }),

  // 2. 닉네임 중복 확인
  http.get('*/api/auth/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');
    const exists = db.users.some(u => u.nickname === nickname && u.userId !== db.currentUser?.userId);
    return HttpResponse.json({ success: true, data: { isAvailable: !exists } });
  }),

  // 3. 회원가입
  http.post('*/api/auth/signup', async ({ request }) => {
    const formData = await request.formData();
    const dataStr = formData.get('data');
    const userData = JSON.parse(await dataStr.text());

    const newUser = {
      ...userData,
      userId: db.users.length + 1,
      profileImageUrl: `https://i.pravatar.cc/150?u=user${db.users.length + 1}`,
      techStacks: userData.techStacks || []
    };
    
    db.users.push(newUser);
    saveDB(db);

    return HttpResponse.json({ 
      success: true, 
      data: newUser, 
      message: '회원가입이 완료되었습니다.' 
    }, { status: 201 });
  }),

  // 4. 모집글 목록 조회
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const keyword = url.searchParams.get('keyword')?.toLowerCase(); 
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '15');
    
    let filteredPosts = [...db.posts];
    if (category && category !== '전체') {
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
    const content = filteredPosts.slice(page * size, (page + 1) * size);

    return HttpResponse.json({
      success: true,
      data: {
        content,
        page: { size, number: page, totalElements, totalPages: Math.ceil(totalElements / size) }
      }
    });
  }),

  // 6. 마이페이지 정보 조회
  http.get('*/api/users/me', () => {
    if (!db.currentUser) return new HttpResponse(null, { status: 401 });
    
    const myPosts = db.posts.filter(p => p.ownerNickname === db.currentUser.nickname);
    const myApplies = db.applies.filter(a => a.userId === db.currentUser.userId);
    const acceptedProjects = db.applies
      .filter(a => a.userId === db.currentUser.userId && a.status === 'ACCEPTED')
      .map(a => db.posts.find(p => p.projectId === a.projectId))
      .filter(Boolean);

    return HttpResponse.json({
      success: true,
      data: { 
        ...db.currentUser, 
        postCount: myPosts.length, 
        applyCount: myApplies.length, 
        myPosts, 
        applies: myApplies, 
        acceptedProjects 
      }
    });
  }),

  // 15. 모집글 상세 정보
  http.get('*/api/projects/:id', ({ params }) => {
    const post = db.posts.find(p => p.projectId === parseInt(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    
    const owner = db.users.find(u => u.nickname === post.ownerNickname);
    const members = db.applies
      .filter(a => a.projectId === post.projectId && a.status === 'ACCEPTED')
      .map(a => {
        const u = db.users.find(user => user.userId === a.userId);
        return { nickname: u?.nickname, position: u?.position, role: 'MEMBER' };
      });

    return HttpResponse.json({ 
      success: true, 
      data: { 
        ...post, 
        owner: { nickname: owner?.nickname, position: owner?.position }, 
        members: [{ nickname: owner?.nickname, position: owner?.position, role: "OWNER" }, ...members] 
      } 
    });
  }),

  // 17. 모집글 지원하기
  http.post('*/api/applications', async ({ request }) => {
    const { postId, message } = await request.json();
    const project = db.posts.find(p => p.projectId === parseInt(postId));
    
    if (!project) return new HttpResponse(null, { status: 404 });

    const newApply = { 
      applyId: Date.now(), 
      projectId: project.projectId, 
      userId: db.currentUser.userId,
      projectTitle: project.title,
      category: project.category,
      position: db.currentUser.position === 'FE' ? '프론트엔드' : '백엔드', 
      status: "PENDING", 
      appliedDate: new Date().toISOString().split('T')[0], 
      ownerNickname: project.ownerNickname,
      message
    };
    
    db.applies.push(newApply);
    saveDB(db);
    
    return HttpResponse.json({ success: true, data: newApply });
  }),

  // 지원 상태 변경 (승인/거절)
  http.patch('*/api/applications/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json();
    const apply = db.applies.find(a => a.applyId === parseInt(id));
    
    if (!apply) return new HttpResponse(null, { status: 404 });
    
    apply.status = status;
    if (status === 'ACCEPTED') {
      const post = db.posts.find(p => p.projectId === apply.projectId);
      if (post) post.currentCount += 1;
    }
    
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),

  // 팀 게시판 목록
  http.get('*/api/posts/:projectId/board', ({ params, request }) => {
    const { projectId } = params;
    const projectBoardPosts = db.boardPosts.filter(p => p.projectId === parseInt(projectId));
    return HttpResponse.json({
      success: true,
      data: {
        content: projectBoardPosts,
        page: { number: 0, size: 10, totalElements: projectBoardPosts.length, totalPages: 1 }
      }
    });
  }),

  // 5. 로그아웃
  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // 2-2. 전화번호 중복 확인
  http.get('*/api/users/check-phone', ({ request }) => {
    const url = new URL(request.url);
    const phoneNumber = url.searchParams.get('phoneNumber');
    const exists = db.users.some(u => u.phoneNumber === phoneNumber && u.userId !== db.currentUser?.userId);
    return HttpResponse.json({ success: true, data: { isAvailable: !exists } });
  }),

  // 8. 아이디 찾기
  http.post('*/api/auth/find-email', async ({ request }) => {
    const { phoneNumber } = await request.json();
    const user = db.users.find(u => u.phoneNumber === phoneNumber);
    if (user) return HttpResponse.json({ success: true, data: { email: user.email } });
    return new HttpResponse(JSON.stringify({ success: false, error: { message: '정보를 찾을 수 없습니다.' } }), { status: 404 });
  }),

  // 9. 비밀번호 찾기
  http.post('*/api/auth/find-password', async ({ request }) => {
    const { email, phoneNumber } = await request.json();
    const user = db.users.find(u => u.email === email && u.phoneNumber === phoneNumber);
    if (user) return HttpResponse.json({ success: true, message: '임시 비밀번호가 발급되었습니다.' });
    return new HttpResponse(JSON.stringify({ success: false, error: { message: '정보가 일치하지 않습니다.' } }), { status: 400 });
  }),

  // 팀 게시글 상세 조회
  http.get('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const post = db.boardPosts.find(p => p.id === parseInt(params.boardPostId));
    return post ? HttpResponse.json({ success: true, data: post }) : new HttpResponse(null, { status: 404 });
  }),

  // 팀 게시글 작성
  http.post('*/api/posts/:projectId/board', async ({ params, request }) => {
    const postData = await request.json();
    const newBoardPost = { 
      id: Date.now(), 
      projectId: parseInt(params.projectId), 
      ...postData, 
      author: db.currentUser.nickname, 
      date: new Date().toLocaleDateString(), 
      views: 0 
    };
    db.boardPosts.push(newBoardPost);
    saveDB(db);
    return HttpResponse.json({ success: true, data: newBoardPost });
  }),

  // 팀 게시글 수정
  http.put('*/api/board-posts/:boardPostId', async ({ params, request }) => {
    const { boardPostId } = params;
    const updateData = await request.json();
    const index = db.boardPosts.findIndex(p => p.id === parseInt(boardPostId));
    if (index !== -1) {
      db.boardPosts[index] = { ...db.boardPosts[index], ...updateData };
      saveDB(db);
      return HttpResponse.json({ success: true, data: db.boardPosts[index] });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 팀 게시글 삭제
  http.delete('*/api/board-posts/:boardPostId', ({ params }) => {
    const { boardPostId } = params;
    db.boardPosts = db.boardPosts.filter(p => p.id !== parseInt(boardPostId));
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),

  // 댓글 조회
  http.get('*/api/posts/:projectId/board/:boardPostId/comments', ({ params }) => {
    const comments = db.comments.filter(c => c.boardPostId === parseInt(params.boardPostId));
    return HttpResponse.json({ success: true, data: comments });
  }),

  // 댓글 작성
  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ params, request }) => {
    const { content } = await request.json();
    const newComment = { 
      id: Date.now(), 
      boardPostId: parseInt(params.boardPostId), 
      author: db.currentUser.nickname, 
      content, 
      date: new Date().toLocaleString() 
    };
    db.comments.push(newComment);
    saveDB(db);
    return HttpResponse.json({ success: true, data: newComment });
  }),

  // 댓글 수정
  http.patch('*/api/comments/:commentId', async ({ params, request }) => {
    const { commentId } = params;
    const { content } = await request.json();
    const index = db.comments.findIndex(c => c.id === parseInt(commentId));
    if (index !== -1) {
      db.comments[index] = { ...db.comments[index], content, date: new Date().toLocaleString() + " (수정됨)" };
      saveDB(db);
      return HttpResponse.json({ success: true, data: db.comments[index] });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 댓글 삭제
  http.delete('*/api/comments/:commentId', ({ params }) => {
    const { commentId } = params;
    db.comments = db.comments.filter(c => c.id !== parseInt(commentId));
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),

  // 모집글 수정
  http.patch('*/api/projects/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    const postIndex = db.posts.findIndex(p => p.projectId === parseInt(id));
    if (postIndex !== -1) {
      db.posts[postIndex] = { ...db.posts[postIndex], ...updatedData };
      saveDB(db);
      return HttpResponse.json({ success: true, data: db.posts[postIndex] });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 모집글 삭제
  http.delete('*/api/projects/:id', ({ params }) => {
    const { id } = params;
    db.posts = db.posts.filter(p => p.projectId !== parseInt(id));
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),

  // 유저 정보 수정 (마이페이지)
  http.put('*/api/users/me', async ({ request }) => {
    const updateData = await request.json();
    db.currentUser = { ...db.currentUser, ...updateData };
    const index = db.users.findIndex(u => u.userId === db.currentUser.userId);
    if (index !== -1) db.users[index] = db.currentUser;
    saveDB(db);
    return HttpResponse.json({ success: true, data: db.currentUser });
  }),

  // 프로필 이미지 수정
  http.patch('*/api/users/profile-image', async ({ request }) => {
    const formData = await request.formData();
    const profileImageFile = formData.get('profileImage');
    if (!profileImageFile) return new HttpResponse(null, { status: 400 });
    
    // In mock, we just keep the current one or set a placeholder
    db.currentUser.profileImageUrl = `https://i.pravatar.cc/150?u=user${db.currentUser.userId}&t=${Date.now()}`;
    const index = db.users.findIndex(u => u.userId === db.currentUser.userId);
    if (index !== -1) db.users[index] = db.currentUser;
    saveDB(db);
    
    return HttpResponse.json({ success: true, data: { profileImageUrl: db.currentUser.profileImageUrl } });
  }),

  // 회원 탈퇴
  http.delete('*/api/users/me', () => {
    db.users = db.users.filter(u => u.userId !== db.currentUser.userId);
    db.currentUser = null;
    saveDB(db);
    return new HttpResponse(null, { status: 204 });
  }),
];