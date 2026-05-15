import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const isOverdue = (due, status) => due && status !== 'done' && new Date(due) < new Date();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_COLORS = { low: 'low', medium: 'medium', high: 'high', urgent: 'urgent' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const stats = data?.stats || {};
  const myTasks = data?.myTasks || [];
  const recentProjects = data?.recentProjects || [];
  const overdueCount = myTasks.filter(t => isOverdue(t.due_date, t.status)).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Hey, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's what's happening in your workspace</p>
        </div>
        <Link to="/projects" className="btn btn-primary">+ New Project</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--accent-color': 'var(--accent)' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.my_total || 0}</div>
          <div className="stat-label">Assigned Tasks</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--info)' }}>
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats.my_in_progress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--success)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.my_done || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--danger)' }}>
          <div className="stat-icon">⏰</div>
          <div className="stat-value" style={{ color: overdueCount > 0 ? 'var(--danger)' : 'inherit' }}>
            {stats.my_overdue || 0}
          </div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* My Tasks */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>My Tasks</h2>
          {myTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-title">All clear!</div>
              <div className="empty-desc">No tasks assigned to you yet.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.slice(0, 10).map(t => (
                    <tr key={t.id}>
                      <td style={{ maxWidth: 260 }}>
                        <Link to={`/projects/${t.project_id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.title}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/projects/${t.project_id}`} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {t.project_name}
                        </Link>
                      </td>
                      <td><span className={`badge badge-${t.status}`}>{STATUS_LABELS[t.status]}</span></td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td>
                        <span className={`task-due${isOverdue(t.due_date, t.status) ? ' overdue' : ''}`}>
                          {fmtDate(t.due_date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📁</div>
              <p>No projects yet</p>
              <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Create Project</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentProjects.map(p => {
                const pct = p.task_count > 0 ? Math.round((p.done_count / p.task_count) * 100) : 0;
                return (
                  <Link to={`/projects/${p.id}`} key={p.id} className="card card-sm" style={{ display: 'block', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                      <span className={`badge badge-${p.my_role}`}>{p.my_role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      <span>👥 {p.member_count}</span>
                      <span>📋 {p.task_count} tasks</span>
                      <span>✅ {pct}%</span>
                    </div>
                    <div className="project-progress">
                      <div className="project-progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
