
export type BadgeKey =
    | 'users'
    | 'products'
    | 'categories'
    | 'brands'
    | 'accessories'
    | 'services'
    | 'solutions'
    | 'surveys'
    | 'contacts'
    | 'trainings'
    | 'chargers'
    | 'sessions';

export interface MenuItem {
    id: string;
    name: string;
    href: string;
    icon: string;
    badgeKey?: BadgeKey;
    subItems?: MenuItem[];
    isNew?: boolean;
}

export const menuItems: MenuItem[] = [
    // ============================================
    // OVERVIEW
    // ============================================
    {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
    },

    // ============================================
    // USER & ACCESS CONTROL
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

    // ============================================
    // PRODUCT CATALOG & INVENTORY
    // ============================================
    {
        id: 'catalog-management',
        name: 'Catalog & Products',
        href: '/product-management',
        icon: '⚡',
        badgeKey: 'products',
        subItems: [
            { id: 'product-list', name: 'All Products', href: '/product-management', icon: '📦', badgeKey: 'products' },
            { id: 'category-management', name: 'Categories', href: '/category-management', icon: '📂', badgeKey: 'categories' },
            { id: 'brand-management', name: 'Brands', href: '/brands-management', icon: '🏷️', badgeKey: 'brands' },
            { id: 'accessories-management', name: 'Accessories', href: '/accessories-management', icon: '🔩', badgeKey: 'accessories' },
        ],
    },

    // ============================================
    // SERVICES & SOLUTIONS
    // ============================================
    {
        id: 'services-solutions-group',
        name: 'Services & Solutions',
        href: '/service-management',
        icon: '🛠️',
        badgeKey: 'services',
        subItems: [
            { id: 'service-management', name: 'Services', href: '/service-management', icon: '🔧', badgeKey: 'services' },
            { id: 'solutions-management', name: 'Solutions', href: '/solutions-management', icon: '💡', badgeKey: 'solutions' },
            { id: 'industries-management', name: 'Industries', href: '/industries-management', icon: '🏭' },
        ],
    },

    // ============================================
    // TRAINING & ACADEMY
    // ============================================
    {
        id: 'training-group',
        name: 'Training & Courses',
        href: '/training-management',
        icon: '🎓',
        badgeKey: 'trainings',
        subItems: [
            { id: 'training-management', name: 'All Programs', href: '/training-management', icon: '📚', badgeKey: 'trainings' },
            { id: 'training-category-management', name: 'Training Categories', href: '/training-category-management', icon: '🗂️' },
        ],
    },

    // ============================================
    // ENGAGEMENT & INQUIRIES
    // ============================================
    {
        id: 'contacts-management',
        name: 'Contacts & Inquiries',
        href: '/contacts-management',
        icon: '📧',
        badgeKey: 'contacts',
    },
    {
        id: 'survey-management',
        name: 'Surveys & Feedback',
        href: '/survey-management',
        icon: '📋',
        badgeKey: 'surveys',
    },

    // ============================================
    // SESSIONS / OPERATIONS (EV / IOT)
    // ============================================
    {
        id: 'sessions',
        name: 'Charging Sessions',
        href: '/sessions',
        icon: '🔌',
        badgeKey: 'sessions',
        subItems: [
            { id: 'active-sessions', name: 'Active Sessions', href: '/sessions/active', icon: '🟢' },
            { id: 'session-history', name: 'History Logs', href: '/sessions/history', icon: '📜' },
        ],
    },

    // ============================================
    // REPORTS & ANALYTICS
    // ============================================
    {
        id: 'reports',
        name: 'Reports & Analytics',
        href: '/reports',
        icon: '📈',
        subItems: [
            { id: 'analytics', name: 'Performance Analytics', href: '/reports/analytics', icon: '📊' },
            { id: 'charging-reports', name: 'Charging Reports', href: '/reports/charging', icon: '🔋' },
            { id: 'user-reports', name: 'User Growth Reports', href: '/reports/users', icon: '👥' },
            { id: 'service-reports', name: 'Service Logs', href: '/reports/services', icon: '📋' },
        ],
    },

    // ============================================
    // SETTINGS & CMS
    // ============================================
    {
        id: 'settings',
        name: 'Settings',
        href: '/settings',
        icon: '⚙️',
        subItems: [
            { id: 'homepage-settings', name: 'Home Page CMS', href: '/settings/homepage', icon: '🏠' },
            { id: 'about-settings', name: 'About Page', href: '/settings/about', icon: 'ℹ️' },
            { id: 'faq-settings', name: 'FAQ Manager', href: '/settings/faq', icon: '❓' },
            { id: 'terms-settings', name: 'Terms & Policies', href: '/settings/terms', icon: '📄' },
            { id: 'general-settings', name: 'General Config', href: '/settings/general', icon: '⚙️' },
            { id: 'security-settings', name: 'Security & Auth', href: '/settings/security', icon: '🔒' },
            { id: 'api-keys', name: 'API Credentials', href: '/settings/api-keys', icon: '🔑' },
        ],
    },
];

// ============================================
// Helper Functions
// ============================================

// Search by item ID
export const getMenuItemById = (id: string): MenuItem | undefined => {
    for (const item of menuItems) {
        if (item.id === id) return item;
        if (item.subItems) {
            const found = item.subItems.find((sub) => sub.id === id);
            if (found) return found;
        }
    }
    return undefined;
};

// Get all sub-items from a parent ID
export const getSubItems = (parentId: string): MenuItem[] => {
    const parent = menuItems.find((item) => item.id === parentId);
    return parent?.subItems || [];
};

// Check if a path or parent group is active
export const isRouteActive = (href: string, currentPath: string): boolean => {
    if (href === '/dashboard') return currentPath === '/dashboard';
    return currentPath === href || currentPath.startsWith(`${href}/`);
};

// Find the currently active item
export const getActiveMenuItem = (pathname: string): MenuItem | undefined => {
    for (const item of menuItems) {
        if (item.subItems) {
            const activeSub = item.subItems.find(
                (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
            );
            if (activeSub) return activeSub;
        }
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
            return item;
        }
    }
    return undefined;
};

// Find parent item of a given sub-item
export const getParentMenuItem = (subItemId: string): MenuItem | undefined => {
    return menuItems.find((item) =>
        item.subItems?.some((sub) => sub.id === subItemId)
    );
};

// Breadcrumb Generator
export const getBreadcrumbs = (
    pathname: string
): { name: string; href: string }[] => {
    const activeItem = getActiveMenuItem(pathname);
    if (!activeItem) return [{ name: 'Dashboard', href: '/dashboard' }];

    const parent = getParentMenuItem(activeItem.id);
    const breadcrumbs: { name: string; href: string }[] = [];

    if (parent) {
        breadcrumbs.push({ name: parent.name, href: parent.href });
    }

    breadcrumbs.push({ name: activeItem.name, href: activeItem.href });

    return breadcrumbs;
};