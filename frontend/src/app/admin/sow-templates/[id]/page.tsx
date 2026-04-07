'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type SowTemplate = {
  id: string;
  name: string;
  templateType: string;
  version: number;
  description?: string;
  contentPlainText: string;
  placeholders?: any;
  durationDays?: number;
  suggestedFeeMin?: number;
  suggestedFeeMax?: number;
  currency?: string;
};

export default function EditSowTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<SowTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedPlaceholders, setExtractedPlaceholders] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contentPlainText: '',
    suggestedFeeMin: 0,
    suggestedFeeMax: 0,
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/sow-templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      setTemplate(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        contentPlainText: data.contentPlainText || '',
        suggestedFeeMin: data.suggestedFeeMin || 0,
        suggestedFeeMax: data.suggestedFeeMax || 0,
      });
      extractPlaceholders(data.contentPlainText);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const extractPlaceholders = (text: string) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    const placeholders = Array.from(matches, (m) => m[1]);
    setExtractedPlaceholders([...new Set(placeholders)]);
  };

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, contentPlainText: value });
    extractPlaceholders(value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/v1/admin/sow-templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          contentPlainText: formData.contentPlainText,
          suggestedFeeMin: formData.suggestedFeeMin,
          suggestedFeeMax: formData.suggestedFeeMax,
        }),
      });
      if (!response.ok) throw new Error('Failed to save template');
      await fetchTemplate();
      alert('Template saved successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: 'var(--color-text-muted, #4a4a4a)' }}>Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: '#ff6b6b' }}>Template not found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0a0a0a)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/admin/sow-templates" style={{ color: 'var(--color-accent, #9e7f5a)', textDecoration: 'none' }}>
              ← Back to templates
            </Link>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              margin: '12px 0 0',
              color: 'var(--color-text-primary, #f5f3ef)',
            }}>
              {template.name} (v{template.version})
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted, #4a4a4a)', margin: '8px 0 0' }}>
              Type: <code>{template.templateType}</code>
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              borderRadius: '4px',
              background: saving ? '#666' : 'var(--color-accent, #9e7f5a)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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

        {/* Main content area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', marginBottom: '40px' }}>
          {/* Left pane: Editor */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary, #f5f3ef)',
                marginBottom: '8px',
              }}>
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--color-bg-secondary, #0f1117)',
                  border: '1px solid var(--color-border, #2a2a2a)',
                  borderRadius: '4px',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary, #f5f3ef)',
                marginBottom: '8px',
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '10px',
                  background: 'var(--color-bg-secondary, #0f1117)',
                  border: '1px solid var(--color-border, #2a2a2a)',
                  borderRadius: '4px',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary, #f5f3ef)',
                marginBottom: '8px',
              }}>
                Content (use {`{{placeholder_name}}`} for dynamic content)
              </label>
              <textarea
                value={formData.contentPlainText}
                onChange={(e) => handleContentChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '400px',
                  padding: '12px',
                  background: 'var(--color-bg-secondary, #0f1117)',
                  border: '1px solid var(--color-border, #2a2a2a)',
                  borderRadius: '4px',
                  color: 'var(--color-text-primary, #f5f3ef)',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  lineHeight: '1.5',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #f5f3ef)',
                  marginBottom: '8px',
                }}>
                  Suggested Fee Min (USD)
                </label>
                <input
                  type="number"
                  value={formData.suggestedFeeMin}
                  onChange={(e) => setFormData({ ...formData, suggestedFeeMin: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'var(--color-bg-secondary, #0f1117)',
                    border: '1px solid var(--color-border, #2a2a2a)',
                    borderRadius: '4px',
                    color: 'var(--color-text-primary, #f5f3ef)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #f5f3ef)',
                  marginBottom: '8px',
                }}>
                  Suggested Fee Max (USD)
                </label>
                <input
                  type="number"
                  value={formData.suggestedFeeMax}
                  onChange={(e) => setFormData({ ...formData, suggestedFeeMax: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'var(--color-bg-secondary, #0f1117)',
                    border: '1px solid var(--color-border, #2a2a2a)',
                    borderRadius: '4px',
                    color: 'var(--color-text-primary, #f5f3ef)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right pane: Placeholders */}
          <div style={{
            background: 'var(--color-bg-secondary, #0f1117)',
            border: '1px solid var(--color-border, #2a2a2a)',
            borderRadius: '8px',
            padding: '20px',
            height: 'fit-content',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary, #f5f3ef)',
              margin: '0 0 16px',
            }}>
              Placeholders Found ({extractedPlaceholders.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {extractedPlaceholders.length === 0 ? (
                <p style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted, #4a4a4a)',
                  margin: 0,
                }}>
                  No placeholders detected. Add some with {`{{name}}`}
                </p>
              ) : (
                extractedPlaceholders.map((ph) => (
                  <code
                    key={ph}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--color-bg, #0a0a0a)',
                      border: '1px solid var(--color-border, #2a2a2a)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'var(--color-accent, #9e7f5a)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {`{{${ph}}}`}
                  </code>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
