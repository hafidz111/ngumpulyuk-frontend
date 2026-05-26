/**
 * @typedef {Object} HomeRecommendedEvent
 * @property {string} id
 * @property {string} categoryLabel
 * @property {string} title
 * @property {string} datetimeLabel
 * @property {string} locationLabel
 * @property {number} participantsCurrent
 * @property {number} participantsMax
 * @property {string} imageUrl
 * @property {number} [matchPercent]
 *
 * @typedef {Object} HomeUpcomingEvent
 * @property {string} id
 * @property {string} title
 * @property {string} datetimeLabel
 * @property {string} locationLabel
 * @property {number} participantsCurrent
 * @property {number} participantsMax
 * @property {string} imageUrl
 *
 * @typedef {Object} HomeDashboardContent
 * @property {{ message: string, actionLabel: string }} notification
 * @property {{ title: string, seeAllLabel: string, items: HomeRecommendedEvent[] }} recommended
 * @property {{ title: string, items: HomeUpcomingEvent[] }} upcoming
 */

/**
 * @param {HomeDashboardContent} payload
 * @returns {HomeDashboardContent}
 */
export function createHomeDashboardContent(payload) {
  return Object.freeze({ ...payload });
}
