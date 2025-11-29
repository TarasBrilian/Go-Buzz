export interface Campaign {
  id: number;
  title: string;
  description: string;
  platform: string;
  reward: number;
  participants: number;
  endDate: string;
  status: 'Active' | 'Ending Soon' | 'Completed';
}

export const EXPLORE_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    title: 'Healthy Living Challenge',
    description: 'Komentar pada postingan tentang gaya hidup sehat dengan kata tertentu seperti "stay active" atau "clean habits". Edukasi kesehatan untuk hidup lebih sehat.',
    platform: 'Instagram',
    reward: 150,
    participants: 342,
    endDate: '2025-03-15',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Support Local Coffee Shops',
    description: 'Campaign dari brand kopi lokal yang ingin meningkatkan awareness. Peserta diminta komentar seperti "love local brews" di postingannya untuk promosi UMKM.',
    platform: 'Instagram',
    reward: 200,
    participants: 567,
    endDate: '2025-03-10',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Tech Product Launch Hype',
    description: 'Startup baru merilis fitur atau produk. Peserta memberi komentar positif seperti "cool update" atau "nice feature" untuk promosi teknologi.',
    platform: 'Twitter',
    reward: 300,
    participants: 891,
    endDate: '2025-03-08',
    status: 'Ending Soon',
  },
  {
    id: 4,
    title: 'Environmental Awareness Week',
    description: 'Organisasi sosial ingin mendorong edukasi tentang lingkungan. Komentar seperti "go green" atau "save our planet" untuk awareness lingkungan.',
    platform: 'Instagram',
    reward: 250,
    participants: 1203,
    endDate: '2025-03-20',
    status: 'Active',
  },
  {
    id: 5,
    title: 'Music Artist Promo',
    description: 'Musisi baru ingin mempromosikan lagu. Peserta komentar seperti "nice track" atau "great vibe" untuk promosi kreator independen.',
    platform: 'TikTok',
    reward: 180,
    participants: 678,
    endDate: '2025-03-12',
    status: 'Active',
  },
  {
    id: 6,
    title: 'Gaming Community Boost',
    description: 'Game indie ingin meningkatkan engagement. Peserta komentar seperti "fun gameplay" atau "cool graphics" untuk promo game non-kontroversial.',
    platform: 'Twitter',
    reward: 350,
    participants: 1456,
    endDate: '2025-03-18',
    status: 'Active',
  },
  {
    id: 7,
    title: 'Fitness App Beta Launch',
    description: 'Aplikasi fitness mencari early adopters. Komentar seperti "excited to try" atau "great for beginners" untuk beta testing awareness.',
    platform: 'Instagram',
    reward: 220,
    participants: 423,
    endDate: '2025-03-14',
    status: 'Active',
  },
  {
    id: 8,
    title: 'Book Club Engagement',
    description: 'Komunitas buku ingin meningkatkan diskusi. Peserta komentar seperti "interesting chapter" atau "love the theme" untuk aktivasi komunitas.',
    platform: 'Instagram',
    reward: 160,
    participants: 289,
    endDate: '2025-03-22',
    status: 'Active',
  },
  {
    id: 9,
    title: 'Travel Promotion Post',
    description: 'Akun wisata mempromosikan destinasi alam. Komentar seperti "beautiful place" atau "love the scenery" untuk branding positif industri travel.',
    platform: 'Instagram',
    reward: 280,
    participants: 734,
    endDate: '2025-03-16',
    status: 'Ending Soon',
  },
  {
    id: 10,
    title: 'Food Brand Taste Review',
    description: 'Brand makanan baru ingin exposure. Komentar seperti "tastes great" atau "love the texture" untuk engagement non-kontroversial.',
    platform: 'TikTok',
    reward: 190,
    participants: 512,
    endDate: '2025-03-11',
    status: 'Active',
  },
];

// Pass campaigns - generate remaining 15 campaigns
export const PASS_CAMPAIGNS: Campaign[] = Array.from({ length: 15 }, (_, i) => {
  const rewards = [150, 250, 350, 450, 550, 200, 300, 400, 500, 600];
  const participantCounts = [120, 450, 780, 230, 890, 340, 670, 520, 910, 150];

  const baseDate = new Date('2025-02-01');
  const daysToAdd = (i * 3) % 30;
  const endDate = new Date(baseDate);
  endDate.setDate(baseDate.getDate() + daysToAdd);

  return {
    id: i + 11,
    title: `Campaign ${15 - i}`,
    description: `Participate in our latest social engagement campaign. Complete verified tasks and earn rewards based on authentic engagement metrics.`,
    platform: ['Twitter', 'Instagram', 'TikTok'][i % 3],
    reward: rewards[i % 10],
    participants: participantCounts[i % 10],
    endDate: endDate.toLocaleDateString(),
    status: (['Active', 'Active', 'Ending Soon'] as const)[i % 3],
  };
});

export const ALL_CAMPAIGNS = [...EXPLORE_CAMPAIGNS, ...PASS_CAMPAIGNS];

export function getCampaignById(id: number): Campaign | undefined {
  return ALL_CAMPAIGNS.find((campaign) => campaign.id === id);
}
