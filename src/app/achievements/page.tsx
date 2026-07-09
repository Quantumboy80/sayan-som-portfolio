import Container from '@/components/common/Container';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { getAchievementsData } from '@/lib/content';
import { Metadata } from 'next';
import AchievementsPageClient from '@/components/achievements/AchievementsPageClient';
import React from 'react';

export const metadata: Metadata = {
  ...getMetadata('/achievements'),
};

export default async function AchievementsPage() {
  const achievements = await getAchievementsData();

  return (
    <Container className="py-8">
      <AchievementsPageClient data={achievements} />
    </Container>
  );
}
