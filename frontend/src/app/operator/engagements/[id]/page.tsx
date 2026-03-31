'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import WorkspaceContent from '@/app/startup/engagements/[id]/page'; // Reuse same View logic 
// Note: We'll just define an Operator wrapper that imports the generic WorkspacePage.
// Wait, Next.js page components need to export default the page itself, we can't easily re-export another page file's default if it's got AuthProviders wrapping it.
// Let's copy it here to avoid layout nesting issues, or expose the pure content. I'll just write it out to ensure no Next.js routing issues.

import { useEffect, useState, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { engagementsApi, Engagement, EngagementMilestone, WorkspaceNote, ActivityLog } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/app/startup/engagements/[id]/page.module.css';

const MILESTONE_STATUS_BADGE: Record<string, string> = { PENDING: 'badge-amber', IN_PROGRESS: 'badge-blue', REVIEW: 'badge-violet', COMPLETED: 'badge-teal' };

function OperatorWorkspaceContent() {
  const pathname = usePathname();
  const engagementId = pathname.split('/').pop() || '';
  const { user } = useAuth();
  
  const isOperator = user?.role === 'OPERATOR';
  
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [milestones, setMilestones] = useState<EngagementMilestone[]>([]);
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New Note State
  const [newNote, setNewNote] = useState('');
  const [postingNote, setPostingNote] = useState(false);

  // New Milestone State (Operator Only)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [creatingMs, setCreatingMs] = useState(false);

  const fetchData = async () => {
    try {
      if (!engagementId) return;
      const [engData, wsData] = await Promise.all([
        engagementsApi.getOne(engagementId),
        engagementsApi.getWorkspace(engagementId)
      ]);
      setEngagement(engData);
      setMilestones(wsData.milestones);
      setNotes(wsData.notes);
      setLogs(wsData.logs);
    } catch {
      setError('Could not load workspace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [engagementId]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setPostingNote(true);
    try {
      await engagementsApi.addNote(engagementId, newNote.trim());
      setNewNote('');
      fetchData();
    } catch {
      alert('Failed to post note.');
    } finally {
      setPostingNote(false);
    }
  }

  async function handleCreateMilestone(e: FormEvent) {
    e.preventDefault();
    setCreatingMs(true);
    try {
      await engagementsApi.createMilestone(engagementId, {
        title: newTitle, description: newDesc, dueDate: newDate
      });
      setShowMilestoneModal(false);
      setNewTitle(''); setNewDesc(''); setNewDate('');
      fetchData();
    } catch {
      alert('Failed to create milestone.');
    } finally {
      setCreatingMs(false);
    }
  }

  async function handleUpdateMilestoneStatus(msId: string, status: string) {
    try {
      await engagementsApi.updateMilestone(msId, { status });
      // Reload to see the ActivityLog update on the right sidebar immediately
      fetchData();
    } catch {
      alert('Failed to update status.');
    }
  }

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading Workspace…</p></div>;
  if (error || !engagement) return <div className={styles.page}><div className={styles.errorBox}><span>⚠</span> {error || 'Workspace not found'}</div></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Client Workspace</div>
          <h1 className={styles.title}>{engagement.contract?.sow.title}</h1>
          <p className={styles.subtitle}>
            Client: {engagement.startup?.companyName} • Status: <span className="badge">{engagement.status}</span>
          </p>
        </div>
        <div className={styles.healthScore}>
          <span className={engagement.healthScore >= 80 ? styles.scoreGreen : engagement.healthScore >= 50 ? styles.scoreAmber : styles.scoreRed}>
            {engagement.healthScore}</span>
          <span className={styles.healthLabel}>Health Score</span>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Milestones & Deliverables</h2>
              {isOperator && (
                <button className="btn btn-primary" onClick={() => setShowMilestoneModal(true)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
                  + Add Milestone
                </button>
              )}
            </div>
            {milestones.length === 0 ? (
              <div className={styles.emptyState}>No milestones defined yet.</div>
            ) : (
              <div className={styles.milestoneList}>
                {milestones.map(ms => (
                  <div key={ms.id} className={styles.milestoneCard}>
                    <div className={styles.msHeader}>
                      <h3 className={styles.msTitle}>{ms.title}</h3>
                      <span className={`badge ${MILESTONE_STATUS_BADGE[ms.status]}`}>{ms.status}</span>
                    </div>
                    <p className={styles.msDesc}>{ms.description}</p>
                    <div className={styles.msFooter}>
                      <span className={styles.msDate}>Due: {new Date(ms.dueDate).toLocaleDateString()}</span>
                      
                      {isOperator && ms.status !== 'COMPLETED' && (
                        <div className={styles.msActions}>
                          <select className={styles.statusSelect} value={ms.status} onChange={(e) => handleUpdateMilestoneStatus(ms.id, e.target.value)}>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Messages & Notes</h2>
            </div>
            <div className={styles.notesContainer}>
              <form onSubmit={handleAddNote} className={styles.noteForm}>
                <textarea 
                  placeholder="Share an update, document link, or comment..." 
                  value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  disabled={postingNote} required rows={3}
                />
                <button type="submit" className="btn btn-primary" disabled={postingNote || !newNote.trim()}>
                  {postingNote ? 'Posting...' : 'Post Message'}
                </button>
              </form>

              <div className={styles.notesList}>
                {notes.map(note => {
                  const isMine = note.authorId === user?.id;
                  return (
                    <div key={note.id} className={`${styles.noteCard} ${isMine ? styles.noteMine : ''}`}>
                      <div className={styles.noteHeader}>
                        <span className={styles.noteAuthor}>{note.author.firstName} {note.author.lastName}</span>
                        <span className={styles.noteTime}>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <div className={styles.noteContent}>{note.content}</div>
                    </div>
                  );
                })}
                {notes.length === 0 && <div className={styles.emptyState} style={{border: 'none'}}>No messages yet.</div>}
              </div>
            </div>
          </section>

        </div>

        <div className={styles.sidebar}>
          <div className={styles.sectionHeader}>
            <h2>Activity Log</h2>
          </div>
          <div className={styles.timeline}>
            {logs.length === 0 ? (
              <p className={styles.emptyText}>No activity recorded yet.</p>
            ) : logs.map(log => (
              <div key={log.id} className={styles.logItem}>
                <div className={styles.logDot}></div>
                <div className={styles.logContent}>
                  <p className={styles.logDesc}>{log.description}</p>
                  <span className={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMilestoneModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Add Milestone</h2>
            <form onSubmit={handleCreateMilestone} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="e.g. Phase 1 Delivery" />
              </div>
              <div className={styles.field}>
                <label>Description & Deliverables</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required rows={4}></textarea>
              </div>
              <div className={styles.field}>
                <label>Target Due Date</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMilestoneModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingMs}>{creatingMs ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OperatorWorkspacePage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <OperatorWorkspaceContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
