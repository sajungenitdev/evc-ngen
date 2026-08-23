// lib/db.ts
export interface FoundationItem {
    title: string;
    description: string;
    bgClass: string;
    imageUrl: string;
    imageAlt: string;
}

export const foundationData: {
    heading: string;
    subtitle: string;
    items: FoundationItem[];
} = {
    heading: "Build Our Foundation",
    subtitle: "EVNGEN is driven by a mission to make electric energy work harder for people and the planet — engineering every product around reliability, efficiency, and long-term value.",
    items: [
        {
            title: "Values",
            description: "Sincerity, integrity, and long-termism guide every decision we make.",
            bgClass: "bg-[#0c1f38]",
            imageUrl: "/images/foundation/EV-Article-Charging-RR.jpg",
            imageAlt: "Values - EVNGEN core principles"
        },
        {
            title: "Development",
            description: "Unceasing in effort, boundless in reach.",
            bgClass: "bg-[#16493f]",
            imageUrl: "/images/foundation/ev-2-edit.min_.jpg",
            imageAlt: "Development - EVNGEN growth"
        },
        {
            title: "Technology",
            description: "Be the energy master in the grid.",
            bgClass: "bg-[#0c2138]",
            imageUrl: "/images/foundation/innovations-voitures-electriques.jpg",
            imageAlt: "Technology - EVNGEN innovation"
        },
        {
            title: "Sustainability",
            description: "Driving the transition to a greener, sustainable future.",
            bgClass: "bg-[#183a1f]",
            imageUrl: "/images/foundation/green_EV_charger_and_car_smart_city_Adobe_rt.jpg",
            imageAlt: "Sustainability - EVNGEN green future"
        },
    ]
};


export interface SolutionItem {
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    link: string;
    imageUrl: string;
}

export const solutionsSectionData = {
    heading: "Deliver Our Solutions",
    subtitle: "We deliver cutting-edge technologies across Power Quality, EV Charging, Energy Storage, and Battery Testing.",
    items: [
        {
            title: "Power Quality",
            slug: "power-quality",
            subtitle: "Enhancing Energy Efficiency, Safeguarding Grid Security",
            description: "Comprehensive low-voltage power quality solutions that optimize electricity usage across industrial and commercial environments.",
            link: "/solutions",
            imageUrl: "/images/solutions/EV-Charging-eBook-landing-page.jpg",
        },
        {
            title: "EV Charging",
            slug: "ev-charging",
            subtitle: "Fast on Demand, Intelligently Efficient",
            description: "High-efficiency power modules and reliable charging systems spanning 7kW to 1,280kW for residential, commercial, and fleet use.",
            link: "/ev-chargers",
            imageUrl: "/images/solutions/images.jpg",
        },
        {
            title: "Energy Storage",
            slug: "energy-storage",
            subtitle: "Empowering Partners, Empowering Energy Freedom",
            description: "Modular storage solutions tailored for utility-scale, commercial & industrial, and microgrid applications.",
            link: "/about",
            imageUrl: "/images/solutions/Energy Storage.webp",
        },
        {
            title: "Battery Testing",
            slug: "battery-testing",
            subtitle: "Advanced Battery Test Solutions to Empower Green Energy",
            description: "Innovative, intelligent, safe, and reliable test & formation-grading solutions for world-class battery labs and production lines.",
            link: "/about",
            imageUrl: "/images/solutions/Battery Testing.jpg",
        },
    ]
};


export interface StoryCategory {
    title: string;
    imageUrl: string;
    link: string;
}

