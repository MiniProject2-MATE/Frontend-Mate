# 📋 지원서 상세 조회 API 수정 가이드

현재 마이페이지의 지원자 관리 모달에서 일부 필수 정보가 노출되지 않거나 '미입력'으로 표시되는 문제가 있습니다. 프론트엔드 코드 분석 결과, 백엔드 응답 DTO에서 특정 필드가 누락되어 발생한 현상입니다.

## 1. 현재 문제 상황
- **기술 스택 (`techStacks`):** 응답에는 포함되어 있으나, 일부 환경에서 확인이 필요함.
- **참고 링크 (`link`):** API 응답 필드에서 아예 누락되어 화면에 노출되지 않음.
- **소통 채널 (`contact`):** DB에는 데이터가 있으나 API 응답 필드에 없어 화면에서 '미입력'으로 표시됨.

---

## 2. DTO 수정 요청 사항 (Critical)

`ApplicationResponseDto` (또는 지원자 목록 조회 시 사용하는 DTO)에 아래 필드들을 추가하고 매핑해 주세요.

### 요청 필드 목록
| 필드명 | 타입 | 설명 | 비고 |
| --- | --- | --- | --- |
| `message` | String | 지원 메시지 (자기소개) | 현재 포함됨 |
| `techStacks` | List<String> | 지원자의 기술 스택 리스트 | 현재 포함됨 |
| **`link`** | String | 포트폴리오/깃허브 등 참고 링크 | **추가 필요** |
| **`contact`** | String | 카카오톡 아이디/오픈채팅 등 소통 채널 | **추가 필요** |

### 기대하는 JSON 응답 구조 (data 배열 내부)
```json
{
    "id": 1,
    "projectId": 1,
    "applicantNickname": "rookies2",
    "applicantPosition": "BE",
    "message": "열심히 하겠습니다!",
    "techStacks": ["JavaScript", "GraphQL", "Notion"],
    "link": "https://github.com/user", // 이 필드가 있어야 함
    "contact": "kakao_id_123",         // 이 필드가 있어야 함
    "status": "PENDING",
    "createdAt": "2026-04-07T09:26:07"
}
```

---

## 3. 해결을 위한 백엔드 체크리스트
1. **Entity 확인:** `Application` 엔티티에 `link`와 `contact` 컬럼이 있는지 확인.
2. **Mapper 수정:** `ApplicationMapper`에서 엔티티의 `link`, `contact` 값을 DTO로 복사하는 로직 추가.
3. **DTO 확인:** `ApplicationResponseDto` 클래스에 `private String link;`, `private String contact;` 선언 여부 확인.

---

**위 필드들이 추가되면 프론트엔드에서 즉시 정상 노출되도록 구현이 완료된 상태입니다.**
