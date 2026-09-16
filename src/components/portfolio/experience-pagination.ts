export const EXPERIENCES_PER_PAGE = 4;

export function getExperiencePagination(
  totalExperiences: number,
  visibleCount: number,
) {
  const totalCount = Math.max(totalExperiences, 0);
  const normalizedVisibleCount = Math.min(
    Math.max(visibleCount, 0),
    totalCount,
  );

  const remainingCount = totalCount - normalizedVisibleCount;

  return {
    visibleCount: normalizedVisibleCount,
    remainingCount,
    nextBatchCount: Math.min(EXPERIENCES_PER_PAGE, remainingCount),
  };
}

export function getNextVisibleExperienceCount(
  visibleCount: number,
  totalExperiences: number,
) {
  return Math.min(
    visibleCount + EXPERIENCES_PER_PAGE,
    Math.max(totalExperiences, 0),
  );
}
