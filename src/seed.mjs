// Seed script — run with: node src/seed.mjs
// Populates the database with categories and sample watches

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const categories = [
  { name: 'Rolex', slug: 'rolex' },
  { name: 'Hublot', slug: 'hublot' },
  { name: 'Tissot', slug: 'tissot' },
];

const products = [
  {
    name: 'Rolex Submariner Date',
    slug: 'rolex-submariner-date',
    description: 'The iconic diver\'s watch with a unidirectional rotatable bezel, Cerachrom insert, and Oystersteel construction. Water-resistant to 300 meters with automatic movement.',
    price: 10500,
    stock: 3,
    featured: true,
    categorySlug: 'rolex',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    ],
  },
  {
    name: 'Rolex Daytona',
    slug: 'rolex-daytona',
    description: 'The ultimate racing chronograph with a 40mm Oystersteel case, black ceramic bezel, and Oyster bracelet. Cosmograph Daytona — born for the track.',
    price: 28500,
    stock: 2,
    featured: true,
    categorySlug: 'rolex',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
    ],
  },
  {
    name: 'Rolex Datejust 41',
    slug: 'rolex-datejust-41',
    description: 'The classic dress watch with a fluted bezel, Jubilee bracelet, and bright blue dial. Timeless elegance in Oystersteel.',
    price: 12500,
    stock: 2,
    featured: true,
    categorySlug: 'rolex',
    images: [
      'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&q=80',
    ],
  },
  {
    name: 'Rolex GMT-Master II',
    slug: 'rolex-gmt-master-ii',
    description: 'The pilot\'s watch with a two-tone Cerachrom bezel and independent 24-hour hand. Track three time zones simultaneously.',
    price: 15500,
    stock: 4,
    featured: false,
    categorySlug: 'rolex',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    ],
  },
  {
    name: 'Hublot Big Bang Unico',
    slug: 'hublot-big-bang-unico',
    description: 'A bold 45mm chronograph with skeletonised dial, ceramic bezel, and the manufacture Unico HUB1242 movement.',
    price: 18500,
    stock: 3,
    featured: true,
    categorySlug: 'hublot',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
    ],
  },
  {
    name: 'Hublot Classic Fusion',
    slug: 'hublot-classic-fusion',
    description: 'An elegant 45mm timepiece with titanium case, sunray satin-finished dial, and rubber strap.',
    price: 12500,
    stock: 5,
    featured: true,
    categorySlug: 'hublot',
    images: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    ],
  },
  {
    name: 'Hublot Spirit of Big Bang',
    slug: 'hublot-spirit-of-big-bang',
    description: 'A tonneau-shaped chronograph with black ceramic case, skeleton dial, and rubber strap.',
    price: 22000,
    stock: 2,
    featured: false,
    categorySlug: 'hublot',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    ],
  },
  {
    name: 'Hublot Big Bang Aero Bang',
    slug: 'hublot-big-bang-aero-bang',
    description: 'A 44mm skeletonised chronograph with microblasted black ceramic and titanium case.',
    price: 14900,
    stock: 4,
    featured: false,
    categorySlug: 'hublot',
    images: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
    ],
  },
  {
    name: 'Tissot PRX Powermatic 80',
    slug: 'tissot-prx-powermatic-80',
    description: 'A resurrected 1970s icon with a 40mm steel case, integrated bracelet, and automatic movement with 80-hour power reserve.',
    price: 695,
    stock: 10,
    featured: true,
    categorySlug: 'tissot',
    images: [
      'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&q=80',
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=600&q=80',
    ],
  },
  {
    name: 'Tissot Le Locle Powermatic 80',
    slug: 'tissot-le-locle-powermatic-80',
    description: 'An automatic dress watch with roman numerals, delicate guilloché dial, and scratch-resistant sapphire crystal.',
    price: 525,
    stock: 8,
    featured: true,
    categorySlug: 'tissot',
    images: [
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=600&q=80',
      'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&q=80',
    ],
  },
  {
    name: 'Tissot Seastar 1000',
    slug: 'tissot-seastar-1000',
    description: 'A professional dive watch with 300m water resistance, unidirectional bezel, and automatic movement.',
    price: 425,
    stock: 12,
    featured: false,
    categorySlug: 'tissot',
    images: [
      'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&q=80',
    ],
  },
  {
    name: 'Tissot Gentleman Powermatic 80',
    slug: 'tissot-gentleman-powermatic-80',
    description: 'A versatile everyday automatic with a 40mm steel case, sunray dial, and 80-hour power reserve.',
    price: 625,
    stock: 7,
    featured: false,
    categorySlug: 'tissot',
    images: [
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=600&q=80',
    ],
  },
];

// Seed categories
console.log('Seeding categories...');
for (const cat of categories) {
  const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
  if (error) console.error(`  Failed: ${cat.name} — ${error.message}`);
  else console.log(`  ✓ ${cat.name}`);
}

// Get category IDs
const { data: savedCategories } = await supabase.from('categories').select('id, slug');
const categoryMap = new Map(savedCategories?.map((c) => [c.slug, c.id]));

if (!categoryMap.size) {
  console.error('No categories found — aborting');
  process.exit(1);
}

// Seed products
console.log('\nSeeding products...');
for (const product of products) {
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', product.slug)
    .single();

  if (existing) {
    console.log(`  ○ ${product.name} (exists, skipping)`);
    continue;
  }

  const { categorySlug, ...productData } = product;
  const categoryId = categoryMap.get(categorySlug);

  if (!categoryId) {
    console.error(`  ✗ ${product.name} — category "${categorySlug}" not found`);
    continue;
  }

  const { error } = await supabase.from('products').insert({
    ...productData,
    category_id: categoryId,
  });

  if (error) console.error(`  ✗ ${product.name} — ${error.message}`);
  else console.log(`  ✓ ${product.name}`);
}

console.log('\nDone!');
