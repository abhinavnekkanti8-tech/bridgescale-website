export type FaqItem = { q: string; a: string };
export type FaqGroup = { heading: string; items: FaqItem[] };

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
        a: 'Signing up is free. You pay a one-time $100 fee to unlock matching — this covers your AI-powered needs diagnosis, curated talent shortlist, and introduction facilitation. Engagement pricing varies: sprints start at $2,500 for a 30-day project, retainers run $5,000–$10,000/month, and success-fee and hybrid structures are also available. The platform charges a 10% service fee on engagements. No hidden costs.',
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
];
