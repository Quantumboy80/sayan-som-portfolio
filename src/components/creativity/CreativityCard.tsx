import { CreativityPostPreview } from '@/types/creativity';
import { Link } from 'next-view-transitions';
import React from 'react';
import { HoverPreview } from '../common/HoverPreview';

interface CreativityCardProps {
  post: CreativityPostPreview;
}

export function CreativityCard({ post }: CreativityCardProps) {
  const { slug, frontmatter } = post;
  const { title, description, image, video, tags, date } = frontmatter;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <HoverPreview image={image} video={video} title={title}>
      <Link
        className="group flex flex-col gap-1 border-b border-muted/50 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 last:border-0"
        href={`/frontend-creativities/${slug}`}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors z-10">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
          <time
            className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex pt-1"
            dateTime={date}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="size-3.5"
            >
              <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
            </svg>
            {formattedDate}
          </time>
        </div>
        <div className="flex flex-row items-center justify-between gap-4 sm:contents">
          <time
            className="flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden"
            dateTime={date}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="size-3.5"
            >
              <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
            </svg>
            {formattedDate}
          </time>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary transition-colors shrink-0">
            Read more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="size-4"
            >
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
            </svg>
          </span>
        </div>
      </Link>
    </HoverPreview>
  );
}
