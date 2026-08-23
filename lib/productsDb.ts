// lib/productsDb.ts
export interface Product {
    id: string;
    name: string;
    model: string;
    brand: string;
    category: 'ac-chargers' | 'dc-chargers' | 'accessories' | 'storage';
    categoryLabel: string;
    imageUrl: string;
    galleryImages?: string[];
    price: number;
    rating: number;
    specs: string[];
    shortDescription: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
    description: string;
    features: string[];
    technicalDetails: {
        powerOutput: string;
        inputVoltage: string;
        connectorType: string;
        enclosureRating: string;
        warranty: string;
        dimensions: string;
        weight: string;
    };
}

// Add Brand interface
export interface Brand {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

// Update brandsList with proper structure
export const brandsList: Brand[] = [
    {
        id: 'all',
        name: 'All Brands',
        description: 'View all EV charging brands',
        icon: '🏷️'
    },
    {
        id: 'evngen',
        name: 'EVNGEN Pro',
        description: 'Premium EV charging solutions',
        icon: '⚡'
    },
    {
        id: 'gridpower',
        name: 'GridPower Industrial',
        description: 'Industrial-grade DC fast charging',
        icon: '🏭'
    },
    {
        id: 'ecocharge',
        name: 'EcoCharge Home',
        description: 'Affordable and eco-friendly',
        icon: '🏠'
    }
];

export const productCategories = [
    { id: 'all', label: 'All', filter: 'all' },
    { id: 'ac-chargers', label: 'AC Chargers', filter: 'ac' },
    { id: 'dc-chargers', label: 'DC Chargers', filter: 'dc' },
    { id: 'accessories', label: 'Accessories', filter: 'accessories' },
    { id: 'storage', label: 'Energy Storage', filter: 'storage' }
];

export const productsList: Product[] = [
    {
        id: 'basic-ev-charger-lcd',
        name: 'Basic EV Charger with 3.0" LCD',
        model: 'SXC-EVB-22',
        brand: 'ecocharge',
        category: 'ac-chargers',
        categoryLabel: 'AC Chargers',
        imageUrl: '/images/product/product-img-2.avif',
        galleryImages: [
            '/images/product/product-img-2.avif',
            '/images/product/product-img-3.avif',
            '/images/product/product-img-4.avif',
            '/images/product/product-img-1.webp',
        ],
        price: 499,
        rating: 4.5,
        shortDescription: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
        description: 'Designed for residential driveways and commercial parking stalls, this compact AC wallbox provides reliable smart charging with an intuitive 3.0-inch color LCD display and flexible authentication options.',
        specs: [
            '7.6kW / 11kW / 22kW Output',
            '360×640 IPS full-angle color screen',
            'Plug&Charge / RFID / App control',
            'CE / RoHS / IK / REACH certified'
        ],
        features: [
            'Adjustable output current from 10A to 32A',
            'IP55 weather-resistant indoor/outdoor enclosure',
            'Built-in Type B RCD residual current protection',
            'Wi-Fi and Bluetooth local configuration support'
        ],
        technicalDetails: {
            powerOutput: '22kW Max (3-Phase)',
            inputVoltage: '400V AC ± 15%',
            connectorType: 'Type 2 Cable (5m)',
            enclosureRating: 'IP55 / IK10',
            warranty: '3 Years Standard',
            dimensions: '350mm × 240mm × 95mm',
            weight: '5.2 kg'
        }
    },
    {
        id: 'ev-charging-station-ocpp',
        name: 'EV Charging Station with OCPP',
        model: 'SXC-EVC-22P',
        brand: 'evngen',
        category: 'ac-chargers',
        categoryLabel: 'AC Chargers',
        imageUrl: '/images/help/EV Charging_1.jpg',
        galleryImages: [
            '/images/product/product-img-1.webp',
            '/images/product/product-img-2.webp',
            '/images/product/product-img-3.webp',
            '/images/product/product-img-4.webp',
        ],
        price: 799,
        rating: 4.8,
        specs: [
            '7.6kW / 11kW / 22kW Output',
            '360×640 IPS full-angle color screen',
            'Plug&Charge / RFID / App / OCPP / DLB',
            'CE / RoHS / IK / REACH certified'
        ],
        shortDescription: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, incidunt, autem minus quo explicabo, deleniti aspernatur eius et accusamus dicta eligendi nemo alias similique provident itaque? Tenetur dolore, perferendis quasi iste alias est quam adipisci accusamus at delectus. Ea incidunt fuga labore, cumque quidem minima placeat quis cupiditate omnis natus dolor nam magni. Dicta magni quam deleniti ab saepe doloremque officia eaque, ratione beatae esse nobis rerum aperiam, maxime minus iusto, cum ad! Dolorem, soluta sed? Cum eaque aspernatur vitae voluptas dolorum iste nisi, veritatis consectetur reprehenderit est asperiores saepe quasi cumque officia velit excepturi at impedit harum recusandae? Explicabo nam pariatur nesciunt distinctio porro natus, reiciendis vitae? Delectus quis natus qui ullam! Ratione magnam fugiat odio eius quia voluptates mollitia reiciendis quo corporis maiores. Dolores enim sapiente, voluptates sint rem, nemo dolor sit harum quas similique doloribus fugiat ex aut voluptatibus mollitia a. Eius ullam atque provident harum, soluta sit quidem et odit aliquam expedita ad unde eaque modi explicabo corrupti minus ex laborum magni vel assumenda suscipit temporibus facilis quisquam. Unde illo, ipsum eos, natus dignissimos repellat animi cupiditate reiciendis doloribus beatae voluptas inventore vel ullam ea similique earum! Possimus, est dolore. Adipisci quo expedita laborum possimus cum iste nesciunt dicta praesentium laudantium id earum tempora quidem in, libero dolorem. Non nemo sint praesentium obcaecati rerum corporis cum expedita unde! Tempora sequi suscipit hic ad dicta ea optio unde quisquam quis odio eligendi, soluta cupiditate nisi quo autem, saepe aut ex culpa similique enim rem dolor, aliquam id reiciendis? Nihil saepe aspernatur voluptatibus, earum minima sapiente quia corrupti quae hic unde error aperiam velit quo, harum fugiat placeat facilis aut nemo amet rem dolorum! Ipsam eaque optio esse recusandae voluptate veritatis nihil accusantium tempora ea quia necessitatibus ex eum expedita mollitia aut, doloribus id unde provident explicabo vitae.',
        features: [
            'Cloud-connected network remote management',
            'Dynamic load balancing (DLB) via wireless sensor integration',
            'Customizable branding screen interface',
            'Secure RFID card reader and mobile payment gateway'
        ],
        technicalDetails: {
            powerOutput: '22kW Max',
            inputVoltage: '230V / 400V AC',
            connectorType: 'Type 2 Socket with Shutter',
            enclosureRating: 'IP65 / IK10',
            warranty: '5 Years Comprehensive',
            dimensions: '420mm × 280mm × 110mm',
            weight: '7.8 kg'
        }
    },
    {
        id: 'dual-port-wallbox',
        name: 'Dual-Port Commercial Wallbox',
        model: 'SXC-EVD-22D',
        brand: 'evngen',
        category: 'ac-chargers',
        categoryLabel: 'AC Chargers',
        imageUrl: '/images/help/EV Charging_1.jpg',
        galleryImages: [
            '/images/product/product-img-1.webp',
            '/images/product/product-img-2.webp',
            '/images/product/product-img-3.webp',
            '/images/product/product-img-4.webp',
        ],
        price: 1299,
        rating: 4.6,
        specs: [
            '2×22kW independent or shared output',
            'Dynamic power sharing between ports',
            'App scheduling & per-port RFID',
            'CE / RoHS / IK certified'
        ],
        shortDescription: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
        description: 'Maximize space efficiency with dual independent charging connectors capable of simultaneously delivering high-speed AC power to two vehicles while intelligently splitting available current.',
        features: [
            'Simultaneous dual-vehicle 22kW charging capability',
            'Independent user access control per connector',
            'Heavy-duty anti-corrosion chassis',
            'Advanced thermal overload protection'
        ],
        technicalDetails: {
            powerOutput: '44kW Total (2 × 22kW)',
            inputVoltage: '400V AC 3-Phase',
            connectorType: 'Dual Type 2 Sockets',
            enclosureRating: 'IP54 / IK08',
            warranty: '3 Years Standard',
            dimensions: '500mm × 350mm × 150mm',
            weight: '14.5 kg'
        }
    },
    {
        id: 'dc-fast-charger-60kw',
        name: 'Ultra-Compact DC Fast Charger',
        model: 'SXC-DCF-120',
        brand: 'gridpower',
        category: 'dc-chargers',
        categoryLabel: 'DC Chargers',
        imageUrl: '/images/help/EV Charging_1.jpg',
        galleryImages: [
            '/images/product/product-img-1.webp',
            '/images/product/product-img-2.webp',
            '/images/product/product-img-3.webp',
            '/images/product/product-img-4.webp',
        ],
        price: 4999,
        rating: 4.9,
        specs: [
            '60kW / 120kW / 180kW Power Output',
            'CCS2 & CHAdeMO dual-gun simultaneous',
            '10.1" touchscreen, OCPP 1.6/2.0',
            'IP54, -30°C to 55°C operating range'
        ],
        shortDescription: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
        description: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
        features: [
            'Modular power rectifier stacks for easy maintenance',
            'Sunlight-readable 10-inch touch multimedia display',
            'Liquid-cooled cable option available',
            'Integrated emergency stop and surge protection'
        ],
        technicalDetails: {
            powerOutput: '60kW / 120kW / 180kW',
            inputVoltage: '380V AC ± 10% 3-Phase',
            connectorType: 'CCS2 + CHAdeMO (Dual-Gun)',
            enclosureRating: 'IP54 / IK10',
            warranty: '2 Years Full Coverage',
            dimensions: '1600mm × 700mm × 600mm',
            weight: '210 kg'
        }
    },
    {
        id: 'smart-load-balancing-box',
        name: 'EM3 Wireless Load Balancing Box',
        model: 'SXC-EM3-BOX',
        brand: 'evngen',
        category: 'accessories',
        categoryLabel: 'Accessories',
        imageUrl: '/images/help/EV Charging_1.jpg',
        galleryImages: [
            '/images/product/product-img-1.webp',
            '/images/product/product-img-2.webp',
            '/images/product/product-img-3.webp',
            '/images/product/product-img-4.webp',
        ],
        price: 299,
        rating: 4.3,
        specs: [
            '120m wireless LoRa transmission range',
            'Real-time grid current clamping',
            'Plug-and-play installation with zero rewiring',
            'IP65 enclosure rating'
        ],
        shortDescription: 'A freestanding fast charger for commercial and highway sites, delivering dual-gun simultaneous output with broad temperature tolerance.',
        description: 'Prevents main breaker tripping by monitoring total household or facility energy draw and dynamically throttling connected EV chargers in real time.',
        features: [
            'Wireless communication up to 120 meters',
            'Compatible with solar photovoltaic feed monitoring',
            'Sub-second response time to load fluctuations',
            'Compact DIN-rail or wall-mount form factor'
        ],
        technicalDetails: {
            powerOutput: 'N/A (Control Unit)',
            inputVoltage: '100–240V AC',
            connectorType: 'Current Transformer Clamps',
            enclosureRating: 'IP65',
            warranty: '3 Years Standard',
            dimensions: '120mm × 80mm × 45mm',
            weight: '0.4 kg'
        }
    }
];

// Helper functions
export const getProductById = (id: string) => {
    return productsList.find(product => product.id === id);
};

export const getProductsByCategory = (category: string) => {
    return productsList.filter(product => product.category === category);
};

export const getProductsByBrand = (brand: string) => {
    return productsList.filter(product => product.brand === brand);
};

export const getRelatedProducts = (productId: string, limit: number = 3) => {
    const product = getProductById(productId);
    if (!product) return [];
    return productsList
        .filter(p => p.category === product.category && p.id !== productId)
        .slice(0, limit);
};

export const getProductPrice = (id: string) => {
    const product = getProductById(id);
    return product?.price || 0;
};

export const getProductRating = (id: string) => {
    const product = getProductById(id);
    return product?.rating || 0;
};