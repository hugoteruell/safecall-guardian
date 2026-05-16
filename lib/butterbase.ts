// Thin Butterbase HTTP client. Server-side only — uses env vars with the
// service API key. Falls back to null on error so callers can degrade to the
// mock data (lib/userData.ts) without crashing the demo.

const API_URL = process.env.BUTTERBASE_API_URL;
const API_KEY = process.env.BUTTERBASE_API_KEY;

export const BUTTERBASE_READY = Boolean(API_URL && API_KEY);

type SelectOpts = {
  filters?: Record<string, string>; // e.g. { status: 'eq.blocked' }
  order?: string; // e.g. 'occurred_at.desc'
  limit?: number;
  offset?: number;
  select?: string; // e.g. 'id,name,phone'
};

function buildUrl(table: string, opts: SelectOpts = {}, id?: string) {
  let path = `${API_URL}/${table}`;
  if (id) path += `/${id}`;
  const params = new URLSearchParams();
  if (opts.filters) for (const [k, v] of Object.entries(opts.filters)) params.append(k, v);
  if (opts.order) params.set('order', opts.order);
  if (opts.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts.offset !== undefined) params.set('offset', String(opts.offset));
  if (opts.select) params.set('select', opts.select);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T = unknown>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: unknown
): Promise<T | null> {
  if (!BUTTERBASE_READY) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(t);
    if (!res.ok) {
      console.error(`[butterbase] ${method} ${url} → ${res.status}`);
      return null;
    }
    // DELETE often returns no body
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error(`[butterbase] ${method} ${url} failed:`, err);
    return null;
  }
}

export async function bbSelect<T>(table: string, opts: SelectOpts = {}): Promise<T[] | null> {
  return request<T[]>('GET', buildUrl(table, opts));
}

export async function bbSelectOne<T>(
  table: string,
  opts: SelectOpts = {}
): Promise<T | null> {
  const rows = await bbSelect<T>(table, { ...opts, limit: 1 });
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function bbInsert<T>(table: string, data: Partial<T>): Promise<T | null> {
  return request<T>('POST', buildUrl(table), data);
}

export async function bbUpdate<T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<T | null> {
  return request<T>('PATCH', buildUrl(table, {}, id), data);
}

export async function bbDelete(table: string, id: string): Promise<boolean> {
  const res = await request('DELETE', buildUrl(table, {}, id));
  // request returns null for empty body — count that as success here.
  return res === null && BUTTERBASE_READY;
}
