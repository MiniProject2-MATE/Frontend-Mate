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
  "message": "요청이 성공적으로 처리되었습니다"
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

**[예외 사항 (Exceptions)]**

본 프로젝트의 기본 응답 규격은 JSON 형태의 공통 포맷(success, data, message, timestamp)을 따릅니다.
단, 프론트엔드에서 즉각적으로 평문 텍스트 렌더링이 필요한 **일부 API(예: 아이디 찾기, 임시 비밀번호 발급 등)에 한하여 예외적으로 단순 문자열(`text/plain`)로 응답**할 수 있습니다. 예외가 적용된 API는 상세 명세에 별도로 표기합니다.

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
POST /api/auth/signup
Content-Type: application/json
```

**Request Body (JSON)**

이미지 업로드 로직이 마이페이지 정보 수정으로 분리됨에 따라, 회원가입 시에는 순수 JSON 데이터만 전송합니다. (프로필 이미지는 서버에서 기본 이미지로 자동 할당합니다.)

| **필드명** | **타입** | **필수** | **설명** |
| --- | --- | --- | --- |
| `email` | string | 예 | 사용자 이메일 |
| `password` | string | 예 | 비밀번호 |
| `nickname` | string | 아니요 | 닉네임 (미입력 시 이메일의 @ 앞부분을 추출하여 자동 할당) |
| `phoneNumber` | string | 예 | 사용자 전화번호 |
| `position` | string | 아니요 | 희망 포지션 (예: BE, FE 등) |
| `techStacks` | array | 아니요 | 기술 스택 리스트 (예: ["Java", "Spring"]) |

**Request Body 예시:**

```json
{
  "email": "testuser1@mate.com",
  "password": "Password123!",
  "nickname": "테스트트트",
  "phoneNumber": "01012345678",
  "position": "BE",
  "techStacks": ["Java", "Spring Boot", "MySQL"]
}
```

**비즈니스 규칙 및 폼 검증 (Validation):**

- **이메일**: 필수 입력, 중복 불가, 이메일 형식 준수.
- **비밀번호**: 필수 입력, 8~20자 영문/숫자/특수문자 조합.
- **닉네임 (선택)**: 프론트엔드에서 값을 넘기지 않거나 비워둘 경우, 서버에서 이메일의 `@` 앞부분을 추출하여 특수문자를 제거하고 최대 10자 이내로 잘라 초기 닉네임으로 자동 할당함. (예: `profiletest1@mate.com` ➔ `profiletes`)
- **기술 스택**: 최소 1개 이상 등록 필수. 미등록 시 프로젝트 지원 불가.
- **휴대폰 번호**: 휴대폰 번호는 중복될 수 없으며, 향후 아이디/비밀번호 찾기의 본인 확인 수단으로 사용됨.
- **프로필 이미지 (자동)**: 클라이언트에서 파일을 전송하지 않으며, 가입 성공 시 서버에서 기본 이미지 URL을 자동으로 할당함.

**Response 201 Created:**

```json
{
    "success": true,
    "message": "회원가입이 성공적으로 완료되었습니다.",
    "data": {
        "id": 4,
        "email": "testuser1@mate.com",
        "nickname": "테스트트트"
        "phoneNumber": "01012345678",
        "position": "BE",
        "techStacks": [
            "Java",
            "MySQL",
            "Spring Boot"
        ],
        "profileImg": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        "createdAt": "2026-04-03T15:16:44.6381356"
    }
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
  "email": "testuser1@mate.com",
  "password": "Password123!"
}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "로그인에 성공하였습니다.",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcjFAbWF0ZS5jb20iLCJhdXRoIjoiUk9MRV9VU0VSIiwiZXhwIjoxNzc1MjAwNjY3fQ.phgn1ZUDmSK1Q5z3m6t9cf7D7tH9ByzDUmZGllhSDIw",
        "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcjFAbWF0ZS5jb20iLCJhdXRoIjoiUk9MRV9VU0VSIiwiZXhwIjoxNzc1ODAxODY3fQ.8cOd01Z9YQv8Qb5AxqAvw5BECmtahh4fOp_rKr-C49s",
        "tokenType": "Bearer",
        "expiresIn": 3600,
        "user": {
            "id": 4,
            "nickname": "테스트트트",
            "email": "testuser1@mate.com",
            "position": "BE"
        }
    }
}
```

---

### **4.1.3 로그아웃**

```json
POST /api/auth/logout
Content-Type: application/json
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "로그아웃이 성공적으로 완료되었습니다.",
    "data": null
}
```

---

### 4.1.4 토큰 갱신 (Refresh)

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
    "accessToken": "새로운_액세스_토큰...",
    "refreshToken": "기존에_보냈던_리프레시_토큰_그대로_유지",
    "expiresIn": 3600
  },
  "message": "토큰이 성공적으로 재발급되었습니다."
}
```

