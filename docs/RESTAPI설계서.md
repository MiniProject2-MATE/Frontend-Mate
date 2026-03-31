# REST API 설계서

## **문서 정보**

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | MATE (팀 프로젝트/스터디 매칭 플랫폼) |
| **작성자** | 이예린, 윤형진, 홍지호 |
| **작성일** | 2026-03-30 |
| **버전** | v1.1 |
| **Base URL** | `http://localhost:8080/api` |

---

## **1. API 설계 개요**

### **1.1 설계 목적**

RESTful 원칙에 따라 클라이언트(React)와 서버(Spring Boot) 간의 통신 규격을 정의하여 일관되고 확장 가능한 API를 제공하며, MATE의 매칭 로직을 안정적으로 지원한다.

### **1.2 설계 원칙**

- **RESTful**: HTTP 메서드와 상태 코드의 올바른 사용
- **일관성**: 모든 API에서 동일한 응답 구조(`success`, `data`, `message`, `timestamp`) 사용
- **보안**: JWT 기반 인증, `/api/auth/**` 및 공개 조회 제외 보호
- **성능**: 페이지네이션 및 Soft Delete(`deleted_at`) 고려

### **1.3 기술 스택**

| 항목 | 기술 |
| --- | --- |
| 프레임워크 | Spring Boot 3.4.6 |
| 인증 | JWT (액세스 토큰 1시간, 리프레시 토큰 7일) |
| 직렬화 | JSON |

---

## 2. API 공통 규칙

### 2.1 URL 설계 규칙

| **규칙** | **좋은 예** | **나쁜 예** |
| --- | --- | --- |
| 명사 사용 | `GET /api/posts` | `GET /api/getPosts` |
| 복수형 사용 | `/api/users`, `/api/applications` | `/api/user`, `/api/application` |
| 계층 구조 | `/api/posts/{id}/board` | `/api/getPostBoard` |
| 소문자+하이픈 | `/api/auth/find-email` | `/api/auth/findEmail` |
| HTTP 메서드로 동작 표현 | `POST /api/applications` | `/api/createApplication` |

### **2.2 HTTP 메서드 사용 규칙**

| **메서드** | **용도** | **멱등성** | **예시** |
| --- | --- | --- | --- |
| **GET** | 리소스 조회 | ⭕ | `GET /api/posts` |
| **POST** | 리소스 생성 | ❌ | `POST /api/auth/register` |
| **PUT** | 리소스 전체 수정 | ⭕ | `PUT /api/users/me` |
| **PATCH** | 리소스 부분 수정 | ❌ | `PATCH /api/applications/{id}/status` |
| **DELETE** | 리소스 삭제 | ⭕ | `DELETE /api/posts/{id}` |

### **2.3 공통 응답 구조**

### **성공 응답 (단일 객체)**

```json
{
  "success": true,
  "data": { },
  "message": "요청이 성공적으로 처리되었습니다",
  "timestamp": "2026-03-30T10:30:00Z"
}
```

### **성공 응답 (목록/페이지네이션)**

```json
{
  "success": true,
  "data": {
    "content": [ ],
    "page": {
      "number": 0,
      "size": 10,
      "totalElements": 45,
      "totalPages": 5
    }
  }
}
```

### **에러 응답**

```json
{
  "success": false,
  "error": {
    "code": "PROJECT_FULL",
    "message": "모집 정원이 가득 찼습니다",
    "timestamp": "2026-03-30T10:30:00Z"
  }
}
```

### **2.4 HTTP 상태 코드**

| 코드 | 상태 | 사용 예시 |
| --- | --- | --- |
| `200` | OK | GET/PUT/PATCH 성공 |
| `201` | Created | POST 성공 (회원가입, 프로젝트 생성, 지원) |
| `204` | No Content | DELETE 성공 |
| `400` | Bad Request | 유효성 검사 실패(비밀번호 형식 불일치 등) |
| `401` | Unauthorized | 토큰 없음 또는 만료 |
| `403` | Forbidden | 권한 없음 (방장 전용 API에 팀원이 접근) |
| `404` | Not Found | 존재하지 않는 리소스 |
| `409` | Conflict | 중복 지원, 이메일 중복, 전화번호 중복 |
| `422` | Unprocessable Entity | 비즈니스 로직 위반 (지원 취소 불가 등) |
| `500` | Internal Server Error | 서버 오류 |

