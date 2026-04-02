import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingNav } from '@/components/MarketingNav';
import { POSTS, getPost } from '@/content/blog/index';
import styles from './post.module.css';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return { title: `${post.title} — BridgeScale`, description: post.excerpt };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <div className={styles.page}>
      <MarketingNav />

      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/blog" className={styles.back}>← Back to Blog</Link>
          <div className={styles.meta}>
            <time className={styles.date}>{formatDate(post.date)}</time>
            <span className={styles.author}>{post.author}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </div>
      </header>

      <article className={styles.article}>
        <div className={styles.container}>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      <div className={styles.postFooter}>
        <div className={styles.container}>
          <Link href="/blog" className={styles.backBottom}>← All posts</Link>
          <div className={styles.cta}>
            <span>Ready to explore BridgeScale?</span>
            <Link href="/for-companies" className="btn btn-primary">Apply as a company</Link>
            <Link href="/for-talent" className="btn btn-secondary">Join as talent</Link>
          </div>
        </div>
      </div>

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
