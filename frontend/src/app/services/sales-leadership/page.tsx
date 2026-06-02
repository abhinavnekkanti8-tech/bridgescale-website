import type { Metadata } from 'next';
import ServicePage, { type ServiceData } from '@/components/ServicePage';

export const metadata: Metadata = {
  title: 'Fractional Leadership — BridgeScale',
  description:
    'Senior fractional leaders who own revenue. VPs, CROs, GTM leaders, and founder-led sales coaches who build the operating cadence and lead the team.',
};

const data: ServiceData = {
  slug: 'sales-leadership',
  eyebrow: 'Fractional Leadership',
  title: 'Senior commercial leadership, on a fractional basis.',
  intro: 'Senior leaders who own revenue, on a fractional commitment.',
  about:
    'Senior fractional leaders who own revenue. They build the operating cadence, set strategy, and operate as part of your leadership group — without the cost or commitment of a full-time CRO.',
  roles: [
    {
      name: 'Fractional VP Sales / VP Revenue / CRO',
      desc: 'Owns the commercial motion end-to-end. Sales process, forecast cadence, team coaching, revenue strategy.',
    },
    {
      name: 'Head of Sales',
      desc: 'Runs pipeline, conversion, and closing for an early commercial team. Stands up the operating rhythm.',
    },
    {
      name: 'GTM Leader',
      desc: 'Builds and sequences the go-to-market plan, motion, and resourcing across geographies and segments.',
    },
    {
      name: 'Founder-Led Sales Coach',
      desc: 'Helps founders move from founder-led to operator-led sales. Codifies what works and hands it off cleanly.',
    },
  ],
  engagements: [
    {
      name: 'Consultation',
      desc: 'A focused session for a specific strategic question — second opinion, diagnosis, or sanity-check before a major hiring decision. Typical 60–90 minute session, scoped per SOW.',
    },
    {
      name: 'Leadership Retainer',
      desc: 'Senior leader embedded in your operating rhythm for a 3-month minimum, typically 6–12 months. Cash, cash + equity (FAST-documented), or hybrid structures available.',
    },
  ],
  outcomes: [
    {
      text: 'Move from founder-led sales to a repeatable, operator-led commercial motion within one quarter (process and CRM hygiene by Day 30; first operator running the motion by Day 60; founder out of day-to-day deals by Day 90).',
    },
    {
      text: 'Establish forecast cadence and pipeline review rhythm the leadership team can run on its own.',
    },
    {
      text: 'Hire and onboard the first one to three commercial team members with a clear ramp plan.',
    },
    {
      text: 'Stand up an international sales motion — from zero to first ARR — in a target geography.',
    },
  ],
  price:
    'Consultations are USD 500–1,500 per session. Leadership Retainers run USD 5,000–15,000 per month depending on scope, with a 3-month minimum and cash + equity structures available for early-stage companies.',
};

export default function SalesLeadershipPage() {
  return <ServicePage data={data} />;
}
