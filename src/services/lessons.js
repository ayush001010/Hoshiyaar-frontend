const API_BASE = import.meta?.env?.VITE_API_BASE || '';

export async function fetchLessonItemsByModule(moduleNumber) {
  const response = await fetch(`${API_BASE}/api/lessons/${moduleNumber}`);
  if (!response.ok) {
    throw new Error(`Failed to load lessons for module ${moduleNumber}`);
  }
  return response.json();
}

export async function importLessons(moduleNumber, payload) {
  const response = await fetch(`${API_BASE}/api/lessons/${moduleNumber}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to import lessons');
  }
  return response.json();
}


