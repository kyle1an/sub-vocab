import { Link } from 'react-router-dom'
import { Button } from './ui/button'

export function LoginToast() {
  return (
    <div className="flex w-full flex-col gap-1">
      <h2 className="font-bold">
        Login required
      </h2>
      <div className="flex flex-row justify-between">
        <div>
          Please log in to mark words.
        </div>
        <div className="flex items-end">
          <Link
            to="/login"
          >
            <Button
              variant="outline"
              className="whitespace-nowrap"
              size="sm"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
