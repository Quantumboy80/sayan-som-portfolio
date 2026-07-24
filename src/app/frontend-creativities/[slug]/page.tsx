import { CreativityContent } from '@/components/creativity/CreativityContent';
import { CreativityList } from '@/components/creativity/CreativityList';
import Container from '@/components/common/Container';
import FontSizeControls from '@/components/common/FontSizeControls';
import ArrowLeft from '@/components/svgs/ArrowLeft';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/config/Meta';
import {
  getCreativityPostBySlug,
  getCreativityPostSlugs,
  getRelatedCreativityPosts,
} from '@/lib/creativities';
import { Metadata } from 'next';
import { Link } from 'next-view-transitions';
import { notFound } from 'next/navigation';
import React from 'react';

interface CreativityPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static paths for all creativity posts
export async function generateStaticParams() {
  const slugs = getCreativityPostSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({
  params,
}: CreativityPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCreativityPostBySlug(slug);

  if (!post || !post.frontmatter.isPublished) {
    return {
      title: 'Post Not Found',
    };
  }

  const { title, description, image } = post.frontmatter;

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${title} - Frontend Creativities`,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function CreativityPostPage({ params }: CreativityPostPageProps) {
  const { slug } = await params;
  const post = await getCreativityPostBySlug(slug);

  if (!post || !post.frontmatter.isPublished) {
    notFound();
  }
  const relatedPosts = await getRelatedCreativityPosts(slug, 3);

  return (
    <>
      <Container className="py-16">
        <div className="space-y-12">
          {/* Back Button */}
          <div>
            <Button variant="ghost" asChild className="group">
              <Link href="/frontend-creativities" className="flex items-center space-x-2">
                <ArrowLeft className="size-4" />
                <span>Back to Creativities</span>
              </Link>
            </Button>
          </div>

          {/* Creativity Content */}
          <CreativityContent frontmatter={post.frontmatter} content={post.content} />

          {/* Related Works */}
          {relatedPosts.length > 0 && (
            <div className="space-y-6">
              <Separator />
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Related Works</h2>
                <CreativityList posts={relatedPosts} />
              </div>
            </div>
          )}

          {/* Back to Creativities CTA */}
          <div className="text-center">
            <Separator className="mb-8" />
            <Button asChild size="lg">
              <Link href="/frontend-creativities">View All Creative Works</Link>
            </Button>
          </div>
        </div>
      </Container>
      <FontSizeControls />
    </>
  );
}
