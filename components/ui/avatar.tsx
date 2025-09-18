import * as React from 'react'

export function Avatar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground ${className}`}
    >
      {children}
    </div>
  )
}

export function AvatarFallback({
  children,
}: {
  children: React.ReactNode
}) {
  return <span className="text-sm font-medium">{children}</span>
}
