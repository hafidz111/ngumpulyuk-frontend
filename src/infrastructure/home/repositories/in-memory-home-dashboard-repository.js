import { createHomeDashboardContent } from '../../../domain/home/entities/home-dashboard-content';

export class InMemoryHomeDashboardRepository {
  /** @returns {import('../../../domain/home/entities/home-dashboard-content').HomeDashboardContent} */
  getHomeDashboard() {
    return createHomeDashboardContent({
      notification: {
        message:
          'Jangan lupa! Morning Run Sudirman besok jam 06:00. 23 orang udah siap!',
        actionLabel: 'Lihat',
      },
      recommended: {
        title: 'Recommended for You',
        seeAllLabel: 'Lihat Semua',
        items: [
          {
            id: 'rec-1',
            categoryLabel: 'Padel',
            title: 'Padel Bareng Weekend',
            datetimeLabel: 'Sabtu, 10:00',
            locationLabel: 'Senayan',
            participantsCurrent: 8,
            participantsMax: 12,
            imageUrl:
              'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800&auto=format&fit=crop',
            matchPercent: 92,
          },
          {
            id: 'rec-2',
            categoryLabel: 'Running',
            title: 'Morning Run Sudirman',
            datetimeLabel: 'Minggu, 06:00',
            locationLabel: 'Sudirman',
            participantsCurrent: 23,
            participantsMax: 30,
            imageUrl:
              'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop',
          },
          {
            id: 'rec-3',
            categoryLabel: 'Pokémon',
            title: 'Pokémon GO Raid',
            datetimeLabel: 'Minggu, 14:00',
            locationLabel: 'Monas',
            participantsCurrent: 5,
            participantsMax: 10,
            imageUrl:
              'https://images.unsplash.com/photo-1613771404721-1f92d799e049?q=80&w=800&auto=format&fit=crop',
          },
        ],
      },
      upcoming: {
        title: 'Event Mendatang',
        items: [
          {
            id: 'up-1',
            title: 'Workshop UI/UX',
            datetimeLabel: 'Rabu, 19:00',
            locationLabel: 'Co-working BSD',
            participantsCurrent: 12,
            participantsMax: 20,
            imageUrl:
              'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop',
          },
          {
            id: 'up-2',
            title: 'Badminton Fun Match',
            datetimeLabel: 'Jumat, 20:00',
            locationLabel: 'GOR Kelapa Gading',
            participantsCurrent: 8,
            participantsMax: 16,
            imageUrl:
              'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400&auto=format&fit=crop',
          },
        ],
      },
    });
  }
}
