import { CreativityPostPreview } from '@/types/creativity';
import React from 'react';

import { CreativityCard } from './CreativityCard';

interface CreativityListProps {
  posts: CreativityPostPreview[];
  className?: string;
}

export function CreativityList({ posts, className = '' }: CreativityListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-semibold">No creative works found</h2>
        <p className="text-muted-foreground">
          Check back later for new content!
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-2 ${className}`}>
      {posts.map((post) => (
        <CreativityCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