---

## **3. 인증 및 권한 관리**

### **3.1 권한 레벨**

| **역할** | **접근 가능 API** | **설명** |
| --- | --- | --- |
| **GUEST (미인증)** | `GET /api/posts`, `/api/auth/**` | 모집글 조회, 가입, 로그인만 허용 |
| **USER (로그인)** | GUEST + 모집글 생성, 지원 신청, 마이페이지 | 일반 로그인 회원 |
| **MEMBER (팀원)** | USER + `/api/posts/{id}/board` | 특정 프로젝트에 합류한 팀원 |
| **OWNER (방장)** | MEMBER + 지원자 승인/거절, 마감 처리 | 프로젝트 개설자 |
| **ADMIN (관리자)** | 전체 + 서버사이드 관리자 페이지 | 악성 유저 제재, 부적절 글 삭제 |

```
[클라이언트]  POST /api/auth/login  →  [서버] 검증
                                    ←  accessToken (1시간)
                                    ←  refreshToken (7일)

[클라이언트]  Authorization: Bearer {accessToken}  →  [서버] 인증
             (토큰 만료 시) POST /api/auth/refresh  →  [서버] 새 토큰 발급
```

---

## **4. 상세 API 명세**

### **4.1 인증 API (Auth)**

### **4.1.1 회원 가입**

```json
POST /api/auth/register
Content-Type: multipart/form-data
```

**Request Parameters (Form Data)**

이미지 파일과 회원 정보를 함께 받기 위해 multipart/form-data를 사용합니다.

