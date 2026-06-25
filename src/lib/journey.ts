import { certificates as configuredCertificates } from '@/config/Achievements';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const journeyDirectory = path.join(process.cwd(), 'src/data/journey');

export function getJourneyContent() {
  try {
    const fullPath = path.join(journeyDirectory, `journey.mdx`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    return { frontmatter: data, content };
  } catch (error) {
    console.error('Error reading journey.mdx', error);
    return null;
  }
}

export function getCertificatesData() {
  const certDir = path.join(process.cwd(), 'public', 'certificates');
  let discovered: any[] = [];
  try {
    if (fs.existsSync(certDir)) {
      const files = fs.readdirSync(certDir);
      discovered = files
        .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
        .map((f) => ({
          file: `/certificates/${f}`,
          title: undefined,
          issuer: undefined,
          date: undefined,
          tags: [],
          description: undefined,
        }));
    }
  } catch {
    discovered = [];
  }

  const configured = Array.isArray(configuredCertificates)
    ? configuredCertificates
    : [];
  const map = new Map<string, any>();
  configured.forEach((c: any) => map.set(c.file, c));
  discovered.forEach((d) => {
    if (!map.has(d.file)) map.set(d.file, d);
  });

  return Array.from(map.values());
}

const journeyLib = { getJourneyContent, getCertificatesData };

export default journeyLib;
