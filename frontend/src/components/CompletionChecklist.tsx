'use client';

import Link from 'next/link';
import styles from './CompletionChecklist.module.css';

interface ChecklistItem {
  key: string;
  label: string;
  complete: boolean;
  actionLabel?: string;
  actionHref?: string;
}

interface CompletionChecklistProps {
  items: ChecklistItem[];
  title?: string;
}

export function CompletionChecklist({ items, title = 'Profile completion' }: CompletionChecklistProps) {
  const completedCount = items.filter(i => i.complete).length;
  const totalCount = items.length;

  return (
    <div className={styles.checklist}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.progress}>{completedCount}/{totalCount} complete</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>
      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.key} className={`${styles.item} ${item.complete ? styles.itemComplete : ''}`}>
            <span className={styles.icon}>{item.complete ? '✅' : '⬜'}</span>
            <span className={styles.label}>{item.label}</span>
            {!item.complete && item.actionLabel && item.actionHref && (
              <Link href={item.actionHref} className={styles.action}>
                {item.actionLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
