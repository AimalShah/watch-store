import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: lowStockCount, data: lowStockProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('id, name, slug, stock', { count: 'exact' }).lt('stock', 5).order('stock', { ascending: true }),
    supabase.from('orders').select('*, order_items(*, products:product_id(name))').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
  ]);

  return new Response(
    JSON.stringify({
      totalProducts: totalProducts ?? 0,
      totalOrders: totalOrders ?? 0,
      pendingOrders: pendingOrders ?? 0,
      lowStockCount: lowStockCount ?? 0,
      lowStockProducts: lowStockProducts ?? [],
      recentOrders: recentOrders ?? [],
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
