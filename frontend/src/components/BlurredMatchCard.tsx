'use client';

import styles from './BlurredMatchCard.module.css';

interface BlurredMatchCardProps {
  matchScore: number;
  region: string;
  lane: string;
  yearsExperience: number;
  locked: boolean;
}

export function BlurredMatchCard({ matchScore, region, lane, yearsExperience, locked }: BlurredMatchCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.scoreRow}>
        <span className={styles.scoreLabel}>Match</span>
        <span className={styles.scoreValue}>{matchScore}/100</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.tag}>{region}</span>
        <span className={styles.tag}>{lane.replace(/_/g, ' ').toLowerCase()}</span>
      </div>
      <div className={styles.experience}>{yearsExperience}+ years experience</div>
      {locked ? (
        <div className={styles.lockedOverlay}>
          <div className={styles.blurredName}>████████ ██████</div>
          <div className={styles.blurredCompany}>████████████</div>
          <div className={styles.lockIcon}>🔒</div>
        </div>
      ) : (
        <div className={styles.unlockedBadge}>Unlocked</div>
      )}
    </div>
  );
}
