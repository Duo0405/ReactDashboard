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
            const mockUsers: Record<string, { password: string; user: User }> = {
                'admin@example.com': { password: 'admin', user: { name: 'Admin', email: 'admin@example.com', role: 'admin' } },
                'user1@example.com': { password: 'user1', user: { name: 'User 1', email: 'user1@example.com', role: 'user' } },
                'user2@example.com': { password: 'user2', user: { name: 'User 2', email: 'user2@example.com', role: 'user' } },
                'user3@example.com': { password: 'user3', user: { name: 'User 3', email: 'user3@example.com', role: 'user' } },
            }
            const match = mockUsers[email]
            if (match && match.password === password) {
                const token = 'mock-jwt-token-' + Date.now()
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(match.user))
                set({ token, user: match.user })
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
