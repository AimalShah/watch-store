import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ url, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const sort = url.searchParams.get('sort') || 'newest';

  let query = supabase
    .from('products')
    .select('*, categories:category_id(name, slug)', { count: 'exact' });

  if (category) query = query.eq('category_id', category);
  if (search) query = query.ilike('name', `%${search}%`);
  if (url.searchParams.get('featured') === 'true') query = query.eq('featured', true);

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ data, total: count, limit, offset }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);
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
