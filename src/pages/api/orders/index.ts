import type { APIRoute } from 'astro';
import { createSupabaseServerClient, requireAdmin } from '../../../lib/supabase-server';
import { buildAdminUrl } from '../../../lib/whatsapp';

export const GET: APIRoute = async ({ url, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const unauthorized = await requireAdmin(supabase);
  if (unauthorized) return unauthorized;

  const status = url.searchParams.get('status');

  let query = supabase
    .from('orders')
    .select('*, order_items(*, products:product_id(name, price))')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const body = await request.json();

  const { items, customer } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one item is required' }), { status: 400 });
  }

  if (!customer?.name || !customer?.phone || !customer?.address) {
    return new Response(JSON.stringify({ error: 'Customer name, phone, and address are required' }), { status: 400 });
  }

  const productIds = items.map(i => i.productId);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds);

  if (productsError) {
    return new Response(JSON.stringify({ error: productsError.message }), { status: 500 });
  }

  if (!products || products.length !== productIds.length) {
    return new Response(JSON.stringify({ error: 'One or more products not found' }), { status: 404 });
  }

  const productMap = new Map(products.map(p => [p.id, p]));

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return new Response(JSON.stringify({ error: 'Each item must have a valid productId and quantity' }), { status: 400 });
    }
  }

  const orderItems = items.map(item => ({
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: Number(productMap.get(item.productId)!.price),
  }));

  const totalAmount = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      total_amount: totalAmount,
      customer_name: customer.name,
      customer_phone: customer.phone,
      delivery_address: customer.address,
    })
    .select()
    .single();

  if (orderError) {
    return new Response(JSON.stringify({ error: orderError.message }), { status: 500 });
  }

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map(oi => ({ ...oi, order_id: order.id })));

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    return new Response(JSON.stringify({ error: itemsError.message }), { status: 500 });
  }

  const itemsWithNames = orderItems.map(oi => ({
    name: productMap.get(oi.product_id)!.name,
    price: oi.unit_price,
    quantity: oi.quantity,
  }));

  const whatsappUrl = buildAdminUrl({
    items: itemsWithNames,
    total: totalAmount,
    customerName: customer.name,
    customerPhone: customer.phone,
    deliveryAddress: customer.address,
  });

  return new Response(JSON.stringify({ order, whatsapp_url: whatsappUrl }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
