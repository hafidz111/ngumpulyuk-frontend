/**
 * @param {{ getHomeDashboard: () => import('../../../domain/home/entities/home-dashboard-content').HomeDashboardContent }} repository
 */
export function getHomeDashboard(repository) {
  return repository.getHomeDashboard();
}
