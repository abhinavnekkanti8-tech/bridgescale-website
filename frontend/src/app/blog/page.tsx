import Link from 'next/link';
import { MarketingNav } from '@/components/MarketingNav';
import { POSTS } from '@/content/blog/index';
import styles from './blog.module.css';

export const metadata = {
  title: 'Blog — BridgeScale',
  description: 'Perspectives on fractional commercial talent, diaspora networks, and international market entry for Indian startups.',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function BlogPage() {
  return (
    <div className={styles.page}>
      <MarketingNav />

      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>BridgeScale Blog</div>
          <h1 className={styles.heroTitle}>Perspectives on fractional talent, diaspora networks, and global commercial execution.</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {POSTS.map((post, i) => (
            <article key={post.slug} className={`${styles.postRow} ${i === 0 ? styles.postRowFeatured : ''}`}>
              <div className={styles.postMeta}>
                <time className={styles.postDate}>{formatDate(post.date)}</time>
                <span className={styles.postAuthor}>{post.author}</span>
              </div>
              <div className={styles.postBody}>
                <Link href={`/blog/${post.slug}`} className={styles.postTitle}>{post.title}</Link>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className={styles.readMore}>Read →</Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>BridgeScale</Link>
            <div className={styles.footerNote}>Fractional diaspora senior talent for India&apos;s startups &amp; MSMEs.</div>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/for-companies" className={styles.footerLink}>For Companies</Link>
              <Link href="/for-talent" className={styles.footerLink}>For Talent</Link>
              <Link href="/about" className={styles.footerLink}>About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
