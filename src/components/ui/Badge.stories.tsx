import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
    title: 'UI/Badge',
    component: Badge,
    argTypes: {
        variant: {
            control: 'select',
            options: ['success', 'warning', 'danger', 'info', 'default'],
        },
    },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Success: Story = {
    args: { children: 'Online', variant: 'success' },
}

export const Warning: Story = {
    args: { children: 'Warning', variant: 'warning' },
}

export const Danger: Story = {
    args: { children: 'Critical', variant: 'danger' },
}

export const Info: Story = {
    args: { children: 'Info', variant: 'info' },
}

export const Default: Story = {
    args: { children: 'Default', variant: 'default' },
}
