# Entity 설계서

## 문서 정보

| **항목** | **내용** |
| --- | --- |
| **프로젝트명** | MATE (팀 프로젝트/스터디 매칭 플랫폼) |
| **작성자** | 이예린, 윤형진, 홍지호 |
| **작성일** | 2026-03-30 |
| **검토자** | 팀 전체 |
| **버전** | v1.0 |

## 1. Entity 설계 개요

### 1.1 설계 목적

> JPA Entity 클래스 설계를 통해 객체-관계 매핑(ORM)을 정의하고, MATE의 비즈니스 도메인(회원, 모집글, 지원, 소통)을 코드로 표현하여 유지보수가 용이한 시스템을 구축한다.
> 

### 1.2 설계 원칙

- **단일 책임 원칙**: 하나의 Entity는 하나의 비즈니스 개념만 표현
- **캡슐화**: 비즈니스 로직(예: 인원 증가, 상태 변경 등)을 Entity 내부에 구현
- **지연 로딩(LAZY)**: 모든 연관관계는 `FetchType.LAZY`를 기본으로 사용하여 N+1 문제 사전 방지

### 1.3 기술 스택

- **ORM 프레임워크**: Spring Data JPA
- **데이터베이스**: MariaDB
- **검증 프레임워크**: Bean Validation (`@NotNull`, `@Size` 등)
- **감사 기능**: Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`)

---

## 2. Entity 목록 및 분류

### 2.1 Entity 분류 매트릭스

| **Entity명** | **유형** | **비즈니스 중요도** | **기술적 복잡도** | **연관관계 수** | **우선순위** |
| --- | --- | --- | --- | --- | --- |
| **User** | 핵심 | 높음 | 중간 | 4개 | 1순위 |
| **Project** | 핵심 | 높음 | 중간 | 4개 | 1순위 |
| **Application** | 핵심 | 높음 | 높음 | 2개 | 1순위 |
| **ProjectMember** | 핵심 | 높음 | 중간 | 2개 | 2순위 |
| **BoardPost** | 지원 | 중간 | 낮음 | 3개 | 3순위 |
| **Comment** | 지원 | 중간 | 낮음 | 2개 | 3순위 |

---

## 3. 공통 설계 규칙

### 3.1 공통 Base Entity

- 모든 엔티티에 공통으로 들어가는 생성/수정/삭제 시간을 관리 (Soft Delete 지원)

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // Soft Delete 처리용
}
```

## 4. 상세 Entity 설계

### 4.1 User (사용자) Entity

