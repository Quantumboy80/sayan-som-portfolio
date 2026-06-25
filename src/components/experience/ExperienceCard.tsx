import { type Experience } from '@/config/Experience';
import { cn } from '@/lib/utils';
import { Link } from 'next-view-transitions';
import React from 'react';

import Skill from '../common/Skill';
import Github from '../svgs/Github';
import LinkedIn from '../svgs/LinkedIn';
import Website from '../svgs/Website';
import X from '../svgs/X';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ExperienceCardProps {
  experience: Experience;
}

const parseDescription = (text: string): string => {
  return text.replace(/\*(.*?)\*/g, '<b>$1</b>');
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Company Header Row */}
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        {/* Left: Company name + badge + position */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3
              className={cn(
                'text-xl font-bold',
                experience.isBlur ? 'blur-[5px]' : 'blur-none',
              )}
            >
              {experience.company}
            </h3>

            {/* Social links */}
            {experience.website && experience.website !== '#' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={experience.website}
                    target="_blank"
                    className="size-4 text-neutral-500"
                  >
                    <Website />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Visit Website</TooltipContent>
              </Tooltip>
            )}
            {experience.x && experience.x !== '#' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={experience.x}
                    target="_blank"
                    className="size-4 text-neutral-500"
                  >
                    <X />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Follow on X</TooltipContent>
              </Tooltip>
            )}
            {experience.linkedin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={experience.linkedin}
                    target="_blank"
                    className="size-4 text-neutral-500"
                  >
                    <LinkedIn />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Connect on LinkedIn</TooltipContent>
              </Tooltip>
            )}
            {experience.github && experience.github !== '#' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={experience.github}
                    target="_blank"
                    className="size-4 text-neutral-500"
                  >
                    <Github />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View GitHub</TooltipContent>
              </Tooltip>
            )}

            {/* Working badge */}
            {experience.isCurrent && (
              <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                <div className="size-1.5 animate-pulse rounded-full bg-green-500" />
                Working
              </div>
            )}
          </div>

          {/* Position */}
          <p className="text-sm text-neutral-400">{experience.position}</p>
        </div>

        {/* Right: Date + Location */}
        <div className="flex flex-col text-sm text-neutral-400 md:items-end">
          <span>
            {experience.startDate} –{' '}
            {experience.isCurrent ? 'Present' : experience.endDate}
          </span>
          <span>{experience.location}</span>
        </div>
      </div>

      {/* Separator */}
      <Separator className="opacity-20" />

      {/* Technologies & Tools */}
      <div>
        <h4 className="mb-3 text-sm font-bold">Technologies &amp; Tools</h4>
        <div className="flex flex-wrap gap-2">
          {experience.technologies.map((technology, techIndex: number) => (
            <Skill
              key={techIndex}
              name={technology.name}
              href={technology.href}
            >
              {technology.icon}
            </Skill>
          ))}
        </div>
      </div>

      {/* What I've done */}
      <div className="flex flex-col gap-1">
        <h4 className="mb-1 text-sm font-bold">What I&apos;ve done</h4>
        {experience.description.map(
          (description: string, descIndex: number) => (
            <p
              key={descIndex}
              className="text-sm text-neutral-400"
              dangerouslySetInnerHTML={{
                __html: `▪ ${parseDescription(description)}`,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
