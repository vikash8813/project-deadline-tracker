import assert from 'node:assert/strict';
import test from 'node:test';
import { PATCH } from '../api/project-status.js';
import { GET, POST } from '../api/projects.js';
import { isOverBudget, isOverdue } from '../client/src/utils.js';
import { validateProject } from '../server/validate.js';

test('deadline and budget edge cases', () => {
  const today = '2026-11-18';

  assert.equal(isOverdue({ deadline: null, status: 'active' }, today), false);
  assert.equal(isOverdue({ deadline: today, status: 'active' }, today), false);
  assert.equal(isOverdue({ deadline: '2026-11-17', status: 'active' }, today), true);
  assert.equal(isOverdue({ deadline: '2026-11-17', status: 'completed' }, today), false);
  assert.equal(isOverBudget({ budget: 10, spentAmount: 10 }), false);
  assert.equal(isOverBudget({ budget: 10, spentAmount: 11 }), true);
});

test('project validation rejects impossible dates and accepts valid input', () => {
  const invalid = validateProject({
    title: 'Project',
    status: 'active',
    deadline: '2026-02-30',
    budget: 0,
    spentAmount: 0,
  });
  assert.equal(
    invalid.errors.deadline,
    'Deadline must be a valid date in YYYY-MM-DD format, or null.'
  );

  const valid = validateProject({
    title: ' Project ',
    status: 'active',
    deadline: null,
    budget: 0,
    spentAmount: 0,
  });
  assert.deepEqual(valid.errors, {});
  assert.equal(valid.project.title, 'Project');
});

test('Vercel handlers reject invalid requests before database access', async () => {
  let response = await GET(new Request('https://example.test/api/projects?status=bad'));
  assert.equal(response.status, 400);

  response = await POST(
    new Request('https://example.test/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
  );
  assert.equal(response.status, 400);

  response = await PATCH(
    new Request('https://example.test/api/project-status?id=not-a-number', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
  );
  assert.equal(response.status, 404);
});
