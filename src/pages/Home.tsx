import { useState, useEffect } from 'react'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { APP_VERSION } from '../constants/app'

const stats = [
    {
        title: '運行中伺服器',
        value: 128,
        change: '較上月 +12%',
        changeType: 'positive' as const,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
            </svg>
        ),
    },
    {
        title: '平均 CPU 使用率',
        value: '68%',
        change: '較昨日 -3%',
        changeType: 'positive' as const,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 004.5 8.25v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
    },
    {
        title: '記憶體用量',
        value: '74%',
        change: '較昨日 +5%',
        changeType: 'negative' as const,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
        ),
    },
    {
        title: '警報事件',
        value: 7,
        change: '較昨日 +2',
        changeType: 'negative' as const,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        ),
    },
]

const events = [
    { id: 1, server: 'web-prod-01', event: 'CPU 使用率超過 90%', status: 'danger' as const, time: '2 分鐘前' },
    { id: 2, server: 'db-prod-03', event: '磁碟空間不足 (< 10%)', status: 'warning' as const, time: '15 分鐘前' },
    { id: 3, server: 'api-prod-02', event: '服務重啟完成', status: 'success' as const, time: '32 分鐘前' },
    { id: 4, server: 'cache-prod-01', event: '記憶體使用率 85%', status: 'warning' as const, time: '1 小時前' },
    { id: 5, server: 'web-prod-04', event: '健康檢查通過', status: 'success' as const, time: '1 小時前' },
    { id: 6, server: 'lb-prod-01', event: '連線數異常增加', status: 'danger' as const, time: '2 小時前' },
    { id: 7, server: 'db-prod-01', event: '備份完成', status: 'info' as const, time: '3 小時前' },
]

const statusLabel: Record<string, string> = {
    danger: '嚴重',
    warning: '警告',
    success: '正常',
    info: '資訊',
}

export function Home() {
    const [statsData, setStatsData] = useState(stats)
    const [eventsData, setEventsData] = useState(events)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resStats = await fetch('/api/dashboard/stats')
                if (resStats.ok) {
                    const data = await resStats.json()
                    if (data && data.length > 0) setStatsData(data)
                }
            } catch (e) {
                console.warn('Failed to fetch dashboard stats, using mock data:', e)
            }

            try {
                const resEvents = await fetch('/api/dashboard/events')
                if (resEvents.ok) {
                    const data = await resEvents.json()
                    if (data && data.length > 0) setEventsData(data)
                }
            } catch (e) {
                console.warn('Failed to fetch dashboard events, using mock data:', e)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">儀表板</h1>
                <p className="mt-1 text-sm text-slate-500">系統總覽與近期事件</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((s) => (
                    <StatCard key={s.title} {...s} />
                ))}
            </div>

            {/* Recent Events Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">近期事件</h2>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">伺服器</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">事件</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">狀態</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">時間</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {eventsData.map((e) => (
                                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{e.server}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{e.event}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={e.status}>{statusLabel[e.status]}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{e.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-slate-100">
                    {eventsData.map((e) => (
                        <div key={e.id} className="px-4 py-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-900">{e.server}</span>
                                <Badge variant={e.status}>{statusLabel[e.status]}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{e.event}</p>
                            <p className="text-xs text-slate-400">{e.time}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Version */}
            <p className="text-right text-xs text-slate-400">{APP_VERSION}</p>
        </div>
    )
}
