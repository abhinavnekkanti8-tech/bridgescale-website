export const DATA_RETENTION_POLICY = [
  {
    dataType: 'Applications and intake submissions',
    retention: '24 months after final decision or last meaningful activity',
    notes: 'Used for review history, dispute handling, and matching quality analysis.',
  },
  {
    dataType: 'Reference details and verification outputs',
    retention: '12 months after final decision or profile withdrawal',
    notes: 'Removed or anonymized sooner during approved deletion workflows where legally allowed.',
  },
  {
    dataType: 'Audit logs and document actions',
    retention: '36 months from creation',
    notes: 'Retained longer to support accountability, fraud review, and contract disputes.',
  },
  {
    dataType: 'Contracts, invoices, and payment records',
    retention: '7 years from contract end or payment settlement',
    notes: 'Retained to satisfy finance, tax, and dispute obligations.',
  },
  {
    dataType: 'Uploaded CVs and supporting documents',
    retention: '12 months after final decision or profile withdrawal',
    notes: 'Deleted from storage during approved anonymization where no legal hold applies.',
  },
];

export const LIVE_PROCESSOR_REGISTER = [
  {
    category: 'Email delivery',
    provider: 'Resend',
    purpose: 'Transactional account, verification, and status emails',
  },
  {
    category: 'Payments',
    provider: 'Razorpay / Stripe',
    purpose: 'Checkout, payment verification, and financial records',
  },
  {
    category: 'AI processing',
    provider: 'OpenAI',
    purpose: 'AI-assisted diagnosis, matching, summaries, and evaluation support',
  },
  {
    category: 'Hosting and storage',
    provider: 'Platform hosting, database, Redis, and file storage providers',
    purpose: 'Application hosting, session/state storage, and protected document storage',
  },
];
