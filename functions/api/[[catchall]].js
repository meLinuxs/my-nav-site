/**
 * Cloudflare Pages Functions - REST API Worker for Navigation Site
 * This version includes category reordering and site editing functionality.
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
        // ... (代码未更改)
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
        // ... (代码未更改)
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM categories ORDER BY displayOrder, id').all();
          return jsonResponse(results || []);
        }
        if (request.method === 'POST' && pathParts[2] !== 'order') {
          const { name, type } = await request.json();
          if (!name || !type) return jsonResponse({ error: 'Missing fields' }, 400);
          const { results } = await env.DB.prepare('SELECT MAX(displayOrder) as maxOrder FROM categories').all();
          const newOrder = (results[0].maxOrder || 0) + 1;
          const stmt = env.DB.prepare('INSERT INTO categories (name, type, displayOrder) VALUES (?, ?, ?)')
            .bind(name, type, newOrder);
          const { meta } = await stmt.run();
          return jsonResponse({ success: true, id: meta.last_row_id }, 201);
        }
        if (request.method === 'DELETE' && id) {
          await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true });
        }
        if (request.method === 'POST' && pathParts[2] === 'order') {
            const { orderedIds } = await request.json();
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
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM sites').all();
          return jsonResponse(results || []);
        }
        if (request.method === 'POST') {
          const { categoryId, name, url, icon, description } = await request.json();
          if (!categoryId || !name || !url) return jsonResponse({ error: 'Missing fields' }, 400);
          const stmt = env.DB.prepare('INSERT INTO sites (categoryId, name, url, icon, description) VALUES (?, ?, ?, ?, ?)')
            .bind(categoryId, name, url, icon || '', description || '');
          const { meta } = await stmt.run();
          return jsonResponse({ success: true, id: meta.last_row_id });
        }
        // 新增: PUT /api/sites/:id - 更新一个已存在的网站
        if (request.method === 'PUT' && id) {
            const { categoryId, name, url, icon, description } = await request.json();
            if (!categoryId || !name || !url) return jsonResponse({ error: 'Missing fields' }, 400);
            const stmt = env.DB.prepare(
                'UPDATE sites SET categoryId = ?, name = ?, url = ?, icon = ?, description = ? WHERE id = ?'
            ).bind(categoryId, name, url, icon || '', description || '', id);
            await stmt.run();
            return jsonResponse({ success: true });
        }
        if (request.method === 'DELETE' && id) {
          await env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true });
        }
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

