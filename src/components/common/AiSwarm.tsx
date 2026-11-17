'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';

const AI_HOSTS = [
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'perplexity.ai',
  'gemini.google.com',
  'bard.google.com',
  'copilot.microsoft.com',
  'copilot.com',
  'edgeservices.bing.com',
  'grok.com',
  'deepseek.com',
  'meta.ai',
  'chat.mistral.ai',
  'you.com',
  'poe.com',
  'phind.com',
];

const AI_SOURCES = [
  'chatgpt',
  'openai',
  'claude',
  'perplexity',
  'gemini',
  'copilot',
  'grok',
  'deepseek',
  'mistral',
  'phind',
  'ai',
];

function isAiHost(hostname: string) {
  return AI_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

const emptySubscribe = () => () => {};

function checkIsAiVisitor(): boolean {
  if (typeof window === 'undefined') return false;

  const isEmbed = /\/blog\/[^/]+\/embed\/?$/.test(window.location.pathname);
  const isIframe = window.self !== window.top;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isEmbed || isIframe || prefersReducedMotion) return false;

  const searchParams = new URLSearchParams(window.location.search);
  const utmSource = searchParams.get('utm_source')?.trim().toLowerCase() ?? '';
  const ref = searchParams.get('ref')?.trim().toLowerCase() ?? '';
  const source = utmSource || ref;

  if (source && (AI_SOURCES.includes(source) || isAiHost(source))) {
    return true;
  }

  // Allow manual testing via ?swarm=true or #swarm
  if (searchParams.get('swarm') === 'true' || window.location.hash === '#swarm') {
    return true;
  }

  try {
    const referrerHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';
    if (referrerHost && isAiHost(referrerHost)) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export default function AiSwarm() {
  const isAiVisitor = useSyncExternalStore(
    emptySubscribe,
    checkIsAiVisitor,
    () => false
  );

  if (!isAiVisitor) return null;

  return (
    <Script
      id="ai-swarm"
      src="/swarm/swarm.js"
      strategy="lazyOnload"
    />
  );
}
