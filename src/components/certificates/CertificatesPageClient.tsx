'use client';

import Container from '@/components/common/Container';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Certificate, CertificateList } from './CertificateList';

interface CertificatesPageClientProps {
  initialCertificates: Certificate[];
  initialTags: string[];
}

const getCertificatesByTagClient = (
  certificates: Certificate[],
  tag: string,
): Certificate[] => {
  if (tag.toLowerCase() === 'all') return certificates;
  return certificates.filter((cert) => {
    const tags = cert.tags || (cert.issuer ? [cert.issuer] : ['Certificate']);
    return tags.some(
      (t) => t.toLowerCase() === tag.toLowerCase(),
    );
  });
};

export function CertificatesPageClient({
  initialCertificates,
  initialTags,
}: CertificatesPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { triggerHaptic, isMobile } = useHapticFeedback();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredCertificates, setFilteredCertificates] = useState(initialCertificates);
  const [active, setActive] = useState<string | null>(null);

  // Floating preview states
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Get tag from URL params on mount/update
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
      const filtered = getCertificatesByTagClient(initialCertificates, tagParam);
      setFilteredCertificates(filtered);
    } else {
      setSelectedTag(null);
      setFilteredCertificates(initialCertificates);
    }
  }, [searchParams, initialCertificates]);

  // Handle tag click
  const handleTagClick = (tag: string) => {
    if (isMobile()) {
      triggerHaptic('light');
    }

    if (tag.toLowerCase() === 'all' || selectedTag === tag) {
      setSelectedTag(null);
      setFilteredCertificates(initialCertificates);
      router.replace('/certificates');
    } else {
      setSelectedTag(tag);
      const filtered = getCertificatesByTagClient(initialCertificates, tag);
      setFilteredCertificates(filtered);
      router.replace(`/certificates?tag=${encodeURIComponent(tag)}`);
    }
  };

  const getTagCertificateCount = (tag: string) => {
    if (tag.toLowerCase() === 'all') return initialCertificates.length;
    return initialCertificates.filter((cert) => {
      const tags = cert.tags || (cert.issuer ? [cert.issuer] : ['Certificate']);
      return tags.some(
        (t) => t.toLowerCase() === tag.toLowerCase(),
      );
    }).length;
  };

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

  const activeCert = initialCertificates.find((c) => c.file === active);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouseCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const allTagsList = ['all', ...initialTags];

  return (
    <Container className="py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Certificates
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Credential history, certification achievements, and educational badges.
          </p>
        </div>

        {/* Tags */}
        {initialTags.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {allTagsList.map((tag) => {
                const count = getTagCertificateCount(tag);
                const isSelected = (tag.toLowerCase() === 'all' && !selectedTag) || selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="transition-colors animate-none"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className={`hover:bg-accent hover:text-accent-foreground tag-inner-shadow cursor-pointer capitalize py-1.5 px-3 rounded-full text-xs font-semibold select-none border-0 ${
                        isSelected 
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' 
                          : 'bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {tag} <span className="ml-1 opacity-60 font-normal">{count}</span>
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Certificates List Section */}
        <div className="space-y-6">
          {/* Wrapper with relative positioning for cursor coordinate tracking */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative w-full animate-none"
          >
            <CertificateList
              certificates={filteredCertificates}
              onCertificateClick={setActive}
              onHoverIndexChange={setHoveredIndex}
              hoveredIndex={hoveredIndex}
            />

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
              {hoveredIndex !== null && filteredCertificates[hoveredIndex] && (
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  <Image
                    src={filteredCertificates[hoveredIndex].file}
                    alt={filteredCertificates[hoveredIndex].title || 'Certificate'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
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
    </Container>
  );
}
