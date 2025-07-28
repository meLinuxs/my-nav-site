/**
 * Cloudflare Pages Functions - REST API Worker for Navigation Site
 * This version includes category reordering functionality.
 */

const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json' },
  });
};

async function handleApiRequest(request, env) {
  const { pathname } = new URL(request.url);
  const pathParts = pathname.split('/').filter(Boolean);

  if (pathParts[0] !== 'api') {
    return jsonResponse({ error: 'Invalid API route' }, 404);
  }

  const resource = pathParts[1];
  const id = pathParts[2];

  try {
    switch (resource) {
      case 'settings':
        if (request.method === 'GET') { /* ... existing code ... */ }
        if (request.method === 'POST') { /* ... existing code ... */ }
        break;

      case 'categories':
        // GET /api/categories - Now sorts by displayOrder
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM categories ORDER BY displayOrder').all();
          return jsonResponse(results || []);
        }
        // POST /api/categories - Now sets initial displayOrder
        if (request.method === 'POST' && pathParts[2] !== 'order') {
          const { name, type } = await request.json();
          if (!name || !type) return jsonResponse({ error: 'Missing fields' }, 400);
          
          // Get the current max order and add 1
          const { results } = await env.DB.prepare('SELECT MAX(displayOrder) as maxOrder FROM categories').all();
          const newOrder = (results[0].maxOrder || 0) + 1;

          const stmt = env.DB.prepare('INSERT INTO categories (name, type, displayOrder) VALUES (?, ?, ?)')
            .bind(name, type, newOrder);
          const { meta } = await stmt.run();
          return jsonResponse({ success: true, id: meta.last_row_id }, 201);
        }
        // DELETE /api/categories/:id
        if (request.method === 'DELETE' && id) {
          await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true });
        }
        // NEW: POST /api/categories/order - Updates the order of all categories
        if (request.method === 'POST' && pathParts[2] === 'order') {
            const { orderedIds } = await request.json(); // Expects an array of IDs in the new order
            if (!Array.isArray(orderedIds)) {
                return jsonResponse({ error: 'Invalid data format, expected orderedIds array' }, 400);
            }

            const statements = orderedIds.map((id, index) => {
                return env.DB.prepare('UPDATE categories SET displayOrder = ? WHERE id = ?').bind(index, id);
            });

            await env.DB.batch(statements);
            return jsonResponse({ success: true });
        }
        break;

      case 'sites':
        if (request.method === 'GET') { /* ... existing code ... */ }
        if (request.method === 'POST') { /* ... existing code ... */ }
        if (request.method === 'DELETE' && id) { /* ... existing code ... */ }
        break;

      default:
        return jsonResponse({ error: 'Resource not found' }, 404);
    }
    
    return jsonResponse({ error: `Method ${request.method} not allowed` }, 405);

  } catch (e) {
    console.error('API Error:', e);
    return jsonResponse({ error: 'Internal Server Error', details: e.message }, 500);
  }
}

export const onRequest = async ({ request, env }) => {
  return await handleApiRequest(request, env);
};
