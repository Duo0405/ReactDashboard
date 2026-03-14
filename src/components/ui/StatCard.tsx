import type { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    change?: string
    changeType?: 'positive' | 'negative'
    icon?: ReactNode
}

export function StatCard({
    title,
    value,
    change,
    changeType = 'positive',
    icon,
}: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 transition-shadow hover:shadow-md">
            {icon && (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                {change && (
                    <p
                        className={`mt-1 text-sm font-medium ${changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                            }`}
                    >
                        {changeType === 'positive' ? '↑' : '↓'} {change}
                    </p>
                )}
            </div>
        </div>
    )
}
