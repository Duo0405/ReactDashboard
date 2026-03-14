import type { Meta, StoryObj } from '@storybook/react'
import { ServerRoom3D } from './ServerRoom3D'
import type { ServerData } from '../../types/dashboard'

const mockServers: ServerData[] = [
    { id: 's1', name: 'web-prod-01', status: 'online', cpu: 45, ram: 62, disk: 78, uptime: '45 days' },
    { id: 's2', name: 'web-prod-02', status: 'online', cpu: 38, ram: 55, disk: 65, uptime: '45 days' },
    { id: 's3', name: 'api-prod-01', status: 'warning', cpu: 82, ram: 78, disk: 90, uptime: '12 days' },
    { id: 's4', name: 'db-prod-01', status: 'online', cpu: 55, ram: 70, disk: 45, uptime: '90 days' },
    { id: 's5', name: 'cache-prod-01', status: 'critical', cpu: 95, ram: 92, disk: 88, uptime: '3 days' },
    { id: 's6', name: 'lb-prod-01', status: 'online', cpu: 22, ram: 35, disk: 30, uptime: '120 days' },
]

const meta: Meta<typeof ServerRoom3D> = {
    title: 'Visualization/ServerRoom3D',
    component: ServerRoom3D,
    parameters: {
        layout: 'padded',
    },
    argTypes: {
        selectedServerId: {
            control: 'select',
            options: [null, ...mockServers.map((s) => s.id)],
        },
        height: {
            control: { type: 'range', min: 300, max: 800, step: 50 },
        },
    },
}
export default meta

type Story = StoryObj<typeof ServerRoom3D>

export const Default: Story = {
    args: {
        servers: mockServers,
        selectedServerId: 's1',
        height: 480,
    },
}

export const CriticalServer: Story = {
    args: {
        servers: mockServers,
        selectedServerId: 's5',
        height: 480,
    },
}

export const NoneSelected: Story = {
    args: {
        servers: mockServers,
        selectedServerId: null,
        height: 480,
    },
}

export const CompactView: Story = {
    args: {
        servers: mockServers.slice(0, 3),
        selectedServerId: 's1',
        height: 350,
    },
}
