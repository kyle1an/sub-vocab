import { RouterProvider } from 'react-router-dom'
import React from 'react'
import { router } from '@/router'

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}
