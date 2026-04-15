import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';

export function CommunityConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  loading = false,
  destructive = false,
}) {
  return (
    <Dialog open={open} onClose={onOpenChange}>
      <DialogContent onClose={onOpenChange} className='max-w-md'>
        <div className='space-y-5'>
          <div className='space-y-1.5'>
            <h3 className='pr-8 text-lg font-semibold text-foreground'>{title}</h3>
            {description ? (
              <p className='text-sm leading-relaxed text-muted-foreground'>{description}</p>
            ) : null}
          </div>

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className='rounded-full px-4'
            >
              {cancelLabel}
            </Button>
            <Button
              type='button'
              variant={destructive ? 'destructive' : 'default'}
              onClick={onConfirm}
              disabled={loading}
              className='rounded-full px-4'
            >
              {loading ? <Loader2 className='size-4 animate-spin' /> : null}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
