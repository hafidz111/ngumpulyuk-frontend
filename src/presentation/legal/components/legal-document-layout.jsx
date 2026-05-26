import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { LEGAL_OPERATOR } from '@/shared/legal/legal-config';

/**
 * @typedef {{ id: string; title: string; paragraphs?: string[]; list?: string[]; closingParagraphs?: string[] }} LegalSection
 */

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   sections: LegalSection[];
 * }} props
 */
export function LegalDocumentLayout({ title, description, sections }) {
  return (
    <div className='min-h-svh bg-[#F5F5F7] text-foreground'>
      <header className='border-b border-border/60 bg-white'>
        <div className='mx-auto flex h-16 max-w-3xl items-center gap-3 px-6'>
          <Link
            to={ROUTES.home}
            className='inline-flex items-center gap-2 text-sm font-semibold text-primary-container hover:underline'
          >
            <ArrowLeft className='size-4' aria-hidden />
            Beranda
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-6 py-10 md:py-14'>
        <div className='rounded-[1.75rem] border border-border/60 bg-white p-8 shadow-sm md:p-10'>
          <p className='text-xs font-semibold uppercase tracking-wider text-primary-container'>
            {LEGAL_OPERATOR.platformName}
          </p>
          <h1 className='mt-2 font-display text-3xl font-bold tracking-tight'>{title}</h1>
          <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>{description}</p>
          <p className='mt-2 text-xs text-muted-foreground'>
            Terakhir diperbarui: {LEGAL_OPERATOR.effectiveDate}
          </p>

          <div className='mt-10 space-y-8'>
            {sections.map((section) => (
              <section key={section.id} id={section.id} className='scroll-mt-24'>
                <h2 className='font-display text-lg font-bold text-foreground'>{section.title}</h2>
                <div className='mt-3 space-y-3 text-sm leading-relaxed text-foreground/90'>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                  {section.list?.length ? (
                    <ul className='list-disc space-y-2 pl-5'>
                      {section.list.map((item) => (
                        <li key={item.slice(0, 48)}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.closingParagraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className='mt-10 flex flex-wrap gap-4 border-t border-border/60 pt-6 text-sm'>
            <Link to={ROUTES.terms} className='font-semibold text-primary-container hover:underline'>
              Syarat & Ketentuan
            </Link>
            <Link to={ROUTES.privacy} className='font-semibold text-primary-container hover:underline'>
              Kebijakan Privasi
            </Link>
            <Link to={ROUTES.register} className='font-semibold text-primary-container hover:underline'>
              Daftar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
