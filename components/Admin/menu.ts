
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
            {
                id: 'all-users',
                name: 'All Users',
                href: '/users-managements',
                icon: '👤',
            },
            {
                id: 'roles',
                name: 'Roles',
                href: '/users-managements/roles',
                icon: '🎭',
            },
            {
                id: 'permissions',
                name: 'Permissions',
                href: '/users-managements/permissions',
                icon: '🛡️',
            },
        ],
    },

    // ============================================
    // PRODUCT CATALOG & INVENTORY
    // ============================================
    {
        id: 'catalog-management',
        name: 'Catalog & Products',
        href: '/product-management',
        icon: '🛍️',
        badgeKey: 'products',
        subItems: [
            {
                id: 'product-list',
                name: 'All Products',
                href: '/product-management',
                icon: '📦',
                badgeKey: 'products',
            },
            {
                id: 'category-management',
                name: 'Categories',
                href: '/category-management',
                icon: '🗂️',
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
                id: 'accessories-management',
                name: 'Accessories',
                href: '/accessories-management',
                icon: '🔩',
                badgeKey: 'accessories',
            },
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
            {
                id: 'service-management',
                name: 'Services',
                href: '/service-management',
                icon: '🔧',
                badgeKey: 'services',
            },
            {
                id: 'solutions-management',
                name: 'Solutions',
                href: '/solutions-management',
                icon: '💡',
                badgeKey: 'solutions',
            },
            {
                id: 'industries-management',
                name: 'Industries',
                href: '/industries-management',
                icon: '🏭',
            },
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
            {
                id: 'training-management',
                name: 'All Programs',
                href: '/training-management',
                icon: '📚',
                badgeKey: 'trainings',
            },
            {
                id: 'training-category-management',
                name: 'Training Categories',
                href: '/training-category-management',
                icon: '🗂️',
            },
        ],
    },

    // ============================================
    // ENGAGEMENT & INQUIRIES
    // ============================================
    {
        id: 'contacts-management',
        name: 'Contacts & Inquiries',
        href: '/contacts-management',
        icon: '📬',
        badgeKey: 'contacts',
    },
    {
        id: 'survey-management',
        name: 'Surveys & Feedback',
        href: '/survey-management',
        icon: '📝',
        badgeKey: 'surveys',
    },

    // ============================================
    // SETTINGS & CMS
    // ============================================
    {
        id: 'settings',
        name: 'Settings & CMS',
        href: '/settings',
        icon: '⚙️',
        subItems: [
            {
                id: 'hero-sections',
                name: 'Hero Sections',
                href: '/settings/homepage/heroSection',
                icon: '🖼️',
            },
            {
                id: 'hero-counter',
                name: 'Statistics & Counters',
                href: '/settings/counter',
                icon: '📈',
            },
            {
                id: 'home-foundation',
                name: 'Foundation Section',
                href: '/settings/foundation',
                icon: '🏛️',
            },
            {
                id: 'home-solution',
                name: 'Solutions Section',
                href: '/settings/solution-section',
                icon: '💡',
            },
            {
                id: 'home-story',
                name: 'Our Story Section',
                href: '/settings/story-section',
                icon: '📖',
            },
            {
                id: 'help-support',
                name: 'Help & Support',
                href: '/settings/helpSupport-section',
                icon: '🎧',
            },
            {
                id: 'ev-shop',
                name: 'EV Shop Section',
                href: '/settings/ev-shop',
                icon: '⚡',
            },
            {
                id: 'end-to-end',
                name: 'End-to-End Solutions',
                href: '/settings/end-to-end',
                icon: '🔗',
            },
            {
                id: 'faq-settings',
                name: 'FAQ Manager',
                href: '/settings/faq',
                icon: '💬',
            },
            {
                id: 'terms-settings',
                name: 'Terms & Policies',
                href: '/settings/terms',
                icon: '📜',
            },  
            {
                id: 'about-settings',
                name: 'About Page',
                href: '/settings/about',
                icon: 'ℹ️',
            },
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