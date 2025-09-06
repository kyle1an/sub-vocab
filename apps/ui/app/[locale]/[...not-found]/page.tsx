// https://github.com/vercel/next.js/discussions/61823#discussioncomment-8410582
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold">404</h1>
      <p>This page could not be found.</p>
    </div>
  )
}
