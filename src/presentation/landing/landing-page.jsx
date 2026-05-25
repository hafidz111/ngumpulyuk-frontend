import { Navigate } from 'react-router-dom';

import { getLandingContent } from '../../application/landing/use-cases/get-landing-content';
import { InMemoryLandingContentRepository } from '../../infrastructure/landing/repositories/in-memory-landing-content-repository';
import { ROUTES } from '../../shared/config/routes';
import { useAuth } from '../auth/hooks/use-auth';
import { LandingAiMatcherSection } from './components/landing-ai-matcher-section';
import { LandingFinalCtaSection } from './components/landing-final-cta-section';
import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import { LandingHeroSection } from './components/landing-hero-section';
import { LandingHowItWorksSection } from './components/landing-how-it-works-section';
import { LandingStatsSection } from './components/landing-stats-section';
import { LandingTestimonialsSection } from './components/landing-testimonials-section';
import { LandingTrendingActivitiesSection } from './components/landing-trending-activities-section';

const repository = new InMemoryLandingContentRepository();
const content = getLandingContent(repository);

function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (!user?.isOnboarded) {
      return <Navigate to={ROUTES.onboarding} replace />;
    }
    return <Navigate to={ROUTES.chat} replace />;
  }

  return (
    <div className='bg-surface text-foreground'>
      <LandingHeader brand={content.brand} navigation={content.navigation} />

      <main>
        <LandingHeroSection hero={content.hero} />
        <LandingStatsSection stats={content.stats} />
        <LandingTrendingActivitiesSection trending={content.trending} />
        <LandingHowItWorksSection steps={content.steps} />
        <LandingAiMatcherSection aiMatcher={content.aiMatcher} />
        <LandingTestimonialsSection
          heading={content.testimonialsHeading}
          testimonials={content.testimonials}
        />
        <LandingFinalCtaSection finalCta={content.finalCta} />
      </main>

      <LandingFooter brand={content.brand} footer={content.footer} />
    </div>
  );
}

export default LandingPage;