export const storiesSectionData = {
    heading: "Discover Our Stories",
    subtitle: "Real deployments, real impact — a closer look at how our charging infrastructure performs in the field.",
    mainStory: {
        quote: "EVNGEN completed a 120kW DC fast-charging hub deployment in under six weeks, from site survey to grid commissioning — powering a commercial fleet depot around the clock.",
        linkText: "See All Deployment Stories →",
        link: "/stories",
        imageUrl: "/images/stories/EVNGEN completed.webp",
    },
    categories: [
        {
            title: "At Home",
            imageUrl: "/images/stories/at-home.jpg",
            link: "/solutions?tab=home",
        },
        {
            title: "At Work",
            imageUrl: "/images/stories/at-work.avif",
            link: "/solutions?tab=work",
        },
        {
            title: "On the Road",
            imageUrl: "/images/stories/on-the-road.jpg",
            link: "/solutions?tab=road",
        },
        {
            title: "At Retail",
            imageUrl: "/images/stories/At-Retail.webp",
            link: "/solutions?tab=retail",
        },
    ]
};


export const helpSupportSectionData = {
    salesCard: {
        status: "Sales Team Online",
        title: "Need help choosing a charger?",
        highlightText: "Talk to our team.",
        buttonText: "Call +1 (800) 555-0199",
        phoneLink: "tel:18005550199",
        imageUrl: "/images/help/need-help.jpg",
    },
    ticketCard: {
        description: "Need something else? Raise a ticket and we'll get back to you.",
        linkText: "Raise a Ticket →",
        link: "/contact",
        imageUrl: "/images/help/Raise-Ticket.jpg",
    },
    supportHubCard: {
        description: "Find answers, guides, and advice, all in one place",
        linkText: "Visit our Support Hub →",
        link: "/faq",
        imageUrl: "/images/help/charge-ev_9-1.webp",
    },
    reviewCard: {
        description: "Help us continue to improve our network",
        linkText: "Leave a Review →",
        link: "/reviews",
        imageUrl: "/images/help/improve-our-network.jpg",
    },
    socialCard: {
        title: "Stay connected",
        imageUrl: "/images/help/Stay-connected.jpg",
        socials: [
            { name: "X", link: "https://twitter.com" },
            { name: "in", link: "https://linkedin.com" },
            { name: "f", link: "https://facebook.com" },
        ],
    },
};


export const evShopSectionData = {
    heading: "EV Shop Online",
    items: [
        {
            title: "Chargers",
            buttonText: "Shop",
            link: "/ev-chargers?filter=chargers",
            bgClass: "bg-gradient-to-br from-[#1b854a] to-[#125530]",
            imageUrl: "/images/help/charger.jpg",
        },
        {
            title: "Cables & Connectors",
            buttonText: "Shop",
            link: "/ev-chargers?filter=cables",
            bgClass: "bg-gradient-to-br from-[#176641] to-[#0a1c2e]",
            imageUrl: "/images/help/group-of-EV-charging-stations.jpg",
        },
        {
            title: "Accessories",
            buttonText: "Shop",
            link: "/ev-chargers?filter=accessories",
            bgClass: "bg-gradient-to-br from-[#144a35] to-[#071322]",
            imageUrl: "/images/help/Accessories.jpg",
        },
    ],
    viewAllButton: {
        text: "View All",
        link: "/ev-chargers",
    },
};


export interface ChargerProduct {
    id: string;
    title: string;
    description: string;
    category: 'ac' | 'dc';
    link: string;
}


export const chargingNeedsData = {
    heading: "For All Your Charging Needs",
    tabs: [
        { id: 'ac', label: 'AC CHARGER' },
        { id: 'dc', label: 'DC CHARGER' },
    ],
    products: [
        {
            id: '1',
            title: "Basic EV Charger",
            description: "7.6–22kW AC wallbox with 3.0\" LCD for home & light commercial use.",
            category: 'ac' as const,
            link: "/ev-chargers/basic-ev-charger",
            image: "/images/help/Accessories.jpg",
        },
        {
            id: '2',
            title: "Charging Station with OCPP",
            description: "Smart-managed AC charging with dynamic load balancing.",
            category: 'ac' as const,
            link: "/ev-chargers/ocpp-charging-station",
            image: "/images/help/Accessories.jpg",
        },
        {
            id: '3',
            title: "Dual-Port Wallbox",
            description: "Charge two vehicles from one unit with app-based scheduling.",
            category: 'ac' as const,
            link: "/ev-chargers/dual-port-wallbox",
            image: "/images/help/Accessories.jpg",
        },
        {
            id: '4',
            title: "Commercial DC Fast Charger",
            description: "60kW–180kW fast-charging power station for highway and fleet applications.",
            category: 'dc' as const,
            link: "/ev-chargers/commercial-dc-charger",
            image: "/images/help/Accessories.jpg",
        },
        {
            id: '5',
            title: "Ultra-Fast Fleet DC Hub",
            description: "High-output DC charging solutions ranging up to 360kW+ for heavy-duty commercial deployment.",
            category: 'dc' as const,
            link: "/ev-chargers/ultra-fast-dc-hub",
            image: "/images/help/Accessories.jpg",
        },
    ]
};

