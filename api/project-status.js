import { changeProjectStatus, initializeDatabase } from './_db.js';
import { STATUSES, isValidStatus } from '../server/validate.js';

const noStore = { 'Cache-Control': 'no-store' };
const invalidStatusMessage = `Status must be one of: ${STATUSES.join(', ')}.`;

function json(data, status = 200) {
  return Response.json(data, { status, headers: noStore });
}

export async function PATCH(request) {
  const idText = new URL(request.url).searchParams.get('id');
  const id = Number(idText);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return json({ error: 'Project not found.' }, 404);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body is not valid JSON.' }, 400);
  }

  if (!isValidStatus(body?.status)) {
    return json({ error: invalidStatusMessage }, 400);
  }

  try {
    await initializeDatabase();
    const updated = await changeProjectStatus(id, body.status);
    return updated ? json(updated) : json({ error: 'Project not found.' }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: 'Something went wrong on the server.' }, 500);
  }
}
