'use client';

/**
 * QueueShell
 *
 * Shared chrome for admin/deal-desk queue pages. Each page passes a title,
 * the data, the column definitions, and an optional status filter spec.
 * Empty/loading/error states are handled here so the per-queue page only
 * has to declare its columns.
 */

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './QueueShell.module.css';

export interface QueueColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

export interface FilterOption {
  label: string;
  value: string | undefined;
}

interface Props<T> {
  title: string;
  subtitle?: string;
  columns: QueueColumn<T>[];
  load: (status?: string) => Promise<T[]>;
  filters?: FilterOption[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export default function QueueShell<T>({
  title,
  subtitle,
  columns,
  load,
  filters,
  rowKey,
  emptyMessage = 'No rows match this filter.',
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [status, setStatus] = useState<string | undefined>(filters?.[0]?.value);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function fetchRows(s?: string) {
    setLoading(true);
    setErr('');
    try {
      const data = await load(s);
      setRows(data);
    } catch {
      setErr('Could not load this queue. Try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchRows(status); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin/dashboard" className={styles.backLink}>← Admin dashboard</Link>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <button className="btn btn-secondary" onClick={() => fetchRows(status)} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {filters && filters.length > 0 && (
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={String(f.value ?? '__all__')}
              className={`${styles.filterBtn} ${status === f.value ? styles.filterBtnActive : ''}`}
              onClick={() => setStatus(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {err && <div className={styles.err}>{err}</div>}

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>{emptyMessage}</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((c) => <td key={c.key}>{c.render(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footnote}>
        Showing the {rows.length} most recent rows{status ? ` with status ${status}` : ''}. Capped at 200.
      </div>
    </div>
  );
}
