import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const { data, error } = await supabase
    .from('categories')
    .select('*, products:products(count)')
    .order('name');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const body = await request.json();

  if (!body.name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: body.name, slug })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
