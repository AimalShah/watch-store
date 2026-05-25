import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../lib/supabase-server';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return new Response(JSON.stringify({ url: publicUrl.publicUrl }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
