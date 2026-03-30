# React 컴포넌트와 Props 설계서

# React 컴포넌트 설계서

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | MATE |
| **작성자** | 박진아, 김현석A |
| **작성일** | 2026-03-30 |
| **버전** | v1.1 |
| **검토자** | 팀 전체 |

---

## 0. 컴포넌트 설계 과정 (메인 페이지 기준)

### STEP 1 — 와이어프레임에서 컴포넌트 경계 그리기

UI 화면설계서의 메인 페이지(SCR-001) 와이어프레임에서 컴포넌트 경계를 식별합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ Header 컴포넌트 ───────────────────────────────────────────┐ │
│ │ [MATE 로고]   [Explore]  [Post]             [Login] [Join]    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ MainPage (페이지 컴포넌트, 상태 소유) ─────────────────────┐ │
│ │                                                             │ │
│ │  ┌─ HeroSection ──────────────────────┐                     │ │
│ │  │ 🔥 새로운 프로젝트가 시작을 기다립니다 │                     │ │
│ │  └────────────────────────────────────┘                     │ │
│ │                                                             │ │
│ │  ┌─ SearchBar ────────────────────────┐                     │ │
│ │  │ [🔍 스택 또는 프로젝트 검색        ] │ ← 검색어 상태 관리   │ │
│ │  └────────────────────────────────────┘                     │ │
│ │                                                             │ │
│ │  ┌─ FilterBar ──────────────────────────────────────────┐  │ │
│ │  │ [전체] [스터디] [프로젝트] | [React] [Spring] ...      │  │ │
│ │  └──────────────────────────────────────────────────────┘  │ │
│ │                                                             │ │
│ │  ┌─ PostGrid (모집글 그리드) ────────────────────────────┐  │ │
│ │  │ ┌────────────┐ ┌────────────┐ ┌────────────┐         │  │ │
│ │  │ │ PostCard   │ │ PostCard   │ │ PostCard   │         │  │ │
│ │  │ └────────────┘ └────────────┘ └────────────┘         │  │ │
│ │  └──────────────────────────────────────────────────────┘  │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Footer ───────────────────────────────────────────────────┐ │
│ │ ⓒ 2026 Mate. All rights reserved.                          │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

> **분리 근거:**
> 
> - `Header` — 로그인 상태(`authStore`)에 따라 메뉴가 동적으로 변하며 전역에서 쓰임.
> - `PostCard` — 메인, 마이페이지 등 여러 곳에서 반복 사용되는 핵심 단위.
> - `FilterBar` — 카테고리(`Enum`)와 기술 스택(`Tag`)을 조합하여 복잡한 필터링 수행.
> - `PostGrid` — API의 목록 데이터를 받아 `PostCard`를 배치하는 레이아웃 역할.

---

### STEP 2 — 컴포넌트 트리 (계층 구조)

```
MainPage (페이지)
  ├── HeroSection                       ← 단순 홍보 영역
  ├── SearchBar                         ← (Props: onSearch) 검색 기능
  ├── FilterBar                         ← (Props: category, selectedTags, onChange)
  ├── PostGrid                          ← (Props: posts, loading)
  │     └── PostCard                    ← (Props: data, onClick) 개별 모집글
  └── Pagination                        ← (Props: page, total, onChange)

PostDetailPage (페이지)
  ├── PostHeader                        ← 제목, 작성자, 조회수, D-Day
  ├── PostInfoGrid                      ← 인원/마감일/진행방식 (그리드 레이아웃)
  ├── MemberList                        ← 현재 확정 멤버 (Avatar 리스트)
  ├── ApplyButton                       ← (Props: applyStatus) 클릭 시 Modal 오픈
  └── ApplyModal                        ← (NEW) 지원 동기(message) 입력 및 제출
  └── CommentSection                    ← (Props: postId) 댓글 시스템
        ├── CommentInput                ← 댓글 작성
        └── CommentItem                 ← 개별 댓글 (수정/삭제 가능)

MyPage (페이지)
  ├── ProfileSection                    ← 닉네임, 이메일, 전화번호, 기술스택, 프로필 이미지
  └── MyPageTabs                        ← [내 모집글] / [신청 현황] 전환
        ├── MyPostList                  ← 내가 방장인 글 (수정/삭제 버튼)
        └── MyAppList                   ← 내가 신청한 글 (상태 배지: PENDING 등)

Auth (페이지군)
  ├── LoginPage                         ← 로그인
  ├── RegisterPage                      ← 회원가입 (전화번호 입력 포함)
  ├── FindIdPage                        ← 아이디 찾기 (전화번호 인증)
  └── FindPasswordPage                  ← 비밀번호 찾기 (이메일+전화번호 인증)
```

