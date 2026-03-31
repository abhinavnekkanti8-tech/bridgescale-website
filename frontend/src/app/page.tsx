'use client';

import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './page.module.css';

/* ── SVG icon helper ── */
const Check = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
    <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function HomePage() {
  const [signupSide, setSignupSide] = useState<'company' | 'talent'>('company');
  const [submitted, setSubmitted] = useState(false);
  const [howItWorksTab, setHowItWorksTab] = useState<'company' | 'talent'>('company');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Talent-specific state
  const [references, setReferences] = useState([
    { name: '', company: '', relationship: '', email: '', phone: '' },
    { name: '', company: '', relationship: '', email: '', phone: '' },
    { name: '', company: '', relationship: '', email: '', phone: '' },
  ]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvDragOver, setCvDragOver] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  async function handleSignupSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();

    if (!name || !email) {
      setSubmitError('Please fill in your name and email to continue.');
      return;
    }

    // Build the payload matching the backend DTO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      type: signupSide === 'company' ? 'COMPANY' : 'TALENT',
      name,
      email,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement)?.value?.trim() || undefined,
    };

    if (signupSide === 'company') {
      payload.companyName = (form.elements.namedItem('company_name') as HTMLInputElement)?.value?.trim() || undefined;
      payload.companyStage = (form.elements.namedItem('stage') as HTMLSelectElement)?.value || undefined;
      payload.needArea = (form.elements.namedItem('need_area') as HTMLSelectElement)?.value || undefined;
      payload.targetMarkets = (form.elements.namedItem('target_markets') as HTMLInputElement)?.value?.trim() || undefined;
      payload.engagementModel = (form.elements.namedItem('engagement_model') as HTMLSelectElement)?.value || undefined;
      payload.budgetRange = (form.elements.namedItem('budget_range') as HTMLSelectElement)?.value || undefined;
      payload.urgency = (form.elements.namedItem('urgency') as HTMLSelectElement)?.value || undefined;
    } else {
      payload.location = (form.elements.namedItem('location') as HTMLInputElement)?.value?.trim() || undefined;
      payload.talentCategory = (form.elements.namedItem('talent_category') as HTMLSelectElement)?.value || undefined;
      payload.seniority = (form.elements.namedItem('seniority') as HTMLSelectElement)?.value || undefined;
      payload.engagementPref = (form.elements.namedItem('engagement_pref') as HTMLSelectElement)?.value || undefined;
      payload.markets = (form.elements.namedItem('markets') as HTMLInputElement)?.value?.trim() || undefined;
      payload.linkedInUrl = (form.elements.namedItem('linkedin_url') as HTMLInputElement)?.value?.trim() || undefined;
      // Structured references — only include filled-out ones
      const filledRefs = references.filter((r) => r.name.trim() && r.email.trim() && r.relationship.trim());
      if (filledRefs.length > 0) payload.references = filledRefs;
    }

    // Remove undefined values
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined && v !== '')
    );

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors from NestJS
        const message = Array.isArray(data.message) ? data.message.join('. ') : data.message;
        throw new Error(message || 'Something went wrong. Please try again.');
      }

      setApplicationId(data.applicationId);

      // If Stripe checkout URL is returned, redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Upload CV if present (separate request after application is created)
      if (cvFile && data.applicationId) {
        try {
          const formData = new FormData();
          formData.append('cv', cvFile);
          await fetch(`${API_URL}/applications/${data.applicationId}/upload-cv`, {
            method: 'POST',
            body: formData,
          });
        } catch {
          // Non-blocking — application is already saved
          console.warn('CV upload failed, but application was submitted successfully.');
        }
      }

      // Dummy mode or auto-submitted — show success
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ══════ NAV ══════ */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={`${styles.logoMark} gradient-text`}>◆</span>
            <span className={styles.logoText}>Bridge<span className="gradient-text">Sales</span></span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How it works</a>
            <Link href="/for-companies" className={styles.navLink}>For companies</Link>
            <Link href="/for-talent" className={styles.navLink}>For talent</Link>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <ThemeToggle />
            <a href="#signup" className={styles.navCta}>Request early access</a>
          </div>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Now accepting early applications
          </div>
          <h1 className={styles.heroTitle}>
            Fractional diaspora senior talent.{' '}
            <span className="gradient-text">Real commercial results</span>{' '}
            for India&apos;s builders.
          </h1>
          <p className={styles.heroSub}>
            BridgeSales connects Indian startups and MSMEs with vetted diaspora sales leaders, executors, and BD operators — for fractional, scoped, compensated international growth engagements. Not advisory. Not full-time. Fractional work that moves the needle.
          </p>
          <div className={styles.heroQualifier}>
            <strong>Built exclusively for:</strong>&nbsp;Indian startups &amp; MSMEs — senior talent access without a full-time international hire
          </div>
          <div className={styles.heroActions}>
            <a href="#signup" className="btn btn-primary" onClick={() => setSignupSide('company')}>Apply as a company →</a>
            <a href="#signup" className="btn btn-secondary" onClick={() => setSignupSide('talent')}>Join as fractional talent</a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>Fractional</div>
              <div className={styles.heroStatLabel}>Senior operator access without<br />full-time commitment or risk</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>3</div>
              <div className={styles.heroStatLabel}>Talent categories: Sales Leadership,<br />Execution, Partnerships / BD</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>7</div>
              <div className={styles.heroStatLabel}>Engagement structures — consultation<br />to equity-linked fractional leadership</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ MARQUEE ══════ */}
      <div className={styles.marqueeStrip} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {['Fractional VP Sales', 'Channel & Reseller Development', 'International Market Entry', 'Outbound Pipeline Generation', 'Fractional CRO', 'Founder-Led Sales Transition', 'GTM Strategy & Refinement', 'ICP & Messaging Clarity', 'Revenue Operating Cadence', 'Alliance & Partnership Development'].map((item) => (
                <span className={styles.marqueeItem} key={`${i}-${item}`}>
                  <span className={styles.marqueeDot} />
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════ PROBLEM ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>The gap we&apos;re closing</div>
          <h2 className={styles.sectionHeading}>Two groups who need each other. No good structure to connect.</h2>
          <p className={styles.sectionSub}>Indian startups and MSMEs want to break into international markets. Diaspora senior talent have the networks and market fluency. The friction between them is structural — not personal.</p>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemCardLabel}>Indian startups &amp; MSMEs</div>
              <h3 className={styles.problemCardTitle}>Serious about going global. Not set up to hire for it full-time.</h3>
              <ul className={styles.problemList}>
                {[
                  "Don't know exactly what commercial capability gap they have",
                  "Can't afford — or justify — a full-time senior international hire",
                  'No trusted access to operators who\'ve already navigated their target markets',
                  'Need scoped execution, not another informal advisory relationship',
                  'Want flexibility — cash, retainer, success-based, or hybrid fractional structures',
                ].map((item) => (
                  <li key={item} className={styles.problemItem}>
                    <span className={styles.problemDash}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemCardLabel}>Indian diaspora senior talent</div>
              <h3 className={styles.problemCardTitle}>Ready to contribute back home. Only on professional terms.</h3>
              <ul className={styles.problemList}>
                {[
                  'Advisory and mentorship on diaspora networks go uncompensated — senior talent disengage fast',
                  'Want structured, scoped, paid fractional engagements — not informal calls that lead nowhere',
                  'Prefer part-time or project-based formats compatible with their existing full-time role',
                  'Want equity upside through properly documented hybrid or FAST structures — not a vague promise',
                  'Need cross-border contracting, payments, and EOR handled so they can focus on delivery',
                ].map((item) => (
                  <li key={item} className={styles.problemItem}>
                    <span className={styles.problemDash}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ OUTCOMES ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Why go fractional through BridgeSales</div>
          <h2 className={styles.sectionHeading}>The advantages aren&apos;t just about cost. They&apos;re structural.</h2>
          <p className={styles.sectionSub}>Fractional hiring through a managed platform removes risks that a job board, a LinkedIn search, or a warm introduction simply can&apos;t address.</p>
          <div className={styles.outcomesGrid}>
            {[
              { title: 'De-risk your international growth hire', desc: 'A bad full-time senior hire can cost 18 months and ₹2–3Cr once you factor severance, opportunity cost, and customer trust lost. A fractional engagement lets you validate fit, market readiness, and operator quality before any long-term commitment.', proof: '→ Prove value in a sprint before committing to a retainer' },
              { title: 'Unlock markets through existing relationships', desc: 'Diaspora senior talent aren\'t starting cold. They have enterprise buyers, channel partners, and distributor contacts in your target markets — built over years.', proof: '→ First qualified meetings in weeks, not 6–9 months' },
              { title: 'Eliminate cultural misalignment', desc: 'Diaspora senior talent understand both sides. They know how Indian SaaS companies think and how a US enterprise procurement team operates.', proof: '→ Cultural fluency on both sides no job board can replicate' },
              { title: 'Speed to market — not months of ramping', desc: 'Full-time senior hires take 4–6 months to recruit and another 3–6 to ramp. Fractional talent matched by BridgeSales are active in your target market within weeks.', proof: '→ First commercial activity in weeks, not a quarter' },
              { title: 'Start small. Scale what works.', desc: 'Begin with a consultation or sprint to validate assumptions. If the operator and market prove out, expand to a retainer or structured fractional leadership role.', proof: '→ Modular structures with clear expansion or exit at every stage' },
              { title: 'Senior talent you couldn\'t otherwise access', desc: 'A VP Sales with a $2M US pipeline won\'t join a Series A Indian startup full-time. Fractional is the only structure that makes this possible — and BridgeSales makes it operational.', proof: '→ Access the top 5% of diaspora senior talent available no other way' },
            ].map((card) => (
              <div key={card.title} className={styles.outcomeCard}>
                <div className={styles.outcomeIcon}>
                  <svg viewBox="0 0 18 18" width="18" height="18" fill="none"><path d="M9 2L11.5 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H6.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                </div>
                <div className={styles.outcomeTitle}>{card.title}</div>
                <div className={styles.outcomeDesc}>{card.desc}</div>
                <div className={styles.outcomeProof}>{card.proof}</div>
              </div>
            ))}

            <div className={styles.outcomeDivider}>
              <div className={styles.sectionLabel} style={{ marginBottom: 0 }}>Also — for senior talent</div>
            </div>

            {[
              { title: 'De-risk your investment of time', desc: 'Every diaspora professional who\'s done unpaid advisory knows the outcome: two calls, a vague follow-up, and nothing built. BridgeSales turns that into structured, scoped, compensated engagement.', proof: '→ Compensated from day one' },
              { title: 'Contribute without a career disruption', desc: 'You don\'t have to leave your current role, relocate, or commit to a full-time pivot. Fractional engagements are designed to fit alongside what you\'re already doing — 10 to 20 hours a week.', proof: '→ Engage on your terms — not a full-time pivot' },
              { title: 'Build equity upside that\'s actually documented', desc: 'BridgeSales uses FAST-standard templates for hybrid and equity-linked structures — so if the company wins, you do too, on terms a lawyer can actually explain.', proof: '→ FAST-compliant equity documentation from day one' },
            ].map((card) => (
              <div key={card.title} className={styles.outcomeCard}>
                <div className={styles.outcomeIcon}>
                  <svg viewBox="0 0 18 18" width="18" height="18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3" /><path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                </div>
                <div className={styles.outcomeTitle}>{card.title}</div>
                <div className={styles.outcomeDesc}>{card.desc}</div>
                <div className={styles.outcomeProof}>{card.proof}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS (TABBED) ══════ */}
      <section id="how-it-works" className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>How it works</div>
          <h2 className={styles.sectionHeading}>From first conversation to first milestone.</h2>
          <p className={styles.sectionSub}>BridgeSales is a managed platform — not a directory you browse alone. Select your perspective below.</p>
          <div className={styles.hiwTabs}>
            <button className={`${styles.hiwTab} ${howItWorksTab === 'company' ? styles.hiwTabActive : ''}`} onClick={() => setHowItWorksTab('company')} type="button">For Companies</button>
            <button className={`${styles.hiwTab} ${howItWorksTab === 'talent' ? styles.hiwTabActive : ''}`} onClick={() => setHowItWorksTab('talent')} type="button">For Talent</button>
          </div>
          <div className={styles.processSteps}>
            {(howItWorksTab === 'company'
              ? [
                  { n: '01', title: 'Define what you need', desc: 'Tell us where expert guidance could move the needle — growth, market entry, sales pipeline, channel development, or a diagnosis session first.', tag: 'AI-assisted intake' },
                  { n: '02', title: 'Get matched with vetted talent', desc: 'AI generates a ranked shortlist with explainable rationale — domain fit, geography, pricing alignment. Every match is reviewed by platform operators.', tag: 'Explainable matching' },
                  { n: '03', title: 'Book a free consultation', desc: 'Meet your top choices with a free 30-minute intro call. No obligation. If it\'s not the right fit, come back anytime.', tag: 'Zero risk' },
                  { n: '04', title: 'Engage with confidence', desc: 'Customised SoW with clear deliverables and milestones. We handle contracting, cross-border payments, and compliance so you focus on growth.', tag: 'Managed delivery' },
                ]
              : [
                  { n: '01', title: 'Apply & get vetted', desc: 'Submit your profile. Complete our structured vetting — verified references, domain review, and pitch assessment. Only qualified talent is accepted.', tag: 'Selective entry' },
                  { n: '02', title: 'Get matched to opportunities', desc: 'AI matches you to relevant companies based on your expertise, market knowledge, and engagement preferences. No cold outreach needed.', tag: 'AI-matched' },
                  { n: '03', title: 'Engage on your terms', desc: 'Choose your structure — advisory, sprint, retainer, or hybrid. Set your availability and pricing. Work alongside your existing full-time role.', tag: 'Flexible structures' },
                  { n: '04', title: 'Deliver & grow', desc: 'Milestone-tracked engagements with platform support. Build your reputation, expand your fractional portfolio, and earn reliably.', tag: 'Career growth' },
                ]
            ).map((step) => (
              <div key={step.n} className={styles.processStep}>
                <div className={styles.stepIndex}>{step.n}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
                <span className={styles.stepTag}>{step.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ VETTING PROCESS ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Our vetting standard</div>
          <h2 className={styles.sectionHeading}>Every professional on BridgeSales is rigorously vetted.</h2>
          <p className={styles.sectionSub}>We receive hundreds of applicants. Only those who pass every stage of our process are accepted into the network.</p>
          <div className={styles.vettingPipeline}>
            <div className={styles.vettingStep}>
              <div className={styles.vettingStepNum}>01</div>
              <div className={styles.vettingStepIcon}>📋</div>
              <div className={styles.vettingStepTitle}>Verified references</div>
              <div className={styles.vettingStepDesc}>Every applicant provides references from past clients and employers — including senior leaders and at least two direct reports. All references are contacted and verified.</div>
            </div>
            <div className={styles.vettingConnector} aria-hidden="true" />
            <div className={styles.vettingStep}>
              <div className={styles.vettingStepNum}>02</div>
              <div className={styles.vettingStepIcon}>🎥</div>
              <div className={styles.vettingStepTitle}>Expert interview</div>
              <div className={styles.vettingStepDesc}>A live video interview with a domain expert assesses communication skills, depth of experience, subject matter expertise, and professionalism.</div>
            </div>
            <div className={styles.vettingConnector} aria-hidden="true" />
            <div className={styles.vettingStep}>
              <div className={styles.vettingStepNum}>03</div>
              <div className={styles.vettingStepIcon}>🎯</div>
              <div className={styles.vettingStepTitle}>Domain-specific assessment</div>
              <div className={styles.vettingStepDesc}>For sales roles: a proprietary case study with a 60-90 second pitch video, peer-reviewed. For leadership roles: a turnaround narrative with cross-functional metrics.</div>
            </div>
          </div>
          <div className={styles.vettingFooter}>
            Only applicants who pass all stages are accepted. We&apos;re selective because our companies need to trust every professional they engage.
          </div>
        </div>
      </section>

      {/* ══════ TWO SIDES ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Two sides. One platform.</div>
          <h2 className={styles.sectionHeading}>Built for both parties to succeed.</h2>
          <div className={styles.sidesGrid}>
            {/* Company card */}
            <div className={styles.sideCard} id="for-companies">
              <div className={styles.sideCardHeader}>
                <div className={styles.sideCardTag}>For companies</div>
                <div className={styles.sideCardTitle}>Indian startups &amp; MSMEs going global</div>
                <div className={styles.sideCardSub}>With international ambitions, some commercial traction in India, and the appetite to grow — but without the budget for a full-time international senior hire.</div>
                <div className={styles.sideBadge}>Fractional-first — full-time conversions possible</div>
              </div>
              <div className={styles.sideCardBody}>
                {[
                  'Vetted fractional talent — no full-time commitment, no outsized hiring risk',
                  'Mandatory diagnosis before any recommendation — we identify your actual gap first',
                  'Flexible models: consultation, sprint, retainer, success-fee, hybrid, equity-linked',
                  'Customised SoW — clear deliverables, milestones, and fractional time allocation',
                  'Platform monitors engagement health — intervenes before problems become failures',
                ].map((point) => (
                  <div key={point} className={styles.sidePoint}>
                    <div className={styles.sidePointIcon}><Check /></div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className={styles.sideCardFooter}>
                <a href="#signup" className={`btn btn-primary ${styles.btnFull}`} onClick={() => setSignupSide('company')}>Apply as a company →</a>
              </div>
            </div>
            {/* Talent card */}
            <div className={styles.sideCard} id="for-talent">
              <div className={styles.sideCardHeader}>
                <div className={styles.sideCardTag}>For talent</div>
                <div className={styles.sideCardTitle}>Indian diaspora commercial operators, globally</div>
                <div className={styles.sideCardSub}>Sales leaders, BD operators, and partnership professionals who&apos;ve built pipelines, entered markets, and closed enterprise deals — contributing fractionally.</div>
                <div className={styles.sideBadge}>Fractional-first — full-time conversion possible</div>
              </div>
              <div className={styles.sideCardBody}>
                {[
                  'Structured, compensated fractional engagements — not informal advisory or pro-bono calls',
                  'Part-time or project-based — designed to work alongside your existing full-time role',
                  'Platform handles contracting, cross-border payments, EOR support, and all engagement admin',
                  'Optional upside: hybrid cash + equity or equity-linked fractional leadership via FAST templates',
                  'Build a track record and reputation — fractional demand on the platform compounds over time',
                ].map((point) => (
                  <div key={point} className={styles.sidePoint}>
                    <div className={styles.sidePointIcon}><Check /></div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className={styles.sideCardFooter}>
                <a href="#signup" className={`btn btn-secondary ${styles.btnFull}`} onClick={() => setSignupSide('talent')}>Join as fractional talent →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORIES ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Fractional talent categories</div>
          <h2 className={styles.sectionHeading}>Three categories. One focus: international commercial growth.</h2>
          <p className={styles.sectionSub}>Every fractional talent category maps directly to a scoped international growth outcome for Indian startups and MSMEs.</p>
          <div className={styles.categoriesGrid}>
            {[
              { n: '01', name: 'Fractional sales leadership', desc: 'Senior revenue talent who define and lead your international sales motion fractionally — strategy through execution.', pills: ['Fractional VP Sales', 'Fractional CRO', 'Head of Sales', 'Revenue leaders'] },
              { n: '02', name: 'Fractional sales execution', desc: 'Hands-on fractional pipeline generators who prospect, qualify, and advance deals in your target international markets.', pills: ['Fractional SDR / BDR', 'Account Executive', 'Outbound operators', 'Pipeline generation'] },
              { n: '03', name: 'Fractional partnerships & BD', desc: 'Talent who build channels, develop reseller and distributor networks, and open markets through partnerships — on a fractional basis.', pills: ['Channel development', 'Reseller / distributor', 'Alliances', 'Market entry'] },
            ].map((cat) => (
              <div key={cat.n} className={styles.catBlock}>
                <div className={styles.catNum}>{cat.n}</div>
                <div className={styles.catName}>{cat.name}</div>
                <div className={styles.catDesc}>{cat.desc}</div>
                <div className={styles.catExamples}>
                  {cat.pills.map((p) => <span key={p} className={styles.catPill}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.crossCapStrip}>
            <div className={styles.sectionLabel} style={{ marginBottom: 10 }}>Cross-capability areas</div>
            <div className={styles.crossCapPills}>
              {['GTM strategy & refinement', 'ICP & messaging clarity', 'Commercial systems improvement', 'Revenue operating cadence', 'Founder-led sales transition', 'AI in sales workflow', 'International market entry'].map((c) => (
                <span key={c} className={styles.catPill}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ ENGAGEMENT MODELS ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Fractional engagement structures</div>
          <h2 className={styles.sectionHeading}>Structured to fit your business reality.</h2>
          <p className={styles.sectionSub}>Every engagement is designed from approved structures, then customised to what you actually need. No rigid packages. No improvised arrangements.</p>
          <div className={styles.modelsRow}>
            {[
              { name: 'Consultation', desc: 'One-time or short-series sessions. Diagnosis, strategy clarity, or a second opinion before committing.' },
              { name: 'Sprint', desc: 'Time-boxed, high-intensity fractional execution. A defined output in a defined window.' },
              { name: 'Solution', desc: 'Project-based with clear deliverables and milestones. Deeper than a sprint; scoped to a specific problem.' },
              { name: 'Retainer', desc: 'Ongoing fractional engagement. Regular cadence, sustained execution, and strategic continuity.' },
            ].map((m) => (
              <div key={m.name} className={styles.modelCard}>
                <div className={styles.modelName}>{m.name}</div>
                <div className={styles.modelDesc}>{m.desc}</div>
              </div>
            ))}
          </div>
          <div className={styles.modelsRow}>
            {[
              { name: 'Success-fee', desc: 'Compensation tied to commercial outcomes — deals closed, partnerships activated, revenue generated.' },
              { name: 'Hybrid cash + equity', desc: 'For talent willing to take some risk alongside a company. Documented, structured, and platform-approved.', badge: 'FAST template supported' },
              { name: 'Equity-linked leadership', desc: 'Senior fractional roles with a longer arc and meaningful stake — for operators at the revenue leadership level.', badge: 'FAST template supported' },
              { name: 'Platform-approved only', desc: 'All fractional structures are vetted and operationalised by BridgeSales. No side arrangements.', highlight: true },
            ].map((m) => (
              <div key={m.name} className={`${styles.modelCard} ${m.highlight ? styles.modelHighlight : ''}`}>
                <div className={styles.modelName} style={m.highlight ? { color: 'var(--color-accent-amber)' } : undefined}>{m.name}</div>
                <div className={styles.modelDesc} style={m.highlight ? { opacity: 0.8 } : undefined}>{m.desc}</div>
                {m.badge && <div className={styles.modelBadge}>{m.badge}</div>}
              </div>
            ))}
          </div>
          <div className={styles.infraStrip}>
            <div className={styles.infraLabel}>Platform<br />infrastructure</div>
            <div className={styles.infraDivider} />
            <div className={styles.infraRight}>
              <div className={styles.infraItems}>
                {['International EOR support', 'FAST equity templates', 'Cross-border payment ops', 'Milestone-linked billing'].map((item) => (
                  <div key={item} className={styles.infraItem}>
                    <div className={styles.infraItemDot} />
                    {item}
                  </div>
                ))}
              </div>
              <div className={styles.infraNote}>
                For engagements involving equity or international employment records, BridgeSales supports International Employer of Record (EOR) structures and FAST equity documentation — so neither side needs to improvise the legal or administrative mechanics.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SATISFACTION GUARANTEE ══════ */}
      <section className={styles.guaranteeSection}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.guaranteeBadge}>
            <div className={styles.guaranteeIcon}>🛡️</div>
            <div className={styles.guaranteeContent}>
              <div className={styles.guaranteeTitle}>Not the right fit? We rematch at no cost.</div>
              <div className={styles.guaranteeDesc}>If a match doesn&apos;t work out, we&apos;ll connect you with a new professional from our network — no additional fees. We vet and stand by every professional on BridgeSales.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ AI SECTION ══════ */}
      <section className={`${styles.section} ${styles.aiSection}`}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>AI-native platform</div>
          <h2 className={styles.sectionHeading}>AI does the heavy lifting. Humans make the calls.</h2>
          <p className={styles.sectionSub}>AI is embedded throughout the matching workflow — not bolted on as a chatbot. But every decision that matters stays with people.</p>
          <div className={styles.aiGrid}>
            <div className={styles.aiPoints}>
              {[
                { n: '01', title: 'Need diagnosis', desc: 'Interprets your intake to infer your real fractional commercial gap — including gaps you didn\'t describe directly.' },
                { n: '02', title: 'Fractional talent matching', desc: 'Ranked shortlists with explainable rationale: why each talent fits, where the risks are. Not a black-box sort.' },
                { n: '03', title: 'Scope drafting', desc: 'First-draft SoWs generated from discovery inputs and templates — refined by operators and reviewed by both parties.' },
                { n: '04', title: 'Engagement health monitoring', desc: 'Continuous signal detection across active engagements. Late updates and weak activity surface early.' },
                { n: '05', title: 'Operator decision support', desc: 'Platform staff get AI-generated summaries and risk flags so they can manage more engagements without less care.' },
              ].map((p) => (
                <div key={p.n} className={styles.aiPoint}>
                  <div className={styles.aiPointNum}>{p.n}</div>
                  <div>
                    <div className={styles.aiPointTitle}>{p.title}</div>
                    <div className={styles.aiPointDesc}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={styles.aiPrinciple}>
                <div className={styles.aiPrincipleHeading}>
                  AI assists.<br /><span className="gradient-text">Humans govern.</span>
                </div>
                <div className={styles.aiPrincipleDesc}>
                  Every AI recommendation is reviewable, editable, and overridable. Shortlists are reviewed by platform operators before companies see them. SoW drafts require human approval. Talent vetting is always human-led. AI reduces cognitive load — it doesn&apos;t replace judgment.
                </div>
              </div>
              <div className={styles.aiBoundary}>
                <div className={styles.aiBoundaryLabel}>AI will never</div>
                <ul className={styles.aiBoundaryList}>
                  {[
                    'Autonomously approve talent into the fractional network',
                    'Finalise commercial terms or fractional pricing without review',
                    'Sign off on a scope of work independently',
                    'Trigger payments or contracts automatically',
                    'Hide uncertainty when input data is weak or missing',
                  ].map((item) => (
                    <li key={item} className={styles.aiBoundaryItem}>
                      <span className={styles.aiBoundaryX}>✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="pricing" className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>What it costs to get started</div>
          <h2 className={styles.sectionHeading}>Simple entry. No hidden fees.</h2>
          <p className={styles.sectionSub}>A one-time fee for each side — a quality filter and a commitment signal, not a paywall.</p>
          <div className={styles.pricingGrid}>
            <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
              <div className={styles.pricingHeader}>
                <div className={styles.pricingFor}>For Indian startups &amp; MSMEs</div>
                <div className={styles.pricingDollar}>$200</div>
                <div className={styles.pricingTitle}>One-time company activation fee</div>
              </div>
              <div className={styles.pricingBody}>
                {[
                  'Full structured intake and mandatory discovery session',
                  'AI-assisted fractional need diagnosis and opportunity brief',
                  'Shortlist of vetted fractional talent, reviewed by platform staff',
                  'First-draft customised SoW generated and refined with you',
                  'Contracting and cross-border payment infrastructure setup',
                  'Engagement monitoring throughout active fractional delivery',
                ].map((item) => (
                  <div key={item} className={styles.pricingItem}>
                    <span className={styles.pricingCheck}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className={styles.pricingNote}>
                <strong>Why $200?</strong> It signals serious intent — and covers the real cost of diagnosis, operator review time, and shortlist curation.
              </div>
              <div className={styles.pricingFooter}>
                <a href="#signup" className={`btn btn-primary ${styles.btnFull}`} onClick={() => setSignupSide('company')}>Apply as a company →</a>
              </div>
            </div>
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <div className={styles.pricingFor}>For diaspora talent professionals</div>
                <div className={styles.pricingDollar}>$50</div>
                <div className={styles.pricingTitle}>One-time talent network joining fee</div>
              </div>
              <div className={styles.pricingBody}>
                {[
                  'Full profile review and structured fractional vetting process',
                  'Category placement and AI-assisted skill profiling',
                  'Access to curated, reviewed fractional opportunities',
                  'Platform-handled contracting and cross-border payment ops',
                  'EOR support and FAST template access for equity-linked structures',
                  'Reputation and matching score that builds with every engagement',
                ].map((item) => (
                  <div key={item} className={styles.pricingItem}>
                    <span className={styles.pricingCheck}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className={styles.pricingNote}>
                <strong>Why $50?</strong> It keeps the network selective. Talent who invest in joining are serious — which means opportunities are real.
              </div>
              <div className={styles.pricingFooter}>
                <a href="#signup" className={`btn btn-secondary ${styles.btnFull}`} onClick={() => setSignupSide('talent')}>Apply to join the network →</a>
              </div>
            </div>
          </div>
          <div className={styles.pricingDisclaimer}>
            One-time fees are collected at the application stage to cover review costs. Platform fees on active engagements are separately agreed at scoping. All fees in USD.
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section id="faq" className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Frequently asked questions</div>
          <h2 className={styles.sectionHeading}>Everything you need to know.</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqColumn}>
              <div className={styles.faqColumnLabel}>For Companies</div>
              {[
                { q: 'What\u0027s the difference between an advisor, consultant, and fractional executive?', a: 'Advisors guide you with strategy — part-time, informal, non-operational. Consultants solve defined problems (audit a funnel, build a model) and deliver specific outputs. Fractional executives own outcomes — they operate as part of your leadership team, manage people, and build strategy, typically 1–3 days per week.' },
                { q: 'How does the matching process work?', a: 'Share your needs through our structured intake. AI generates instant matches based on domain, market, and ACV fit. You then book free 30-minute consultations with as many matches as you like. Average time to first introduction is under 48 hours.' },
                { q: 'What if the match isn\u0027t right?', a: 'We offer a satisfaction guarantee. If a match doesn\u0027t work out, we\u0027ll rematch you with someone new from our network at no additional cost. We vet and stand by our talent.' },
                { q: 'How does payment work?', a: 'For cash engagements, BridgeSales handles all invoicing and compliance. You receive an invoice based on the terms in your Scope of Work. Payments are collected via standard methods. You pay BridgeSales, we pay the talent — and handle all contractor compliance.' },
                { q: 'Can I hire the fractional person full-time?', a: 'Yes. BridgeSales is fractional-first, but if both sides want to transition to full-time after a proven engagement, the platform supports that conversion.' },
              ].map((item, i) => (
                <div key={i} className={styles.faqItem}>
                  <button className={`${styles.faqQuestion} ${openFaq === i ? styles.faqOpen : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)} type="button">
                    <span>{item.q}</span>
                    <span className={styles.faqChevron}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <div className={styles.faqAnswer}>{item.a}</div>}
                </div>
              ))}
            </div>
            <div className={styles.faqColumn}>
              <div className={styles.faqColumnLabel}>For Talent</div>
              {[
                { q: 'What\u0027s the vetting process like?', a: 'Three stages: (1) Verified references from past clients/employers, including senior leaders and direct reports. (2) Live video interview with a domain expert. (3) For sales roles, a case study pitch reviewed by peers; for leadership, a turnaround narrative with metrics. Only applicants who pass all stages are accepted.' },
                { q: 'What engagement types are available?', a: 'Consultation (one-time sessions), Sprint (time-boxed projects), Solution (deliverable-based), Retainer (ongoing fractional), Success-fee, Hybrid cash + equity, and Equity-linked leadership. You choose what fits your availability.' },
                { q: 'How does compensation work?', a: 'Compensation depends on the engagement structure you choose. Retainer and sprint engagements have fixed monthly or project fees. Success-fee structures tie compensation to commercial outcomes. Hybrid models combine cash and equity. All terms are documented in a Scope of Work before engagement begins.' },
                { q: 'Can I work with multiple companies?', a: 'Absolutely. You can take on as many engagements as you can manage. BridgeSales is designed for fractional work — most talent professionals maintain 2–3 active engagements alongside their full-time role.' },
                { q: 'What\u0027s the time commitment?', a: 'It depends on the engagement type. Consultations are one-off sessions. Sprints and solutions are project-scoped. Retainers typically require 15–20 hours per week. You set your availability and BridgeSales matches accordingly.' },
              ].map((item, i) => (
                <div key={i + 5} className={styles.faqItem}>
                  <button className={`${styles.faqQuestion} ${openFaq === (i + 5) ? styles.faqOpen : ''}`} onClick={() => setOpenFaq(openFaq === (i + 5) ? null : (i + 5))} type="button">
                    <span>{item.q}</span>
                    <span className={styles.faqChevron}>{openFaq === (i + 5) ? '−' : '+'}</span>
                  </button>
                  {openFaq === (i + 5) && <div className={styles.faqAnswer}>{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ PRINCIPLES ══════ */}
      <section className={styles.section}>
        <div className={`${styles.container} fade-in`}>
          <div className={styles.sectionLabel}>Platform principles</div>
          <h2 className={styles.sectionHeading}>What we stand for. What we won&apos;t compromise.</h2>
          <div className={styles.principlesGrid}>
            {[
              { n: 'I', title: 'Fractional-first. Full-time conversion possible.', desc: 'BridgeSales leads with fractional engagements. If a company and talent both want to go full-time after a proven engagement, the platform supports that transition.' },
              { n: 'II', title: 'Startups & MSMEs only', desc: 'Built for Indian startups and MSMEs — not large enterprises or MNCs. If you\'re a growth-stage company serious about international revenue, this is for you.' },
              { n: 'III', title: 'Curated, not open', desc: 'Not a directory. Every company and talent member is reviewed. Applications are assessed. Not everyone is accepted. The quality of the network is the product.' },
              { n: 'IV', title: 'Diagnosis before matching', desc: 'We don\'t shortlist talent until we understand what you actually need. Discovery is mandatory — not optional. Skipping it produces the wrong match.' },
              { n: 'V', title: 'Execution is the product', desc: 'Matching is the start, not the end. We track milestones, monitor engagement health, and intervene when needed.' },
              { n: 'VI', title: 'Rewarded engagement, not unpaid mentorship', desc: 'Every engagement is scoped, every contribution is paid, and the platform handles the mechanics so value flows both ways.' },
            ].map((p) => (
              <div key={p.n} className={styles.principleBlock}>
                <div className={styles.principleNum}>{p.n}</div>
                <div className={styles.principleTitle}>{p.title}</div>
                <div className={styles.principleDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ SIGNUP ══════ */}
      <section id="signup" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.signupInner}>
            <div className={styles.sectionLabel}>Early access</div>
            <h2 className={styles.sectionHeading}>Request your spot.</h2>
            <p className={`${styles.sectionSub} ${styles.sectionSubCenter}`}>
              We&apos;re reviewing early applications from both sides. Tell us who you are — we&apos;ll follow up directly within 3–5 business days.
            </p>

            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggleBtn} ${signupSide === 'company' ? styles.toggleBtnActive : ''}`}
                onClick={() => setSignupSide('company')}
                type="button"
              >
                I&apos;m a startup / MSME looking for fractional talent
              </button>
              <button
                className={`${styles.toggleBtn} ${signupSide === 'talent' ? styles.toggleBtnActive : ''}`}
                onClick={() => setSignupSide('talent')}
                type="button"
              >
                I&apos;m a commercial talent professional
              </button>
            </div>

            {!submitted ? (
              <form className={styles.signupForm} onSubmit={handleSignupSubmit} noValidate>
                <div className={styles.formSectionDivider}>Contact details</div>
                <div className={`${styles.formRow}`}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Full name <span className={styles.fieldRequired}>*</span></label>
                    <input type="text" name="name" placeholder="Your full name" required className={styles.formInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Work email <span className={styles.fieldRequired}>*</span></label>
                    <input type="email" name="email" placeholder="you@company.com" required className={styles.formInput} />
                  </div>
                </div>

                {signupSide === 'company' && (
                  <div className={styles.companyFields}>
                    <div className={styles.formSectionDivider}>About your company</div>
                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Company name <span className={styles.fieldRequired}>*</span></label>
                        <input type="text" name="company_name" placeholder="Your company" className={styles.formInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Company type &amp; stage <span className={styles.fieldRequired}>*</span></label>
                        <select name="stage" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select type</option>
                          <option>Startup — pre-revenue / early product</option>
                          <option>Startup — early revenue (₹0–₹4Cr ARR)</option>
                          <option>Startup — growing (₹4Cr–₹40Cr ARR)</option>
                          <option>Startup — scaling (₹40Cr+ ARR)</option>
                          <option>MSME — established business seeking international growth</option>
                        </select>
                      </div>
                    </div>
                    <div className={`${styles.formRow} ${styles.formRowSingle}`}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>What fractional commercial help are you looking for? <span className={styles.fieldRequired}>*</span></label>
                        <select name="need_area" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select primary need</option>
                          <option>Fractional sales leadership (VP Sales, CRO-type)</option>
                          <option>Fractional sales execution (outbound, pipeline, SDR/BDR)</option>
                          <option>Fractional partnerships &amp; channel development</option>
                          <option>International market entry strategy</option>
                          <option>Not sure — I need a diagnosis session first</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Target international market(s)</label>
                        <input type="text" name="target_markets" placeholder="e.g. US, UK, Southeast Asia, Middle East" className={styles.formInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Preferred engagement structure</label>
                        <select name="engagement_model" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select preference</option>
                          <option>Consultation / short advisory session</option>
                          <option>Sprint (time-boxed fractional project)</option>
                          <option>Retainer (ongoing fractional)</option>
                          <option>Success-fee based</option>
                          <option>Hybrid cash + equity</option>
                          <option>Not sure yet</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Monthly budget range</label>
                        <select name="budget_range" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select budget range</option>
                          <option>Under $2K / month</option>
                          <option>$2K – $5K / month</option>
                          <option>$5K – $10K / month</option>
                          <option>Above $10K / month</option>
                          <option>Not sure yet</option>
                        </select>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>How urgent is this?</label>
                        <select name="urgency" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select urgency</option>
                          <option>Exploring — no rush</option>
                          <option>Planning — next 1–2 months</option>
                          <option>Ready to start within 1 month</option>
                          <option>Urgent — need talent ASAP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {signupSide === 'talent' && (
                  <div className={styles.talentFields}>
                    <div className={styles.formSectionDivider}>About your background</div>
                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Current location / country <span className={styles.fieldRequired}>*</span></label>
                        <input type="text" name="location" placeholder="e.g. London, Singapore, New York, Dubai" className={styles.formInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Primary fractional category <span className={styles.fieldRequired}>*</span></label>
                        <select name="talent_category" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select category</option>
                          <option>Fractional sales leadership (VP Sales, CRO, Head of Sales)</option>
                          <option>Fractional sales execution (SDR, BDR, AE, outbound)</option>
                          <option>Fractional partnerships &amp; BD (channel, alliances, market entry)</option>
                          <option>Spans multiple categories</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Seniority level</label>
                        <select name="seniority" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select level</option>
                          <option>IC / Specialist (5–10 years)</option>
                          <option>Senior IC / Lead (10–15 years)</option>
                          <option>Director / Head of</option>
                          <option>VP / C-Suite</option>
                        </select>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Engagement preference</label>
                        <select name="engagement_pref" className={styles.formSelect} defaultValue="">
                          <option value="" disabled>Select preference</option>
                          <option>Consultation / advisory</option>
                          <option>Sprint or short fractional project</option>
                          <option>Fractional retainer (ongoing)</option>
                          <option>Success-fee or hybrid structures</option>
                          <option>Open to multiple</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Markets where you have active commercial networks</label>
                        <input type="text" name="markets" placeholder="e.g. US Enterprise SaaS, UK channel partners, SEA distribution" className={styles.formInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>LinkedIn profile URL</label>
                        <input type="url" name="linkedin_url" placeholder="https://linkedin.com/in/your-profile" className={styles.formInput} />
                      </div>
                    </div>

                    {/* ── CV / Resume Upload ── */}
                    <div className={styles.formSectionDivider}>CV / Resume</div>
                    <div
                      className={`${styles.cvDropzone} ${cvDragOver ? styles.cvDropzoneActive : ''} ${cvFile ? styles.cvDropzoneHasFile : ''}`}
                      onDragOver={(e: DragEvent) => { e.preventDefault(); setCvDragOver(true); }}
                      onDragLeave={() => setCvDragOver(false)}
                      onDrop={(e: DragEvent) => {
                        e.preventDefault();
                        setCvDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) setCvFile(file);
                      }}
                      onClick={() => cvInputRef.current?.click()}
                    >
                      <input
                        ref={cvInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) setCvFile(file);
                        }}
                      />
                      {cvFile ? (
                        <div className={styles.cvFileInfo}>
                          <span className={styles.cvFileIcon}>📄</span>
                          <span className={styles.cvFileName}>{cvFile.name}</span>
                          <button
                            type="button"
                            className={styles.cvRemove}
                            onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                          >✕</button>
                        </div>
                      ) : (
                        <div className={styles.cvPlaceholder}>
                          <span className={styles.cvUploadIcon}>⬆</span>
                          <span>Drag &amp; drop your CV here, or <strong>click to browse</strong></span>
                          <span className={styles.cvHint}>PDF, DOC, DOCX — max 5MB</span>
                        </div>
                      )}
                    </div>

                    {/* ── Professional References ── */}
                    <div className={styles.formSectionDivider}>Professional references <span className={styles.fieldRequired}>*</span></div>
                    <div className={styles.refsNote}>Provide at least 2 professional references. Include a senior leader and a direct report where possible.</div>
                    {references.map((ref, idx) => (
                      <div key={idx} className={styles.refBlock}>
                        <div className={styles.refBlockHeader}>Reference {idx + 1}{idx < 2 && <span className={styles.fieldRequired}> *</span>}</div>
                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Full name</label>
                            <input type="text" value={ref.name} onChange={(e) => { const r = [...references]; r[idx] = { ...r[idx], name: e.target.value }; setReferences(r); }} placeholder="Reference full name" className={styles.formInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Company / organization</label>
                            <input type="text" value={ref.company} onChange={(e) => { const r = [...references]; r[idx] = { ...r[idx], company: e.target.value }; setReferences(r); }} placeholder="Where they work" className={styles.formInput} />
                          </div>
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Relationship</label>
                            <select value={ref.relationship} onChange={(e) => { const r = [...references]; r[idx] = { ...r[idx], relationship: e.target.value }; setReferences(r); }} className={styles.formSelect}>
                              <option value="">Select relationship</option>
                              <option>CEO / Founder</option>
                              <option>Direct Manager / VP</option>
                              <option>Peer / Colleague</option>
                              <option>Direct Report</option>
                              <option>Client / Customer</option>
                              <option>Business Partner</option>
                            </select>
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Email</label>
                            <input type="email" value={ref.email} onChange={(e) => { const r = [...references]; r[idx] = { ...r[idx], email: e.target.value }; setReferences(r); }} placeholder="reference@company.com" className={styles.formInput} />
                          </div>
                        </div>
                        <div className={`${styles.formRow} ${styles.formRowSingle}`}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Phone (optional)</label>
                            <input type="tel" value={ref.phone} onChange={(e) => { const r = [...references]; r[idx] = { ...r[idx], phone: e.target.value }; setReferences(r); }} placeholder="+1 555 123 4567" className={styles.formInput} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`${styles.formRow} ${styles.formRowSingle}`}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Anything specific you&apos;d like us to know?</label>
                    <textarea name="notes" rows={3} placeholder="Context, urgency, specific situations, or questions — share what's relevant." className={styles.formTextarea} />
                  </div>
                </div>

                {submitError && (
                  <div className={styles.formError}>{submitError}</div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting
                    ? 'Submitting…'
                    : signupSide === 'company'
                      ? 'Submit company application →'
                      : 'Submit talent application →'
                  }
                </button>
                <div className={styles.formDisclaimer}>
                  Applications are reviewed — not auto-approved. The $200 (companies) or $50 (talent) fee is collected at application to cover the cost of reviewing your submission. We&apos;ll follow up within 3–5 business days.
                </div>
              </form>
            ) : (
              <div className={styles.successState}>
                <div className={styles.successIcon}>✓</div>
                <div className={styles.successTitle}>Application received.</div>
                <div className={styles.successDesc}>
                  We review every application personally. You&apos;ll hear from us within 3–5 business days. Your application fee ($200 for companies, $50 for talent) covers the review process.
                </div>
                {applicationId && (
                  <div className={styles.applicationRef}>
                    Reference: <code>{applicationId}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>
              <span className="gradient-text">◆</span> Bridge<span className="gradient-text">Sales</span>
            </Link>
            <div className={styles.footerNote}>
              Fractional-first diaspora talent for India&apos;s startups &amp; MSMEs. Structured. Compensated. Built for outcomes.
            </div>
            <div className={styles.footerLinks}>
              <a href="#how-it-works" className={styles.footerLink}>How it works</a>
              <Link href="/for-companies" className={styles.footerLink}>For companies</Link>
              <Link href="/for-talent" className={styles.footerLink}>For talent</Link>
              <a href="#pricing" className={styles.footerLink}>Pricing</a>
              <a href="#faq" className={styles.footerLink}>FAQ</a>
              <a href="#signup" className={styles.footerLink}>Apply</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
