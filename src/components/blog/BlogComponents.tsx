import Image from 'next/image';
import React from 'react';

import { CodeCopyButton } from './CodeCopyButton';

import ReactIcon from '@/components/technologies/ReactIcon';
import ThreeJs from '@/components/technologies/ThreeJs';
import TypeScript from '@/components/technologies/TypeScript';
import GSAP from '@/components/technologies/GSAP';
import CSS from '@/components/technologies/CSS';
import Html from '@/components/technologies/Html';
import Motion from '@/components/technologies/Motion';

const techIcons: Record<string, React.ComponentType<any>> = {
  react: ReactIcon,
  threejs: ThreeJs,
  typescript: TypeScript,
  gsap: GSAP,
  css: CSS,
  html: Html,
  motion: Motion,
  vite: () => (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path fill="#646CFF" d="M12 2L2 22h20L12 2zm.5 15.5l-2.5-4h5l-2.5 4z" />
    </svg>
  ),
  r3f: ThreeJs,
  drei: ThreeJs,
  rapier: ThreeJs,
  ssao: ThreeJs,
  canvas: Html,
};

export const TechItem = ({ name, icon, role }: { name: string; icon: string; role: string }) => {
  const IconComponent = techIcons[icon.toLowerCase()] || ReactIcon;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-muted/30 p-3 bg-muted/5 dark:bg-muted/10">
      {/* Expanding Skill Tag */}
      <div className="flex-shrink-0">
        <div className="skill-inner-shadow group inline-flex h-9 items-center justify-center rounded-md border border-dashed border-black/20 bg-black/5 px-2.5 text-sm text-black transition-all duration-300 ease-in-out dark:border-white/30 dark:bg-white/15 dark:text-white hover:px-3">
          <div className="size-4 flex-shrink-0 flex items-center justify-center">
            <IconComponent className="size-4" />
          </div>
          <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100 text-sm font-bold whitespace-nowrap">
            {name}
          </span>
        </div>
      </div>
      {/* Role Description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground leading-snug">
          {role}
        </p>
      </div>
    </div>
  );
};

export const TechStack = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="my-6 grid gap-4 sm:grid-cols-2">
      {children}
    </div>
  );
};

export const BlogComponents = {
  TechStack,
  TechItem,
  // Override default image component
  img: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      className="rounded-lg"
      {...props}
    />
  ),
  // Custom heading with better styling
  h1: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <h1 className="mb-6 text-4xl font-bold" {...props}>
      {children}
    </h1>
  ),
  h2: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <h2 className="mt-8 mb-4 text-3xl font-semibold" {...props}>
      {children}
    </h2>
  ),
  h3: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <h3 className="mt-6 mb-3 text-2xl font-medium" {...props}>
      {children}
    </h3>
  ),
  // Custom paragraph styling
  p: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <p className="text-muted-foreground mb-4 leading-7" {...props}>
      {children}
    </p>
  ),
  // Custom list styling
  ul: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <li className="text-muted-foreground leading-7" {...props}>
      {children}
    </li>
  ),
  pre: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    const getTextContent = (node: React.ReactNode): string => {
      if (typeof node === 'string') {
        return node;
      }
      if (typeof node === 'number') {
        return String(node);
      }
      if (
        React.isValidElement(node) &&
        node.props &&
        typeof node.props === 'object'
      ) {
        return getTextContent(
          (node.props as { children?: React.ReactNode }).children,
        );
      }
      if (Array.isArray(node)) {
        return node.map(getTextContent).join('');
      }
      return '';
    };

    const codeText = getTextContent(children);

    return (
      <div className="group relative mb-4">
        <pre
          className="bg-muted/30 overflow-x-auto rounded-lg border p-4 text-sm [&>code]:bg-transparent [&>code]:p-0"
          {...props}
        >
          {children}
        </pre>
        <CodeCopyButton code={codeText} />
      </div>
    );
  },
  // Inline code styling (not affected by syntax highlighting)
  code: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => {
    // If it's part of a pre block (syntax highlighted), don't apply inline styling
    if (className?.includes('language-')) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    // Inline code styling
    return (
      <code className="rounded px-2 py-1 font-mono text-sm" {...props}>
        {children}
      </code>
    );
  },
  // Custom blockquote styling
  blockquote: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <blockquote
      className="border-primary text-muted-foreground mb-4 border-l-4 pl-4 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
};
