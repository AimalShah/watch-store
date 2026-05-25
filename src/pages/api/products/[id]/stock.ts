import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const body = await request.json();

  if (body.stock === undefined || body.stock < 0) {
    return new Response(JSON.stringify({ error: 'Stock must be a non-negative number' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .update({ stock: body.stock, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('id, name, stock, images')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
