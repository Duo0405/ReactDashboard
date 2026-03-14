import { create } from 'zustand'

interface User {
    name: string
    email: string
    role: string
}

interface AuthState {
    token: string | null
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null,

    login: async (email, password) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            if (!res.ok) throw new Error('API request failed')
            const data = await res.json()
            const { token, user } = data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            set({ token, user })
            return true
        } catch (error) {
            console.warn('API login failed, falling back to mock data', error)
            // Fallback to mock logic
            if (email === 'admin@example.com' && password === 'admin') {
                const user: User = { name: 'Admin', email, role: 'admin' }
                const token = 'mock-jwt-token-' + Date.now()
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                set({ token, user })
                return true
            }
            return false
        }
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null })
    },
}))
