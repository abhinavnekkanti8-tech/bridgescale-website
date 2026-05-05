export type FaqDocLink = { label: string; href: string };
export type FaqItem = { q: string; a: string; docs?: FaqDocLink[] };
export type FaqGroup = { heading: string; items: FaqItem[] };

/* ── Sample legal-document links ──
 * PDFs are placeholder/draft versions watermarked "SAMPLE — finalised version coming soon".
 * Source markdown lives in /Docs/legal-drafts/. PDFs are served from /public/legal/.
 * Final versions will replace these in Phase 6 (P6.1).
 */
export const sampleDocs = {
  msa: { label: 'Master Services Agreement (MSA) — sample', href: '/legal/msa-sample.pdf' },
  sow: { label: 'Statement of Work (SOW) — sample', href: '/legal/sow-sample.pdf' },
  preSow: { label: 'Pre-SOW Commercial Summary — sample', href: '/legal/pre-sow-summary-sample.pdf' },
  faq: { label: 'Contracts & Payments FAQ — sample', href: '/legal/contracts-payments-faq-sample.pdf' },
  hybrid: { label: 'Hybrid (cash + equity) addendum — sample', href: '/legal/addendum-hybrid-cash-equity-sample.pdf' },
  successFee: { label: 'Success-fee addendum — sample', href: '/legal/addendum-success-fee-sample.pdf' },
  equityOnly: { label: 'Equity-only addendum — sample', href: '/legal/addendum-equity-only-sample.pdf' },
  conversion: { label: 'Conversion-to-full-time addendum — sample', href: '/legal/addendum-conversion-sample.pdf' },
} as const;

export const companiesFaqGroups: FaqGroup[] = [
  {
    heading: 'Working with our talent',
    items: [
      {
        q: 'How do you vet talent?',
        a: 'Every professional goes through a multi-stage vetting process before entering the matching pool: verified references with past employers, clients, and direct reports; an expert interview assessing commercial experience, communication, and domain depth; and a domain assessment (case-study pitch for sales roles, structured turnaround narrative for leadership). Our acceptance rate is under 15% — you only see talent who have already been vetted.',
      },
      {
        q: 'Where are the talent based?',
        a: 'Every professional on BridgeScale is a member of the Indian diaspora currently based in your target market — whether that\u2019s the EU, US, UK, Australia, Middle East, or Southeast Asia. They combine deep local market knowledge and networks with cultural fluency that makes working with Indian companies seamless.',
      },
      {
        q: 'What happens if I\u2019m not satisfied with my match?',
        a: 'We\u2019ll rematch you with a new professional from our network at no additional cost. We vet every talent on the platform and stand behind the quality — but we also know that skills and experience alone don\u2019t guarantee a good working fit. If it\u2019s not right, we\u2019ll fix it.',
      },
      {
        q: 'Can I hire them full-time later?',
        a: 'Yes. Many fractional engagements evolve into full-time roles — it\u2019s a natural outcome when both sides see the fit. A fractional engagement is the best trial period you can get: you assess real commercial execution, not interview performance. BridgeScale supports the conversion process when both parties are ready.',
      },
    ],
  },
  {
    heading: 'Pricing & process',
    items: [
      {
        q: 'What does it cost?',
        a: 'Signing up is free. You pay a one-time ₹8,500 INR fee to unlock matching — this covers your AI-powered needs diagnosis, curated talent shortlist, and introduction facilitation. International companies are billed the USD equivalent. Engagement pricing varies: sprints start at $2,500 for a 30-day project, retainers run $5,000–$10,000/month, and success-fee and hybrid structures are also available. The platform charges a 10% service fee on engagements. No hidden costs.',
      },
      {
        q: 'How quickly can I be matched?',
        a: 'Most companies receive their first curated talent shortlist within 48 hours of unlocking matching. From shortlist to first introduction call is typically same-day or next-day. Your first commercial activity can begin within 2–4 weeks of engagement start.',
      },
      {
        q: 'What results can I expect?',
        a: 'Results depend on your product, market, and sales cycle. Pipeline sprints typically generate 10–15 qualified meetings per month from a fractional salesperson working 20 hours/week. Revenue outcomes depend on your ACV and cycle — a $25K ACV product with a 2-month cycle has seen $250K+ in net new revenue from a single fractional engagement. First commercial activity usually begins within 2–4 weeks of engagement start. Every engagement is milestone-tracked through the platform, so you see what\u2019s happening in real time.',
      },
      {
        q: 'What if I\u2019m not ready to commit yet?',
        a: 'No pressure. Sign up for free, explore the platform, and complete your profile at your own pace. Your account stays active. When you\u2019re ready to see who\u2019s available, unlock matching with a one-time fee.',
      },
    ],
  },
  {
    heading: 'Contracts, payments & compliance',
    items: [
      {
        q: 'How is an engagement structured legally?',
        a: 'Every engagement runs as a tri-party arrangement between BridgeScale, your company, and the operator. Two main documents: (1) a Master Service Agreement signed once between the three parties, covering payments, IP, conversion to full-time, confidentiality, and non-circumvention \u2014 it\u2019s reused for any future engagement with the same operator. (2) A Scope of Work signed per engagement, covering scope, deliverables, timeline, fees, hours cap, and reporting cadence. Before either is signed, BridgeScale issues a non-binding Pre-SOW Commercial Summary \u2014 a one-pager that confirms engagement type, indicative fee, term, and compensation mode. Both parties confirm the summary, then the MSA is signed, then the SOW. BridgeScale handles invoicing, ACH or local-equivalent payouts, US tax forms (W-9, W-8BEN, 1099-NEC), and Employer of Record where the operator\u2019s jurisdiction requires it. EOR fees, where applicable, are charged through to your company at cost as a separate line item.',
        docs: [sampleDocs.msa, sampleDocs.sow, sampleDocs.preSow, sampleDocs.faq],
      },
    ],
  },
];

