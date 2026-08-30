// // components/Admin/menu.ts
// export interface MenuItem {
//     id: string;
//     name: string;
//     href: string;
//     icon: string;
//     badgeKey?: 'chargers' | 'users' | 'sessions';
//     subItems?: MenuItem[];
// }

// export const menuItems: MenuItem[] = [
//     {
//         id: 'dashboard',
//         name: 'Dashboard',
//         href: '/dashboard',
//         icon: '📊',
//     },
//     {
//         id: 'user-management',
//         name: 'User Management',
//         href: '/users-managements',
//         icon: '👥',
//         badgeKey: 'users',
//         subItems: [
//             { id: 'all-users', name: 'All Users', href: '/users-managements', icon: '👤' },
//             { id: 'roles', name: 'Roles', href: '/users-managements/roles', icon: '🔑' },
//             { id: 'permissions', name: 'Permissions', href: '/users-managements/permissions', icon: '🛡️' },
//         ],
//     },
//     {
//         id: 'Brands',
//         name: 'Brands',
//         href: '/brands-management',
//         icon: '⚡',
//         badgeKey: 'chargers',
//     },
//     {
//         id: 'category-management',
//         name: 'Category Managements',
//         href: '/category-management',
//         icon: '⚡',
//         badgeKey: 'chargers',
//     },
//     {
//         id: 'product-management',
//         name: 'Product Managements',
//         href: '/product-management',
//         icon: '⚡',
//         badgeKey: 'chargers',
//     },
//     {
//         id: 'survey-management',
//         name: 'Survey Managements',
//         href: '/survey-management',
//         icon: '⚡',
//         badgeKey: 'chargers',
//     },
//     {
//         id: 'contacts-management',
//         name: 'Contacts Managements',
//         href: '/contacts-management',
//         icon: '⚡',
//         badgeKey: 'chargers',
//     },
//     {
//         id: 'service-management',
//         name: 'Service Managements',
//         href: '/service-management',
//         icon: '⚡',
//         badgeKey: 'chargers',
//     },
//     {
//         id: 'sessions',
//         name: 'Sessions',
//         href: '/sessions',
//         icon: '🔌',
//         badgeKey: 'sessions',
//         subItems: [
//             { id: 'active-sessions', name: 'Active Sessions', href: '/sessions/active', icon: '🟢' },
//             { id: 'session-history', name: 'History', href: '/sessions/history', icon: '📜' },
//         ],
//     },
//     {
//         id: 'reports',
//         name: 'Reports',
//         href: '/reports',
//         icon: '📈',
//         subItems: [
//             { id: 'analytics', name: 'Analytics', href: '/reports/analytics', icon: '📊' },
//             { id: 'charging-reports', name: 'Charging Reports', href: '/reports/charging', icon: '📋' },
//             { id: 'user-reports', name: 'User Reports', href: '/reports/users', icon: '👥' },
//         ],
//     },
//     {
//         id: 'settings',
//         name: 'Settings',
//         href: '/settings',
//         icon: '⚙️',
//         subItems: [
//             { id: 'general-settings', name: 'General', href: '/settings/general', icon: '⚙️' },
//             { id: 'security-settings', name: 'Security', href: '/settings/security', icon: '🔒' },
//             { id: 'notification-settings', name: 'Notifications', href: '/settings/notifications', icon: '🔔' },
//             { id: 'api-keys', name: 'API Keys', href: '/settings/api-keys', icon: '🔑' },
//         ],
//     },
// ];


// components/Admin/menu.ts
export interface MenuItem {
    id: string;
    name: string;
    href: string;
    icon: string;
    badgeKey?: 'chargers' | 'users' | 'sessions' | 'services' | 'brands' | 'products' | 'surveys' | 'contacts' | 'categories';
    subItems?: MenuItem[];
    isNew?: boolean;
}

