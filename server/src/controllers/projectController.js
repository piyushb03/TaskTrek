const pool = require('../db/pool');

// GET /api/projects
const listProjects = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT p.*, pm.role AS my_role, u.name AS owner_name,
        COUNT(DISTINCT pm2.user_id) AS member_count,
        COUNT(DISTINCT t.id) AS task_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status='done') AS done_count
       FROM projects p
       JOIN project_members pm ON p.id=pm.project_id AND pm.user_id=$1
       LEFT JOIN users u ON p.owner_id=u.id
       LEFT JOIN project_members pm2 ON p.id=pm2.project_id
       LEFT JOIN tasks t ON p.id=t.project_id
       GROUP BY p.id, pm.role, u.name
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const projResult = await client.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1,$2,$3) RETURNING *',
      [name.trim(), description || null, ownerId]
    );
    const project = projResult.rows[0];

    // Add creator as admin member
    await client.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1,$2,$3)',
      [project.id, ownerId, 'admin']
    );

    await client.query('COMMIT');
    res.status(201).json({ ...project, my_role: 'admin', member_count: 1, task_count: 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// GET /api/projects/:projectId
const getProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    const projectResult = await pool.query(
      `SELECT p.*, pm.role AS my_role, u.name AS owner_name
       FROM projects p
       JOIN project_members pm ON p.id=pm.project_id AND pm.user_id=$1
       LEFT JOIN users u ON p.owner_id=u.id
       WHERE p.id=$2`,
      [userId, projectId]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id=u.id
       WHERE pm.project_id=$1
       ORDER BY pm.role DESC, u.name ASC`,
      [projectId]
    );

    res.json({ ...projectResult.rows[0], members: membersResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/projects/:projectId
const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const { name, description } = req.body;

  try {
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, userId]
    );
    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updates = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { updates.push(`name=$${idx++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description=$${idx++}`); values.push(description); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    values.push(projectId);
    const result = await pool.query(
      `UPDATE projects SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/projects/:projectId
const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, userId]
    );
    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await pool.query('DELETE FROM projects WHERE id=$1', [projectId]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/projects/:projectId/members
const addMember = async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  const userId = req.user.id;

  try {
    const adminCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, userId]
    );
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userResult = await pool.query('SELECT id, name, email FROM users WHERE email=$1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const targetUser = userResult.rows[0];

    // Check already member
    const existing = await pool.query(
      'SELECT id FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, targetUser.id]
    );
    if (existing.rows.length > 0) return res.status(409).json({ message: 'User already a member' });

    const memberRole = role === 'admin' ? 'admin' : 'member';
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1,$2,$3)',
      [projectId, targetUser.id, memberRole]
    );

    res.status(201).json({ ...targetUser, role: memberRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/projects/:projectId/members/:memberId
const removeMember = async (req, res) => {
  const { projectId, memberId } = req.params;
  const userId = req.user.id;

  try {
    const adminCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, userId]
    );
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Check if target is the last admin
    const admins = await pool.query(
      'SELECT COUNT(*) FROM project_members WHERE project_id=$1 AND role=$2',
      [projectId, 'admin']
    );
    const targetMember = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, memberId]
    );
    if (targetMember.rows.length === 0) return res.status(404).json({ message: 'Member not found' });
    if (targetMember.rows[0].role === 'admin' && parseInt(admins.rows[0].count) <= 1) {
      return res.status(400).json({ message: 'Cannot remove the last admin' });
    }

    await pool.query(
      'DELETE FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, memberId]
    );
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/projects/:projectId/members/:memberId/role
const updateMemberRole = async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;
  const userId = req.user.id;

  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'Role must be admin or member' });
  }

  try {
    const adminCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, userId]
    );
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await pool.query(
      'UPDATE project_members SET role=$1 WHERE project_id=$2 AND user_id=$3 RETURNING *',
      [role, projectId, memberId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listProjects, createProject, getProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole
};
