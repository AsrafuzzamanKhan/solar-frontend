// Client-side route rules, keyed by Next.js route pattern (router.pathname — e.g.
// '/orders/[id]', not the resolved URL). `true` means "any logged-in user"; an
// array restricts to those roles. Checked by <RouteGuard> on every navigation,
// including a cold load from a pasted/bookmarked link.
//
// This is a UX guard, not the security boundary — every one of these pages only
// works because its API calls carry a JWT the backend independently verifies
// (verifyToken / requirePermission in backend/middleware/auth.js). Someone who
// bypasses this guard entirely still can't get real data out of the API.
export const ROUTE_RULES = {
  '/dashboard': true,
  '/checkout': true,
  '/orders/[id]': true,
  '/partner/dashboard': ['partner'],
  '/admin': ['admin'],
};

export function getRouteRule(pathname) {
  return ROUTE_RULES[pathname];
}

export function isAllowed(rule, user) {
  if (!rule) return true;
  if (!user) return false;
  return rule === true || rule.includes(user.role);
}
