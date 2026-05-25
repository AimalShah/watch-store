import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const body = await request.json();

  if (!body.name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
  }

  const updates: Record<string, string> = { name: body.name };
  if (body.slug) {
    updates.slug = body.slug;
  } else if (body.name) {
    updates.slug = slugify(body.name);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', params.id);

  if (count && count > 0) {
    return new Response(
      JSON.stringify({ error: 'Cannot delete category with existing products' }),
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', params.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
