import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

interface MatchSnippet {
  line: string;
  matchIndex: number;
  matchLength: number;
}

interface SearchItem {
  title: string;
  description: string;
  slug: string;
  type: 'Blog' | 'Project' | 'Creativity';
  href: string;
  matches: MatchSnippet[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  const query = q.toLowerCase().trim();
  const results: SearchItem[] = [];

  const searchDirs = [
    {
      dir: path.join(process.cwd(), 'src/data/blog'),
      type: 'Blog' as const,
      hrefPrefix: '/blog',
    },
    {
      dir: path.join(process.cwd(), 'src/data/projects'),
      type: 'Project' as const,
      hrefPrefix: '/projects',
    },
    {
      dir: path.join(process.cwd(), 'src/data/creativities'),
      type: 'Creativity' as const,
      hrefPrefix: '/frontend-creativities',
    },
  ];

  for (const { dir, type: itemType, hrefPrefix } of searchDirs) {
    // Apply type filter if not 'all'
    if (type !== 'all' && type.toLowerCase() !== itemType.toLowerCase() + 's') {
      continue;
    }

    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith('.mdx')) continue;

      try {
        const filePath = path.join(dir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        // Skip unpublished content
        if (data.isPublished === false) continue;

        const title = data.title || '';
        const description = data.description || '';
        const slug = file.replace(/\.mdx$/, '');
        const href = `${hrefPrefix}/${slug}`;

        const matches: MatchSnippet[] = [];

        // Check title match
        const titleMatchIdx = title.toLowerCase().indexOf(query);
        // Check description match
        const descMatchIdx = description.toLowerCase().indexOf(query);

        // Scan content line by line
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Strip simple markdown tags like headers (#), links, bold, etc.
          const cleanLine = trimmedLine
            .replace(/^#+\s+/, '') // Headers
            .replace(/[*_`]/g, '') // Formatting
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // MDX Links

          const matchIdx = cleanLine.toLowerCase().indexOf(query);
          if (matchIdx !== -1) {
            matches.push({
              line: cleanLine,
              matchIndex: matchIdx,
              matchLength: query.length,
            });

            // Limit snippets to 8 per file to keep response payload small
            if (matches.length >= 8) break;
          }
        }

        // If title, description, or any content line matched, include this post
        if (titleMatchIdx !== -1 || descMatchIdx !== -1 || matches.length > 0) {
          // If no content line matched but title or description did, we can add a fallback snippet
          if (matches.length === 0 && description) {
            const cleanDesc = description.replace(/[*_`]/g, '');
            const descIdx = cleanDesc.toLowerCase().indexOf(query);
            matches.push({
              line: cleanDesc,
              matchIndex: descIdx !== -1 ? descIdx : 0,
              matchLength: descIdx !== -1 ? query.length : 0,
            });
          }

          results.push({
            title,
            description,
            slug,
            type: itemType,
            href,
            matches,
          });
        }
      } catch (err) {
        console.error(`Error processing file ${file} for search:`, err);
      }
    }
  }

  // Sort results: title matches first, then count of matches
  const sortedResults = results.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(query) ? 1 : 0;
    const bTitleMatch = b.title.toLowerCase().includes(query) ? 1 : 0;
    if (aTitleMatch !== bTitleMatch) {
      return bTitleMatch - aTitleMatch;
    }
    return b.matches.length - a.matches.length;
  });

  return NextResponse.json({ results: sortedResults });
}
