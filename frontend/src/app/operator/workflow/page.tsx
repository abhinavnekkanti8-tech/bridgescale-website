'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type WorkflowStats = {
  totalApplications: number;
  pendingReview: number;
  diagnosisGenerated: number;
  interviewsScheduled: number;
  approved: number;
};

const defaultStats: WorkflowStats = {
  totalApplications: 0,
  pendingReview: 0,
  diagnosisGenerated: 0,
  interviewsScheduled: 0,
  approved: 0,
};

export default function WorkflowDashboard() {
  const [stats, setStats] = useState<WorkflowStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    // In a real implementation, would fetch from API
    setStats(defaultStats);
  }, []);

  const workflows = [
    {
      name: 'Diagnoses',
      count: stats.diagnosisGenerated,
      href: '/operator/diagnoses',
      icon: '📋',
      description: 'Review & approve AI diagnoses',
    },
    {
      name: 'Pre-Screens',
      count: 0,
      href: '/operator/pre-screens',
      icon: '👤',
      description: 'Talent evaluation',
    },
    {
      name: 'Matches',
      count: 0,
      href: '/operator/matches',
      icon: '🤝',
      description: 'Company-talent pairings',
    },
    {
      name: 'Interviews',
      count: stats.interviewsScheduled,
      href: '/operator/interviews',
      icon: '📅',
      description: 'Schedule & track interviews',
    },
  ];

  const quickActions = [
    { label: 'Review Applications', href: '/operator/applications' },
    { label: 'View All Diagnoses', href: '/operator/diagnoses' },
    { label: 'Manage Interviews', href: '/operator/interviews' },
    { label: 'Create SoW', href: '/operator/sow' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            margin: '0 0 8px',
            color: 'var(--color-text-primary, #f5f3ef)',
          }}>
            Workflow Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted, #4a4a4a)', margin: 0 }}>
            Application workflow management and pipeline tracking
          </p>
        </div>

        {/* Key Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {[
            { label: 'Applications', value: stats.totalApplications },
            { label: 'Pending', value: stats.pendingReview },
            { label: 'Diagnoses', value: stats.diagnosisGenerated },
            { label: 'Interviews', value: stats.interviewsScheduled },
            { label: 'Approved', value: stats.approved },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--color-bg-secondary, #0f1117)',
                border: '1px solid var(--color-border, #2a2a2a)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-accent, #9e7f5a)',
                marginBottom: '6px',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #4a4a4a)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Pipeline */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: '0 0 16px',
            color: 'var(--color-text-primary, #f5f3ef)',
          }}>
            Workflow Pipeline
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {workflows.map((workflow) => (
              <Link
                key={workflow.name}
                href={workflow.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--color-bg-secondary, #0f1117)',
                  border: '1px solid var(--color-border, #2a2a2a)',
                  borderRadius: '8px',
                  padding: '16px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                  {workflow.icon}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #f5f3ef)',
                  marginBottom: '4px',
                }}>
                  {workflow.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted, #4a4a4a)',
                  marginBottom: '8px',
                  minHeight: '32px',
                }}>
                  {workflow.description}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-accent, #9e7f5a)',
                  marginTop: 'auto',
                }}>
                  {workflow.count}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: '0 0 16px',
            color: 'var(--color-text-primary, #f5f3ef)',
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  background: 'var(--color-accent, #9e7f5a)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                {action.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Workflow Steps */}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: '0 0 16px',
            color: 'var(--color-text-primary, #f5f3ef)',
          }}>
            Workflow Process
          </h2>
          <div style={{
            background: 'var(--color-bg-secondary, #0f1117)',
            border: '1px solid var(--color-border, #2a2a2a)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {[
              { step: '1', title: 'Application', desc: 'Receive & review applications' },
              { step: '2', title: 'Diagnosis', desc: 'AI analysis & human review' },
              { step: '3', title: 'Pre-Screen', desc: 'Evaluate & score candidates' },
              { step: '4', title: 'Matching', desc: 'Pair companies with talent' },
              { step: '5', title: 'Interview', desc: 'Schedule & conduct interviews' },
              { step: '6', title: 'Approval', desc: 'Create engagement & SoW' },
            ].map((item, idx) => (
              <div
                key={item.step}
                style={{
                  padding: '16px 20px',
                  borderBottom: idx < 5 ? '1px solid var(--color-border, #2a2a2a)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--color-accent, #9e7f5a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary, #f5f3ef)',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted, #4a4a4a)',
                  }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