### **4.1.5 아이디(이메일) 찾기**

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
    "message": "이메일 찾기에 성공하였습니다.",
    "data": "testuser1@mate.com"
}
```

### **4.1.6 비밀번호 찾기 (임시 비밀번호 발급)**

```json
POST /api/auth/rest-password
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
    "message": "임시 비밀번호가 발급되었습니다. 로그인 후 비밀번호를 변경해 주세요.",
    "data": "jtUyNIsa"
}
```

**비즈니스 규칙:**

- **정보 일치 확인**: 입력된 `email`과 `phoneNumber`가 모두 일치하는 유저가 있을 경우에만 발송됩니다.
- **비밀번호 업데이트**: 서버는 무작위 임시 비밀번호를 생성하여 **BCrypt로 암호화**한 뒤 DB를 업데이트합니다.
- **로그인 후 변경**: 사용자가 임시 비밀번호로 로그인한 후 마이페이지에서 비밀번호를 변경하도록 권장합니다.

---

### 4.1.7 전화번호 중복 확인

```json
GET /api/auth/check-phone?phoneNumber={phoneNumber}
```

- **비고**: 하이픈(-)을 제외한 숫자 11자리 입력

**Response 200 OK**: 

```json
{
    "success": true,
    "message": "사용 가능한 전화번호입니다.",
    "data": {
        "isAvailable": true
    }
}
```

**Response 409— 중복 또는 형식 오류:**

```json
{
    "success": false,
    "error": {
        "code": "USER_005",
        "message": "이미 사용 중인 전화번호입니다",
        "detail": null,
        "fieldErrors": null
    },
    "timestamp": "2026-04-03T15:30:18.3042303"
}
```

---

### 4.1.8 닉네임 중복 확인

```json
GET /api/auth/check-nickname?nickname={nickname}
```

- **비고**: URL 인코딩된 닉네임 문자열 입력 (2~10자)

**Response 200 OK**:

```json
{
    "success": true,
    "message": "사용 가능한 닉네임입니다.",
    "data": {
        "isAvailable": true
    }
}
```

**Response 409— 중복 또는 형식 오류:**

```json
{
    "success": false,
    "error": {
        "code": "USER_003",
        "message": "이미 사용 중인 닉네임입니다",
        "detail": null,
        "fieldErrors": null
    },
    "timestamp": "2026-04-03T15:28:44.7006178"
}
```

---

### 4.1.9 이메일 중복 확인

```json
GET /api/auth/check-email?email={email}
```

- **비고**: 이메일 형식 준수 필수 (예: user@mate.com)

**Response 200 OK:**

```json
{
    "success": true,
    "message": "사용 가능한 이메일입니다.",
    "data": {
        "isAvailable": true
    }
}
```

**Response 409— 중복 또는 형식 오류:**

```json
{
    "success": false,
    "error": {
        "code": "USER_002",
        "message": "이미 사용 중인 이메일입니다",
        "detail": null,
        "fieldErrors": null
    },
    "timestamp": "2026-04-04T12:43:17.3074764"
}
```

---

### **4.2 프로젝트 모집 API (Projects)**

### **4.2.1 모집글 목록 조회 (공개)**

```
GET /api/projects
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "프로젝트 목록 조회가 완료되었습니다.",
    "data": [
        {
            "id": 1,
            "ownerId": 1,
            "ownerNickname": "백승호",
            "category": "PROJECT",
            "title": "Spring Cloud 기반 마이크로서비스",
            "content": "MSA 구축하실 분",
            "recruitCount": 5,
            "currentCount": 1,
            "status": "RECRUITING",
            "onOffline": "ONLINE",
            "endDate": "2026-12-31",
            "remainingDays": 272,
            "createdAt": null,
            "role": "MEMBER",
            "owner": false
        },
        {
            "id": 2,
            "ownerId": 2,
            "ownerNickname": "개발왕",
            "category": "STUDY",
            "title": "React 디자인 패턴 스터디",
            "content": "고급 패턴 같이 공부해요",
            "recruitCount": 4,
            "currentCount": 1,
            "status": "RECRUITING",
            "onOffline": "BOTH",
            "endDate": "2026-06-15",
            "remainingDays": 73,
            "createdAt": null,
            "role": "MEMBER",
            "owner": false
        }
    ]
}
```

---

### 4.2.1-2 모집글 상세 조회 (공개)

```jsx
GET /api/projects/{projectId}
```

**Response 200 OK**:

```jsx
{
    "success": true,
    "message": "프로젝트 상세 조회가 완료되었습니다.",
    "data": {
        "id": 3,
        "ownerId": 4,
        "ownerNickname": "테스트트트",
        "category": "PROJECT",
        "title": "백엔드 스프링 부트 프로젝트 팀원 모집",
        "content": "함께 간단한 커뮤니티 서비스를 개발하실 백엔드 개발자 2분 구합니다!",
        "recruitCount": 3,
        "currentCount": 1,
        "status": "RECRUITING",
        "onOffline": "ONLINE",
        "endDate": "2026-05-30",
        "remainingDays": 57,
        "createdAt": null,
        "role": "MEMBER",
        "owner": false
    }
}
```

---

### **4.2.2 모집글 등록 (로그인 필요)**

```
POST /api/projects
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "ownerId": 4,
  "category": "PROJECT", 
  "title": "백엔드 스프링 부트 프로젝트 팀원 모집",
  "content": "함께 간단한 커뮤니티 서비스를 개발하실 백엔드 개발자 2분 구합니다!",
  "recruitCount": 3,
  "onOffline": "ONLINE",
  "status": "RECRUITING",
  "endDate": "2026-05-30"
}
```

**Response 201 Created:**

```json
{
    "success": true,
    "message": "프로젝트가 성공적으로 생성되었습니다.",
    "data": {
        "id": 3,
        "ownerId": 4,
        "ownerNickname": "테스트트트",
        "category": "PROJECT",
        "title": "자동 방장 설정 테스트",
        "content": "서버가 내 ID를 잘 찾아내는지 확인 중입니다.",
        "recruitCount": 3,
        "currentCount": 1,
        "status": "RECRUITING",
        "onOffline": "OFFLINE",
        "endDate": "2026-05-20",
        "remainingDays": 47,
        "createdAt": null,
        "role": "OWNER",
        "owner": true
    }
}
```

---

### **4.2.3 모집 수동 마감 (OWNER 전용)**

```
PATCH /api/projects/{id}/close
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "프로젝트 모집이 마감되었습니다.",
    "data": {
        "id": 3,
        "ownerId": 5,
        "ownerNickname": "테스트",
        "category": "PROJECT",
        "title": "경험 많은 팀원 구함(수정)",
        "content": "앱 개발 프로젝트입니다.",
        "recruitCount": 5,
        "currentCount": 1,
        "status": "CLOSED",
        "onOffline": "OFFLINE",
        "endDate": "2026-12-31",
        "remainingDays": 271,
        "createdAt": null,
        "deleted": false,
        "role": "MEMBER",
        "owner": false
    }
}
```

---

### **4.2.4 모집글 수정 (OWNER 전용)**

```json
PATCH /api/projects/{id}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
    "category": "PROJECT",
    "title": "경험 많은 팀원 구함(수정)",
    "content": "앱 개발 프로젝트입니다.",
    "recruitCount": 5,
    "onOffline": "OFFLINE",
    "endDate": "2026-12-31"
}
```

**비즈니스 규칙:**

- **모집 인원 제한 (PR-01):** `recruitCount`(목표 인원)는 현재 이미 승인되어 합류한 `currentCount`보다 적게 수정할 수 없습니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "프로젝트 정보가 성공적으로 수정되었습니다.",
    "data": {
        "id": 3,
        "ownerId": 5,
        "ownerNickname": "테스트",
        "category": "PROJECT",
        "title": "경험 많은 팀원 구함(수정)",
        "content": "앱 개발 프로젝트입니다.",
        "recruitCount": 5,
        "currentCount": 1,
        "status": "RECRUITING",
        "onOffline": "OFFLINE",
        "endDate": "2026-12-31",
        "remainingDays": 271,
        "createdAt": null,
        "deleted": false,
        "role": "OWNER",
        "owner": true
    }
}
```

