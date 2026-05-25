import { defineMiddleware } from 'astro/middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

const ADMIN_LOGIN = '/admin/login';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  if (!url.pathname.startsWith('/admin')) {
    return next();
  }

  if (url.pathname === ADMIN_LOGIN) {
    return next();
  }

  const supabase = createSupabaseServerClient(cookies);
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return redirect(ADMIN_LOGIN);
  }

  return next();
});
