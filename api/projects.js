import { initializeDatabase, insertProject, listProjects } from './_db.js';
import { STATUSES, isValidStatus, validateProject } from '../server/validate.js';

const noStore = { 'Cache-Control': 'no-store' };
const invalidStatusMessage = `Status must be one of: ${STATUSES.join(', ')}.`;

function json(data, status = 200) {
  return Response.json(data, { status, headers: noStore });
}

export async function GET(request) {
  try {
    const status = new URL(request.url).searchParams.get('status');
    if (status !== null && !isValidStatus(status)) {
      return json({ error: invalidStatusMessage }, 400);
    }

    await initializeDatabase();
    return json(await listProjects(status));
  } catch (error) {
    console.error(error);
    return json({ error: 'Something went wrong on the server.' }, 500);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body is not valid JSON.' }, 400);
  }

  const { errors, project } = validateProject(body);
  if (Object.keys(errors).length > 0) {
    return json(
      {
        error: 'Validation failed. Please fix the highlighted fields.',
        details: errors,
      },
      400
    );
  }

  try {
    await initializeDatabase();
    return json(await insertProject(project), 201);
  } catch (error) {
    console.error(error);
    return json({ error: 'Something went wrong on the server.' }, 500);
  }
}
