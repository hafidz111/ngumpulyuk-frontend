import { errorPath } from '../config/routes';

export const SERVICE_ERROR_HTTP_CODES = Object.freeze([500, 502, 503]);

/**
 * @param {unknown} status
 * @returns {status is 500 | 502 | 503}
 */
export function isServiceErrorStatus(status) {
  const n = Number(status);
  return SERVICE_ERROR_HTTP_CODES.includes(n);
}

/**
 * @param {unknown} status
 * @returns {string | null}
 */
export function getServiceErrorPath(status) {
  if (!isServiceErrorStatus(status)) return null;
  return errorPath(/** @type {500 | 502 | 503} */ (Number(status)));
}
