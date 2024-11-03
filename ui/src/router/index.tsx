import {
  createBrowserRouter,
} from 'react-router'

import { ImportPage } from '@/pages/import/page'
import { RootLayout } from '@/pages/layout'
import { Login } from '@/pages/login/page'
import { Chart } from '@/pages/mine/chart/page'
import { MineLayout } from '@/pages/mine/layout'
import { VocabularyPage } from '@/pages/mine/vocabulary/page'
import { Home } from '@/pages/page'
import { Register } from '@/pages/register/page'
import { ResetPassword } from '@/pages/reset-password/page'
import { UpdatePassword } from '@/pages/update-password/page'
import { User } from '@/pages/user/layout'
import { Password } from '@/pages/user/password/page'
import { ProfilePage } from '@/pages/user/profile/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/mine',
        element: <MineLayout />,
        children: [
          {
            path: '/mine/vocabulary',
            element: <VocabularyPage />,
          },
          {
            path: '/mine/chart',
            element: <Chart />,
          },
        ],
      },
      {
        path: '/import',
        element: <ImportPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/update-password',
        element: <UpdatePassword />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/user',
        element: <User />,
        children: [
          {
            path: '/user/profile',
            element: <ProfilePage />,
          },
          {
            path: '/user/password',
            element: <Password />,
          },
        ],
      },
    ],
  },
])
