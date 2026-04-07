'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SowTemplate = {
  id: string;
  name: string;
  templateType: string;
  version: number;
  isActive: boolean;
  suggestedFeeMin?: number;
  suggestedFeeMax?: number;
  currency?: string;
  createdAt: string;
};

export default function SowTemplatesPage() {
  const [templates, setTemplates] = useState<SowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/sow-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this template?')) return;
    try {
      const response = await fetch(`/api/v1/admin/sow-templates/${id}/deactivate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to deactivate template');
      await fetchTemplates();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/admin/sow-templates/${id}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to duplicate template');
      await fetchTemplates();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: 'var(--color-text-muted, #4a4a4a)' }}>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              margin: '0 0 8px',
              color: 'var(--color-text-primary, #f5f3ef)',
            }}>
              SoW Templates
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted, #4a4a4a)', margin: 0 }}>
              Manage statement of work templates for engagements
            </p>
          </div>
          <Link href="/admin/sow-templates/new" style={{
            padding: '10px 20px',
            borderRadius: '4px',
            background: 'var(--color-accent, #9e7f5a)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            + New Template
          </Link>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            background: '#3d2020',
            color: '#ff6b6b',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            Error: {error}
          </div>
        )}

        {/* Table */}
        <div style={{
          background: 'var(--color-bg-secondary, #0f1117)',
          border: '1px solid var(--color-border, #2a2a2a)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}>
            <thead>
              <tr style={{
                background: 'var(--color-bg-secondary, #0f1117)',
                borderBottom: '1px solid var(--color-border, #2a2a2a)',
              }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontWeight: 600,
                }}>
                  Name
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontWeight: 600,
                }}>
                  Type
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontWeight: 600,
                }}>
                  Version
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontWeight: 600,
                }}>
                  Fee Range
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontWeight: 600,
                }}>
                  Status
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'right',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontWeight: 600,
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template.id}
                  style={{
                    borderBottom: '1px solid var(--color-border, #2a2a2a)',
                  }}
                >
                  <td style={{
                    padding: '16px',
                    color: 'var(--color-text-primary, #f5f3ef)',
                  }}>
                    {template.name}
                  </td>
                  <td style={{
                    padding: '16px',
                    color: 'var(--color-text-muted, #4a4a4a)',
                  }}>
                    <code style={{ fontSize: '12px' }}>{template.templateType}</code>
                  </td>
                  <td style={{
                    padding: '16px',
                    color: 'var(--color-text-muted, #4a4a4a)',
                  }}>
                    v{template.version}
                  </td>
                  <td style={{
                    padding: '16px',
                    color: 'var(--color-text-muted, #4a4a4a)',
                  }}>
                    ${template.suggestedFeeMin || '—'} – ${template.suggestedFeeMax || '—'} {template.currency}
                  </td>
                  <td style={{
                    padding: '16px',
                    color: template.isActive ? 'var(--color-accent, #9e7f5a)' : '#666',
                  }}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'right',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}>
                    <Link href={`/admin/sow-templates/${template.id}`} style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'var(--color-accent, #9e7f5a)',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: 'transparent',
                        color: 'var(--color-accent, #9e7f5a)',
                        border: '1px solid var(--color-accent, #9e7f5a)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Duplicate
                    </button>
                    {template.isActive && (
                      <button
                        onClick={() => handleDeactivate(template.id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: 'transparent',
                          color: '#666',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {templates.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--color-text-muted, #4a4a4a)',
            }}>
              No templates found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
