import ContactSection from '@/components/ContactPage/ContactSection';
import PageHeader from '@/components/pagesComps/PageHeader';
import React from 'react';

const page = () => {
    return (
        <div>
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Contact' }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title="Let's talk about your project"
                description="Send an inquiry and our team will respond within one business day — or reach us directly by phone, email, or WeChat."
            />
            <ContactSection/>
        </div>
    );
};

export default page;