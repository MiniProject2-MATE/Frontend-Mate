import { http, HttpResponse } from 'msw';

// 임시 저장소 (45개로 확장하여 3페이지 분량 확보)
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
  ownerNickname: `User_${i + 1}`,
  techStacks: i % 2 === 0 ? ['React', 'TypeScript', 'Node.js'] : ['Spring Boot', 'Java', 'MySQL'],
}));

export const handlers = [
  // 1. 로그인 API 모킹
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    // 특정 계정만 성공하도록 수정 (테스트 용도)
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

    // 로그인 실패 응답 (401 Unauthorized)
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

  // 3. 모집글 목록 조회 API 모킹 (페이징 로직 구현)
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '15');
    
    // 필터링 적용
    let filteredPosts = [...mockPosts];
    if (category && category !== '전체') {
      filteredPosts = filteredPosts.filter(p => p.category === category);
    }

    // 페이징 처리
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

// 5. 마이페이지용 내 정보 조회 API (회원가입/로그인 데이터 연동)
  http.get('*/api/user/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        email: 'test@test.com', // 회원가입 시 입력한 이메일 가정
        nickname: '테스트메이트', // 회원가입 시 입력한 닉네임
        position: '프론트엔드',   // 회원가입 시 선택한 포지션
        intro: '안녕하세요! 함께 성장하고 싶은 개발자입니다.', 
        techStacks: ['React', 'TypeScript', 'Node.js'], // 선택했던 스택
        postCount: 3, 
        applyCount: 5
      }
    });
  }),

 // 6. 아이디(이메일) 찾기 API 모킹 추가
  http.post('*/api/auth/find-email', async ({ request }) => {
    const { phoneNumber } = await request.json();

    // 입력받은 번호가 특정 번호일 때 성공하는 시나리오 (테스트용)
    if (phoneNumber === '01012345678') {
      return HttpResponse.json({
        success: true,
        data: {
          email: 'ji****@gmail.com'
        }
      });
    }

    // 번호가 다를 경우 404 에러 응답
    return new HttpResponse(
      JSON.stringify({
        success: false,
        error: {
          code: 'AUTH_002',
          message: '해당 번호로 가입된 정보를 찾을 수 없습니다.'
        }
      }),
      { status: 404 }
    );
  }),

 // 8. 비밀번호 찾기 (임시 비밀번호 발급) API 모킹 추가
  http.post('*/api/auth/find-password', async ({ request }) => {
    const { email, phoneNumber } = await request.json();

    // 특정 데이터로 입력했을 때만 성공하는 시나리오
    if (email === 'test@test.com' && phoneNumber === '01012345678') {
      return HttpResponse.json({
        success: true,
        message: '임시 비밀번호가 발급되었습니다.',
        data: {
          temporaryPassword: 'mate7788!@#$'
        }
      });
    }

    // 정보가 일치하지 않을 경우 400 에러 응답
    return new HttpResponse(
      JSON.stringify({
        success: false,
        error: {
          code: 'AUTH_003',
          message: '입력하신 이메일과 전화번호 정보가 일치하지 않습니다.'
        }
      }),
      { status: 400 }
    );
  }),
];
