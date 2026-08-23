// lib/industriesDb.ts

export interface Industry {
    id: string;
    label: string;
    slug: string;
    desc: string;
    icon: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    challenges: string[];
    solutions: string[];
    benefits: string[];
    caseStudy?: {
        title: string;
        description: string;
        imageUrl: string;
        link: string;
    };
    features: string[];
}

export const industriesList: Industry[] = [
    {
        id: 'oil-gas-fuel-retail',
        label: 'Oil & Gas / Fuel Retail',
        slug: 'oil-gas-fuel-retail',
        desc: 'Add EV bays to existing forecourts',
        icon: '⛽',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging Solutions for Oil & Gas Retailers',
        subtitle: 'Transform your fuel retail locations into modern energy hubs with EV charging infrastructure.',
        overview: 'As the transportation sector transitions to electric vehicles, fuel retailers have a unique opportunity to diversify their revenue streams and future-proof their businesses. Our EV charging solutions are designed to seamlessly integrate with existing forecourts, allowing you to add EV bays without disrupting your current operations.',
        challenges: [
            'Limited space on existing forecourts',
            'High power demand for fast charging',
            'Integration with existing fuel dispensing systems',
            'Customer experience and dwell time management'
        ],
        solutions: [
            'Compact DC fast chargers that fit in standard parking bays',
            'Smart load management to optimize power usage',
            'OCPP-compliant software for seamless integration',
            'White-label mobile apps for customer engagement'
        ],
        benefits: [
            'Diversify revenue streams beyond fuel sales',
            'Attract new EV-driving customers',
            'Increase dwell time and convenience store sales',
            'Future-proof your business for the EV transition'
        ],
        caseStudy: {
            title: 'Global Fuel Retailer Adds EV Charging to 200+ Sites',
            description: 'A leading fuel retailer deployed EVNGEN DC fast chargers across 200+ locations, increasing foot traffic by 25% and generating new revenue streams.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/fuel-retail'
        },
        features: [
            'Compact, space-efficient charger designs',
            'Scalable deployment from 1 to 20+ bays',
            'Integration with loyalty and payment systems',
            '24/7 remote monitoring and support'
        ]
    },
    {
        id: 'condominiums-residential',
        label: 'Condominiums & Residential',
        slug: 'condominiums-residential',
        desc: 'Retrofit garages, share existing power',
        icon: '🏢',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Condominiums & Residential Buildings',
        subtitle: 'Enable EV charging for residents without expensive electrical upgrades.',
        overview: 'Residential buildings face unique challenges when it comes to EV charging. Limited electrical capacity, shared parking facilities, and the need for fair cost allocation make it essential to have intelligent charging solutions. Our systems are designed to share existing power capacity efficiently.',
        challenges: [
            'Limited electrical capacity for multiple chargers',
            'Fair cost allocation among residents',
            'Installation in existing parking structures',
            'Resident access control and billing'
        ],
        solutions: [
            'Dynamic load balancing to share existing power',
            'Sub-metering and per-resident billing',
            'Compact wallboxes for garage installations',
            'RFID and mobile app access control'
        ],
        benefits: [
            'Increase property value with EV charging amenities',
            'Attract environmentally conscious residents',
            'Fair and transparent billing for electricity usage',
            'Future-proof your building for EV adoption'
        ],
        caseStudy: {
            title: 'Luxury Condo Installs 40 EV Charging Bays',
            description: 'A luxury condominium in California installed 40 EV charging bays with dynamic load balancing, enabling all residents to charge without a full electrical upgrade.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/condo-charging'
        },
        features: [
            'Dynamic load balancing for power sharing',
            'Per-resident billing and access control',
            'Compact, aesthetically designed hardware',
            'Integration with building management systems'
        ]
    },
    {
        id: 'government-offices',
        label: 'Government Offices',
        slug: 'government-offices',
        desc: 'Public-sector & municipal fleets',
        icon: '🏛️',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Government & Municipal Facilities',
        subtitle: 'Lead by example with sustainable EV charging infrastructure for public fleets and employees.',
        overview: 'Government agencies and municipalities are at the forefront of the EV transition. Our solutions support public fleets, employee charging, and public-facing EV infrastructure that demonstrates commitment to sustainability.',
        challenges: [
            'Compliance with government procurement standards',
            'Public access and security requirements',
            'Fleet charging scheduling and optimization',
            'Integration with existing municipal systems'
        ],
        solutions: [
            'OCPP-compliant hardware for interoperability',
            'Fleet charging management software',
            'Public charging with payment options',
            'Real-time monitoring and reporting'
        ],
        benefits: [
            'Demonstrate sustainability leadership',
            'Reduce fleet operating costs with EVs',
            'Support employee EV adoption',
            'Meet sustainability and emissions targets'
        ],
        caseStudy: {
            title: 'City Government Electrifies Municipal Fleet',
            description: 'A major city government deployed 100+ EV charging stations for its municipal fleet, reducing emissions and operating costs while setting an example for the community.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/municipal-fleet'
        },
        features: [
            'Fleet management and scheduling software',
            'Public charging with payment integration',
            'Compliance with government standards',
            'Real-time reporting and analytics'
        ]
    },
    {
        id: 'shopping-malls-retail',
        label: 'Shopping Malls & Retail',
        slug: 'shopping-malls-retail',
        desc: 'Attract shoppers, bill tenants separately',
        icon: '🛒',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Shopping Malls & Retail Centers',
        subtitle: 'Attract EV-driving shoppers and create new revenue opportunities with retail charging.',
        overview: 'Shopping malls and retail centers are ideal locations for EV charging. Our solutions help you attract EV-driving customers, increase dwell time, and create new revenue streams through charging fees and tenant billing.',
        challenges: [
            'High traffic and parking turnover',
            'Tenant billing and cost allocation',
            'Customer experience and ease of use',
            'Integration with parking management systems'
        ],
        solutions: [
            'High-power DC fast chargers for quick sessions',
            'Tenant-specific billing and reporting',
            'User-friendly mobile app and payment options',
            'Integration with parking access systems'
        ],
        benefits: [
            'Attract EV-driving shoppers',
            'Increase dwell time and spending',
            'Generate revenue from charging fees',
            'Enhance your sustainability image'
        ],
        caseStudy: {
            title: 'Regional Mall Deploys 20 EV Charging Stations',
            description: 'A regional shopping mall installed 20 EV charging stations, increasing foot traffic by 15% and generating significant new revenue.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/mall-charging'
        },
        features: [
            'High-power DC fast charging',
            'Tenant billing and reporting',
            'Mobile app with real-time availability',
            'Integration with parking systems'
        ]
    },
    {
        id: 'fleet-logistics',
        label: 'Fleet & Logistics',
        slug: 'fleet-logistics',
        desc: 'Depots, warehouses, transit',
        icon: '🚚',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Fleet & Logistics Operations',
        subtitle: 'Electrify your fleet with reliable, high-power charging solutions for depots and warehouses.',
        overview: 'Fleet electrification is accelerating across all vehicle classes. Our solutions are designed for the unique demands of fleet operations, including overnight depot charging, opportunity charging, and integration with fleet management systems.',
        challenges: [
            'High power requirements for large fleets',
            'Scheduling and prioritization of vehicle charging',
            'Integration with fleet management systems',
            'Depot space and infrastructure constraints'
        ],
        solutions: [
            'High-power AC and DC charging systems',
            'Fleet charging management software',
            'Smart scheduling and load management',
            'Integration with telematics and fleet systems'
        ],
        benefits: [
            'Reduce fleet operating costs with EVs',
            'Meet sustainability and emissions targets',
            'Optimize fleet charging schedules',
            'Future-proof your fleet operations'
        ],
        caseStudy: {
            title: 'Logistics Company Electrifies 50-Truck Fleet',
            description: 'A major logistics company deployed 50 EV charging stations at its depot, enabling overnight charging for a 50-truck electric fleet.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/logistics-fleet'
        },
        features: [
            'High-power charging (up to 360kW)',
            'Fleet management and scheduling',
            'Integration with telematics',
            '24/7 monitoring and support'
        ]
    },
    {
        id: 'hospitality-hotels',
        label: 'Hospitality & Hotels',
        slug: 'hospitality-hotels',
        desc: 'Guest charging as an amenity',
        icon: '🏨',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Hotels & Hospitality',
        subtitle: 'Enhance guest experience with convenient EV charging as a premium amenity.',
        overview: 'EV charging has become an expected amenity for hotels and hospitality venues. Our solutions help you attract EV-driving guests, enhance their experience, and generate additional revenue through charging fees.',
        challenges: [
            'Guest access and ease of use',
            'Overnight charging for hotel guests',
            'Integration with property management systems',
            'Cost recovery and billing'
        ],
        solutions: [
            'AC wallboxes and DC fast chargers',
            'Overnight charging with automatic billing',
            'Integration with PMS and guest services',
            'Mobile app for guest convenience'
        ],
        benefits: [
            'Attract EV-driving guests',
            'Enhance guest experience and satisfaction',
            'Generate additional revenue',
            'Differentiate your property from competitors'
        ],
        caseStudy: {
            title: 'Luxury Hotel Adds EV Charging as Premium Amenity',
            description: 'A luxury hotel chain installed EV charging stations at all properties, attracting environmentally conscious guests and generating new revenue.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/hotel-charging'
        },
        features: [
            'Guest-friendly charging stations',
            'Automatic billing to guest accounts',
            'Mobile app with real-time availability',
            'Integration with property management systems'
        ]
    },
    {
        id: 'workplace-corporate',
        label: 'Workplace & Corporate',
        slug: 'workplace-corporate',
        desc: 'Employee & visitor charging',
        icon: '💼',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Workplace & Corporate Campuses',
        subtitle: 'Support employee EV adoption and demonstrate sustainability commitment.',
        overview: 'Workplace charging is one of the most important drivers of EV adoption. Our solutions help companies support their employees transition to EVs, reduce their carbon footprint, and demonstrate sustainability leadership.',
        challenges: [
            'Employee access and fair use policies',
            'Cost allocation and billing',
            'Scalability for growing EV adoption',
            'Integration with HR and building systems'
        ],
        solutions: [
            'AC charging stations for employee parking',
            'Fair use policies and access control',
            'Employee billing and reimbursement',
            'Integration with building management systems'
        ],
        benefits: [
            'Support employee EV adoption',
            'Reduce carbon footprint',
            'Enhance corporate sustainability image',
            'Attract and retain environmentally conscious employees'
        ],
        caseStudy: {
            title: 'Tech Company Installs 200 EV Charging Stations',
            description: 'A leading tech company installed 200 EV charging stations at its headquarters, supporting employee EV adoption and demonstrating sustainability leadership.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/workplace-charging'
        },
        features: [
            'Scalable AC and DC charging solutions',
            'Employee access control and billing',
            'Integration with building systems',
            'Real-time usage reporting'
        ]
    },
    {
        id: 'education-universities',
        label: 'Education & Universities',
        slug: 'education-universities',
        desc: 'Campus-wide charging infrastructure',
        icon: '🎓',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Universities & Educational Institutions',
        subtitle: 'Build a sustainable campus with comprehensive EV charging infrastructure.',
        overview: 'Universities and educational institutions are ideal locations for EV charging, serving students, faculty, staff, and visitors. Our solutions help campuses build comprehensive charging infrastructure that supports sustainability goals.',
        challenges: [
            'Campus-wide deployment coordination',
            'Student and faculty access management',
            'Integration with campus sustainability initiatives',
            'Scalability for growing EV adoption'
        ],
        solutions: [
            'Centralized charging management platform',
            'Student and faculty access control',
            'Integration with campus sustainability programs',
            'Scalable deployment across campus'
        ],
        benefits: [
            'Support campus sustainability goals',
            'Attract environmentally conscious students',
            'Demonstrate sustainability leadership',
            'Prepare campus for EV transition'
        ],
        caseStudy: {
            title: 'University Deploys 100 EV Charging Stations',
            description: 'A major university installed 100 EV charging stations across campus, supporting student and faculty EV adoption and achieving sustainability goals.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/university-charging'
        },
        features: [
            'Campus-wide charging management',
            'Student and faculty access control',
            'Integration with sustainability programs',
            'Scalable and expandable solutions'
        ]
    },
    {
        id: 'highway-transit-hubs',
        label: 'Highway & Transit Hubs',
        slug: 'highway-transit-hubs',
        desc: 'High-power corridor charging',
        icon: '🛣️',
        imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
        title: 'EV Charging for Highways & Transit Hubs',
        subtitle: 'Enable long-distance EV travel with high-power corridor charging infrastructure.',
        overview: 'Highway corridors and transit hubs are critical for enabling long-distance EV travel. Our solutions are designed for high-power, high-reliability charging that keeps vehicles moving and supports growing EV adoption.',
        challenges: [
            'High power requirements for fast charging',
            'Reliability and uptime requirements',
            'Integration with highway infrastructure',
            'Scalability for growing EV traffic'
        ],
        solutions: [
            'High-power DC fast chargers (up to 360kW)',
            'Redundant systems for high reliability',
            'Integration with highway and transit systems',
            'Scalable deployment for growing demand'
        ],
        benefits: [
            'Enable long-distance EV travel',
            'Support growing EV adoption',
            'Generate revenue from charging fees',
            'Enhance highway infrastructure'
        ],
        caseStudy: {
            title: 'Highway Corridor Installs 50 Fast Chargers',
            description: 'A major highway corridor installed 50 DC fast chargers, enabling long-distance EV travel and supporting growing EV adoption.',
            imageUrl: '/images/industries/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            link: '/case-studies/highway-charging'
        },
        features: [
            'High-power DC fast charging (up to 360kW)',
            'High reliability and uptime',
            'Integration with highway systems',
            'Scalable deployment'
        ]
    }
];

// Helper Functions
export function getIndustryById(id: string) {
    return industriesList.find(industry => industry.id === id);
}

export function getIndustryBySlug(slug: string) {
    return industriesList.find(industry => industry.slug === slug);
}

export function getAllIndustryIds() {
    return industriesList.map(industry => ({
        params: { id: industry.id }
    }));
}

export function getRelatedIndustries(industryId: string, limit: number = 3) {
    const current = getIndustryById(industryId);
    if (!current) return [];
    return industriesList
        .filter(i => i.id !== industryId)
        .slice(0, limit);
}

// Get industry icon by ID
export function getIndustryIcon(id: string): string {
    const icons: Record<string, string> = {
        'oil-gas-fuel-retail': '⛽',
        'condominiums-residential': '🏢',
        'government-offices': '🏛️',
        'shopping-malls-retail': '🛒',
        'fleet-logistics': '🚚',
        'hospitality-hotels': '🏨',
        'workplace-corporate': '💼',
        'education-universities': '🎓',
        'highway-transit-hubs': '🛣️'
    };
    return icons[id] || '🏢';
}