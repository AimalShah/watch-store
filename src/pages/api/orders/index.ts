import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';
import { buildAdminUrl } from '../../../lib/whatsapp';

export const GET: APIRoute = async ({ url, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const status = url.searchParams.get('status');

  let query = supabase
    .from('orders')
    .select('*, products:product_id(name)')
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

  if (!body.product_id || !body.quantity || !body.customer_name || !body.customer_phone || !body.delivery_address) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('id', body.product_id)
    .single();

  if (productError || !product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }

  const quantity = parseInt(body.quantity);
  if (quantity < 1) {
    return new Response(JSON.stringify({ error: 'Quantity must be at least 1' }), { status: 400 });
  }

  const totalPrice = Number(product.price) * quantity;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      product_id: body.product_id,
      quantity,
      total_price: totalPrice,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      delivery_address: body.delivery_address,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const whatsappUrl = buildAdminUrl({
    productName: product.name,
    price: Number(product.price),
    quantity,
    total: totalPrice,
    customerName: body.customer_name,
    customerPhone: body.customer_phone,
    deliveryAddress: body.delivery_address,
  });

  return new Response(JSON.stringify({ order, whatsapp_url: whatsappUrl }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
