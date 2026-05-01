import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const BranchDetailsPage = lazy(() => import('./pages/BranchDetailsPage'));

export const branchesRoutes: RouteObject[] = [
  {
    path: 'branches',
    element: <BranchesPage />,
  },
  {
    path: 'branches/:id',
    element: <BranchDetailsPage />,
  },
];
