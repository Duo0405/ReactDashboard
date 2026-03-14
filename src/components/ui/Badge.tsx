import type { ReactNode } from 'react'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface BadgeProps {
    variant?: Variant
    children: ReactNode
}

const variantClasses: Record<Variant, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-red-600/20',
    info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    default: 'bg-slate-50 text-slate-700 ring-slate-600/20',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantClasses[variant]}`}
        >
            {children}
        </span>
    )
}
