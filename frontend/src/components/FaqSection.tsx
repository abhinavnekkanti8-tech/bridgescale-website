'use client';

import { useRef, useState } from 'react';
import styles from './FaqSection.module.css';
import type { FaqItem, FaqGroup } from '@/content/faq';

type Props = {
  label?: string;
  heading?: string;
  groups: FaqGroup[];
};

export default function FaqSection({
  label = 'FAQ',
  heading = 'Frequently asked questions',
  groups,
}: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionLabel}>{label}</div>
        <h2 className={styles.heading}>{heading}</h2>
        {groups.map((group, gi) => (
          <div key={gi} className={styles.group}>
            <h3 className={styles.groupHeading}>{group.heading}</h3>
            <div className={styles.list}>
              {group.items.map((item, i) => (
                <FaqRow key={i} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.question}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span>{item.q}</span>
        <span className={`${styles.icon} ${open ? styles.iconOpen : ''}`} aria-hidden>+</span>
      </button>
      <div
        className={styles.answerWrap}
        style={{ maxHeight: open ? innerRef.current?.scrollHeight ?? 0 : 0 }}
      >
        <div ref={innerRef} className={styles.answer}>
          <p style={{ margin: 0 }}>{item.a}</p>
          {item.docs && item.docs.length > 0 && (
            <div className={styles.docList}>
              <div className={styles.docListLabel}>Sample documents</div>
              <ul className={styles.docListItems}>
                {item.docs.map((d) => (
                  <li key={d.href} className={styles.docListItem}>
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.docLink}
                    >
                      <span className={styles.docIcon} aria-hidden>📄</span>
                      <span>
                        <span className={styles.docLabel}>{d.label}</span>
                        <span className={styles.docMeta}>SAMPLE — finalised version coming soon</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
