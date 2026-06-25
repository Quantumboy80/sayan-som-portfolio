import { getExperienceData } from '@/lib/content';
import { getIcon } from '@/lib/mapper';
import { Link } from 'next-view-transitions';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import { ExperienceCard } from '../experience/ExperienceCard';
import { Button } from '../ui/button';

export default async function Experience() {
  const experienceData = await getExperienceData();

  const experiences = experienceData.map((exp: any) => ({
    ...exp,
    technologies: exp.technologies.map((tech: any) => ({
      ...tech,
      icon: getIcon(tech.icon),
    })),
  }));

  return (
    <Container className="mt-20">
      <SectionHeading subHeading="Journey" heading="Work Experience" />
      <div className="mt-4 flex flex-col gap-8">
        {experiences.slice(0, 2).map((experience: any) => (
          <ExperienceCard key={experience.company} experience={experience} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="outline">
          <Link href="/work-experience">Show all work experiences</Link>
        </Button>
      </div>
    </Container>
  );
}
