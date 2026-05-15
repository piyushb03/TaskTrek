import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: 'var(--status-todo)' },
  { key: 'in_progress', label: 'In Progress', color: 'var(--status-progress)' },
  { key: 'review', label: 'Review', color: 'var(--status-review)' },
  { key: 'done', label: 'Done', color: 'var(--status-done)' },
];

const isOverdue = (due, status) => due && status !== 'done' && new Date(due) < new Date();
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function TaskModal({ task, onClose, onSave, members, isAdmin, currentUserId }) {
  const isNew = !task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee_id: task?.assignee_id || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await onSave({ ...form, assignee_id: form.assignee_id || null, due_date: form.due_date || null });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setSaving(false); }
  };

  const canEdit = isAdmin || !task || task.created_by === currentUserId || task.assignee_id === currentUserId;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'New Task' : 'Edit Task'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form id="task-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" required placeholder="Task title…" disabled={!canEdit && !isNew}
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" placeholder="What needs to be done?"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input form-select" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="form-input form-select" value={form.assignee_id}
                  onChange={e => setForm({ ...form, assignee_id: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="task-form" type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? '+ Add Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const r = await api.post(`/projects/${projectId}/members`, { email, role });
      onAdded(r.data); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Team Member</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form id="add-member-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" required placeholder="member@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="add-member-form" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | taskObject
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      if (err.response?.status === 404) navigate('/projects');
    } finally { setLoading(false); }
  }, [projectId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isAdmin = project?.my_role === 'admin';
  const members = project?.members || [];

  const handleSaveTask = async (form) => {
    if (taskModal === 'new') {
      const r = await api.post(`/projects/${projectId}/tasks`, form);
      setTasks(prev => [...prev, r.data]);
    } else {
      const r = await api.patch(`/tasks/${taskModal.id}`, form);
      setTasks(prev => prev.map(t => t.id === r.data.id ? r.data : t));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${projectId}`);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      setProject(prev => ({ ...prev, members: prev.members.filter(m => m.id !== memberId) }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const r = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === r.data.id ? r.data : t));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!project) return null;

  const tasksByStatus = STATUS_COLS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className="page-content">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="page-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('/projects')}>
              Projects
            </span> / {project.name}
          </div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>+ Add Member</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete</button>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setTaskModal('new')}>+ New Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${tab === 'board' ? ' active' : ''}`} onClick={() => setTab('board')}>📋 Board</button>
        <button className={`tab-btn${tab === 'list' ? ' active' : ''}`} onClick={() => setTab('list')}>📄 List</button>
        <button className={`tab-btn${tab === 'members' ? ' active' : ''}`} onClick={() => setTab('members')}>
          👥 Members ({members.length})
        </button>
      </div>

      {/* Board View */}
      {tab === 'board' && (
        <div className="kanban-board">
          {STATUS_COLS.map(col => (
            <div className="kanban-col" key={col.key}>
              <div className="kanban-col-header">
                <span style={{ color: col.color }}>{col.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {tasksByStatus[col.key].length}
                </span>
              </div>
              <div className="kanban-col-body">
                {tasksByStatus[col.key].map(task => (
                  <div key={task.id} className="task-card" onClick={() => setTaskModal(task)}>
                    <div className="task-card-title">{task.title}</div>
                    <div className="task-card-meta">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </div>
                      {task.due_date && (
                        <span className={`task-due${isOverdue(task.due_date, task.status) ? ' overdue' : ''}`}>
                          📅 {fmtDate(task.due_date)}
                        </span>
                      )}
                    </div>
                    {task.assignee_name && (
                      <div className="task-card-assignee" style={{ marginTop: 8 }}>
                        <div className="task-assignee-avatar">{task.assignee_name[0]}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.assignee_name}</span>
                      </div>
                    )}
                  </div>
                ))}
                {tasksByStatus[col.key].length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {tab === 'list' && (
        tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No tasks yet</div>
            <div className="empty-desc">Click "+ New Task" to add your first task.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Title</th><th>Assignee</th><th>Status</th><th>Priority</th><th>Due</th><th></th></tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => setTaskModal(t)}>{t.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.assignee_name || '—'}</td>
                    <td>
                      <select className="form-input form-select" style={{ padding: '4px 28px 4px 8px', fontSize: '0.78rem', width: 'auto' }}
                        value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)}
                        onClick={e => e.stopPropagation()}>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                    <td>
                      <span className={`task-due${isOverdue(t.due_date, t.status) ? ' overdue' : ''}`}>
                        {fmtDate(t.due_date)}
                      </span>
                    </td>
                    <td>
                      {(isAdmin || t.created_by === user.id) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteTask(t.id)}
                          style={{ color: 'var(--danger)', padding: '4px 8px' }}>🗑</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div>
          {isAdmin && (
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>+ Add Member</button>
            </div>
          )}
          <div className="members-list">
            {members.map(m => (
              <div key={m.id} className="member-item">
                <div className="member-avatar">{m.name[0]}</div>
                <div className="member-info">
                  <div className="member-name">{m.name} {m.id === user.id && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(you)</span>}</div>
                  <div className="member-email">{m.email}</div>
                </div>
                <div className="member-actions">
                  <span className={`badge badge-${m.role}`}>{m.role}</span>
                  {isAdmin && m.id !== user.id && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px 8px' }}
                      onClick={() => handleRemoveMember(m.id)}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {taskModal !== null && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSave={handleSaveTask}
          members={members}
          isAdmin={isAdmin}
          currentUserId={user.id}
        />
      )}
      {showMemberModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowMemberModal(false)}
          onAdded={member => setProject(prev => ({ ...prev, members: [...prev.members, member] }))}
        />
      )}
    </div>
  );
}