---

### STEP 3 — 상태 위치 결정

| 상태 | 위치 결정 | 결정 근거 |
| --- | --- | --- |
| `keyword` | 로컬 `useState` (MainPage) | 검색 입력값은 메인 페이지 내부에서만 필요 |
| `selectedCategory` | 로컬 `useState` (MainPage) | STUDY/PROJECT 필터링 UI 상태 |
| `user`, `token` | `authStore` (Zustand) | 로그인 상태 및 권한(`OWNER/ADMIN`) 체크를 위해 전역 공유 필요 |
| `posts` | `postStore` (Zustand) | 서버에서 페이징된 데이터로, 여러 컴포넌트에서 접근 가능성 높음 |
| `currentPost` | `postStore` (Zustand) | 상세 페이지 데이터 (API 결과값) |
| `isApplyModalOpen` | 로컬 `useState` (PostDetailPage) | 지원 모달의 열림 상태는 해당 페이지 전용 UI 상태 |

---

### STEP 4 — Props 흐름 다이어그램 (상세 페이지 예시)

```
PostDetailPage (상태 소유)
    │
    │  데이터 (↓)                         이벤트 콜백 (↑)
    │  ─────────────────────────────────────────────────────
    ├─→ PostHeader
    │     title, nickname, dDay, viewCount
    │
    ├─→ ApplyButton
    │     applyStatus={postDetail.applyStatus}   onOpenModal() ←──────┐
    │     isOwner={postDetail.isOwner}                                │
    │                                                                 │
    │     [지원하기 버튼 클릭] ─────────────────────────────────────────┘
    │       (로그인 체크 후 setIsApplyModalOpen(true) 호출)
    │
    └─→ ApplyModal (isOpen 상태에 따라 노출)
          postId={postDetail.id}                 onSubmit() ←─────────┐
                                                 onClose()  ←─────────┤
          [지원 동기 입력 후 제출] ───────────────────────────────────────┘
            (postStore의 apply 액션 호출 및 상태 리프레시)
```

---

## 컴포넌트 1: MainPage (모집글 목록 페이지)

### 1.1 컴포넌트 개요

| 항목 | 내용 |
| --- | --- |
| **컴포넌트명** | `MainPage` |
| **위치** | `src/pages/Main/index.tsx` |
| **타입** | 페이지 컴포넌트 (상태 소유자) |
| **복잡도** | 복합 (100줄 이상) |
| **상태 관리** | Zustand (`postStore`, `authStore`) + 로컬 필터 상태 |

### 1.2 기능 요구사항

- [ ]  최신 모집글 목록 조회 (서버사이드 페이지네이션)
- [ ]  카테고리(`STUDY`, `PROJECT`) 필터링
- [ ]  기술 스택(`techStacks`) 다중 선택 필터링
- [ ]  키워드 기반 제목 및 내용 검색
- [ ]  로딩 중 Skeleton UI 표시 (`PostCard` 형태)

### 1.3 Props 인터페이스

> 페이지 컴포넌트이므로 외부 Props를 직접 받지 않음.
> 

### 1.4 로컬 상태 (useState)

| 상태명 | 타입 | 초기값 | 용도 | 위치 선택 근거 |
| --- | --- | --- | --- | --- |
| `keyword` | `string` | `""` | 검색창 입력값 | MainPage 내부에서만 사용 |
| `category` | `string` | `"ALL"` | 선택된 모집 유형 | UI 필터링용 |
| `selectedTags` | `string[]` | `[]` | 선택된 기술 스택 리스트 | 다중 필터링용 |

### 1.5 Zustand 전역 상태

| 상태/액션 | 스토어 | 용도 |
| --- | --- | --- |
| `posts` | `postStore` | PostGrid에 전달할 목록 데이터 |
| `loading` | `postStore` | Skeleton 표시 여부 제어 |
| `fetchPosts` | `postStore` | 필터 변경 시 API 호출 |
| `user` | `authStore` | 로그인 상태 확인 |

### 1.6 API 연동

