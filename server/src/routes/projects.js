const express = require('express');
const router = express.Router();
const {
  listProjects, createProject, getProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole
} = require('../controllers/projectController');
const { getProjectTasks, createTask } = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:projectId', getProject);
router.patch('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

// Members
router.post('/:projectId/members', addMember);
router.delete('/:projectId/members/:memberId', removeMember);
router.patch('/:projectId/members/:memberId/role', updateMemberRole);

// Tasks under project
router.get('/:projectId/tasks', getProjectTasks);
router.post('/:projectId/tasks', createTask);

module.exports = router;
