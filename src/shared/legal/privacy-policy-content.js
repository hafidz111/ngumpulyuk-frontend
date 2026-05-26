import { LEGAL_OPERATOR } from './legal-config';

/** @typedef {{ id: string; title: string; paragraphs: string[]; list?: string[] }} LegalSection */

/** @type {LegalSection[]} */
export const PRIVACY_POLICY_SECTIONS = [
  {
    id: 'pendahuluan',
    title: '1. Pendahuluan',
    paragraphs: [
      `Kebijakan Privasi ini menjelaskan bagaimana ${LEGAL_OPERATOR.legalEntityName} ("Kami") memproses data pribadi Pengguna platform ${LEGAL_OPERATOR.platformName} sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) dan peraturan pelaksananya.`,
      'Kebijakan ini berlaku untuk data yang dikumpulkan melalui situs web, aplikasi, dan layanan terkait, termasuk pendaftaran akun, profil, event, circle, obrolan, notifikasi, serta fitur Ngumpsky.',
    ],
  },
  {
    id: 'pengendali',
    title: '2. Pengendali Data Pribadi',
    paragraphs: [
      `Pengendali data pribadi: ${LEGAL_OPERATOR.legalEntityName}`,
      `Alamat: ${LEGAL_OPERATOR.address}`,
      `Email privasi / permintaan hak subjek data: ${LEGAL_OPERATOR.emailPrivacy}`,
      `Email dukungan umum: ${LEGAL_OPERATOR.emailSupport}`,
      'Apabila Kami menunjuk pejabat atau unit pelindungan data pribadi, informasi kontaknya akan diumumkan melalui platform atau Kebijakan Privasi yang diperbarui.',
    ],
  },
  {
    id: 'dasar-hukum',
    title: '3. Dasar Hukum Pemrosesan',
    paragraphs: [
      'Kami memproses data pribadi berdasarkan satu atau lebih dasar hukum berikut:',
    ],
    list: [
      'Persetujuan Anda (misalnya saat mendaftar, mengisi profil, atau mengaktifkan notifikasi).',
      'Pelaksanaan perjanjian (penyediaan layanan akun, event, circle, dan fitur terkait).',
      'Pemenuhan kewajiban hukum (permintaan aparat yang berwenang, pencatatan PSE, atau kewajiban pelaporan lain).',
      'Kepentingan yang sah Kami yang tidak mengalahkan hak Anda, seperti pencegahan penipuan, keamanan sistem, dan peningkatan layanan dengan langkah yang proporsional.',
    ],
  },
  {
    id: 'jenis-data',
    title: '4. Jenis Data Pribadi yang Dikumpulkan',
    list: [
      'Data identitas dan kontak: nama, email, nomor telepon (jika diisi), foto profil.',
      'Data akun: nama pengguna, kata sandi (disimpan dalam bentuk terenkripsi), riwayat login.',
      'Data profil dan preferensi: minat, lokasi umum, bio, pengaturan notifikasi.',
      'Data aktivitas: partisipasi event, keanggotaan circle, thread, komentar, suka, dan interaksi Ngumpsky.',
      'Data teknis: alamat IP, jenis perangkat, browser, log sistem, token perangkat push (jika diizinkan).',
      'Data yang Anda unggah: gambar event/circle, lampiran obrolan, dan konten lain yang Anda kirimkan.',
    ],
  },
  {
    id: 'tujuan',
    title: '5. Tujuan Pemrosesan',
    list: [
      'Membuat dan mengelola akun Pengguna.',
      'Menyediakan fitur event, circle, obrolan, peta, dan rekomendasi Ngumpsky.',
      'Mengirim notifikasi terkait layanan (undangan event, aktivitas circle, keamanan akun).',
      'Menjaga keamanan, mencegah penyalahgunaan, dan menindak pelanggaran Ketentuan.',
      'Memenuhi kewajiban hukum dan permintaan yang sah dari otoritas.',
      'Menganalisis penggunaan layanan secara agregat untuk peningkatan produk (tanpa mengidentifikasi individu sejauh memungkinkan).',
    ],
  },
  {
    id: 'cookie',
    title: '6. Cookie dan Teknologi Serupa',
    paragraphs: [
      'Kami menggunakan cookie, local storage, dan teknologi serupa untuk menjaga sesi login, preferensi, dan keamanan. Anda dapat mengatur browser untuk menolak cookie tertentu; beberapa fitur mungkin tidak berfungsi optimal jika cookie esensial dinonaktifkan.',
    ],
  },
  {
    id: 'berbagi',
    title: '7. Pengungkapan kepada Pihak Ketiga',
    paragraphs: [
      'Kami tidak menjual data pribadi Anda. Data dapat dibagikan kepada:',
    ],
    list: [
      'Penyedia infrastruktur (hosting, email, autentikasi pihak ketiga seperti Google jika Anda memilih login Google) yang terikat kewajiban kerahasiaan dan pemrosesan sesuai instruksi Kami.',
      'Penyedia layanan kecerdasan buatan untuk fitur Ngumpsky, dengan data yang dibatasi pada kebutuhan fungsi tersebut.',
      'Aparat penegak hukum atau regulator apabila diwajibkan oleh peraturan perundang-undangan yang berlaku.',
      'Pihak lain dengan persetujuan Anda atau dalam konteks transaksi korporasi (merger/akuisisi) dengan safeguard yang wajar.',
    ],
  },
  {
    id: 'retensi',
    title: '8. Penyimpanan dan Retensi',
    paragraphs: [
      'Data disimpan di server yang berlokasi di atau diakses dari Indonesia dan/atau wilayah dengan tingkat perlindungan yang memadai sesuai ketentuan UU PDP.',
      'Kami menyimpan data selama akun aktif dan periode yang diperlukan untuk memenuhi tujuan pemrosesan, kewajiban hukum, atau penyelesaian sengketa. Setelah itu, data akan dihapus atau dianonimkan secara wajar.',
    ],
  },
  {
    id: 'keamanan',
    title: '9. Keamanan Data',
    paragraphs: [
      'Kami menerapkan langkah teknis dan organisasi yang wajar, termasuk enkripsi transmisi (HTTPS), kontrol akses, dan pemantauan keamanan. Tidak ada sistem yang sepenuhnya aman; apabila terjadi insiden kebocoran data yang berdampak pada Anda, Kami akan memberitahu sesuai ketentuan hukum yang berlaku.',
    ],
  },
  {
    id: 'hak',
    title: '10. Hak Subjek Data Pribadi',
    paragraphs: ['Sesuai UU PDP, Anda berhak untuk:'],
    list: [
      'Mendapatkan informasi tentang pemrosesan data pribadi Anda.',
      'Mengakses dan memperoleh salinan data pribadi.',
      'Melengkapi, memperbarui, atau memperbaiki data yang tidak akurat.',
      'Menarik persetujuan (untuk pemrosesan yang berbasis persetujuan) tanpa mempengaruhi keabsahan pemrosesan sebelum penarikan.',
      'Menghapus atau memusnahkan data sesuai ketentuan hukum.',
      'Menunda atau membatasi pemrosesan secara proporsional.',
      'Mengajukan keberatan atas pemrosesan berdasarkan kepentingan yang sah.',
    ],
    closingParagraphs: [
      `Permintaan hak dapat dikirim ke ${LEGAL_OPERATOR.emailPrivacy}. Kami akan merespons dalam jangka waktu yang diatur peraturan pelaksana UU PDP. Anda juga berhak mengajukan pengaduan kepada lembaga yang berwenang di bidang pelindungan data pribadi di Indonesia.`,
    ],
  },
  {
    id: 'anak',
    title: '11. Data Anak',
    paragraphs: [
      'Layanan tidak ditujukan untuk anak di bawah 18 tahun tanpa persetujuan wali. Apabila Kami mengetahui pengumpulan data anak tanpa dasar hukum yang sah, Kami akan mengambil langkah untuk menghapus data tersebut.',
    ],
  },
  {
    id: 'transfer',
    title: '12. Transfer Data ke Luar Negeri',
    paragraphs: [
      'Apabila data diproses atau disimpan di luar wilayah Indonesia, Kami memastikan tingkat perlindungan setara atau adanya mekanisme transfer yang sah sesuai UU PDP (misalnya klausul kontrak standar atau persetujuan Anda bila diperlukan).',
    ],
  },
  {
    id: 'peraturan',
    title: '13. Kepatuhan Regulasi Sistem Elektronik',
    paragraphs: [
      'Selain UU PDP, Kami mematuhi kewajiban penyelenggara sistem elektronik swasta sebagaimana diatur dalam peraturan terkait sistem elektronik (termasuk PP 71 Tahun 2019 dan Permenkominfo 5 Tahun 2020), termasuk penanganan konten ilegal dan kerja sama dengan aparat yang berwenang.',
    ],
  },
  {
    id: 'perubahan',
    title: '14. Perubahan Kebijakan Privasi',
    paragraphs: [
      'Kebijakan dapat diperbarui dari waktu ke waktu. Versi terbaru akan dipublikasikan di halaman ini dengan tanggal berlaku yang diperbarui. Untuk perubahan material, Kami akan memberitahu melalui platform atau email.',
    ],
  },
  {
    id: 'kontak',
    title: '15. Kontak',
    paragraphs: [
      `Pertanyaan privasi: ${LEGAL_OPERATOR.emailPrivacy}`,
      `Website: ${LEGAL_OPERATOR.website}`,
    ],
  },
];
