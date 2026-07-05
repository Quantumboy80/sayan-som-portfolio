import Container from '@/components/common/Container';
import About from '@/components/landing/About';
import Certificates from '@/components/landing/Certificates';
import CTA from '@/components/landing/CTA';
import Experience from '@/components/landing/Experience';
import Github from '@/components/landing/Github';
import Hero from '@/components/landing/Hero';
import Journey from '@/components/landing/Journey';
import Work from '@/components/landing/Projects';
import Setup from '@/components/landing/Setup';
import { getSettings } from '@/lib/content';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function page() {
  const settings = await getSettings();
  const { sections } = settings;

  return (
    <Container className="min-h-screen py-16">
      {sections.hero && <Hero />}
      {sections.experience && <Experience />}
      {sections.projects && <Work />}
      {sections.about && <About />}
      {sections.github && <Github />}
      {sections.certificates && <Certificates />}
      {sections.cta && <CTA />}
      {sections.setup && <Setup />}
      {sections.journey && <Journey />}
    </Container>
  );
}
