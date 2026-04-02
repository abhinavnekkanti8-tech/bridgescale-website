/* ─────────────────────────────────────────────────────────────────
   BridgeScale Blog — Content Index
   ─────────────────────────────────────────────────────────────────

   TO PUBLISH A NEW BLOG POST:
   1. Create a new file in this folder:  src/content/blog/your-post-slug.ts
   2. Export a BlogPost object (copy the structure from any existing post)
   3. Import it below and add it to the POSTS array
   4. The post will appear on /blog and /blog/your-post-slug automatically

   Post fields:
     slug      — URL path: /blog/{slug}   (use-kebab-case, no spaces)
     title     — Headline
     date      — "YYYY-MM-DD"
     author    — Your name
     excerpt   — 1-2 sentence summary shown on the listing page
     content   — Full post body as an HTML string (or plain paragraphs)
   ──────────────────────────────────────────────────────────────── */

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
}

// ── Import posts here ──
import { post as post001 } from './001-why-fractional-works';
import { post as post002 } from './002-diaspora-advantage';

// ── Add new posts to this array (newest first) ──
export const POSTS: BlogPost[] = [
  post002,
  post001,
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