export const talentFaqGroups: FaqGroup[] = [
  {
    heading: 'Joining & vetting',
    items: [
      {
        q: 'Is it free to join?',
        a: 'Yes. Creating your profile and completing your assessment is completely free. You only pay a one-time $50 fee when you\u2019re ready to unlock matching and enter the active talent pool.',
      },
      {
        q: 'Do I need to leave my current job?',
        a: 'No. Most engagements require 15–20 hours per week and are designed to work alongside your existing full-time role. You set your availability and preferred engagement structures — sprint, retainer, or advisory.',
      },
      {
        q: 'What\u2019s the vetting process?',
        a: 'After you create your profile, you\u2019ll complete a domain assessment (a case-study response that demonstrates how you think about market entry) and submit professional references — at least 2 senior contacts who can speak to your commercial work. Once verified, your profile enters the matching pool. The assessment is completed at your own pace — there\u2019s no time pressure.',
      },
    ],
  },
  {
    heading: 'Engagements & pay',
    items: [
      {
        q: 'What kind of companies will I work with?',
        a: 'Indian startups and MSMEs that are scaling into international markets. Industries range from SaaS and FinTech to HealthTech, DeepTech, and Manufacturing. These are companies with real products and some domestic traction that need experienced international commercial talent to break into new geographies.',
      },
      {
        q: 'How do I get paid?',
        a: 'All payments are processed through the platform — monthly retainer, sprint fee, success-fee, or hybrid (cash + equity) structures. We handle cross-border contracting, invoicing, payments, and compliance so you can focus on delivery.',
      },
      {
        q: 'What markets are in demand?',
        a: 'Primarily EU, US, UK, AU/NZ, UAE, and Singapore/SEA. Companies are specifically looking for diaspora professionals with existing relationships and market knowledge in these regions. Your network and local credibility are what make you valuable.',
      },
      {
        q: 'Can a fractional engagement become full-time?',
        a: 'Yes — many do. A fractional engagement is the best audition process that exists: both you and the company get to assess fit through real work, not interviews. When it\u2019s the right match, the platform supports a smooth conversion to full-time.',
      },
    ],
  },
  {
    heading: 'Contracts & payment',
    items: [
      {
        q: 'What contracts will I sign and how do I get paid?',
        a: 'The first time you start an engagement with a new company you will sign a Master Service Agreement between you, the company, and BridgeScale — covering payments, IP, confidentiality, conversion to full-time, and non-circumvention. The MSA is reused for any future engagement with the same company. For each engagement you will also review and sign a Scope of Work covering scope, deliverables, timeline, fees, hours cap, and reporting cadence. Before any signing, you and the company review and confirm a non-binding Pre-SOW Commercial Summary. Payment runs through BridgeScale: the company pays BridgeScale; BridgeScale pays you on the cadence in the SOW (typically the first business day of each month for retainers; 50/50 for sprints). Payouts land where you choose — ACH (US), Wise (cross-border), INR direct via Wise or Razorpay (India), or via an EOR partner where required. Tax forms (W-9 / W-8BEN / GST/PAN / VAT) are collected during onboarding before your first paid engagement. The 10% platform fee is paid by the company on top of your stated rate — it does not come out of your payout.',
        docs: [sampleDocs.msa, sampleDocs.sow, sampleDocs.preSow, sampleDocs.faq],
      },
      {
        q: 'What if I want to do a hybrid, success-fee, or equity-only engagement?',
        a: 'Each non-cash structure is documented as a one-page addendum that attaches to the Scope of Work. Hybrid (cash + equity) and equity-only structures are documented via FAST templates. Success-fee components define the trigger event, the percentage, the cap, and the payout timing. If a fractional engagement converts to full-time, a separate Conversion addendum applies and a one-time conversion fee is invoiced (time-bounded).',
        docs: [sampleDocs.hybrid, sampleDocs.successFee, sampleDocs.equityOnly, sampleDocs.conversion],
      },
    ],
  },
  {
    heading: 'Contracts & payment',
    items: [
      {
        q: 'What contracts will I sign and how do I get paid?',
        a: 'The first time you start an engagement with a new company you will sign a Master Service Agreement between you, the company, and BridgeScale - covering payments, IP, confidentiality, conversion to full-time, and non-circumvention. The MSA is reused for any future engagement with the same company. For each engagement you will also review and sign a Scope of Work covering scope, deliverables, timeline, fees, hours cap, and reporting cadence. Before any signing, you and the company review and confirm a non-binding Pre-SOW Commercial Summary. Payment runs through BridgeScale: the company pays BridgeScale; BridgeScale pays you on the cadence in the SOW (typically the first business day of each month for retainers; 50/50 for sprints). Payouts land where you choose - ACH (US), Wise (cross-border), INR direct via Wise or Razorpay (India), or via an EOR partner where required. Tax forms (W-9 / W-8BEN / GST/PAN / VAT) are collected during onboarding before your first paid engagement. The 10% platform fee is paid by the company on top of your stated rate - it does not come out of your payout.',
        docs: [sampleDocs.msa, sampleDocs.sow, sampleDocs.preSow, sampleDocs.faq],
      },
      {
        q: 'What if I want to do a hybrid, success-fee, or equity-only engagement?',
        a: 'Each non-cash structure is documented as a one-page addendum that attaches to the Scope of Work. Hybrid (cash + equity) and equity-only structures are documented via FAST templates. Success-fee components define the trigger event, the percentage, the cap, and the payout timing. If a fractional engagement converts to full-time, a separate Conversion addendum applies and a one-time conversion fee is invoiced (time-bounded).',
        docs: [sampleDocs.hybrid, sampleDocs.successFee, sampleDocs.equityOnly, sampleDocs.conversion],
      },
    ],
  },
];
