'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, ApiError } from '@/lib/api-client';
import styles from './page.module.css';

export default function StartupApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', orgName: '', industry: '', country: 'IN',
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
        role: 'STARTUP_ADMIN',
        orgName: form.orgName,
        country: form.country,
        industry: form.industry,
      });
      setSuccess(true);
      setTimeout(() => router.push('/startup/dashboard'), 1500);
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
          <h2>Welcome aboard!</h2>
          <p>Your startup account has been created. Redirecting to your dashboard...</p>
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
            Register as a <span className="gradient-text">Startup</span>
          </h1>
          <p className={styles.subtitle}>
            Join the Nexus Platform to access vetted Indian Diaspora sales talent across EU, US, AU, and Rest of World. Get AI-powered matching, structured engagements, and governed workspaces.
          </p>
          <div className={styles.benefitsList}>
            <div className={styles.benefit}><span>🎯</span> AI-powered readiness scoring</div>
            <div className={styles.benefit}><span>🌏</span> Access to Indian Diaspora senior sales professionals</div>
            <div className={styles.benefit}><span>📋</span> Structured contracts &amp; milestone tracking</div>
            <div className={styles.benefit}><span>📊</span> Health-scored engagement governance</div>
          </div>
        </div>

        <div className={styles.right}>
          <form onSubmit={handleSubmit} className={styles.form} id="startup-signup-form">
            <div className={styles.field}>
              <label htmlFor="name">Your Full Name</label>
              <input id="name" type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ravi Kumar" disabled={loading} />
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
              <label htmlFor="orgName">Company Name</label>
              <input id="orgName" type="text" required value={form.orgName} onChange={(e) => update('orgName', e.target.value)} placeholder="Acme Technologies Pvt. Ltd." disabled={loading} />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="industry">Industry</label>
                <select id="industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} disabled={loading}>
                  <option value="">Select...</option>
                  <option value="SaaS">SaaS / Software</option>
                  <option value="DeepTech">Deep Tech / AI</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="FinTech">FinTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="AgriTech">AgriTech</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="country">State</label>
                <select id="country" value={form.country} onChange={(e) => update('country', e.target.value)} disabled={loading}>
                  <option value="IN">Andhra Pradesh, India</option>
                  <option value="IN-TS">Telangana, India</option>
                  <option value="IN-KA">Karnataka, India</option>
                  <option value="IN-OTHER">Other Indian State</option>
                </select>
              </div>
            </div>

            {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Startup Account'}
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