| API | 메서드 | 호출 시점 | 파라미터 |
| --- | --- | --- | --- |
| `/api/posts` | `GET` | 마운트 시, 필터/검색 변경 시 | `keyword`, `category`, `tag`, `sort`, `page` |

### 1.7 구현 코드

```tsx
export default function MainPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('ALL');
  const { posts, loading, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPosts({ keyword, category, page: 0 });
  }, [category]);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    fetchPosts({ keyword: kw, category, page: 0 });
  };

  return (
    <div className="container mx-auto py-8">
      <HeroSection />
      <SearchBar onSearch={handleSearch} />
      <FilterBar category={category} onChange={setCategory} />
      <PostGrid data={posts} loading={loading} />
      <Pagination total={posts.totalElements} />
    </div>
  );
}
```

---

## 컴포넌트 2: PostCard (모집글 카드)

### 2.1 컴포넌트 개요

| 항목 | 내용 |
| --- | --- |
| **컴포넌트명** | `PostCard` |
| **위치** | `src/components/common/PostCard.tsx` |
| **타입** | 공통 기능 컴포넌트 |
| **재사용성** | 높음 (메인, 마이페이지, 검색 결과 등) |

### 2.2 Props 인터페이스

| Props명 | 타입 | 필수여부 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `number` | 필수 | - | 게시글 고유 ID |
| `category` | `string` | 필수 | - | STUDY / PROJECT |
| `status` | `string` | 필수 | - | RECRUITING / CLOSED |
| `title` | `string` | 필수 | - | 모집글 제목 |
| `recruitCount` | `number` | 필수 | - | 목표 인원 |
| `currentCount` | `number` | 필수 | - | 현재 확정 인원 |
| `tags` | `string[]` | 필수 | - | 기술 스택 리스트 |
| `endDate` | `string` | 필수 | - | 마감일 (YYYY-MM-DD) |

### 2.3 로컬 상태

> 상태 없음 — Props 기반 순수 컴포넌트.
> 

### 2.4 구현 코드

