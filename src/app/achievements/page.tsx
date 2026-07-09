import Container from '@/components/common/Container';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';
import Achievements from '@/components/sections/Achievements';
import React from 'react';

export const metadata: Metadata = {
  ...getMetadata('/achievements'),
};

export default async function AchievementsPage() {
  return (
    <Container className="py-8">
      <Achievements />
    </Container>
  );
}
