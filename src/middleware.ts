import { defineMiddleware } from 'astro/middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

const ADMIN_LOGIN = '/admin/login';
const PROTECTED_PREFIXES = ['/admin', '/api/admin'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies, redirect } = context;

  const isProtected = PROTECTED_PREFIXES.some((p) => url.pathname.startsWith(p));

  if (!isProtected) {
    return next();
  }

  const supabase = createSupabaseServerClient(request, cookies);
  const { data, error } = await supabase.auth.getUser();

  if (url.pathname === ADMIN_LOGIN) {
    if (data.user) {
      return redirect('/admin');
    }
    return next();
  }

  if (error || !data.user) {
    return redirect(ADMIN_LOGIN);
  }

  return next();
});