import {
    Wrench,
    ClipboardList,
    Construction,
    Wifi,
    Headphones,
    CreditCard,
    ShieldCheck,
    BarChart3,
    LucideIcon
} from 'lucide-react';

export interface SetupStep {
    title: string;
    description: string;
    icon: LucideIcon;
}

export const endToEndSetupData = {
    headingPart1: "End-to-End",
    headingPart2: "EV Charger Setup & Support",
    steps: [
        {
            title: "Free Site Assessment",
            description: "End-to-end site planning to get your location deployment-ready.",
            icon: Wrench,
        },
        {
            title: "Execution Plan & Pricing",
            description: "Hardware recommendations, pricing, and a full installation plan.",
            icon: ClipboardList,
        },
        {
            title: "Installation & Testing",
            description: "Certified technicians install and test for safety and compliance.",
            icon: Construction,
        },
        {
            title: "Onboarding & Activation",
            description: "KYC, platform onboarding, and activation with dashboard access.",
            icon: Wifi,
        },
        {
            title: "24/7 Customer Support",
            description: "Our team is available around the clock for technical queries.",
            icon: Headphones,
        },
        {
            title: "Software & Billing Integration",
            description: "Configure custom pricing, payment gateways, and automated billing controls.",
            icon: CreditCard,
        },
        {
            title: "Preventative Maintenance",
            description: "Routine hardware inspections and firmware updates to ensure maximum uptime.",
            icon: ShieldCheck,
        },
        {
            title: "Analytics & Fleet Reporting",
            description: "Track energy consumption, revenue metrics, and overall charger utilization.",
            icon: BarChart3,
        },
    ],
    ctaButton: {
        text: "Book a Free Consultation",
        link: "/request-survey",
    },
};


export const goAnywhereSectionData = {
    locationCard: {
        title: "Go Anywhere",
        locationText: "Use My Location",
        placeholder: "Search by city or zip code...",
        bgClass: "bg-[#eef2f1]",
        imageUrl: "/images/help/EV Charging_1.jpg",
    },
    appCard: {
        title: "Download our App",
        linkText: "Get Now→",
        link: "/app",
        bgClass: "bg-[#0b3b2c]",
        imageUrl: "/images/help/ev-car-electric-vehicle-charging-battery-at-station-with-smart-phone-status-sustainable-clean-energy-resources-environmental-friendly-alternative-energy-in-transportation-technology-vector.jpg",
    },
    catalogCard: {
        title: "View Product Catalog",
        linkText: "Check Now→",
        link: "/ev-chargers",
        bgClass: "bg-[#557b73]",
        imageUrl: "/images/help/Charger-Station-EV-DC-Charger-with-APP-Control.avif",
    },
};


