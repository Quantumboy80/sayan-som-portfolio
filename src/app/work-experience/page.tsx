import Container from '@/components/common/Container';
import { ExperienceList } from '@/components/experience/ExperienceList';
import { Separator } from '@/components/ui/separator';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { getExperienceData, getSettings } from '@/lib/content';
import { getIcon } from '@/lib/mapper';
import { Metadata } from 'next';
import { Robots } from 'next/dist/lib/metadata/types/metadata-types';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  ...getMetadata('/work-experience'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  } as Robots,
};

export default async function WorkExperiencePage() {
  const settings = await getSettings();
  if (!settings.sections.experience) {
    redirect('/');
  }

  const experienceData = await getExperienceData();
  const experiences = experienceData.map((exp: any) => ({
    ...exp,
    technologies: exp.technologies.map((tech: any) => ({
      ...tech,
      icon: getIcon(tech.icon),
    })),
  }));

  return (
    <Container className="py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Work Experience
          </h1>
          <p className="text-muted-foreground text-base">
            My work experiences across different companies and roles.
          </p>
        </div>

        <Separator />

        {/* Work Experiences */}
        <ExperienceList experiences={experiences} />
      </div>
    </Container>
  );
}
