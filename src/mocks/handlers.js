import { http, HttpResponse } from 'msw';

// --- Data Generation Utilities ---
const POSITIONS = ['프론트엔드', '백엔드', '디자이너', '기획자'];
const TECH_STACKS = {
  '프론트엔드': ['React', 'Vue', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Zustand'],
  '백엔드': ['Spring Boot', 'Node.js', 'Go', 'Python', 'Java', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker'],
  '디자이너': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
  '기획자': ['Jira', 'Confluence', 'Notion', 'Slack']
};

const generateUsers = () => {
  return [
    { userId: 1, email: 'user_1@test.com', password: '1234', nickname: '프론트깍이', phoneNumber: '01011110001', position: 'FE', techStacks: ['React', 'TypeScript', 'Tailwind CSS'], intro: '깔끔한 UI를 지향하는 프론트엔드 개발자입니다.' },
    { userId: 2, email: 'user_2@test.com', password: '1234', nickname: '백엔드장인', phoneNumber: '01011110002', position: 'BE', techStacks: ['Java', 'Spring Boot', 'MySQL'], intro: '견고한 서버 설계를 중요하게 생각합니다.' },
    { userId: 3, email: 'user_3@test.com', password: '1234', nickname: '디자인천재', phoneNumber: '01011110003', position: 'DE', techStacks: ['Figma', 'Adobe XD', 'Photoshop'], intro: '사용자 경험을 극대화하는 디자이너입니다.' },
    { userId: 4, email: 'user_4@test.com', password: '1234', nickname: '기획마스터', phoneNumber: '01011110004', position: 'PM', techStacks: ['Jira', 'Notion', 'Confluence'], intro: '프로젝트의 방향타를 잡는 기획자입니다.' },
    { userId: 5, email: 'user_5@test.com', password: '1234', nickname: '풀스택꿈나무', phoneNumber: '01011110005', position: 'BE', techStacks: ['Node.js', 'Express', 'React', 'MongoDB'], intro: '프론트와 백엔드를 아우르는 개발자가 되고 싶습니다.' },
    { userId: 6, email: 'user_6@test.com', password: '1234', nickname: '뷰전문가', phoneNumber: '01011110006', position: 'FE', techStacks: ['Vue.js', 'Vite', 'Pinia', 'JavaScript'], intro: 'Vue 생태계를 사랑하는 개발자입니다.' },
    { userId: 7, email: 'user_7@test.com', password: '1234', nickname: '파이썬술사', phoneNumber: '01011110007', position: 'BE', techStacks: ['Python', 'Django', 'PostgreSQL', 'Redis'], intro: '파이썬의 간결함을 사랑합니다.' },
    { userId: 8, email: 'user_8@test.com', password: '1234', nickname: 'UI구조대', phoneNumber: '01011110008', position: 'DE', techStacks: ['Figma', 'Framer', 'Canva'], intro: '디테일한 인터랙션을 구현합니다.' },
    { userId: 9, email: 'user_9@test.com', password: '1234', nickname: '서비스빌더', phoneNumber: '01011110009', position: 'PM', techStacks: ['Slack', 'Miro', 'Google Analytics'], intro: '데이터 기반의 의사결정을 선호합니다.' },
    { userId: 10, email: 'user_10@test.com', password: '1234', nickname: '데브옵스왕', phoneNumber: '01011110010', position: 'ETC', techStacks: ['Docker', 'Kubernetes', 'AWS', 'Terraform'], intro: '자동화와 인프라 최적화 전문가입니다.' },
    { userId: 11, email: 'user_11@test.com', password: '1234', nickname: '넥스트레벨', phoneNumber: '01011110011', position: 'FE', techStacks: ['Next.js', 'TanStack Query', 'Emotion'], intro: 'SSR과 성능 최적화에 관심이 많습니다.' },
    { userId: 12, email: 'user_12@test.com', password: '1234', nickname: '코틀린러버', phoneNumber: '01011110012', position: 'BE', techStacks: ['Kotlin', 'Spring Boot', 'MariaDB'], intro: '안정적인 코틀린 서버를 구축합니다.' },
    { userId: 13, email: 'user_13@test.com', password: '1234', nickname: '픽셀아트', phoneNumber: '01011110013', position: 'DE', techStacks: ['Illustrator', 'Photoshop', 'Zeplin'], intro: '완벽한 픽셀 매칭을 추구합니다.' },
    { userId: 14, email: 'user_14@test.com', password: '1234', nickname: '일정관리자', phoneNumber: '01011110014', position: 'PM', techStacks: ['Notion', 'Discord', 'Jira'], intro: '팀의 효율성을 극대화합니다.' },
    { userId: 15, email: 'user_15@test.com', password: '1234', nickname: '고데이터', phoneNumber: '01011110015', position: 'BE', techStacks: ['Go', 'gRPC', 'MySQL', 'Kafka'], intro: '고성능 동시성 처리를 전문으로 합니다.' },
    { userId: 16, email: 'user_16@test.com', password: '1234', nickname: '앱개발자', phoneNumber: '01011110016', position: 'ETC', techStacks: ['React Native', 'Expo', 'Firebase'], intro: '모바일 앱 개발을 즐깁니다.' },
    { userId: 17, email: 'user_17@test.com', password: '1234', nickname: '상태관리사', phoneNumber: '01011110017', position: 'FE', techStacks: ['Redux', 'Webpack', 'HTML/CSS'], intro: '복잡한 상태 구조를 깔끔하게 정리합니다.' },
    { userId: 18, email: 'user_18@test.com', password: '1234', nickname: '네스트고수', phoneNumber: '01011110018', position: 'BE', techStacks: ['NestJS', 'TypeScript', 'TypeORM'], intro: 'Node.js의 구조적인 아키텍처를 선호합니다.' },
    { userId: 19, email: 'user_19@test.com', password: '1234', nickname: 'UX러버', phoneNumber: '01011110019', position: 'DE', techStacks: ['Figma', 'Protopie', 'Adobe XD'], intro: '사용자 심리를 분석하는 디자이너입니다.' },
    { userId: 20, email: 'user_20@test.com', password: '1234', nickname: '로드맵메이커', phoneNumber: '01011110020', position: 'PM', techStacks: ['Confluence', 'Slack', 'Jira'], intro: '장기적인 비전을 현실로 만듭니다.' },
    { userId: 21, email: 'user_21@test.com', password: '1234', nickname: '스벨트뉴비', phoneNumber: '01011110021', position: 'FE', techStacks: ['Svelte', 'Vite', 'CSS Modules'], intro: '가벼운 런타임을 추구하는 개발자입니다.' },
    { userId: 22, email: 'user_22@test.com', password: '1234', nickname: '데이터사이언', phoneNumber: '01011110022', position: 'ETC', techStacks: ['PyTorch', 'Pandas', 'NumPy', 'R'], intro: '데이터 속에서 가치를 찾아냅니다.' },
    { userId: 23, email: 'user_23@test.com', password: '1234', nickname: '보안전문가', phoneNumber: '01011110023', position: 'BE', techStacks: ['C#', '.NET', 'Oracle', 'Linux'], intro: '철저한 보안 의식을 가진 서버 개발자입니다.' },
    { userId: 24, email: 'user_24@test.com', password: '1234', nickname: '컬러리스트', phoneNumber: '01011110024', position: 'DE', techStacks: ['Photoshop', 'Illustrator', 'Figma'], intro: '색감의 조화를 중요시하는 디자이너입니다.' },
    { userId: 25, email: 'user_25@test.com', password: '1234', nickname: '소통창구', phoneNumber: '01011110025', position: 'PM', techStacks: ['Slack', 'Notion', 'Jira'], intro: '원활한 팀 커뮤니케이션을 돕습니다.' },
    { userId: 26, email: 'user_26@test.com', password: '1234', nickname: '웹소켓마스터', phoneNumber: '01011110026', position: 'BE', techStacks: ['Node.js', 'Socket.io', 'Redis'], intro: '실시간 데이터 처리에 강점이 있습니다.' },
    { userId: 27, email: 'user_27@test.com', password: '1234', nickname: '모던웹', phoneNumber: '01011110027', position: 'FE', techStacks: ['React', 'Zustand', 'Styled Components'], intro: '최신 웹 트렌드를 빠르게 학습합니다.' },
    { userId: 28, email: 'user_28@test.com', password: '1234', nickname: '게임개발', phoneNumber: '01011110028', position: 'ETC', techStacks: ['Unity', 'C#', 'Unreal Engine'], intro: '몰입감 있는 게임을 개발합니다.' },
    { userId: 29, email: 'user_29@test.com', password: '1234', nickname: '인프라요정', phoneNumber: '01011110029', position: 'BE', techStacks: ['AWS', 'Nginx', 'Docker', 'Jenkins'], intro: '서버 환경 구축과 배포를 책임집니다.' },
    { userId: 30, email: 'user_30@test.com', password: '1234', nickname: '최종보스', phoneNumber: '01011110030', position: 'ETC', techStacks: ['Python', 'PyTorch', 'Kubernetes'], intro: '복잡한 문제를 해결하는 아키텍트입니다.' },
  ].map(user => ({
    ...user,
    profileImageUrl: `https://i.pravatar.cc/150?u=user${user.userId}`
  }));
};

const generatePosts = () => {
  return [
    { projectId: 1, category: 'PROJECT', title: '배달 앱 클론 코딩하실 분!', recruitCount: 4, currentCount: 1, endDate: '2026-03-25', onOffline: '온라인', techStacks: ['React', 'Node.js', 'MySQL'], content: '실무와 유사한 환경에서 API 설계부터 배포까지 경험해봐요.', ownerNickname: '풀스택꿈나무', status: 'CLOSED' },
    { projectId: 2, category: 'STUDY', title: '모던 자바스크립트 Deep Dive', recruitCount: 5, currentCount: 2, endDate: '2026-03-28', onOffline: '오프라인', techStacks: ['JavaScript'], content: '매주 한 장씩 읽고 정리해서 발표하는 스터디입니다.', ownerNickname: '프론트깍이', status: 'CLOSED' },
    { projectId: 3, category: 'PROJECT', title: 'AI 기반 식단 추천 서비스', recruitCount: 3, currentCount: 1, endDate: '2026-04-01', onOffline: '혼합', techStacks: ['Python', 'FastAPI', 'PyTorch'], content: '사용자의 취향을 분석해 식단을 추천해주는 웹 서비스를 만듭니다.', ownerNickname: '최종보스', status: 'CLOSED' },
    { projectId: 4, category: 'STUDY', title: 'Next.js 14 공식 문서 정독', recruitCount: 2, currentCount: 1, endDate: '2026-04-02', onOffline: '온라인', techStacks: ['Next.js', 'TypeScript'], content: 'App Router 기반의 신기능을 함께 학습하고 실습해봅니다.', ownerNickname: '넥스트레벨', status: 'CLOSED' },
    { projectId: 5, category: 'PROJECT', title: '위치 기반 중고 거래 플랫폼', recruitCount: 6, currentCount: 2, endDate: '2026-03-20', onOffline: '오프라인', techStacks: ['Flutter', 'Firebase', 'Dart'], content: '동네 인증 기반의 하이퍼 로컬 커뮤니티 앱 프로젝트입니다.', ownerNickname: '앱개발자', status: 'CLOSED' },
    { projectId: 6, category: 'STUDY', title: '스프링 부트 핵심 원리 파악', recruitCount: 4, currentCount: 4, endDate: '2026-05-05', onOffline: '온라인', techStacks: ['Spring Boot', 'Java'], content: '인프런 강의를 듣고 매주 코드 리뷰를 진행하는 스터디입니다.', ownerNickname: '백엔드장인', status: 'CLOSED' },
    { projectId: 7, category: 'PROJECT', title: '디자이너를 위한 포트폴리오 사이트', recruitCount: 2, currentCount: 2, endDate: '2026-05-30', onOffline: '혼합', techStacks: ['Figma', 'React', 'Framer'], content: '감각적인 인터랙션이 들어간 디자이너 전용 템플릿 빌더입니다.', ownerNickname: '디자인천재', status: 'CLOSED' },
    { projectId: 8, category: 'STUDY', title: '알고리즘 문제 풀이 (코테 대비)', recruitCount: 8, currentCount: 8, endDate: '2026-06-01', onOffline: '온라인', techStacks: ['Python', 'C++', 'Java'], content: '프로그래머스 레벨 2~3 문제를 매일 1개씩 풀고 인증합니다.', ownerNickname: '백엔드장인', status: 'CLOSED' },
    { projectId: 9, category: 'PROJECT', title: '실시간 주식 차트 분석 대시보드', recruitCount: 3, currentCount: 3, endDate: '2026-06-25', onOffline: '온라인', techStacks: ['Vue.js', 'Go', 'WebSockets'], content: '대용량 데이터를 실시간으로 시각화하는 고성능 차트를 구현합니다.', ownerNickname: '고데이터', status: 'CLOSED' },
    { projectId: 10, category: 'STUDY', title: '테라폼으로 배우는 IaC', recruitCount: 3, currentCount: 3, endDate: '2026-05-12', onOffline: '혼합', techStacks: ['Terraform', 'AWS'], content: '클라우드 인프라를 코드로 관리하는 방법을 함께 연구해요.', ownerNickname: '데브옵스왕', status: 'CLOSED' },
    { projectId: 11, category: 'PROJECT', title: '대학생 전용 캘린더 공유 서비스', recruitCount: 4, currentCount: 2, endDate: '2026-04-06', onOffline: '오프라인', techStacks: ['React', 'NestJS', 'PostgreSQL'], content: '시간표와 과제 일정을 친구들과 공유하는 유틸리티 앱입니다.', ownerNickname: '네스트고수', status: 'RECRUITING' },
    { projectId: 12, category: 'STUDY', title: '피그마 컴포넌트 마스터하기', recruitCount: 5, currentCount: 2, endDate: '2026-04-06', onOffline: '온라인', techStacks: ['Figma'], content: '디자인 시스템의 기초인 컴포넌트와 변수 기능을 공부합니다.', ownerNickname: 'UI구조대', status: 'RECRUITING' },
    { projectId: 13, category: 'PROJECT', title: 'Rust로 만드는 웹 어셈블리 게임', recruitCount: 2, currentCount: 1, endDate: '2026-04-06', onOffline: '온라인', techStacks: ['Rust', 'Webpack'], content: '브라우저에서 돌아가는 고성능 로그라이크 게임 프로젝트입니다.', ownerNickname: '게임개발', status: 'RECRUITING' },
    { projectId: 14, category: 'STUDY', title: '쿠버네티스 실무 적용기', recruitCount: 4, currentCount: 2, endDate: '2026-04-05', onOffline: '혼합', techStacks: ['Kubernetes', 'Docker'], content: '로컬 환경에 클러스터를 구축하고 배포 파이프라인을 실습합니다.', ownerNickname: '인프라요정', status: 'RECRUITING' },
    { projectId: 15, category: 'PROJECT', title: '여행 사진 자동 보정 & 공유 플랫폼', recruitCount: 3, currentCount: 1, endDate: '2026-04-05', onOffline: '온라인', techStacks: ['Kotlin', 'Swift', 'OpenCV'], content: '필터 자동 추천 기능이 포함된 여행 커뮤니티 앱입니다.', ownerNickname: '코틀린러버', status: 'RECRUITING' },
    { projectId: 16, category: 'STUDY', title: 'SQL 튜닝 및 DB 설계 스터디', recruitCount: 6, currentCount: 3, endDate: '2026-04-04', onOffline: '오프라인', techStacks: ['MySQL', 'Oracle'], content: '성능 최적화를 위한 쿼리 튜닝 기법을 실제 사례로 공부합니다.', ownerNickname: '보안전문가', status: 'RECRUITING' },
    { projectId: 17, category: 'PROJECT', title: '개발자 전용 커피챗 서비스', recruitCount: 4, currentCount: 2, endDate: '2026-04-04', onOffline: '온라인', techStacks: ['TypeScript', 'Express', 'Redis'], content: '매칭 알고리즘을 통한 1:1 기술 교류 서비스를 만듭니다.', ownerNickname: '네스트고수', status: 'RECRUITING' },
    { projectId: 18, category: 'STUDY', title: '클린 코드 & 리팩토링 스터디', recruitCount: 3, currentCount: 2, endDate: '2026-05-15', onOffline: '혼합', techStacks: ['Java', 'Python'], content: "로버트 마틴의 '클린 코드' 책을 읽고 본인 코드를 리뷰합니다.", ownerNickname: '백엔드장인', status: 'RECRUITING' },
    { projectId: 19, category: 'PROJECT', title: '시니어 세대를 위한 커뮤니티', recruitCount: 5, currentCount: 4, endDate: '2026-08-20', onOffline: '오프라인', techStacks: ['React', 'Spring Boot', 'AWS'], content: '큰 글씨와 쉬운 UI를 강조한 세대 맞춤형 소셜 네트워크입니다.', ownerNickname: '프론트깍이', status: 'RECRUITING' },
    { projectId: 20, category: 'STUDY', title: '지라/노션 활용 협업 프로세스', recruitCount: 2, currentCount: 1, endDate: '2026-04-28', onOffline: '온라인', techStacks: ['Jira', 'Notion', 'Slack'], content: '프로젝트 관리 툴을 효율적으로 사용하는 노하우를 공유합니다.', ownerNickname: '기획마스터', status: 'RECRUITING' },
    { projectId: 21, category: 'PROJECT', title: '블록체인 기반 투표 시스템', recruitCount: 3, currentCount: 1, endDate: '2026-07-15', onOffline: '온라인', techStacks: ['Solidity', 'Next.js', 'Go'], content: '위변조가 불가능한 소규모 그룹용 투표 플랫폼입니다.', ownerNickname: '고데이터', status: 'RECRUITING' },
    { projectId: 22, category: 'STUDY', title: '리액트 상태 관리 도구 비교', recruitCount: 4, currentCount: 2, endDate: '2026-05-25', onOffline: '온라인', techStacks: ['Zustand', 'Redux', 'Recoil'], content: '다양한 라이브러리를 직접 써보며 장단점을 비교 분석합니다.', ownerNickname: '상태관리사', status: 'RECRUITING' },
    { projectId: 23, category: 'PROJECT', title: '개인 맞춤형 향수 추천 서비스', recruitCount: 2, currentCount: 1, endDate: '2026-06-05', onOffline: '혼합', techStacks: ['Django', 'React', 'Scikit-learn'], content: '머신러닝 알고리즘으로 취향에 맞는 향수를 매칭해줍니다.', ownerNickname: '파이썬술사', status: 'RECRUITING' },
    { projectId: 24, category: 'STUDY', title: '유니티 VR 컨텐츠 제작 입문', recruitCount: 3, currentCount: 1, endDate: '2026-06-15', onOffline: '오프라인', techStacks: ['Unity', 'C#'], content: 'VR 기기를 활용한 간단한 미니 게임을 함께 제작해봅니다.', ownerNickname: '게임개발', status: 'RECRUITING' },
    { projectId: 25, category: 'PROJECT', title: '업무용 화이트보드 협업 툴', recruitCount: 4, currentCount: 1, endDate: '2026-10-01', onOffline: '온라인', techStacks: ['Svelte', 'Socket.io', 'Canvas'], content: '동시 편집 기능이 포함된 가벼운 웹 화이트보드입니다.', ownerNickname: '스벨트뉴비', status: 'RECRUITING' },
    { projectId: 26, category: 'STUDY', title: '영어 기술 문서 읽기 스터디', recruitCount: 10, currentCount: 5, endDate: '2026-05-01', onOffline: '온라인', techStacks: ['Git', 'GitHub'], content: '해외 블로그나 공식 문서를 함께 번역하고 기술 용어를 익힙니다.', ownerNickname: '소통창구', status: 'RECRUITING' },
    { projectId: 27, category: 'PROJECT', title: '반려동물 건강 관리 다이어리', recruitCount: 3, currentCount: 1, endDate: '2026-07-10', onOffline: '혼합', techStacks: ['Flutter', 'Node.js', 'MongoDB'], content: '접종 일정과 식단 기록을 관리하는 집사 전용 앱입니다.', ownerNickname: '앱개발자', status: 'RECRUITING' },
    { projectId: 28, category: 'STUDY', title: '프론트엔드 테스트 자동화', recruitCount: 4, currentCount: 2, endDate: '2026-06-20', onOffline: '온라인', techStacks: ['Jest', 'Cypress', 'Playwright'], content: '단위 테스트부터 E2E 테스트까지 전 과정을 실습합니다.', ownerNickname: '프론트깍이', status: 'RECRUITING' },
    { projectId: 29, category: 'PROJECT', title: '사내 도서 대여 관리 시스템', recruitCount: 2, currentCount: 1, endDate: '2026-05-20', onOffline: '오프라인', techStacks: ['PHP', 'Laravel', 'MySQL'], content: '바코드 스캔을 통한 간편한 도서 대여/반납 웹 서비스입니다.', ownerNickname: '최종보스', status: 'RECRUITING' },
    { projectId: 30, category: 'STUDY', title: '디자인 시스템 설계 가이드', recruitCount: 5, currentCount: 2, endDate: '2026-05-10', onOffline: '온라인', techStacks: ['Figma', 'Storybook'], content: '디자인과 코드가 일치하는 시스템 구축 프로세스를 연구합니다.', ownerNickname: 'UX러버', status: 'RECRUITING' },
    { projectId: 31, category: 'PROJECT', title: '1인 가구 반찬 공유 플랫폼', recruitCount: 4, currentCount: 1, endDate: '2026-06-12', onOffline: '오프라인', techStacks: ['React', 'TypeScript', 'Node.js'], content: '이웃끼리 남는 반찬을 나눌 수 있는 위치 기반 웹 서비스입니다.', ownerNickname: '모던웹', status: 'RECRUITING' },
    { projectId: 32, category: 'STUDY', title: '도커/쿠버네티스 자격증(CKA)', recruitCount: 3, currentCount: 1, endDate: '2026-05-28', onOffline: '온라인', techStacks: ['Docker', 'Kubernetes', 'Linux'], content: '3개월 목표로 CKA 자격증 취득을 위해 실습 위주로 공부합니다.', ownerNickname: '데브옵스왕', status: 'RECRUITING' },
    { projectId: 33, category: 'PROJECT', title: '개발자 기술 블로그 템플릿 빌더', recruitCount: 2, currentCount: 1, endDate: '2026-07-15', onOffline: '온라인', techStacks: ['Next.js', 'Tailwind CSS', 'Vercel'], content: '마크다운 기반의 예쁜 블로그를 쉽게 생성해주는 도구입니다.', ownerNickname: '넥스트레벨', status: 'RECRUITING' },
    { projectId: 34, category: 'STUDY', title: '다트(Dart) & 플러터 입문', recruitCount: 5, currentCount: 2, endDate: '2026-04-20', onOffline: '혼합', techStacks: ['Flutter', 'Dart', 'Firebase'], content: '모바일 앱 개발이 처음인 분들과 함께 기초부터 다지는 스터디.', ownerNickname: '앱개발자', status: 'RECRUITING' },
    { projectId: 35, category: 'PROJECT', title: '실시간 코드 리뷰 플랫폼', recruitCount: 4, currentCount: 1, endDate: '2026-09-05', onOffline: '온라인', techStacks: ['Socket.io', 'Express', 'React'], content: '실시간으로 코드를 공유하며 채팅으로 리뷰를 주고받는 웹앱입니다.', ownerNickname: '웹소켓마스터', status: 'RECRUITING' },
    { projectId: 36, category: 'STUDY', title: '엘라스틱서치 검색 엔진 최적화', recruitCount: 3, currentCount: 1, endDate: '2026-06-30', onOffline: '온라인', techStacks: ['Elasticsearch', 'Logstash'], content: '대용량 데이터 검색 성능을 높이는 인덱싱 전략을 연구합니다.', ownerNickname: '인프라요정', status: 'RECRUITING' },
    { projectId: 37, category: 'PROJECT', title: '맞춤형 운동 루틴 추천 서비스', recruitCount: 3, currentCount: 1, endDate: '2026-08-14', onOffline: '혼합', techStacks: ['Swift', 'Kotlin', 'Firebase'], content: '사용자의 체형과 목표에 맞는 운동을 매일 추천해주는 앱입니다.', ownerNickname: '코틀린러버', status: 'RECRUITING' },
    { projectId: 38, category: 'STUDY', title: '디자인 패턴 with Java', recruitCount: 6, currentCount: 2, endDate: '2026-05-18', onOffline: '오프라인', techStacks: ['Java', 'Spring'], content: 'GoF의 디자인 패턴을 실제 Spring 코드에 적용해보는 스터디입니다.', ownerNickname: '백엔드장인', status: 'RECRUITING' },
    { projectId: 39, category: 'PROJECT', title: '사내 카페 사이렌 오더 시스템', recruitCount: 5, currentCount: 2, endDate: '2026-10-10', onOffline: '온라인', techStacks: ['Spring Boot', 'Redis', 'MySQL'], content: '주문 폭주 시 대기열 처리를 경험해볼 수 있는 백엔드 프로젝트입니다.', ownerNickname: '백엔드장인', status: 'RECRUITING' },
    { projectId: 40, category: 'STUDY', title: '피그마 활용 UX 분석 및 개선', recruitCount: 4, currentCount: 2, endDate: '2026-05-05', onOffline: '온라인', techStacks: ['Figma', 'Miro'], content: '기존 유명 앱들의 UX를 분석하고 더 나은 방향으로 재설계해봅니다.', ownerNickname: 'UX러버', status: 'RECRUITING' },
    { projectId: 41, category: 'PROJECT', title: '익명 고민 상담소 (실시간 채팅)', recruitCount: 2, currentCount: 1, endDate: '2026-06-22', onOffline: '온라인', techStacks: ['WebSockets', 'NestJS', 'React'], content: '로그인 없이 가볍게 고민을 털어놓는 실시간 익명 커뮤니티입니다.', ownerNickname: '웹소켓마스터', status: 'RECRUITING' },
    { projectId: 42, category: 'STUDY', title: 'GraphQL API 설계 실습', recruitCount: 4, currentCount: 1, endDate: '2026-07-01', onOffline: '혼합', techStacks: ['GraphQL', 'Apollo', 'Node.js'], content: 'REST API의 한계를 극복하기 위한 GraphQL 도입 및 실습 스터디.', ownerNickname: '네스트고수', status: 'RECRUITING' },
    { projectId: 43, category: 'PROJECT', title: '대학생 소모임 매칭 플랫폼', recruitCount: 6, currentCount: 2, endDate: '2026-11-20', onOffline: '오프라인', techStacks: ['Vue.js', 'Django', 'PostgreSQL'], content: '관심사 기반으로 근처 대학생 소모임을 찾아주는 서비스입니다.', ownerNickname: '뷰전문가', status: 'RECRUITING' },
    { projectId: 44, category: 'STUDY', title: '프론트엔드 성능 최적화 기법', recruitCount: 5, currentCount: 2, endDate: '2026-06-15', onOffline: '온라인', techStacks: ['Webpack', 'Vite', 'React'], content: '라이트하우스 점수 100점을 목표로 렌더링 최적화를 공부합니다.', ownerNickname: '넥스트레벨', status: 'RECRUITING' },
    { projectId: 45, category: 'PROJECT', title: '식물 집사를 위한 습도 알림이', recruitCount: 3, currentCount: 1, endDate: '2026-07-25', onOffline: '온라인', techStacks: ['Raspberry Pi', 'Python', 'MQTT'], content: 'IoT 센서와 연동해 식물의 상태를 앱으로 알려주는 프로젝트입니다.', ownerNickname: '파이썬술사', status: 'RECRUITING' },
    { projectId: 46, category: 'STUDY', title: '객체 지향의 사실과 오해 독서', recruitCount: 4, currentCount: 2, endDate: '2026-05-12', onOffline: '오프라인', techStacks: ['Git', 'Notion'], content: '조영호 님의 명저를 읽고 객체 지향 설계를 심도 있게 토론합니다.', ownerNickname: '소통창구', status: 'RECRUITING' },
    { projectId: 47, category: 'PROJECT', title: '개인 자산 관리 대시보드 (SaaS)', recruitCount: 3, currentCount: 1, endDate: '2026-12-05', onOffline: '온라인', techStacks: ['Next.js', 'Supabase', 'Chart.js'], content: '지출 내역을 시각화하고 목표 자산을 관리하는 웹 서비스입니다.', ownerNickname: '넥스트레벨', status: 'RECRUITING' },
    { projectId: 48, category: 'STUDY', title: 'AWS 솔루션 아키텍트 대비', recruitCount: 3, currentCount: 1, endDate: '2026-06-08', onOffline: '혼합', techStacks: ['AWS', 'Terraform'], content: 'AWS SAA 자격증 취득을 목표로 클라우드 아키텍처를 설계해봅니다.', ownerNickname: '인프라요정', status: 'RECRUITING' },
    { projectId: 49, category: 'PROJECT', title: '숏폼 영상 편집 및 공유 플랫폼', recruitCount: 5, currentCount: 2, endDate: '2026-09-30', onOffline: '온라인', techStacks: ['Flutter', 'Go', 'AWS'], content: '짧은 영상을 편집하고 업로드하는 모바일 중심 커뮤니티입니다.', ownerNickname: '앱개발자', status: 'RECRUITING' },
    { projectId: 50, category: 'STUDY', title: '리액트 쿼리(TanStack Query) 정복', recruitCount: 4, currentCount: 2, endDate: '2026-05-25', onOffline: '온라인', techStacks: ['TanStack Query', 'React'], content: '서버 상태 관리를 효율적으로 하는 법을 공식 문서로 공부합니다.', ownerNickname: '프론트깍이', status: 'RECRUITING' },
    { projectId: 51, category: 'PROJECT', title: '전자기기 중고 시세 알리미', recruitCount: 2, currentCount: 1, endDate: '2026-08-01', onOffline: '온라인', techStacks: ['Python', 'FastAPI', 'MongoDB'], content: '여러 중고 사이트를 크롤링해 원하는 가격이 되면 알림을 줍니다.', ownerNickname: '파이썬술사', status: 'RECRUITING' },
    { projectId: 52, category: 'STUDY', title: '파이썬 머신러닝 완벽 가이드', recruitCount: 6, currentCount: 2, endDate: '2026-06-20', onOffline: '온라인', techStacks: ['Scikit-learn', 'Pandas', 'NumPy'], content: '데이터 분석 기초부터 머신러닝 모델 구축까지 함께 진행합니다.', ownerNickname: '데이터사이언', status: 'RECRUITING' },
    { projectId: 53, category: 'PROJECT', title: '개발자 전용 커스텀 키보드 마켓', recruitCount: 4, currentCount: 1, endDate: '2026-10-15', onOffline: '혼합', techStacks: ['Svelte', 'Express', 'MariaDB'], content: '키보드 파츠를 조합해보고 구매할 수 있는 커머스 사이트입니다.', ownerNickname: '스벨트뉴비', status: 'RECRUITING' },
    { projectId: 54, category: 'STUDY', title: '깃허브 액션으로 CI/CD 구축하기', recruitCount: 3, currentCount: 1, endDate: '2026-07-10', onOffline: '온라인', techStacks: ['GitHub Actions', 'Docker'], content: '테스트부터 배포까지 전 과정을 자동화하는 파이프라인을 실습합니다.', ownerNickname: '데브옵스왕', status: 'RECRUITING' },
    { projectId: 55, category: 'PROJECT', title: '반려동물 산책 경로 기록 앱', recruitCount: 3, currentCount: 1, endDate: '2026-08-28', onOffline: '오프라인', techStacks: ['React Native', 'Google Maps'], content: '산책 경로를 지도에 그리고 일기 형식으로 저장하는 앱입니다.', ownerNickname: '앱개발자', status: 'RECRUITING' },
    { projectId: 56, category: 'STUDY', title: '코틀린 코루틴 & 비동기 프로그래밍', recruitCount: 4, currentCount: 1, endDate: '2026-06-05', onOffline: '온라인', techStacks: ['Kotlin', 'Spring'], content: '비동기 논블로킹 프로그래밍의 핵심인 코루틴을 깊게 파봅니다.', ownerNickname: '코틀린러버', status: 'RECRUITING' },
    { projectId: 57, category: 'PROJECT', title: '웹 기반 노션 클론 (실시간 편집)', recruitCount: 5, currentCount: 2, endDate: '2026-11-12', onOffline: '온라인', techStacks: ['Next.js', 'TipTap', 'Socket.io'], content: '블록 기반 에디터와 실시간 협업 기능을 구현하는 고난도 프로젝트.', ownerNickname: '넥스트레벨', status: 'RECRUITING' },
    { projectId: 58, category: 'STUDY', title: '주니어 PM을 위한 역량 강화', recruitCount: 5, currentCount: 2, endDate: '2026-05-30', onOffline: '혼합', techStacks: ['Jira', 'Confluence', 'Slack'], content: '요구사항 정의서 작성부터 일정 관리까지 PM 실무를 연습합니다.', ownerNickname: '기획마스터', status: 'RECRUITING' },
    { projectId: 59, category: 'PROJECT', title: '소규모 카페를 위한 키오스크 웹', recruitCount: 2, currentCount: 1, endDate: '2026-07-18', onOffline: '오프라인', techStacks: ['Vue.js', 'Node.js', 'SQLite'], content: '태블릿에서 바로 사용할 수 있는 간단하고 빠른 결제 웹앱입니다.', ownerNickname: '뷰전문가', status: 'RECRUITING' },
    { projectId: 60, category: 'STUDY', title: 'Rust 입문 - 기초 문법부터 WASM까지', recruitCount: 4, currentCount: 1, endDate: '2026-06-25', onOffline: '온라인', techStacks: ['Rust'], content: '메모리 안전성을 보장하는 Rust 언어의 특징을 함께 학습합니다.', ownerNickname: '최종보스', status: 'RECRUITING' }
  ];
};

const generateApplies = (users) => {
  const applies = [
    {
      applyId: 101, projectId: 2, userId: 2, projectTitle: '모던 자바스크립트 Deep Dive', 
      category: 'STUDY', position: 'BE', status: 'PENDING', appliedDate: '2026-04-01',
      ownerNickname: '프론트깍이', nickname: '백엔드장인', profileImageUrl: users[1].profileImageUrl,
      message: '안녕하세요! 잘 부탁드립니다.', contact: '010-1234-5678', link: ''
    },
    {
      applyId: 102, projectId: 2, userId: 3, projectTitle: '모던 자바스크립트 Deep Dive', 
      category: 'STUDY', position: 'DE', status: 'ACCEPTED', appliedDate: '2026-04-02',
      ownerNickname: '프론트깍이', nickname: '디자인천재', profileImageUrl: users[2].profileImageUrl,
      message: '디자이너로서 지원합니다!', contact: '010-1111-2222', link: ''
    },
    {
      applyId: 105, projectId: 6, userId: 1, projectTitle: '스프링 부트 핵심 원리 파악', 
      category: 'STUDY', position: 'FE', status: 'PENDING', appliedDate: '2026-04-02',
      ownerNickname: '백엔드장인', nickname: '프론트깍이', profileImageUrl: users[0].profileImageUrl,
      message: '열심히 하겠습니다!', contact: '010-1111-0001', link: ''
    },
    {
      applyId: 107, projectId: 11, userId: 2, projectTitle: '대학생 전용 캘린더 공유 서비스', 
      category: 'PROJECT', position: 'BE', status: 'ACCEPTED', appliedDate: '2026-04-01',
      ownerNickname: '네스트고수', nickname: '백엔드장인', profileImageUrl: users[1].profileImageUrl,
      message: '안녕하세요! 잘 부탁드립니다.', contact: '010-1234-5678', link: ''
    }
  ];
  return applies;
};

const generateBoardPosts = (users) => {
  return [
    {
      id: 100, projectId: 11, type: "NOTICE", title: "📢 프로젝트 시작 및 규칙 안내",
      content: "모두 반갑습니다! 우리 프로젝트의 핵심 규칙입니다.\n1. 매주 월요일 회의",
      author: '네스트고수', authorId: 18, authorImage: users[17].profileImageUrl,
      date: "2026.03.30", views: 15, isDeleted: false
    }
  ];
};

const initializeDB = () => {
  const users = generateUsers();
  const posts = generatePosts();
  const applies = generateApplies(users);
  const boardPosts = generateBoardPosts(users);
  const comments = [
    { id: 1, boardPostId: 100, author: '백엔드장인', authorId: 2, authorImage: users[1].profileImageUrl, content: "확인했습니다!", date: "2026.04.01 10:00", isDeleted: false }
  ];

  const initialDB = { users, posts, applies, boardPosts, comments, currentUser: users[0] };
  localStorage.setItem('mock-db', JSON.stringify(initialDB));
  localStorage.setItem('user-info', JSON.stringify(users[0]));
  return initialDB;
};

const getDB = () => {
  const data = localStorage.getItem('mock-db');
  if (!data) return initializeDB();
  return JSON.parse(data);
};

const saveDB = (db) => {
  localStorage.setItem('mock-db', JSON.stringify(db));
  if (db.currentUser) {
    localStorage.setItem('user-info', JSON.stringify(db.currentUser));
  }
};

let db = getDB();

export const handlers = [
  // 로그인 핸들러
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      db.currentUser = user;
      saveDB(db);
      return HttpResponse.json({ success: true, data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: user } });
    }
    return new HttpResponse(JSON.stringify({ success: false, error: { code: 'AUTH_001', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }), { status: 401 });
  }),

  // 로그아웃
  http.post('*/api/auth/logout', () => {
    db.currentUser = null;
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),

  // 닉네임 중복 확인
  http.get('*/api/users/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');
    const exists = db.users.some(u => u.nickname === nickname && u.userId !== db.currentUser?.userId);
    return HttpResponse.json({ success: true, data: { isAvailable: !exists } });
  }),

  // 마이페이지 정보 조회
  http.get('*/api/users/me', () => {
    if (!db.currentUser) return new HttpResponse(null, { status: 401 });
    const myPosts = db.posts.filter(p => p.ownerNickname === db.currentUser.nickname);
    const myApplies = db.applies.filter(a => a.userId === db.currentUser.userId);
    const acceptedProjects = db.applies.filter(a => a.userId === db.currentUser.userId && a.status === 'ACCEPTED').map(a => db.posts.find(p => p.projectId === a.projectId)).filter(Boolean);
    return HttpResponse.json({ success: true, data: { ...db.currentUser, postCount: myPosts.length, applyCount: myApplies.length, myPosts, applies: myApplies, acceptedProjects } });
  }),

  // 프로젝트 목록 조회
  http.get('*/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const keyword = url.searchParams.get('keyword')?.toLowerCase(); 
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = 15;
    let filteredPosts = [...db.posts];
    if (category && category !== '전체') {
      const categoryMap = { '프로젝트': 'PROJECT', '스터디': 'STUDY' };
      filteredPosts = filteredPosts.filter(p => p.category === (categoryMap[category] || category));
    }
    if (keyword) {
      filteredPosts = filteredPosts.filter(p => p.title.toLowerCase().includes(keyword) || p.content.toLowerCase().includes(keyword));
    }
    const totalElements = filteredPosts.length;
    const content = filteredPosts.slice(page * size, (page + 1) * size);
    return HttpResponse.json({ success: true, data: { content, page: { size, number: page, totalElements, totalPages: Math.ceil(totalElements / size) } } });
  }),

  // 프로젝트 상세 정보
  http.get('*/api/projects/:id', ({ params }) => {
    const post = db.posts.find(p => p.projectId === parseInt(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    const owner = db.users.find(u => u.nickname === post.ownerNickname);
    const members = db.applies.filter(a => a.projectId === post.projectId && a.status === 'ACCEPTED').map(a => {
      const u = db.users.find(user => user.userId === a.userId);
      return { nickname: u?.nickname, position: u?.position, role: 'MEMBER', userId: u?.userId, profileImageUrl: u?.profileImageUrl };
    });
    const ownerData = { nickname: owner?.nickname, position: owner?.position, userId: owner?.userId, role: 'OWNER', profileImageUrl: owner?.profileImageUrl };
    return HttpResponse.json({ success: true, data: { ...post, owner: ownerData, members: [ownerData, ...members] } });
  }),

  // 모집글 등록/수정/삭제
  http.post('*/api/projects', async ({ request }) => {
    const data = await request.json();
    const newId = Date.now();
    const newPost = { ...data, projectId: newId, status: 'RECRUITING', currentCount: 1, ownerNickname: db.currentUser.nickname, date: new Date().toISOString().split('T')[0] };
    db.posts.unshift(newPost);
    saveDB(db);
    return HttpResponse.json({ success: true, data: { projectId: newId } });
  }),
  http.patch('*/api/projects/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = db.posts.findIndex(p => p.projectId === parseInt(params.id));
    if (index !== -1) { db.posts[index] = { ...db.posts[index], ...data }; saveDB(db); return HttpResponse.json({ success: true, data: db.posts[index] }); }
    return new HttpResponse(null, { status: 404 });
  }),
  http.delete('*/api/projects/:id', ({ params }) => {
    db.posts = db.posts.filter(p => p.projectId !== parseInt(params.id));
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),
  http.patch('*/api/projects/:id/close', ({ params }) => {
    const post = db.posts.find(p => p.projectId === parseInt(params.id));
    if (post) { post.status = 'CLOSED'; saveDB(db); return HttpResponse.json({ success: true }); }
    return new HttpResponse(null, { status: 404 });
  }),
  http.patch('*/api/projects/:id/reopen', ({ params }) => {
    const post = db.posts.find(p => p.projectId === parseInt(params.id));
    if (post) { post.status = 'RECRUITING'; saveDB(db); return HttpResponse.json({ success: true }); }
    return new HttpResponse(null, { status: 404 });
  }),

  // 특정 모집글의 지원서 목록 조회
  http.get('*/api/projects/:projectId/applications', ({ params }) => {
    const projectApplies = db.applies.filter(a => a.projectId === parseInt(params.projectId));
    return HttpResponse.json({ success: true, data: projectApplies });
  }),

  // 지원하기/취소/상태변경
  http.post('*/api/applications', async ({ request }) => {
    const { postId, message } = await request.json();
    const project = db.posts.find(p => p.projectId === parseInt(postId));
    const newApply = { applyId: Date.now(), projectId: parseInt(postId), userId: db.currentUser.userId, projectTitle: project?.title, category: project?.category, position: 'FE', status: "PENDING", appliedDate: new Date().toISOString().split('T')[0], ownerNickname: project?.ownerNickname, message, nickname: db.currentUser.nickname, profileImageUrl: db.currentUser.profileImageUrl };
    db.applies.push(newApply);
    saveDB(db);
    return HttpResponse.json({ success: true, data: newApply });
  }),
  http.delete('*/api/applications/:id', ({ params }) => {
    db.applies = db.applies.filter(a => a.applyId !== parseInt(params.id));
    saveDB(db);
    return HttpResponse.json({ success: true });
  }),
  http.patch('*/api/applications/:id/status', async ({ params, request }) => {
    const { status } = await request.json();
    const apply = db.applies.find(a => a.applyId === parseInt(params.id));
    if (apply) {
      apply.status = status;
      if (status === 'ACCEPTED') {
        const post = db.posts.find(p => p.projectId === apply.projectId);
        if (post) post.currentCount += 1;
      }
      saveDB(db);
      return HttpResponse.json({ success: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 팀 게시판/게시글/댓글 (생략 없이 모두 포함)
  http.get('*/api/posts/:projectId/board', ({ params }) => {
    const boardPosts = db.boardPosts.filter(p => p.projectId === parseInt(params.projectId) && !p.isDeleted);
    return HttpResponse.json({ success: true, data: { content: boardPosts, page: { number: 0, size: 10, totalElements: boardPosts.length, totalPages: 1 } } });
  }),
  http.get('*/api/posts/:projectId/board/:boardPostId', ({ params }) => {
    const post = db.boardPosts.find(p => p.id === parseInt(params.boardPostId) && !p.isDeleted);
    if (post) { post.views += 1; saveDB(db); return HttpResponse.json({ success: true, data: post }); }
    return new HttpResponse(null, { status: 404 });
  }),
  http.post('*/api/posts/:projectId/board', async ({ params, request }) => {
    const data = await request.json();
    const newPost = { id: Date.now(), projectId: parseInt(params.projectId), ...data, author: db.currentUser.nickname, authorId: db.currentUser.userId, authorImage: db.currentUser.profileImageUrl, date: new Date().toLocaleDateString(), views: 0, isDeleted: false };
    db.boardPosts.push(newPost);
    saveDB(db);
    return HttpResponse.json({ success: true, data: newPost });
  }),
  http.put('*/api/board-posts/:boardPostId', async ({ params, request }) => {
    const data = await request.json();
    const index = db.boardPosts.findIndex(p => p.id === parseInt(params.boardPostId));
    if (index !== -1) { db.boardPosts[index] = { ...db.boardPosts[index], ...data }; saveDB(db); return HttpResponse.json({ success: true, data: db.boardPosts[index] }); }
    return new HttpResponse(null, { status: 404 });
  }),
  http.delete('*/api/board-posts/:boardPostId', ({ params }) => {
    const post = db.boardPosts.find(p => p.id === parseInt(params.boardPostId));
    if (post) { post.isDeleted = true; db.comments = db.comments.map(c => c.boardPostId === post.id ? { ...c, isDeleted: true } : c); saveDB(db); return HttpResponse.json({ success: true }); }
    return new HttpResponse(null, { status: 404 });
  }),
  http.get('*/api/posts/:projectId/board/:boardPostId/comments', ({ params }) => {
    const comments = db.comments.filter(c => c.boardPostId === parseInt(params.boardPostId) && !c.isDeleted);
    return HttpResponse.json({ success: true, data: comments });
  }),
  http.post('*/api/posts/:projectId/board/:boardPostId/comments', async ({ params, request }) => {
    const { content } = await request.json();
    const newComment = { id: Date.now(), boardPostId: parseInt(params.boardPostId), author: db.currentUser.nickname, authorId: db.currentUser.userId, authorImage: db.currentUser.profileImageUrl, content, date: new Date().toLocaleString(), isDeleted: false };
    db.comments.push(newComment);
    saveDB(db);
    return HttpResponse.json({ success: true, data: newComment });
  }),
  http.patch('*/api/comments/:commentId', async ({ params, request }) => {
    const { content } = await request.json();
    const index = db.comments.findIndex(c => c.id === parseInt(params.commentId));
    if (index !== -1) { db.comments[index] = { ...db.comments[index], content, date: new Date().toLocaleString() + " (수정됨)" }; saveDB(db); return HttpResponse.json({ success: true, data: db.comments[index] }); }
    return new HttpResponse(null, { status: 404 });
  }),
  http.delete('*/api/comments/:commentId', ({ params }) => {
    const comment = db.comments.find(c => c.id === parseInt(params.commentId));
    if (comment) { comment.isDeleted = true; saveDB(db); return HttpResponse.json({ success: true }); }
    return new HttpResponse(null, { status: 404 });
  }),

  // 유저 정보/이미지 관리
  http.put('*/api/users/me', async ({ request }) => {
    const data = await request.json();
    const old = db.currentUser.nickname;
    db.currentUser = { ...db.currentUser, ...data };
    const idx = db.users.findIndex(u => u.userId === db.currentUser.userId);
    if (idx !== -1) db.users[idx] = db.currentUser;
    if (data.nickname && old !== data.nickname) {
      db.posts = db.posts.map(p => p.ownerNickname === old ? { ...p, ownerNickname: data.nickname } : p);
      db.applies = db.applies.map(a => { let u = { ...a }; if (a.nickname === old) u.nickname = data.nickname; if (a.ownerNickname === old) u.ownerNickname = data.nickname; return u; });
    }
    saveDB(db);
    const myPosts = db.posts.filter(p => p.ownerNickname === db.currentUser.nickname);
    const myApplies = db.applies.filter(a => a.userId === db.currentUser.userId);
    const accepted = db.applies.filter(a => a.userId === db.currentUser.userId && a.status === 'ACCEPTED').map(a => db.posts.find(p => p.projectId === a.projectId)).filter(Boolean);
    return HttpResponse.json({ success: true, data: { ...db.currentUser, myPosts, applies: myApplies, acceptedProjects: accepted } });
  }),
  http.patch('*/api/users/profile-image', async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('profileImage');
      if (!file) console.warn("Mock: No file");
      const newUrl = `https://i.pravatar.cc/150?u=user${db.currentUser.userId}&t=${Date.now()}`;
      db.currentUser.profileImageUrl = newUrl;
      const idx = db.users.findIndex(u => u.userId === db.currentUser.userId);
      if (idx !== -1) db.users[idx].profileImageUrl = newUrl;
      saveDB(db);
      return HttpResponse.json({ success: true, data: { profileImageUrl: newUrl } });
    } catch (error) { console.error(error); return new HttpResponse(null, { status: 500 }); }
  }),
  http.delete('*/api/users/profile-image', () => {
    db.currentUser.profileImageUrl = null;
    const idx = db.users.findIndex(u => u.userId === db.currentUser.userId);
    if (idx !== -1) db.users[idx].profileImageUrl = null;
    saveDB(db);
    return HttpResponse.json({ success: true, data: { profileImageUrl: null } });
  }),
];