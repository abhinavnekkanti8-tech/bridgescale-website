'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { discoveryApi, ApiError } from '@/lib/api-client';
import styles from './page.module.css';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

function ScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId') || '';

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date || !time || !profileId) { setError('All fields required.'); return; }
    setSubmitting(true); setError('');
    try {
      const call = await discoveryApi.schedule({
        startupProfileId: profileId,
        scheduledAt: `${date}T${time}:00.000Z`,
        durationMinutes: parseInt(duration),
      });
      router.push(`/startup/discovery/summary?callId=${call.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const b = err.body as { message?: string | string[] };
        setError(Array.isArray(b?.message) ? b.message[0] : (b?.message ?? 'Scheduling failed'));
      } else {
        setError('Unexpected error.');
      }
    } finally { setSubmitting(false); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schedule Discovery Call</h1>
        <p className={styles.subtitle}>Book a 30-minute call to discuss your go-to-market needs and get matched.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} id="schedule-discovery-form">
        <div className={styles.field}>
          <label className={styles.label}>Select Date *</label>
          <input id="discovery-date" type="date" min={new Date().toISOString().split('T')[0]} value={date}
            onChange={(e) => setDate(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Select Time Slot * (UTC)</label>
          <div className={styles.slotGrid}>
            {TIME_SLOTS.map((slot) => (
              <button key={slot} type="button"
                className={`${styles.slot} ${time === slot ? styles.slotActive : ''}`}
                onClick={() => setTime(slot)} id={`slot-${slot.replace(':', '')}`}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Duration</label>
          <select id="discovery-duration" value={duration} onChange={(e) => setDuration(e.target.value)} className={styles.input}>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        {error && <div className={styles.errorBox}><span>⚠</span> {error}</div>}

        <div className={styles.nav}>
          <button type="submit" className="btn btn-primary" disabled={!date || !time || submitting} id="confirm-schedule-btn">
            {submitting ? 'Scheduling…' : 'Confirm & Schedule →'}
          </button>
        </div>
      </form>

      <div className={styles.infoCard}>
        <h3>What to expect</h3>
        <ul>
          <li>📞 A meeting link will be generated automatically</li>
          <li>📝 After the call, notes are captured and summarized by AI</li>
          <li>📦 You'll receive an AI-recommended service package</li>
        </ul>
      </div>
    </div>
  );
}

export default function ScheduleDiscoveryPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <ScheduleContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
