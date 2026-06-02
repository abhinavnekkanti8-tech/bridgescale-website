import type { Metadata } from 'next';
import ServicePage, { type ServiceData } from '@/components/ServicePage';

export const metadata: Metadata = {
  title: 'Fractional BD / Partnerships — BridgeScale',
  description:
    'BD leads, partnerships managers, channel specialists, and market-access leads with existing relationships in your target markets.',
};

const data: ServiceData = {
  slug: 'partnerships-bd',
  eyebrow: 'Fractional BD / Partnerships',
  title: 'Open channel, partner, and ecosystem doors.',
  intro: 'Operators with existing relationships in your target markets.',
  about:
    'Operators who build channels, alliances, and partner ecosystems. They bring existing relationships in your target markets to shortcut introductions that direct outbound can\'t reach.',
  roles: [
    {
      name: 'BD Lead',
      desc: 'Opens new partner, reseller, and distributor relationships. Builds the partner motion from zero.',
    },
    {
      name: 'Partnerships Lead',
      desc: 'Builds and runs strategic alliance and ecosystem relationships. Manages cadence with named partners over multi-quarter horizons.',
    },
    {
      name: 'Channel Lead',
      desc: 'Develops reseller and distributor channels with documented partner motion, enablement, and revenue attribution.',
    },
    {
      name: 'Market Access Lead',
      desc: 'Provides local introductions and trust in relationship-led markets where founders cannot easily get in the door.',
    },
  ],
  engagements: [
    {
      name: 'Sprint',
      desc: 'A 30–60 day partner build with a defined output: target partner map, qualified partner conversations booked, first agreement scoped. Cash-only, cash + success fee, or cash + equity (for market entry-aligned engagements).',
    },
    {
      name: 'Operator Retainer',
      desc: 'Ongoing monthly engagement for sustained channel ownership. Success-fee components common where partner-sourced revenue or signed agreements are the trigger.',
    },
  ],
  outcomes: [
    {
      text: 'Build a target partner map by Day 30 and an active outreach campaign by Day 60.',
    },
    {
      text: 'Sign your first reseller, distributor, or strategic alliance agreement in a new geography.',
    },
    {
      text: 'Activate a channel motion from zero — partner enablement, attribution, and review cadence in place.',
    },
    {
      text: 'Close partner-sourced revenue with documented attribution and a clean success-fee trigger.',
    },
  ],
  price:
    'Sprints are USD 5,000–10,000 fixed for a 30-day partner build. Operator Retainers run USD 6,000–10,000 per month for ongoing channel ownership, with success-fee components common.',
};

export default function PartnershipsBdPage() {
  return <ServicePage data={data} />;
}
