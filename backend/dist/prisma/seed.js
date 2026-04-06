"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = require("crypto");
const prisma = new client_1.PrismaClient();
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@platform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';
    console.log('🌱 Seeding database...');
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
        console.log(`ℹ️  Platform Admin already exists: ${adminEmail}`);
        return;
    }
    const passwordHash = hashPassword(adminPassword);
    const platformOrg = await prisma.organization.create({
        data: {
            orgType: client_1.OrgType.PLATFORM,
            name: 'Nexus Platform Administration',
        },
    });
    const admin = await prisma.user.create({
        data: {
            name: 'Platform Admin',
            email: adminEmail,
            passwordHash,
            status: client_1.UserStatus.ACTIVE,
            memberships: {
                create: {
                    orgId: platformOrg.id,
                    membershipRole: client_1.MembershipRole.PLATFORM_ADMIN,
                    status: client_1.MembershipStatus.ACTIVE,
                },
            },
        },
    });
    const startupOrg = await prisma.organization.create({
        data: {
            orgType: client_1.OrgType.STARTUP,
            name: 'AcmeTech Hyderabad',
            country: 'IN',
            website: 'https://acmetech.example.com',
        },
    });
    await prisma.user.create({
        data: {
            name: 'Ravi Founder',
            email: 'ravi@acmetech.com',
            passwordHash: hashPassword('Startup@123'),
            status: client_1.UserStatus.ACTIVE,
            memberships: {
                create: {
                    orgId: startupOrg.id,
                    membershipRole: client_1.MembershipRole.STARTUP_ADMIN,
                    status: client_1.MembershipStatus.ACTIVE,
                },
            },
        },
    });
    const operatorOrg = await prisma.organization.create({
        data: {
            orgType: client_1.OrgType.OPERATOR_ENTITY,
            name: 'DiasporaSales EU',
            country: 'DE',
        },
    });
    await prisma.user.create({
        data: {
            name: 'Priya Operator',
            email: 'priya@diasporasales.com',
            passwordHash: hashPassword('Operator@123'),
            status: client_1.UserStatus.ACTIVE,
            memberships: {
                create: {
                    orgId: operatorOrg.id,
                    membershipRole: client_1.MembershipRole.OPERATOR,
                    status: client_1.MembershipStatus.ACTIVE,
                },
            },
        },
    });
    console.log(`Admin created: ${admin.email} / ${adminPassword}`);
    console.log(`Demo Startup: ravi@acmetech.com / Startup@123`);
    console.log(`Demo Operator: priya@diasporasales.com / Operator@123`);
    console.log(`Change passwords before production!`);
    await seedSowTemplates();
}
async function seedSowTemplates() {
    const templates = [
        {
            slug: 'pipeline-sprint-v1',
            name: 'Pipeline Sprint',
            templateType: client_1.SowTemplateType.PIPELINE_SPRINT,
            description: '30-day outbound pipeline generation sprint in a target international market.',
            durationDays: 30,
            suggestedFeeMin: 250000,
            suggestedFeeMax: 400000,
            currency: 'USD',
            placeholders: [
                { name: 'company_name', description: 'Legal name of the client company', required: true },
                { name: 'talent_name', description: 'Full name of the fractional talent', required: true },
                { name: 'target_market', description: 'Primary target market (e.g. United Kingdom, Germany)', required: true },
                { name: 'start_date', description: 'Engagement start date (DD Month YYYY)', required: true },
                { name: 'end_date', description: 'Engagement end date (DD Month YYYY)', required: true },
                { name: 'monthly_fee', description: 'Total fee for the sprint in USD', required: true },
                { name: 'meeting_target', description: 'Number of qualified meetings to be booked', required: true },
                { name: 'icp_definition', description: 'Ideal customer profile description', required: true },
                { name: 'weekly_hours', description: 'Hours committed per week', required: true },
            ],
            contentPlainText: `STATEMENT OF WORK — PIPELINE SPRINT
BridgeScale Platform

Parties
Client: {{company_name}}
Talent: {{talent_name}}
Platform: BridgeScale (governed engagement)

1. ENGAGEMENT OVERVIEW
This Statement of Work governs a 30-day Pipeline Sprint engagement in {{target_market}}.
Engagement period: {{start_date}} to {{end_date}}.

The objective of this sprint is to generate a qualified pipeline of prospects in {{target_market}} that match the following Ideal Customer Profile:
{{icp_definition}}

2. SCOPE OF WORK
{{talent_name}} will dedicate {{weekly_hours}} hours per week to the following activities:

a. ICP Refinement
- Review existing ICP documentation and refine based on {{target_market}} market dynamics
- Identify 3–5 high-probability target account segments within the ICP

b. Prospect Research & List Building
- Build a prospect list of minimum 150 qualified accounts
- Enrich with relevant contacts (decision-maker name, title, email, LinkedIn)
- Document rationale for inclusion of each account segment

c. Outbound Outreach
- Design and execute a multi-touch outreach sequence (email + LinkedIn)
- Personalise messaging for {{target_market}} cultural and commercial context
- Manage all outreach via CRM or agreed tracking tool

d. Pipeline Generation
- Target: {{meeting_target}} qualified meetings booked and confirmed with decision-makers
- "Qualified" is defined as: relevant title, in-ICP company, confirmed interest in a 30-minute discovery call

e. Weekly Reporting
- Weekly pipeline status update shared with {{company_name}} every Friday
- Report to include: outreach volume, response rates, meetings booked, pipeline notes

3. DELIVERABLES
By the end of the engagement period, {{talent_name}} will deliver:
- Enriched prospect list (minimum 150 accounts)
- Completed outreach sequences with full send logs
- {{meeting_target}} qualified meetings booked (confirmed calendar invites)
- Final sprint summary report with market observations and recommended next steps

4. FEES & PAYMENT
Total fee for this sprint: {{monthly_fee}} USD
Payment schedule:
- 50% due on signing of this SoW
- 50% due on day 15 of the engagement

All payments are processed through the BridgeScale platform. Late payments will incur a 1.5% monthly charge.

5. PLATFORM GOVERNANCE
This engagement is governed by BridgeScale. All communications, deliverable submissions, and payment transactions occur within the platform. BridgeScale may conduct periodic health checks and escalate issues per its engagement governance policy.

6. NON-CIRCUMVENTION
Both parties agree not to enter into a direct commercial relationship outside of BridgeScale for a period of 12 months from the end of this engagement. Any such arrangement requires written consent from BridgeScale and a buyout fee equivalent to 20% of the annualised engagement value.

7. INTELLECTUAL PROPERTY
All prospect lists, outreach sequences, and deliverables produced during this engagement are the property of {{company_name}}. {{talent_name}} retains no rights to use these materials for other clients.

8. CONFIDENTIALITY
Both parties agree to keep all shared information confidential during and for 24 months after this engagement.

9. TERMINATION
Either party may terminate this engagement with 7 days written notice via the BridgeScale platform. Fees accrued up to the termination date are due and payable.

10. GOVERNING LAW
This Statement of Work is governed by the laws of India. Any disputes will first be referred to BridgeScale mediation before escalation to formal proceedings.

Agreed and signed:

{{company_name}}: _________________________ Date: __________
{{talent_name}}: _________________________ Date: __________
BridgeScale: _________________________ Date: __________`,
        },
        {
            slug: 'bd-sprint-v1',
            name: 'BD & Partnerships Sprint',
            templateType: client_1.SowTemplateType.BD_SPRINT,
            description: '30-day channel and partner identification sprint to activate distribution relationships in a target market.',
            durationDays: 30,
            suggestedFeeMin: 250000,
            suggestedFeeMax: 400000,
            currency: 'USD',
            placeholders: [
                { name: 'company_name', description: 'Legal name of the client company', required: true },
                { name: 'talent_name', description: 'Full name of the fractional talent', required: true },
                { name: 'target_market', description: 'Primary target market', required: true },
                { name: 'start_date', description: 'Engagement start date', required: true },
                { name: 'end_date', description: 'Engagement end date', required: true },
                { name: 'monthly_fee', description: 'Total sprint fee in USD', required: true },
                { name: 'partnership_targets', description: 'Types of partners being targeted (e.g. resellers, system integrators, consultancies)', required: true },
                { name: 'channel_type', description: 'Channel or partnership model (e.g. reseller, referral, co-sell)', required: true },
                { name: 'meeting_target', description: 'Number of partner introductory meetings to be secured', required: true },
                { name: 'weekly_hours', description: 'Hours committed per week', required: true },
            ],
            contentPlainText: `STATEMENT OF WORK — BD & PARTNERSHIPS SPRINT
BridgeScale Platform

Parties
Client: {{company_name}}
Talent: {{talent_name}}
Platform: BridgeScale (governed engagement)

1. ENGAGEMENT OVERVIEW
This Statement of Work governs a 30-day BD & Partnerships Sprint in {{target_market}}.
Engagement period: {{start_date}} to {{end_date}}.

The objective is to identify, qualify, and initiate relationships with {{partnership_targets}} in {{target_market}} who could operate as {{channel_type}} partners for {{company_name}}.

2. SCOPE OF WORK
{{talent_name}} will dedicate {{weekly_hours}} hours per week to the following activities:

a. Partner Landscape Mapping
- Research and document 30–50 potential {{partnership_targets}} in {{target_market}}
- Score each against: strategic fit, reach, capacity, and likelihood to engage
- Present a tiered partner target list (Tier 1: 10 priority, Tier 2: 20 secondary)

b. Outreach & Qualification
- Execute personalised outreach to Tier 1 targets via LinkedIn and email
- Use existing network relationships where available
- Qualify each respondent against agreed partner criteria

c. Introductory Meetings
- Target: {{meeting_target}} introductory meetings with qualified partner prospects
- Prepare briefing notes for {{company_name}} before each meeting
- Attend and lead or co-lead meetings where agreed

d. Partner Documentation
- Draft a standard partner pitch deck and one-pager ({{company_name}} to provide brand assets)
- Create a partner qualification scorecard

e. Weekly Reporting
- Weekly BD status update shared with {{company_name}} every Friday

3. DELIVERABLES
- Partner landscape map (30–50 prospects scored and tiered)
- {{meeting_target}} introductory meetings completed
- Meeting notes and follow-up actions for each partner meeting
- Partner pitch deck and one-pager (draft)
- Final sprint summary with recommended next steps

4. FEES & PAYMENT
Total fee for this sprint: {{monthly_fee}} USD
Payment schedule:
- 50% due on signing
- 50% due on day 15 of the engagement

5. PLATFORM GOVERNANCE
This engagement is governed by BridgeScale. All milestone submissions and payments are managed through the platform.

6. NON-CIRCUMVENTION
Both parties agree not to enter into a direct commercial relationship outside BridgeScale for 12 months from engagement end without prior written consent and buyout fee.

7. CONFIDENTIALITY
All information shared during the engagement is confidential for 24 months post-engagement.

8. TERMINATION
7 days written notice via the BridgeScale platform. Fees accrued to termination date are due.

9. GOVERNING LAW
Laws of India. Disputes first referred to BridgeScale mediation.

Agreed and signed:

{{company_name}}: _________________________ Date: __________
{{talent_name}}: _________________________ Date: __________
BridgeScale: _________________________ Date: __________`,
        },
        {
            slug: 'fractional-retainer-v1',
            name: 'Fractional Sales Leadership Retainer',
            templateType: client_1.SowTemplateType.FRACTIONAL_RETAINER,
            description: '90-day fractional sales leadership engagement — owns and leads international sales motion at 15–20 hrs/week.',
            durationDays: 90,
            suggestedFeeMin: 500000,
            suggestedFeeMax: 1000000,
            currency: 'USD',
            placeholders: [
                { name: 'company_name', description: 'Legal name of the client company', required: true },
                { name: 'talent_name', description: 'Full name of the fractional leader', required: true },
                { name: 'target_market', description: 'Primary target market(s)', required: true },
                { name: 'start_date', description: 'Engagement start date', required: true },
                { name: 'end_date', description: 'Engagement end date (3 months)', required: true },
                { name: 'monthly_fee', description: 'Monthly retainer fee in USD', required: true },
                { name: 'weekly_hours', description: 'Committed hours per week (typically 15–20)', required: true },
                { name: 'kpis', description: 'Key performance indicators for the engagement', required: true },
                { name: 'reporting_cadence', description: 'Agreed reporting cadence (e.g. weekly check-in, monthly review)', required: true },
                { name: 'role_title', description: 'Working title for the fractional leader (e.g. Fractional VP Sales)', required: true },
            ],
            contentPlainText: `STATEMENT OF WORK — FRACTIONAL SALES LEADERSHIP RETAINER
BridgeScale Platform

Parties
Client: {{company_name}}
Talent: {{talent_name}} (acting as {{role_title}})
Platform: BridgeScale (governed engagement)

1. ENGAGEMENT OVERVIEW
This Statement of Work governs a 90-day Fractional Sales Leadership Retainer.
Engagement period: {{start_date}} to {{end_date}}.

{{talent_name}} will serve as {{role_title}} for {{company_name}}, owning and leading the international sales motion across {{target_market}} on a fractional basis of {{weekly_hours}} hours per week.

2. SCOPE OF WORK

a. Sales Strategy & Planning
- Diagnose the current state of {{company_name}}'s commercial capability across {{target_market}}
- Define or refine the international sales strategy, ICP, and messaging
- Build a 90-day sales execution plan with milestones and owner assignments

b. Sales Execution Oversight
- Recruit, onboard, and/or manage any in-market sales resources
- Run outbound and inbound pipeline generation activities within allocated hours
- Lead or co-lead strategic prospect and customer calls

c. Process & Systems
- Audit and improve CRM usage and sales tracking
- Implement a repeatable sales operating cadence (pipeline review, deal review, forecasting)
- Define and track leading and lagging KPIs

d. Reporting & Governance
- {{reporting_cadence}} with {{company_name}} leadership
- Provide monthly pipeline and performance report
- Submit deliverable updates through BridgeScale platform

3. KEY PERFORMANCE INDICATORS
The following KPIs will be tracked and reported monthly:
{{kpis}}

4. FEES & PAYMENT
Monthly retainer: {{monthly_fee}} USD
Invoiced on the 1st of each month. Due within 14 days of invoice.
Total commitment: 3 months. Either party may elect not to renew at 90 days with 14 days notice.

5. RENEWAL
At the 75-day mark, both parties will conduct a renewal review. BridgeScale will facilitate a renewal recommendation based on engagement health data.

6. PLATFORM GOVERNANCE
All milestone check-ins, deliverable submissions, and payments are managed through BridgeScale. BridgeScale conducts monthly health scoring and may intervene on escalations.

7. NON-CIRCUMVENTION
Both parties agree not to enter into a direct commercial relationship outside BridgeScale for 18 months from engagement end without written consent and a buyout fee equivalent to 3 months of the retainer value.

8. INTELLECTUAL PROPERTY
All strategies, frameworks, playbooks, and deliverables produced during this engagement are the property of {{company_name}}.

9. CONFIDENTIALITY
24-month confidentiality obligation on all shared information.

10. TERMINATION
Either party may terminate with 14 days written notice. Fees accrued to termination date are due. No partial-month refunds.

11. GOVERNING LAW
Laws of India. Disputes first referred to BridgeScale mediation.

Agreed and signed:

{{company_name}}: _________________________ Date: __________
{{talent_name}}: _________________________ Date: __________
BridgeScale: _________________________ Date: __________`,
        },
        {
            slug: 'market-entry-consultation-v1',
            name: 'Market Entry Consultation',
            templateType: client_1.SowTemplateType.MARKET_ENTRY,
            description: '14-day ICP validation and go-to-market structure engagement — diagnosis and roadmap, not execution.',
            durationDays: 14,
            suggestedFeeMin: 150000,
            suggestedFeeMax: 250000,
            currency: 'USD',
            placeholders: [
                { name: 'company_name', description: 'Legal name of the client company', required: true },
                { name: 'talent_name', description: 'Full name of the consultant', required: true },
                { name: 'target_market', description: 'Target market for the consultation', required: true },
                { name: 'start_date', description: 'Engagement start date', required: true },
                { name: 'end_date', description: 'Engagement end date (14 days)', required: true },
                { name: 'fee', description: 'Flat fee for the consultation in USD', required: true },
                { name: 'product_category', description: 'Product or service category being evaluated', required: true },
            ],
            contentPlainText: `STATEMENT OF WORK — MARKET ENTRY CONSULTATION
BridgeScale Platform

Parties
Client: {{company_name}}
Consultant: {{talent_name}}
Platform: BridgeScale (governed engagement)

1. ENGAGEMENT OVERVIEW
This Statement of Work governs a 14-day Market Entry Consultation for {{company_name}}'s {{product_category}} in {{target_market}}.
Engagement period: {{start_date}} to {{end_date}}.

This is a diagnosis and roadmap engagement. It does not include active outbound prospecting or execution activities.

2. SCOPE OF WORK

a. Pre-Consultation Research (Days 1–3)
- Review {{company_name}}'s product documentation, existing sales materials, and any available market data
- Research {{target_market}} market landscape for {{product_category}}: key buyers, competitive dynamics, regulatory considerations, typical procurement processes

b. ICP Validation Workshop (Day 4–5)
- 2-hour working session with {{company_name}} leadership
- Validate or redefine the Ideal Customer Profile for {{target_market}}
- Identify 3–5 priority account segments and the decision-maker profile within each

c. Go-To-Market Structure (Days 6–10)
- Define the recommended GTM motion: direct sales, channel-led, partnership-first, or hybrid
- Outline the first 90-day GTM plan with key activities, sequencing, and resource requirements
- Identify 2–3 risk factors and mitigation strategies

d. Delivery & Review (Days 11–14)
- Deliver written Market Entry Report (PDF) covering: ICP findings, GTM structure, 90-day plan, risks, and recommended talent profile
- 1-hour debrief call with {{company_name}} to review findings and answer questions

3. DELIVERABLES
- Market Entry Report (written, PDF format)
- ICP definition document
- 90-day GTM plan outline
- Recommended fractional talent profile (for {{company_name}}'s reference in next steps)

4. FEES & PAYMENT
Flat fee: {{fee}} USD
100% payable on signing of this SoW via BridgeScale platform.

5. PLATFORM GOVERNANCE
Deliverables are submitted through BridgeScale. Payment processed through BridgeScale.

6. NON-CIRCUMVENTION
Direct engagement outside BridgeScale for 12 months post-engagement requires written consent and buyout fee.

7. CONFIDENTIALITY
24-month confidentiality on all shared information.

8. GOVERNING LAW
Laws of India. Disputes first referred to BridgeScale mediation.

Agreed and signed:

{{company_name}}: _________________________ Date: __________
{{talent_name}}: _________________________ Date: __________
BridgeScale: _________________________ Date: __________`,
        },
        {
            slug: 'hybrid-equity-v1',
            name: 'Hybrid (Cash + Equity)',
            templateType: client_1.SowTemplateType.HYBRID_EQUITY,
            description: '6-month fractional BD leadership with a hybrid cash and equity (FAST) compensation structure.',
            durationDays: 180,
            suggestedFeeMin: 200000,
            suggestedFeeMax: 600000,
            currency: 'USD',
            placeholders: [
                { name: 'company_name', description: 'Legal name of the client company', required: true },
                { name: 'talent_name', description: 'Full name of the fractional leader', required: true },
                { name: 'target_market', description: 'Primary target market(s)', required: true },
                { name: 'start_date', description: 'Engagement start date', required: true },
                { name: 'end_date', description: 'Engagement end date (6 months)', required: true },
                { name: 'cash_component', description: 'Monthly cash retainer in USD', required: true },
                { name: 'equity_component', description: 'Equity percentage or FAST value in USD', required: true },
                { name: 'vesting_schedule', description: 'Vesting schedule for equity (e.g. 6-month cliff, monthly vest)', required: true },
                { name: 'weekly_hours', description: 'Committed hours per week', required: true },
                { name: 'kpis', description: 'Revenue/pipeline KPIs that trigger equity milestones', required: true },
                { name: 'role_title', description: 'Working title (e.g. Fractional CRO)', required: true },
            ],
            contentPlainText: `STATEMENT OF WORK — HYBRID ENGAGEMENT (CASH + EQUITY)
BridgeScale Platform

Parties
Client: {{company_name}}
Talent: {{talent_name}} (acting as {{role_title}})
Platform: BridgeScale (governed engagement)

IMPORTANT: This SoW contains an equity component. Both parties acknowledge that equity arrangements carry risk and should be reviewed by independent legal counsel before signing.

1. ENGAGEMENT OVERVIEW
This Statement of Work governs a 6-month Hybrid Fractional Engagement.
Engagement period: {{start_date}} to {{end_date}}.

{{talent_name}} will serve as {{role_title}} for {{company_name}} on a fractional basis of {{weekly_hours}} hours per week, operating across {{target_market}}.

2. COMPENSATION STRUCTURE

a. Cash Component
Monthly cash retainer: {{cash_component}} USD
Invoiced on the 1st of each month. Due within 14 days.

b. Equity Component
Equity allocation: {{equity_component}}
This may be structured as:
- A FAST (Future Equity) agreement pegged to the company's next valuation round, OR
- Direct equity issuance subject to {{company_name}}'s articles of association

Vesting schedule: {{vesting_schedule}}
Equity is subject to acceleration in the event of a company acquisition or IPO within the vesting period.

c. KPI-Linked Equity Milestones
The following revenue and pipeline KPIs, if achieved, will unlock supplementary equity or cash bonuses:
{{kpis}}

3. SCOPE OF WORK
{{talent_name}} will lead {{company_name}}'s commercial expansion into {{target_market}}, including:
- Defining and executing the international GTM strategy
- Building and managing the sales and BD pipeline
- Hiring, onboarding, and managing any in-market resources
- Representing {{company_name}} in strategic partner and customer discussions
- Monthly reporting to {{company_name}} board or founders on commercial progress

4. PLATFORM GOVERNANCE
BridgeScale governs this engagement. All milestone submissions, health monitoring, and cash payments are managed through the platform. Equity documentation is held outside the platform per applicable corporate law.

5. NON-CIRCUMVENTION
Direct engagement outside BridgeScale for 24 months from engagement end requires written consent and a buyout fee of 25% of total cash compensation paid during the engagement.

6. INTELLECTUAL PROPERTY
All strategies, playbooks, and deliverables produced are the property of {{company_name}}.

7. CONFIDENTIALITY
36-month confidentiality obligation on all shared information given the equity relationship.

8. TERMINATION
Either party may terminate with 30 days written notice. Cash fees accrued to termination are due. Vested equity is retained by {{talent_name}}. Unvested equity lapses on termination.

9. DISPUTE RESOLUTION
Disputes first referred to BridgeScale mediation, then to a mutually agreed arbitrator, then to the courts of India.

10. GOVERNING LAW
Laws of India.

Agreed and signed:

{{company_name}}: _________________________ Date: __________
{{talent_name}}: _________________________ Date: __________
BridgeScale: _________________________ Date: __________`,
        },
    ];
    for (const template of templates) {
        const existing = await prisma.sowTemplate.findUnique({ where: { slug: template.slug } });
        if (!existing) {
            await prisma.sowTemplate.create({ data: template });
            console.log(`SoW Template seeded: ${template.name}`);
        }
        else {
            console.log(`SoW Template already exists: ${template.name}`);
        }
    }
    console.log(`5 SoW templates ready.`);
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map