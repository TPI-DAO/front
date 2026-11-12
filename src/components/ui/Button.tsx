import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const baseClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700',
  secondary:
    'border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  ghost: 'px-3 py-2 font-medium text-indigo-600 hover:text-indigo-700',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      {...props}
    />
  )
}
