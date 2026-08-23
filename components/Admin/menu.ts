// components/Admin/menu.ts
export interface MenuItem {
    name: string;
    href: string;
    icon: string;
    badge?: string;
    subItems?: MenuItem[];
}

export const menuItems: MenuItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
    },
    {
        name: 'EV Chargers',
        href: '/ev-chargers',
        icon: '⚡',
        badge: '12',
    },
    {
        name: 'Users',
        href: '/users',
        icon: '👤',
        badge: '156',
    },
    {
        name: 'Sessions',
        href: '/sessions',
        icon: '🔌',
        badge: '8',
    },
    {
        name: 'Reports',
        href: '/reports',
        icon: '📈',
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: '⚙️',
    },
];