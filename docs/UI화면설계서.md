# UI 화면 설계서

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | Mate |
| **작성자** | 박진아, 김현석A |
| **작성일** | 2026-03-27 |
| **버전** | v1.0 |
| **검토자** | 팀 전체 |

---

## 1. 사이트맵

### 1.1 전체 페이지 목록

| No | 화면명 | URL 경로 | 권한 | 화면 타입 |
| --- | --- | --- | --- | --- |
| 1 | 메인 페이지 (모집글 목록) | `/` | 공개 | 목록 |
| 2 | 모집글 상세 페이지 | `/posts/:id` | 공개 (지원은 로그인 필요) | 상세 |
| 3 | 로그인 페이지 | `/login` | 공개 | 입력 |
| 4 | 회원가입 페이지 | `/register` | 공개 | 입력 |
| 5 | 모집글 작성 페이지 | `/posts/new`  | 로그인 필요 | 입력 |
| 6 | 모집글 관리 페이지 | `/posts/:id/edit`  | 로그인 필요 (글 작성자) | 입력 |
| 7 | 팀 전용 게시판 | `/posts/:id/board` | 로그인 필요 (팀 가입자) | 입력 |
| 8 | 마이페이지 | `/mypage` | 로그인 필요 | 상세/수정 |
| 9 | 내 모집 내역 | `/mypage/posts` | 로그인 필요 | 목록 |
| 10 | 내 지원 내역 | `/mypage/applies` | 로그인 필요 | 목록 |
| 11 | 관리자 페이지 | `/admin` | ADMIN 전용 | 대시보드 |
| 12 | 게시글 관리 | `/admin/posts` | ADMIN 전용 | 목록 |
| 13 | 사용자 관리 | `/admin/users`  | ADMIN 전용 | 목록 |
| 14 | 에러 안내 페이지 | `*`  | 공개 | 안내 |
| 15 | 아이디 찾기 페이지  | /find-email | 공개 | 입력 |
| 16 | 비밀번호 찾기 페이지 | /find-password | 공개 | 입력 |

### 1.2 권한별 접근 정책

| 권한 레벨 | 접근 가능 화면 | 비고 |
| --- | --- | --- |
| **공개(비로그인)** | 메인, 모집글 상세, 로그인, 회원가입 | 모집글 조회만 가능, 지원/작성 불가 |
| **로그인(USER)** | 공개 + 모집글 작성, 마이페이지, 지원하기 | JWT 토큰 보유 |
| **관리자(ADMIN)** | 전체 + 관리자 전용 페이지 | `/admin/**` Thymeleaf 별도 운영 |

---

## 2. 전체 레이아웃 구조

### 2.1 공통 레이아웃 (일반 사용자)

```markup
┌──────────────────────────────────────────────────────────────────────────────┐
│ MATE  [프로젝트 찾기] [모집글 쓰기]                   { [로그인] [회원가입] }   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│                            ( Main Content Area )                             │
│                                                                              │
│                      각 페이지의 상세 내용이 들어갑니다                        │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                       ⓒ 2026 Mate. All rights reserved.                     │
└──────────────────────────────────────────────────────────────────────────────┘

```

### 2.2 공통 컴포넌트 목록

| 컴포넌트명 | 위치 | 역할 | 항상 표시 |
| --- | --- | --- | --- |
| `Header` | 상단 | 로고, 네비게이션, 로그인 상태에 따른 동적 메뉴 | 예 |
| `Footer` | 하단 | 저작권 표시 | 예 |
| `LoadingSpinner` | 콘텐츠 영역 | 데이터 로딩 중 표시 | 상황별 |
| `Pagination` | 목록 하단 | 페이지 이동 | 목록 화면 |
| `PostCard` | 목록 화면 | 모집글 카드 (재사용 컴포넌트) | 목록 화면 |
| `TagBadge` | 카드/상세 | 기술 스택 태그 표시 | 상황별 |
| `ToastMessage` | 전역 | 성공/실패 알림 메시지 | 상황별 |

---

## 3. 화면별 상세 설계

---

### 화면 ID: SCR-001 — 메인 페이지 (모집글 목록)

### 3.1.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 메인 페이지 (모집글 목록) |
| **URL** | `/` |
| **화면 타입** | 목록 |
| **권한 레벨** | 공개 |
| **주요 기능** | 모집글 목록 조회, 카테고리/태그 필터링, 정렬(최신순/마감임박순), 키워드 검색, 페이지네이션 |
| **연결 API** | `GET /api/posts?keyword=&category=&tag=&sort=latest&page=0&size=10` |

