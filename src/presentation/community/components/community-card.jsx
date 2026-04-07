import { Link } from 'react-router-dom';
import { CheckCircle, Users, Zap } from 'lucide-react';

import { Card, CardContent } from '@/presentation/components/ui/card';

export function CommunityCard({ community }) {
  const memberCount = community.member_count ?? community.members_count ?? 0;
  const isJoined = community.is_joined ?? community.is_member ?? false;

  return (
    <Link to={`/community/${community.id}`} className='block'>
      <Card className='overflow-hidden border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md'>
        {/* Cover Image */}
        <div className='relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-primary-container/20 to-secondary/20'>
          {community.cover_image ? (
            <img
              src={community.cover_image}
              alt=''
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <Users className='size-10 text-primary-container/25' />
            </div>
          )}

          {isJoined ? (
            <span className='absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[0.65rem] font-bold text-white shadow-sm'>
              <CheckCircle className='size-3' />
              Joined
            </span>
          ) : null}

          {/* Community Name overlay */}
          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8'>
            <h3 className='font-display text-base font-bold text-white line-clamp-1 md:text-lg'>
              {community.name}
            </h3>
          </div>
        </div>

        <CardContent className='space-y-2.5 p-4'>
          {community.description ? (
            <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
              {community.description}
            </p>
          ) : null}
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5'>
              <Users className='size-3.5' aria-hidden />
              {memberCount} members
            </span>
            <span className='font-semibold text-primary-container'>
              {community.total_events ?? community.events_count ?? 0} events
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
