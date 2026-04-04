import { http, HttpResponse } from 'msw';
import { generateUsers } from './mockUsers';
import { generatePosts } from './mockPosts';
import { generateApplies } from './mockApplies';
import { generateBoardPosts, generateComments } from './mockBoard';

// 데이터 초기화 및 DB 로직
const initializeDB = () => {
  const users = generateUsers();
  const posts = generatePosts();
  const applies = generateApplies(users);
  const boardPosts = generateBoardPosts(users);
  const comments = generateComments(users);

  // 초기 로그인 유저는 id: 5 (풀스택꿈나무)로 설정
  const initialDB = { users, posts, applies, boardPosts, comments, currentUser: users[4] };
  localStorage.setItem('mock-db', JSON.stringify(initialDB));
  return initialDB;
};

const getDB = () => {
  const data = localStorage.getItem('mock-db');
  if (!data) return initializeDB();
  
  const parsed = JSON.parse(data);
  // [보정] 구버전 데이터 호환성 유지
  if (parsed.applies) {
    parsed.applies = parsed.applies.map(a => ({
      ...a,
      applicantNickname: a.applicantNickname || a.nickname,
      applicantPosition: a.applicantPosition || a.position,
      createdAt: a.createdAt || a.appliedDate
    }));
  }
  if (parsed.users) {
    parsed.users = parsed.users.map(u => ({
      ...u,
      profileImg: u.profileImg || u.profileImageUrl
    }));
  }
  return parsed;
};

const saveDB = (db) => {
  localStorage.setItem('mock-db', JSON.stringify(db));
};

let db = getDB();

