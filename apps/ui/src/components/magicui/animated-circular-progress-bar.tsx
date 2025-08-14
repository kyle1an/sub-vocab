import { cn } from '@/lib/utils'

interface AnimatedCircularProgressBarProps {
  max?: number
  min?: number
  value: number
  className?: string
}

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  className,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45
  const percentPx = circumference / 100
  const currentPercent = Math.round(((value - min) / (max - min)) * 100)
  const strokeWidth = 22
  const newRadius = 50 - (strokeWidth / 2)

  return (
    <div
      className={cn('relative size-40 text-2xl font-semibold [--stroke-primary:rgb(79_70_229)] [--stroke-secondary:rgba(0,0,0,0.1)]', className)}
      style={
        {
          '--circle-size': '100px',
          '--circumference': circumference,
          '--percent-to-px': `${percentPx}px`,
          '--gap-percent': '5',
          '--offset-factor': '0',
          '--transition-length': '1s',
          '--transition-step': '200ms',
          '--delay': '0s',
          '--percent-to-deg': '3.6deg',
          transform: 'translateZ(0)',
        }
      }
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        {currentPercent <= 90 && currentPercent >= 0 && (
          <circle
            cx="50"
            cy="50"
            r={newRadius}
            strokeWidth={strokeWidth}
            strokeDashoffset="-10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="[stroke:var(--stroke-secondary)] opacity-100"
            style={
              {
                '--stroke-percent': 90 - currentPercent - 20,
                '--offset-factor-secondary': 'calc(1 - var(--offset-factor))',
                strokeDasharray:
                  'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
                transform:
                  'rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)',
                transition: 'all var(--transition-length) ease var(--delay)',
                transformOrigin:
                  'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
              }
            }
          />
        )}
        <circle
          cx="50"
          cy="50"
          r={newRadius}
          strokeWidth={strokeWidth}
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke:var(--stroke-primary)] opacity-100"
          style={
            {
              '--stroke-percent': currentPercent,
              strokeDasharray:
                'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
              transition:
                'var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)',
              transitionProperty: 'stroke-dasharray,transform',
              transform:
                'rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))',
              transformOrigin:
                'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
            }
          }
        />
      </svg>
      <span
        data-current-value={currentPercent}
        className="absolute inset-0 m-auto size-fit animate-in delay-[var(--delay)] duration-[var(--transition-length)] ease-linear fade-in"
      >
        {currentPercent}
      </span>
    </div>
  )
}