export const faqPageData = {
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'FAQ & Support' }
        ],
        imageUrl: "/images/help/EV Charging_1.jpg",
        title: "Frequently Asked Questions",
        description: "Find answers regarding EV charger hardware specifications, OCPP software integration, billing, and site installation."
    },
    categories: ['All', 'Hardware & Installation', 'Software & OCPP', 'Pricing & Billing', 'Maintenance'],
    faqs: [
        {
            question: "What is the typical installation timeline for a commercial DC fast charger?",
            answer: "A standard commercial DC fast-charging hub deployment typically takes between 4 to 6 weeks from initial site survey and electrical assessment to grid commissioning and final software activation.",
            category: "Hardware & Installation"
        },
        {
            question: "Do your EV chargers support OCPP standards?",
            answer: "Yes, all our smart AC wallboxes and DC fast-charging stations are fully Open Charge Point Protocol (OCPP 1.6J and 2.0.1) compliant, allowing seamless integration with third-party backend management platforms.",
            category: "Software & OCPP"
        },
        {
            question: "How does dynamic load balancing work across multiple chargers?",
            answer: "Dynamic load balancing automatically distributes the available electrical capacity among active vehicles in real-time, preventing peak load surcharges and protecting your site's main electrical infrastructure from overloading.",
            category: "Hardware & Installation"
        },
        {
            question: "Can I monitor energy usage and manage driver billing remotely?",
            answer: "Yes, our cloud-based monitoring dashboard and driver mobile apps provide real-time session tracking, remote firmware updates, flexible pricing configuration, and automated RFID or app-based billing.",
            category: "Software & OCPP"
        },
        {
            question: "What kind of warranty and maintenance support do you offer?",
            answer: "We provide comprehensive 24/7 technical customer support, remote diagnostics, and standard multi-year hardware warranties with optional on-site SLA maintenance packages.",
            category: "Maintenance"
        },
        {
            question: "Are there government grants or rebates available for installing EV chargers?",
            answer: "Many federal, regional, and utility-specific programs offer financial incentives, tax credits, and rebates for commercial and fleet EV infrastructure deployment. Our team can help guide you through the consultation and application process.",
            category: "Pricing & Billing"
        }
    ],
    ctaBanner: {
        title: "Still have questions?",
        description: "Our engineering and sales team are available to discuss your specific infrastructure and fleet requirements.",
        primaryButton: { text: "Contact Our Team", link: "/contact" },
        secondaryButton: { text: "Request Site Survey", link: "/request-survey" },
    }
};


export const termsPageData = {
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'Terms & Conditions' }
        ],
        imageUrl: "/images/help/EV Charging_1.jpg",
        title: "Terms & Conditions",
        description: "Please read these terms and conditions carefully before using our EV charging hardware, software platforms, and network services."
    },
    lastUpdated: "Last updated: August 2026",
    sections: [
        {
            heading: "1. Agreement to Terms",
            content: "By accessing or using our website, mobile applications, and EV charging infrastructure services, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you may not access our network or services."
        },
        {
            heading: "2. Charging Services & Usage",
            content: "Users agree to utilize EV charging stations and accessories in accordance with operational guidelines, local traffic laws, and safety regulations. Unauthorized tampering, modification, or commercial resale of electricity without explicit authorization is strictly prohibited."
        },
        {
            heading: "3. Software & OCPP Platform Access",
            content: "Our cloud-based management platform and driver mobile applications are provided on a licensed basis. You agree not to reverse engineer, disrupt, or gain unauthorized access to our backend servers, data pipelines, or OCPP communication networks."
        },
        {
            heading: "4. Payments, Billing & Subscriptions",
            content: "Charging session fees, hardware purchases, and software subscription plans are billed according to the current rates displayed at the time of transaction. Users are responsible for providing valid payment methods and maintaining updated billing credentials."
        },
        {
            heading: "5. Limitation of Liability",
            content: "We shall not be held liable for any indirect, incidental, special, consequential, or punitive damages resulting from power grid failures, third-party network interruptions, improper vehicle compatibility, or unauthorized access to user accounts."
        },
        {
            heading: "6. Changes to Terms",
            content: "We reserve the right to modify or replace these terms at any time at our sole discretion. Continued use of our charging infrastructure and website following any modifications constitutes acceptance of those changes."
        }
    ]
};


