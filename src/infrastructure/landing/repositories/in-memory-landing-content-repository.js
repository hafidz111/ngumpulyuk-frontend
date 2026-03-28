export class InMemoryLandingContentRepository {
  getLandingContent() {
    return {
      brand: 'NgumpulYuk',
      navigation: {
        links: [
          { label: 'Home', href: '#home' },
          { label: 'Explore', href: '#explore' },
          { label: 'Community', href: '#community' },
        ],
        ctaLabel: 'Daftar',
      },
      hero: {
        badge: 'Komunitas No. 1 di Indonesia',
        titleLine1: 'Semua Kegiatan,',
        titleLine2: 'Ngumpul Yuk!',
        description:
          'Temukan komunitas seru, buat kegiatan bermakna, dan perluas networking kamu dalam satu platform yang hangat dan inklusif.',
        primaryCta: 'Mulai Ngumpul',
        secondaryCta: 'Lihat Event',
        socialProof: {
          rating: '4.9/5',
          reviewsLabel: '(2000+ ulasan)',
          avatars: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop',
          ],
        },
        floatingCards: [
          {
            title: '10+ orang baru bergabung',
            subtitle: 'Minggu ini',
          },
          {
            title: 'Live',
            subtitle: 'Workshop Design',
          },
        ],
        image:
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
      },
      stats: [
        {
          icon: 'users',
          value: '2,000+',
          label: 'Pengguna Aktif',
        },
        {
          icon: 'calendar',
          value: '214+',
          label: 'Kegiatan',
        },
        {
          icon: 'map-pin',
          value: '500+',
          label: 'Event',
        },
        {
          icon: 'sparkles',
          value: 'GRATIS',
          label: 'Untuk Semua',
        },
      ],
      trending: {
        title: 'Kegiatan Trending',
        seeAllLabel: 'Lihat Semua',
        items: [
          {
            categoryLabel: 'Olah Raga',
            title: 'Yoga Pagi di Taman',
            location: 'Tebet Eco Park',
            image:
              'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
          },
          {
            categoryLabel: 'Workshop',
            title: 'Belajar Web Design',
            location: 'Co-working Space',
            image:
              'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop',
          },
          {
            categoryLabel: 'Sosial',
            title: 'Makan Malam Komunitas',
            location: 'Grand Indonesia',
            image:
              'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
          },
          {
            categoryLabel: 'Outdoor',
            title: 'Hiking Santai Sentul',
            location: 'Sentul City',
            image:
              'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop',
          },
        ],
      },
      steps: [
        {
          icon: 'search',
          title: 'Cari Kegiatan',
          description:
            'Pilih kegiatan yang sesuai minatmu dari berbagai kategori.',
        },
        {
          icon: 'user-plus',
          title: 'Daftar dan Ngumpul',
          description:
            'Konfirmasi kehadiran dan datang untuk bertemu teman baru.',
        },
        {
          icon: 'users',
          title: 'Buat Komunitas',
          description: 'Inisiasi kegiatan sendiri dan undang member lainnya.',
        },
      ],
      aiMatcher: {
        badge: 'AI-Powered',
        title: 'AI Activity Matcher',
        description:
          'Bingung mau ngapain? AI kami bakal rekomendasiin kegiatan yang paling cocok berdasarkan minat, lokasi, dan jadwalmu. Smart & personal!',
        cta: 'Coba Sekarang',
        matches: [
          'Yoga Pagi — cocok dengan minat wellness-mu',
          'Workshop UI — sesuai skill design',
          'Hiking Santai — akhir pekan kosong',
        ],
      },
      testimonialsHeading: {
        title: 'Apa Kata Mereka?',
        description:
          'Dengarkan cerita dari mereka yang sudah menemukan rumah baru di NgumpulYuk.',
      },
      testimonials: [
        {
          name: 'Saraswati Putri',
          role: 'UI Designer',
          quote:
            'NgumpulYuk bener-bener ngebantu aku cari circle baru pas baru pindah ke Jakarta. UI-nya clean banget dan community-nya super friendly!',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop',
        },
        {
          name: 'Budi Santoso',
          role: 'Content Creator',
          quote:
            'Fitur buat kegiatannya gampang banget dipake. Aku udah sempet ngadain 3 workshop fotografi lewat platform ini.',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
        },
        {
          name: 'Maya Anggraini',
          role: 'Product Manager',
          quote:
            'UI-nya clean dan onboarding-nya cepat. Langsung ketemu komunitas yang pas.',
          avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop',
        },
      ],
      finalCta: {
        title: 'Komunitas Udah Nunggu, Jangan Sampai Ketinggalan!',
        subtitle:
          'Bergabung dengan ribuan orang yang sudah mulai terhubung dan berkarya bersama.',
        cta: 'Daftar Sekarang',
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1400&auto=format&fit=crop',
      },
      footer: {
        about:
          'Platform komunitas paling dinamis untuk menghubungkan ide dan aksi secara nyata.',
        columns: [
          {
            title: 'Fitur',
            links: [
              { label: 'Jelajahi Kegiatan', href: '#' },
              { label: 'Buat Kegiatan', href: '#' },
              { label: 'AI Matcher', href: '#' },
            ],
          },
          {
            title: 'Perusahaan',
            links: [
              { label: 'Tentang Kami', href: '#' },
              { label: 'Karir', href: '#' },
              { label: 'Blog', href: '#' },
            ],
          },
          {
            title: 'Bantuan',
            links: [
              { label: 'Pusat Bantuan', href: '#' },
              { label: 'Kebijakan Privasi', href: '#' },
              { label: 'Ketentuan Layanan', href: '#' },
            ],
          },
          {
            title: 'Newsletter',
            newsletter: true,
          },
        ],
      },
    };
  }
}
