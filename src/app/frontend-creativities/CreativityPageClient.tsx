'use client';

import { CreativityList } from '@/components/creativity/CreativityList';
import Container from '@/components/common/Container';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { CreativityPostPreview } from '@/types/creativity';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface CreativityPageClientProps {
  initialPosts: CreativityPostPreview[];
  initialTags: string[];
}

const getCreativityPostsByTagClient = (
  posts: CreativityPostPreview[],
  tag: string,
): CreativityPostPreview[] => {
  return posts.filter((post) =>
    post.frontmatter.tags.some(
      (postTag) => postTag.toLowerCase() === tag.toLowerCase(),
    ),
  );
};

export function CreativityPageClient({
  initialPosts,
  initialTags,
}: CreativityPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { triggerHaptic, isMobile } = useHapticFeedback();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);

  // Get tag from URL params on mount
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
      const filtered = getCreativityPostsByTagClient(initialPosts, tagParam);
      setFilteredPosts(filtered);
    } else {
      setSelectedTag(null);
      setFilteredPosts(initialPosts);
    }
  }, [searchParams, initialPosts]);

  // Handle tag click
  const handleTagClick = (tag: string) => {
    if (isMobile()) {
      triggerHaptic('light');
    }

    if (selectedTag === tag) {
      setSelectedTag(null);
      setFilteredPosts(initialPosts);
      router.replace('/frontend-creativities');
    } else {
      setSelectedTag(tag);
      const filtered = getCreativityPostsByTagClient(initialPosts, tag);
      setFilteredPosts(filtered);
      router.replace(`/frontend-creativities?tag=${encodeURIComponent(tag)}`);
    }
  };

  const getTagPostCount = (tag: string) => {
    return initialPosts.filter((post) =>
      post.frontmatter.tags.some(
        (postTag) => postTag.toLowerCase() === tag.toLowerCase(),
      ),
    ).length;
  };

  return (
    <Container className="py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Frontend Creativities
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Explore interactive animations, custom 3D web graphics, UI/UX principles, and full stack creativity.
          </p>
        </div>

        <Separator />

        {/* Tags */}
        {initialTags.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Popular Tags</h2>
              {selectedTag && (
                <button
                  onClick={() => handleTagClick(selectedTag)}
                  className="text-muted-foreground hover:text-foreground text-sm underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {initialTags.map((tag) => {
                const postCount = getTagPostCount(tag);
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="transition-colors"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className="hover:bg-accent hover:text-accent-foreground tag-inner-shadow cursor-pointer capitalize"
                    >
                      {tag} ({postCount})
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Blog Posts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {selectedTag ? `Works tagged "${selectedTag}"` : 'Latest Works'}
              {filteredPosts.length > 0 && (
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({filteredPosts.length}{' '}
                  {filteredPosts.length === 1 ? 'work' : 'works'})
                </span>
              )}
            </h2>
          </div>

          <CreativityList posts={filteredPosts} />
        </div>
      </div>
    </Container>
  );
}
