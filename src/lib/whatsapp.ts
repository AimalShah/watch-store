interface OrderMessage {
  productName: string;
  price: number;
  quantity: number;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

function encodeMessage(text: string): string {
  return encodeURIComponent(text);
}

function buildOrderMessage(order: OrderMessage): string {
  return [
    `New Order: ${order.productName}`,
    `Price: $${Number(order.price).toLocaleString()}`,
    `Quantity: ${order.quantity}`,
    `Total: $${order.total.toLocaleString()}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${order.deliveryAddress}`,
  ].join('\n');
}

export function buildAdminUrl(order: OrderMessage): string {
  const adminNumber = import.meta.env.PUBLIC_ADMIN_WHATSAPP_NUMBER || '+920000000000';
  const message = buildOrderMessage(order);
  return `https://wa.me/${adminNumber}?text=${encodeMessage(message)}`;
}

export function buildCustomerUrl(order: OrderMessage): string {
  const adminNumber = import.meta.env.PUBLIC_ADMIN_WHATSAPP_NUMBER || '+920000000000';
  const message = [
    `Hi, I'd like to confirm my order:`,
    ...buildOrderMessage(order).split('\n'),
  ].join('\n');
  return `https://wa.me/${adminNumber}?text=${encodeMessage(message)}`;
}
