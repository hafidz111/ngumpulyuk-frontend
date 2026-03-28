export function createLandingContent(payload) {
  return {
    brand: payload.brand,
    navigation: payload.navigation,
    hero: payload.hero,
    stats: payload.stats,
    trending: payload.trending,
    steps: payload.steps,
    aiMatcher: payload.aiMatcher,
    testimonialsHeading: payload.testimonialsHeading,
    testimonials: payload.testimonials,
    finalCta: payload.finalCta,
    footer: payload.footer,
  };
}