---

### 4.2.5 모집글 삭제 (OWNER 전용)

```json
DELETE /api/projects/{id}
Authorization: Bearer {JWT_TOKEN}
```

Response 200 OK:

```jsx
{
    "success": true,
    "message": "프로젝트가 성공적으로 삭제되었습니다.",
    "data": null
}
```

**비즈니스 규칙:**

- 실제 DB에서 데이터를 영구 삭제하지 않고, `deleted_at` 필드를 현재 시간으로 업데이트하는 **Soft Delete** 방식을 적용합니다.
- 삭제 시 해당 모집글에 연결된 모든 지원서(Application)의 상태도 함께 처리됩니다 (PR-02).

---

### 4.2.6 프로젝트 재모집 시작 (OWNER 전용)

```json
PATCH /api/projects/{projectId}/reopen
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body: None**

**비즈니스 규칙:**

- **상태값 전이:** 성공 시 프로젝트의 `status`가 `CLOSED`에서 `RECRUITING`으로 변경됩니다.
- **모집 인원 검증 (PR-03):** 재설정하는 `recruitCount`는 현재 합류한 인원(`currentCount`)보다 커야 합니다.
- **마감 기한 검증 (PR-04):** `endDate`는 요청 시점의 날짜보다 이후(미래)여야 합니다.
- **권한 검증:** 오직 프로젝트의 방장(`OWNER`)만이 재모집을 수행할 수 있습니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "재모집이 시작되었습니다.",
    "data": {
        "id": 3,
        "ownerId": 5,
        "ownerNickname": "테스트tt",
        "category": "PROJECT",
        "title": "경험 많은 팀원 구함",
        "content": "앱 개발 프로젝트입니다.",
        "recruitCount": 5,
        "currentCount": 1,
        "status": "RECRUITING",
        "onOffline": "OFFLINE",
        "endDate": "2026-12-31",
        "remainingDays": 271,
        "createdAt": null,
        "deleted": false,
        "role": "OWNER",
        "owner": true
    }
}
```

