import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import SubstationsPage from '../pages/assets/SubstationsPage'
import LoginPage from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ChangePasswordPage from '../pages/auth/ChangePasswordPage'
import BlankPage from '../pages/BlankPage'
import DashboardPage from '../pages/DashboardPage'
import ErrorPage from '../pages/ErrorPage'
import BatteryBanksPage from '../pages/equipment/BatteryBanksPage'
import CapacitorBanksPage from '../pages/equipment/CapacitorBanksPage'
import IncomingSourcesPage from '../pages/equipment/IncomingSourcesPage'
import LightningArrestersPage from '../pages/equipment/LightningArrestersPage'
import OutgoingFeedersPage from '../pages/equipment/OutgoingFeedersPage'
import TransformersPage from '../pages/equipment/TransformersPage'
import DiscomsPage from '../pages/hierarchy/DiscomsPage'
import SubVerticalsPage from '../pages/hierarchy/SubVerticalsPage'
import VerticalsPage from '../pages/hierarchy/VerticalsPage'
import ZonesPage from '../pages/hierarchy/ZonesPage'
import ExcelImportPage from '../pages/imports/ExcelImportPage'
import NotFoundPage from '../pages/NotFoundPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'
import LoadingSpinner from '../components/Loading/LoadingSpinner'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/forgot-password',
    element: <AuthLayout />,
    children: [{ index: true, element: <ForgotPasswordPage /> }],
  },
  {
    path: '/change-password',
    element: <AuthLayout />,
    children: [{ index: true, element: <ChangePasswordPage /> }],
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
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'hierarchy/discoms', element: <DiscomsPage /> },
          { path: 'hierarchy/zones', element: <ZonesPage /> },
          { path: 'hierarchy/verticals', element: <VerticalsPage /> },
          { path: 'hierarchy/sub-verticals', element: <SubVerticalsPage /> },
          { path: 'assets/substations', element: <SubstationsPage /> },
          { path: 'assets/incoming-sources', element: <IncomingSourcesPage /> },
          { path: 'assets/outgoing-feeders', element: <OutgoingFeedersPage /> },
          { path: 'assets/transformers', element: <TransformersPage /> },
          { path: 'assets/lightning-arresters', element: <LightningArrestersPage /> },
          { path: 'assets/battery-banks', element: <BatteryBanksPage /> },
          { path: 'assets/capacitor-banks', element: <CapacitorBanksPage /> },
          { path: 'imports/excel', element: <ExcelImportPage /> },
          { path: 'imports/excel-upload', element: <ExcelImportPage /> },
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
