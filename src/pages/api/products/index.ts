import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ url, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);

  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');

  let query = supabase
    .from('products')
    .select('*, categories:category_id(name, slug)')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category_id', category);
  if (featured === 'true') query = query.eq('featured', true);

  const { data, error } = await query;

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

  if (!body.name || !body.price) {
    return new Response(JSON.stringify({ error: 'Name and price are required' }), { status: 400 });
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: body.name,
      slug,
      description: body.description || '',
      price: body.price,
      stock: body.stock ?? 0,
      category_id: body.category_id || null,
      featured: body.featured ?? false,
      images: body.images || [],
    })
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
