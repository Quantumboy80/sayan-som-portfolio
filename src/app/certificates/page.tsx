import Container from '@/components/common/Container';
import { CertificatesPageClient } from '@/components/certificates/CertificatesPageClient';
import { getCertificatesData } from '@/lib/journey';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  ...getMetadata('/certificates'),
  robots: { index: true, follow: true },
};

function CertificatesPageLoading() {
  return (
    <Container className="py-16">
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-xl font-semibold">Loading certificates...</h2>
      </div>
    </Container>
  );
}

export default function CertificatesPage() {
  const allCertificates = getCertificatesData();

  // Extract all unique tags across all certificates
  const allTagsSet = new Set<string>();
  allCertificates.forEach((c: any) => {
    const tags = c.tags || (c.issuer ? [c.issuer] : ['Certificate']);
    tags.forEach((t: string) => allTagsSet.add(t));
  });
  const allTags = Array.from(allTagsSet);

  return (
    <Suspense fallback={<CertificatesPageLoading />}>
      <CertificatesPageClient
        initialCertificates={allCertificates}
        initialTags={allTags}
      />
    </Suspense>
  );
}
