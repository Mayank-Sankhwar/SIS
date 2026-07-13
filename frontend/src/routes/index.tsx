import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import BlankPage from '../pages/BlankPage'
import ErrorPage from '../pages/ErrorPage'
import NotFoundPage from '../pages/NotFoundPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'
import LoadingSpinner from '../components/Loading/LoadingSpinner'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ChangePasswordPage = lazy(() => import('../pages/auth/ChangePasswordPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const DiscomsPage = lazy(() => import('../pages/hierarchy/DiscomsPage'))
const ZonesPage = lazy(() => import('../pages/hierarchy/ZonesPage'))
const VerticalsPage = lazy(() => import('../pages/hierarchy/VerticalsPage'))
const SubVerticalsPage = lazy(() => import('../pages/hierarchy/SubVerticalsPage'))
const SubstationsPage = lazy(() => import('../pages/assets/SubstationsPage'))
const IncomingSourcesPage = lazy(() => import('../pages/equipment/IncomingSourcesPage'))
const OutgoingFeedersPage = lazy(() => import('../pages/equipment/OutgoingFeedersPage'))
const TransformersPage = lazy(() => import('../pages/equipment/TransformersPage'))
const LightningArrestersPage = lazy(() => import('../pages/equipment/LightningArrestersPage'))
const BatteryBanksPage = lazy(() => import('../pages/equipment/BatteryBanksPage'))
const CapacitorBanksPage = lazy(() => import('../pages/equipment/CapacitorBanksPage'))
const ExcelImportPage = lazy(() => import('../pages/imports/ExcelImportPage'))
const UsersPage = lazy(() => import('../pages/admin/UsersPage'))
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'))

const withSuspense = (element: React.ReactElement) => <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: withSuspense(<LoginPage />) }],
  },
  {
    path: '/forgot-password',
    element: <AuthLayout />,
    children: [{ index: true, element: withSuspense(<ForgotPasswordPage />) }],
  },
  {
    path: '/change-password',
    element: <AuthLayout />,
    children: [{ index: true, element: withSuspense(<ChangePasswordPage />) }],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <BlankPage /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: 'hierarchy/discoms', element: withSuspense(<DiscomsPage />) },
          { path: 'hierarchy/zones', element: withSuspense(<ZonesPage />) },
          { path: 'hierarchy/verticals', element: withSuspense(<VerticalsPage />) },
          { path: 'hierarchy/sub-verticals', element: withSuspense(<SubVerticalsPage />) },
          { path: 'assets/substations', element: withSuspense(<SubstationsPage />) },
          { path: 'assets/incoming-sources', element: withSuspense(<IncomingSourcesPage />) },
          { path: 'assets/outgoing-feeders', element: withSuspense(<OutgoingFeedersPage />) },
          { path: 'assets/transformers', element: withSuspense(<TransformersPage />) },
          { path: 'assets/lightning-arresters', element: withSuspense(<LightningArrestersPage />) },
          { path: 'assets/battery-banks', element: withSuspense(<BatteryBanksPage />) },
          { path: 'assets/capacitor-banks', element: withSuspense(<CapacitorBanksPage />) },
          { path: 'imports/excel', element: withSuspense(<ExcelImportPage />) },
          { path: 'imports/excel-upload', element: withSuspense(<ExcelImportPage />) },
          { path: 'reports', element: withSuspense(<ReportsPage />) },
          { path: 'admin/users', element: withSuspense(<UsersPage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const routerFallbackElement = <LoadingSpinner />
