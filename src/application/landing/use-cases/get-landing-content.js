import { createLandingContent } from '../../../domain/landing/entities/landing-content';

export function getLandingContent(repository) {
  const rawContent = repository.getLandingContent();
  return createLandingContent(rawContent);
}
