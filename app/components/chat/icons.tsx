import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function iconClasses(className?: string) {
  return ['size-5', className].filter(Boolean).join(' ')
}

export function PlusIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
      className={iconClasses(className)}
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export function MessageIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
      className={iconClasses(className)}
    >
      <path
        d="M5 7c0-1.657 1.79-3 4-3h6c2.21 0 4 1.343 4 3v5c0 1.657-1.79 3-4 3h-2l-3 4v-4H9c-2.21 0-4-1.343-4-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
      className={iconClasses(className)}
    >
      <path d="M15.5 15.5 20 20" strokeLinecap="round" />
      <circle cx={11} cy={11} r={6} />
    </svg>
  )
}

export function VideoIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      {...props}
      className={iconClasses(className)}
    >
      <rect x={3} y={5} width={18} height={14} rx={3} />
      <path d="m15 12-4 3V9z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function BroadcastIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
      className={iconClasses(className)}
    >
      <circle cx={12} cy={12} r={3} />
      <path
        d="M5.5 5.5a9 9 0 0 0 0 12.73M18.5 5.5a9 9 0 0 1 0 12.73"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PaperclipIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
      className={iconClasses(className)}
    >
      <path
        d="M16.5 6.5 8.75 14.25a2.5 2.5 0 1 0 3.54 3.54l6.01-6.01a4 4 0 0 0-5.66-5.66L6.7 11.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SendIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
      className={iconClasses(className)}
    >
      <path d="m4 4 16 8-16 8 4.5-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ImageIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      {...props}
      className={iconClasses(className)}
    >
      <rect x={4} y={5} width={16} height={14} rx={2} />
      <circle cx={9} cy={10} r={2} />
      <path
        d="m7 17 3.5-3.5L14 17l3-3 2 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DotsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props} className={iconClasses(className)}>
      <circle cx={5} cy={12} r={2} />
      <circle cx={12} cy={12} r={2} />
      <circle cx={19} cy={12} r={2} />
    </svg>
  )
}

