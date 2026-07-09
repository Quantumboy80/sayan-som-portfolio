export const certificates = [
  {
    file: '/certificates/intro-mcp.png',
    title: 'Introduction to Model Context Protocol',
    issuer: 'Anthropic',
    date: '2026-04-17',
    tags: ['MCP', 'AI', 'Anthropic', 'Integration'],
    description: 'Official certification from Anthropic for the Model Context Protocol, studying the architecture, server-client interactions, and data schemas that connect AI models to external tools.',
  },
  {
    file: '/certificates/fundamentals-llm.png',
    title: 'Fundamentals of LLMs',
    issuer: 'Hugging Face',
    date: '2026-02-02',
    tags: ['LLMs', 'AI', 'Hugging Face'],
    description: 'Successfully completed the Fundamentals of LLMs course, covering foundational transformer architectures, pre-training, fine-tuning, and open-source model evaluation.',
  },
  {
    file: '/certificates/mcp-production-automation.png',
    title: 'MCP for Production Automation',
    issuer: 'Hugging Face',
    date: '2026-01-19',
    tags: ['MCP', 'Automation', 'AI', 'Hugging Face'],
    description: 'Awarded Certificate of Achievement for the MCP Course Unit 3, specializing in deploying Model Context Protocol servers to automate workflow pipelines and production infrastructure tasks.',
  },
  {
    file: '/certificates/intro-ai.png',
    title: 'Introduction to AI',
    issuer: 'Google / Coursera',
    date: '2025-12-27',
    tags: ['AI', 'Machine Learning', 'Google'],
    description: 'Completed the Google-authorized Introduction to AI course, focusing on core concepts of artificial intelligence, machine learning algorithms, and deep learning architectures.',
  },
  {
    file: '/certificates/claude-101.png',
    title: 'Claude 101 Certificate of Completion',
    issuer: 'Anthropic',
    date: '2025-12-10',
    tags: ['AI', 'Claude', 'LLMs'],
    description: 'Awarded for successfully completing the Claude 101 course, covering Anthropic\'s model capabilities, prompt engineering techniques, and API integration.',
  },
  {
    file: '/certificates/notion-academy-essentials.png',
    title: 'Notion Academy: Essentials Badge',
    issuer: 'Notion Academy',
    date: '2025-08-15',
    tags: ['Notion', 'Productivity', 'Collaboration'],
    description: 'Earned the Essentials badge from Notion Academy, demonstrating mastery over Notion databases, page organization, workspace templates, and team collaboration settings.',
  },
  {
    file: '/certificates/seo-with-ai.png',
    title: 'SEO with AI',
    issuer: 'Sololearn',
    date: '2025-04-14',
    tags: ['SEO', 'AI', 'Marketing'],
    description: 'Completed Sololearn course on AI-driven Search Engine Optimization, focusing on keyword strategies, search rank optimizations, and content generation utilizing generative AI models.',
  },
  {
    file: '/certificates/openai-api-intro.png',
    title: 'OpenAI API: Introduction',
    issuer: 'LinkedIn Learning',
    date: '2024-04-14',
    tags: ['OpenAI', 'API', 'AI Integration'],
    description: 'Course completion certificate in OpenAI APIs, covering fundamental prompt design, system instructions, token usage optimization, and token limits on GPT model API endpoints.',
  },
  {
    file: '/certificates/kotlin.png',
    title: 'Kotlin Developer Certification',
    issuer: 'Sololearn',
    date: '2024-01-11',
    tags: ['Kotlin', 'Android', 'Mobile Development'],
    description: 'Earned Kotlin developer certification from Sololearn, demonstrating full theoretical understanding and programming skills in Kotlin language syntax and paradigms.',
  },
];

export type ResearchItem = {
  title: string;
  venue: string;
  role: string;
  description: string;
  tags: string[];
  link?: string;
};
 
export type OpenSourceItem = {
  program: string;
  description: string;
  mergedPRs?: number;
  repos?: number;
  link?: string;
};
 
export type HackathonItem = {
  name: string;
  track: string;
  result?: string;
  date: string;
  link?: string;
};
 
export type CredentialItem = {
  name: string;
  issuer: string;
  date: string;
  link?: string;
};
 
export const leetcodeUsername = "sayansom"; // confirm this is your real handle
 
export const research: ResearchItem[] = [
  {
    title: "Best Paper Award — AI-based leaf disease classification",
    venue: "BIOSPECTRUM 2025",
    role: "Lead author",
    description:
      "Recognized among peer submissions for applied computer vision work in agricultural disease detection.",
    tags: ["Best paper award", "Computer vision"],
    // link: "https://your-paper-link-if-public.com",
  },
  {
    title: "Battery SOC/SOH estimation using Extended Kalman Filter",
    venue: "Peer review",
    role: "Co-author",
    description:
      "Thevenin equivalent circuit model with EKF for state-of-charge and state-of-health estimation, validated on NASA PCoE datasets.",
    tags: ["EKF", "MATLAB", "NASA PCoE"],
  },
];
 
export const openSource: OpenSourceItem[] = [
  {
    program: "GSSoC 2026",
    description: "GirlScript Summer of Code contributor.",
    mergedPRs: 0, // fill with real count
    repos: 0, // fill with real count
    // link: "https://github.com/Quantumboy80?tab=overview",
  },
];
 
export const hackathons: HackathonItem[] = [
  {
    name: "Midnight Foundation Hackathon",
    track: "Privacy-preserving AI / data security",
    date: "2026",
    // result: "Finalist", // only if true
  },
];
 
export const credentials: CredentialItem[] = [
  { name: "Claude 101", issuer: "Anthropic", date: "2026" },
  { name: "Claude Code 101", issuer: "Anthropic", date: "2026" },
  { name: "Introduction to MCP", issuer: "Anthropic", date: "2026" },
];
 
export const competitiveProgramming = {
  icpc: "ICPC regional participant",
};

const achievementsConfig = {
  certificates,
  research,
  openSource,
  hackathons,
  credentials,
  competitiveProgramming,
  leetcodeUsername
};
 
export default achievementsConfig;
