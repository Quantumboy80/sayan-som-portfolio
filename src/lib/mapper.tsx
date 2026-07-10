import AWS from '@/components/technologies/AWS';
import Appwrite from '@/components/technologies/Appwrite';
import BootStrap from '@/components/technologies/BootStrap';
import Bun from '@/components/technologies/Bun';
import CSS from '@/components/technologies/CSS';
import ExpressJs from '@/components/technologies/ExpressJs';
import Figma from '@/components/technologies/Figma';
import Github from '@/components/technologies/Github';
import Html from '@/components/technologies/Html';
import JavaScript from '@/components/technologies/JavaScript';
import MDXIcon from '@/components/technologies/MDXIcon';
import MongoDB from '@/components/technologies/MongoDB';
import Motion from '@/components/technologies/Motion';
import NestJs from '@/components/technologies/NestJs';
import Netlify from '@/components/technologies/Netlify';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import Postman from '@/components/technologies/Postman';
import Prisma from '@/components/technologies/Prisma';
import ReactIcon from '@/components/technologies/ReactIcon';
import Sanity from '@/components/technologies/Sanity';
import Shadcn from '@/components/technologies/Shadcn';
import SocketIo from '@/components/technologies/SocketIo';
import TailwindCss from '@/components/technologies/TailwindCss';
import ThreeJs from '@/components/technologies/ThreeJs';
import TypeScript from '@/components/technologies/TypeScript';
import Vercel from '@/components/technologies/Vercel';
import Notion from '@/components/technologies/Notion';
import Supabase from '@/components/technologies/Supabase';
import Redis from '@/components/technologies/Redis';
import WebRTC from '@/components/technologies/WebRTC';
import GSAP from '@/components/technologies/GSAP';
import CSharp from '@/components/technologies/CSharp';
import DotNet from '@/components/technologies/DotNet';
import SQLite from '@/components/technologies/SQLite';
import React from 'react';

export const iconMap: Record<string, React.FC<any>> = {
    AWS,
    Appwrite,
    BootStrap,
    Bun,
    CSS,
    ExpressJs,
    Figma,
    Github,
    Html,
    JavaScript,
    MDXIcon,
    MongoDB,
    Motion,
    NestJs,
    Netlify,
    NextJs,
    NodeJs,
    PostgreSQL,
    Postman,
    Prisma,
    ReactIcon,
    Sanity,
    Shadcn,
    SocketIo,
    TailwindCss,
    ThreeJs,
    TypeScript,
    Vercel,
    Notion,
    Supabase,
    Redis,
    "Upstash Redis": Redis,
    WebRTC,
    GSAP,
    "Framer Motion": Motion,
    CSharp,
    "C#": CSharp,
    DotNet,
    ".NET": DotNet,
    ".NET 8.0": DotNet,
    SQLite,
};

export function getIcon(name: string) {
    const Icon = iconMap[name];
    return Icon ? <Icon /> : null;
}
