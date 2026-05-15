import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = () => {
    api.get('/projects').then(r => setProjects(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const r = await api.post('/projects', form);
      setProjects(prev => [r.data, ...prev]);
      setForm({ name: '', description: '' }); setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-desc">Create your first project to start managing tasks with your team.</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => {
            const pct = p.task_count > 0 ? Math.round((p.done_count / p.task_count) * 100) : 0;
            return (
              <Link to={`/projects/${p.id}`} key={p.id} className="project-card">
                <div className="project-card-header">
                  <div className="project-card-name">{p.name}</div>
                  <span className={`badge badge-${p.my_role}`}>{p.my_role}</span>
                </div>
                {p.description && <p className="project-card-desc">{p.description}</p>}
                <div className="project-progress">
                  <div className="project-progress-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="project-card-meta">
                  <span>👥 {p.member_count} member{p.member_count !== 1 ? 's' : ''}</span>
                  <span>📋 {p.task_count} task{p.task_count !== 1 ? 's' : ''}</span>
                  <span>✅ {pct}% done</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <form id="create-project-form" onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input className="form-input" placeholder="e.g. Website Redesign" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" placeholder="What is this project about?"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="create-project-form" type="submit" disabled={saving}>
                {saving ? 'Creating…' : '+ Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
