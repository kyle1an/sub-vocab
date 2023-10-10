import {
  createBrowserRouter,
} from 'react-router-dom'
import { RootLayout } from '@/pages/layout'
import Index from '@/pages/page'
import Login from '@/pages/login/page'
import User from '@/pages/user/layout'
import { Password } from '@/pages/user/password/page'
import { UserPage } from '@/pages/user/page'
import { MineLayout } from '@/pages/mine/layout'
import { MinePage } from '@/pages/mine/page'
import { SignUp } from '@/pages/register/page'
import { Chart } from '@/pages/mine/chart/page'
import { ImportPage } from '@/pages/import/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Index />,
      },
      {
        path: '/mine',
        element: <MineLayout />,
        children: [
          {
            path: '/mine/',
            element: <MinePage />,
          },
          {
            path: '/mine/chart/',
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
        path: '/register',
        element: <SignUp />,
      },
      {
        path: '/user',
        element: <User />,
        children: [
          {
            path: '/user/',
            element: <UserPage />,
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
