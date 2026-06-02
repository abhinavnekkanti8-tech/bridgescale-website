import type { Metadata } from 'next';
import ServicePage, { type ServiceData } from '@/components/ServicePage';

export const metadata: Metadata = {
  title: 'Fractional Execution / Operations — BridgeScale',
  description:
    'Hands-on operators who build pipeline and close deals. AEs, SDR/BDRs, outbound specialists, and RevOps in markets where you have no presence.',
};

const data: ServiceData = {
  slug: 'sales-execution',
  eyebrow: 'Fractional Execution / Operations',
  title: 'Operators who build pipeline and close deals.',
  intro: 'Operators who build pipeline and close deals in markets where you have no presence.',
  about:
    'Hands-on operators who build pipeline and close deals. They run real conversations, qualify accounts, and convert opportunities into revenue — in markets where you don\'t yet have presence.',
  roles: [
    {
      name: 'Account Executive (AE)',
      desc: 'Qualifies, pitches, negotiates, and closes customer opportunities. Best for active demand or qualified-lead conversion.',
    },
    {
      name: 'SDR / BDR',
      desc: 'Finds and qualifies new prospects through outbound research, sequencing, and meeting generation.',
    },
    {
      name: 'Outbound Operator',
      desc: 'Combines account research, sequencing, and live conversations. Senior outbound specialist built for compressed sprints in new markets.',
    },
    {
      name: 'RevOps / Sales Ops',
      desc: 'Cleans the CRM, rebuilds stages and reporting, and installs the cadence that makes the rest of the motion measurable.',
    },
  ],
  engagements: [
    {
      name: 'Sprint',
      desc: 'A 30–60 day time-boxed pipeline build with a defined output: target accounts engaged, qualified meetings booked, ICP feedback documented. Cash-only or cash + success fee.',
    },
    {
      name: 'Operator Retainer',
      desc: 'Ongoing monthly engagement for sustained pipeline ownership. Cash-only or cash + success fee, with success triggers defined before SOW signing.',
    },
  ],
  outcomes: [
    {
      text: 'Build the first 30 qualified meetings in 60 days from a focused outbound motion in a new geography.',
    },
    {
      text: 'Convert active opportunities into signed deals through a focused retainer, with success-fee triggers tied to closed-won revenue.',
    },
    {
      text: 'Validate ICP in a new geography through real conversations — not desk research.',
    },
    {
      text: 'Stand up CRM hygiene, pipeline stages, and forecast reporting the leadership team can read on its own.',
    },
  ],
  price:
    'Sprints are USD 2,500–6,000 fixed for a 30-day engagement. Operator Retainers run USD 3,000–6,000 per month, with cash + success-fee structures common where the trigger event is well-defined.',
};

export default function SalesExecutionPage() {
  return <ServicePage data={data} />;
}
