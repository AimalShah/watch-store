interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderMessage {
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

function encodeMessage(text: string): string {
  return encodeURIComponent(text);
}

function buildItemsList(items: OrderItem[]): string {
  return items.map((item, i) =>
    `${i + 1}. ${item.name} x${item.quantity} — Rs${Number(item.price).toLocaleString()} each`
  ).join('\n');
}

function buildOrderMessage(order: OrderMessage): string {
  return [
    '*New Order*',
    '',
    buildItemsList(order.items),
    '',
    `*Total: Rs${order.total.toLocaleString()}*`,
    '',
    `*Customer:* ${order.customerName}`,
    `*Phone:* ${order.customerPhone}`,
    `*Address:* ${order.deliveryAddress}`,
  ].join('\n');
}

export function buildAdminUrl(order: OrderMessage): string {
  const adminNumber = import.meta.env.PUBLIC_ADMIN_WHATSAPP_NUMBER || '+920000000000';
  const message = buildOrderMessage(order);
  return `https://wa.me/${adminNumber}?text=${encodeMessage(message)}`;
}

export function buildAdminToCustomerUrl(phone: string, message?: string): string {
  const text = message || 'Hi, this is regarding your order from AZ Watch Hub.';
  return `https://wa.me/${phone}?text=${encodeMessage(text)}`;
}

export function buildCustomerUrl(order: OrderMessage, customerPhone: string): string {
  const message = [
    '*Order Confirmed*',
    '',
    `Hi ${order.customerName}, your order has been confirmed! We will process it shortly.`,
    '',
    ...order.items.map((item, i) =>
      `${i + 1}. ${item.name} x${item.quantity} — Rs${Number(item.price).toLocaleString()} each`
    ),
    '',
    `*Total: Rs${order.total.toLocaleString()}*`,
    `*Delivery Address:* ${order.deliveryAddress}`,
  ].join('\n');
  return `https://wa.me/${customerPhone}?text=${encodeMessage(message)}`;
}

export type { OrderItem, OrderMessage };