| **필드명** | **타입** | **필수** | **설명** |
| --- | --- | --- | --- |
| `profileImage` | file (image/*) | 아니오 | 프로필 이미지 파일. (미첨부 시 기본 이미지 할당) |
| `data` | application/json | 예 | 하단의 회원가입 필수 정보들을 담은 JSON 객체 |

`data` 필드 상세 (JSON)

| **필드** | **타입** | **필수** | **설명** |
| --- | --- | --- | --- |
| `email` | string | 예 | 사용자 이메일 |
| `password` | string | 예 | 비밀번호 |
| `nickname` | string | 아니오 | 닉네임 (미입력 시 이메일의 @ 앞부분을 자동 할당) |
| `position` | string | 예 | 희망 포지션 (FE, BE, DE, PM 등) |
| `techStacks` | array | 예 | 기술 스택 목록 |
| `phoneNumber` | string | 예 | 가입 시 등록한 휴대폰 번호 (하이픈 제외 숫자만 입력) |

**Request Body 예시:**

```json
profileImage: (이미지 파일 객체 첨부 또는 생략)
data: 
{
  "email": "user@mate.com",
  "password": "password123!",
  "nickname": "스프링러너",
  "phoneNumber": "01033334444",
  "position": "BE",
  "techStacks": ["Java", "Spring Boot"]
}
```

**비즈니스 규칙 및 폼 검증 (Validation):**

- **이메일**: 필수 입력, 중복 불가, 이메일 형식 준수.
- **비밀번호**: 필수 입력, 8~20자 영문/숫자/특수문자 조합.
- **닉네임 (선택)**: 프론트엔드에서 값을 넘기지 않거나 비워둘 경우, 서버에서 이메일의 `@` 앞부분을 추출하여 초기 닉네임으로 자동 할당함. (예: `user@mate.com` -> `user`)
- **기술 스택**: 최소 1개 이상 등록 필수. 미등록 시 프로젝트 지원 불가.
- **휴대폰 번호**: 휴대폰 번호는 중복될 수 없으며, 향후 아이디/비밀번호 찾기의 본인 확인 수단으로 사용됨.
- **프로필 이미지 (선택)**: 가입 시 프로필 이미지를 지정하지 않으면, 서버에서 기본 이미지 URL(`default-profile.png`)을 DB에 자동 저장함.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@mate.com",
    "nickname": "스프링러너",
    "profileImageUrl": "https://mate-s3.com/default-profile.png"
  },
  "message": "회원가입이 완료되었습니다"
}
```

---

### **4.1.2 로그인**

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user1@mate.com",
  "password": "password123!"
}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "nickname": "user",
      "email": "user@mate.com",
      "position": "BE"
    }
  }
}
```

---

### 4.1.3 토큰 갱신 (Refresh)

```json
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**

```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..." }
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "accessToken": "새로운_액세스토큰...",
    "expiresIn": 3600
  },
  "message": "토큰이 갱신되었습니다"
}
```

### **4.1.4 아이디(이메일) 찾기**

```json
POST /api/auth/find-email
Content-Type: application/json
```

**Request Query Parameter:**

| **필드** | **타입** | **필수** | **설명** |
| --- | --- | --- | --- |
| `phoneNumber` | string | 예 | 가입 시 등록한 휴대폰 번호 (숫자만 입력) |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "email": "jiho****@gmail.com"
  },
  "message": "아이디 찾기에 성공하였습니다"
}
```

### **4.1.5 비밀번호 찾기 (임시 비밀번호 발급)**

```json
POST /api/auth/find-password
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@mate.com",
  "phoneNumber": "01012345678"
}
```

**Response 200 OK:**

```json
{
  "success": true,
  "message": "임시 비밀번호가 생성되었습니다. 로그인 후 반드시 변경해주세요."
}
```

**비즈니스 규칙:**

- **정보 일치 확인**: 입력된 `email`과 `phoneNumber`가 모두 일치하는 유저가 있을 경우에만 발송됩니다.
- **비밀번호 업데이트**: 서버는 무작위 임시 비밀번호를 생성하여 **BCrypt로 암호화**한 뒤 DB를 업데이트합니다.
- **로그인 후 변경**: 사용자가 임시 비밀번호로 로그인한 후 마이페이지에서 비밀번호를 변경하도록 권장합니다.

---

### 4.1.6 전화번호 중복 확인

```json
GET /api/users/check-phone?phoneNumber={phoneNumber}
```

- **비고**: 하이픈(-)을 제외한 숫자 11자리 입력

**Response 200 OK**: 

```json
{
  "success": true,
  "data": { "isAvailable": true },
  "message": "사용 가능한 전화번호입니다."
}
```

### 4.1.7 닉네임 중복 확인

```json
GET /api/users/check-nickname?nickname={nickname}
```

- **비고**: URL 인코딩된 닉네임 문자열 입력 (2~10자)

**Response 200 OK**:

```json
{
  "success": true,
  "data": { "isAvailable": false },
  "message": "이미 사용 중인 닉네임입니다."
}
```

---

### **4.2 프로젝트 모집 API (Projects)**

### **4.2.1 모집글 목록 조회 (공개)**

```
GET /api/posts?keyword=&category=STUDY&tag=React&sort=latest&page=0&size=10
```

| **파라미터** | **타입** | **필수** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `keyword` | string | 선택 | `""` | 검색어 |
| `category` | string | 선택 | `""` | 분류 필터 (STUDY / PROJECT) |
| `tag` | string | 선택 | `""` | 기술 스택 필터 |
| `status` | string | 선택 | `"RECRUITING"` | 상태 필터 (RECRUITING / CLOSED) |
| `sort` | string | 선택 | `"latest"` | 정렬 기준 |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "projectId": 1,
        "title": "사이드 프로젝트 백엔드 구함",
        "category": "PROJECT",
        "recruitCount": 3,
        "currentCount": 1,
        "onOffline": "ONLINE",
        "status": "RECRUITING",
        "endDate": "2026-04-30",
        "ownerNickname": "user",
        "techStacks": ["Java", "Spring Boot"]
      }
    ],
    "page": {
      "number": 0,
      "size": 10,
      "totalElements": 25,
      "totalPages": 3
    }
  }
}
```

---

### 4.2.1-2 모집글 상세 조회 (공개)

```jsx
GET /api/posts/{id}
```

**Response 200 OK**:

```jsx
{
  "success": true,
  "data": {
    "projectId": 1,
    "title": "사이드 프로젝트 백엔드 구함",
    "content": "JPA 실력이 출중하신 분을 모십니다.",
    "category": "PROJECT",
    "recruitCount": 3,
    "currentCount": 1,
    "onOffline": "ONLINE",
    "status": "RECRUITING",
    "viewCount": 150,
    "endDate": "2026-04-30",
    "owner": {
      "userId": 1,
      "nickname": "user",
      "position": "BE"
    },
    "techStacks": ["Java", "Spring Boot", "MySQL"],
    "members": [
      { "userId": 1, "nickname": "user", "role": "OWNER" }
    ]
  }
}
```

---

### **4.2.2 모집글 등록 (로그인 필요)**

```
POST /api/posts
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "category": "PROJECT",
  "title": "사이드 프로젝트 백엔드 모집",
  "content": "JPA와 Spring Boot 경험자를 찾습니다.",
  "recruitCount": 3,
  "onOffline": "ONLINE",
  "endDate": "2026-04-30"
  "tags": ["Java", "Spring"]
}
```

**Response 201 Created:**

```json
{
  "success": true,
  "data": { "projectId": 2 },
  "message": "모집글이 등록되었습니다"
}
```

---

### **4.2.3 모집 수동 마감 (OWNER 전용)**

```
PATCH /api/posts/{id}/status
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": { "projectId": 1, "status": "CLOSED" },
  "message": "모집이 마감되었습니다"
}
```

---

### **4.2.4 모집글 수정 (OWNER 전용)**

```json
PUT /api/posts/{id}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "category": "PROJECT",
  "title": "사이드 프로젝트 백엔드 모집 (수정)",
  "content": "JPA와 Spring Boot 경험자를 찾습니다. (내용 수정)",
  "recruitCount": 4,
  "onOffline": "ONLINE",
  "endDate": "2026-05-15"
}
```

**비즈니스 규칙:**

- **모집 인원 제한 (PR-01):** `recruitCount`(목표 인원)는 현재 이미 승인되어 합류한 `currentCount`보다 적게 수정할 수 없습니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": { "projectId": 1 },
  "message": "모집글이 성공적으로 수정되었습니다"
}
```

---

### 4.2.5 모집글 삭제 (OWNER 전용)

```json
DELETE /api/posts/{id}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- 실제 DB에서 데이터를 영구 삭제하지 않고, `deleted_at` 필드를 현재 시간으로 업데이트하는 **Soft Delete** 방식을 적용합니다.
- 삭제 시 해당 모집글에 연결된 모든 지원서(Application)의 상태도 함께 처리됩니다 (PR-02).

**Response 204 No Content**

---

### **4.3 지원 및 매칭 API (Applications)**

### **4.3.1 프로젝트 지원 (로그인 필요)**

```
POST /api/applications
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{ "postId": 1, "message": "안녕하세요! 열심히 하겠습니다." }
```

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "applicationId": 5,
    "status": "PENDING",
    "appliedAt": "2026-03-30T10:50:00"
  },
  "message": "지원이 완료되었습니다"
}
```

**Response 400 — 정원 초과:**

```json
{
  "success": false,
  "error": { "code": "PROJECT_FULL", "message": "모집 정원이 가득 찼습니다" }
}
```

---

### **4.3.2 지원서 승인/거절 (OWNER 전용)**

```
PATCH /api/applications/{id}/status
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{ "status": "ACCEPTED" }
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": { "applicationId": 5, "status": "ACCEPTED" },
  "message": "지원서가 승인되었습니다. 팀 멤버로 등록되었습니다."
}
```

---

### 4.3.3 지원 취소 (본인 전용)

```json
DELETE /api/applications/{id}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- 지원서의 현재 상태가 **`PENDING` (대기 중)** 일 때만 취소할 수 있습니다. 이미 승인되거나 거절된 상태에서는 취소가 불가능합니다 (MR-04).

**Response 204 No Content**

---

### **4.4 팀원 관리 API (Project Members)**

### **4.4.1 팀원 목록 조회**

```
GET /api/posts/{id}/members
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "memberId": 1,
      "nickname": "user",
      "position": "BE",
      "role": "OWNER"
    },
    {
      "memberId": 2,
      "nickname": "스프링러너",
      "position": "BE",
      "role": "MEMBER"
    }
  ]
}
```

---

### **4.4.2 팀원 강제 퇴출 (OWNER 전용)**

```
DELETE /api/posts/{id}/members/{memberId}
Authorization: Bearer {JWT_TOKEN}
```

**Response 204 No Content**

---

### **4.5 마이페이지 API (Users)**

### **4.5.1 내 정보 조회 (로그인 필요)**

```
GET /api/users/me
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@mate.com",
    "nickname": "user",
    "phoneNumber": "01012345678", 
    "position": "BE",
    "techStacks": ["Java", "Spring Boot"],
    "profileImg": "https://mate-s3.com/default.png",
    "createdAt": "2026-03-30T10:00:00Z"
  }
}
```

---

### **4.5.2 내 정보 수정 (로그인 필요)**

```
PUT /api/users/me
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "nickname": "개발왕",
  "phoneNumber": "01098765432",
  "position": "FE",
  "techStacks": ["React", "TypeScript"],
  "profileImg": "https://mate-s3.com/new-profile.png"
}
```

**비즈니스 규칙:**

- **닉네임 중복 체크**: 수정하려는 닉네임이 이미 존재할 경우 `409 Conflict` 반환.
- **전화번호 중복 체크**: 변경하려는 전화번호가 이미 다른 계정에서 사용 중일 경우 `409 Conflict` 반환.
- **유효성 검사**: 닉네임(2~10자), 전화번호(하이픈 제외 11자) 형식을 준수해야 함.

**Response 200 OK:**

```json
{
  "success": true,
  "data": { 
    "id": 1, 
    "nickname": "개발왕",
    "phoneNumber": "01098765432"
  },
  "message": "정보가 성공적으로 수정되었습니다"
}
```

---

### 4.5.3 내 활동 이력 조회(모집글/지원내역)

### 모집글

```json
GET /api/posts/my
Authorization: Bearer {JWT_TOKEN}
```

### 지원 내역

```json
GET /api/applications/my
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "myProjects": [
      {
        "projectId": 1,
        "title": "자바 백엔드 스터디",
        "status": "RECRUITING",
        "currentCount": 2,
        "recruitCount": 4
      }
    ],
    "myApplications": [
      {
        "applicationId": 5,
        "projectId": 2,
        "projectTitle": "리액트 프로젝트",
        "status": "PENDING",
        "appliedAt": "2026-03-30T10:50:00"
      }
    ]
  }
}
```

---

### 4.5.4 회원 탈퇴 (Soft Delete)

```json
DELETE /api/users/me
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- **데이터 처리**: 실제 DB 레코드를 삭제(`Hard Delete`)하지 않고, `users` 테이블의 `deleted_at` 컬럼에 현재 일시를 기록하는 **Soft Delete** 방식을 적용합니다.
- **연관 데이터**:
    - 탈퇴한 사용자가 신청한 모든 대기 중(`PENDING`)인 지원서는 자동으로 취소 처리됩니다.
    - 탈퇴한 사용자가 방장인 프로젝트는 자동으로 마감(`CLOSED`) 처리하거나 삭제 정책에 따릅니다.
- **재로그인 차단**: 로그인 시 `deleted_at` 값이 존재하는 계정은 인증에 실패하도록 로직을 구성합니다.

**Response 204 No Content**

---

### 4.5.5 프로필 이미지 수정

```json
PATCH /api/users/profile-image
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Request Parameters (Form Data)**
이미지 파일만 단독으로 업데이트하므로 `multipart/form-data`를 사용합니다.

| **필드명** | **타입** | **필수** | **설명** |
| --- | --- | --- | --- |
| `profileImage` | file (image/*) | 예 | 새로 등록할 프로필 이미지 파일 |

**Request Body 예시:**

```json
profileImage: (새로운 이미지 파일 객체 첨부)
```

**비즈니스 규칙 및 검증 (Validation):**

- **권한 검증**: 유효한 JWT 토큰을 가진 로그인 사용자만 호출할 수 있습니다.
- **파일 검증**: 확장자는 `JPG`, `JPEG`, `PNG`만 허용하며, 파일 크기는 최대 `5MB`로 제한합니다.
- **스토리지(S3) 처리**:
    1. 기존에 등록된 이미지가 '기본 이미지'가 아닌 사용자 지정 이미지라면, 스토리지(S3 등)에서 기존 파일을 먼저 삭제합니다. (용량 낭비 방지)
    2. 새로운 이미지를 스토리지에 업로드하고 새 URL을 발급받습니다.
- **DB 업데이트**: users 테이블의 프로필 이미지 URL 컬럼을 새 URL로 갱신합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "profileImageUrl": "https://mate-s3.com/new-profile-12345.png"
  },
  "message": "프로필 이미지가 성공적으로 변경되었습니다."
}
```

---

### 4.5.6 프로필 이미지 삭제 (기본 이미지로 초기화)

```json
DELETE /api/users/profile-image
Authorization: Bearer {JWT_TOKEN}
```

**Request Parameters**

- 없음 (JWT 토큰에서 추출한 유저 ID를 기반으로 처리합니다.)

**비즈니스 규칙 및 검증 (Validation):**

- **권한 검증**: 유효한 JWT 토큰을 가진 로그인 사용자만 호출할 수 있습니다.
- **상태 검증**: 현재 사용자의 프로필 이미지가 이미 '기본 이미지'라면, 스토리지 삭제를 생략하고 즉시 200을 반환합니다.
- **스토리지(S3) 처리**: 기존 이미지가 사용자 지정 이미지일 경우, 스토리지에서 해당 파일을 물리적으로 삭제합니다.
- **DB 업데이트**: users 테이블의 프로필 이미지 URL 컬럼을 서버에 지정된 **기본 프로필 이미지 URL**(`default-profile.png`)로 덮어씌웁니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "profileImageUrl": "https://mate-s3.com/default-profile.png"
  },
  "message": "기본 프로필 이미지로 변경되었습니다."
}
```

---

### 4.6 내부 소통 API (Board & Comment)

- **접근 권한:** 해당 프로젝트의 `Project_Members` 테이블에 등록된 팀 멤버(**`MEMBER`**, **`OWNER`**)만 접근 가능합니다.

### 4.6.1 내부 게시글 목록 조회

```json
GET /api/posts/{id}/board
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "postId": 1,
        "title": "첫 회의 일정 투표합니다",
        "authorNickname": "user",
        "viewCount": 5,
        "createdAt": "2026-04-01T10:00:00"
      }
    ],
    "page": {
      "number": 0,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

---

### 4.6.2 내부 게시글 작성

```json
POST /api/posts/{id}/board
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "첫 회의 일정 투표합니다",
  "content": "이번 주 금요일 저녁 8시 어떠신가요?"
}
```

**Response 201 Created:**

```json
{
  "success": true,
  "data": { "postId": 1 },
  "message": "게시글이 등록되었습니다"
}
```

---

### 4.6.3 내부 게시글 수정(본인 전용)

```json
PUT /api/posts/{projectId}/board/{postId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "회의 일정 변경 안내 (수정)",
  "content": "금요일 8시에서 토요일 2시로 변경되었습니다."
}
```

**비즈니스 규칙:**

- **권한 검증:** 게시글 작성자 본인만 수정이 가능합니다. (방장이라도 타인의 글 내용을 임의로 수정할 수는 없도록 설계하는 것이 일반적입니다.)

**Response 200 OK:**

```json
{
  "success": true,
  "data": { "postId": 1 },
  "message": "게시글이 성공적으로 수정되었습니다."
}
```

---

### 4.6.4 내부 게시글 삭제 (Soft Delete)

```json
DELETE /api/posts/{projectId}/board/{postId}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- **권한 검증 (BDR-02):** 게시글 작성자 본인, 해당 프로젝트의 방장(OWNER), 또는 시스템 관리자(ADMIN)만 삭제할 수 있습니다.
- **데이터 처리:** 실제 삭제가 아닌 `deleted_at` 컬럼을 업데이트하는 **Soft Delete** 방식을 사용합니다. 게시글 삭제 시 해당 글에 달린 모든 댓글도 함께 조회되지 않도록 처리해야 합니다.

**Response 204 No Content**

---

### 4.6.5 댓글 작성

```json
POST /api/posts/{projectId}/board/{postId}/comments
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "금요일 좋습니다!"
}
```

**Response 201 Created:**

```json
{
  "success": true,
  "data": { "commentId": 1 },
  "message": "댓글이 등록되었습니다"
}
```

---

### 4.6.6 댓글 수정 (본인 전용)

```json
PATCH /api/comments/{commentId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "수정된 댓글 내용입니다. 금요일 저녁 9시로 변경 가능할까요?"
}
```

**비즈니스 규칙:**

- **권한 검증:** 댓글의 작성자(`authorId`)와 현재 로그인한 유저가 일치해야만 수정이 가능합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": { "commentId": 1 },
  "message": "댓글이 수정되었습니다."
}
```

---

### 4.6.7 댓글 삭제

```json
DELETE /api/comments/{commentId}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- **권한 검증:** 1. 댓글 작성자 본인, 2. 해당 프로젝트의 방장(**OWNER**), 3. 시스템 관리자(ADMIN)
    - 위 세 경우 중 하나라도 해당하면 삭제가 가능합니다. (방장은 팀원 간 부적절한 언행을 제재할 권한이 있음)
- **데이터 처리:** 게시글과 동일하게 **Soft Delete**를 적용하여 `deleted_at` 컬럼을 업데이트합니다.

**Response 204 No Content**

---

### 4.7 관리자 API (Admin)

**접근 권한**: 시스템 관리자(`ADMIN`) 권한을 가진 유저만 호출 가능합니다. (일반 유저 접근 시 `403 Forbidden` 반환)

### 4.7.1 전체 회원 목록 조회

```json
GET /admin/users
Authorization: Bearer {JWT_TOKEN}
```

- **비고**: 관리자 대시보드에서 가입일, 직군, 현재 상태(차단 여부) 등의 회원 정보를 조회합니다. 페이지네이션이 적용될 수 있습니다.

### 4.7.2 악성 유저 차단 및 해제

```json
PATCH /admin/users/{userId}/block
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:  (true: 차단, false: 해제) 

```json
{ "isBlocked": true }
```

- **Response 200 OK**:

```json
{
  "success": true,
  "data": { "userId": 1, "isBlocked": true },
  "message": "해당 유저가 차단 처리되었습니다."
}
```

### 4.7.3 부적절한 게시글 숨김 및 공개

```json
PATCH /admin/posts/{postId}/hide
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

- **Request Body**:  (true: 숨김, false: 공개)

```json
{ "isHidden": true }
```

- **비즈니스 규칙**: 관리자에 의해 숨김 처리(`isHidden = true`)된 게시글은 일반 유저의 메인 페이지 모집글 목록(`GET /api/posts`)에서 노출되지 않습니다.
- **Response 200 OK**:

```json
{
  "success": true,
  "data": { "postId": 5, "isHidden": true },
  "message": "게시글이 숨김 처리되었습니다."
}
```

---

## **5. API 전체 목록 요약**

| **분류** | **메서드** | **엔드포인트** | **설명** | **허용 권한** |
| --- | --- | --- | --- | --- |
| **인증 (Auth)** | `POST` | `/api/auth/register` | 회원가입 (프로필 이미지 첨부 가능) | GUEST |
|  | `POST` | `/api/auth/login` | 로그인 (JWT 발급) | GUEST |
|  | `POST` | `/api/auth/refresh` | 토큰 재발급 | GUEST |
|  | `POST` | `/api/auth/find-email` | 아이디(이메일) 찾기 | GUEST |
|  | `POST` | `/api/auth/find-password` | 임시 비밀번호 발급 | GUEST |
| **유저 (Users)** | `GET` | `/api/users/check-phone` | 전화번호 중복 체크 | GUEST |
|  | `GET` | `/api/users/check-nickname` | 닉네임 중복 체크 | GUEST |
|  | `GET/PUT` | `/api/users/me` | 내 프로필 정보 조회/수정 | USER |
|  | `PATCH` | `/api/users/profile-image` | 프로필 이미지 업로드/수정 | USER |
|  | `DELETE` | `/api/users/profile-image` | 프로필 이미지 삭제 (기본화) | USER |
|  | `DELETE` | `/api/users/me` | 회원 탈퇴 (Soft Delete) | USER |
| **마이페이지** | `GET` | `/api/posts/my` | 내 모집글 조회 | USER |
|  | `GET` | `/api/applications/my` | 내 지원 내역 조회 | USER |
| **모집글 (Posts)** | `GET` | `/api/posts` | 모집글 검색 및 목록 조회 | GUEST |
|  | `GET` | `/api/posts/{id}` | 모집글 상세 조회 | GUEST |
|  | `POST` | `/api/posts` | 모집글 등록 | USER |
|  | `PUT` | `/api/posts/{id}` | 모집글 전체 수정 | OWNER |
|  | `PATCH` | `/api/posts/{id}/status` | 모집 수동 마감 처리 | OWNER |
|  | `DELETE` | `/api/posts/{id}` | 모집글 삭제 (Soft Delete) | OWNER |
| **지원 (Apply)** | `POST` | `/api/applications` | 프로젝트 참여 지원 | USER |
|  | `PATCH` | `/api/applications/{id}/status` | 지원 승인/거절 처리 | OWNER |
|  | `DELETE` | `/api/applications/{id}` | 지원 취소 (PENDING 상태만) | USER |
| **팀원 (Members)** | `GET` | `/api/posts/{id}/members` | 팀원 목록 조회 | MEMBER, OWNER |
|  | `DELETE` | `/api/posts/{id}/members/{memberId}` | 팀원 강제 퇴출 | OWNER |
| **팀 게시판 (Board)** | `GET` | `/api/posts/{projectId}/board` | 팀 내부 게시판 목록 조회 | MEMBER, OWNER |
|  | `POST` | `/api/posts/{projectId}/board` | 팀 내부 게시판 글 작성 | MEMBER, OWNER |
|  | `PUT` | `/api/board-posts/{boardPostId}` | 내부 게시글 수정 | 작성자 |
|  | `DELETE` | `/api/board-posts/{boardPostId}` | 내부 게시글 삭제 (Soft Delete) | 작성자, OWNER |
| **댓글 (Comment)** | `GET` | `/api/posts/{projectId}/board/{boardPostId}/comments` | 내부 게시글 댓글 조회 | MEMBER, OWNER |
|  | `POST` | `/api/posts/{projectId}/board/{boardPostId}/comments` | 내부 게시글 댓글 작성 | MEMBER, OWNER |
|  | `PATCH` | `/api/comments/{commentId}` | 개별 댓글 수정 | 작성자 |
|  | `DELETE` | `/api/comments/{commentId}` | 개별 댓글 삭제 (Soft Delete) | 작성자, OWNER |
| **관리자 (Admin)** | `GET` | `/admin/users` | 전체 회원 목록 조회 | ADMIN |
|  | `PATCH` | `/admin/users/{userId}/block` | 악성 유저 차단/해제 | ADMIN |
|  | `PATCH` | `/admin/posts/{postId}/hide` | 부적절한 게시글 숨김/공개 | ADMIN |

---

## 6. 체크리스트 및 품질 관리

### **6.1 API 설계 품질**

- ✅ **RESTful 원칙 준수**: 리소스 중심의 URL 설계 및 계층 구조 적용
- ✅ **일관된 네이밍**: 모든 엔드포인트에 소문자, 하이픈(-), 복수형 명사 사용
- ✅ **HTTP 메서드 최적화**: GET(조회), POST(등록), PATCH(수정), DELETE(삭제)의 올바른 용도 사용
- ✅ **표준 응답 포맷**: 모든 응답이 `{ "success", "data", "message" }` 공통 규격을 따르는가?
- ✅ **활동 통합 조회**: 마이페이지 탭 구조 대응을 위해 `activities` API가 효율적으로 설계되었는가?

### **6.2 보안 및 검증**

- ✅ **입력값 검증(Validation)**: 닉네임, 비밀번호, **전화번호(숫자 11자)** 등 유효성 검사 적용
- ✅ **개인정보 보안**: 아이디 찾기 응답 시 이메일 주소의 일부를 백엔드에서 마스킹 처리하여 반환하는가?
- ✅ **비밀번호 복구**: 비밀번호 분실 시 **임시 비밀번호 생성 및 화면 노출 프로세스**가 설계되었는가?
- ✅ **권한 제어(RBAC)**: 역할별(GUEST, USER 등) API 접근 권한이 명확히 구분되었는가?

### **6.3 성능 및 데이터 정합성**

- ✅ **데이터 정합성(트랜잭션)**: 임시 비밀번호 생성 시 **[DB 업데이트]와 [결과 반환]이 하나의 프로세스**로 설계되었는가?
- ✅ **인덱스 설계**: 조회가 빈번한 `email`, `nickname`, **`phone_number`** 컬럼에 인덱스 적용 여부