---

### **4.3 지원 및 매칭 API (Applications)**

### **4.3.1 프로젝트 지원 (로그인 필요)**

```
POST /api/applications/{projectId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
    "message": "백엔드 개발자로 참여하고 싶습니다! 열심히 하겠습니다."
}
```

Response 200 OK:

```jsx
{
    "success": true,
    "message": "지원이 완료되었습니다.",
    "data": {
        "id": 4,
        "projectId": 3,
        "projectTitle": "경험 많은 팀원 구함",
        "applicantId": 6,
        "message": "백엔드 개발자로 참여하고 싶습니다! 열심히 하겠습니다.",
        "applicantNickname": "테스트",
        "applicantPosition": "BE",
        "status": "PENDING",
        "createdAt": "2026-04-04T17:32:34.5214023"
    }
}
```

---

### **4.3.2 지원서 승인/거절 (OWNER 전용)**

```
PATCH /api/applications/{id}/status (status) -> accept/reject
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "지원서가 승인되었습니다.",
    "data": {
        "id": 4,
        "projectId": 3,
        "projectTitle": "경험 많은 팀원 구함",
        "applicantId": 6,
        "message": "백엔드 개발자로 참여하고 싶습니다! 열심히 하겠습니다.",
        "applicantNickname": "테스트",
        "applicantPosition": "BE",
        "status": "ACCEPTED",
        "createdAt": "2026-04-04T17:32:34.521402"
    }
}
```

```jsx
{
    "success": true,
    "message": "지원서가 거절되었습니다.",
    "data": {
        "id": 5,
        "projectId": 3,
        "projectTitle": "경험 많은 팀원 구함",
        "applicantId": 7,
        "message": "프론트엔드 개발자로 참여하고 싶습니다! 진짜로 열심히 하겠습니다.",
        "applicantNickname": "테스트xx",
        "applicantPosition": "BE",
        "status": "REJECTED",
        "createdAt": "2026-04-04T17:39:50.196149"
    }
}
```

---

### 4.3.3 지원 취소 (본인 전용)

