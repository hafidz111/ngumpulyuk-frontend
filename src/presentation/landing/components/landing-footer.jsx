import { Camera, Globe, Send } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function LandingFooter({ brand, footer }) {
  const linkColumns = footer.columns.filter((col) => !col.newsletter);
  const newsletterCol = footer.columns.find((col) => col.newsletter);

  return (
    <footer className='bg-foreground text-background'>
      <div className='mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-8'>
        <div className='flex flex-col gap-14 lg:flex-row lg:justify-between lg:gap-10'>
          <div className='max-w-sm space-y-5'>
            <p className='font-display text-2xl font-black text-background'>
              {brand}
            </p>
            <p className='text-sm leading-relaxed text-background/75'>
              {footer.about}
            </p>
            <div className='flex gap-3'>
              <a
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary-container hover:text-primary-foreground'
                aria-label='Website'
              >
                <Globe className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary-container hover:text-primary-foreground'
                aria-label='Media sosial'
              >
                <Camera className='h-5 w-5' />
              </a>
            </div>
          </div>

          <div className='grid flex-1 grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8'>
            {linkColumns.map((col) => (
              <div key={col.title}>
                <h4 className='font-display text-lg font-bold'>{col.title}</h4>
                <ul className='mt-4 space-y-3 text-sm text-background/75'>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className='transition-colors hover:text-primary-container'
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {newsletterCol ? (
              <div className='col-span-2 sm:col-span-3 lg:col-span-1 lg:max-w-xs'>
                <h4 className='font-display text-lg font-bold'>Newsletter</h4>
                <p className='mt-3 text-sm text-background/75'>
                  Dapatkan info kegiatan terbaru langsung di email kamu.
                </p>
                <div className='relative mt-5'>
                  <Input
                    type='email'
                    placeholder='Email kamu'
                    className='h-12 border-0 bg-background/10 pr-12 text-background placeholder:text-background/50 focus-visible:ring-primary-container'
                  />
                  <Button
                    type='button'
                    size='icon'
                    className='absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2'
                    aria-label='Kirim newsletter'
                  >
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className='mt-16 border-t border-background/15 pt-8 text-center text-sm text-background/50'>
          © {new Date().getFullYear()} {brand}. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
