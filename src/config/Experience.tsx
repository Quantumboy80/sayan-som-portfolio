import AWS from '@/components/technologies/AWS';
import BootStrap from '@/components/technologies/BootStrap';
import Bun from '@/components/technologies/Bun';
import CSS from '@/components/technologies/CSS';
import ExpressJs from '@/components/technologies/ExpressJs';
import Figma from '@/components/technologies/Figma';
import Html from '@/components/technologies/Html';
import JavaScript from '@/components/technologies/JavaScript';
import MongoDB from '@/components/technologies/MongoDB';
import NestJs from '@/components/technologies/NestJs';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import Postman from '@/components/technologies/Postman';
import Prisma from '@/components/technologies/Prisma';
import ReactIcon from '@/components/technologies/ReactIcon';
import TailwindCss from '@/components/technologies/TailwindCss';
import TypeScript from '@/components/technologies/TypeScript';
import Vercel from '@/components/technologies/Vercel';
import Supabase from '@/components/technologies/Supabase';
import Redis from '@/components/technologies/Redis';
import WebRTC from '@/components/technologies/WebRTC';
import GSAP from '@/components/technologies/GSAP';
import Motion from '@/components/technologies/Motion';
import React from 'react';

export interface Technology {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  image: string;
  description: string[];
  startDate: string;
  endDate: string;
  website: string;
  x?: string;
  linkedin?: string;
  github?: string;
  technologies: Technology[];
  isCurrent: boolean;
  isBlur?: boolean;
}

export const experiences: Experience[] = [
  {
    isCurrent: true,
    isBlur: true,
    company: 'Nenzon Technologies (start-up)',
    position: 'Full Stack Engineer',
    location: 'Kolkata, West Bengal, India (Remote)',
    image: '/company/nenzon.png',
    description: [
      'Designed and built DhabaFlow, a multi-tenant QR-code table-side dining storefront utilizing Next.js, TypeScript, and Tailwind CSS mapped to Supabase for zero-latency, serverless execution.',
      'Integrated Supabase Realtime for KDS live status tracking and implemented peer-to-peer WebRTC audio streams for direct guest-to-kitchen voice calling.',
      'Secured order pipelines against double-spend races using Prisma transactions, client-generated idempotency validations, and Upstash Redis rate limiting.',
    ],
    startDate: 'Feb 2026',
    endDate: 'Present',
    website: 'https://nenzon.com',
    technologies: [
      {
        name: 'React',
        href: 'https://react.dev/',
        icon: <ReactIcon />,
      },
      {
        name: 'Next.js',
        href: 'https://nextjs.org/',
        icon: <NextJs />,
      },
      {
        name: 'TypeScript',
        href: 'https://typescriptlang.org/',
        icon: <TypeScript />,
      },
      {
        name: 'Tailwind CSS',
        href: 'https://tailwindcss.com/',
        icon: <TailwindCss />,
      },
      {
        name: 'Framer Motion',
        href: 'https://www.framer.com/motion/',
        icon: <Motion />,
      },
      {
        name: 'GSAP',
        href: 'https://gsap.com/',
        icon: <GSAP />,
      },
      {
        name: 'PostgreSQL',
        href: 'https://www.postgresql.org/',
        icon: <PostgreSQL />,
      },
      {
        name: 'Supabase',
        href: 'https://supabase.com/',
        icon: <Supabase />,
      },
      {
        name: 'Prisma',
        href: 'https://www.prisma.io/',
        icon: <Prisma />,
      },
      {
        name: 'Upstash Redis',
        href: 'https://upstash.com/',
        icon: <Redis />,
      },
      {
        name: 'WebRTC',
        href: 'https://webrtc.org/',
        icon: <WebRTC />,
      },
    ],
  },
  {
    isCurrent: false,
    company: 'IEM Research Foundation',
    position: 'Internship',
    location: 'Hybrid · Kolkata, West Bengal, India',
    image: '/company/iem.png',
    description: [
      'Built workflow modules for LMS & ERP platform, enabling academic automation and cross-system data integration across core pipelines.',
      'Developed and tested 5+ application modules/features, improving system reliability, integration consistency, and overall user experience through iterative development cycles.',
    ],
    startDate: 'Dec 2025',
    endDate: 'Feb 2026',
    website: 'https://iemcal.com',
    linkedin: 'https://www.linkedin.com/school/iemcal/',
    technologies: [
      {
        name: 'JavaScript',
        href: 'https://javascript.com/',
        icon: <JavaScript />,
      },
      {
        name: 'CSS',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
        icon: <CSS />,
      },
      {
        name: 'MongoDB',
        href: 'https://mongodb.com/',
        icon: <MongoDB />,
      },
      {
        name: 'Node.js',
        href: 'https://nodejs.org/',
        icon: <NodeJs />,
      },
      {
        name: 'HTML',
        href: 'https://html.com/',
        icon: <Html />,
      },
    ],
  },
];
