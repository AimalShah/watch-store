import { useState } from 'react';

interface Props {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  images: string[];
}

export function ProductDetail({ productId, productName, price, stock, images }: Props) {
  const [mainImage, setMainImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+92');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const outOfStock = stock < 1;

  function increment() {
    if (quantity < stock) setQuantity((q) => q + 1);
  }

  function decrement() {
    if (quantity > 1) setQuantity((q) => q - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !address) {
      setError('All fields are required');
      return;
    }
    if (!/^\+92\d{10}$/.test(phone.replace(/\s/g, ''))) {
      setError('Phone must be a valid Pakistani number (+92xxxxxxxxxx)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          customer_name: name,
          customer_phone: phone,
          delivery_address: address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Order failed');
      }

      const { whatsapp_url } = await res.json();
      window.open(whatsapp_url, '_blank');
      alert('Order submitted! WhatsApp will open with your order details.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="detail-layout">
      <div className="detail-gallery">
        <div className="main-image" onClick={() => setLightbox(true)}>
          {images[mainImage] ? (
            <img src={images[mainImage]} alt={productName} />
          ) : (
            <div className="main-image-placeholder" />
          )}
        </div>
        {images.length > 1 && (
          <div className="thumbnail-strip">
            {images.map((url, i) => (
              <button
                key={i}
                className={`thumbnail ${i === mainImage ? 'active' : ''}`}
                onClick={() => setMainImage(i)}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail-info">
        <h1 className="detail-name">{productName}</h1>
        <p className="detail-price">${Number(price).toLocaleString()}</p>

        <div className={`stock-indicator ${outOfStock ? 'out' : 'in'}`}>
          {outOfStock ? 'Out of Stock' : `In Stock (${stock})`}
        </div>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="qty-selector">
            <span className="label-sm">Quantity</span>
            <div className="qty-controls">
              <button type="button" onClick={decrement} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={increment} disabled={quantity >= stock}>+</button>
            </div>
          </div>

          <label className="field">
            <span className="label-sm">Full Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="field">
            <span className="label-sm">Phone Number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+923001234567"
              required
            />
          </label>

          <label className="field">
            <span className="label-sm">Delivery Address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
            />
          </label>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn-order"
            disabled={outOfStock || submitting}
          >
            {submitting ? 'Submitting...' : 'Order via WhatsApp'}
          </button>
        </form>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lightbox-close">×</button>
          <img src={images[mainImage]} alt={productName} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