### 3.1.2 와이어프레임 (ASCII)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ MATE   [프로젝트 찾기]  [모집글 쓰기]    { [로그인] [회원가입] }  or  { [마이페이지] } │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│                 🔥 새로운 프로젝트가 당신을 기다리고 있습니다                     │
│                                                                                │
│                        나와 딱 맞는 메이트를 찾으세요                          │
│                     최신 기술 스택을 기반으로 함께 성장할                      │
│                    나만의 크리에이티브 팀을 시작해 보세요.                     │
│                                                                                │
│            ┌──────────────────────────────────────────────┐  ┌──────┐          │
│            │  🔍  스택(React, Spring...) 또는 프로젝트 검색  │  │ 검색 │          │
│            └──────────────────────────────────────────────┘  └──────┘          │
│                                                                                │
│      [전체▶] [스터디] [프로젝트] [React] [Spring] [알고리즘] [Infosec] [디자인]      │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│  🚀 최신 모집글                                                 전체 보기 →      │
│                                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ 3/5 Joiners    [D-7] │  │ 1/3 Joiners    [D-3] │  │ 2/4 Joiners   [D-14] │  │
│  │             [모집중] │  │           [마감임박] │  │             [모집중] │  │
│  │                      │  │                      │  │                      │  │
│  │ 대학생 팀플 메이커   │  │ AI 기반 주식 추천    │  │ 프로젝트 관리 툴     │  │
│  │ 토이 프로젝트        │  │ 알고리즘 스터디      │  │ 'MATE' 개발 팀원     │  │
│  │                      │  │                      │  │                      │  │
│  │ #React #Spring #Figma│  │ #Python #Scikit-learn│  │ #React #Redux #MUI   │  │
│  │ ──────────────────── │  │ ──────────────────── │  │ ──────────────────── │  │
│  │ 👤 김민준   ~ 04.10  │  │ 👤 이도현   ~ 04.01  │  │ 👤 박지민   ~ 04.15  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ 4/6 Joiners    [D-9] │  │ 2/4 Joiners   [D-21] │  │ 3/4 Joiners    [D-5] │  │
│  │             [모집중] │  │             [모집중] │  │           [마감임박] │  │
│  │                      │  │                      │  │                      │  │
│  │ 코딩테스트 대비      │  │ Spring Security      │  │ UI/UX 포트폴리오     │  │
│  │ 알고리즘 스터디      │  │ + JWT 완전 정복      │  │ 피드백 스터디        │  │
│  │                      │  │                      │  │                      │  │
│  │ #알고리즘 #Java #Py  │  │ #Spring #Java #JWT   │  │ #Figma #UI/UX        │  │
│  │ ──────────────────── │  │ ──────────────────── │  │ ──────────────────── │  │
│  │ 👤 최성수   ~ 04.08  │  │ 👤 강해린   ~ 04.20  │  │ 👤 정윤아   ~ 04.03  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│      📊 MATE 현황 :  [ 1,240+ 모집중 ]  [ 8,500+ 회원 ]  [ 3,200+ 매칭완료 ]       │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ✨ 어떻게 사용하나요?                                                           │
│                                                                                │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │
│  │ [01] 탐색하기       │  │ [02] 지원하기       │  │ [03] 협업하기       │  │
│  │                    │  │                    │  │                    │  │
│  │ 원하는 기술 스택과  │  │ 마음에 드는 프로젝트│  │ 팀원들과 일정을     │  │
│  │ 카테고리 필터로     │  │ 에 지원 메시지를    │  │ 공유하고 프로젝트를 │  │
│  │ 팀원을 찾으세요     │  │ 보내고 승인받으세요 │  │ 멋지게 완성하세요   │  │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘  │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│  Footer: ⓒ 2026 MATE. Connecting Creative Mates.             [Terms] [Privacy] │
└────────────────────────────────────────────────────────────────────────────────┘
```

![image.png](image.png)

- html 코드
    
    ```jsx
    <!DOCTYPE html>
    <html lang="ko">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mate — 나와 딱 맞는 스터디/팀원을 찾아보세요</title>
    <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
      :root {
        --bg: #EEF2F8;
        --surface: #ffffff;
        --primary: #6C63FF;
        --primary-light: #8B85FF;
        --primary-soft: #EDE9FF;
        --accent: #FF6B9D;
        --text-primary: #1A1A2E;
        --text-secondary: #6B7280;
        --text-muted: #9CA3AF;
        --border: #E5E7EB;
        --card-bg: #ffffff;
        --radius: 16px;
        --radius-sm: 10px;
        --radius-pill: 99px;
      }
    
      body {
        font-family: 'Pretendard', -apple-system, sans-serif;
        background: var(--bg);
        color: var(--text-primary);
        min-height: 100vh;
        overflow-x: hidden;
      }
    
      /* NAV */
      nav {
        position: fixed; top: 0; left: 0; right: 0; z-index: 100;
        display: flex; align-items: center; padding: 0 40px;
        height: 60px;
        background: rgba(238,242,248,0.85);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(255,255,255,0.6);
      }
      .nav-logo {
        font-size: 20px; font-weight: 700; color: var(--primary);
        letter-spacing: -0.5px; margin-right: 48px;
      }
      .nav-links { display: flex; gap: 32px; margin-right: auto; }
      .nav-links a {
        font-size: 14px; font-weight: 500; color: var(--text-secondary);
        text-decoration: none; transition: color .2s;
      }
      .nav-links a:hover { color: var(--text-primary); }
      .nav-right { display: flex; gap: 12px; align-items: center; }
      .btn-ghost {
        font-size: 14px; font-weight: 500; color: var(--text-secondary);
        background: none; border: none; cursor: pointer; padding: 6px 12px;
        border-radius: var(--radius-pill); transition: background .2s;
      }
      .btn-ghost:hover { background: rgba(0,0,0,0.05); }
      .btn-primary {
        font-size: 14px; font-weight: 600; color: #fff;
        background: var(--primary); border: none; cursor: pointer;
        padding: 8px 20px; border-radius: var(--radius-pill);
        transition: transform .15s, box-shadow .15s;
        box-shadow: 0 4px 14px rgba(108,99,255,0.35);
      }
      .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,0.45); }
    
      /* HERO */
      .hero {
        min-height: 100vh;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 80px 40px 60px;
        position: relative; overflow: hidden;
      }
      .hero::before {
        content: '';
        position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
        width: 800px; height: 800px; border-radius: 50%;
        background: radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%);
        pointer-events: none;
      }
      .hero-eyebrow {
        display: flex; align-items: center; gap: 8px;
        background: var(--primary-soft); color: var(--primary);
        font-size: 13px; font-weight: 600; padding: 6px 14px;
        border-radius: var(--radius-pill); margin-bottom: 28px;
        animation: fadeUp .6s ease both;
      }
      .hero-eyebrow span { font-size: 16px; }
      .hero-title {
        font-size: clamp(36px, 5vw, 60px); font-weight: 700;
        line-height: 1.2; text-align: center; letter-spacing: -1.5px;
        margin-bottom: 20px; color: var(--text-primary);
        animation: fadeUp .6s .1s ease both;
      }
      .hero-title em { font-style: normal; color: var(--primary); }
      .hero-title .accent { color: var(--accent); }
      .hero-sub {
        font-size: 16px; font-weight: 400; color: var(--text-secondary);
        text-align: center; line-height: 1.7; margin-bottom: 36px;
        animation: fadeUp .6s .2s ease both;
      }
    
      /* SEARCH */
      .search-wrap {
        width: 100%; max-width: 560px; margin-bottom: 48px;
        animation: fadeUp .6s .3s ease both;
      }
      .search-box {
        display: flex; align-items: center; gap: 12px;
        background: var(--surface); border-radius: var(--radius-pill);
        padding: 8px 8px 8px 20px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(108,99,255,0.1);
      }
      .search-icon { color: var(--text-muted); font-size: 16px; flex-shrink: 0; }
      .search-box input {
        flex: 1; border: none; outline: none; background: none;
        font-family: inherit; font-size: 15px; color: var(--text-primary);
      }
      .search-box input::placeholder { color: var(--text-muted); }
      .search-btn {
        background: var(--primary); color: #fff; border: none; cursor: pointer;
        padding: 10px 22px; border-radius: var(--radius-pill);
        font-size: 14px; font-weight: 600; font-family: inherit;
        transition: transform .15s, box-shadow .15s;
        white-space: nowrap;
        box-shadow: 0 2px 10px rgba(108,99,255,0.3);
      }
      .search-btn:hover { transform: translateY(-1px); }
    
      /* FILTER PILLS */
      .filter-pills {
        display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
        margin-bottom: 60px;
        animation: fadeUp .6s .35s ease both;
      }
      .pill {
        font-size: 13px; font-weight: 500; padding: 6px 16px;
        border-radius: var(--radius-pill); cursor: pointer;
        border: 1.5px solid var(--border); background: var(--surface);
        color: var(--text-secondary); transition: all .15s;
      }
      .pill:hover { border-color: var(--primary); color: var(--primary); }
      .pill.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    
      /* SECTION */
      .section {
        padding: 0 40px 80px;
        animation: fadeUp .6s .4s ease both;
      }
      .section-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 28px;
      }
      .section-title {
        font-size: 20px; font-weight: 700; color: var(--text-primary);
        display: flex; align-items: center; gap: 8px;
      }
      .section-more {
        font-size: 13px; font-weight: 500; color: var(--text-secondary);
        text-decoration: none; display: flex; align-items: center; gap: 4px;
        transition: color .15s;
      }
      .section-more:hover { color: var(--primary); }
    
      /* CARDS GRID */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
    
      /* POST CARD */
      .post-card {
        background: var(--card-bg); border-radius: var(--radius);
        padding: 24px; cursor: pointer;
        border: 1px solid rgba(0,0,0,0.06);
        transition: transform .2s, box-shadow .2s;
        position: relative; overflow: hidden;
      }
      .post-card::after {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, var(--primary), var(--accent));
        opacity: 0; transition: opacity .2s;
      }
      .post-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
      .post-card:hover::after { opacity: 1; }
    
      .card-top {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 14px;
      }
      .card-meta { font-size: 12px; color: var(--text-muted); font-weight: 500; }
      .card-status {
        font-size: 11px; font-weight: 600; padding: 3px 10px;
        border-radius: var(--radius-pill);
      }
      .status-open { background: #DCFCE7; color: #166534; }
      .status-urgent { background: #FEF3C7; color: #92400E; }
      .status-closed { background: #F3F4F6; color: #6B7280; }
    
      .card-title {
        font-size: 16px; font-weight: 700; color: var(--text-primary);
        line-height: 1.4; margin-bottom: 8px; letter-spacing: -0.3px;
      }
      .card-desc {
        font-size: 13px; color: var(--text-secondary); line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
      .tag {
        font-size: 11px; font-weight: 600; padding: 4px 10px;
        border-radius: var(--radius-pill); background: var(--primary-soft);
        color: var(--primary);
      }
      .tag.stack { background: #F0FDF4; color: #166534; }
      .tag.design { background: #FFF7ED; color: #C2410C; }
    
      .card-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding-top: 14px; border-top: 1px solid var(--border);
      }
      .card-members { display: flex; align-items: center; gap: 6px; }
      .avatar-stack { display: flex; }
      .avatar {
        width: 24px; height: 24px; border-radius: 50%;
        border: 2px solid var(--surface);
        margin-left: -6px; font-size: 10px; font-weight: 700;
        display: flex; align-items: center; justify-content: center; color: #fff;
      }
      .avatar:first-child { margin-left: 0; }
      .av1 { background: #6C63FF; }
      .av2 { background: #FF6B9D; }
      .av3 { background: #34D399; }
      .members-text { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
      .card-deadline { font-size: 12px; color: var(--text-muted); font-weight: 500; }
    
      /* STATS BANNER */
      .stats-banner {
        background: var(--primary);
        border-radius: var(--radius);
        padding: 32px 40px;
        margin: 0 40px 60px;
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 20px; text-align: center;
        position: relative; overflow: hidden;
      }
      .stats-banner::before {
        content: '';
        position: absolute; top: -40px; right: -40px;
        width: 200px; height: 200px; border-radius: 50%;
        background: rgba(255,255,255,0.06);
      }
      .stat-item { position: relative; z-index: 1; }
      .stat-num { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
      .stat-label { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 4px; }
    
      /* HOW IT WORKS */
      .how-section {
        padding: 0 40px 80px;
      }
      .how-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 20px; margin-top: 28px;
      }
      .how-card {
        background: var(--surface); border-radius: var(--radius);
        padding: 28px 24px;
        border: 1px solid rgba(0,0,0,0.06);
      }
      .how-num {
        width: 36px; height: 36px; border-radius: var(--radius-sm);
        background: var(--primary-soft); color: var(--primary);
        font-size: 15px; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 16px;
      }
      .how-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
      .how-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    
      /* ANIMATIONS */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    
      /* RESPONSIVE */
      @media (max-width: 768px) {
        nav { padding: 0 20px; }
        .hero { padding: 80px 20px 40px; }
        .section { padding: 0 20px 60px; }
        .stats-banner { margin: 0 20px 40px; grid-template-columns: 1fr; padding: 24px; }
        .how-grid { grid-template-columns: 1fr; }
        .how-section { padding: 0 20px 60px; }
        .cards-grid { grid-template-columns: 1fr; }
      }
    </style>
    </head>
    <body>
    
    <!-- NAV -->
    <nav>
      <div class="nav-logo">mate</div>
      <div class="nav-links">
        <a href="#">Explore</a>
        <a href="#">Post</a>
        <a href="#">Community</a>
      </div>
      <div class="nav-right">
        <button class="btn-ghost">로그인</button>
        <button class="btn-primary">Get Started</button>
      </div>
    </nav>
    
    <!-- HERO -->
    <section class="hero">
      <div class="hero-eyebrow"><span>🔥</span> 새로운 프로젝트가 시작을 기다립니다</div>
      <h1 class="hero-title">
        나와 딱 맞는<br>
        <em>크리에이티브</em> <span class="accent">메이트</span>를 찾으세요
      </h1>
      <p class="hero-sub">
        가장 현대적인 기술 스택을 기반으로<br>
        함께 세상을 바꿀 프로젝트를 시작해보세요.
      </p>
    
      <div class="search-wrap">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="스택(React, Spring...) 또는 프로젝트 검색">
          <button class="search-btn">검색</button>
        </div>
      </div>
    
      <div class="filter-pills">
        <div class="pill active">전체</div>
        <div class="pill">스터디</div>
        <div class="pill">프로젝트</div>
        <div class="pill">React</div>
        <div class="pill">Spring</div>
        <div class="pill">알고리즘</div>
        <div class="pill">디자인</div>
      </div>
    </section>
    
    <!-- CARDS SECTION -->
    <section class="section">
      <div class="section-header">
        <div class="section-title">🚀 최신 모집글</div>
        <a href="#" class="section-more">전체 보기 →</a>
      </div>
      <div class="cards-grid">
    
        <div class="post-card">
          <div class="card-top">
            <div class="card-meta">3/5 Joiners &nbsp;&nbsp; D-7</div>
            <span class="card-status status-open">모집중</span>
          </div>
          <div class="card-title">대학생 팀플 메이커 플랫폼 토이 프로젝트</div>
          <div class="card-desc">기획부터 개발까지 함께할 팀원을 모집합니다. 포트폴리오에 활용 가능한 실제 서비스 개발!</div>
          <div class="card-tags">
            <span class="tag">React</span>
            <span class="tag stack">Spring Boot</span>
            <span class="tag design">Figma</span>
          </div>
          <div class="card-footer">
            <div class="card-members">
              <div class="avatar-stack">
                <div class="avatar av1">A</div>
                <div class="avatar av2">B</div>
                <div class="avatar av3">C</div>
              </div>
              <span class="members-text">3명 참여중</span>
            </div>
            <span class="card-deadline">~ 04.10</span>
          </div>
        </div>
    
        <div class="post-card">
          <div class="card-top">
            <div class="card-meta">1/5 Joiners &nbsp;&nbsp; D-3</div>
            <span class="card-status status-urgent">마감임박</span>
          </div>
          <div class="card-title">AI 기반 주식 추천 스터디원 모집</div>
          <div class="card-desc">Python과 머신러닝을 활용한 주식 데이터 분석 프로젝트. 매주 화목 온라인 진행.</div>
          <div class="card-tags">
            <span class="tag stack">Python</span>
            <span class="tag stack">Scikit-learn</span>
          </div>
          <div class="card-footer">
            <div class="card-members">
              <div class="avatar-stack">
                <div class="avatar av2">D</div>
              </div>
              <span class="members-text">1명 참여중</span>
            </div>
            <span class="card-deadline">~ 04.01</span>
          </div>
        </div>
    
        <div class="post-card">
          <div class="card-top">
            <div class="card-meta">2/4 Joiners &nbsp;&nbsp; D-14</div>
            <span class="card-status status-open">모집중</span>
          </div>
          <div class="card-title">개발 프로젝트 관리 툴 (Mate) 개발 팀원</div>
          <div class="card-desc">지금 이 서비스를 함께 만들 팀원을 모집합니다. React + Spring 풀스택 경험 환영!</div>
          <div class="card-tags">
            <span class="tag">React</span>
            <span class="tag stack">Redux</span>
            <span class="tag stack">MUI</span>
          </div>
          <div class="card-footer">
            <div class="card-members">
              <div class="avatar-stack">
                <div class="avatar av1">E</div>
                <div class="avatar av3">F</div>
              </div>
              <span class="members-text">2명 참여중</span>
            </div>
            <span class="card-deadline">~ 04.15</span>
          </div>
        </div>
    
        <div class="post-card">
          <div class="card-top">
            <div class="card-meta">4/6 Joiners &nbsp;&nbsp; D-9</div>
            <span class="card-status status-open">모집중</span>
          </div>
          <div class="card-title">코딩테스트 대비 알고리즘 스터디</div>
          <div class="card-desc">카카오/네이버 대비 주 3회 백준 & 프로그래머스 풀이. 현재 Silver 이상 환영.</div>
          <div class="card-tags">
            <span class="tag">알고리즘</span>
            <span class="tag stack">Java</span>
            <span class="tag stack">Python</span>
          </div>
          <div class="card-footer">
            <div class="card-members">
              <div class="avatar-stack">
                <div class="avatar av1">G</div>
                <div class="avatar av2">H</div>
                <div class="avatar av3">I</div>
              </div>
              <span class="members-text">4명 참여중</span>
            </div>
            <span class="card-deadline">~ 04.08</span>
          </div>
        </div>
    
        <div class="post-card">
          <div class="card-top">
            <div class="card-meta">2/4 Joiners &nbsp;&nbsp; D-21</div>
            <span class="card-status status-open">모집중</span>
          </div>
          <div class="card-title">Spring Security + JWT 완전 정복 스터디</div>
          <div class="card-desc">보안 개념부터 실제 프로젝트 적용까지. JPA + Spring Boot 기초 있으면 누구든 환영.</div>
          <div class="card-tags">
            <span class="tag stack">Spring</span>
            <span class="tag stack">Java</span>
            <span class="tag">JWT</span>
          </div>
          <div class="card-footer">
            <div class="card-members">
              <div class="avatar-stack">
                <div class="avatar av3">J</div>
                <div class="avatar av1">K</div>
              </div>
              <span class="members-text">2명 참여중</span>
            </div>
            <span class="card-deadline">~ 04.20</span>
          </div>
        </div>
    
        <div class="post-card">
          <div class="card-top">
            <div class="card-meta">3/4 Joiners &nbsp;&nbsp; D-5</div>
            <span class="card-status status-urgent">마감임박</span>
          </div>
          <div class="card-title">UI/UX 포트폴리오 피드백 스터디</div>
          <div class="card-desc">Figma로 실제 서비스 리디자인 후 팀원 피드백. 디자이너 & 개발자 모두 환영합니다.</div>
          <div class="card-tags">
            <span class="tag design">Figma</span>
            <span class="tag design">UI/UX</span>
          </div>
          <div class="card-footer">
            <div class="card-members">
              <div class="avatar-stack">
                <div class="avatar av2">L</div>
                <div class="avatar av1">M</div>
                <div class="avatar av3">N</div>
              </div>
              <span class="members-text">3명 참여중</span>
            </div>
            <span class="card-deadline">~ 04.03</span>
          </div>
        </div>
    
      </div>
    </section>
    
    <!-- STATS -->
    <div class="stats-banner">
      <div class="stat-item">
        <div class="stat-num">1,240+</div>
        <div class="stat-label">활성 모집글</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">8,500+</div>
        <div class="stat-label">가입 회원</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">3,200+</div>
        <div class="stat-label">성사된 매칭</div>
      </div>
    </div>
    
    <!-- HOW IT WORKS -->
    <section class="how-section">
      <div class="section-header">
        <div class="section-title">✨ 어떻게 사용하나요?</div>
      </div>
      <div class="how-grid">
        <div class="how-card">
          <div class="how-num">01</div>
          <div class="how-title">스터디 / 프로젝트 탐색</div>
          <div class="how-desc">기술 스택, 카테고리, 인원 등 다양한 필터로 나에게 맞는 모집글을 빠르게 찾아보세요.</div>
        </div>
        <div class="how-card">
          <div class="how-num">02</div>
          <div class="how-title">지원하고 매칭받기</div>
          <div class="how-desc">마음에 드는 모집글에 지원하면 방장의 승인 후 팀에 합류할 수 있어요.</div>
        </div>
        <div class="how-card">
          <div class="how-num">03</div>
          <div class="how-title">함께 성장하기</div>
          <div class="how-desc">팀원들과 일정을 공유하고, 프로젝트를 완성해 포트폴리오를 만들어보세요.</div>
        </div>
      </div>
    </section>
    
    <script>
      document.querySelectorAll('.pill').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
          p.classList.add('active');
        });
      });
    </script>
    </body>
    </html>
    ```
    
    [https://codepen.io/qhorcrzk-the-looper/pen/wBzpRmw](https://codepen.io/qhorcrzk-the-looper/pen/wBzpRmw)
    

### 3.1.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 검색 입력창 | `SearchBar` | `TextField` (MUI) | Enter 또는 버튼으로 검색 |
| 카테고리 필터 | `CategoryFilter` | `Button` (MUI) | 전체/스터디/프로젝트 |
| 태그 필터 | `TagFilter` | `Chip` (MUI) | 기술 스택 태그 선택 |
| 정렬 드롭다운 | `SortSelect` | `Select` (MUI) | 최신순/마감임박순 |
| 모집글 카드 | `PostCard` | `Card` (MUI) | 재사용 컴포넌트 |
| 페이지네이션 | `Pagination` | `Pagination` (MUI) | 페이지 이동 |

### 3.1.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **로딩 중** | 카드 Skeleton UI 표시 | API 호출 시작 |
| **데이터 있음** | 모집글 카드 그리드 정상 표시 | API 성공, 데이터 1건 이상 |
| **데이터 없음** | "검색 결과가 없습니다" 안내 문구 | API 성공, 데이터 0건 |
| **에러** | "오류가 발생했습니다. 다시 시도해주세요." | API 실패 |

### 3.1.5 사용자 인터랙션 흐름

```
[검색어 입력 + 엔터]
    → fetchPosts({ keyword, category, tag, sort, page: 0 })
    → API: GET /api/posts?keyword=React&page=0
    → 카드 목록 갱신

[카테고리 필터 클릭]
    → category 상태 변경 → fetchPosts 재호출
    → 선택된 필터 버튼 강조 표시

[정렬 변경]
    → sort 상태 변경 → fetchPosts 재호출

[모집글 카드 클릭]
    → /posts/:id 상세 페이지 이동
```

---

### 화면 ID: SCR-002 — 모집글 상세 페이지

### 3.2.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 모집글 상세 페이지 |
| **URL** | `/posts/:id` |
| **화면 타입** | [x] 상세 |
| **권한 레벨** | [x] 공개 (지원하기/댓글 작성은 로그인 필요) |
| **주요 기능** | 모집글 상세 조회, 지원하기/취소, 댓글 작성/수정/삭제, 현재 멤버 확인 |
| **연결 API** | `GET /api/posts/:id`, `POST /api/applications`, `GET /api/posts/:id/comments`, `POST /api/posts/:id/comments` |

### 3.2.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  MATE   [프로젝트 찾기]  [모집글 쓰기]    { [로그인] [회원가입] }  or  { [마이페이지] } │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  홈 > 프로젝트 탐색 > 상세 보기                                                       │
│                                                                                      │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────┐            │
│  │                                          │  │      현재 모집 현황     │            │
│  │  [스터디]  ● 모집중             [D-3]     │  │                        │            │
│  │                                          │  │        1 / 3 명        │            │
│  │  AI 기반 주식 추천 알고리즘              │  │   [▣▣▣▢▢▢▢▢▢▢]  │            │
│  │  스터디원 모집합니다 📈                  │  │   (current/recruit)     │           │
│  │                                          │  ├────────────────────────┤            │
│  │  👤 김민준(BE) | 2026.03.30              │  │  카테고리     스터디    │            │
│  │                                          │  │  진행 방식     온라인   │            │
│  │  [Java] [Spring Boot] [React]            │  │  모집 마감     04.10    │           │
│  │                                          │  │                        │            │
│  ├──────────────────────────────────────────┤  │     [ 🚀 지원하기 ]     │           │
│  │                                          │  ├────────────────────────┤            │
│  │  ▌ 프로젝트 소개                         │  │        방장 정보       │             │
│  │                                          │  │                        │            │
│  │  안녕하세요! Python과 머신러닝을 활용해   │  │  👤 김민준             │            │
│  │  주식 시장 데이터를 분석하고 간단한       │  │     백엔드 개발자      │             │
│  │  추천 알고리즘을 함께 구현할             │  └────────────────────────┘             │
│  │  스터디원을 모집합니다.                  │                                         │
│  │                                          │                                        │
│  │  주간 미팅은 매주 토요일 오전이며        │                                          │
│  │  디스코드로 진행될 예정입니다.           │                                         │
│  │                                          │                                        │
│  │  ▌ 지원자격 및 우대사항                 │                                          │
│  │                                          │                                        │
│  │  ✅ 필수: Python 기초 문법 이해          │                                        │
│  │  ⭐ 우대: 금융 데이터 분석 경험          │                                         │
│  │                                          │                                        │
│  └──────────────────────────────────────────┘                                        │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

![mate_detail_page (1).png](dbc36574-184e-46dd-9266-6cb49a61ad67.png)

![image.png](967e2d91-926b-4097-b064-6d25072ce52e.png)

### 3.2.3 UI 컴포넌트 매핑

-**댓글 관련 컴포넌트'를 삭제**하고, 필수 요구사항인 **'지원 동기 입력 모달'을 추가**

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 브레드크럼 | `Breadcrumb` | `Breadcrumbs` (MUI) | 페이지 경로 표시 |
| 게시글 헤더 | `PostHeader` | `Typography` (MUI) | 제목, 상태 배지, 메타 정보 |
| 태그 목록 | `TagBadge` | `Chip` (MUI) | 기술 스택 태그 |
| 모집 정보 그리드 | `PostInfoGrid` | `Grid` (MUI) | 인원/마감일/진행방식 |
| 멤버 목록 | `MemberList` | `Avatar` (MUI) | 현재 참여 멤버 |
| 지원하기 버튼 | `ApplyButton` | `Button` (MUI) | 상태별 조건부 렌더링 |
| 지원 모달 | `ApplyModal` | `Dialog` (MUI) | 지원 동기(`message`) 입력창 포함 |

### 3.2.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **로딩 중** | Skeleton UI 표시 | API 호출 시작 |
| **데이터 있음** | 상세 정보 정상 표시 | API 성공 |
| **존재하지 않는 게시글** | "게시글을 찾을 수 없습니다" 404 안내 | API 404 응답 |
| **에러** | "오류가 발생했습니다." | API 실패 |

### 지원하기 버튼 조건별 상태

| 조건 | 버튼 표시 | 비고 및 로직 |
| --- | --- | --- |
| 비로그인 | "로그인 후 이용해주세요" +
/login 이동 | 클릭 시 `/login` 페이지로 이동 |
| 로그인 + 
작성자(OWNER) | **수정** / **삭제** (활성) | `MR-01` 본인 글 지원 금지 규칙 적용 (지원 버튼 숨김) |
| 로그인 + 
모집 완료(CLOSED) | **모집이 마감되었습니다** (비활성) | `PR-04` 기간 만료 또는 정원 충족 시 자동 전환 |
| 로그인 + 
미신청 유저 | "지원하기" (활성화) | 클릭 시 `ApplyModal` 오픈 (지원 동기 입력 필수) |
| 로그인 + 
신청 대기(PENDING) | "지원 취소하기" | `MR-04` 대기 상태에서만 취소 가능 |
| 로그인 + 
승인 완료(ACCEPTED) | **팀 게시판 이동** 또는 **참여 중** | 이미 팀 멤버로 등록된 상태이며,
내부 게시판 접근 권한이 생김. |
| 로그인 + 
거절됨(REJECTED) | **지원 불가(거절됨)** (비활성) | `MR-06` 거절 또는 퇴출 유저는 재지원 원천 차단 |

### 3.2.5 사용자 인터랙션 흐름

```
[지원하기 버튼 클릭] (비로그인)
    → "로그인이 필요합니다" 토스트 알림 표시 후 /login 페이지로 이동한다.

[지원하기 버튼 클릭] (로그인 상태)
    → 기술 스택 등록 여부 및 현재 대기 중인(PENDING) 지원서 개수(최대 8개)를 먼저 검증한다.
    → 검증 통과 시 지원 동기(10~500자)를 입력하는 ApplyModal을 노출한다.
    → POST /api/applications { postId, message }
    → 성공: "지원이 완료되었습니다" 토스트 알림 표시 후 버튼을 "지원 취소하기"로 변경한다.
    → 실패: 에러 코드에 따라 메시지를 토스트로 표시한다.
           * (지원 한도 초과, 기술 스택 누락, 인원 초과 등)
           
[지원 취소하기 버튼 클릭]
    → 신청 상태가 대기(PENDING)인 경우에만 취소 프로세스를 진행한다.
    → "정말 지원을 취소하시겠습니까?" 확인 모달을 노출한다.
    → DELETE /api/applications/:id
    → 성공: "지원이 취소되었습니다" 토스트 알림 표시 후 버튼을 "지원하기"로 변경한다.
```

---

### 화면 ID: SCR-003 — 모집글 관리 페이지

### 3.3.1 화면 개요

| **항목** | **내용** |
| --- | --- |
| **화면명** | 모집글 관리(수정) 페이지 |
| **URL** | `/posts/:id/edit` |
| **화면 타입** | [x] 입력/수정 |
| **권한 레벨** | [x] 로그인 필요 (글 작성자/OWNER 전용) |
| **주요 기능** | 기존 모집 정보 수정, 모집 조기 마감, 게시글 삭제 |
| **연결 API** | `GET /api/posts/:id`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`, `PATCH /api/posts/:id/status` |

### 3.3.2 와이어프레임 (ASCII)

```jsx
┌──────────────────────────────────────────────────────────────────────────────┐
│  MATE   [Explore]  [Post]  [Community]                    [👤 Jina_P ∨]      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏠 > Explore > 모집글 수정                                                   │
│                                                                              │
│  ▌ 모집글 수정                                                               │
│  기존에 작성한 모집 정보를 수정하거나 관리할 수 있습니다.                        │
│                                                                              │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────┐  │
│  │                                          │  │  💡 관리 팁             │  │
│  │  ▌ 기본 정보                             │  │                        │  │
│  │  모집 유형 * (Category)                  │  │  모집 인원이 모두 차면 │  │
│  │  [ 프로젝트 ]  [● 스터디 ]               │  │  자동으로 모집 완료    │  │
│  │                                          │  │  처리됩니다.           │  │
│  │  제목 * (Title)                          │  └────────────────────────┘  │
│  │  ┌────────────────────────────────────┐  │                              │
│  │  │ AI 기반 주식 추천 알고리즘 스터디... │  │                           │  │
│  │  └────────────────────────────────────┘  │  ┌────────────────────────┐  │
│  │                                          │  │                        │  │
│  │  ▌ 모집 조건                             │  │  [ 🗑️ 게시글 삭제 ]    │  │
│  │  모집 인원 * (RecruitCount)              │  │                        │  │
│  │  ┌────────────────────────────────────┐  │  └────────────────────────┘  │
│  │  │ 3                                  │  │                              │
│  │  └────────────────────────────────────┘  │                              │
│  │                                          │                              │
│  │  모집 마감일 * (EndDate)                 │                              │
│  │  ┌──────────────────────────┐  ┌──────┐  │                              │
│  │  │ 2026.04.10               │  │ [🗓]  │  │                              │
│  │  └──────────────────────────┘  └──────┘  │                              │
│  │                                          │                              │
│  │  진행 방식 * (On/Offline)                │                              │
│  │  [● 온라인 ]  [ 오프라인 ]  [ 혼합 ]     │                              │
│  │                                          │                              │
│  │  ▌ 상세 내용                             │                              │
│  │  프로젝트 소개 * (Content)               │                              │
│  │  ┌────────────────────────────────────┐  │                              │
│  │  │ B  I  U  H1  H2  🔗  🖼️             │  │                              │
│  │  ├────────────────────────────────────┤  │                              │
│  │  │ 안녕하세요! Python과 머신러닝을      │  │                              │
│  │  │ 활용해 주식 데이터를 분석하는...      │  │                              │
│  │  │                                    │  │                              │
│  │  └────────────────────────────────────┘  │                              │
│  │                                          │                              │
│  │    [취소]  [🔒 모집 조기마감]  [💾 수정완료]  │                              │
│  └──────────────────────────────────────────┘                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

![image.png](40ef0f3a-9f98-44c8-a412-60d1aad86511.png)

### 3.3.3 UI 컴포넌트 매핑

| **화면 요소** | **React 컴포넌트** | **라이브러리 컴포넌트** | **비고** |
| --- | --- | --- | --- |
| 데이터 로드 폼 | `EditPostForm` | Paper (MUI) | 기존 데이터를 API로 호출하여 초기값 설정 |
| 모집 유형 선택 | `CategoryToggle` | ToggleButtonGroup | `Category` Enum 값 연동 |
| 모집 인원 입력 | `RecruitCountInput` | TextField (MUI) | `Min(1), Max(20)` 제약 조건 적용 |
| 조기 마감 버튼 | `CloseStatusButton` | Button (MUI) | `status`를 `CLOSED`로 즉시 변경 |
| 삭제 버튼 | `DeletePostButton` | Button (MUI) | `Soft Delete` 실행 및 메인 이동 |

### 3.3.4 사용자 인터랙션 흐름

- **[페이지 진입]**: `GET /api/posts/:id` 호출 → 작성자가 아니면 "권한이 없습니다" 경고 후 뒤로 가기.
- **[조기 마감 클릭]**: "모집을 마감하시겠습니까? (추가 지원 불가)" 모달 → 확인 시 `PATCH` 호출 → 모집 마감 상태로 전환.
- **[삭제 클릭]**: "삭제된 글은 복구할 수 없습니다." 최종 확인 모달 → 확인 시 `DELETE` 호출 → `/` 메인 이동.

---

### 화면 ID: SCR-004 — 팀 전용 게시판 페이지

### 3.4.1 화면 개요

| **항목** | **내용** |
| --- | --- |
| **화면명** | 팀 전용 게시판 페이지 |
| **URL** | `/posts/:id/board` |
| **화면 타입** | [x] 목록/상세 |
| **권한 레벨** | [x] 로그인 필요 (해당 팀 가입자/ACCEPTED 전용) |
| **주요 기능** | 팀 내부 공지 및 소통 게시글 작성, 댓글 소통, 팀원 목록 확인 |
| **연결 API** | `GET /api/posts/:id/board`, `POST /api/posts/:id/board`, `GET /api/posts/:id/members` |

### 3.4.2 와이어프레임 (ASCII)

```jsx
┌──────────────────────────────────────────────────────────────┐
│  [MATE 로고]  [프로젝트 탐색]  [모집글 쓰기]  [마이페이지]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 > My Projects > AI 주식 추천 스터디 > [팀 게시판]           │
│                                                              │
│  ┌───────────────────────────────────┐  ┌─────────────────┐ │
│  │ ▌ 팀 소통 게시판                  │  │ 👥 참여 멤버 (4) │ │
│  │ 팀원들만 볼 수 있는 공간입니다.     │  │                 │ │
│  │                      [📝 글쓰기]  │  │ 👑 김민준 (OWNER)│ │
│  ├───────────────────────────────────┤  │ 👤 이수빈 (MEMBER)│ │
│  │                                   │  │ 👤 박하준 (MEMBER)│ │
│  │ 📌 [공지] 이번 주 미팅 일정 안내   │  │ 👤 최동현 (MEMBER)│ │
│  │ 작성자: 김민준 | 1시간 전 | 조회 4  │  └─────────────────┘ │
│  │                                   │                      │
│  │ 💬 어제 백테스팅 코드 공유합니다    │  ┌─────────────────┐ │
│  │ 작성자: 이수빈 | 3시간 전 | 조회 12 │  │ 🔗 팀 공유 링크  │ │
│  │                                   │  │ [Discord 이동]   │ │
│  │ 💬 궁금한 점 질문 드려요!         │  │ [GitHub 저장소]  │ │
│  │ 작성자: 박하준 | 5시간 전 | 조회 8  │  └─────────────────┘ │
│  │                                   │                      │
│  │      [ <  1  2  3  > ]            │                      │
│  └───────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
```

![image.png](85d8ed8b-35a3-495f-b4b4-a369c7a79695.png)

### 3.4.3 UI 컴포넌트 매핑

| **화면 요소** | **React 컴포넌트** | **라이브러리 컴포넌트** | **비고** |
| --- | --- | --- | --- |
| 게시글 리스트 | `BoardPostList` | List (MUI) | `board_posts` 테이블 데이터 렌더링 |
| 멤버 사이드바 | `MemberSidebar` | Paper + Avatar | `ProjectMember` 목록 조회 표시 |
| 글쓰기 버튼 | `CreatePostButton` | Button (MUI) | 게시판 내 새 글 작성 폼 이동 |
| 상태 배지 | `RoleBadge` | Chip (MUI) | `OWNER`(금색), `MEMBER`(은색) 구분 |

### 3.4.4 화면 상태 목록

| **상태** | **표시 내용** | **트리거** |
| --- | --- | --- |
| **비인가 사용자** | "팀원만 접근 가능한 페이지입니다" + 뒤로가기 | `ACCEPTED` 상태가 아닌 유저 접근 |
| **게시글 없음** | "아직 등록된 게시글이 없습니다. 첫 글을 남겨보세요!" | 데이터 결과 0건 |
| **글 작성/상세** | 기존 모집글 상세와 유사한 레이아웃 제공 | 리스트 항목 클릭 시 상세 이동 |

### 3.4.5 사용자 인터랙션 흐름

- **[진입 시 권한 체크]**: 서버에서 `ProjectMember` 테이블 조회 → 로그인 유저가 해당 프로젝트의 멤버인지 확인.
- **[게시글 클릭]**: 팀 전용 상세 페이지(`/posts/:id/board/:postId`)로 이동하여 내용 및 댓글 확인.
- **[팀원 프로필 클릭]**: 해당 팀원의 간단한 프로필 팝업 노출.

---

### 화면 ID: SCR-005 — 로그인 페이지

### 3.5.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 로그인 페이지 |
| **URL** | `/login` |
| **화면 타입** | [x] 입력 |
| **권한 레벨** | [x] 공개 (로그인 상태에서 접근 시 메인으로 리다이렉트) |
| **주요 기능** | 이메일/비밀번호 로그인, 회원가입 페이지 이동 |
| **연결 API** | `POST /api/auth/login` |

### 3.5.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  [mate 로고]                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  (좌측: 서비스 가이드 및 최신글)      (우측: 로그인 영역)         │
│  ┌────────────────────────┐      ┌────────────────────────┐  │
│  │                        │      │ mate                   │  │
│  │ 나와 딱 맞는              │      │ 다시 만나서 반가워요 👋  │  │
│  │ 크리에이티브 메이트를       │      │                        │  │
│  │ 찾으세요                 │      │ 이메일                  │  │
│  │                        │      │ ┌────────────────────┐ │  │
│  │ 가장 현대적인 기술 스택으로 │      │ │ example@email.com  │ │  │
│  │ 프로젝트를 시작하세요.      │      │ └────────────────────┘ │  │
│  │                        │      │ 비밀번호                │  │
│  │ ----------------------  │      │ ┌────────────────────┐ │  │
│  │ 🔥 지금 뜨는 모집글       │      │ │ 비밀번호를 입력하세요 │ │  │
│  │                        │      │ └────────────────────┘ │  │
│  │ ┌────────────────────┐  │      │                        │  │
│  │ │ • AI 주식 추천 스터디 │  │      │ [      로그인        ]  │  │
│  │ │   Python · D-3     │  │      │                        │  │
│  │ └────────────────────┘  │      │ [로그인 상태 유지]      │  │
│  │ ┌────────────────────┐  │      │                        │  │
│  │ │ • 리액트 토이 프로젝트│  │      │ 아직 계정이 없으신가요? │  │
│  │ │   React · D-7      │  │      │ [회원가입]              │  │
│  │ └────────────────────┘  │      └────────────────────────┘  │
│  └────────────────────────┘                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

![mate_login_page.png](mate_login_page.png)

### 3.5.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 이메일 입력 | `EmailInput` | `TextField` (MUI) | type="email" |
| 비밀번호 입력 | `PasswordInput` | `TextField` (MUI) | 보기/숨기기 토글 |
| 로그인 버튼 | `LoginButton` | `Button` (MUI) | 로딩 중 disabled |
| 에러 메시지 | `ErrorAlert` | `Alert` (MUI) | API 실패 시 표시 |

### 3.5.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **기본** | 입력 폼 표시 | 페이지 진입 |
| **로딩 중** | 로그인 버튼 비활성화 + 스피너 | 로그인 버튼 클릭 |
| **로그인 실패** | "이메일 또는 비밀번호가 올바르지 않습니다" | API 401 응답 |
| **유효성 오류** | 각 필드 아래 에러 메시지 | 빈 값 제출 시 |

### 3.5.5 사용자 인터랙션 흐름

```
[로그인 버튼 클릭]
    → 입력값 유효성 검사 (빈 값 체크)
    → POST /api/auth/login { email, password }
    → 성공: JWT 토큰 저장 (localStorage or Redux) + 메인 페이지 이동
    → 실패 401: "이메일 또는 비밀번호가 올바르지 않습니다" 표시

[이미 로그인 상태에서 /login 접근]
    → 메인 페이지(/)로 자동 리다이렉트
```

---

### 화면 ID: SCR-006 — 회원가입 페이지

### 3.6.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 회원가입 페이지 |
| **URL** | `/register` |
| **화면 타입** | [x] 입력 |
| **권한 레벨** | [x] 공개 |
| **주요 기능** | 이메일/비밀번호/닉네임 입력, 닉네임 중복 확인, 약관 동의, 회원가입 |
| **연결 API** | `POST /api/auth/register`, `GET /api/users/check-nickname?nickname=` |

### 3.6.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  [mate 로고]         Explore  Post  Community        [Get Started]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  (좌측: 서비스 홍보 영역)           (우측: 회원가입 카드)         │
│  ┌────────────────────────┐      ┌────────────────────────┐  │
│  │ 나와 핏이 맞는           │      │ mate                   │  │
│  │ 팀원을 찾는              │      │ 새 계정 만들기 🚀        │  │
│  │ 가장 빠른 방법           │      │ 가입하고 나와 맞는 팀원을  │  │
│  │                        │      │ 찾아보세요.               │  │
│  │ 지금 바로 가입하고 수천  │      │                        │  │
│  │ 개의 프로젝트와 스터디  │      │ (●)기본 정보 ( )프로필 설정 │  │
│  │ 모집글을 탐색해 보세요.   │      │ ( )약관 동의            │  │
│  │                        │      │                        │  │
│  │ [🎯] 기술 스택 기반 매칭 │      │ 이름* │ 닉네임* │
│  │     내가 쓰는 기술로...  │      │ ┌─────┐ ┌─────┐ │  │
│  │                        │      │ │ 박진아 │ │ Jina_P │ │  │
│  │ [🔔] 실시간 모집 알림    │      │ └─────┘ └─────┘ │  │
│  │     관심 스택의 새 글이...│      │                        │  │
│  │                        │      │ 이메일* (ID로 사용)     │  │
│  │ [📋] 체계적인 지원 관리  │      │ ┌────────────────────┐ │  │
│  │     신청 현황을 마이...   │      │ │ jina@mate.dev      │ │  │
│  │                        │      │ └────────────────────┘ │  │
│  │                        │      │ 비밀번호* (8자 이상)    │  │
│  │                        │      │ ┌────────────────────┐ │  │
│  │                        │      │ │ ●●●●●●●●           │ │  │
│  │                        │      │ └────────────────────┘ │  │
│  │                        │      │                        │  │
│  │                        │      │ ▌나의 직군 (Position)* │  │
│  │                        │      │ ┌──┬──┬──┬──┬──┐ │  │
│  │                        │      │ │FE│BE│DE│PM│ETC│ │  │
│  │                        │      │ └──┴──┴──┴──┴──┘ │  │
│  │                        │      │                        │  │
│  │                        │      │ ▌기술 스택 (Tech Stack) │  │
│  │                        │      │ ┌────────────────────┐ │  │
│  │                        │      │ │ Java x  Spring x  +│ │  │
│  │                        │      │ └────────────────────┘ │  │
│  │                        │      │                        │  │
│  │                        │      │ [✓ 전체 약관에 동의합니다]   │
│  │                        │      │ [✓] 서비스 이용약관 (필수) │  │
│  │                        │      │ [✓] 개인정보 처리방침 (필수)│  │
│  │                        │      │                        │  │
│  │                        │      │ [🚀 가입 완료하기]        │  │
│  │                        │      │                        │  │
│  │                        │      │ 이미 계정이 있으신가요? │  │
│  │                        │      │ [로그인]                │  │
│  └────────────────────────┘      └────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

![image.png](image%201.png)

### 3.6.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 이메일 입력 | `EmailInput` | `TextField` (MUI) | 이메일 형식 유효성 검사 |
| 비밀번호 입력 | `PasswordInput` | `TextField` (MUI) | 조건 안내 문구 포함 |
| 비밀번호 확인 | `PasswordConfirmInput` | `TextField` (MUI) | 일치 여부 실시간 체크 |
| 닉네임 + 중복확인 | `NicknameInput` | `TextField` + `Button` (MUI) | 중복확인 후 결과 표시 |
| 약관 동의 체크박스 | `TermsCheckbox` | `Checkbox` (MUI) | 미동의 시 가입 불가 |
| 회원가입 버튼 | `RegisterButton` | `Button` (MUI) | 전체 유효성 통과 시 활성화 |

### 3.6.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **기본** | 입력 폼 표시 | 페이지 진입 |
| **닉네임 중복** | "이미 사용중인 닉네임입니다" | 중복 확인 API 응답 |
| **닉네임 사용 가능** | "사용 가능한 닉네임입니다" | 중복 확인 API 응답 |
| **비밀번호 불일치** | "비밀번호가 일치하지 않습니다" | 확인 필드 blur 시 |
| **이메일 중복** | "이미 가입된 이메일입니다" | API 409 응답 |
| **가입 성공** | 로그인 페이지 이동 + 토스트 메시지 | API 201 응답 |

### 3.6.5 사용자 인터랙션 흐름

```
[닉네임 중복확인 버튼 클릭]
    → GET /api/users/check-nickname?nickname=박진아
    → 사용 가능: "사용 가능한 닉네임입니다" 초록색 표시
    → 중복: "이미 사용중인 닉네임입니다" 빨간색 표시

[회원가입 버튼 클릭]
    → 전체 유효성 검사 (빈 값, 형식, 비밀번호 일치, 닉네임 중복확인 여부)
    → POST /api/auth/register { email, password, nickname }
    → 성공: "회원가입이 완료되었습니다" 토스트 + /login 이동
    → 실패 409: "이미 가입된 이메일입니다" 에러 표시
```

---

### 화면 ID: SCR-007 — 모집글 작성 페이지

### 3.7.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 모집글 작성 페이지 |
| **URL** | `/posts/new` |
| **화면 타입** | [x] 입력 |
| **권한 레벨** | [x] 로그인 필요 (비로그인 접근 시 /login 리다이렉트) |
| **주요 기능** | 모집글 제목/내용/카테고리/태그/인원/마감일 입력, 작성 완료 |
| **연결 API** | `POST /api/posts` |

### 3.7.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  [mate 로고]         Explore  Post  Community        [👤 Jina_P v] [Get Started]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 > Explore > 모집글 작성                                  │
│                                                              │
│  ▌모집글 작성                                                │
│  함께할 팀원을 찾는 모집글을 작성해 보세요.                   │
│                                                              │
│  ┌───────────────────────────────────┐  ┌─────────────────┐ │
│  │                                   │  │ 💡 작성 가이드   │ │
│  │ ▌기본 정보                        │  │ 제목에 기술 스택..│ │
│  │ 모집 유형 * (Category)             │  │ 프로젝트 목표와..│ │
│  │ ┌──────────────┐ ┌──────────────┐ │  │ 지원 자격은 본문..│ │
│  │ │ [💻] 프로젝트 │ │ [📚] 스터디   │ │  └─────────────────┘ │
│  │ └──────────────┘ └──────────────┘ │                      │
│  │                                   │  ┌─────────────────┐ │
│  │ 제목 * (title)                    │  │ 👀 미리보기      │ │
│  │ ┌──────────────────────────────┐ │  │ 개발 프로젝트... │ │
│  │ │ 개발 프로젝트 관리 툴(Mate)... │ │  │ 0 / 4 Joiners   │ │
│  │ └──────────────────────────────┘ │  └─────────────────┘ │
│  │                                   │                      │
│  │ ▌모집 조건                        │  ┌─────────────────┐ │
│  │ 모집 인원 * (recruitCount)         │  │ ✅ 등록 전 체크  │ │
│  │ ┌──────────────────────────────┐ │  │ [v] 모집 유형...│ │
│  │ │ 4 (최소 1명 ~ 최대 20명)      │ │  │ [v] 제목 작성...│ │
│  │ └──────────────────────────────┘ │  │ [v] 모집 인원...│ │
│  │                                   │  │ [v] 마감일 설정...│ │
│  │ 모집 마감일 * (endDate)           │  │ [ ] 프로젝트...│ │
│  │ ┌──────────────────┐            │  └─────────────────┘ │
│  │ │ 2026.04.10       │ [🗓]        │                      │
│  │ └──────────────────┘            │                      │
│  │                                   │                      │
│  │ 진행 방식 * (onOffline)           │                      │
│  │ ┌──────────┬──────────┬──────────┐ │                      │
│  │ │ [💻]온라인│ [🏢]오프라인│ [🔀] 혼합 │ │                      │
│  │ └──────────┴──────────┴──────────┘ │                      │
│  │                                   │                      │
│  │ ▌상세 내용                        │                      │
│  │ 프로젝트 소개 * (content)          │                      │
│  │ ┌──────────────────────────────┐ │                      │
│  │ │ B I U H1 H2 = . 🔗 🖼️           │ │                      │
│  │ │ ---------------------------- │ │                      │
│  │ │ (이곳에 상세 소개, 지원 자격,   │ │                      │
│  │ │  우대 사항, 연락 방법을 자유롭게 │ │                      │
│  │ │  작성해 주세요.)               │ │                      │
│  │ │                              │ │                      │
│  │ │                      148/2000│ │                      │
│  │ └──────────────────────────────┘ │                      │
│  │                                   │                      │
│  │            [취소]         [🚀등록] │                      │
│  └───────────────────────────────────┘                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

![image.png](fccc15c6-1c36-4ad1-9105-723f33bf3a65.png)

![image.png](4e23e929-e728-49b5-a990-9c8411670863.png)

### 3.7.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 제목 입력 | `TitleInput` | `TextField` (MUI) | 글자 수 카운터 포함 |
| 카테고리 선택 | `CategorySelect` | `Select` (MUI) | 스터디/프로젝트 |
| 모집 인원 선택 | `MemberCountSelect` | `Select` (MUI) | 2~10명 |
| 마감일 선택 | `DeadlinePicker` | `DatePicker` (MUI) | 오늘 이후만 선택 가능 |
| 태그 입력 | `TagInput` | `Chip` + `TextField` (MUI) | Enter로 추가, X로 삭제 |
| 상세 내용 | `ContentTextarea` | `TextField` multiline (MUI) | 최소 높이 고정 |
| 취소/작성 버튼 | `FormActions` | `Button` (MUI) | 취소: 이전 페이지 이동 |

### 3.7.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **비로그인 접근** | /login 페이지로 리다이렉트 | 비인증 상태 접근 |
| **유효성 오류** | 각 필드 아래 에러 메시지 | 필수 항목 미입력 |
| **로딩 중** | 작성 버튼 비활성화 | API 호출 중 |
| **작성 성공** | 생성된 상세 페이지로 이동 | API 201 응답 |
| **작성 실패** | "오류가 발생했습니다" 토스트 | API 실패 |

### 3.7.5 사용자 인터랙션 흐름

```
[페이지 접근 시]
    → Redux authStore에서 토큰 확인
    → 비로그인: /login으로 리다이렉트 (Protected Route)
    → 로그인: 폼 정상 표시

[태그 입력]
    → 텍스트 입력 후 Enter → 태그 추가 (Chip으로 표시)
    → X 버튼 클릭 → 태그 삭제

[작성 완료 버튼 클릭]
    → 전체 유효성 검사 (제목, 카테고리, 인원, 마감일, 내용 필수)
    → POST /api/posts { title, category, maxMember, deadline, tags, content }
    → Authorization: Bearer {JWT 토큰} 헤더 포함
    → 성공: "모집글이 등록되었습니다" 토스트 + /posts/:id 이동
    → 실패: 에러 메시지 표시
```

---

### 화면 ID: SCR-008 — 마이페이지

### 3.8.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 마이페이지 |
| **URL** | `/my` |
| **화면 타입** | [x] 상세/수정 |
| **권한 레벨** | [x] 로그인 필요 |
| **주요 기능** | 프로필 조회/수정, 프로필 이미지 업로드, 내 모집글 목록, 신청 현황 확인, 회원 탈퇴 |
| **연결 API** | `GET /api/users/me`, `PATCH /api/users/profile-image`, `GET /api/posts/my`, `GET /api/applications/my` |

### 3.8.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  [mate 로고]         Explore  Post  Community        [👤 Jina_P v]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 > 마이페이지                                             │
│                                                              │
│  ┌───────────────────┐  ┌─────────────────────────────────┐ │
│  │                   │  │ ▌ 프로필 관리                    │ │
│  │  ┌─────────────┐  │  │                                 │ │
│  │  │   [이미지]  │  │  │ 닉네임 * 나의 직군 * │ │
│  │  └─────────────┘  │  │ ┌───────────┐  ┌───────────┐    │ │
│  │    (Avatar)       │  │ │ Jina_P    │  │ 백엔드(BE) │    │ │
│  │                   │  │ └───────────┘  └───────────┘    │ │
│  │  Jina_P           │  │ (2~10자 제한)   (Enum Position)  │ │
│  │  [ BE ] (직군추가) │  │                                 │ │
│  │                   │  │ 기술 스택 (user_tech_stacks)      │ │
│  │  [ 프로필 수정 ]  │  │ [Java x] [Spring x] [ + 추가 ]    │ │
│  │                   │  │                                 │ │
│  │ ----------------- │  │                 [💾 변경사항 저장]│ │
│  │ 👤 프로필 정보     │  └─────────────────────────────────┘ │
│  │ 📋 내 모집글 (3)   │                                     │
│  │ ✉️ 신청 현황 (5)   │  ┌─────────────────────────────────┐ │
│  │ ----------------- │  │ ▌ 활동 내역 (MyPageTabs)         │ │
│  │ 🚪 회원 탈퇴      │  │ ┌─────────────────────────────┐ │ │
│  │                   │  │ │ [내 모집글]  [신청 현황]       │ │ │
│  │                   │  │ └─────────────────────────────┘ │ │
│  │                   │  │                                 │ │
│  │                   │  │ • 리액트 스터디원 모집  [모집중]  │ │
│  │                   │  │   (1 / 3명 참여)   [수정] [삭제]  │ │
│  │                   │  │                                 │ │
│  │                   │  │ • 딥러닝 논문 스터디    [승인완료]│ │
│  │                   │  │   방장: Soobin_H   [지원취소]    │ │
│  └───────────────────┘  └─────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

![image.png](image%202.png)

### 3.8.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 프로필 이미지 | `ProfileAvatar` | `Avatar` (MUI) | 클릭 시 파일 선택 |
| 이미지 업로드 | `ImageUpload` | `input[type=file]` | JPG/PNG, 5MB 이하 |
| 프로필 수정 버튼 | `EditProfileButton` | `Button` (MUI) | 닉네임 수정 모달 |
| 회원 탈퇴 버튼 | `WithdrawButton` | `Button` (MUI) | 확인 모달 필수 |
| 탭 메뉴 | `MyPageTabs` | `Tabs` (MUI) | 내 모집글 / 신청 현황 |
| 내 모집글 목록 | `MyPostList` | `Card` (MUI) | 수정/삭제 버튼 포함 |
| 신청 현황 목록 | `MyApplicationList` | `Card` (MUI) | 상태 배지, 취소 버튼 |

### 3.8.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **비로그인 접근** | /login 페이지로 리다이렉트 | 비인증 접근 |
| **로딩 중** | Skeleton UI 표시 | API 호출 시작 |
| **내 모집글 없음** | "작성한 모집글이 없습니다" | 빈 목록 |
| **신청 내역 없음** | "신청한 스터디가 없습니다" | 빈 목록 |
| **이미지 용량 초과** | "파일 크기는 5MB 이하여야 합니다" | 파일 선택 시 |

### 3.8.5 사용자 인터랙션 흐름

```
[프로필 이미지 클릭]
    → 파일 선택 다이얼로그 열림
    → JPG/PNG, 5MB 이하 검증
    → 미리보기 즉시 반영
    → PATCH /api/users/profile-image (multipart/form-data)
    → 성공: "프로필 이미지가 변경되었습니다" 토스트

[회원 탈퇴 버튼 클릭]
    → "정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다" 확인 모달
    → [확인] → DELETE /api/users/me
    → 성공: JWT 토큰 삭제 + 메인 페이지 이동

[내 모집글 삭제 클릭]
    → "정말 삭제하시겠습니까?" 확인 모달
    → DELETE /api/posts/:id
    → 성공: 목록에서 제거
```

---

### 화면 ID: SCR-009 — 관리자 페이지 (Admin)

### 3.9.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 관리자 페이지 |
| **URL** | `/admin` |
| **화면 타입** | [x] 대시보드 |
| **권한 레벨** | [x] ADMIN 전용 (Thymeleaf 서버사이드 렌더링, React와 별도) |
| **주요 기능** | 전체 회원 목록 조회, 악성 유저 차단/해제, 부적절한 게시글 숨김/공개 처리 |
| **연결 API** | `GET /admin/users`, `PATCH /admin/users/:id/block`, `PATCH /admin/posts/:id/hide` |

### 3.9.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [mate ADMIN]    대시보드                                    [🔍 닉네임/제목 검색...] [👤] │
├──────────────┬──────────────────────────────────────────────────────────────────┤
│              │                                                                  │
│  👤 관리자    │  ┌──────────┐ ┌──────────┐                                     │
│  Super Admin │  │ 전체 회원 │ │ 전체 모집글│                                     │
│              │  │  8,142   │ │  2,430   │                                     │
│  메인 메뉴    │  │ (Count *) │ │ (Count *) │                                     │
│  [📊대시보드]│  └──────────┘ └──────────┘                                     │
│  [👥회원관리]│                                                                  │
│  [📋게시글관리]│  ┌──────────────────────────────────────────────────────────────┐  │
│              │  │ ▌ 최근 가입 회원 목록 (users)              [전체 회원 관리 >]  │  │
│  시스템       │  ├──────────────────────────────────────────────────────────────┤  │
│  [⚙️서비스설정]│  │ 유저정보(email)   닉네임   직군(Position)   가입일    관리      │  │
│              │  │ jina@mate.dev    박진아    백엔드(BE)     26.03.15  [차단]    │  │
│              │  │ subin@mate.dev   이수빈    프론트(FE)     26.03.30  [해제]    │  │
│              │  └──────────────────────────────────────────────────────────────┘  │
│              │                                                                  │
│  [🚪로그아웃]│  ┌──────────────────────────────────────────────────────────────┐  │
│              │  │ ▌ 최근 등록 모집글 (projects)             [전체 게시글 관리 >]  │  │
│              │  ├──────────────────────────────────────────────────────────────┤  │
│              │  │ 유형    제목                   작성자    신청현황   상태    관리   │  │
│              │  ├──────────────────────────────────────────────────────────────┤  │
│              │  │ 프로젝트 Mate 앱 개발 프로젝트  박진아    4 / 4명  [공개]  [숨김] │  │
│              │  │ 스터디   리액트 기초 스터디    김민준    1 / 3명  [공개]  [숨김] │  │
│              │  │ 스터디   파이썬 자동매매(광고)  정선희    0 / 5명  [숨김]  [공개] │  │
│              │  └──────────────────────────────────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────────────────────────────┘
```

![image.png](image%203.png)

### 3.9.3 UI 컴포넌트 매핑 (Thymeleaf)

| 화면 요소 | Thymeleaf 템플릿 | 비고 |
| --- | --- | --- |
| 통계 카드 | `fragments/stats.html` | 회원/게시글/신고 수 |
| 회원 목록 테이블 | `admin/users.html` | th:each 반복 렌더링 |
| 게시글 목록 테이블 | `admin/posts.html` | th:each 반복 렌더링 |
| 차단/해제 버튼 | `form[method=post]` | CSRF 토큰 포함 |
| 숨김/공개 버튼 | `form[method=post]` | CSRF 토큰 포함 |

### 3.9.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **비관리자 접근** | 403 Forbidden 페이지 | ADMIN 권한 없음 |
| **차단 성공** | 해당 행 상태 "차단" 으로 갱신 | 차단 버튼 클릭 |
| **숨김 성공** | 해당 행 상태 "숨김" 으로 갱신 | 숨김 버튼 클릭 |

---

### 화면 ID: SCR-010 — 아이디 찾기 페이지

### 3.10.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 아이디 찾기 페이지 |
| **URL** | `/find-email` |
| **화면 타입** | 입력 |
| **권한 레벨** | 공개 |
| **주요 기능** | 전화번호 입력 후 가입된 이메일 반환 |
| **연결 API** | `POST /api/auth/find-email` |

### 3.15.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  [mate 로고]  [Explore]  [Post]  [Community]    [Get Started] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              mate                                            │
│              아이디(이메일)를 잊으셨나요?                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  휴대폰 번호 *                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  010-0000-0000                                 │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │  하이픈 포함/미포함 모두 가능                         │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              이메일 찾기                       │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  ← 로그인으로 돌아가기        비밀번호 찾기 →        │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ── 성공 시 ──────────────────────────────────────────────   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓  가입된 이메일을 찾았습니다                       │    │
│  │                                                     │    │
│  │  회원님의 이메일은                                   │    │
│  │  p***@example.com 입니다                            │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              로그인하러 가기                   │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

![image.png](3eddd2c7-68bb-49b1-be99-8d7806a0ecd3.png)

### 3.10.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 전화번호 입력 | `FormInput` | `TextField` (MUI) | 하이픈 포함/미포함 검증 |
| 이메일 찾기 버튼 | `Button` | `Button` (MUI) | Primary 타입 |
| 결과 표시 박스 | `ResultBox` | `Alert` (MUI) | 성공 시 이메일 마스킹 표시 |
| 로그인/비번찾기 링크 | `Link` | `Link` (MUI) | 페이지 이동 |

### 3.10.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **기본** | 전화번호 입력 폼 | 페이지 진입 |
| **로딩 중** | 버튼 비활성화 + 스피너 | API 호출 중 |
| **성공** | 마스킹된 이메일 표시 (`p***@example.com`) | API 200 응답 |
| **실패** | "해당 번호로 가입된 정보를 찾을 수 없습니다." | API 404 (AUTH_003) |
| **유효성 오류** | "올바른 전화번호 형식이 아닙니다" | 형식 불일치 |

### 3.10.5 사용자 인터랙션 흐름

```
[이메일 찾기 버튼 클릭]
    → 전화번호 형식 유효성 검사
    → POST /api/auth/find-email { phoneNumber }
    → 성공 200: 마스킹된 이메일 표시
    → 실패 404 (AUTH_003): "해당 번호로 가입된 정보를 찾을 수 없습니다."
```

---

### 화면 ID: SCR-011 — 비밀번호 찾기 페이지

### 3.11.1 화면 개요

| 항목 | 내용 |
| --- | --- |
| **화면명** | 비밀번호 찾기 페이지 |
| **URL** | `/find-password` |
| **화면 타입** | 입력 |
| **권한 레벨** | 공개 |
| **주요 기능** | 이메일 + 전화번호 일치 검증 후 임시 비밀번호 발급 |
| **연결 API** | `POST /api/auth/find-password` |

### 3.11.2 와이어프레임 (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  [mate 로고]  [Explore]  [Post]  [Community]    [Get Started] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              mate                                            │
│              비밀번호를 잊으셨나요?                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  이메일 *                                            │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  example@email.com                            │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  휴대폰 번호 *                                       │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  010-0000-0000                                 │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │  하이픈 포함/미포함 모두 가능                         │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │           임시 비밀번호 발급받기               │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  ← 로그인으로 돌아가기        아이디 찾기 →          │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ── 성공 시 ──────────────────────────────────────────────   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✓  임시 비밀번호가 발급되었습니다                   │    │
│  │                                                     │    │
│  │  임시 비밀번호: aB3#kL9!                            │    │
│  │                                                     │    │
│  │  ⚠️ 로그인 후 즉시 비밀번호를 변경해주세요           │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              로그인하러 가기                   │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

![image.png](7b7e92ea-cb7e-4fb7-8671-497ee536fa62.png)

### 3.11.3 UI 컴포넌트 매핑

| 화면 요소 | React 컴포넌트 | 라이브러리 컴포넌트 | 비고 |
| --- | --- | --- | --- |
| 이메일 입력 | `FormInput` | `TextField` (MUI) | 이메일 형식 검증 |
| 전화번호 입력 | `FormInput` | `TextField` (MUI) | 하이픈 포함/미포함 검증 |
| 임시 비밀번호 발급 버튼 | `Button` | `Button` (MUI) | Primary 타입 |
| 결과 표시 박스 | `ResultBox` | `Alert` (MUI) | 임시 비밀번호 + 변경 안내 |

### 3.11.4 화면 상태 목록

| 상태 | 표시 내용 | 트리거 |
| --- | --- | --- |
| **기본** | 이메일 + 전화번호 입력 폼 | 페이지 진입 |
| **로딩 중** | 버튼 비활성화 + 스피너 | API 호출 중 |
| **성공** | 임시 비밀번호 표시 + 변경 권고 안내 | API 200 응답 |
| **실패** | "입력하신 정보가 일치하지 않습니다." | API 400 (AUTH_004) |
| **유효성 오류** | 각 필드 아래 에러 메시지 | 형식 불일치 |

### 3.11.5 사용자 인터랙션 흐름

```
[임시 비밀번호 발급받기 버튼 클릭]
    → 이메일 형식 + 전화번호 형식 유효성 검사
    → POST /api/auth/find-password { email, phoneNumber }
    → 성공 200: 임시 비밀번호 화면에 표시
               "로그인 후 즉시 비밀번호를 변경해주세요" 안내
    → 실패 400 (AUTH_004): "입력하신 정보가 일치하지 않습니다."
```

---

## 4. 네비게이션 흐름도

```
[메인: 모집글 목록 /]
    │
    ├── [모집글 상세 /posts/:id]
    │       ├── [지원하기] → 성공 → 마이페이지 신청 현황에 반영
    │       └── [댓글 작성] → 비로그인 시 /login 이동
    │
    ├── [로그인 /login]
    │       └── 성공 → [이전 페이지 또는 /]
    │
    ├── [회원가입 /register]
    │       └── 성공 → [로그인 /login]
    │
    ├── [모집글 작성 /posts/new] (로그인 필요)
    │       └── 성공 → [모집글 상세 /posts/:id]
    │
    └── [마이페이지 /my] (로그인 필요)
            ├── [내 모집글 탭] → 수정: /posts/:id/edit / 삭제: 목록 갱신
            └── [신청 현황 탭] → 신청 취소 → 목록 갱신
```

---

## 5. 화면 캡처 (스크린샷 첨부)

> 구현 후 실제 화면 캡처를 아래 경로에 저장하고 링크를 업데이트하세요.
> 

```
![메인 페이지](./images/SCR-001_main.png)
![모집글 상세 페이지](./images/SCR-002_post_detail.png)
![로그인 페이지](./images/SCR-003_login.png)
![회원가입 페이지](./images/SCR-004_register.png)
![모집글 작성 페이지](./images/SCR-005_post_write.png)
![마이페이지](./images/SCR-006_mypage.png)
![관리자 페이지](./images/SCR-007_admin.png)
```

---

## 6. 작성 체크리스트

- [ ]  전체 화면 목록이 누락 없이 작성되었는가?
- [ ]  각 화면의 권한 레벨이 명확히 정의되었는가?
- [ ]  와이어프레임이 주요 UI 요소를 포함하는가?
- [ ]  React 컴포넌트와 화면 요소가 1:1 매핑되었는가?
- [ ]  로딩/에러/빈 데이터 상태가 모두 고려되었는가?
- [ ]  비로그인 접근 시 리다이렉트 처리가 명시되었는가?
- [ ]  지원하기 버튼 조건별 상태가 정의되었는가?
- [ ]  댓글 CRUD 인터랙션 흐름이 작성되었는가?
- [ ]  프로필 이미지 업로드 흐름이 작성되었는가?