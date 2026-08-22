// lib/servicesDb.ts
export interface Service {
    id: string;
    title: string;
    badge: string;
    description: string;
    details: string;
    icon: string;
    imageUrl: string;
    link: string;
    color: string;
    features: string[];
    process?: string[];
    price?: string;
    duration?: string;
}

export const servicesList: Service[] = [
    {
        id: 'site-survey-design',
        title: 'Site Survey & Design',
        badge: 'SITE ASSESSMENT',
        description: 'Electrical capacity & layout assessment',
        details: 'Our expert team conducts comprehensive on-site surveys to assess electrical capacity, optimal charger placement, and infrastructure requirements. We provide detailed design plans, equipment recommendations, and cost estimates tailored to your specific site conditions.',
        icon: '📋',
        imageUrl: '/images/services/site-survey.jpg',
        link: '/services/site-survey-design',
        color: 'bg-[#0c1f38]',
        features: [
            'Comprehensive electrical capacity analysis',
            'Optimal charger placement planning',
            'Infrastructure requirement assessment',
            'Detailed design plans and schematics',
            'Equipment recommendations and cost estimates',
            'Permitting and compliance guidance'
        ],
        process: [
            'Initial consultation and requirements gathering',
            'On-site electrical capacity assessment',
            'Charger placement and layout design',
            'Equipment selection and cost estimation',
            'Permitting and compliance review',
            'Final proposal and project plan'
        ],
        price: 'Free Consultation',
        duration: '2-3 Days'
    },
    {
        id: 'installation-commissioning',
        title: 'Installation & Commissioning',
        badge: 'INSTALLATION',
        description: 'Mounting, hookup & network go-live',
        details: 'Our certified installation team handles everything from mounting and electrical hookup to network configuration and commissioning. We ensure your EV charging system is installed safely, efficiently, and ready for operation.',
        icon: '🚧',
        imageUrl: '/images/services/installation.jpg',
        link: '/services/installation-commissioning',
        color: 'bg-[#1f7a3d]',
        features: [
            'Professional mounting and installation',
            'Electrical hookup and wiring',
            'Network configuration and integration',
            'System testing and commissioning',
            'Safety compliance verification',
            'Operator training and handover'
        ],
        process: [
            'Site preparation and equipment staging',
            'Mounting and electrical installation',
            'Network configuration and integration',
            'System testing and quality assurance',
            'Final commissioning and handover',
            'Operator training and documentation'
        ],
        duration: '1-3 Days'
    },
    {
        id: 'maintenance-om',
        title: 'Maintenance & O&M',
        badge: 'MAINTENANCE',
        description: 'Inspections, firmware & repair contracts',
        details: 'Keep your charging infrastructure running at peak performance with our comprehensive maintenance and operations services. We offer preventive maintenance, firmware updates, and repair contracts to ensure maximum uptime and reliability.',
        icon: '🔧',
        imageUrl: '/images/services/maintenance.jpg',
        link: '/services/maintenance-om',
        color: 'bg-[#12946b]',
        features: [
            'Preventive maintenance inspections',
            'Firmware updates and upgrades',
            'Repair and replacement services',
            '24/7 emergency support',
            'Performance monitoring and reporting',
            'Extended warranty options'
        ],
        process: [
            'Scheduled preventive maintenance visits',
            'Firmware and software updates',
            'Performance monitoring and analysis',
            'Repair and replacement as needed',
            'Emergency support and rapid response',
            'Detailed service reporting'
        ],
        price: 'Custom Pricing',
        duration: 'Ongoing'
    },
    {
        id: 'software-remote-support',
        title: 'Software & Remote Support',
        badge: 'REMOTE SUPPORT',
        description: 'Remote diagnostics, 24/7 monitoring',
        details: 'Our cloud-based software platform provides real-time monitoring, remote diagnostics, and proactive support for your entire charging network. We offer 24/7 monitoring, automated alerts, and expert technical support to keep your chargers online.',
        icon: '🎧',
        imageUrl: '/images/services/software.jpg',
        link: '/services/software-remote-support',
        color: 'bg-[#2a3f66]',
        features: [
            'Real-time network monitoring',
            'Remote diagnostics and troubleshooting',
            '24/7 technical support',
            'Automated alerts and notifications',
            'Performance analytics and reporting',
            'Fleet management capabilities'
        ],
        process: [
            'Platform onboarding and setup',
            'Network integration and configuration',
            '24/7 monitoring and support',
            'Remote diagnostics and troubleshooting',
            'Performance reporting and optimization',
            'Continuous platform improvements'
        ],
        price: 'Subscription-based',
        duration: 'Ongoing'
    },
    {
        id: 'training-certification',
        title: 'Training & Certification',
        badge: 'TRAINING',
        description: 'Operator & technician certification programs',
        details: 'Our comprehensive training programs certify operators and technicians to safely and effectively manage EV charging infrastructure. We offer hands-on training, online courses, and certification programs for all skill levels.',
        icon: '🎓',
        imageUrl: '/images/services/training.jpg',
        link: '/services/training-certification',
        color: 'bg-[#16493f]',
        features: [
            'Hands-on training workshops',
            'Online courses and e-learning',
            'Certification programs',
            'Safety and compliance training',
            'Troubleshooting and repair training',
            'Fleet management training'
        ],
        process: [
            'Needs assessment and program selection',
            'Training program delivery',
            'Hands-on practical sessions',
            'Knowledge assessment and certification',
            'Ongoing support and resources',
            'Continuing education opportunities'
        ],
        price: 'Varies by Program',
        duration: '1-3 Days'
    },
    {
        id: 'custom-solutions',
        title: 'Custom Solutions',
        badge: 'CUSTOM',
        description: 'Tailored solutions for unique requirements',
        details: 'Every project is unique. Our team works closely with you to design and deploy custom EV charging solutions that meet your specific requirements, budget, and timeline. From specialized hardware to custom software integrations, we deliver tailored solutions.',
        icon: '⚡',
        imageUrl: '/images/services/custom.jpg',
        link: '/services/custom-solutions',
        color: 'bg-[#0c2138]',
        features: [
            'Custom hardware configurations',
            'Software integration and APIs',
            'Specialized charging solutions',
            'Project management and delivery',
            'Ongoing support and optimization',
            'Scalable and future-proof designs'
        ],
        process: [
            'Requirements analysis and consultation',
            'Custom solution design and engineering',
            'Hardware and software configuration',
            'Deployment and integration',
            'Testing and quality assurance',
            'Ongoing support and optimization'
        ],
        price: 'Custom Pricing',
        duration: 'Project-based'
    }
];

// Helper functions
export const getServiceById = (id: string) => {
    return servicesList.find(service => service.id === id);
};

export const getRelatedServices = (serviceId: string, limit: number = 3) => {
    const current = getServiceById(serviceId);
    if (!current) return [];
    return servicesList
        .filter(s => s.id !== serviceId)
        .slice(0, limit);
};