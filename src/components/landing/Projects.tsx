import { getProjectsData } from '@/lib/content';
import { getIcon } from '@/lib/mapper';
import { Link } from 'next-view-transitions';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import { ProjectList } from '../projects/ProjectList';
import { Button } from '../ui/button';

export default async function Projects() {
  const projectsData = await getProjectsData();

  const projects = projectsData.map((project: any) => ({
    ...project,
    technologies: project.technologies.map((tech: any) => ({
      ...tech,
      icon: getIcon(tech.icon),
    })),
  }));

  return (
    <Container className="mt-20">
      <SectionHeading subHeading="Featured" heading="Projects" />

      <ProjectList className="mt-8" projects={projects.slice(0, 4)} />
      <div className="mt-8 flex justify-center">
        <Button variant="outline">
          <Link href="/projects">Show all projects</Link>
        </Button>
      </div>
    </Container>
  );
}
