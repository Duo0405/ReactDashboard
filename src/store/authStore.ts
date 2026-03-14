import { create } from 'zustand'

interface User {
    name: string
    email: string
    role: string
}

interface AuthState {
    token: string | null
    user: User | null
    login: (email: string, password: string) => boolean
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null,

    login: (email, password) => {
        if (email === 'admin@example.com' && password === 'admin') {
            const user: User = { name: 'Admin', email, role: 'admin' }
            const token = 'mock-jwt-token-' + Date.now()
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            set({ token, user })
            return true
        }
        return false
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null })
    },
}))
