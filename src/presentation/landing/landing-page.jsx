import { Navigate } from 'react-router-dom';

import { ROUTES } from '../../shared/config/routes';
import { useAuth } from '../auth/hooks/use-auth';
import { LandingAiMatcherSection } from './components/landing-ai-matcher-section';
import { LandingCommunitiesSection } from './components/landing-communities-section';
import { LandingFinalCtaSection } from './components/landing-final-cta-section';
import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import { LandingHeroSection } from './components/landing-hero-section';
import { LandingHowItWorksSection } from './components/landing-how-it-works-section';
import { LandingStatsSection } from './components/landing-stats-section';
import { LandingTrendingActivitiesSection } from './components/landing-trending-activities-section';
import { useLandingContent } from './hooks/use-landing-content';

function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { content, isRefreshing } = useLandingContent();

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
        <LandingHeroSection hero={content.hero} isRefreshing={isRefreshing} />
        <LandingStatsSection stats={content.stats} isRefreshing={isRefreshing} />
        <LandingAiMatcherSection aiMatcher={content.aiMatcher} />
        <LandingTrendingActivitiesSection
          trending={content.trending}
          isRefreshing={isRefreshing}
        />
        <LandingCommunitiesSection
          communities={content.communities}
          isRefreshing={isRefreshing}
        />
        <LandingHowItWorksSection steps={content.steps} />
        <LandingFinalCtaSection finalCta={content.finalCta} />
      </main>

      <LandingFooter brand={content.brand} footer={content.footer} />
    </div>
  );
}

export default LandingPage;
