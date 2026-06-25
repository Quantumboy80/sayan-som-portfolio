import { Badge } from '@/components/ui/badge';
import React from 'react';
import ArrowRight from '../svgs/ArrowRight';
import Calender from '../svgs/Calender';

export interface Certificate {
  file: string;
  title?: string;
  issuer?: string;
  date?: string;
  tags?: string[];
  description?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHovered?: boolean;
  isAnyHovered?: boolean;
}

export function CertificateCard({
  certificate,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered = false,
  isAnyHovered = false,
}: CertificateCardProps) {
  const { title, issuer, date, tags = [], description } = certificate;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const displayTags = tags.length > 0 ? tags : (issuer ? [issuer] : ['Certificate']);
  const displayDescription = description || (issuer ? `Certificate issued by ${issuer}.` : 'Academic or professional achievement certificate.');

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group flex flex-col sm:flex-row sm:items-center sm:justify-between py-8 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0 cursor-pointer w-full transition-all duration-300 ease-in-out ${
        isAnyHovered && !isHovered
          ? 'blur-[2px] opacity-25 scale-[0.99]'
          : 'blur-0 opacity-100 scale-100'
      }`}
    >
      <div className="space-y-1 flex-1 pr-4">
        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-200">
          {title || 'Certificate'}
        </h3>
        <p className="text-muted-foreground text-sm max-w-2xl line-clamp-2">
          {displayDescription}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {displayTags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-0 rounded-md py-0.5 px-2 font-normal capitalize shadow-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {tag}
            </Badge>
          ))}
          {formattedDate && (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Calender className="size-3.5" /> {formattedDate}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors duration-200 text-sm font-medium whitespace-nowrap mt-4 sm:mt-0">
        View Certificate{' '}
        <ArrowRight className="ml-1 size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </div>
  );
}
