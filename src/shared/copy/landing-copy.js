export const LANDING_COPY = {
  brand: 'NgumpulYuk',
  navigation: {
    links: [
      { label: 'Beranda', href: '#home' },
      { label: 'Event', href: '#kegiatan' },
      { label: 'Circle', href: '#circle' },
    ],
    ctaLabel: 'Daftar',
  },
  hero: {
    badge: 'Ngumpul bareng, actually fun',
    titleLine1: 'Semua Kegiatan,',
    titleLine2: 'Ngumpul Yuk!',
    description:
      'Cari event yang lagi rame, join circle yang vibes-nya pas, dan spill obrolan bareng Ngumpsky. Semua di satu app.',
    primaryCta: 'Mulai ngumpul',
    secondaryCta: 'Lihat event',
    image: '/landing/hero.webp',
  },
  statsLabels: {
    users: 'Member',
    events: 'Event',
    communities: 'Circle',
    participants: 'Total partisipasi',
  },
  trending: {
    title: 'Event',
    seeAllLabel: 'Lihat semua event',
    empty: {
      title: 'Belum ada event',
      description:
        'Setelah daftar kamu bisa jelajahi map, join event, atau ngadain sendiri bareng circle.',
      cta: 'Mulai ngumpul',
    },
  },
  communities: {
    title: 'Circle yang lagi rame',
    description:
      'Komunitas beneran di NgumpulYuk. Lihat yang lagi rame dan gabung setelah daftar.',
    empty: {
      title: 'Belum ada circle',
      description:
        'Jadi yang pertama bikin komunitas dan ajak bestie gabung setelah daftar.',
      cta: 'Daftar dan bikin circle',
    },
  },
  steps: [
    {
      icon: 'search',
      title: 'Explore dan chat',
      description: 'Cari event di Explore atau tanya Ngumpsky di tab Chat.',
    },
    {
      icon: 'user-plus',
      title: 'Join dan spill',
      description:
        'Ikut event yang masih ada slot, spill di obrolan circle kamu.',
    },
    {
      icon: 'users',
      title: 'Bikin sendiri',
      description: 'Bikin event atau circle sendiri, ajak yang satu vibes.',
    },
  ],
  aiMatcher: {
    badge: 'NgumpulYuk',
    title: 'Bestie rekomendasi kamu',
    description: 'Setelah daftar, ini yang bisa kamu lakuin di satu app:',
    cta: 'Gas daftar',
    matches: [
      {
        title: 'Lihat event dan circle yang lagi rame',
        body: 'Scroll Explore, pilih yang vibes-nya pas, join kalau masih ada slot.',
      },
      {
        title: 'Spill di circle kamu',
        body: 'Obrolan thread bareng member, kayak grup tapi di platform ini.',
      },
      {
        title: 'Tanya Ngumpsky kalau bingung',
        body: 'Di tab Chat bisa nanya event atau circle tanpa bolak balik cari manual.',
      },
    ],
  },
  finalCta: {
    title: 'Siap ngumpul? Gas daftar dulu.',
    subtitle:
      'Gratis buat explore event, circle, dan obrolan bareng orang yang satu vibes.',
    cta: 'Daftar sekarang',
    image: '/landing/cta.webp',
  },
  footer: {
    about:
      'Platform ngumpul buat event, circle, dan obrolan dari data nyata di NgumpulYuk.',
    columns: [
      {
        title: 'Fitur',
        links: [
          { label: 'Event', href: '#kegiatan' },
          { label: 'Circle', href: '#circle' },
          { label: 'Ngumpsky', href: '#ngumpsky' },
        ],
      },
      {
        title: 'Akun',
        links: [
          { label: 'Daftar', href: '/register' },
          { label: 'Masuk', href: '/login' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
          { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        ],
      },
      {
        title: 'Bantuan',
        links: [{ label: 'Tanya Ngumpsky', href: '/register' }],
      },
    ],
  },
};
