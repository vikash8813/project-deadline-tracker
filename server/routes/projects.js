// The three API endpoints. Mounted at /api/projects in index.js.
import { Router } from 'express';
import db from '../db.js';
import { STATUSES, isValidStatus, validateProject } from '../validate.js';

const router = Router();

// Sort order: nearest deadline first, projects without a deadline last.
// "deadline IS NULL" is 0 for dated projects and 1 for undated ones, so
// sorting on it first pushes the undated projects to the bottom.
const SORT = 'ORDER BY deadline IS NULL, deadline ASC, id ASC';

const invalidStatusMessage = `Status must be one of: ${STATUSES.join(', ')}.`;

// GET /api/projects            -> all projects
// GET /api/projects?status=... -> only projects with that status
router.get('/', (req, res) => {
  const { status } = req.query;

  if (status === undefined) {
    const projects = db.prepare(`SELECT * FROM projects ${SORT}`).all();
    return res.json(projects);
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: invalidStatusMessage });
  }

  // The "?" placeholder keeps user input out of the SQL text (no SQL injection).
  const projects = db
    .prepare(`SELECT * FROM projects WHERE status = ? ${SORT}`)
    .all(status);
  res.json(projects);
});

// POST /api/projects -> create a project
router.post('/', (req, res) => {
  const { errors, project } = validateProject(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed. Please fix the highlighted fields.',
      details: errors,
    });
  }

  const result = db
    .prepare(`
      INSERT INTO projects (title, status, deadline, budget, spentAmount)
      VALUES (@title, @status, @deadline, @budget, @spentAmount)
    `)
    .run(project);

  const created = db
    .prepare('SELECT * FROM projects WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PATCH /api/projects/:id/status -> change only the status
router.patch('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status;

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: invalidStatusMessage });
  }

  const result = db
    .prepare('UPDATE projects SET status = ? WHERE id = ?')
    .run(status, id);

  // No row changed means no project has this id.
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json(updated);
});

export default router;
