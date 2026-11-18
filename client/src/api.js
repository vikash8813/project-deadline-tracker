// Every call to the backend goes through this file.

// Sends a request and returns the JSON body.
// On failure it throws an Error whose message is the server's own error
// text, with the per-field messages (if any) attached as error.details.
async function request(path, options) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Could not reach the server. Please check that it is running.');
  }

  // The body may be empty or not JSON (for example when the server is down).
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (status ${response.status}).`);
    error.details = data?.details || {};
    throw error;
  }

  return data;
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// status is optional: pass '' (or nothing) to get every project.
export function getProjects(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/api/projects${query}`);
}

export function createProject(project) {
  return request('/api/projects', jsonOptions('POST', project));
}

export function updateProjectStatus(id, status) {
  return request(`/api/projects/${id}/status`, jsonOptions('PATCH', { status }));
}
