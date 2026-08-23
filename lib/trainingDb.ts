// lib/trainingDb.ts
export interface TrainingProgram {
    id: string;
    title: string;
    badge: string;
    description: string;
    details: string;
    duration: string;
    format: string;
    imageUrl: string;
    link: string;
    color: string;
    icon: string;
    features: string[];
    price?: string;
    schedule?: string;
    prerequisites?: string[];
    actionText?: string;
}

export interface TrainingEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    type: 'online' | 'in-person' | 'hybrid';
    programId: string;
    spots: number;
    registered: number;
}

export const trainingPrograms: TrainingProgram[] = [
    {
        id: 'installer-certification',
        title: 'Installer Certification',
        badge: 'INSTALLER CERTIFICATION',
        description: 'Become an authorized EVNGEN installer',
        details: 'A two-day, hands-on program covering safe mounting, electrical hookup, and network commissioning for our full AC and DC lineup. Certified installers get priority access to parts and technical support.',
        duration: '2 Days',
        format: 'Hands-on Training',
        imageUrl: '/images/training/installer.jpg',
        link: '/training/installer-certification',
        color: 'bg-[#0c1f38]',
        icon: '🛠️',
        features: [
            'Safe mounting and installation techniques',
            'Electrical hookup and wiring',
            'Network commissioning for AC/DC chargers',
            'Priority access to parts and technical support',
            'Certified installer status'
        ],
        price: '$1,200',
        schedule: 'Monthly - First Week',
        prerequisites: [
            'Basic electrical knowledge',
            'Experience with power tools'
        ],
        actionText: 'Apply Now →'
    },
    {
        id: 'technician-training',
        title: 'Technician Training',
        badge: 'TECHNICIAN CERTIFICATION',
        description: 'Master EV charging system maintenance',
        details: 'A comprehensive program covering preventive maintenance, troubleshooting, diagnostics, and repair of AC and DC charging systems. Includes hands-on practice with real equipment.',
        duration: '3 Days',
        format: 'Workshop + Lab',
        imageUrl: '/images/training/technician.jpg',
        link: '/training/technician-training',
        color: 'bg-[#1f7a3d]',
        icon: '🔧',
        features: [
            'Preventive maintenance procedures',
            'Diagnostic techniques and tools',
            'Repair of AC/DC charging systems',
            'Hands-on practice with real equipment',
            'Troubleshooting common issues'
        ],
        price: '$1,800',
        schedule: 'Quarterly - Next: March 2026',
        prerequisites: [
            'Installer Certification (recommended)',
            '1+ year electrical experience'
        ],
        actionText: 'Register Now →'
    },
    {
        id: 'operator-training',
        title: 'Operator & Fleet Training',
        badge: 'OPERATOR TRAINING',
        description: 'Optimize charging network operations',
        details: 'Learn to manage charging networks, monitor performance, handle billing systems, and optimize fleet charging operations using our OCPP platform and dashboard tools.',
        duration: '1 Day',
        format: 'Classroom + Software',
        imageUrl: '/images/training/operator.jpg',
        link: '/training/operator-training',
        color: 'bg-[#12946b]',
        icon: '📊',
        features: [
            'Network monitoring and performance optimization',
            'Billing system management',
            'Fleet charging operations',
            'OCPP platform dashboard training',
            'Data analytics and reporting'
        ],
        price: '$800',
        schedule: 'Bi-monthly - Next: April 2026',
        prerequisites: [
            'Basic computer skills',
            'Familiarity with EV charging'
        ],
        actionText: 'Enroll Today →'
    },
    {
        id: 'advanced-diagnostics',
        title: 'Advanced Diagnostics',
        badge: 'ADVANCED DIAGNOSTICS',
        description: 'Expert-level troubleshooting and repair',
        details: 'Deep-dive program for experienced technicians covering advanced diagnostics, system integration, and high-voltage safety protocols. Includes real-world case studies and troubleshooting scenarios.',
        duration: '2 Days',
        format: 'Advanced Workshop',
        imageUrl: '/images/training/advanced.jpg',
        link: '/training/advanced-diagnostics',
        color: 'bg-[#0c2138]',
        icon: '🔬',
        features: [
            'Advanced diagnostic techniques',
            'System integration troubleshooting',
            'High-voltage safety protocols',
            'Real-world case studies',
            'Complex problem-solving scenarios'
        ],
        price: '$1,500',
        schedule: 'Quarterly - Next: May 2026',
        prerequisites: [
            'Technician Training Certification',
            '3+ years electrical experience'
        ],
        actionText: 'Sign Up Now →'
    },
    {
        id: 'ocpp-platform-training',
        title: 'OCPP Platform Training',
        badge: 'OCPP CERTIFICATION',
        description: 'Master our OCPP 1.6J & 2.0.1 platform',
        details: 'Learn to configure, customize, and maintain OCPP-based charging networks. Covers protocol architecture, API integration, security implementation, and network optimization strategies.',
        duration: '2 Days',
        format: 'Technical Workshop',
        imageUrl: '/images/training/ocpp.jpg',
        link: '/training/ocpp-platform-training',
        color: 'bg-[#16493f]',
        icon: '🌐',
        features: [
            'OCPP 1.6J & 2.0.1 protocol architecture',
            'API integration and customization',
            'Security implementation and best practices',
            'Network optimization strategies',
            'Platform administration and monitoring'
        ],
        price: '$1,400',
        schedule: 'Monthly - Next: June 2026',
        prerequisites: [
            'Basic networking knowledge',
            'Experience with IT systems'
        ],
        actionText: 'Get Certified →'
    },
    {
        id: 'safety-certification',
        title: 'Safety & Compliance Certification',
        badge: 'SAFETY CERTIFICATION',
        description: 'Ensure safe operations and regulatory compliance',
        details: 'Comprehensive safety training covering electrical safety, emergency response, regulatory compliance, and best practices for protecting personnel and equipment during EV charging operations.',
        duration: '1 Day',
        format: 'Certification Course',
        imageUrl: '/images/training/safety.jpg',
        link: '/training/safety-certification',
        color: 'bg-[#2a3f66]',
        icon: '🛡️',
        features: [
            'Electrical safety protocols',
            'Emergency response procedures',
            'Regulatory compliance guidelines',
            'Personnel protection best practices',
            'Equipment safety management'
        ],
        price: '$600',
        schedule: 'Monthly - Next: April 2026',
        prerequisites: [
            'Basic safety awareness',
            'No prior certification required'
        ],
        actionText: 'Book Now →'
    }
];

