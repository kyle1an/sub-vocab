import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './main.css'
import './i18n'

export function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
