'use client'

import dynamic from 'next/dynamic'
import '../../pages/main.css'

const App = dynamic(() => import('../../pages/app'), { ssr: false })

export default function Page() {
  return <App />
}