```tsx
export default function PostCard({ id, title, category, status, recruitCount, currentCount, tags, endDate }: PostCardProps) {
  const navigate = useNavigate();
  const dDay = calculateDDay(endDate);
  const progress = (currentCount / recruitCount) * 100;

  return (
    <Card
      onClick={() => navigate(`/posts/${id}`)}
      className={`cursor-pointer hover:shadow-lg ${status === 'CLOSED' ? 'opacity-50' : ''}`}
    >
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">{category}</Badge>
          <Badge variant={dDay <= 3 ? "destructive" : "secondary"}>D-{dDay}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map(tag => <TagBadge key={tag} label={tag} />)}
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currentCount} / {recruitCount}명 확정</span>
          <span>{status === 'RECRUITING' ? '모집중' : '마감'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 컴포넌트 3: ApplyButton (지원하기 버튼)

### 3.1 기능 요구사항

- [ ]  본인 글일 경우 버튼 숨김
- [ ]  모집 마감 시 버튼 비활성화
- [ ]  **미지원 상태일 경우 클릭 시 `ApplyModal` 오픈** (직접 API 호출 금지)
- [ ]  지원 완료(`PENDING`) 상태일 경우 클릭 시 '지원 취소' API 호출

### 3.1 컴포넌트 개요

| 항목 | 내용 |
| --- | --- |
| **컴포넌트명** | `ApplyButton` |
| **위치** | `src/pages/PostDetail/components/ApplyButton.tsx` |
| **복잡도** | 도메인 비즈니스 규칙 다수 포함 (`Matching Rules`) |

### 3.2 Props 인터페이스

| Props명 | 타입 | 필수여부 | 설명 |
| --- | --- | --- | --- |
| `postId` | `number` | 필수 | 지원할 게시글 ID |
| `status` | `string` | 필수 | 게시글의 현재 상태 (RECRUITING/CLOSED) |
| `isOwner` | `boolean` | 필수 | 현재 유저가 작성자인지 여부 |
| `applyStatus` | `string \| null` | 필수 | 유저의 신청 상태 (PENDING/ACCEPTED/REJECTED/null) |

### 3.3 로컬 상태

| 상태명 | 타입 | 초기값 | 용도 |
| --- | --- | --- | --- |
| `isSubmitting` | `boolean` | `false` | API 호출 중 버튼 비활성화 |

### 3.4 도메인 규칙에 따른 조건부 렌더링

| 상황 | 버튼 상태 | 텍스트 | 비고 |
| --- | --- | --- | --- |
| 비로그인 | 활성 | 로그인 후 이용 | 클릭 시 로그인 페이지 이동 |
| 본인 글 | 숨김 | - | `MR-01` 본인 지원 금지 |
| 모집 마감 | 비활성 | 모집이 마감되었습니다 | `MR-03` 자동 전환 규칙 |
| 미신청 | 활성 | 지원하기 | `MR-02` 8개 제한 체크 포함 |
| 신청 완료(PENDING) | 활성 | 지원 취소하기 | `MR-04` 취소 가능 규칙 |

### 3.5 구현 코드

```tsx
export default function ApplyButton({ postId, status, isOwner, applyStatus }: ApplyButtonProps) {
  const { token } = useAuthStore();
  const { applyToPost, cancelApply } = useApplyStore();

  if (isOwner) return null; // MR-01
  if (status === 'CLOSED') return <Button disabled>모집이 마감되었습니다</Button>;

  const handleApply = async () => {
    if (!token) return navigate('/login');
    if (applyStatus === 'PENDING') {
      await cancelApply(postId);
    } else {
      await applyToPost(postId);
    }
  };

  return (
    <Button onClick={handleApply} variant={applyStatus === 'PENDING' ? "outline" : "default"}>
      {applyStatus === 'PENDING' ? '지원 취소하기' : '지원하기'}
    </Button>
  );
}
```

---

## 컴포넌트 4: MyPage (마이페이지)

### 4.1 컴포넌트 개요

| 항목 | 내용 |
| --- | --- |
| **컴포넌트명** | `MyPage` |
| **위치** | `src/pages/MyPage/index.tsx` |
| **타입** | 페이지 컴포넌트 |

### 4.2 로컬 상태

| 상태명 | 타입 | 초기값 | 용도 |
| --- | --- | --- | --- |
| `activeTab` | `string` | `"myPosts"` | 탭 메뉴 선택 상태 |

### 4.3 Zustand 연결

| 상태/액션 | 용도 |
| --- | --- |
| `user` | 프로필 정보(닉네임, 이메일, 전화번호 등) 표시 |
| `myPosts` | 내가 작성한 글 목록 |
| `myApplies` | 내가 지원한 내역 목록 |
| `fetchMyData` | 마운트 시 데이터 로드 |

### 4.4 구현 코드

```tsx
export default function MyPage() {
  const [activeTab, setActiveTab] = useState('myPosts');
  const { user } = useAuthStore();
  const { myPosts, myApplies, fetchMyData } = useMyPageStore();

  useEffect(() => { fetchMyData(); }, []);

  return (
    <div className="container mx-auto py-10">
      <ProfileSection user={user} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="myPosts">내 모집글</TabsTrigger>
          <TabsTrigger value="myApplies">신청 현황</TabsTrigger>
        </TabsList>
        <TabsContent value="myPosts">
          <MyPostList data={myPosts} />
        </TabsContent>
        <TabsContent value="myApplies">
          <MyAppList data={myApplies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 컴포넌트 5: FindIdPage (아이디 찾기 페이지)

### 5.1 컴포넌트 개요

| 항목 | 내용 |
| --- | --- |
| **컴포넌트명** | `FindIdPage` |
| **위치** | `src/pages/Auth/FindId/index.tsx` |
| **타입** | 페이지 컴포넌트 |

### 5.2 로컬 상태

| 상태명 | 타입 | 초기값 | 용도 |
| --- | --- | --- | --- |
| `phoneNumber` | `string` | `""` | 입력된 전화번호 |
| `foundEmail` | `string \| null` | `null` | 찾은 이메일 (마스킹 처리됨) |

### 5.3 주요 기능

- **아이디 찾기:** 전화번호를 입력받아 API(`GET /api/auth/find-id`) 호출
- **결과 표시:** 성공 시 마스킹된 이메일을 화면에 노출하고 로그인 페이지 이동 버튼 활성화

---

## 컴포넌트 6: FindPasswordPage (비밀번호 찾기 페이지)

### 6.1 컴포넌트 개요

| 항목 | 내용 |
| --- | --- |
| **컴포넌트명** | `FindPasswordPage` |
| **위치** | `src/pages/Auth/FindPassword/index.tsx` |
| **타입** | 페이지 컴포넌트 |

### 6.2 로컬 상태

| 상태명 | 타입 | 초기값 | 용도 |
| --- | --- | --- | --- |
| `email` | `string` | `""` | 가입 시 사용한 이메일 |
| `phoneNumber` | `string` | `""` | 가입 시 등록한 전화번호 |
| `tempPassword` | `string \| null` | `null` | 발급된 임시 비밀번호 |

### 6.3 주요 기능

- **임시 비밀번호 발급:** 이메일과 전화번호를 입력받아 API(`POST /api/auth/find-password`) 호출
- **알림 기능:** 발급 성공 시 임시 비밀번호를 노출하고 로그인 후 즉시 변경할 것을 권고하는 안내 문구 표시

---

## Zustand 스토어 설계

### postStore.ts

```tsx
export const usePostStore = create((set) => ({
  posts: [],
  loading: false,
  fetchPosts: async (params) => {
    set({ loading: true });
    const res = await api.get('/api/posts', { params });
    set({ posts: res.data.content, loading: false });
  }
}));
```

### authStore.ts

```tsx
export const useAuthStore = create(persist((set) => ({
  token: null,
  user: null,
  login: async (creds) => {
    const res = await api.post('/api/auth/login', creds);
    set({ token: res.data.token, user: res.data.user });
  },
  logout: () => set({ token: null, user: null })
}), { name: 'mate-auth' }));
```

---

## 파일 구조 전체 요약

```jsx
src/
├── api/              # REST API 통신 관련 (Axios 설정)
│   ├── axiosInstance.js  # 공통 Axios 설정 및 Interceptor (REQ-T-04 에러 처리)
│   ├── authApi.js        # 로그인, 회원가입 관련 API
│   └── postApi.js        # 모집글 CRUD 및 지원 관련 API
├── assets/           # 정적 파일 (Figma에서 추출한 로고, 이미지, 아이콘)
│   ├── logo.svg          # MATE 공식 로고
│   └── images/           # 기본 프로필 이미지 등
├── components/       # 재사용 가능한 공통 부품
│   ├── common/           # Header, Footer, Button, Toast 등
│   ├── post/             # PostCard, SearchFilter 등
│   └── layout/           # GeneralLayout (상-중-하 구조)
├── constants/        # 상수 관리 (에러 코드, 경로 등)
│   ├── errorCodes.js     # AUTH_001, APPLY_001 등 정의
│   └── path.js           # URL 경로 상수화
├── hooks/            # 커스텀 훅 (비즈니스 로직 분리)
│   ├── useAuth.js        # JWT 인증 상태 관리 훅
│   └── useForm.js        # 입력창 유효성 검사 훅
├── pages/            # 15개 주요 화면 컴포넌트
│   ├── Home/             # 메인 페이지
│   ├── PostDetail/       # 모집글 상세 및 게시판
│   ├── PostWrite/        # 모집글 작성/수정
│   ├── MyPage/           # 마이페이지 및 내역
│   └── Auth/             # 로그인 및 회원가입
├── store/            # 🐻 Zustand 전역 상태 관리         <- 수정했어요!!
│   ├── authStore.js      # JWT 토큰, 유저 인증 상태 관리  <- 수정했어요!!
│   ├── postStore.js      # 모집글 목록/상세 데이터 상태 관리  <- 수정했어요!!
│   └── uiStore.js        # 공통 UI 상태 (Toast 에러 메시지 등)  <- 수정했어요!!
├── styles/           # 전역 스타일 (MUI 테마 및 CSS)
│   ├── global.css        # 기본 CSS 초기화
│   └── theme.js          # 테마 컬러 설정
├── utils/            # 유틸리티 함수 (날짜 포맷 등)
├── App.jsx           # React Router 설정 (15개 경로 연결)
└── main.jsx          # 엔트리 포인트 (Vite 시작점)

```

---

## 작성 체크리스트

- [ ]  STEP 1: 와이어프레임 기반 컴포넌트 경계 식별 완료
- [ ]  STEP 2: 부모-자식 컴포넌트 계층 트리 작성 완료
- [ ]  STEP 3: 상태 위치 결정 근거 명시 완료
- [ ]  STEP 4: Props 흐름 다이어그램 작성 완료
- [ ]  개별 컴포넌트 Props 인터페이스 및 구현 코드 포함 완료
- [ ]  Zustand 스토어 상태 및 액션 명세 완료
- [ ]  파일 구조 정리 완료
- [ ]  도메인/엔티티 설계서의 용어 및 규칙 반영 완료