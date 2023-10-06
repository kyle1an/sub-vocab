import {
  createBrowserRouter,
} from 'react-router-dom'
import { RootLayout } from '@/app/layout.tsx'
import Index from '@/app/page'
import Login from '@/app/login/page'
import User from '@/app/user/layout'
import { Password } from '@/app/user/password/page'
import { UserPage } from '@/app/user/page'
import { MineLayout } from '@/app/mine/layout'
import { MinePage } from '@/app/mine/page'
import { SignUp } from '@/app/register/page'
import { Chart } from '@/app/mine/chart/page'
import { ImportPage } from '@/app/import/page'

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
