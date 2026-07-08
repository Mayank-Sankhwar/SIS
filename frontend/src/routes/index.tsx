import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import LoginPage from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ChangePasswordPage from '../pages/auth/ChangePasswordPage'
import BlankPage from '../pages/BlankPage'
import DashboardPage from '../pages/DashboardPage'
import ErrorPage from '../pages/ErrorPage'
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
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <AppLayout />,
        errorElement: <ErrorPage />,
        children: [{ index: true, element: <DashboardPage /> }],
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{ index: true, element: <BlankPage /> }],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const routerFallbackElement = <LoadingSpinner />
