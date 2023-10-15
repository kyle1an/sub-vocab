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
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: Index,
      },
      {
        path: '/mine',
        Component: MineLayout,
        children: [
          {
            path: '/mine/',
            Component: MinePage,
          },
          {
            path: '/mine/chart/',
            Component: Chart,
          },
        ],
      },
      {
        path: '/import',
        Component: ImportPage,
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/register',
        Component: SignUp,
      },
      {
        path: '/user',
        Component: User,
        children: [
          {
            path: '/user/',
            Component: UserPage,
          },
          {
            path: '/user/password',
            Component: Password,
          },
        ],
      },
    ],
  },
])
