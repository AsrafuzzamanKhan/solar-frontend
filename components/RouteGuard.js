import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from '../lib/api';
import { getRouteRule, isAllowed } from '../lib/routeAccess';
import { PageSkeleton } from './Skeleton';

// Blocks a protected page from ever painting for a visitor who pastes/bookmarks
// its link without the right session — including between two client-side
// navigations, where `checkedFor` (not just a boolean) stops a one-frame flash
// of the new page's real content before this effect has re-verified it.
export default function RouteGuard({ children }) {
  const router = useRouter();
  const [checkedFor, setCheckedFor] = useState(null);

  useEffect(() => {
    const rule = getRouteRule(router.pathname);
    if (!rule) {
      setCheckedFor(router.pathname);
      return;
    }

    if (!isAllowed(rule, getSession())) {
      router.replace('/login');
      return; // leave checkedFor unset — stays on the skeleton until we navigate away
    }
    setCheckedFor(router.pathname);
  }, [router, router.pathname]);

  const rule = getRouteRule(router.pathname);
  const blocked = rule && checkedFor !== router.pathname;
  return blocked ? <PageSkeleton /> : children;
}
