'use client'

import { ToastProvider, ToastViewport, Toast } from './toast'

export { ToastProvider, ToastViewport, Toast }

export function Toaster({ className }: { className?: string }) {
  return (
    <ToastViewport className={className} />
  )
}
