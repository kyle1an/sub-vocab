import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './main.css'
import './i18n'

export function App() {
  return (
    <RouterProvider router={router} />
  )
}