export const menuItems: MenuItem[] = [
    // ============================================
    // DASHBOARD
    // ============================================
    {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
    },

    // ============================================
    // MANAGEMENT - Main Sections
    // ============================================
    {
        id: 'user-management',
        name: 'User Management',
        href: '/users-managements',
        icon: '👥',
        badgeKey: 'users',
        subItems: [
            { id: 'all-users', name: 'All Users', href: '/users-managements', icon: '👤' },
            { id: 'roles', name: 'Roles', href: '/users-managements/roles', icon: '🔑' },
            { id: 'permissions', name: 'Permissions', href: '/users-managements/permissions', icon: '🛡️' },
        ],
    },
    {
        id: 'category-management',
        name: 'Categories',
        href: '/category-management',
        icon: '📂',
        badgeKey: 'categories',
    },
    {
        id: 'brand-management',
        name: 'Brands',
        href: '/brands-management',
        icon: '🏷️',
        badgeKey: 'brands',
    },
    {
        id: 'product-management',
        name: 'Products',
        href: '/product-management',
        icon: '⚡',
        badgeKey: 'products',
    },
    {
        id: 'service-management',
        name: 'Services',
        href: '/service-management',
        icon: '🛠️',
        badgeKey: 'services',
    },
    {
        id: 'survey-management',
        name: 'Surveys',
        href: '/survey-management',
        icon: '📋',
        badgeKey: 'surveys',
    },
    {
        id: 'contacts-management',
        name: 'Contacts',
        href: '/contacts-management',
        icon: '📧',
        badgeKey: 'contacts',
    },
    {
        id: 'accesories-management',
        name: 'Accessories',
        href: '/accesories-management',
        icon: '🔧',
        badgeKey: 'contacts',
    },

    // ============================================
    // REPORTS & ANALYTICS
    // ============================================
    {
        id: 'reports',
        name: 'Reports',
        href: '/reports',
        icon: '📈',
        subItems: [
            { id: 'analytics', name: 'Analytics', href: '/reports/analytics', icon: '📊' },
            { id: 'charging-reports', name: 'Charging Reports', href: '/reports/charging', icon: '🔋' },
            { id: 'user-reports', name: 'User Reports', href: '/reports/users', icon: '👥' },
            { id: 'service-reports', name: 'Service Reports', href: '/reports/services', icon: '📋' },
        ],
    },

    // ============================================
    // SETTINGS
    // ============================================
    {
        id: 'settings',
        name: 'Settings',
        href: '/settings',
        icon: '⚙️',
        subItems: [
            { id: 'notification-settings', name: 'Home Page', href: '/settings/homepage', icon: '🔔' },
            { id: 'about-settings', name: 'About', href: '/settings/about', icon: 'ℹ️' },
            { id: 'faq-settings', name: 'FAQ', href: '/settings/faq', icon: '❓' },
            { id: 'terms-settings', name: 'Terms', href: '/settings/terms', icon: '📄' },
            { id: 'general-settings', name: 'General', href: '/settings/general', icon: '⚙️' },
            { id: 'security-settings', name: 'Security', href: '/settings/security', icon: '🔒' },
        ],
    },
];

// ============================================
// Helper Functions
// ============================================

// Get menu item by ID
export const getMenuItemById = (id: string): MenuItem | undefined => {
    for (const item of menuItems) {
        if (item.id === id) return item;
        if (item.subItems) {
            const found = item.subItems.find(sub => sub.id === id);
            if (found) return found;
        }
    }
    return undefined;
};

// Get all sub-items from a parent
export const getSubItems = (parentId: string): MenuItem[] => {
    const parent = menuItems.find(item => item.id === parentId);
    return parent?.subItems || [];
};

// Check if a route is active
export const isRouteActive = (href: string, currentPath: string): boolean => {
    if (href === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(href) || currentPath === href;
};

// Get active menu item
export const getActiveMenuItem = (pathname: string): MenuItem | undefined => {
    for (const item of menuItems) {
        if (pathname === item.href || pathname.startsWith(item.href)) {
            return item;
        }
        if (item.subItems) {
            const found = item.subItems.find(sub => pathname === sub.href || pathname.startsWith(sub.href));
            if (found) return found;
        }
    }
    return undefined;
};

// Get parent of a sub-item
export const getParentMenuItem = (subItemId: string): MenuItem | undefined => {
    for (const item of menuItems) {
        if (item.subItems) {
            const found = item.subItems.find(sub => sub.id === subItemId);
            if (found) return item;
        }
    }
    return undefined;
};

// Get breadcrumb items
export const getBreadcrumbs = (pathname: string): { name: string; href: string }[] => {
    const breadcrumbs: { name: string; href: string }[] = [];

    // Find the active item
    const activeItem = getActiveMenuItem(pathname);
    if (!activeItem) return [{ name: 'Dashboard', href: '/dashboard' }];

    // Find parent
    const parent = getParentMenuItem(activeItem.id);

    if (parent) {
        breadcrumbs.push({ name: parent.name, href: parent.href });
    }

    breadcrumbs.push({ name: activeItem.name, href: activeItem.href });

    return breadcrumbs;
};