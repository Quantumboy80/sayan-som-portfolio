import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';
import TechsPageClient from '@/components/techs/TechsPageClient';
import React from 'react';

export const metadata: Metadata = {
  ...getMetadata('/techs'),
};

export default function TechsPage() {
  return <TechsPageClient />;
}