export const handlers = [
  // 1. 인증 관련 (Auth)
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      db.currentUser = user;
      saveDB(db);
      return HttpResponse.json({ 
        success: true, 
        message: "로그인에 성공하였습니다.",
        data: { 
          accessToken: 'mock-access-token', 
          refreshToken: 'mock-refresh-token', 
          tokenType: "Bearer",
          expiresIn: 3600,
          user: { id: user.id, nickname: user.nickname, email: user.email, position: user.position } 
        } 
      });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_001', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }), { status: 401 });
  }),

  http.post('*/api/auth/logout', () => {
    db.currentUser = null;
    saveDB(db);
    return HttpResponse.json({ success: true, message: "로그아웃이 성공적으로 완료되었습니다.", data: null });
  }),

  http.get('*/api/auth/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');
    const exists = db.users.some(u => u.nickname === nickname && u.id !== db.currentUser?.id);
    return HttpResponse.json({ success: true, message: exists ? "이미 사용 중인 닉네임입니다." : "사용 가능한 닉네임입니다.", data: { isAvailable: !exists } });
  }),

  // 2. 유저/마이페이지 (Users)
  http.get('*/api/users/me', () => {
    if (!db.currentUser) return new HttpResponse(null, { status: 401 });
    const user = db.users.find(u => u.id === db.currentUser.id);
    return HttpResponse.json({ success: true, message: "내 정보 조회가 완료되었습니다.", data: user });
  }),

  http.get('*/api/users/me/posts/owned', () => {
    const owned = db.posts.filter(p => p.ownerId === db.currentUser?.id);
    return HttpResponse.json({ success: true, message: "내 모집글 조회가 완료되었습니다.", data: owned });
  }),

  http.get('*/api/users/me/posts/joined', () => {
    const joinedIds = db.applies.filter(a => a.applicantId === db.currentUser?.id && a.status === 'ACCEPTED').map(a => a.projectId);
    const joined = db.posts.filter(p => joinedIds.includes(p.id));
    return HttpResponse.json({ success: true, message: "참여 중인 프로젝트 조회가 완료되었습니다.", data: joined });
  }),

  http.get('*/api/users/me/applications', () => {
    const myApplies = db.applies.filter(a => a.applicantId === db.currentUser?.id);
    return HttpResponse.json({ success: true, message: "내 신청 현황 조회가 완료되었습니다.", data: myApplies });
  }),

  // 3. 프로젝트 모집 (Projects)
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const keyword = url.searchParams.get('keyword')?.toLowerCase(); 
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = 15;
    
    let filteredPosts = [...db.posts];
    if (category && category !== '전체') filteredPosts = filteredPosts.filter(p => p.category === category);
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
      message: "프로젝트 목록 조회가 완료되었습니다.",
      data: { content, page: { size, number: page, totalElements, totalPages: Math.ceil(totalElements / size) } } 
    });
  }),

  http.get('*/api/projects/:id', ({ params }) => {
    const post = db.posts.find(p => p.id === parseInt(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    const owner = db.users.find(u => u.id === post.ownerId);
    return HttpResponse.json({ 
      success: true, 
      message: "프로젝트 상세 조회가 완료되었습니다.",
      data: { ...post, ownerNickname: owner?.nickname, owner: db.currentUser?.id === post.ownerId } 
    });
  }),

  http.post('*/api/projects', async ({ request }) => {
    const data = await request.json();
    const newId = Date.now();
    const newPost = { ...data, id: newId, ownerId: db.currentUser.id, status: 'RECRUITING', currentCount: 1, createdAt: new Date().toISOString() };
    db.posts.unshift(newPost);
    saveDB(db);
    return HttpResponse.json({ success: true, message: "프로젝트가 생성되었습니다.", data: { id: newId } }, { status: 201 });
  }),

  http.patch('*/api/projects/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = db.posts.findIndex(p => p.id === parseInt(params.id));
    if (index !== -1) { db.posts[index] = { ...db.posts[index], ...data }; saveDB(db); return HttpResponse.json({ success: true, data: db.posts[index] }); }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch('*/api/projects/:id/close', ({ params }) => {
    const post = db.posts.find(p => p.id === parseInt(params.id));
    if (post) { post.status = 'CLOSED'; saveDB(db); return HttpResponse.json({ success: true, message: "모집이 마감되었습니다." }); }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch('*/api/projects/:id/reopen', ({ params }) => {
    const post = db.posts.find(p => p.id === parseInt(params.id));
    if (post) { post.status = 'RECRUITING'; saveDB(db); return HttpResponse.json({ success: true, message: "재모집이 시작되었습니다." }); }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('*/api/projects/:id', ({ params }) => {
    db.posts = db.posts.filter(p => p.id !== parseInt(params.id));
    saveDB(db);
    return HttpResponse.json({ success: true, message: "삭제되었습니다." });
  }),

  // 4. 멤버 관리 (Project Members) - BoardPage 전용
  http.get('*/api/posts/:projectId/members', ({ params }) => {
    const projectId = parseInt(params.projectId);
    const project = db.posts.find(p => p.id === projectId);
    if (!project) return new HttpResponse(null, { status: 404 });

    const owner = db.users.find(u => u.id === project.ownerId);
    const members = db.applies
      .filter(a => a.projectId === projectId && a.status === 'ACCEPTED')
      .map(a => {
        const u = db.users.find(user => user.id === a.applicantId);
        return { id: u.id, nickname: u.nickname, position: u.position, role: 'MEMBER', profileImg: u.profileImg };
      });

    const ownerData = { id: owner.id, nickname: owner.nickname, position: owner.position, role: 'OWNER', profileImg: owner.profileImg };
    return HttpResponse.json({ success: true, message: "멤버 조회가 완료되었습니다.", data: [ownerData, ...members] });
  }),

  http.delete('*/api/posts/members/:memberId', ({ params }) => {
    const userId = parseInt(params.memberId);
    
    // 1. 해당 유저의 'ACCEPTED' 상태인 지원 내역을 찾아서 삭제 (또는 상태 변경)
    // 어떤 프로젝트인지 특정하기 위해 현재 db.applies를 필터링
    const targetApply = db.applies.find(a => a.applicantId === userId && a.status === 'ACCEPTED');
    
    if (targetApply) {
      const projectId = targetApply.projectId;
      
      // 2. 지원 내역 삭제
      db.applies = db.applies.filter(a => !(a.applicantId === userId && a.projectId === projectId));
      
      // 3. 해당 프로젝트의 currentCount 감소
      const project = db.posts.find(p => p.id === projectId);
      if (project && project.currentCount > 1) {
        project.currentCount -= 1;
      }
      
      saveDB(db);
      return HttpResponse.json({ success: true, message: "멤버가 팀에서 제외되었습니다." });
    }
    
    return new HttpResponse(JSON.stringify({ success: false, message: "해당 멤버를 찾을 수 없습니다." }), { status: 404 });
  }),

  // 5. 지원 (Applications)
  http.post('*/api/applications/:projectId', async ({ params, request }) => {
    const { message, position } = await request.json();
    const projectId = parseInt(params.projectId);
    const project = db.posts.find(p => p.id === projectId);
    const newApply = { id: Date.now(), projectId, applicantId: db.currentUser.id, projectTitle: project?.title, applicantPosition: position || 'FE', status: "PENDING", createdAt: new Date().toISOString(), applicantNickname: db.currentUser.nickname, message };
    db.applies.push(newApply);
    saveDB(db);
    return HttpResponse.json({ success: true, message: "지원이 완료되었습니다.", data: newApply });
  }),

  http.get('*/api/projects/:projectId/applications', ({ params }) => {
    const projectApplies = db.applies.filter(a => a.projectId === parseInt(params.projectId));
    return HttpResponse.json({ success: true, data: projectApplies });
  }),

  http.patch('*/api/applications/:id/status', async ({ params, request }) => {
    const { status } = await request.json();
    const apply = db.applies.find(a => a.id === parseInt(params.id));
    if (apply) {
      const targetStatus = status === 'accept' ? 'ACCEPTED' : 'REJECTED';
      apply.status = targetStatus;
      if (targetStatus === 'ACCEPTED') {
        const post = db.posts.find(p => p.id === apply.projectId);
        if (post) post.currentCount += 1;
      }
      saveDB(db);
      return HttpResponse.json({ success: true, message: "처리되었습니다.", data: apply });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('*/api/applications/:id', ({ params }) => {
    db.applies = db.applies.filter(a => a.id !== parseInt(params.id));
    saveDB(db);
    return HttpResponse.json({ success: true, message: "취소되었습니다." });
  }),

  // 6. 팀 게시판 (Board)
  http.get('*/api/posts/:projectId/board', ({ params }) => {
    const boardPosts = db.boardPosts.filter(p => p.projectId === parseInt(params.projectId) && !p.isDeleted);
    return HttpResponse.json({ 
      success: true, 
      message: "조회 완료", 
      data: { content: boardPosts.map(p => ({ ...p, author: p.authorId === db.currentUser?.id })), page: { number: 0, size: 10, totalElements: boardPosts.length, totalPages: 1 } } 
    });
  }),

  http.get('*/api/posts/:projectId/board/:postId', ({ params }) => {
    const post = db.boardPosts.find(p => p.id === parseInt(params.postId) && !p.isDeleted);
    if (post) { post.viewCount += 1; saveDB(db); return HttpResponse.json({ success: true, data: { ...post, author: post.authorId === db.currentUser?.id } }); }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post('*/api/posts/:projectId/board', async ({ params, request }) => {
    const data = await request.json();
    const newPost = { id: Date.now(), projectId: parseInt(params.projectId), ...data, authorNickname: db.currentUser.nickname, authorId: db.currentUser.id, createdAt: new Date().toISOString(), viewCount: 0, isDeleted: false };
    db.boardPosts.push(newPost);
    saveDB(db);
    return HttpResponse.json({ success: true, message: "작성되었습니다.", data: newPost });
  }),

  http.patch('*/api/posts/:projectId/board/:postId', async ({ params, request }) => {
    const data = await request.json();
    const post = db.boardPosts.find(p => p.id === parseInt(params.postId));
    if (post) { Object.assign(post, data); saveDB(db); return HttpResponse.json({ success: true, message: "수정되었습니다.", data: post }); }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('*/api/posts/:projectId/board/:postId', ({ params }) => {
    const post = db.boardPosts.find(p => p.id === parseInt(params.postId));
    if (post) { post.isDeleted = true; saveDB(db); return HttpResponse.json({ success: true, message: "삭제되었습니다." }); }
    return new HttpResponse(null, { status: 404 });
  }),

  // 7. 댓글 (Comments)
  http.get('*/api/posts/:projectId/board/:postId/comments', ({ params }) => {
    const comments = db.comments.filter(c => c.postId === parseInt(params.postId) && !c.isDeleted);
    return HttpResponse.json({ success: true, data: comments });
  }),

  http.post('*/api/posts/:projectId/board/:postId/comments', async ({ params, request }) => {
    const { content } = await request.json();
    const newComment = { id: Date.now(), postId: parseInt(params.postId), authorNickname: db.currentUser.nickname, authorId: db.currentUser.id, authorProfileImg: db.currentUser.profileImg, content, createdAt: new Date().toISOString(), isDeleted: false };
    db.comments.push(newComment);
    saveDB(db);
    return HttpResponse.json({ success: true, message: "등록되었습니다.", data: newComment });
  }),

  http.patch('*/api/comments/:id', async ({ params, request }) => {
    const { content } = await request.json();
    const index = db.comments.findIndex(c => c.id === parseInt(params.id));
    if (index !== -1) { db.comments[index] = { ...db.comments[index], content, createdAt: new Date().toISOString() }; saveDB(db); return HttpResponse.json({ success: true, data: db.comments[index] }); }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('*/api/comments/:id', ({ params }) => {
    const comment = db.comments.find(c => c.id === parseInt(params.id));
    if (comment) { comment.isDeleted = true; saveDB(db); return HttpResponse.json({ success: true, message: "삭제되었습니다." }); }
    return new HttpResponse(null, { status: 404 });
  }),
];
