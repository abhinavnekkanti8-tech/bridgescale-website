'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, ApiError } from '@/lib/api-client';
import styles from './page.module.css';

export default function OperatorApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', orgName: '', country: '', linkedIn: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'OPERATOR',
        orgName: form.orgName,
        country: form.country,
        linkedIn: form.linkedIn,
      });
      setSuccess(true);
      setTimeout(() => router.push('/operator/dashboard'), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string | string[] };
        const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setError(msg || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <span className={styles.successIcon}>✅</span>
          <h2>Welcome to the Network!</h2>
          <p>Your operator account has been created. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
          <h1 className={styles.title}>
            Join as an <span className="gradient-text">Operator</span>
          </h1>
          <p className={styles.subtitle}>
            Are you an Indian Diaspora professional based in EU, US, AU, or Rest of World with sales leadership or business development experience? Join the Nexus Platform as a verified operator and get matched to paid, structured engagements with credible Indian startups.
          </p>
          <div className={styles.benefitsList}>
            <div className={styles.benefit}><span>💼</span> Paid, bounded engagements — no unpaid advisory</div>
            <div className={styles.benefit}><span>🏢</span> Vetted, execution-ready Indian startups only</div>
            <div className={styles.benefit}><span>📋</span> AI-generated Scope of Work with clear deliverables</div>
            <div className={styles.benefit}><span>🛡️</span> Non-circumvention &amp; platform governance protections</div>
            <div className={styles.benefit}><span>⭐</span> Build a verified track record and climb tiers</div>
          </div>
        </div>

        <div className={styles.right}>
          <form onSubmit={handleSubmit} className={styles.form} id="operator-signup-form">
            <div className={styles.field}>
              <label htmlFor="name">Your Full Name</label>
              <input id="name" type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Priya Sharma" disabled={loading} />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.com" disabled={loading} />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 characters" disabled={loading} />
            </div>
            <div className={styles.field}>
              <label htmlFor="orgName">Company / Entity Name</label>
              <input id="orgName" type="text" value={form.orgName} onChange={(e) => update('orgName', e.target.value)} placeholder="DiasporaSales EU GmbH (optional)" disabled={loading} />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="country">Based In</label>
                <select id="country" required value={form.country} onChange={(e) => update('country', e.target.value)} disabled={loading}>
                  <option value="">Select region...</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="NL">Netherlands</option>
                  <option value="AU">Australia</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">UAE</option>
                  <option value="CA">Canada</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="linkedIn">LinkedIn URL</label>
                <input id="linkedIn" type="url" value={form.linkedIn} onChange={(e) => update('linkedIn', e.target.value)} placeholder="https://linkedin.com/in/..." disabled={loading} />
              </div>
            </div>

            {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Join as Operator'}
            </button>

            <p className={styles.loginLink}>
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
