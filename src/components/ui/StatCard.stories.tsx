import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from './StatCard'

const ServerIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
)

const meta: Meta<typeof StatCard> = {
    title: 'UI/StatCard',
    component: StatCard,
}
export default meta

type Story = StoryObj<typeof StatCard>

export const WithPositiveChange: Story = {
    args: {
        title: 'Total Servers',
        value: 128,
        change: '12% from last month',
        changeType: 'positive',
        icon: <ServerIcon />,
    },
}

export const WithNegativeChange: Story = {
    args: {
        title: 'Critical Alerts',
        value: 3,
        change: '2 more than yesterday',
        changeType: 'negative',
        icon: <ServerIcon />,
    },
}

export const WithoutChange: Story = {
    args: {
        title: 'CPU Usage',
        value: '78%',
        icon: <ServerIcon />,
    },
}

export const WithoutIcon: Story = {
    args: {
        title: 'Memory',
        value: '16 GB',
        change: 'Stable',
        changeType: 'positive',
    },
}
