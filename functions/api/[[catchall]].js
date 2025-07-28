/**
 * Cloudflare Pages Functions - REST API Worker
 * * This worker provides a RESTful API for the navigation website. It interfaces
 * with a Cloudflare D1 database to perform CRUD (Create, Read, Update, Delete)
 * operations for settings, categories, and sites.
 *
 * The worker is bound to a D1 database via the `env.DB` environment variable.
 * Requests are routed based on the URL path, e.g., /api/sites, /api/categories.
 */

/**
 * Creates a standard JSON response.
 * @param {object | array} data - The data to be sent in the response body.
 * @param {number} [status=200] - The HTTP status code.
 * @returns {Response} A Response object.
 */
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Handles incoming API requests and routes them to the appropriate handler.
 * @param {Request} request - The incoming request object.
 * @param {object} env - The environment object, containing bindings like the DB.
 * @returns {Promise<Response>}
 */
async function handleApiRequest(request, env) {
  const { pathname } = new URL(request.url);
  const pathParts = pathname.split('/').filter(Boolean); // e.g., ['api', 'sites', '123']

  if (pathParts[0] !== 'api') {
    return jsonResponse({ error: 'Invalid API route' }, 404);
  }

  const resource = pathParts[1];
  const id = pathParts[2];

  try {
    switch (resource) {
      case 'settings':
        // --- Settings API Endpoints ---
        if (request.method === 'GET') {
          const stmt = env.DB.prepare('SELECT * FROM settings WHERE key = ?').bind('backgroundUrl');
          const { results } = await stmt.all();
          return jsonResponse(results[0] || { key: 'backgroundUrl', value: '' });
        }
        if (request.method === 'POST') {
          const { backgroundUrl } = await request.json();
          const stmt = env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
            .bind('backgroundUrl', backgroundUrl);
          await stmt.run();
          return jsonResponse({ success: true });
        }
        break;

      case 'categories':
        // --- Categories API Endpoints ---
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM categories ORDER BY name').all();
          return jsonResponse(results || []);
        }
        if (request.method === 'POST') {
          const { name, type } = await request.json();
          if (!name || !type) return jsonResponse({ error: 'Missing required fields: name, type' }, 400);
          const stmt = env.DB.prepare('INSERT INTO categories (name, type) VALUES (?, ?)')
            .bind(name, type);
          const { meta } = await stmt.run();
          return jsonResponse({ success: true, id: meta.last_row_id }, 201);
        }
        if (request.method === 'DELETE' && id) {
          await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true });
        }
        break;

      case 'sites':
        // --- Sites API Endpoints ---
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM sites ORDER BY name').all();
          return jsonResponse(results || []);
        }
        if (request.method === 'POST') {
          const { categoryId, name, url, icon, description } = await request.json();
          if (!categoryId || !name || !url) return jsonResponse({ error: 'Missing required fields: categoryId, name, url' }, 400);
          const stmt = env.DB.prepare('INSERT INTO sites (categoryId, name, url, icon, description) VALUES (?, ?, ?, ?, ?)')
            .bind(categoryId, name, url, icon || '', description || '');
          const { meta } = await stmt.run();
          return jsonResponse({ success: true, id: meta.last_row_id }, 201);
        }
        if (request.method === 'DELETE' && id) {
          await env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true });
        }
        break;

      default:
        // --- Fallback for unknown resources ---
        return jsonResponse({ error: 'Resource not found' }, 404);
    }
    
    // If method is not supported for the resource
    return jsonResponse({ error: `Method ${request.method} not allowed for resource ${resource}` }, 405);

  } catch (e) {
    console.error('API Error:', e);
    return jsonResponse({ error: 'An internal server error occurred', details: e.message }, 500);
  }
}

// --- Cloudflare Pages Function Entry Point ---
export const onRequest = async ({ request, env }) => {
  return await handleApiRequest(request, env);
};
