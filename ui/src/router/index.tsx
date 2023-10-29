import {
  Route,
  createBrowserRouter, createRoutesFromElements,
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

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<RootLayout />}
    >
      <Route
        index
        element={<Index />}
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
        element={<SignUp />}
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