```json
DELETE /api/applications/{applicationId}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- 지원서의 현재 상태가 **`PENDING` (대기 중)** 일 때만 취소할 수 있습니다. 이미 승인되거나 거절된 상태에서는 취소가 불가능합니다 (MR-04).

**Response 200 OK:**

```json
{
    "success": true,
    "message": "지원이 취소되었습니다.",
    "data": null
}
```

---

### **4.4 팀원 관리 API (Project Members)**

### **4.4.1 팀원 목록 조회**

```
GET /api/posts/{projectId}/members
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "프로젝트 멤버 목록 조회가 완료되었습니다.",
    "data": [
        {
            "id": 2,
            "projectId": 3,
            "userId": 5,
            "role": "OWNER",
            "nickname": "테스트",
            "position": "BE"
        },
        {
            "id": 3,
            "projectId": 3,
            "userId": 6,
            "role": "MEMBER",
            "nickname": "테스트xx",
            "position": "BE"
        }
    ]
}
```

---

### **4.4.2 팀원 강제 퇴출 (OWNER 전용)**

```
DELETE /api/posts/members/{memberId}
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```jsx
{
    "success": true,
    "message": "멤버가 성공적으로 제외되었습니다.",
    "data": null
}
```

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
    "message": "내 정보 조회가 완료되었습니다.",
    "data": {
        "id": 5,
        "email": "testuser2@mate.com",
        "nickname": "새로운닉네임",
        "phoneNumber": "01012345679",
        "position": "FE",
        "techStacks": [
            "Java",
            "MySQL",
            "Spring Boot"
        ],
        "profileImg": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        "createdAt": "2026-04-04T11:51:35.592145"
    }
}
```

---

### **4.5.2 내 정보 수정 (로그인 필요)**

```
PATCH /api/users/me
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "nickname": "새로운닉네임",
  "position": "FE"
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
    "message": "유저 정보가 성공적으로 수정되었습니다.",
    "data": {
        "id": 5,
        "email": "testuser2@mate.com",
        "nickname": "새로운닉네임",
        "phoneNumber": "01012345679",
        "position": "FE",
        "techStacks": [
            "Java",
            "MySQL",
            "Spring Boot"
        ],
        "profileImg": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        "createdAt": "2026-04-04T11:51:35.592145"
    }
}
```

---

### 4.5.3 내 활동 이력 조회(모집글/지원내역)

### (1) 내 모집글 조회 (내가 방장인 것)

> **Description:** 내가 `owner`인 프로젝트 목록을 조회합니다. (클릭 시 **팀 게시판** 이동용)
> 

```json
GET /api/users/me/posts/owned
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "내 모집글 조회가 완료되었습니다.",
    "data": [
        {
            "id": 3,
            "ownerId": 5,
            "ownerNickname": "새로운닉네임",
            "category": "STUDY",
            "title": "백엔드 메이트 구함",
            "content": "스프링 부트 고도화 프로젝트입니다.",
            "recruitCount": 4,
            "currentCount": 1,
            "status": "RECRUITING",
            "onOffline": "ONLINE",
            "endDate": "2026-12-31",
            "remainingDays": 271,
            "createdAt": null,
            "deleted": false,
            "role": "OWNER",
            "owner": true
        }
    ]
}
```

### (2) 내 프로젝트/스터디 조회 (승인되어 참여 중인 것)

> **Description:** 신청 상태가 `ACCEPTED`인 프로젝트 목록을 조회합니다. (클릭 시 **팀 게시판** 이동용)
> 

```json
GET /api/users/me/posts/joined
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "참여 중인 프로젝트 조회가 완료되었습니다.",
    "data": [
        {
            "id": 4,
            "ownerId": 6,
            "ownerNickname": "테스트tt",
            "category": "STUDY",
            "title": "프론트 메이트 구함",
            "content": "웹 개발 프로젝트입니다.",
            "recruitCount": 5,
            "currentCount": 2,
            "status": "RECRUITING",
            "onOffline": "OFFLINE",
            "endDate": "2026-12-31",
            "remainingDays": 271,
            "createdAt": null,
            "deleted": false,
            "role": "MEMBER",
            "owner": false
        }
    ]
}
```

### (3) 내 신청 현황 조회 (대기/거절 상태인 것)

> **Description:** 내가 신청했지만 아직 `PENDING` 또는 `REJECTED`인 내역을 조회합니다. (클릭 시 **모집 상세** 이동용)
> 

```json
GET /api/users/me/applications
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "내 신청 및 거절 현황 조회가 완료되었습니다.",
    "data": [
        {
            "id": 5,
            "projectId": 5,
            "projectTitle": "경험 많은 팀원 구함",
            "applicantId": 5,
            "message": "백엔드 개발자로 참여하고 싶습니다! 열심히 하겠습니다.",
            "applicantNickname": "새로운닉네임",
            "applicantPosition": "FE",
            "status": "REJECTED",
            "createdAt": "2026-04-04T11:59:11.29768"
        }
    ]
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
    1. 기존에 등록된 이미지가 '기본 이미지'가 아닌 사용자 지정 이미지라면, 스토리지에서 기존 파일을 먼저 삭제합니다. (용량 낭비 방지)
    2. 새로운 이미지를 스토리지에 업로드하고 새 URL을 발급받습니다.
