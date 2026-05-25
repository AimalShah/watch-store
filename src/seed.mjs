// Seed script — run with: node src/seed.mjs
// Populates the database with placeholder watches and categories

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
  { name: 'Omega', slug: 'omega' },
  { name: 'Tag Heuer', slug: 'tag-heuer' },
  { name: 'Seiko', slug: 'seiko' },
  { name: 'Citizen', slug: 'citizen' },
];

const watches = [
  {
    name: 'Rolex Submariner Date',
    slug: 'rolex-submariner-date',
    description: 'The iconic diver\'s watch with a unidirectional rotatable bezel and Oystersteel construction.',
    price: 10500,
    stock: 3,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cfbe?w=600&q=80',
    ],
  },
  {
    name: 'Omega Speedmaster Moonwatch',
    slug: 'omega-speedmaster-moonwatch',
    description: 'The legendary chronograph worn on the moon. Hesalite crystal with manual-winding movement.',
    price: 7200,
    stock: 5,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
      'https://images.unsplash.com/photo-1589137279397-1520e0e4e3d9?w=600&q=80',
    ],
  },
  {
    name: 'Tag Heuer Carrera',
    slug: 'tag-heuer-carrera',
    description: 'A racing-inspired chronograph with a 44mm stainless steel case and automatic movement.',
    price: 5400,
    stock: 4,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1614164185128-e4ec99c2c0e8?w=600&q=80',
      'https://images.unsplash.com/photo-1612036782180-6f08205f232b?w=600&q=80',
    ],
  },
  {
    name: 'Seiko Presage Cocktail Time',
    slug: 'seiko-presage-cocktail-time',
    description: 'Inspired by classic cocktails, this timepiece features a stunning textured dial and automatic movement.',
    price: 450,
    stock: 8,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1589913278995-82c7ae8fa70f?w=600&q=80',
      'https://images.unsplash.com/photo-1623998021446-45f68c0e5b61?w=600&q=80',
    ],
  },
  {
    name: 'Rolex Daytona',
    slug: 'rolex-daytona',
    description: 'The ultimate racing chronograph with a 40mm Oystersteel case and Oyster bracelet.',
    price: 28500,
    stock: 2,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cfbe?w=600&q=80',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
    ],
  },
  {
    name: 'Omega Seamaster Diver 300M',
    slug: 'omega-seamaster-diver-300m',
    description: 'A professional diver\'s watch with helium escape valve and ceramic bezel.',
    price: 5800,
    stock: 4,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
      'https://images.unsplash.com/photo-1589137279397-1520e0e4e3d9?w=600&q=80',
    ],
  },
  {
    name: 'Tag Heuer Monaco',
    slug: 'tag-heuer-monaco',
    description: 'The iconic square-cased chronograph made famous by Steve McQueen.',
    price: 6750,
    stock: 3,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1614164185128-e4ec99c2c0e8?w=600&q=80',
      'https://images.unsplash.com/photo-1612036782180-6f08205f232b?w=600&q=80',
    ],
  },
  {
    name: 'Seiko 5 Sports GMT',
    slug: 'seiko-5-sports-gmt',
    description: 'An affordable GMT watch with 24-jewel automatic movement and 100m water resistance.',
    price: 375,
    stock: 12,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1589913278995-82c7ae8fa70f?w=600&q=80',
      'https://images.unsplash.com/photo-1623998021446-45f68c0e5b61?w=600&q=80',
    ],
  },
  {
    name: 'Citizen Promaster Diver',
    slug: 'citizen-promaster-diver',
    description: 'Eco-drive dive watch with ISO-rated 200m water resistance and luminous hands.',
    price: 375,
    stock: 10,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    ],
  },
  {
    name: 'Rolex Datejust 41',
    slug: 'rolex-datejust-41',
    description: 'The classic dress watch with a fluted bezel and Jubilee bracelet in Oystersteel.',
    price: 12500,
    stock: 2,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
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
const { data: savedCategories } = await supabase.from('categories').select('id, name, slug');
const categoryMap = new Map(savedCategories?.map((c) => [c.slug, c.id]));

// Seed products
console.log('\nSeeding products...');
for (const watch of watches) {
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', watch.slug)
    .single();

  if (existing) {
    console.log(`  ○ ${watch.name} (exists, skipping)`);
    continue;
  }

  const { error } = await supabase.from('products').insert({
    ...watch,
    category_id: categoryMap.get(watch.slug.split('-')[0]) || categoryMap.get('rolex'),
  });

  if (error) console.error(`  ✗ ${watch.name} — ${error.message}`);
  else console.log(`  ✓ ${watch.name}`);
}

console.log('\nDone!');
