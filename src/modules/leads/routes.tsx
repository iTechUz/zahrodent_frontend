import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const LeadsPage = lazy(() => import('./pages/LeadsPage'));

export const leadsRoutes: RouteObject[] = [
  { path: 'leads', element: <LeadsPage /> },
];
