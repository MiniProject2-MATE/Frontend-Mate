/**
 * 모집글의 상태를 동적으로 계산합니다.
 * @param {Object} post - 모집글 데이터
 * @returns {string} - 'RECRUITING' | 'DEADLINE_SOON' | 'CLOSED'
 */
export const getDynamicStatus = (post) => {
  if (!post) return 'RECRUITING';

  const { status, recruitCount, currentCount, endDate } = post;

  // 1. 이미 서버에서 마감된 경우
  if (status === 'CLOSED') return 'CLOSED';

  // 2. 인원이 다 찬 경우
  if (recruitCount > 0 && currentCount >= recruitCount) return 'CLOSED';

  // 3. 마감 기한이 지난 경우
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (endDate) {
    const targetDate = new Date(endDate);
    if (targetDate < today) return 'CLOSED';

    // 4. 마감 임박 조건 체크 (모집 중인 경우에만)
    // 조건 A: 1명 남았을 때
    if (recruitCount - currentCount === 1) return 'DEADLINE_SOON';

    // 조건 B: 마감일이 3일 이내일 때
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) return 'DEADLINE_SOON';
  }

  return 'RECRUITING';
};
