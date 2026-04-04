/**
 * 모집글의 상태를 동적으로 계산합니다. (REST API 설계서 v1.1 반영)
 * @param {Object} post - 모집글 데이터
 * @returns {string} - 'RECRUITING' | 'DEADLINE_SOON' | 'CLOSED'
 */
export const getDynamicStatus = (post) => {
  if (!post) return 'RECRUITING';

  const { status, recruitCount, currentCount, endDate, remainingDays } = post;

  // 1. 서버에서 명시적으로 마감(CLOSED)된 경우 즉시 종료
  if (status === 'CLOSED') return 'CLOSED';

  // 2. 인원이 가득 찬 경우 (모집 인원 <= 현재 인원)
  if (recruitCount > 0 && currentCount >= recruitCount) return 'CLOSED';

  // 3. 마감 임박 조건 체크 (DEADLINE_SOON)
  // 조건 A: 모집 인원까지 단 1명만 남았을 때 (사용자 참여 유도 UX)
  if (recruitCount - currentCount === 1) return 'DEADLINE_SOON';

  // 4. 시간 기반 상태 계산
  let daysLeft = null;

  // 설계서 v1.1 규격: 서버에서 remainingDays를 제공하는 경우 우선 활용
  if (typeof remainingDays === 'number') {
    daysLeft = remainingDays;
  } 
  // Fallback: 서버 데이터가 없을 경우 endDate를 기반으로 직접 계산
  else if (endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(endDate);
    
    // 이미 날짜가 지난 경우 마감 처리
    if (targetDate < today) return 'CLOSED';

    const diffTime = targetDate - today;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 최종 마감 임박 판단: 남은 일수가 0~3일 사이일 때
  if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 3) {
    return 'DEADLINE_SOON';
  }

  return 'RECRUITING';
};