export const aboutPageData = {
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'About Us' }
        ],
        imageUrl: "/images/help/EV Charging_1.jpg",
        title: "About EVNGEN",
        description: "Leading the transition to sustainable energy and electric vehicle infrastructure with reliable, high-performance charging solutions."
    },
    headerLabel: "ABOUT",
    title: "Engineering electric energy freedom",
    introParagraph1: "EVNGEN is dedicated to controlling the movement of electric energy — across AC, DC, frequency, and voltage — to serve people and industry with greater efficiency. Since our founding, we've focused on Power Quality, EV Charging, Energy Storage, and Battery Testing, delivering technology that helps partners run more reliable, sustainable operations.",
    introParagraph2: "Our EV charging division designs and manufactures AC and DC chargers from 3.5kW residential wallboxes to 180kW fast-charging stations, backed by an engineering team offering full OEM/ODM customization — brand logo printing, shell design, power configuration, and regional certification support.",
    sidebarNav: [
        { label: "About EVNGEN", link: "/about", active: true },
        { label: "Senior Leadership", link: "/about/leadership", active: false },
    ],
    stats: [
        { value: "15+", label: "Years in Power Electronics" },
        { value: "50+", label: "Countries Served" },
        { value: "200k+", label: "Chargers Online" },
        { value: "24/7", label: "Global Support" },
    ],
    whoWeAre: {
        title: "Who We Are",
        paragraph1: "Established as a pioneering provider of sustainable energy infrastructure solutions, EVNGEN specializes in advanced Electric Vehicle (EV) charging infrastructure, power quality, and energy storage systems.",
        paragraph2: "As a trusted leader in the green tech industry, we pride ourselves on delivering practical, future-proof engineering and software solutions that meet the evolving needs of commercial operators, fleets, and residential drivers.",
        imageUrl: "/images/help/who-we-are.webp",
        highlights: [
            "15+ years of power electronics and energy expertise",
            "Full end-to-end OEM/ODM hardware customization",
            "Certified chargers meeting international safety standards"
        ],
    },
    mission: {
        title: "Our Mission",
        paragraph1: "As one of the most trusted EV charger providers and charge point operators (CPO), we are dedicated to delivering a seamless, end-to-end charging ecosystem.",
        paragraph2: "To accelerate green mobility, we operate a robust digital network and mobile platform, granting drivers instant access to reliable fast-charging stations across our growing infrastructure.",
        imageUrl: "/images/help/mission.webp",
        highlights: [
            "Seamless driver experience via OCCP-compliant cloud app",
            "Robust, scalable infrastructure for commercial and municipal fleets",
            "24/7 global support and real-time remote network monitoring"
        ],
    },
    partners: [
        { name: "EcoDrive", logo: "/images/partners/ecodrive.webp" },
        { name: "VoltGrid", logo: "/images/partners/voltgrid.jpg" },
        { name: "ChargePoint Inc.", logo: "/images/partners/chargepoint.png" },
        { name: "GreenMotion", logo: "/images/partners/greenmotion.png" },
        { name: "EcoPower Global", logo: "/images/partners/ecopower.png" },
        { name: "FutureVolt", logo: "/images/partners/futurevolt.jpg" },
        { name: "VoltGrid", logo: "/images/partners/voltgrid.jpg" },
        { name: "ChargePoint Inc.", logo: "/images/partners/chargepoint.png" },
        { name: "GreenMotion", logo: "/images/partners/greenmotion.png" },
    ],
    timeline: [
        {
            year: "2009",
            title: "Company Founded",
            description: "Started as a specialized power electronics and power quality engineering consultancy."
        },
        {
            year: "2013",
            title: "Grid Solutions Expansion",
            description: "Expanded operations into industrial energy storage and high-capacity inverter testing systems."
        },
        {
            year: "2017",
            title: "EV Charging Division Launch",
            description: "Pioneered our first generation of smart AC wallboxes and commercial fast chargers."
        },
        {
            year: "2021",
            title: "OCPP Cloud Platform",
            description: "Released our proprietary backend cloud management software and driver mobile applications."
        },
        {
            year: "2024",
            title: "Global Network Growth",
            description: "Surpassed 150,000 active chargers online across international commercial and municipal fleets."
        },
        {
            year: "2026",
            title: "Next-Gen Megawatt Charging",
            description: "Introducing ultra-fast DC charging infrastructure and advanced dynamic load-balancing systems."
        }
    ]
};