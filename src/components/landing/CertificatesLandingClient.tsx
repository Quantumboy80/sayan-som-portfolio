'use client';

import React, { useState, useRef } from 'react';
import { Certificate, CertificateCard } from '../certificates/CertificateCard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';

interface CertificatesLandingClientProps {
  certificates: Certificate[];
}

export default function CertificatesLandingClient({
  certificates,
}: CertificatesLandingClientProps) {
  const [active, setActive] = useState<string | null>(null);
  const activeCert = certificates.find((c) => c.file === active);

  // Floating preview states
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouseCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const isAnyHovered = hoveredIndex !== null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIndex(null)}
      className="relative w-full animate-none"
    >
      <div className="flex flex-col w-full">
        {certificates.map((cert, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <CertificateCard
              key={cert.file}
              certificate={cert}
              onClick={() => setActive(cert.file)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              isHovered={isHovered}
              isAnyHovered={isAnyHovered}
            />
          );
        })}
      </div>

      {/* Hover Floating Preview Image */}
      <div
        className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-neutral-200/80 bg-background p-1.5 shadow-2xl w-64 md:w-80 aspect-video transition-all duration-200 ease-out hidden sm:block"
        style={{
          left: `${mouseCoords.x}px`,
          top: `${mouseCoords.y}px`,
          transform: `translate(-50%, -50%) scale(${hoveredIndex !== null ? 1 : 0.85})`,
          opacity: hoveredIndex !== null ? 1 : 0,
          transitionProperty: 'left, top, opacity, transform',
          transitionDuration: '120ms, 120ms, 200ms, 200ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        {hoveredIndex !== null && certificates[hoveredIndex] && (
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={certificates[hoveredIndex].file}
              alt={certificates[hoveredIndex].title || 'Certificate'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 256px, 320px"
            />
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox viewer */}
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="bg-background/95 max-h-[90vh] w-full max-w-[90vw] border-0 p-0 backdrop-blur-sm">
          {active && activeCert && (
            <>
              <DialogTitle className="sr-only">
                {activeCert.title || 'Certificate'}
              </DialogTitle>
              <div className="flex h-60 items-center justify-center p-4 md:h-92">
                <div className="relative h-full w-full rounded-lg">
                  <Image
                    src={active}
                    alt={activeCert.title || 'certificate'}
                    fill
                    className="rounded-lg object-contain"
                  />
                </div>
              </div>
              <div className="border-t px-6 pt-4 pb-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    {activeCert.title || 'Certificate'}
                  </h3>
                  {activeCert.issuer && (
                    <p className="text-muted-foreground text-sm">
                      Issued by: <b>{activeCert.issuer}</b>
                    </p>
                  )}
                  {activeCert.description && (
                    <p className="text-secondary text-sm">
                      {activeCert.description}
                    </p>
                  )}
                  {activeCert.date && (
                    <time
                      className="text-muted-foreground block text-xs"
                      dateTime={activeCert.date}
                    >
                      Date: {formatDate(activeCert.date)}
                    </time>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
