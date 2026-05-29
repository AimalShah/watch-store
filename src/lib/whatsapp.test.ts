import { describe, it, expect } from 'vitest';
import { buildAdminUrl, buildCustomerUrl, buildAdminToCustomerUrl } from './whatsapp';

const singleItem = {
  items: [{ name: 'Rolex Submariner Date', price: 10500, quantity: 1 }],
  total: 10500,
  customerName: 'John Doe',
  customerPhone: '+923001234567',
  deliveryAddress: '123 Main St, Karachi',
};

const multiItem = {
  items: [
    { name: 'Rolex Submariner Date', price: 10500, quantity: 2 },
    { name: 'Hublot Big Bang', price: 18500, quantity: 1 },
  ],
  total: 39500,
  customerName: 'Jane Doe',
  customerPhone: '+923001234567',
  deliveryAddress: '456 Oak Ave, Lahore',
};

describe('buildAdminUrl', () => {
  it('builds URL with single-item order message', () => {
    const url = buildAdminUrl(singleItem);
    expect(url).toContain('wa.me/');
    expect(decodeURIComponent(url)).toContain('New Order');
    expect(decodeURIComponent(url)).toContain('Rolex Submariner Date');
    expect(decodeURIComponent(url)).toContain('John Doe');
    expect(decodeURIComponent(url)).toContain('+923001234567');
    expect(decodeURIComponent(url)).toContain('123 Main St');
    expect(decodeURIComponent(url)).toContain('Rs10,500');
  });

  it('builds URL with multi-item order message', () => {
    const url = buildAdminUrl(multiItem);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('New Order');
    expect(decoded).toContain('Rolex Submariner Date');
    expect(decoded).toContain('Hublot Big Bang');
    expect(decoded).toContain('x2');
    expect(decoded).toContain('x1');
    expect(decoded).toContain('Rs39,500');
    expect(decoded).toContain('Jane Doe');
  });

  it('uses default number when env not set', () => {
    const url = buildAdminUrl(singleItem);
    expect(url).toContain('wa.me/+920000000000');
  });
});

describe('buildAdminToCustomerUrl', () => {
  it('builds URL with customer phone and default message', () => {
    const url = buildAdminToCustomerUrl('+923001234567');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('wa.me/+923001234567');
    expect(decoded).toContain('AZ Watch Hub');
  });

  it('builds URL with custom message', () => {
    const url = buildAdminToCustomerUrl('+923001234567', 'Your order is ready for pickup');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('wa.me/+923001234567');
    expect(decoded).toContain('Your order is ready for pickup');
  });
});

describe('buildCustomerUrl', () => {
  it('builds URL with seller confirmation message to customer phone', () => {
    const url = buildCustomerUrl(singleItem, singleItem.customerPhone);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('wa.me/+923001234567');
    expect(decoded).toContain('Order Confirmed');
    expect(decoded).toContain('Rolex Submariner Date');
    expect(decoded).toContain('John Doe');
    expect(decoded).toContain('Rs10,500');
    expect(decoded).toContain('123 Main St');
    expect(decoded).not.toContain("I'd like to confirm my order");
  });

  it('builds URL with multi-item order to custom phone', () => {
    const url = buildCustomerUrl(multiItem, '+924445556666');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('wa.me/+924445556666');
    expect(decoded).toContain('Order Confirmed');
    expect(decoded).toContain('Rolex Submariner Date');
    expect(decoded).toContain('Hublot Big Bang');
    expect(decoded).toContain('Rs39,500');
  });
});
