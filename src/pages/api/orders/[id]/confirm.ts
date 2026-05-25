import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';
import { buildCustomerUrl } from '../../../../lib/whatsapp';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, products:product_id(name, price, stock)')
    .eq('id', params.id)
    .single();

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
  }

  if (order.status === 'confirmed') {
    return new Response(JSON.stringify({ error: 'Order already confirmed' }), { status: 409 });
  }

  if (order.products.stock < order.quantity) {
    return new Response(
      JSON.stringify({ error: `Insufficient stock. Available: ${order.products.stock}, requested: ${order.quantity}` }),
      { status: 400 }
    );
  }

  const newStock = order.products.stock - order.quantity;

  const { error: stockError } = await supabase
    .from('products')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', order.product_id);

  if (stockError) {
    return new Response(JSON.stringify({ error: stockError.message }), { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', params.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  const whatsappUrl = buildCustomerUrl({
    productName: order.products.name,
    price: Number(order.products.price),
    quantity: order.quantity,
    total: Number(order.total_price),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    deliveryAddress: order.delivery_address,
  });

  return new Response(JSON.stringify({ success: true, whatsapp_url: whatsappUrl }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
