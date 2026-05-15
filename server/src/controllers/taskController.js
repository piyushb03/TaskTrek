const pool = require('../db/pool');

// GET /api/projects/:projectId/tasks
const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await pool.query(
      `SELECT t.*, 
        u.name AS assignee_name, u.email AS assignee_email,
        c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.project_id = $1
       ORDER BY 
         CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         t.due_date ASC NULLS LAST,
         t.created_at DESC`,
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignee_id, status, priority, due_date } = req.body;
  const created_by = req.user.id;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  try {
    // Check project membership
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [projectId, created_by]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a project member' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, project_id, assignee_id, created_by, status, priority, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title.trim(), description || null, projectId, assignee_id || null, created_by,
       status || 'todo', priority || 'medium', due_date || null]
    );

    const task = result.rows[0];
    // Fetch with joined names
    const full = await pool.query(
      `SELECT t.*, u.name AS assignee_name, c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id=u.id
       LEFT JOIN users c ON t.created_by=c.id
       WHERE t.id=$1`,
      [task.id]
    );
    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/tasks/:taskId
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignee_id, status, priority, due_date } = req.body;
  const userId = req.user.id;

  try {
    // Verify task exists and user is member of its project
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id=$1', [taskId]);
    if (taskResult.rows.length === 0) return res.status(404).json({ message: 'Task not found' });

    const task = taskResult.rows[0];
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [task.project_id, userId]
    );
    if (memberCheck.rows.length === 0) return res.status(403).json({ message: 'Not a project member' });

    // Build dynamic update
    const updates = [];
    const values = [];
    let idx = 1;
    if (title !== undefined) { updates.push(`title=$${idx++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description=$${idx++}`); values.push(description); }
    if (assignee_id !== undefined) { updates.push(`assignee_id=$${idx++}`); values.push(assignee_id); }
    if (status !== undefined) { updates.push(`status=$${idx++}`); values.push(status); }
    if (priority !== undefined) { updates.push(`priority=$${idx++}`); values.push(priority); }
    if (due_date !== undefined) { updates.push(`due_date=$${idx++}`); values.push(due_date || null); }

    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    values.push(taskId);
    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`,
      values
    );

    const full = await pool.query(
      `SELECT t.*, u.name AS assignee_name, c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id=u.id
       LEFT JOIN users c ON t.created_by=c.id
       WHERE t.id=$1`,
      [taskId]
    );
    res.json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/tasks/:taskId
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id=$1', [taskId]);
    if (taskResult.rows.length === 0) return res.status(404).json({ message: 'Task not found' });

    const task = taskResult.rows[0];
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2',
      [task.project_id, userId]
    );
    if (memberCheck.rows.length === 0) return res.status(403).json({ message: 'Not a project member' });

    const member = memberCheck.rows[0];
    // Only admin or task creator can delete
    if (member.role !== 'admin' && task.created_by !== userId) {
      return res.status(403).json({ message: 'Insufficient permissions to delete this task' });
    }

    await pool.query('DELETE FROM tasks WHERE id=$1', [taskId]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/dashboard
const getDashboard = async (req, res) => {
  const userId = req.user.id;
  try {
    const myTasks = await pool.query(
      `SELECT t.*, p.name AS project_name, u.name AS assignee_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.assignee_id = $1
       ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`,
      [userId]
    );

    const stats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE t.assignee_id=$1) AS my_total,
        COUNT(*) FILTER (WHERE t.assignee_id=$1 AND t.status='done') AS my_done,
        COUNT(*) FILTER (WHERE t.assignee_id=$1 AND t.status='in_progress') AS my_in_progress,
        COUNT(*) FILTER (WHERE t.assignee_id=$1 AND t.due_date < NOW() AND t.status != 'done') AS my_overdue
       FROM tasks t
       JOIN project_members pm ON t.project_id=pm.project_id AND pm.user_id=$1`,
      [userId]
    );

    const recentProjects = await pool.query(
      `SELECT p.*, pm.role AS my_role,
        COUNT(DISTINCT pm2.user_id) AS member_count,
        COUNT(DISTINCT t.id) AS task_count
       FROM projects p
       JOIN project_members pm ON p.id=pm.project_id AND pm.user_id=$1
       LEFT JOIN project_members pm2 ON p.id=pm2.project_id
       LEFT JOIN tasks t ON p.id=t.project_id
       GROUP BY p.id, pm.role
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      stats: stats.rows[0],
      myTasks: myTasks.rows,
      recentProjects: recentProjects.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProjectTasks, createTask, updateTask, deleteTask, getDashboard };