- **DB 업데이트**: users 테이블의 프로필 이미지 URL 컬럼을 새 URL로 갱신합니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "프로필 이미지가 성공적으로 수정되었습니다.",
    "data": "/uploads/profiles/d9002b2b-c1b3-4dbb-82ee-07f646e0bf75.png"
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
- **스토리지(S3) 처리**: 기존 이미지가 사용자 지정 이미지일 경우, 스토리지에서 해당 파일을 물리적으로 삭제합니다. (지금은 로컬 폴더에 저장)
- **DB 업데이트**: users 테이블의 프로필 이미지 URL 컬럼을 서버에 지정된 **기본 프로필 이미지 URL**로 덮어씌웁니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "프로필 이미지가 기본 이미지로 초기화되었습니다.",
    "data": null
}
```

---

### 4.6 내부 소통 API (Board & Comment)

- **접근 권한:** 해당 프로젝트의 `Project_Members` 테이블에 등록된 팀 멤버(**`MEMBER`**, **`OWNER`**)만 접근 가능합니다.

### 4.6.1 내부 게시글 목록 조회

```json
GET /api/posts/{projectid}/board
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "게시글 목록 조회가 완료되었습니다.",
    "data": [
        {
            "id": 2,
            "projectId": 3,
            "authorId": 7,
            "authorNickname": "테스트xx",
            "title": "두 번째 논의사항 ",
            "content": "언제 만나요.",
            "viewCount": 0,
            "createdAt": "2026-04-04T10:49:30.390983",
            "author": false
        },
        {
            "id": 1,
            "projectId": 3,
            "authorId": 5,
            "authorNickname": "테스트",
            "title": "첫 번째 공지사항 ",
            "content": "내용이 있있있습니다.",
            "viewCount": 0,
            "createdAt": "2026-04-04T10:47:44.529514",
            "author": true
        }
    ]
}
```

---

### 4.6.2 내부 게시글 상세 조회 (NEW)

```json
GET /api/posts/{projectId}/board/{postId}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- **권한 검증:** 해당 프로젝트의 소속 팀원(MEMBER, OWNER)만 읽을 수 있습니다.
- **조회수 증가 로직:** API 호출 성공 시 해당 게시글의 조회수(`viewCount`)가 1 증가해야 합니다. (단, 무한 새로고침 어뷰징 방지를 위해 쿠키나 레디스를 활용한 중복 증가 방지 로직을 고려할 수 있습니다.)

**Response 200 OK:**

```json
{
    "success": true,
    "message": "게시글 조회가 완료되었습니다.",
    "data": {
        "id": 1,
        "projectId": 3,
        "authorId": 5,
        "authorNickname": "테스트",
        "title": "첫 번째 공지사항 ",
        "content": "내용이 있있있습니다.",
        "viewCount": 2,
        "createdAt": "2026-04-04T10:47:44.529514",
        "author": false
    }
}
```

---

### 4.6.3 내부 게시글 작성

```json
POST /api/posts/{projectid}/board
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

**Response 200 OK:**

```json
{
    "success": true,
    "message": "게시글이 성공적으로 작성되었습니다.",
    "data": {
        "id": 2,
        "projectId": 3,
        "authorId": 7,
        "authorNickname": "테스트xx",
        "title": "두 번째 논의사항 ",
        "content": "언제 만나요.",
        "viewCount": 0,
        "createdAt": "2026-04-04T10:49:30.390983",
        "author": true
    }
}
```

---

### 4.6.4 내부 게시글 수정(본인 전용)

```json
PATCH /api/posts/{projectId}/board/{postId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
    "title": "첫 번째 논의사항(수정)",
    "content": "내일 아침 9시 회의 있습니다."
}
```

**비즈니스 규칙:**

- **권한 검증:** 게시글 작성자 본인만 수정이 가능합니다. (방장이라도 타인의 글 내용을 임의로 수정할 수는 없도록 설계하는 것이 일반적입니다.)

**Response 200 OK:**

```json
{
    "success": true,
    "message": "게시글이 수정되었습니다.",
    "data": {
        "id": 2,
        "projectId": 3,
        "authorId": 7,
        "authorNickname": "테스트xx",
        "title": "첫 번째 논의사항(수정)",
        "content": "내일 아침 9시 회의 있습니다.",
        "viewCount": 2,
        "createdAt": "2026-04-04T10:49:30.390983",
        "author": true
    }
}
```

---

### 4.6.5 내부 게시글 삭제 (Soft Delete)

```json
DELETE /api/posts/{projectId}/board/{postId}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- **권한 검증 (BDR-02):** 게시글 작성자 본인, 해당 프로젝트의 방장(OWNER), 또는 시스템 관리자(ADMIN)만 삭제할 수 있습니다.
- **데이터 처리:** 실제 삭제가 아닌 `deleted_at` 컬럼을 업데이트하는 **Soft Delete** 방식을 사용합니다. 게시글 삭제 시 해당 글에 달린 모든 댓글도 함께 조회되지 않도록 처리해야 합니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "게시글이 성공적으로 삭제되었습니다.",
    "data": null
}
```

---

### 4.6.6 댓글 작성

```json
POST /api/posts/{projectId}/board/{postId}/comments
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
    "content": "저도 인정합니다!"
}
```

**Response 200 OK:**

```json
{
    "success": true,
    "message": "댓글이 성공적으로 작성되었습니다.",
    "data": {
        "id": 3,
        "postId": 3,
        "authorId": 7,
        "authorNickname": "테스트xx",
        "authorProfileImg": null,
        "content": "저도 인정합니다!",
        "createdAt": "2026-04-04T11:08:37.0404909"
    }
}
```

---

### 4.6.7 댓글 수정 (본인 전용)

```json
PATCH /api/posts/comments/{commentId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
    "content": "좋은가 잘 모르겠어요."
}
```

**비즈니스 규칙:**

- **권한 검증:** 댓글의 작성자(`authorId`)와 현재 로그인한 유저가 일치해야만 수정이 가능합니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "댓글이 성공적으로 수정되었습니다.",
    "data": {
        "id": 1,
        "postId": 3,
        "authorId": 5,
        "authorNickname": "테스트",
        "authorProfileImg": null,
        "content": "좋은가 잘 모르겠어요.",
        "createdAt": "2026-04-04T11:07:46.866266"
    }
}
```

