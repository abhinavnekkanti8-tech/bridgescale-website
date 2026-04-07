'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Match = {
  id: string;
  companyName?: string;
  talentName?: string;
  type: 'COMPANY' | 'TALENT';
  status: string;
  matchScore?: number;
  scheduledAt?: string;
  createdAt: string;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  async function fetchMatches() {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/dashboard/matches?filter=' + filter);
      if (!res.ok) throw new Error('Failed to fetch matches');

      const data = await res.json();
      setMatches(data.matches || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading matches');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 32px',
          color: 'var(--color-text-primary, #f5f3ef)',
        }}>
          Your Matches
        </h1>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['all', 'pending', 'interview_scheduled', 'approved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: filter === status
                  ? 'var(--color-accent, #9e7f5a)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: filter === status ? '#fff' : 'var(--color-text-muted, #4a4a4a)',
              }}
            >
              {status.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ color: 'var(--color-text-muted, #4a4a4a)', textAlign: 'center', padding: '60px 20px' }}>
            Loading matches...
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', padding: '20px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)' }}>
            {error}
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div style={{ color: 'var(--color-text-muted, #4a4a4a)', textAlign: 'center', padding: '60px 20px' }}>
            No matches found in this category.
          </div>
        )}

        {/* Matches grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {matches.map((match) => (
            <div
              key={match.id}
              style={{
                background: 'var(--color-bg-secondary, #0f1117)',
                border: '1px solid var(--color-border, #2a2a2a)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: '0 0 8px',
                  color: 'var(--color-text-primary, #f5f3ef)',
                }}>
                  {match.type === 'COMPANY' ? match.talentName || 'Talent' : match.companyName || 'Company'}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted, #4a4a4a)',
                  margin: 0,
                }}>
                  {match.type === 'COMPANY' ? 'Potential hire' : 'Opportunity'}
                </p>
              </div>

              {match.matchScore && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)' }}>
                      Match Score
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent, #9e7f5a)' }}>
                      {match.matchScore}%
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${match.matchScore}%`,
                      background: 'var(--color-accent, #9e7f5a)',
                    }} />
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text-secondary, #8a8a8a)',
                }}>
                  {match.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)', marginBottom: '16px' }}>
                {new Date(match.createdAt).toLocaleDateString('en-GB')}
              </div>

              <Link
                href={`/dashboard/match/${match.id}`}
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  background: 'var(--color-accent, #9e7f5a)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
