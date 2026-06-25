import { getCertificatesData } from '@/lib/journey';
import { Link } from 'next-view-transitions';
import React from 'react';
import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import { Button } from '../ui/button';
import CertificatesLandingClient from './CertificatesLandingClient';

export default function CertificatesLanding() {
  const certificates = getCertificatesData();
  const topCertificates = certificates.slice(0, 2);

  return (
    <Container className="mt-20">
      <SectionHeading subHeading="Featured" heading="Certificates" />
      <CertificatesLandingClient certificates={topCertificates} />
      <div className="mt-8 flex justify-center">
        <Button variant="outline">
          <Link href="/certificates">Show all certificates</Link>
        </Button>
      </div>
    </Container>
  );
}
