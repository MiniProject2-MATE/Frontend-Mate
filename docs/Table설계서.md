# Table 설계서

## 문서 정보

| **항목** | **내용** |
| --- | --- |
| **프로젝트명** | MATE (팀 프로젝트/스터디 매칭 플랫폼) |
| **목적** | 데이터베이스 물리적 구조(Schema) 명세 |
| **데이터베이스** | MariaDB |
| **작성자** | 이예린, 윤형진, 홍지호 |
| **작성일** | 2026-03-30 |
| **검토자** | 팀 전체 |
| **버전** | v1.0 |

---

## 1. 테이블 목록

- `users`: 사용자 계정 및 기본 프로필
- `user_tech_stacks`: 사용자의 기술 스택 (1:N 분리 테이블)
- `projects`: 모집글 및 프로젝트 정보
- `applications`: 사용자의 프로젝트 지원 내역
- `project_members`: 최종 합류한 프로젝트 멤버
- `board_posts`: 프로젝트 내부 소통 게시글
- `comments`: 내부 게시글의 댓글

---

## 2. 상세 테이블 설계

### 2.1 `users`

- 로그인 인증 데이터 및 사용자 프로필 관리
- **인덱스**: `idx_email(email)`, `idx_nickname(nickname)`

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| user_id | BIGINT | - | N | AUTO_INCREMENT | 유저 식별자 (PK) |
| email | VARCHAR | 100 | N | - | 로그인 ID (UK) |
| password | VARCHAR | 255 | N | - | 암호화된 비밀번호 |
| nickname | VARCHAR | 10 | N | - | 활동명 (UK) |
| phone_number | VARCHAR | 20 | N | - | 전화번호 (아이디/비밀번호 찾기용 |
| position | VARCHAR | 20 | N | - | 직군 (FE, BE 등) |
| profile_img | VARCHAR | 255 | Y | NULL | 프로필 이미지 URL |
| created_at | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 가입일시 |
| updated_at | TIMESTAMP | - | Y | - | 수정일시 |
| deleted_at | TIMESTAMP | - | Y | NULL | 탈퇴일시 (Soft Delete) |

### 2.2 `user_tech_stacks`

- 유저가 보유한 기술 스택 목록 (@ElementCollection 매핑)
- **FK 제약조건**: `user_id` 참조 `users(user_id)`

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| user_id | BIGINT | - | N | - | 사용자 식별자 (FK) |
| tech_stack | VARCHAR | 50 | N | - | 기술 스택명 (Java, React 등) |

### 2.3 `projects`

- 방장이 생성하는 프로젝트(모집글) 정보
- **인덱스**: `idx_status(status)`
- **FK 제약조건**: `owner_id` 참조 `users(user_id)`

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| project_id | BIGINT | - | N | AUTO_INCREMENT | 프로젝트 식별자 (PK) |
| owner_id | BIGINT | - | N | - | 방장 유저 ID (FK) |
| category | VARCHAR | 20 | N | - | STUDY / PROJECT |
| title | VARCHAR | 50 | N | - | 모집글 제목 |
| content | TEXT | - | N | - | 모집글 내용 |
| recruit_count | INT | - | N | - | 목표 모집 인원 |
| current_count | INT | - | N | 0 | 현재 승인된 인원 |
| on_offline | VARCHAR | 20 | N | - | 온/오프라인 여부 |
| status | VARCHAR | 20 | N | 'RECRUITING' | 모집 상태 |
| end_date | DATE | - | N | - | 모집 마감일 |
| created_at | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 작성일시 |
| updated_at | TIMESTAMP | - | Y | - | 수정일시 |
| deleted_at | TIMESTAMP | - | Y | NULL | 삭제일시 (Soft Delete) |

### 2.4 `applications`

- 팀원 매칭을 위한 지원 이력 관리
- **FK 제약조건**: `project_id` 참조 `projects(project_id)`, `applicant_id` 참조 `users(user_id)`

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| application_id | BIGINT | - | N | AUTO_INCREMENT | 지원서 식별자 (PK) |
| project_id | BIGINT | - | N | - | 지원한 프로젝트 ID (FK) |
| applicant_id | BIGINT | - | N | - | 지원자 ID (FK) |
| message | VARCHAR | 500 | N | - | 지원 동기 |
| status | VARCHAR | 20 | N | 'PENDING' | 대기/승인/거절 상태 |
| applied_at | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 지원일시 |

### 2.5 `project_members`

- 승인이 완료되어 프로젝트에 최종 합류한 팀원 관리
- **Unique 제약조건**: `project_id` + `user_id` (중복 가입 방지)

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| member_id | BIGINT | - | N | AUTO_INCREMENT | 멤버십 식별자 (PK) |
| project_id | BIGINT | - | N | - | 소속 프로젝트 ID (FK) |
| user_id | BIGINT | - | N | - | 사용자 ID (FK) |
| role | VARCHAR | 20 | N | - | 권한 (OWNER, MEMBER) |
| joined_at | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 합류 일시 |

### 2.6 `board_posts`

- 매칭 완료 후 팀원 간 내부 소통 게시판

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| post_id | BIGINT | - | N | AUTO_INCREMENT | 게시글 식별자 (PK) |
| project_id | BIGINT | - | N | - | 소속 프로젝트 ID (FK) |
| author_id | BIGINT | - | N | - | 작성자 ID (FK) |
| title | VARCHAR | 100 | N | - | 제목 |
| content | TEXT | - | N | - | 내용 |
| view_count | BIGINT | - | N | 0 | 조회수 |
| created_at | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 작성일시 |
| updated_at | TIMESTAMP | - | Y | - | 수정일시 |
| deleted_at | TIMESTAMP | - | Y | NULL | 삭제일시 (Soft Delete) |

### 2.7 `comments`

- 내부 게시글에 대한 댓글

| 컬럼명 | 데이터타입 | 길이 | NULL | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| comment_id | BIGINT | - | N | AUTO_INCREMENT | 댓글 식별자 (PK) |
| post_id | BIGINT | - | N | - | 소속 게시글 ID (FK) |
| author_id | BIGINT | - | N | - | 작성자 ID (FK) |
| content | VARCHAR | 500 | N | - | 댓글 내용 |
| created_at | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 작성일시 |
| updated_at | TIMESTAMP | - | Y | - | 수정일시 |
| deleted_at | TIMESTAMP | - | Y | NULL | 삭제일시 (Soft Delete) |

## 3. 샘플 데이터 스크립트 (테스트용)

```sql
-- 1. 유저 생성 (비밀번호: 암호화된 더미값)
INSERT INTO users (email, password, nickname, position, phone_number, created_at) VALUES 
('admin@mate.com', '$2a$10$dummy', '관리자', 'BE', '010-1234-5678', NOW()),
('user1@mate.com', '$2a$10$dummy', '개발왕', 'FE', '010-1111-2222', NOW()),
('user2@mate.com', '$2a$10$dummy', '스프링러너', 'BE', '010-3333-4444', NOW());

-- 2. 기술 스택 매핑
INSERT INTO user_tech_stacks (user_id, tech_stack) VALUES 
(2, 'React'), (2, 'TypeScript'),
(3, 'Spring Boot'), (3, 'Java');

-- 3. 프로젝트 생성 (user1이 생성한 React 스터디)
INSERT INTO projects (owner_id, category, title, content, recruit_count, current_count, on_offline, status, end_date, created_at) VALUES 
(2, 'STUDY', '리액트 기초 스터디원 구합니다', '주 2회 온라인 스터디...', 4, 1, 'ONLINE', 'RECRUITING', '2026-04-10', NOW());

-- 4. 프로젝트 멤버 (방장 자동 등록)
INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES 
(1, 2, 'OWNER', NOW());

-- 5. 지원서 작성 (user3이 프로젝트에 지원)
INSERT INTO applications (project_id, applicant_id, message, status, applied_at) VALUES 
(1, 3, '안녕하세요 백엔드 개발자지만 프론트도 배우고 싶습니다!', 'PENDING', NOW());
```