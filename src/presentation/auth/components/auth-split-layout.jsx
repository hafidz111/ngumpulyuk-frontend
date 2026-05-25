import { Sparkles } from 'lucide-react';

export function AuthSplitLayout({ children }) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='relative hidden flex-col justify-between bg-[#FF8000] p-10 text-white lg:flex'>
        <div className='flex items-center gap-3'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-white/20'>
            <Sparkles className='size-6' aria-hidden />
          </div>
          <p className='font-display text-xl font-black tracking-tight'>NgumpulYuk</p>
        </div>
        <div className='space-y-4'>
          <h2 className='font-display text-3xl font-black leading-tight tracking-tight'>
            Chat-first.
            <br />
            Event & komunitas lewat Ngumpsky.
          </h2>
          <p className='max-w-sm text-sm leading-relaxed text-white/90'>
            Setelah masuk, langsung ngobrol dengan AI untuk cari event, komunitas, dan
            aktivitas yang cocok — tanpa harus bolak-balik menu.
          </p>
        </div>
        <p className='text-xs text-white/70'>Ngumpsky · AI Activity Matcher</p>
      </div>
      <div className='flex flex-col gap-4 bg-[#F5F5F7] p-6 md:p-10'>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-md px-1'>{children}</div>
        </div>
      </div>
    </div>
  );
}