**4.1.1 구현 코드 및 속성/연관관계/제약조건 명세**

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_nickname", columnList = "nickname"),
    @Index(name = "idx_phone_number", columnList = "phone_number") // 아이디/비밀번호 찾기 속도 향상을 위한 인덱스
})
@Where(clause = "deleted_at IS NULL") // Soft Delete 된 데이터 조회 방지
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @Email(message = "이메일 형식이 올바르지 않습니다")
    @NotBlank(message = "이메일은 필수입니다")
    private String email;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;

    @Column(nullable = false, unique = true, length = 10)
    @Size(min = 2, max = 10, message = "닉네임은 2~10자 사이여야 합니다")
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Position position; // FE, BE, DE, PM, ETC

    @Column(name = "profile_img", length = 255)
    private String profileImg;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    @NotBlank(message = "전화번호는 필수입니다")
    private String phoneNumber; 

    // 기술 스택 (별도 테이블 매핑 컬렉션)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_tech_stacks", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "tech_stack", length = 50)
    private Set<String> techStacks = new HashSet<>();

    // 양방향 연관관계 (방장으로서 생성한 프로젝트 목록)
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<Project> myProjects = new ArrayList<>();

    // ==== 비즈니스 메서드 ====

    /**
     * 비밀번호 변경 및 임시 비밀번호 업데이트를 위한 메서드
     * @param encodedPassword 암호화된 새 비밀번호
     */
    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    // 프로필 정보 수정 메서드
    public void updateProfile(String nickname, String profileImg) {
        this.nickname = nickname;
        this.profileImg = profileImg;
    }
}
```

### 4.2 Project (모집글) Entity

**4.2.1 구현 코드 및 명세**

```java
@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_status", columnList = "status")
})
@Where(clause = "deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "제목은 필수입니다")
    @Size(min = 5, max = 50, message = "제목은 5~50자 이내여야 합니다")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Column(name = "recruit_count", nullable = false)
    @Min(value = 1, message = "모집 인원은 1명 이상이어야 합니다")
    @Max(value = 20, message = "모집 인원은 20명을 넘을 수 없습니다")
    private Integer recruitCount;

    @Column(name = "current_count", nullable = false)
    private Integer currentCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "on_offline", nullable = false, length = 20)
    private OnOffline onOffline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.RECRUITING;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // 비즈니스 메서드
    public void addMember() {
        if (this.currentCount >= this.recruitCount) {
            throw new IllegalStateException("모집 정원이 가득 찼습니다.");
        }
        this.currentCount++;
        if (this.currentCount.equals(this.recruitCount)) {
            this.status = ProjectStatus.CLOSED; // 정원 충족 시 자동 마감
        }
    }
}
```

### 4.3 Application (지원서) Entity

**4.3.1 구현 코드 및 명세**

```java
@Entity
@Table(name = "applications")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(nullable = false, length = 500)
    @NotBlank
    @Size(min = 10, max = 500, message = "지원 동기는 10~500자 사이여야 합니다")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @CreatedDate
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    // 비즈니스 메서드
    public void accept() {
        this.status = ApplicationStatus.ACCEPTED;
    }

    public void reject() {
        this.status = ApplicationStatus.REJECTED;
    }
}
```

### 4.4 ProjectMember (팀 멤버) Entity

```java
@Entity
@Table(name = "project_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "user_id"}) // 동일 유저 중복 가입 방지
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class ProjectMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @CreatedDate
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
}
```

### 4.5 BoardPost (프로젝트 내부 게시글) Entity

```java
@Entity
@Table(name = "board_posts")
@Where(clause = "deleted_at IS NULL") // Soft Delete 된 데이터 조회 방지
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class BoardPost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0; // 조회수 속성 (인기글 정렬 등에 활용)

    // 비즈니스 메서드
    public void incrementViewCount() {
        this.viewCount++;
    }
}
```

### 4.6 Comment (게시글 댓글) Entity

```java
@Entity
@Table(name = "comments")
@Where(clause = "deleted_at IS NULL") // Soft Delete 된 데이터 조회 방지
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BoardPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(min = 1, max = 500, message = "댓글은 1~500자 사이여야 합니다")
    private String content;

    // 비즈니스 메서드
    public void updateContent(String content) {
        this.content = content;
    }
}
```

---

## 5. Enum 타입 정의

```java
public enum Position { FE, BE, DE, PM, ETC }
public enum Category { STUDY, PROJECT }
public enum OnOffline { ONLINE, OFFLINE, BOTH }
public enum ProjectStatus { RECRUITING, CLOSED, DELETED }
public enum ApplicationStatus { PENDING, ACCEPTED, REJECTED }
public enum MemberRole { OWNER, MEMBER }
```

### 5.1 Position (사용자 직군)

- 사용자가 프로필에 설정하는 주 역할 및 포지션을 정의

```java
public enum Position {
    FE,     // 프론트엔드 (Front-End) 개발자
    BE,     // 백엔드 (Back-End) 개발자
    DE,     // 데이터 엔지니어 (Data Engineer)
    PM,     // 기획자 또는 프로젝트 매니저 (Product/Project Manager)
    ETC     // 디자이너 등 기타 직군
}
```

### 5.2 Category (모집글 유형)

- 방장이 개설하는 모임의 목적을 분류

```java
public enum Category {
    STUDY,      // 기술 스택 학습 및 지식 공유가 목적인 스터디
    PROJECT     // 실제 서비스 기획 및 산출물 개발이 목적인 프로젝트
}
```

### 5.3 OnOffline (진행 방식)

- 모임이 진행되는 온/오프라인 방식을 정의

```java
public enum OnOffline {
    ONLINE,     // 100% 비대면 화상/음성 미팅 기반
    OFFLINE,    // 오프라인 대면 모임 기반
    BOTH        // 온/오프라인 병행
}
```

### 5.4 ProjectStatus (프로젝트/모집글 상태)

- 모집글의 생명주기를 관리하며, 지원 가능 여부를 결정하는 핵심 상태값

```java
public enum ProjectStatus {
    RECRUITING,  // 모집 중: 생성 직후 상태. 사용자들이 지원할 수 있음
    CLOSED,      // 모집 마감: currentCount가 recruitCount에 도달하거나 방장이 수동으로 마감한 상태. 추가 지원 불가
    DELETED      // 삭제됨: Soft Delete 처리되어 목록에서 노출되지 않는 상태
}
```

### 5.5 ApplicationStatus (지원서 상태)

- 사용자가 특정 프로젝트에 지원했을 때의 처리 과정

```java
public enum ApplicationStatus {
    PENDING,  // 대기 중: 지원서를 제출하고 방장의 응답을 기다리는 상태 (이 상태일 때만 지원 취소가 가능)
    ACCEPTED, // 승인됨: 방장이 수락하여 ProjectMember에 데이터가 생성된 상태
    REJECTED  // 거절됨: 방장이 거절했거나, 프로젝트가 CLOSED 되어 자동으로 처리된 상태
}
```

### 5.6 MemberRole (팀 멤버 권한)

- 프로젝트 내에서 게시판 접근 제어 및 관리 권한을 구분

```java
public enum MemberRole {
    OWNER,  // 방장: 모집글을 생성한 주체. 지원자 승인/거절, 게시글 수정/마감, 멤버 강제 퇴출 권한을 가짐
    MEMBER  // 일반 팀원: 지원이 승인되어 합류한 팀원. 내부 소통 게시판(Board) 조회 및 작성 권한을 가짐
}
```

---

## 6. 연관관계 매핑 전략 및 정의

프로젝트의 성능 최적화와 데이터 무결성을 유지하기 위한 연관관계 매핑 원칙을 정의

### 6.1 기본 매핑 원칙

- **지연 로딩(LAZY) 의무화:** 모든 연관관계 매핑(`@ManyToOne`, `@OneToMany`)에는 반드시 `fetch = FetchType.LAZY`를 적용하여 불필요한 연관 데이터 로딩 및 N+1 문제를 사전에 차단한다.
- **N:M(다대다) 관계 지양:** `@ManyToMany` 어노테이션은 사용하지 않으며, 본 프로젝트의 `Application`(지원), `ProjectMember`(멤버십)와 같이 중간 테이블(Entity)을 승격시켜 `1:N`, `N:1` 관계로 풀어낸다.
- **연관관계의 주인(Owner) 명시:** 양방향 매핑 시, 외래키(FK)를 쥐고 있는 '다(N)' 쪽의 엔티티를 연관관계의 주인으로 설정(`@JoinColumn` 사용)하고, '일(1)' 쪽에서는 `mappedBy` 속성을 사용하여 읽기 전용으로 매핑한다.

### 6.2 영속성 전이 (Cascade) 및 Soft Delete 정책

- **물리적 삭제(CascadeType.REMOVE, orphanRemoval) 금지:** MATE 플랫폼은 데이터의 이력 보존을 위해 물리적 삭제 대신 `deleted_at` 컬럼을 활용한 논리적 삭제(Soft Delete)를 기본 정책으로 한다.
- 따라서 부모 엔티티(예: Project)가 삭제될 때 자식 엔티티(예: BoardPost, Application)가 연쇄적으로 물리적 삭제가 일어나지 않도록 `CascadeType.REMOVE` 옵션은 엄격히 제한한다.
- 삭제 처리가 필요할 경우, 부모 엔티티의 `delete()` 비즈니스 메서드 내에서 연관된 자식 엔티티들의 상태(또는 `deleted_at`)를 일괄 변경하는 로직을 직접 구현한다.

### 6.3 양방향 매핑 관리

- 엔티티 간의 결합도를 낮추기 위해 **단방향 매핑을 우선**으로 설계한다.
- 단, `User`가 작성한 `Project` 목록 조회처럼 비즈니스 로직상 조회가 빈번하게 일어나는 곳에만 제한적으로 양방향 매핑을 허용한다.
- 양방향 매핑된 리스트에 데이터를 추가할 때는, 객체 상태의 일관성을 위해 반드시 양쪽 엔티티 모두에 값을 세팅하는 연관관계 편의 메서드를 작성하여 사용한다.