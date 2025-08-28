import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

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
          <Button
            variant="outline"
            className="p-0 text-xs whitespace-nowrap"
            size="sm"
          >
            <Link
              to="/login"
              className="flex size-full items-center px-3"
            >
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
