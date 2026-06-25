import { Certificate, CertificateCard } from './CertificateCard';

interface CertificateListProps {
  certificates: Certificate[];
  onCertificateClick: (file: string) => void;
  onHoverIndexChange?: (index: number | null) => void;
  hoveredIndex?: number | null;
  className?: string;
}

export function CertificateList({
  certificates,
  onCertificateClick,
  onHoverIndexChange,
  hoveredIndex = null,
  className = '',
}: CertificateListProps) {
  if (certificates.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-semibold">No certificates found</h2>
        <p className="text-muted-foreground">
          Check back later for new certificates!
        </p>
      </div>
    );
  }

  const isAnyHovered = hoveredIndex !== null;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {certificates.map((cert, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <CertificateCard
            key={cert.file}
            certificate={cert}
            onClick={() => onCertificateClick(cert.file)}
            onMouseEnter={() => onHoverIndexChange && onHoverIndexChange(index)}
            onMouseLeave={() => onHoverIndexChange && onHoverIndexChange(null)}
            isHovered={isHovered}
            isAnyHovered={isAnyHovered}
          />
        );
      })}
    </div>
  );
}
