import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));

export const subscriptionsRoutes: RouteObject[] = [
  {
    path: 'subscriptions',
    element: <SubscriptionsPage />,
  },
];
