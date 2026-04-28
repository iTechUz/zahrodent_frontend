import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const DoctorDetailsPage = lazy(() => import('./pages/DoctorDetailsPage'));

export const doctorRoutes: RouteObject[] = [
  { path: 'doctors', element: <DoctorsPage /> },
  { path: 'doctors/:id', element: <DoctorDetailsPage /> },
];
