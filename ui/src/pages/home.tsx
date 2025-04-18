import { Outlet } from 'react-router'

export default function Home() {
  return (
    <div className="m-auto h-[calc(100svh-4px*14)] w-full max-w-screen-xl px-5 pb-7">
      <Outlet />
    </div>
  )
}
