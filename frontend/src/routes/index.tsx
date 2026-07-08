import { createBrowserRouter } from 'react-router-dom'

import { APP_ROUTES } from '../constants/routes'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import BlankPage from '../pages/BlankPage'
import ErrorPage from '../pages/ErrorPage'
import NotFoundPage from '../pages/NotFoundPage'
import LoadingSpinner from '../components/Loading/LoadingSpinner'

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.home,
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <BlankPage />,
      },
    ],
  },
  {
    path: APP_ROUTES.auth,
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <BlankPage />,
      },
    ],
  },
  {
    path: APP_ROUTES.notFound,
    element: <NotFoundPage />,
  },
])

export const routerFallbackElement = <LoadingSpinner />
