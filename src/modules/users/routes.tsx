import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const UsersPage = lazy(() => import('./pages/UsersPage'));

export const userRoutes: RouteObject[] = [
  {
    path: 'users',
    element: <UsersPage />,
  },
];
