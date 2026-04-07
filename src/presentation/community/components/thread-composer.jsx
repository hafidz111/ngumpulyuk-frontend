import { useState, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';

import { Card } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Avatar, AvatarImage } from '@/presentation/components/ui/avatar';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';

export function ThreadComposer({ onPost, communities = [], events = [] }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    if (communities?.length === 1 && !selectedCommunity) {
      setSelectedCommunity(String(communities[0].id));
    }
  }, [communities, selectedCommunity]);

  async function handlePost() {
    if (!content.trim() || !selectedCommunity) return;
    setPosting(true);
    try {
      await onPost({ content: content.trim(), community_id: selectedCommunity, related_event_id: selectedEvent });
      setContent('');
      setSelectedCommunity('');
      setSelectedEvent('');
      setExpanded(false);
    } catch {
      // error handled by parent
    } finally {
      setPosting(false);
    }
  }

  return (
    <Card className='border border-border/80 bg-card p-4'>
      <div className='flex items-start gap-3'>
        <Avatar className='size-10 shrink-0'>
          {user?.profile_picture ? (
            <AvatarImage src={user.profile_picture} />
          ) : (
            <div className='flex size-full items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary/30 text-sm font-bold text-foreground'>
              {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>

        {!expanded ? (
          <div className='w-full'>
            <button
              type='button'
              onClick={() => setExpanded(true)}
              className='flex h-11 w-full items-center rounded-full bg-muted/40 px-5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted/60'
            >
              Apa yang lagi kamu pikirin?
            </button>
          </div>
        ) : (
          <div className='flex-1 space-y-3 w-full animate-in fade-in slide-in-from-top-2 duration-200'>
            <div className='flex items-center justify-between rounded-xl bg-muted/40 px-2 py-1.5 text-xs font-semibold text-foreground'>
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger className='w-full border-none shadow-none bg-transparent hover:bg-transparent focus:ring-0 p-1 font-semibold text-foreground h-8 justify-between'>
                  <SelectValue placeholder='Pilih Komunitas' />
                </SelectTrigger>
                <SelectContent>
                  {communities.length > 0 ? (
                    communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value='none' disabled>Tidak ada komunitas</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Apa yang lagi kamu pikirin?'
              className='w-full resize-none bg-transparent p-1 text-sm text-foreground focus:outline-none min-h-[40px]'
              maxLength={2000}
              autoFocus
            />

            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className='flex w-full items-center justify-between rounded-xl bg-primary-container/10 px-3 py-2.5 text-xs font-medium text-primary-container transition-colors hover:bg-primary-container/15 border-none shadow-none h-10'>
                <div className='flex items-center gap-2'>
                  🎯 <SelectValue placeholder='Link ke event (opsional)' />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Tidak ada event</SelectItem>
                {/* Asumsi: parent menyediakan props events */}
                {events?.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className='flex items-center justify-between pt-2 border-t border-border/40 mt-2'>
              <button
                type='button'
                onClick={() => { setExpanded(false); setContent(''); setSelectedCommunity(''); setSelectedEvent(''); }}
                className='text-xs font-medium text-muted-foreground hover:text-foreground'
              >
                Batal
              </button>
              <Button
                type='button'
                onClick={handlePost}
                disabled={!content.trim() || !selectedCommunity || posting}
                className='rounded-full bg-primary-container px-6 h-9 font-semibold text-primary-foreground shadow-sm hover:bg-primary-container/90'
              >
                {posting ? <Loader2 className='size-3.5 mr-1.5 animate-spin' /> : null}
                Post Thread
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
