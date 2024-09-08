import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'

import { ImportPage } from '@/pages/import/page'
import { RootLayout } from '@/pages/layout'
import { Login } from '@/pages/login/page'
import { Chart } from '@/pages/mine/chart/page'
import { MineLayout } from '@/pages/mine/layout'
import { MinePage } from '@/pages/mine/page'
import { Home } from '@/pages/page'
import { Register } from '@/pages/register/page'
import { User } from '@/pages/user/layout'
import { UserPage } from '@/pages/user/page'
import { Password } from '@/pages/user/password/page'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<RootLayout />}
    >
      <Route
        index
        element={<Home />}
      />
      <Route
        path="/mine"
        element={<MineLayout />}
      >
        <Route
          index
          element={<MinePage />}
        />
        <Route
          path="/mine/chart/"
          element={<Chart />}
        />
      </Route>
      <Route
        path="/import"
        element={<ImportPage />}
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />
      <Route
        path="/user"
        element={<User />}
      >
        <Route
          index
          element={<UserPage />}
        />
        <Route
          path="/user/password"
          element={<Password />}
        />
      </Route>
    </Route>,
  ),
)
