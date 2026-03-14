import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '../pages/Login'
import { Home } from '../pages/Home'
import { HostStatus3D } from '../pages/HostStatus3D'
import { AccountSettings } from '../pages/AccountSettings'
import { Region } from '../pages/Region'

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { path: '/', element: <Home /> },
                    { path: '/host-status', element: <HostStatus3D /> },
                    { path: '/region', element: <Region /> },
                    { path: '/account-settings', element: <AccountSettings /> },
                ],
            },
        ],
    },
])
