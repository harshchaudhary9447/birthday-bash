export function verifyAdminAuth(request) {
  const adminSecret = process.env.ADMIN_PASSWORD || 'harsh2026';

  // 1. Check custom header x-admin-token
  const headerToken = request.headers.get('x-admin-token');
  if (headerToken && headerToken === adminSecret) {
    return true;
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (bearer === adminSecret) return true;
  }

  // 3. Check admin_token cookie
  const cookieToken = request.cookies?.get('admin_token')?.value;
  if (cookieToken && cookieToken === adminSecret) {
    return true;
  }

  return false;
}
