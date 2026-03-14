import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="flex pt-16">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
