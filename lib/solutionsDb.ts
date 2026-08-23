// lib/solutionsDb.ts

export const solutionsList = [
    // 1. Power Quality
    {
        id: 'power-quality',
        label: 'Power Quality',
        link: '/solutions/power-quality',
        desc: 'Harmonic compensation & grid security',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Industrial Power Quality & Grid Security',
        subtitle: 'Advanced harmonic filtering, reactive power compensation, and active voltage regulation for industrial ecosystems.',
        overview: 'Maintaining optimal power quality is critical for modern industrial plants, commercial buildings, and high-capacity EV charging hubs to eliminate costly distortions and prevent equipment degradation.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Active Harmonic Filters',
                    badge: 'HARMONIC MITIGATION',
                    title: 'Eliminate total harmonic distortion in heavy industrial sites',
                    description: 'Our AHF systems inject counter-phase currents to neutralize harmonic frequencies in real time, ensuring absolute compliance with IEEE 519 grid codes.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'AHF Series Specs →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Static Var Generators',
                    badge: 'REACTIVE POWER',
                    title: 'Instantaneous reactive power compensation for grid stability',
                    description: 'Provide seamless lagging and leading reactive power support within milliseconds to maintain a near-unity power factor across changing facility loads.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'SVG Modules →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Voltage Regulation',
                    badge: 'VOLTAGE STABILIZATION',
                    title: 'Protect sensitive machinery from sags, swells, and surges',
                    description: 'Active voltage conditioners stabilize fluctuating line inputs instantly, ensuring continuous plant uptime and protecting high-precision electronics.',
                    imageUrl: '/images/solutions/images.jpg',
                    links: [
                        { label: 'Learn More →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'IoT Grid Telemetry',
                    badge: 'REAL-TIME ANALYTICS',
                    title: 'Comprehensive power quality auditing and telemetry dashboard',
                    description: 'Monitor voltage harmonics, unbalance rates, and active power metrics remotely through cloud-connected analysis tools.',
                    imageUrl: '/images/solutions/69b038a9847abffe2d7ad1cf_EV charging open standards.png',
                    links: [
                        { label: 'Explore Software →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Power quality applications across industries",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Manufacturing plants', icon: '🏭', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Data centers', icon: '💻', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Heavy rail transit', icon: '🚆', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Hospitals & Labs', icon: '🏥', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'EV Super-hubs', icon: '⚡', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Steel & Mining', icon: '⛏️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Renewable Farms', icon: '☀️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Water treatment', icon: '💧', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Commercial towers', icon: '🏢', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Marine ports', icon: '⚓', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "GRID SECURITY & COMPLIANCE",
            title: "Advanced Grid Stabilization Packages",
            cards: [
                {
                    icon: "⚡",
                    title: "Automated Power Factor Correction",
                    description: "Dynamic capacitor and electronic hybrid switching to eliminate utility penalties and optimize distribution efficiency.",
                    actionText: "Request Grid Audit →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "🛡️",
                    title: "Industrial Surge Protection Suite",
                    description: "Multi-stage transient voltage surge suppressors engineered to safeguard critical production systems against lightning and grid faults.",
                    actionText: "View Protection Units →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Secure your facility's power infrastructure",
            subtext: "Talk to our power electronics engineers to design a custom harmonic filtering and grid conditioning strategy tailored to your electrical load profile.",
            buttonText: "Request Power Audit",
            buttonLink: "/contact"
        },

        features: [
            'Active Harmonic Filters (AHF) for total harmonic distortion reduction',
            'Static Var Generators (SVG) for real-time reactive power compensation',
            'Voltage sag and surge mitigation systems',
            'Real-time IoT grid monitoring telemetry'
        ]
    },

    // 2. EV Charging
    {
        id: 'ev-charging',
        label: 'EV Charging',
        link: '/solutions/ev-charging',
        desc: 'AC/DC chargers, 7kW–1280kW',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Charging Solutions',
        subtitle: 'End-to-end EV charging technology — AC and DC hardware, dynamic load management, and the software to run it all from one dashboard.',
        overview: 'Every EVNGEN charger — AC or DC, wallbox or fast charger — reports into the same OCPP-based management layer, so operators get one view of uptime, sessions, and revenue regardless of hardware mix or install date.',

        section1: {
            tabs: [
                {
                    tabLabel: 'AC Wallbox Charging',
                    badge: 'AC CHARGING',
                    title: 'Reliable AC charging for homes, workplaces, and fleets',
                    description: 'Our AC wallboxes deliver 7.6–22kW with full-angle color displays, Plug&Charge or RFID authentication, and optional OCPP connectivity for remote management. Single or dual-port models cover everything from a single driveway to a shared parking facility.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Basic EV Charger →', url: '/ev-chargers?filter=ac' },
                        { label: 'Dual-Port Wallbox →', url: '/ev-chargers?filter=ac' }
                    ]
                },
                {
                    tabLabel: 'DC Fast Charging',
                    badge: 'DC FAST CHARGING',
                    title: 'High-power DC charging for highways, depots, and hubs',
                    description: 'Ultra-fast charging power ranging from 60kW up to 360kW+. Designed with liquid-cooled cables, high uptime guarantees, and modular power architecture for scalable highway deployment.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Compact DC 60kW →', url: '/ev-chargers?filter=dc' },
                        { label: 'Ultrafast DC 360kW →', url: '/ev-chargers?filter=dc' }
                    ]
                },
                {
                    tabLabel: 'Dynamic Load Balancing',
                    badge: 'SMART ENERGY MANAGEMENT',
                    title: 'Charge more vehicles without upgrading your grid connection',
                    description: 'The EM3 Box adds dynamic load balancing to any charging site, automatically distributing available power across connected chargers, and can tie into an on-site solar system. Connects wirelessly over a 120m LoRa range — no rewiring required.',
                    imageUrl: '/images/solutions/images.jpg',
                    links: [
                        { label: 'EM3 Box →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'OCPP Software Platform',
                    badge: 'CLOUD SOFTWARE',
                    title: 'Unified platform for network monitoring and billing',
                    description: 'Manage users, set custom tariffs, automate dynamic pricing, and monitor real-time charging sessions from a single cloud-based dashboard built on open OCPP standards.',
                    imageUrl: '/images/solutions/69b038a9847abffe2d7ad1cf_EV charging open standards.png',
                    links: [
                        { label: 'Explore Dashboard →', url: '/contact' },
                        { label: 'Request Demo →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Charging solutions for electric vehicles",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Public charge', icon: '🅿️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Home charge', icon: '🏠', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Car dealer charge', icon: '🚗', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Fleet charge', icon: '🚚', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Workplace charge', icon: '🏢', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Car park charge', icon: '🅿️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Service station charge', icon: '⛽', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'eBus charge', icon: '🚌', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Hotel charge', icon: '🏨', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Supermarket charge', icon: '🛒', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "SOLAR & SMART",
            title: "Solar EV Charging & Smart Billing",
            cards: [
                {
                    icon: "☀️",
                    title: "Solar + Grid Hybrid EV Charging",
                    description: "Rooftop solar panel integration with grid backup, load management controller, and energy monitoring. Ideal for malls, hospitals, and green campuses.",
                    actionText: "Request Solar Feasibility →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "💳",
                    title: "OCPP Smart Billing Platform",
                    description: "Cloud-based OCPP 1.6J / 2.0.1 management. QR code / RFID / mobile payment. Energy reports, tariff setting, user access control, and alerts.",
                    actionText: "Request Software Demo →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "One platform, every charger type",
            subtext: "Every EVNGEN charger — AC or DC, wallbox or fast charger — reports into the same OCPP-based management layer, so operators get one view of uptime, sessions, and revenue regardless of hardware mix or install date.",
            buttonText: "Request a Solution Consult",
            buttonLink: "/contact"
        },

        features: [
            'AC Smart Wallboxes (7kW to 22kW) for fleet and residential deployment',
            'DC Fast Chargers (30kW to 180kW+) for highway hubs and commercial sites',
            'OCPP 1.6J & 2.0.1 compliance for third-party software integration',
            'Dynamic load balancing to protect site electrical infrastructure'
        ]
    },

    // 3. Energy Storage
    {
        id: 'energy-storage',
        label: 'Energy Storage',
        link: '/solutions/energy-storage',
        desc: 'Modular battery storage systems',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Modular Energy Storage Systems (BESS)',
        subtitle: 'High-density commercial battery storage built for peak shaving, demand charge reduction, and seamless microgrid integration.',
        overview: 'Our scalable energy storage systems allow commercial and industrial operators to store excess solar or low-tariff grid energy, protect against outages, and optimize overall power costs.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Commercial LFP Enclosures',
                    badge: 'BATTERY HARDWARE',
                    title: 'Scalable Lithium-Iron-Phosphate containerized storage',
                    description: 'High-safety LFP chemistry engineered with integrated liquid thermal management systems for maximum lifespan and optimal operating temperatures.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Explore Enclosures →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Peak Shaving Software',
                    badge: 'ENERGY OPTIMIZATION',
                    title: 'Automated demand charge reduction algorithms',
                    description: 'Smart software controllers predict facility load spikes and discharge stored battery power automatically to keep utility billing thresholds down.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Software Suite →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Microgrid Backup',
                    badge: 'GRID RESILIENCE',
                    title: 'Uninterrupted power transition during grid failures',
                    description: 'Sub-millisecond islanding transition capabilities to keep critical facility operations fully powered when main utility feeds fail.',
                    imageUrl: '/images/solutions/images.jpg',
                    links: [
                        { label: 'View Specs →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Solar-Plus-Storage',
                    badge: 'RENEWABLES',
                    title: 'Coupled photovoltaic self-consumption systems',
                    description: 'Store excess daytime solar generation for evening utilization or high-demand commercial charging operations.',
                    imageUrl: '/images/solutions/69b038a9847abffe2d7ad1cf_EV charging open standards.png',
                    links: [
                        { label: 'Solar Integration →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Energy storage deployment sectors",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Commercial complexes', icon: '🏢', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Industrial microgrids', icon: '🏭', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'EV charging stations', icon: '⚡', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Remote communities', icon: '🏕️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Agricultural sites', icon: '🌾', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Telecommunications', icon: '📡', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'University campuses', icon: '🎓', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Resorts & Hotels', icon: '🏨', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Mining operations', icon: '⛏️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Utility sub-stations', icon: '🔌', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "MODULAR & SAFE",
            title: "Advanced BMS & Thermal Control",
            cards: [
                {
                    icon: "🔋",
                    title: "Cell-Level Safety & Monitoring",
                    description: "Advanced Battery Management Systems (BMS) tracking voltage, impedance, and internal cell temperatures continuously.",
                    actionText: "Read Safety Specs →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "📦",
                    title: "Turnkey Container Integration",
                    description: "Pre-wired, fire-suppression equipped outdoor enclosures ready for rapid plug-and-play installation on site.",
                    actionText: "Request Quotation →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Take control of your energy expenses",
            subtext: "Calculate your potential peak shaving savings and design a custom BESS configuration with our storage engineering experts.",
            buttonText: "Request Storage Sizing",
            buttonLink: "/contact"
        },

        features: [
            'Scalable lithium-iron-phosphate (LFP) battery enclosures',
            'Advanced Battery Management Systems (BMS) for thermal and cell safety',
            'Peak shaving and load shifting automation software',
            'Seamless microgrid and solar photovoltaic (PV) integration'
        ]
    },

    // 4. Battery Testing
    {
        id: 'battery-testing',
        label: 'Battery Testing',
        link: '/solutions/battery-testing',
        desc: 'Formation & grading solutions',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Battery Testing & Formation-Grading',
        subtitle: 'High-precision charge-discharge testing and formation equipment for electric vehicle and energy storage cell manufacturing.',
        overview: 'We provide state-of-the-art testing systems designed for cell producers, R&D labs, and EV service hubs to guarantee cell performance, longevity, and regulatory safety compliance.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Cycle Testing Units',
                    badge: 'PRECISION TESTING',
                    title: 'High-accuracy charge and discharge cycle characterization',
                    description: 'Delivering micro-ampere precision measurement channels to evaluate capacity, internal resistance, and Coulombic efficiency over extended lifetimes.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Hardware Specs →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Formation & Grading',
                    badge: 'CELL MANUFACTURING',
                    title: 'Automated cell sorting and initial formation lines',
                    description: 'High-throughput formation cabinets configured for precise current and voltage control during initial electrolyte activation phases.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Formation Lines →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Thermal Safety Chambers',
                    badge: 'ENVIRONMENTAL TEST',
                    title: 'Controlled temperature testing under extreme stress',
                    description: 'Integrated environmental chambers simulating thermal runaway scenarios and operating limits from -40°C to +85°C.',
                    imageUrl: '/images/solutions/images.jpg',
                    links: [
                        { label: 'Chamber Details →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Diagnostic Analytics',
                    badge: 'DATA SOFTWARE',
                    title: 'Comprehensive test data logging and analytical software',
                    description: 'Manage test recipes, generate automatic capacity histograms, and export data directly to enterprise quality databases.',
                    imageUrl: '/images/solutions/69b038a9847abffe2d7ad1cf_EV charging open standards.png',
                    links: [
                        { label: 'Explore Software →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Battery testing laboratory & factory use cases",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Cell manufacturing', icon: '🏭', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'EV R&D labs', icon: '🔬', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Pack assembly lines', icon: '📦', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Quality assurance', icon: '✅', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Second-life grading', icon: '🔄', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Recycling facilities', icon: '♻️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Aerospace testing', icon: '🚀', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Consumer electronics', icon: '📱', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Service centers', icon: '🛠️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Certification bodies', icon: '📋', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "HIGH PRECISION",
            title: "Advanced Diagnostics & Safety Suites",
            cards: [
                {
                    icon: "♻️",
                    title: "Regenerative Energy Recovery",
                    description: "Recapture up to 92% of discharged battery energy back into the facility grid during high-volume testing cycles.",
                    actionText: "Learn about Recovery →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "🔥",
                    title: "Automated Fire Suppression",
                    description: "Multi-layered safety protocols featuring rapid gas suppression and pressure relief venting for every test channel rack.",
                    actionText: "View Safety Standards →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Accelerate your cell testing throughput",
            subtext: "Connect with our instrumentation specialists to configure custom test channels and automated grading lines for your facility.",
            buttonText: "Request Testing Consultation",
            buttonLink: "/contact"
        },

        features: [
            'High-precision charge-discharge cycle testing units',
            'Automated cell sorting and capacity grading systems',
            'Real-time thermal monitoring and fault detection safety protocols',
            'Comprehensive data logging and diagnostic analytics software'
        ]
    },

    // 5. Solar + Storage Hybrid
    {
        id: 'solar-storage-hybrid',
        label: 'Solar + Storage Hybrid',
        link: '/solutions/solar-storage-hybrid',
        desc: 'Solar-storage-charging integration',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Solar + Storage Hybrid Systems',
        subtitle: 'Seamless integration of rooftop solar panels, battery storage, and high-capacity EV chargers.',
        overview: 'Maximize green energy utilization by coupling on-site solar generation directly with stationary storage and EV fleet chargers.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Solar PV Integration',
                    badge: 'SOLAR PV',
                    title: 'Rooftop solar integration for EV charging',
                    description: 'Connect your rooftop solar panels directly to EV chargers with smart energy management that prioritizes solar power during peak generation hours.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Solar Solutions →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Hybrid Inverters',
                    badge: 'HYBRID INVERTER',
                    title: 'Advanced hybrid inverter systems',
                    description: 'Our hybrid inverters seamlessly manage power flow between solar panels, battery storage, grid connection, and EV chargers for optimal efficiency.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Inverter Specs →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Solar + Storage applications",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Residential solar', icon: '🏠', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Commercial buildings', icon: '🏢', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Industrial facilities', icon: '🏭', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'EV charging hubs', icon: '⚡', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "GREEN ENERGY",
            title: "Sustainable Energy Solutions",
            cards: [
                {
                    icon: "🌱",
                    title: "Net-Zero Charging",
                    description: "Achieve net-zero emissions by combining solar generation with battery storage for 100% renewable EV charging.",
                    actionText: "Learn More →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "💰",
                    title: "Energy Arbitrage",
                    description: "Store excess solar energy during peak generation and use it during high-tariff periods to maximize savings.",
                    actionText: "Calculate Savings →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Go green with solar EV charging",
            subtext: "Reduce your carbon footprint and energy costs by combining solar power with EV charging infrastructure.",
            buttonText: "Request Solar Assessment",
            buttonLink: "/contact"
        },

        features: [
            'Rooftop photovoltaic integration',
            'Smart islanding capability',
            'Optimized self-consumption algorithms',
            'Automated tariff switching'
        ]
    },

    // 6. Energy Storage Microgrid
    {
        id: 'energy-storage-microgrid',
        label: 'Energy Storage Microgrid',
        link: '/solutions/energy-storage-microgrid',
        desc: 'Resilient on/off-grid power',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Resilient Energy Storage Microgrids',
        subtitle: 'Autonomous microgrid controllers ensuring continuous operations during sudden grid dropouts.',
        overview: 'Protect your critical infrastructure, remote operations, and high-uptime facilities against unexpected power outages.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Microgrid Controller',
                    badge: 'CONTROLLER',
                    title: 'Intelligent microgrid management',
                    description: 'Our advanced microgrid controllers automatically manage power distribution between solar, storage, grid, and loads for optimal reliability.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Controller Specs →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Islanding Capability',
                    badge: 'ISLANDING',
                    title: 'Seamless grid disconnect & reconnect',
                    description: 'Detect grid outages instantly and seamlessly transition to island mode, keeping critical operations powered without interruption.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Islanding Technology →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Microgrid deployment sectors",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Remote communities', icon: '🏕️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Industrial parks', icon: '🏭', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Healthcare facilities', icon: '🏥', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Military bases', icon: '🎖️', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "RESILIENCE",
            title: "Critical Infrastructure Protection",
            cards: [
                {
                    icon: "⚡",
                    title: "24/7 Power Assurance",
                    description: "Guaranteed uptime for critical facilities with automatic failover and seamless grid-to-island transition.",
                    actionText: "Learn More →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "🔄",
                    title: "Black Start Capability",
                    description: "Restart your entire facility from battery storage without grid connection, even after a complete blackout.",
                    actionText: "View Capabilities →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Never worry about power outages again",
            subtext: "Build a resilient microgrid that keeps your operations running through any grid disruption.",
            buttonText: "Request Microgrid Design",
            buttonLink: "/contact"
        },

        features: [
            'Sub-millisecond grid fallback transition',
            'Multi-source generation balancing',
            'Autonomous islanding control',
            'Scalable containerized architecture'
        ]
    },

    // 7. Dynamic Load Balancing
    {
        id: 'dynamic-load-balancing',
        label: 'Dynamic Load Balancing',
        link: '/solutions/dynamic-load-balancing',
        desc: 'Smart power distribution',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Dynamic Load Balancing Systems',
        subtitle: 'Intelligent real-time power distribution to prevent overloading local grid connections.',
        overview: 'Deploy more chargers without spending on expensive utility transformer upgrades through automated current throttling and distribution.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Load Balancing Controller',
                    badge: 'CONTROLLER',
                    title: 'Intelligent load management',
                    description: 'Our load balancing controllers monitor facility energy consumption in real-time and dynamically allocate available power to EV chargers.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Controller Specs →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Wireless Sensors',
                    badge: 'SENSORS',
                    title: 'Wireless current monitoring',
                    description: 'LoRa-based wireless current sensors clamp onto main feeders, providing real-time load data without complex rewiring.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Sensor Details →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Load balancing applications",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Multi-charger sites', icon: '⚡', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Fleet depots', icon: '🚚', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Residential complexes', icon: '🏢', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Retail locations', icon: '🛒', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "EFFICIENCY",
            title: "Optimize Your Power Usage",
            cards: [
                {
                    icon: "⚖️",
                    title: "Avoid Grid Upgrades",
                    description: "Install more chargers than your electrical service would normally allow through intelligent load sharing.",
                    actionText: "Learn How →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "🎯",
                    title: "Priority Charging",
                    description: "Set charging priorities for critical vehicles and ensure they always get power when needed.",
                    actionText: "View Features →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Maximize your charging capacity",
            subtext: "Install more chargers and charge more vehicles without expensive infrastructure upgrades.",
            buttonText: "Request Load Assessment",
            buttonLink: "/contact"
        },

        features: [
            'Real-time facility load tracking',
            'Wireless LoRa sensor communication',
            'Prioritized vehicle charging queues',
            'Zero infrastructure rewiring required'
        ]
    },

    // 8. OCPP Software Platform
    {
        id: 'ocpp-software-platform',
        label: 'OCPP Software Platform',
        link: '/solutions/ocpp-software-platform',
        desc: 'Manage, monitor & bill your network',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Cloud-Based OCPP Software Platform',
        subtitle: 'Unified enterprise dashboard for remote diagnostics, user access control, and automated billing.',
        overview: 'Control your entire charging network from a single web-based portal built on open industry standards (OCPP 1.6J and 2.0.1).',

        section1: {
            tabs: [
                {
                    tabLabel: 'Dashboard & Analytics',
                    badge: 'DASHBOARD',
                    title: 'Real-time network monitoring',
                    description: 'Monitor all chargers in real-time with live status, session data, energy consumption, and revenue analytics on a single dashboard.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Dashboard Demo →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Billing & Payments',
                    badge: 'BILLING',
                    title: 'Automated billing and payments',
                    description: 'Set custom tariffs, handle RFID and mobile payments, and automate invoicing for users and tenants.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Billing Features →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Software platform applications",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Network operators', icon: '📡', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Fleet managers', icon: '🚚', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Property owners', icon: '🏢', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Utilities', icon: '🔌', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "CLOUD SOFTWARE",
            title: "Complete Network Control",
            cards: [
                {
                    icon: "📡",
                    title: "Remote Management",
                    description: "Monitor, control, and update all chargers from anywhere with full remote access and OTA firmware updates.",
                    actionText: "Learn More →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "🔓",
                    title: "Open Standards",
                    description: "Built on OCPP 1.6J and 2.0.1 standards, ensuring compatibility with all major charger brands.",
                    actionText: "View Compatibility →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Take full control of your charging network",
            subtext: "Manage users, monitor performance, and optimize revenue with our comprehensive software platform.",
            buttonText: "Request Software Demo",
            buttonLink: "/contact"
        },

        features: [
            'Remote firmware over-the-air updates',
            'Customizable tariff and pricing automation',
            'Integrated RFID and mobile app payments',
            'Detailed analytics and session reporting'
        ]
    },

    // 9. Charging & Swapping
    {
        id: 'charging-swapping',
        label: 'Charging & Swapping',
        link: '/solutions/charging-swapping',
        desc: 'Fast charging + battery swap options',
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'EV Charging & Battery Swapping Stations',
        subtitle: 'Multi-modal energy stations supporting both rapid plugin chargers and automated battery swap architecture.',
        overview: 'Ideal for two-wheelers, fleets, and public transit looking to eliminate charging wait times through automated battery exchange modules.',

        section1: {
            tabs: [
                {
                    tabLabel: 'Battery Swap Stations',
                    badge: 'SWAP STATION',
                    title: 'Automated battery swapping technology',
                    description: 'Our automated battery swap stations enable rapid battery exchange in under 3 minutes, eliminating charging wait times for fleet vehicles.',
                    imageUrl: '/images/solutions/Energy Storage.webp',
                    links: [
                        { label: 'Swap Station Specs →', url: '/contact' }
                    ]
                },
                {
                    tabLabel: 'Dual-Mode Charging',
                    badge: 'DUAL MODE',
                    title: 'Plug-in charging + battery swap',
                    description: 'Support both traditional plug-in charging and automated battery swapping in a single station, giving operators maximum flexibility.',
                    imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
                    links: [
                        { label: 'Dual-Mode Details →', url: '/contact' }
                    ]
                }
            ]
        },

        section2: {
            title: "Charging & swapping applications",
            imageUrl: '/images/solutions/call-toaction.jpg',
            useCases: [
                { label: 'Two-wheelers', icon: '🛵', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Fleet vehicles', icon: '🚚', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Public transit', icon: '🚌', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
                { label: 'Last-mile delivery', icon: '📦', imageUrl: '/images/help/EV Charging_1.jpg', link: '/contact' },
            ]
        },

        section3: {
            badge: "MULTI-MODAL",
            title: "Flexible Energy Solutions",
            cards: [
                {
                    icon: "🔄",
                    title: "Rapid Battery Exchange",
                    description: "Swap depleted batteries for fully charged units in under 3 minutes, minimizing vehicle downtime.",
                    actionText: "Learn More →",
                    actionLink: "/contact",
                    theme: "dark"
                },
                {
                    icon: "🔋",
                    title: "Battery Conditioning",
                    description: "Station automatically conditions swapped batteries for optimal performance and longevity.",
                    actionText: "View Technology →",
                    actionLink: "/contact",
                    theme: "green"
                }
            ]
        },

        section4: {
            heading: "Eliminate charging downtime",
            subtext: "Keep your fleet moving with rapid battery swapping and flexible charging options.",
            buttonText: "Request Consultation",
            buttonLink: "/contact"
        },

        features: [
            'Automated rapid mechanical swap bays',
            'Integrated internal battery conditioning racks',
            'Fleet identification and user tracking',
            'High-durability commercial housing'
        ]
    }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Get solution by ID
export function getSolutionById(id: string) {
    return solutionsList.find(solution => solution.id === id);
}

// Get all solution IDs for static paths
export function getAllSolutionIds() {
    return solutionsList.map(solution => ({
        params: { id: solution.id }
    }));
}

// Get solutions by category
export function getSolutionsByCategory(categoryId: string) {
    if (categoryId === 'all') return solutionsList;
    return solutionsList.filter(solution => solution.id === categoryId);
}

// Get related solutions (excluding current)
export function getRelatedSolutions(solutionId: string, limit: number = 3) {
    const current = getSolutionById(solutionId);
    if (!current) return [];
    return solutionsList
        .filter(s => s.id !== solutionId)
        .slice(0, limit);
}

// ==========================================
// CATEGORIES
// ==========================================

export const solutionCategories = [
    { id: 'all', label: 'All Solutions' },
    { id: 'ev-charging', label: 'EV Charging' },
    { id: 'power-quality', label: 'Power Quality' },
    { id: 'energy-storage', label: 'Energy Storage' },
    { id: 'battery-testing', label: 'Battery Testing' },
    { id: 'solar-storage-hybrid', label: 'Solar + Storage' },
    { id: 'energy-storage-microgrid', label: 'Microgrid' },
    { id: 'dynamic-load-balancing', label: 'Load Balancing' },
    { id: 'ocpp-software-platform', label: 'OCPP Platform' },
    { id: 'charging-swapping', label: 'Charging & Swapping' }
];

// ==========================================
// ICON & COLOR MAPPING
// ==========================================

export function getSolutionIcon(id: string): string {
    const icons: Record<string, string> = {
        'power-quality': '⚡',
        'ev-charging': '🔌',
        'energy-storage': '🔋',
        'battery-testing': '🔬',
        'solar-storage-hybrid': '☀️',
        'energy-storage-microgrid': '🏭',
        'dynamic-load-balancing': '⚖️',
        'ocpp-software-platform': '📡',
        'charging-swapping': '🔄'
    };
    return icons[id] || '⚡';
}

export function getSolutionColor(id: string): string {
    const colors: Record<string, string> = {
        'power-quality': 'bg-[#0c1f38]',
        'ev-charging': 'bg-[#1f7a3d]',
        'energy-storage': 'bg-[#12946b]',
        'battery-testing': 'bg-[#2a3f66]',
        'solar-storage-hybrid': 'bg-[#e68a2e]',
        'energy-storage-microgrid': 'bg-[#0c2138]',
        'dynamic-load-balancing': 'bg-[#16493f]',
        'ocpp-software-platform': 'bg-[#1a4a7a]',
        'charging-swapping': 'bg-[#2d6a4f]'
    };
    return colors[id] || 'bg-[#0c1f38]';
}

// ==========================================
// SOLUTION HIGHLIGHTS (for homepage)
// ==========================================

export const solutionHighlights = solutionsList.map(solution => ({
    id: solution.id,
    label: solution.label,
    desc: solution.desc,
    imageUrl: solution.imageUrl,
    link: solution.link,
    icon: getSolutionIcon(solution.id)
}));