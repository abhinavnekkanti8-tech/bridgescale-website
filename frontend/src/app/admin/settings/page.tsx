'use client';

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import styles from './page.module.css';

function AdminSettingsContent() {
  const [weights, setWeights] = useState({
    baseScore: 100,
    overdueInvoice: -15,
    overdueMilestone: -20,
    lowComms: -10,
    escalation: -30,
  });

  const [saving, setSaving] = useState(false);
  
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // In a real app this would call an API: adminApi.updateScoringRules(weights)
    setTimeout(() => {
      alert('Scoring rules updated successfully.');
      setSaving(false);
    }, 800);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Platform Settings</h1>
        <p className={styles.subtitle}>Configure AI Health Engine and platform rules.</p>
      </header>

      <div className={styles.layout}>
        {/* Scoring Engine Config */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>AI Health Engine: Scoring Weights</h2>
            <p className={styles.sectionDesc}>
              Adjust how the platform calculates engagement health. Historic records will not be affected. 
              The health score starts at the Base Score and deducts points based on these weights.
            </p>
          </div>
          
          <form className={styles.configForm} onSubmit={handleSave}>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label>Base Starting Score</label>
                <input type="number" max="100" value={weights.baseScore} onChange={e => setWeights({...weights, baseScore: Number(e.target.value)})} />
              </div>
              <div className={styles.field}>
                <label>Overdue Invoice Deduction</label>
                <input type="number" max="0" value={weights.overdueInvoice} onChange={e => setWeights({...weights, overdueInvoice: Number(e.target.value)})} />
              </div>
              <div className={styles.field}>
                <label>Overdue Milestone Deduction</label>
                <input type="number" max="0" value={weights.overdueMilestone} onChange={e => setWeights({...weights, overdueMilestone: Number(e.target.value)})} />
              </div>
              <div className={styles.field}>
                <label>Low Comms / Inactivity Deduction</label>
                <input type="number" max="0" value={weights.lowComms} onChange={e => setWeights({...weights, lowComms: Number(e.target.value)})} />
              </div>
              <div className={styles.field}>
                <label>Active Escalation Deduction</label>
                <input type="number" max="0" value={weights.escalation} onChange={e => setWeights({...weights, escalation: Number(e.target.value)})} />
              </div>
            </div>
            
            <div className={styles.actions}>
              <button type="button" className="btn btn-secondary" onClick={() => setWeights({baseScore:100, overdueInvoice:-15, overdueMilestone:-20, lowComms:-10, escalation:-30})}>
                Reset Defaults
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </section>

        {/* System Toggles */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>System Toggles</h2>
          </div>
          <div className={styles.togglesList}>
            <label className={styles.toggleRow}>
              <div>
                <strong>Auto-Approve Startups</strong>
                <p>New startups bypass Deal Desk manual review.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
            <label className={styles.toggleRow}>
              <div>
                <strong>Strict Operator Vetting</strong>
                <p>Operators require interview notes before activation.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
            <label className={styles.toggleRow}>
              <div>
                <strong>AI Auto-Closeouts</strong>
                <p>Allow system to publish closeouts automatically if Health {'>'} 90.</p>
              </div>
              <input type="checkbox" />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AdminSettingsContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
