import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ url, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);

  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const sort = url.searchParams.get('sort') || 'newest';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  let countQuery = supabase.from('products').select('*', { count: 'exact', head: true });
  let dataQuery = supabase
    .from('products')
    .select('*, categories:category_id(name, slug)');

  if (category) {
    countQuery = countQuery.eq('category_id', category);
    dataQuery = dataQuery.eq('category_id', category);
  }

  if (search) {
    countQuery = countQuery.ilike('name', `%${search}%`);
    dataQuery = dataQuery.ilike('name', `%${search}%`);
  }

  switch (sort) {
    case 'price_asc':
      dataQuery = dataQuery.order('price', { ascending: true });
      break;
    case 'price_desc':
      dataQuery = dataQuery.order('price', { ascending: false });
      break;
    default:
      dataQuery = dataQuery.order('created_at', { ascending: false });
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    return new Response(JSON.stringify({ error: countError.message }), { status: 500 });
  }

  const { data, error } = await dataQuery.range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ data, total: count, page, limit }),
    { headers: { 'Content-Type': 'application/json' } }
  );
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