export const trainingEvents: TrainingEvent[] = [
    {
        id: 'event-1',
        title: 'Installer Certification - March 2026',
        date: '2026-03-15',
        location: 'California, USA',
        type: 'in-person',
        programId: 'installer-certification',
        spots: 20,
        registered: 12
    },
    {
        id: 'event-2',
        title: 'Technician Training - April 2026',
        date: '2026-04-20',
        location: 'Online',
        type: 'online',
        programId: 'technician-training',
        spots: 50,
        registered: 34
    },
    {
        id: 'event-3',
        title: 'Operator Training - May 2026',
        date: '2026-05-10',
        location: 'Texas, USA',
        type: 'hybrid',
        programId: 'operator-training',
        spots: 30,
        registered: 18
    },
    {
        id: 'event-4',
        title: 'Advanced Diagnostics - June 2026',
        date: '2026-06-05',
        location: 'Online',
        type: 'online',
        programId: 'advanced-diagnostics',
        spots: 40,
        registered: 22
    }
];

// Helper functions
export const getTrainingProgram = (id: string) => {
    return trainingPrograms.find(p => p.id === id);
};

export const getTrainingProgramsByCategory = (category: string) => {
    return trainingPrograms;
};

export const getUpcomingEvents = (limit: number = 3) => {
    return trainingEvents.slice(0, limit);
};

export const getEventsByProgram = (programId: string) => {
    return trainingEvents.filter(e => e.programId === programId);
};