import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products:product_id(name, price))')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
