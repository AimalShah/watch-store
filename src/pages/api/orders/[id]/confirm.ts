import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';
import { buildCustomerUrl } from '../../../../lib/whatsapp';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*, products:product_id(name, price, stock))')
    .eq('id', params.id)
    .single();

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
  }

  if (order.status === 'confirmed') {
    return new Response(JSON.stringify({ error: 'Order already confirmed' }), { status: 409 });
  }

  for (const item of order.order_items) {
    if (item.products.stock < item.quantity) {
      return new Response(
        JSON.stringify({
          error: `Insufficient stock for ${item.products.name}. Available: ${item.products.stock}, requested: ${item.quantity}`,
        }),
        { status: 400 }
      );
    }
  }

  for (const item of order.order_items) {
    const newStock = item.products.stock - item.quantity;
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', item.product_id);

    if (stockError) {
      return new Response(JSON.stringify({ error: stockError.message }), { status: 500 });
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', params.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  const itemsWithNames = order.order_items.map(oi => ({
    name: oi.products.name,
    price: Number(oi.products.price),
    quantity: oi.quantity,
  }));

  const whatsappUrl = buildCustomerUrl({
    items: itemsWithNames,
    total: Number(order.total_amount),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    deliveryAddress: order.delivery_address,
  }, order.customer_phone);

  return new Response(JSON.stringify({ success: true, whatsapp_url: whatsappUrl }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
