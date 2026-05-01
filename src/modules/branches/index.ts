import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const BranchesPage = lazy(() => import('./pages/BranchesPage'));

export const branchesRoutes: RouteObject[] = [
  {
    path: 'branches',
    element: <BranchesPage />,
  },
];
