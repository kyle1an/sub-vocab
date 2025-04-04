import {
  createBrowserRouter,
} from 'react-router'

import Home from '@/pages/home'
import AboutPage from '@/pages/import/page'
import RootLayout from '@/pages/layout'
import Login from '@/pages/login/page'
import Chart from '@/pages/mine/chart/page'
import MineLayout from '@/pages/mine/layout'
import VocabularyPage from '@/pages/mine/vocabulary/page'
import ResizeVocabularyPanel from '@/pages/page'
import Register from '@/pages/register/page'
import ResetPassword from '@/pages/reset-password/page'
import Subtitles from '@/pages/subtitles/page'
import UpdatePassword from '@/pages/update-password/page'
import User from '@/pages/user/layout'
import Password from '@/pages/user/password/page'
import ProfilePage from '@/pages/user/profile/page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: Home,
        children: [
          {
            path: '/',
            Component: ResizeVocabularyPanel,
          },
          {
            path: '/subtitles',
            Component: Subtitles,
          },
        ],
      },
      {
        path: '/mine',
        Component: MineLayout,
        children: [
          {
            path: '/mine/vocabulary',
            Component: VocabularyPage,
          },
          {
            path: '/mine/chart',
            Component: Chart,
          },
        ],
      },
      {
        path: '/about',
        Component: AboutPage,
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/reset-password',
        Component: ResetPassword,
      },
      {
        path: '/update-password',
        Component: UpdatePassword,
      },
      {
        path: '/register',
        Component: Register,
      },
      {
        path: '/user',
        Component: User,
        children: [
          {
            path: '/user/profile',
            Component: ProfilePage,
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