---

### 4.6.8 댓글 삭제

```json
DELETE /api/posts/comments/{commentId}
Authorization: Bearer {JWT_TOKEN}
```

**비즈니스 규칙:**

- **권한 검증:** 1. 댓글 작성자 본인, 2. 해당 프로젝트의 방장(**OWNER**), 3. 시스템 관리자(ADMIN)
    - 위 세 경우 중 하나라도 해당하면 삭제가 가능합니다. (방장은 팀원 간 부적절한 언행을 제재할 권한이 있음)
- **데이터 처리:** 게시글과 동일하게 **Soft Delete**를 적용하여 `deleted_at` 컬럼을 업데이트합니다.

**Response 200 OK:**

```json
{
    "success": true,
    "message": "댓글이 성공적으로 삭제되었습니다.",
    "data": null
}
```

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
| **인증 (Auth)** | POST | `/api/auth/signup` | 회원가입 (기본 이미지 자동 할당) | GUEST |
|  | POST | `/api/auth/login` | 로그인 (JWT 발급) | GUEST |
|  | POST | `/api/auth/logout` | 로그아웃 | USER |
|  | POST | `/api/auth/refresh` | 토큰 재발급 (Refresh Token 활용) | GUEST |
|  | POST | `/api/auth/find-email` | 아이디(이메일) 찾기 | GUEST |
|  | POST | `/api/auth/reset-password` | 임시 비밀번호 발급 | GUEST |
|  | GET | `/api/auth/check-phone` | 전화번호 중복 체크 | GUEST |
|  | GET | `/api/auth/check-nickname` | 닉네임 중복 체크 | GUEST |
|  | GET | `/api/auth/check-email` | 이메일 중복 체크 | GUEST |
| **마이페이지 (Users)** | GET | `/api/users/me` | 내 프로필 정보 조회 | USER |
|  | PATCH | `/api/users/me` | 내 정보 수정 (닉네임, 포지션 등) | USER |
|  | PATCH | `/api/users/profile-image` | 프로필 이미지 업로드/수정 (Multipart) | USER |
|  | DELETE | `/api/users/profile-image` | 프로필 이미지 삭제 (기본값 초기화) | USER |
|  | DELETE | `/api/users/me` | **회원 탈퇴 (Soft Delete)** | USER |
|  | GET | `/api/users/me/posts/owned` | 내가 방장인 프로젝트 목록 조회 | USER |
|  | GET | `/api/users/me/posts/joined` | 내가 참여 중인 프로젝트 목록 조회 | USER |
|  | GET | `/api/users/me/applications` | 내 지원 현황(대기/거절) 조회 | USER |
| **모집글 (Projects)** | GET | `/api/projects` | 모집글 목록 전체 조회 | GUEST |
|  | GET | `/api/projects/{projectId}` | 모집글 상세 조회 | GUEST |
|  | POST | `/api/projects` | 새로운 모집글 등록 | USER |
|  | PATCH | `/api/projects/{id}` | 모집글 부분 수정 | OWNER |
|  | PATCH | `/api/projects/{id}/close` | 모집 수동 마감 처리 | OWNER |
|  | PATCH | `/api/projects/{id}/reopen` | **마감된 프로젝트 재모집 시작** | OWNER |
|  | DELETE | `/api/projects/{id}` | **모집글 삭제 (Soft Delete)** | OWNER |
| **지원 (Apply)** | POST | `/api/applications/{projectId}` | 프로젝트 참여 지원 신청 | USER |
|  | PATCH | `/api/applications/{id}/status` status → accept/reject | 지원 승인/거절 처리 (accept/reject) | OWNER |
|  | DELETE | `/api/applications/{id}` | 지원 취소 (PENDING 상태만 가능) | USER(본인) |
| **팀원 (Members)** | GET | `/api/posts/{projectId}/members` | 해당 프로젝트 팀원 목록 조회 | MEMBER, OWNER |
|  | DELETE | `/api/posts/members/{memberId}` | **팀원 강제 퇴출 (방장 전용)** | OWNER |
| **팀 게시판 (Board)** | GET | `/api/posts/{projectId}/board` | 팀 내부 게시판 전체 목록 조회 | MEMBER, OWNER |
|  | GET | `/api/posts/{projectId}/board/{postId}` | 게시글 상세 조회 (조회수 증가) | MEMBER, OWNER |
|  | POST | `/api/posts/{projectId}/board` | 팀 내부 게시글 작성 | MEMBER, OWNER |
|  | PATCH | `/api/posts/{projectId}/board/{postId}` | 내부 게시글 수정 | 작성자 |
|  | DELETE | `/api/posts/{projectId}/board/{postId}` | **내부 게시글 삭제 (Soft Delete)** | 작성자, OWNER |
| **댓글 (Comment)** | POST | `/api/posts/{projectId}/board/{postId}/comments` | 게시글에 댓글 작성 | MEMBER, OWNER |
|  | PATCH | `/api/comments/{commentId}` | 댓글 수정 | 작성자 |
|  | DELETE | `/api/comments/{commentId}` | **댓글 삭제 (Soft Delete)** | 작성자, OWNER |
| **관리자 (Admin)** | GET | `/admin/users` | 전체 회원 목록 조회 (탈퇴자 포함) | ADMIN |
|  | PATCH | `/admin/users/{userId}/block` | 악성 유저 차단/해제 | ADMIN |
|  | PATCH | `/admin/posts/{postId}/hide` | 부적절한 게시글 숨김/공개 | ADMIN |
|  | PATCH | `/admin/users/{userId}/restore` | **탈퇴 유저 복구** | ADMIN |

