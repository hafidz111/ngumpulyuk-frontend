import { LEGAL_OPERATOR, LEGAL_REGULATIONS } from './legal-config';

/** @typedef {{ id: string; title: string; paragraphs: string[]; list?: string[] }} LegalSection */

/** @type {LegalSection[]} */
export const TERMS_OF_SERVICE_SECTIONS = [
  {
    id: 'pendahuluan',
    title: '1. Pendahuluan',
    paragraphs: [
      `Dokumen Syarat dan Ketentuan ("Ketentuan") ini mengatur akses dan penggunaan Anda terhadap platform ${LEGAL_OPERATOR.platformName}, termasuk situs web, aplikasi, fitur event, circle (komunitas), obrolan, serta layanan rekomendasi Ngumpsky.`,
      'Dengan mendaftar, mengakses, atau menggunakan layanan, Anda menyatakan telah membaca, memahami, dan menyetujui Ketentuan ini serta Kebijakan Privasi kami.',
      `Ketentuan disusun dengan memperhatikan peraturan perundang-undangan di bidang sistem elektronik dan perlindungan data di Indonesia, antara lain: ${LEGAL_REGULATIONS.join('; ')}.`,
    ],
  },
  {
    id: 'definisi',
    title: '2. Definisi',
    list: [
      `"${LEGAL_OPERATOR.platformName}" atau "Kami" adalah ${LEGAL_OPERATOR.legalEntityName} selaku penyelenggara sistem elektronik.`,
      '"Pengguna" atau "Anda" adalah individu yang mengakses atau menggunakan layanan.',
      '"Konten Pengguna" adalah teks, gambar, data, atau materi lain yang Anda unggah, kirim, atau bagikan melalui platform.',
      '"Event" adalah kegiatan yang dibuat, dipromosikan, atau diikuti melalui platform.',
      '"Circle" adalah komunitas atau grup obrolan di dalam platform.',
      '"Ngumpsky" adalah fitur bantuan berbasis kecerdasan buatan untuk rekomendasi dan percakapan.',
    ],
  },
  {
    id: 'akun',
    title: '3. Akun dan Kelayakan Pengguna',
    paragraphs: [
      'Anda wajib memberikan data pendaftaran yang benar, akurat, dan terkini. Anda bertanggung jawab menjaga kerahasiaan kredensial akun serta seluruh aktivitas yang terjadi melalui akun Anda.',
      'Layanan ditujukan bagi pengguna berusia minimal 18 (delapan belas) tahun, atau usia minimal sesuai ketentuan hukum yang berlaku di yurisdiksi Anda. Pengguna di bawah usia tersebut hanya boleh menggunakan layanan dengan persetujuan dan pengawasan wali yang sah.',
      'Kami berhak menolak pendaftaran, menangguhkan, atau menutup akun apabila terdapat indikasi pelanggaran Ketentuan, hukum yang berlaku, atau risiko keamanan.',
    ],
  },
  {
    id: 'penggunaan',
    title: '4. Penggunaan Layanan',
    paragraphs: [
      'Anda setuju menggunakan platform secara sah, bertanggung jawab, dan tidak merugikan pihak lain. Fitur event, circle, dan obrolan disediakan untuk memfasilitasi interaksi komunitas; keikutsertaan pada event merupakan hubungan antara peserta dan penyelenggara event, bukan jaminan dari Kami kecuali dinyatakan lain secara tertulis.',
      'Rekomendasi Ngumpsky bersifat informasi bantu. Keputusan untuk mengikuti event, bergabung circle, atau bertindak berdasarkan saran Ngumpsky sepenuhnya menjadi tanggung jawab Anda.',
    ],
  },
  {
    id: 'konten',
    title: '5. Konten Pengguna dan Moderasi',
    paragraphs: [
      'Anda tetap memiliki hak atas Konten Pengguna yang Anda unggah, namun memberikan lisensi non-eksklusif kepada Kami untuk menyimpan, menampilkan, dan memproses konten tersebut sejauh diperlukan untuk menyediakan layanan.',
      'Anda menjamin bahwa Konten Pengguna tidak melanggar hukum, hak pihak ketiga, atau Ketentuan ini. Kami dapat menghapus, membatasi, atau menolak konten serta melaporkan ke pihak berwenang apabila diwajibkan hukum atau diperlukan untuk melindungi pengguna dan platform.',
    ],
  },
  {
    id: 'larangan',
    title: '6. Larangan Penggunaan',
    paragraphs: ['Anda dilarang menggunakan platform untuk:'],
    list: [
      'Menyebarkan konten yang melanggar hukum, termasuk namun tidak terbatas pada ujaran kebencian, pornografi anak, perjudian ilegal, penipuan, atau aktivitas terorisme.',
      'Menyebarkan berita bohong, hoaks, atau informasi menyesatkan yang dapat merugikan masyarakat (sesuai ketentuan penanganan informasi elektronik yang melanggar hukum).',
      'Mengumpulkan data pribadi pengguna lain tanpa dasar hukum atau persetujuan yang sah.',
      'Mengganggu, merusak, atau mencoba mengakses sistem secara tidak sah (termasuk scraping berlebihan, serangan siber, atau penyalahgunaan API).',
      'Menyamar sebagai pihak lain atau menggunakan identitas palsu.',
      'Melanggar hak kekayaan intelektual, privasi, atau hak lain milik pihak ketiga.',
    ],
  },
  {
    id: 'hki',
    title: '7. Hak Kekayaan Intelektual',
    paragraphs: [
      'Seluruh hak atas merek, logo, desain antarmuka, perangkat lunak, dan materi milik Kami dilindungi hukum. Anda tidak diperkenankan menyalin, memodifikasi, atau mendistribusikan materi tersebut tanpa izin tertulis, kecuali penggunaan wajar sesuai Ketentuan.',
    ],
  },
  {
    id: 'privasi',
    title: '8. Pelindungan Data Pribadi',
    paragraphs: [
      'Pemrosesan data pribadi diatur dalam Kebijakan Privasi kami yang merupakan bagian tidak terpisahkan dari Ketentuan ini. Dengan menggunakan layanan, Anda juga menyetujui Kebijakan Privasi tersebut.',
    ],
  },
  {
    id: 'pemutusan',
    title: '9. Penangguhan dan Pengakhiran',
    paragraphs: [
      'Anda dapat berhenti menggunakan layanan dan meminta penghapusan akun sesuai mekanisme di aplikasi atau melalui kontak dukungan.',
      'Kami dapat menangguhkan atau mengakhiri akses Anda apabila terjadi pelanggaran Ketentuan, permintaan aparat penegak hukum, atau keadaan kahar yang mempengaruhi operasional layanan.',
    ],
  },
  {
    id: 'tanggung-jawab',
    title: '10. Batasan Tanggung Jawab',
    paragraphs: [
      'Layanan disediakan "sebagaimana adanya" dalam batas yang diizinkan hukum. Kami berupaya menjaga ketersediaan dan keamanan layanan, namun tidak menjamin bebas gangguan, kesalahan, atau kehilangan data.',
      'Sejauh diizinkan hukum, Kami tidak bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau sengketa antar pengguna yang timbul dari penggunaan platform atau partisipasi event/circle.',
    ],
  },
  {
    id: 'hukum',
    title: '11. Hukum yang Berlaku dan Penyelesaian Sengketa',
    paragraphs: [
      'Ketentuan ini tunduk pada hukum Negara Republik Indonesia.',
      'Sengketa akan diselesaikan terlebih dahulu melalui musyawarah. Apabila tidak tercapai kesepakatan dalam 30 (tiga puluh) hari kalender, para pihak sepakat menempuh pengadilan Negeri Jakarta Selatan, kecuali ketentuan hukum yang berlaku menentukan lain.',
    ],
  },
  {
    id: 'perubahan',
    title: '12. Perubahan Ketentuan',
    paragraphs: [
      'Kami dapat memperbarui Ketentuan sewaktu-waktu. Perubahan material akan diberitahukan melalui platform, email terdaftar, atau cara komunikasi lain yang wajar. Penggunaan berkelanjutan setelah tanggal berlaku dianggap sebagai persetujuan atas Ketentuan yang diperbarui.',
    ],
  },
  {
    id: 'kontak',
    title: '13. Kontak',
    paragraphs: [
      `Pertanyaan mengenai Ketentuan ini dapat disampaikan ke: ${LEGAL_OPERATOR.emailLegal}.`,
    ],
  },
];
