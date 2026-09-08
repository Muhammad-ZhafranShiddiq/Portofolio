export const PROJECTS_PER_PAGE = 4;

export function getProjectPagination(
  projectCount: number,
  requestedVisibleCount: number,
) {
  const totalCount = Math.max(projectCount, 0);
  const visibleCount = Math.min(
    Math.max(requestedVisibleCount, 0),
    totalCount,
  );
  const remainingCount = totalCount - visibleCount;

  return {
    visibleCount,
    remainingCount,
    nextBatchCount: Math.min(PROJECTS_PER_PAGE, remainingCount),
  };
}

export function getNextVisibleProjectCount(
  currentVisibleCount: number,
  projectCount: number,
) {
  return Math.min(
    Math.max(currentVisibleCount, 0) + PROJECTS_PER_PAGE,
    Math.max(projectCount, 0),
  );
}