---

### 6. 체크리스트 및 품질 관리

### 6.1 API 설계 품질

- ✅ **RESTful 계층 구조 준수**: 프로젝트-게시글-댓글로 이어지는 리소스 계층 구조가 URL에 명확히 반영되었는가? (예: `/api/posts/{projectId}/board/{boardPostId}`)
- ✅ **URL 플래트닝(Flattening) 적용**: 고유 ID가 존재하는 리소스(댓글 등)의 수정/삭제 시 불필요한 부모 경로를 제거하여 경로를 최적화하였는가?
- ✅ **일관된 네이밍**: 모든 엔드포인트에 소문자, 하이픈(-), 복수형 명사를 사용하고 명사 위주의 경로를 설계하였는가?
- ✅ **HTTP 메서드 최적화**: 멱등성을 고려하여 GET(조회), POST(등록), PUT(전체수정), PATCH(부분수정), DELETE(삭제)를 용도에 맞게 선택하였는가?
- ✅ **표준 응답 포맷**: 모든 응답이 `{ "success", "data", "message", "timestamp" }` 공통 규격을 예외 없이 따르는가?

### 6.2 보안 및 검증 (Service & Logic)

- ✅ **입력값 검증(Validation)**: 닉네임, 비밀번호, 전화번호(하이픈 제외 11자) 등 도메인별 유효성 검사 로직이 Service 계층에 구현되었는가?
- ✅ **개인정보 암호화 및 마스킹**: 비밀번호는 **BCrypt**로 암호화되어 저장되며, 아이디 찾기 시 이메일의 일부가 **마스킹 처리**되어 반환되는가?
- ✅ **권한 제어(RBAC) 및 검증**: API 호출자가 해당 리소스(게시글/댓글)의 **작성자**이거나 **OWNER**인지 확인하는 권한 검증 로직이 포함되었는가?
- ✅ **멀티파트 보안**: 프로필 이미지 업로드 시 파일 확장자(JPG, PNG) 및 용량(5MB) 제한 검증이 수행되는가?

### 6.3 성능 및 데이터 정합성 (Transaction & DB)

- ✅ **트랜잭션 원자성(`@Transactional`)**: 지원서 승인 시 '인원 수 증가'와 '상태 변경'이 하나의 트랜잭션으로 묶여 데이터 정합성을 보장하는가?
- ✅ **Soft Delete 구현**: 회원 탈퇴, 게시글/댓글 삭제 시 실제 삭제가 아닌 `deleted_at` 컬럼 업데이트를 통해 데이터 이력을 보존하는가?
- ✅ **파일 스토리지 정합성**: 프로필 이미지 수정/삭제 시 DB 기록 변경과 동시에 **S3의 물리적 파일 삭제**가 정상적으로 연동되는가?
- ✅ **조회 성능 최적화**: 검색 및 중복 체크가 빈번한 `email`, `nickname`, `phone_number` 컬럼에 인덱스(Index) 설계를 고려하였는가?
- ✅ **전역 예외 처리**: 서비스에서 발생하는 커스텀 예외(`PostNotFoundException` 등)를 `@RestControllerAdvice`에서 잡아 표준 에러 포맷으로 변환하는가?