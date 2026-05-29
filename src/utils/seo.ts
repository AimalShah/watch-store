interface ProductMeta {
  name: string;
  description: string;
  images: string[];
  categories?: { name: string } | null;
}

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
}

export function generateProductMeta(product: ProductMeta): PageMeta {
  return {
    title: `${product.name} — AZ Watch Hub`,
    description: product.description?.slice(0, 160) || `Shop the ${product.name} at AZ Watch Hub. Premium authentic timepieces.`,
    ogImage: product.images?.[0],
    ogType: 'product',
  };
}

const pageDefaults: Record<string, PageMeta> = {
  home: {
    title: 'AZ Watch Hub — Premium Timepieces',
    description: 'Discover our curated collection of luxury watches from Rolex, Hublot, Tissot, and more. Authentic timepieces with free delivery across Pakistan.',
    ogType: 'website',
  },
  watches: {
    title: 'All Watches — AZ Watch Hub',
    description: 'Browse our full collection of premium watches. Filter by brand, price, and style to find your perfect timepiece.',
    ogType: 'website',
  },
  about: {
    title: 'About Us — AZ Watch Hub',
    description: 'Learn about AZ Watch Hub — your trusted source for authentic luxury timepieces in Pakistan.',
    ogType: 'website',
  },
  contact: {
    title: 'Contact Us — AZ Watch Hub',
    description: 'Get in touch with AZ Watch Hub via WhatsApp or Instagram. We are here to help you find the perfect watch.',
    ogType: 'website',
  },
  faq: {
    title: 'FAQ — AZ Watch Hub',
    description: 'Frequently asked questions about ordering, delivery, authenticity, and returns at AZ Watch Hub.',
    ogType: 'website',
  },
  cart: {
    title: 'Cart — AZ Watch Hub',
    description: 'Review your selected watches before proceeding to checkout.',
    ogType: 'website',
  },
  checkout: {
    title: 'Checkout — AZ Watch Hub',
    description: 'Complete your order by providing your details. We will confirm via WhatsApp.',
    ogType: 'website',
  },
};

export function generatePageMeta(pageName: string): PageMeta {
  return pageDefaults[pageName] || {
    title: 'AZ Watch Hub — Premium Timepieces',
    description: 'Discover our curated collection of luxury watches.',
    ogType: 'website',
  };
}
